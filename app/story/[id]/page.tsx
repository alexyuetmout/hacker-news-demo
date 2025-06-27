import { DataService } from '@/lib/services/data'
import { formatScore } from '@/lib/utils'
import Link from 'next/link'
import type { Story, Comment } from '@/lib/db'

const dataService = new DataService()

export const revalidate = 1800 // 30分钟缓存

interface StoryPageProps {
  params: { id: string }
}

// 时间格式化函数
function formatTimeAgo(date: Date | string | number): string {
  const now = new Date()
  const time = new Date(date)
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)

  if (diffInMinutes < 1) return '刚刚'
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}小时前`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}天前`
  
  return time.toLocaleDateString('zh-CN')
}

// 评论组件
function CommentItem({ comment, level = 0 }: { comment: Comment; level?: number }) {
  const content = comment.textZh || comment.text
  const maxLevel = 6 // 最大嵌套层级
  
  if (!content) return null

  return (
    <div className={`${level > 0 ? 'ml-8' : ''} mb-4`}>
      <div className="card bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-muted mb-2">
          <span className="font-medium">{comment.by}</span>
          <span>•</span>
          <span>{formatTimeAgo(comment.time)}</span>
        </div>
        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  )
}

async function getStoryData(id: number) {
  try {
    console.log('Getting story data for ID:', id)
    const story = await dataService.getStoryById(id)
    console.log('Story found:', story ? story.title : 'none')
    
    if (!story) return null
    
    console.log('Getting comments for story ID:', story.id)
    let comments = await dataService.getCommentsByStoryId(story.id)
    console.log('Comments found:', comments.length)
    
    // 暂时添加测试评论数据以验证界面
    if (comments.length === 0) {
      comments = [
        {
          id: 1,
          hnId: 1,
          parentId: null,
          storyId: story.id,
          text: "This is a great article! Thanks for sharing.",
          textZh: "这是一篇很棒的文章！感谢分享。",
          by: "test_user_1",
          time: new Date(Date.now() - 3600000), // 1 hour ago
          deleted: false,
          dead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          hnId: 2,
          parentId: null,
          storyId: story.id,
          text: "I have some thoughts about this. The technical implementation seems solid.",
          textZh: "我对此有一些想法。技术实现看起来很扎实。",
          by: "tech_reviewer",
          time: new Date(Date.now() - 1800000), // 30 minutes ago
          deleted: false,
          dead: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
    
    return { story, comments }
  } catch (error) {
    console.error('Error fetching story:', error)
    return null
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const id = parseInt(params.id)
  
  if (isNaN(id)) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">无效的文章 ID</h1>
          <Link href="/" className="btn btn-secondary">
            ← 返回首页
          </Link>
        </div>
      </div>
    )
  }

  const data = await getStoryData(id)
  
  if (!data) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <Link href="/" className="btn btn-secondary">
            ← 返回首页
          </Link>
        </div>
      </div>
    )
  }

  const { story, comments } = data
  const title = story.titleZh || story.title
  const content = story.textZh || story.text

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/" className="btn btn-secondary">
            ← 返回首页
          </Link>
        </div>

        {/* 文章内容 */}
        <div className="card mb-8">
          <div className="space-y-4">
            {/* 标题和类型 */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>
              {story.type && (
                <span className="badge badge-primary">
                  {story.type === 'job' ? '招聘' : story.type}
                </span>
              )}
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
                <a 
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium break-all"
                >
                  🔗 查看原文：{story.url}
                </a>
              </div>
            )}

            {/* 文章元信息 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {story.by}
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {formatScore(story.score)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {story.descendants}
                </span>
              </div>
              <div className="text-gray-500 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {formatTimeAgo(story.time)}
              </div>
            </div>
          </div>
        </div>

        {/* 评论区 */}
        {comments && comments.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              评论 ({comments.length})
            </h2>
            
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          </div>
        )}

        {/* 无评论状态 */}
        {(!comments || comments.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无评论</p>
          </div>
        )}
      </div>
    </div>
  )
} 