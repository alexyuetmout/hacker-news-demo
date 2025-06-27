import { NextRequest, NextResponse } from 'next/server'
import { HackerNewsService } from '@/lib/services/hacker-news'
import { DataService } from '@/lib/services/data'

const hackerNewsService = new HackerNewsService()
const dataService = new DataService()

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

    console.log('开始增量同步检查...')

    // 1. 获取当前最大 item ID
    const maxItemId = await hackerNewsService.getMaxItemId()
    if (!maxItemId) {
      return NextResponse.json(
        { error: '无法获取最大 item ID' },
        { status: 500 }
      )
    }

    console.log(`当前最大 item ID: ${maxItemId}`)

    // 2. 获取我们数据库中最大的 hn_id
    const lastKnownId = await dataService.getLastKnownItemId()
    console.log(`数据库中最后已知 ID: ${lastKnownId}`)

    // 3. 如果没有新内容，直接返回
    if (lastKnownId && maxItemId <= lastKnownId) {
      return NextResponse.json({
        success: true,
        message: '没有新内容需要同步',
        maxItemId,
        lastKnownId,
        newItems: 0
      })
    }

    // 4. 计算需要检查的范围（最多检查最近 100 个 item）
    const startId = lastKnownId ? Math.max(lastKnownId + 1, maxItemId - 100) : maxItemId - 100
    const endId = maxItemId
    const itemsToCheck = Math.min(endId - startId + 1, 100)

    console.log(`检查范围: ${startId} 到 ${endId} (共 ${itemsToCheck} 个项目)`)

    // 5. 批量获取新项目
    const newItemIds = Array.from({ length: itemsToCheck }, (_, i) => startId + i)
    const newItems = await hackerNewsService.getItemsBatch(newItemIds, 5)

    console.log(`获取到 ${newItems.length} 个有效新项目`)

    // 6. 过滤并保存新的 stories
    const stories = newItems.filter(item => 
      item.type === 'story' || item.type === 'job'
    )

    let savedCount = 0
    for (const story of stories) {
      try {
        // 确定类型和来源
        let type = 'story'
        let source = 'story'

        if (story.type === 'job') {
          type = 'job'
          source = 'job'
        } else if (story.title?.toLowerCase().startsWith('ask hn:')) {
          type = 'story'
          source = 'ask'
        } else if (story.title?.toLowerCase().startsWith('show hn:')) {
          type = 'story'
          source = 'show'
        }

        await dataService.saveStory({
          hn_id: story.id,
          title: story.title || '',
          url: story.url || null,
          text: story.text || null,
          by: story.by || 'unknown',
          score: story.score || 0,
          descendants: story.descendants || 0,
          time: story.time || Math.floor(Date.now() / 1000),
          type,
          source,
          deleted: false,
          dead: false
        })

        savedCount++
      } catch (error) {
        console.warn(`保存 story ${story.id} 失败:`, error)
      }
    }

    // 7. 更新最大 item ID 记录
    await dataService.updateLastKnownItemId(maxItemId)

    console.log(`增量同步完成，保存了 ${savedCount} 篇新文章`)

    return NextResponse.json({
      success: true,
      message: `增量同步完成，发现 ${savedCount} 篇新文章`,
      maxItemId,
      lastKnownId,
      checkedRange: `${startId}-${endId}`,
      newItems: savedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('增量同步失败:', error)
    return NextResponse.json(
      { error: '增量同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 