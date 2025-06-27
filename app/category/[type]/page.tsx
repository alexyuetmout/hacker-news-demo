import { Suspense } from 'react'
import StoryList from '@/components/story-list'
import { getStoriesByType } from '@/lib/services/data'

interface CategoryPageProps {
  params: { type: string }
}

function getCategoryInfo(type: string) {
  const categories = {
    'top': {
      title: '热门文章',
      description: '当前最受关注的技术话题和创新思考',
      icon: '🔥',
      gradient: 'from-red-500 to-orange-500'
    },
    'new': {
      title: '最新发布',
      description: '刚刚发布的新鲜内容，紧跟技术前沿',
      icon: '⚡',
      gradient: 'from-blue-500 to-cyan-500'
    },
    'best': {
      title: '精选内容',
      description: '经过时间验证的优质文章和深度讨论',
      icon: '⭐',
      gradient: 'from-yellow-500 to-amber-500'
    },
    'ask': {
      title: 'Ask HN',
      description: '技术问答、求助讨论和社区互动',
      icon: '❓',
      gradient: 'from-purple-500 to-pink-500'
    },
    'show': {
      title: 'Show HN',
      description: '项目展示、作品分享和创意演示',
      icon: '🚀',
      gradient: 'from-green-500 to-teal-500'
    },
    'job': {
      title: '招聘信息',
      description: '技术职位、工作机会和职业发展',
      icon: '💼',
      gradient: 'from-indigo-500 to-blue-500'
    }
  }
  
  return categories[type as keyof typeof categories] || categories.new
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="flex gap-4">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function CategoryContent({ type }: { type: string }) {
  const stories = await getStoriesByType(type, 50)
  const categoryInfo = getCategoryInfo(type)
  
  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* 分类头部 */}
        <section className="text-center py-8">
          <div className="space-y-6">
            {/* 图标 */}
            <div className="relative">
              <div className={`w-20 h-20 bg-gradient-to-r ${categoryInfo.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                <span className="text-3xl">{categoryInfo.icon}</span>
              </div>
            </div>
            
            {/* 标题和描述 */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{categoryInfo.title}</h1>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                {categoryInfo.description}
              </p>
            </div>
            
            {/* 统计信息 */}
            {stories.length > 0 && (
              <div className="flex items-center justify-center gap-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stories.length}</div>
                  <div className="text-sm text-muted">篇文章</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(stories.reduce((sum, story) => sum + (story.score || 0), 0) / stories.length)}
                  </div>
                  <div className="text-sm text-muted">平均热度</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(stories.reduce((sum, story) => sum + (story.descendants || 0), 0) / stories.length)}
                  </div>
                  <div className="text-sm text-muted">平均评论</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 文章列表 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">全部文章</h2>
          </div>
          
          {/* 文章列表 */}
          <StoryList stories={stories} />
          
          {/* 空状态 */}
          {stories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{categoryInfo.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">暂无 {categoryInfo.title}</h3>
              <p className="text-muted mb-6">
                目前该分类下还没有文章，请稍后再试
              </p>
              <div className="flex gap-4 justify-center">
                <a href="/category/top" className="btn btn-secondary">
                  浏览热门文章
                </a>
                <a href="/" className="btn btn-secondary">
                  返回首页
                </a>
              </div>
            </div>
          )}
        </section>

        {/* 推荐其他分类 */}
        {stories.length > 0 && (
          <section className="py-8 bg-gray-50 rounded-xl">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold">探索其他分类</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {['top', 'new', 'best', 'ask', 'show', 'job']
                  .filter(cat => cat !== type)
                  .slice(0, 3)
                  .map(cat => {
                    const info = getCategoryInfo(cat)
                    return (
                      <a 
                        key={cat} 
                        href={`/category/${cat}`}
                        className="card text-center hover:scale-105 transition-transform"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${info.gradient} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                          <span className="text-xl">{info.icon}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{info.title}</h3>
                        <p className="text-sm text-muted">{info.description}</p>
                      </a>
                    )
                  })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { type } = params

  return (
    <Suspense fallback={
      <div className="container py-8">
        <LoadingSkeleton />
      </div>
    }>
      <CategoryContent type={type} />
    </Suspense>
  )
} 