const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error.message)
      if (i === retries - 1) return null
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
  return null
}

async function getStoryIds(endpoint, limit = 50) {
  const ids = await fetchWithRetry(`${HN_API_BASE}/${endpoint}.json`)
  return (ids || []).slice(0, limit)
}

async function getStory(id) {
  const story = await fetchWithRetry(`${HN_API_BASE}/item/${id}.json`)
  return story && !story.deleted && !story.dead ? story : null
}

function stripHtml(html) {
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

function determineTypeAndSource(story) {
  if (story.type === 'job') {
    return { type: 'job', source: 'job' }
  }
  
  const title = (story.title || '').toLowerCase()
  if (title.startsWith('ask hn:')) {
    return { type: 'story', source: 'ask' }
  }
  if (title.startsWith('show hn:')) {
    return { type: 'story', source: 'show' }
  }
  
  return { type: 'story', source: 'story' }
}

async function saveStory(story, sourceCategory) {
  const { type, source } = determineTypeAndSource(story)
  
  const cleanTitle = stripHtml(story.title || '')
  const cleanText = story.text ? stripHtml(story.text) : null
  
  const query = `
    INSERT INTO stories (
      hn_id, title, title_zh, url, text, text_zh, by, score, descendants, 
      time, type, source, deleted, dead, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    ON CONFLICT (hn_id) DO NOTHING
    RETURNING id
  `
  
  const values = [
    story.id,
    cleanTitle,
    cleanTitle, // 暂时不翻译，避免超时
    story.url || null,
    cleanText,
    cleanText, // 暂时不翻译，避免超时
    story.by || 'unknown',
    story.score || 0,
    story.descendants || 0,
    new Date(story.time * 1000),
    type,
    sourceCategory, // 使用传入的源分类
    false,
    false
  ]
  
  try {
    const result = await pool.query(query, values)
    return result.rows.length > 0
  } catch (error) {
    console.error(`Error saving story ${story.id}:`, error.message)
    return false
  }
}

async function fillCategory(category, limit = 30) {
  console.log(`\n填充 ${category} 分类，获取 ${limit} 篇文章...`)
  
  let endpoint
  switch (category) {
    case 'top': endpoint = 'topstories'; break
    case 'new': endpoint = 'newstories'; break
    case 'best': endpoint = 'beststories'; break
    case 'ask': endpoint = 'askstories'; break
    case 'show': endpoint = 'showstories'; break
    case 'job': endpoint = 'jobstories'; break
    default: throw new Error(`Unknown category: ${category}`)
  }
  
  const storyIds = await getStoryIds(endpoint, limit)
  console.log(`获取到 ${storyIds.length} 个文章 ID`)
  
  let savedCount = 0
  for (let i = 0; i < storyIds.length; i++) {
    const id = storyIds[i]
    console.log(`[${i + 1}/${storyIds.length}] 处理文章 ${id}...`)
    
    const story = await getStory(id)
    if (!story) {
      console.log(`  跳过无效文章 ${id}`)
      continue
    }
    
    const saved = await saveStory(story, category)
    if (saved) {
      savedCount++
      console.log(`  ✓ 保存成功: ${story.title}`)
    } else {
      console.log(`  - 已存在: ${story.title}`)
    }
    
    // 避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log(`${category} 分类填充完成，保存了 ${savedCount} 篇新文章`)
  return savedCount
}

async function main() {
  try {
    console.log('开始填充各个分类的数据...')
    
    // 填充各个分类，每个分类30篇文章
    const categories = [
      { name: 'top', limit: 30 },
      { name: 'new', limit: 30 },
      { name: 'best', limit: 20 },
      { name: 'ask', limit: 20 },
      { name: 'show', limit: 20 },
      { name: 'job', limit: 10 }
    ]
    
    let totalSaved = 0
    for (const { name, limit } of categories) {
      const saved = await fillCategory(name, limit)
      totalSaved += saved
    }
    
    console.log(`\n🎉 数据填充完成！总共保存了 ${totalSaved} 篇文章`)
    
    // 查看最终数据统计
    const result = await pool.query(`
      SELECT source, COUNT(*) as count 
      FROM stories 
      WHERE NOT deleted AND NOT dead
      GROUP BY source 
      ORDER BY count DESC
    `)
    
    console.log('\n📊 各分类文章数量:')
    result.rows.forEach(row => {
      console.log(`  ${row.source}: ${row.count} 篇`)
    })
    
  } catch (error) {
    console.error('填充数据失败:', error)
  } finally {
    await pool.end()
  }
}

main() 