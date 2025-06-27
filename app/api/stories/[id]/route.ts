import { NextRequest, NextResponse } from 'next/server'
import { DataService } from '@/lib/services/data'

const dataService = new DataService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的文章 ID' },
        { status: 400 }
      )
    }

    const story = await dataService.getStoryById(id)
    if (!story) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }

    const comments = await dataService.getCommentsByStoryId(id)

    return NextResponse.json({
      story,
      comments
    })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json(
      { error: '获取文章详情失败' },
      { status: 500 }
    )
  }
} 