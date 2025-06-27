import { Suspense } from 'react'
import { Header } from '@/components/header'
import { StoryList } from '@/components/story-list'
import { DataService } from '@/lib/services/data'
import { Loader2 } from 'lucide-react'

const dataService = new DataService()

export const revalidate = 3600 // ISR - 每小时重新生成页面

async function getHomeData() {
  const [storiesData, lastUpdateTime] = await Promise.all([
    dataService.getStories('all', 1, 20),
    dataService.getLastUpdateTime()
  ])
  
  return {
    stories: storiesData.stories,
    total: storiesData.total,
    hasMore: storiesData.hasMore,
    lastUpdateTime
  }
}

function LoadingStories() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-lg">加载中...</span>
      </div>
    </div>
  )
}

export default async function HomePage() {
  const { stories, total, hasMore, lastUpdateTime } = await getHomeData()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdateTime={lastUpdateTime} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              热门文章
            </h1>
            <p className="text-gray-600">
              来自 Hacker News 的最新技术资讯和讨论
            </p>
          </div>

          {/* 文章列表 */}
          <Suspense fallback={<LoadingStories />}>
            <StoryList
              initialStories={stories}
              initialTotal={total}
              initialHasMore={hasMore}
              type="all"
            />
          </Suspense>
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center text-gray-600">
            <p className="mb-2">
              本站内容来源于 Hacker News，通过自动翻译服务提供中文版本
            </p>
            <p className="text-sm">
              数据每小时自动更新 | 
              <a 
                href="https://news.ycombinator.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                访问原站
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 