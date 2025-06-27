import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/services/data'

const dataService = new DataService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    let result

    if (search) {
      result = await dataService.searchStories(search, page, limit)
    } else {
      result = await dataService.getStories(type, page, limit)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    )
  }
} 