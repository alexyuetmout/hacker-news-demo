import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/services/data'

const dataService = new DataService()

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const skipCleanup = searchParams.get('skipCleanup') === 'true'

    console.log('开始全量数据同步...')
    
    // 定义各类型同步的数量
    const syncConfig = {
      'top': 100,    // 热门文章
      'new': 50,     // 最新文章
      'best': 50,    // 精选文章
      'ask': 50,     // Ask HN
      'show': 50,    // Show HN  
      'job': 30      // 招聘信息
    }

    const results: any = {}
    let totalSynced = 0

    // 并行同步所有类型（提高效率）
    const syncPromises = Object.entries(syncConfig).map(async ([type, limit]) => {
      try {
        console.log(`开始同步 ${type} 类型，数量: ${limit}`)
        await dataService.updateStoriesFromHN(type as any, limit)
        console.log(`完成同步 ${type} 类型`)
        return { type, limit, success: true }
      } catch (error) {
        console.error(`同步 ${type} 失败:`, error)
        return { 
          type, 
          limit, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    const syncResults = await Promise.all(syncPromises)
    
    // 统计结果
    syncResults.forEach(result => {
      results[result.type] = result
      if (result.success) {
        totalSynced += result.limit
      }
    })

    // 数据清理（可选）
    let cleanupResult = null
    if (!skipCleanup) {
      try {
        console.log('开始数据清理...')
                 const cleanupResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sync/cleanup`)
        
        if (cleanupResponse.ok) {
          cleanupResult = await cleanupResponse.json()
          console.log('数据清理完成')
        }
      } catch (error) {
        console.warn('数据清理失败:', error)
        cleanupResult = { error: '清理失败，但不影响同步' }
      }
    }

    console.log(`全量同步完成，预期同步 ${totalSynced} 篇文章`)

    return NextResponse.json({
      success: true,
      message: `全量同步完成，预期同步 ${totalSynced} 篇文章`,
      syncResults: results,
      cleanupResult,
      config: syncConfig,
      totalExpected: totalSynced,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })

  } catch (error) {
    console.error('全量同步失败:', error)
    return NextResponse.json(
      { error: '全量同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 