import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/services/data'

const dataService = new DataService()

export async function POST(request: NextRequest) {
  try {
    // 验证 cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'top' | 'new' | 'best' | 'ask' | 'show' | 'job'
    const limit = parseInt(searchParams.get('limit') || '50') 

    if (!type || !['top', 'new', 'best', 'ask', 'show', 'job'].includes(type)) {
      return NextResponse.json(
        { error: '无效的同步类型' },
        { status: 400 }
      )
    }

    console.log(`开始同步 ${type} 类型的文章，限制数量: ${limit}`)
    
    await dataService.updateStoriesFromHN(type, limit)

    console.log(`完成同步 ${type} 类型的文章`)

    return NextResponse.json({
      success: true,
      message: `已成功同步 ${type} 类型的 ${limit} 篇文章`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: '同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 支持 GET 请求用于手动触发同步（仅在开发环境）
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '生产环境不支持 GET 请求同步' },
      { status: 405 }
    )
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'top' | 'new' | 'best' | 'ask' | 'show' | 'job'
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!type || !['top', 'new', 'best', 'ask', 'show', 'job'].includes(type)) {
    return NextResponse.json(
      { error: '无效的同步类型。支持: top, new, best, ask, show, job' },
      { status: 400 }
    )
  }

  try {
    console.log(`开发环境手动同步 ${type} 类型的文章，限制数量: ${limit}`)
    
    await dataService.updateStoriesFromHN(type, limit)

    return NextResponse.json({
      success: true,
      message: `已成功同步 ${type} 类型的 ${limit} 篇文章`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json(
      { error: '同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 