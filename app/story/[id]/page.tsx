import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataService } from '@/lib/services/data'
import { ExternalLink, MessageSquare, TrendingUp, User, Clock, ArrowLeft } from 'lucide-react'
import { formatTimeAgo, formatScore, getStoryTypeLabel, getStoryTypeColor } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Story, Comment } from '@/lib/db'

const dataService = new DataService()

export const revalidate = 1800 // 30分钟缓存

interface StoryPageProps {
  params: { id: string }
}

// 评论组件
function CommentItem({ comment, level = 0 }: { comment: Comment; level?: number }) {
  const content = comment.textZh || comment.text
  const maxLevel = 6 // 最大嵌套层级
  
  // 调试：检查评论数据
  console.log('Comment data:', {
    id: comment.id,
    hasTextZh: !!comment.textZh,
    textZhLength: comment.textZh?.length,
    textLength: comment.text?.length,
    usingTranslation: comment.textZh && comment.textZh !== comment.text
  })

  if (!content) return null

  return (
    <div className={`${level > 0 ? `ml-${Math.min(level, maxLevel) * 4}` : ''} mb-4`}>
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{comment.by}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{formatTimeAgo(comment.time)}</span>
          </div>
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function getStoryData(id: number) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stories/${id}`, {
      next: { revalidate: 0 } // 禁用缓存，立即看到翻译更新
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching story:', error)
    return null
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const id = parseInt(params.id)
  
  if (isNaN(id)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">无效的文章 ID</h1>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const data = await getStoryData(id)
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">文章不存在</h1>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const { story, comments }: { story: Story; comments: Comment[] } = data
  const title = story.titleZh || story.title
  const content = story.textZh || story.text

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>

          {/* 文章内容 */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="space-y-4">
                {/* 标题和类型 */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {title}
                  </h1>
                  <Badge 
                    variant="secondary" 
                    className={getStoryTypeColor(story.type)}
                  >
                    {getStoryTypeLabel(story.type)}
                  </Badge>
                </div>

                {/* 文章内容 */}
                {content && (
                  <div className="prose max-w-none text-gray-800 leading-relaxed">
                    <div className="whitespace-pre-wrap">
                      {content}
                    </div>
                  </div>
                )}

                {/* 原文链接 */}
                {story.url && (
                  <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                    <a 
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all"
                    >
                      查看原文：{story.url}
                    </a>
                  </div>
                )}

                {/* 文章元信息 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="font-medium">{story.by}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>{formatScore(story.score)} 分</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>{story.descendants} 评论</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-5 w-5" />
                    <span>{formatTimeAgo(story.time)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 评论区 */}
          {comments.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                评论 ({comments.length})
              </h2>
              
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          )}

          {comments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">暂无评论</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
} 