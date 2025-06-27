import { Suspense } from 'react'
import { Header } from '@/components/header'
import { StoryItem } from '@/components/story-item'
import { DataService } from '@/lib/services/data'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

const dataService = new DataService()

export const revalidate = 3600 // ISR - 每小时重新生成页面

async function getHomeData() {
  const [lastUpdateTime, topStories, newStories, bestStories, askStories, showStories, jobStories] = await Promise.all([
    dataService.getLastUpdateTime(),
    dataService.getStories('top', 1, 20),
    dataService.getStories('new', 1, 20), 
    dataService.getStories('best', 1, 20),
    dataService.getStories('ask', 1, 10),
    dataService.getStories('show', 1, 10),
    dataService.getStories('job', 1, 10)
  ])
  
  return {
    lastUpdateTime,
    topStories: topStories.stories,
    newStories: newStories.stories,
    bestStories: bestStories.stories,
    askStories: askStories.stories,
    showStories: showStories.stories,
    jobStories: jobStories.stories
  }
}

function LoadingSection() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>加载中...</span>
      </div>
    </div>
  )
}

function StoryColumn({ 
  title, 
  description, 
  stories, 
  categoryKey,
  limit = 20
}: {
  title: string
  description: string
  stories: any[]
  categoryKey: string
  limit?: number
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 列标题 */}
      <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">
            {title}
          </h2>
          <Link 
            href={`/category/${categoryKey}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            更多 →
          </Link>
        </div>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>

      {/* 文章列表 */}
      <div className="px-3 py-1 divide-y divide-gray-100">
        {stories.slice(0, limit).map((story, index) => (
          <StoryItem key={story.id} story={story} index={index} />
        ))}
      </div>

      {/* 空状态 */}
      {stories.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          <p>暂无{title}内容</p>
        </div>
      )}
    </div>
  )
}

export default async function HomePage() {
  const { lastUpdateTime, topStories, newStories, bestStories, askStories, showStories, jobStories } = await getHomeData()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdateTime={lastUpdateTime} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* H1 页面标题和 P 描述 */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Hacker News 中文站
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              来自 Hacker News 的最新技术资讯、讨论和洞察，
              通过 AI 翻译为中文，让您更便捷地获取全球技术动态。
            </p>
          </div>

          {/* 主要三列布局 */}
          <Suspense fallback={<LoadingSection />}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* 第一列：热门 */}
              <StoryColumn
                title="热门"
                description="最受关注的技术文章和讨论"
                stories={topStories}
                categoryKey="top"
                limit={20}
              />

              {/* 第二列：最新 */}
              <StoryColumn
                title="最新"
                description="刚刚发布的新鲜技术内容"
                stories={newStories}
                categoryKey="new"
                limit={20}
              />

              {/* 第三列：精选 */}
              <StoryColumn
                title="精选"
                description="高质量的优秀技术文章"
                stories={bestStories}
                categoryKey="best"
                limit={20}
              />
            </div>

            {/* 其他分类三列布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 问答 */}
              <StoryColumn
                title="问答"
                description="技术问题和求助讨论"
                stories={askStories}
                categoryKey="ask"
                limit={10}
              />

              {/* 展示 */}
              <StoryColumn
                title="展示"
                description="项目展示和作品分享"
                stories={showStories}
                categoryKey="show"
                limit={10}
              />

              {/* 招聘 */}
              <StoryColumn
                title="招聘"
                description="技术岗位和工作机会"
                stories={jobStories}
                categoryKey="job"
                limit={10}
              />
            </div>
          </Suspense>
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center text-gray-600">
            <h3 className="font-semibold mb-2">关于本站</h3>
            <p className="mb-3 text-sm leading-relaxed">
              本站内容来源于 Hacker News，通过先进的 AI 翻译服务提供中文版本。
              我们致力于为中文技术社区提供高质量的国际技术资讯和讨论内容。
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <span>数据每小时自动更新</span>
              <span>•</span>
              <a 
                href="https://news.ycombinator.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                访问原站 Hacker News
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 