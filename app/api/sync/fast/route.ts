import { NextRequest, NextResponse } from 'next/server'

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Chinese-HackerNews-Bot/1.0' }
      })
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error)
      if (i === retries - 1) return null
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  return null
}

async function getStoryIds(endpoint: string, limit = 10): Promise<number[]> {
  const ids = await fetchWithRetry(`${HN_API_BASE}/${endpoint}.json`)
  return (ids || []).slice(0, limit)
}

async function getStory(id: number): Promise<any> {
  const story = await fetchWithRetry(`${HN_API_BASE}/item/${id}.json`)
  return story && !story.deleted && !story.dead ? story : null
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    // 验证授权（生产环境需要 cron secret，开发环境可选）
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: '未授权访问' },
          { status: 401 }
        )
      }
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'new'
    const limit = parseInt(searchParams.get('limit') || '5')

    console.log(`快速同步 ${type} 类型，限制 ${limit} 篇文章`)

    // 获取文章 ID 列表
    let endpoint = ''
    switch (type) {
      case 'top': endpoint = 'topstories'; break
      case 'new': endpoint = 'newstories'; break
      case 'best': endpoint = 'beststories'; break
      case 'ask': endpoint = 'askstories'; break
      case 'show': endpoint = 'showstories'; break
      case 'job': endpoint = 'jobstories'; break
      default: endpoint = 'newstories'
    }

    const storyIds = await getStoryIds(endpoint, limit)
    console.log(`获取到 ${storyIds.length} 个文章 ID`)

    // 连接数据库
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })

    let savedCount = 0
    for (const id of storyIds) {
      const story = await getStory(id)
      if (!story) continue

      // 确定类型和来源
      let storyType = 'story'
      let source = type

      if (story.type === 'job') {
        storyType = 'job'
        source = 'job'
      } else {
        const title = (story.title || '').toLowerCase()
        if (title.startsWith('ask hn:')) {
          source = 'ask'
        } else if (title.startsWith('show hn:')) {
          source = 'show'
        }
      }

      // 检查是否已存在
      const existingResult = await pool.query(
        'SELECT id FROM stories WHERE hn_id = $1',
        [story.id]
      )

      if (existingResult.rows.length === 0) {
        // 保存新文章（不翻译，提高速度）
        const cleanTitle = stripHtml(story.title || '')
        const cleanText = story.text ? stripHtml(story.text) : null

        await pool.query(`
          INSERT INTO stories (
            hn_id, title, title_zh, url, text, text_zh, by, score, descendants,
            time, type, source, deleted, dead, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        `, [
          story.id,
          cleanTitle,
          cleanTitle, // 暂时不翻译
          story.url || null,
          cleanText,
          cleanText, // 暂时不翻译
          story.by || 'unknown',
          story.score || 0,
          story.descendants || 0,
          new Date(story.time * 1000),
          storyType,
          source,
          false,
          false
        ])

        savedCount++
        console.log(`保存新文章: ${story.id} - ${cleanTitle}`)
      }
    }

    await pool.end()

    return NextResponse.json({
      success: true,
      message: `快速同步完成，保存了 ${savedCount} 篇新文章`,
      type,
      checked: storyIds.length,
      saved: savedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('快速同步失败:', error)
    return NextResponse.json(
      { error: '快速同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 