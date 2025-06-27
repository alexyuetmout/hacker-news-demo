import { NextRequest, NextResponse } from 'next/server'

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

    console.log('开始数据清理...')

    // 连接数据库
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    })

    const cleanupLimits = {
      'top': 100,      // 保留最新100篇热门文章
      'new': 100,      // 保留最新100篇最新文章  
      'best': 50,      // 保留最新50篇精选文章
      'ask': 50,       // 保留最新50篇Ask HN
      'show': 50,      // 保留最新50篇Show HN
      'job': 30,       // 保留最新30篇招聘信息
      'story': 50      // 保留最新50篇其他文章
    }

    let totalDeleted = 0

    for (const [source, limit] of Object.entries(cleanupLimits)) {
      // 查询该分类的文章总数
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM stories WHERE source = $1 AND NOT deleted AND NOT dead',
        [source]
      )
      
      const currentCount = parseInt(countResult.rows[0].count)
      
      if (currentCount > limit) {
        const toDelete = currentCount - limit
        
        // 删除最老的文章（保留最新的）
        const deleteResult = await pool.query(`
          DELETE FROM stories 
          WHERE id IN (
            SELECT id FROM stories 
            WHERE source = $1 AND NOT deleted AND NOT dead
            ORDER BY time ASC, created_at ASC
            LIMIT $2
          )
        `, [source, toDelete])
        
        const deletedCount = deleteResult.rowCount || 0
        totalDeleted += deletedCount
        
        console.log(`${source}: 删除了 ${deletedCount} 篇旧文章 (${currentCount} -> ${currentCount - deletedCount})`)
      } else {
        console.log(`${source}: 无需清理 (${currentCount}/${limit})`)
      }
    }

    // 清理孤立的评论（所属文章已被删除）
    const orphanCommentsResult = await pool.query(`
      DELETE FROM comments 
      WHERE story_id NOT IN (SELECT id FROM stories)
    `)
    
    const deletedComments = orphanCommentsResult.rowCount || 0
    console.log(`清理孤立评论: ${deletedComments} 条`)

    // 清理无用的翻译缓存（可选，保留最近的翻译）
    const oldTranslationsResult = await pool.query(`
      DELETE FROM translations 
      WHERE created_at < NOW() - INTERVAL '30 days'
    `)
    
    const deletedTranslations = oldTranslationsResult.rowCount || 0
    console.log(`清理过期翻译缓存: ${deletedTranslations} 条`)

    await pool.end()

    // 获取清理后的统计
    const pool2 = new Pool({
      connectionString: process.env.DATABASE_URL
    })
    
    const statsResult = await pool2.query(`
      SELECT source, COUNT(*) as count 
      FROM stories 
      WHERE NOT deleted AND NOT dead
      GROUP BY source 
      ORDER BY count DESC
    `)
    
    await pool2.end()

    console.log(`数据清理完成，删除了 ${totalDeleted} 篇文章`)

    return NextResponse.json({
      success: true,
      message: `数据清理完成，删除了 ${totalDeleted} 篇文章`,
      deletedStories: totalDeleted,
      deletedComments,
      deletedTranslations,
      currentStats: statsResult.rows,
      limits: cleanupLimits,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('数据清理失败:', error)
    return NextResponse.json(
      { error: '数据清理失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 