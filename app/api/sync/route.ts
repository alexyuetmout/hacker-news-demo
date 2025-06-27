import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/services/data'

const dataService = new DataService()

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'top' | 'new' | 'best' | 'ask' | 'show' | 'job'
    const limit = parseInt(searchParams.get('limit') || '50') 

    if (!type || !['top', 'new', 'best', 'ask', 'show', 'job'].includes(type)) {
      return NextResponse.json(
        { error: '无效的同步类型。支持: top, new, best, ask, show, job' },
        { status: 400 }
      )
    }

    console.log(`开始同步 ${type} 类型的文章，限制数量: ${limit}`)
    
    await dataService.updateStoriesFromHN(type, limit)

    console.log(`完成同步 ${type} 类型的文章`)

    return NextResponse.json({
      success: true,
      message: `已成功同步 ${type} 类型的 ${limit} 篇文章`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: '同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 