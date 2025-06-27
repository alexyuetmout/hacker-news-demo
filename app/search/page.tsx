import { Suspense } from 'react'
import { Header } from '@/components/header'
import { StoryList } from '@/components/story-list'
import { DataService } from '@/lib/services/data'
import { Loader2 } from 'lucide-react'

const dataService = new DataService()

export const revalidate = 0 // 搜索页面不缓存

interface SearchPageProps {
  searchParams: { q?: string }
}

async function getSearchData(query: string) {
  if (!query.trim()) {
    return {
      stories: [],
      total: 0,
      hasMore: false,
      lastUpdateTime: null
    }
  }

  const [storiesData, lastUpdateTime] = await Promise.all([
    dataService.searchStories(query, 1, 20),
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
        <span className="text-lg">搜索中...</span>
      </div>
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''
  const { stories, total, hasMore, lastUpdateTime } = await getSearchData(query)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdateTime={lastUpdateTime} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              搜索结果
            </h1>
            {query && (
              <p className="text-gray-600">
                关键词：<span className="font-medium">"{query}"</span>
              </p>
            )}
          </div>

          <Suspense fallback={<LoadingStories />}>
            <StoryList
              initialStories={stories}
              initialTotal={total}
              initialHasMore={hasMore}
              searchQuery={query}
            />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 