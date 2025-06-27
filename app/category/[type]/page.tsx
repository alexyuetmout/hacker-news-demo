import { Suspense } from 'react'
import { Header } from '@/components/header'
import { StoryList } from '@/components/story-list'
import { DataService } from '@/lib/services/data'
import { Loader2 } from 'lucide-react'
import { getCategoryLabel } from '@/lib/utils'

const dataService = new DataService()

export const revalidate = 3600

interface CategoryPageProps {
  params: { type: string }
}

async function getCategoryData(source: string) {
  const [storiesData, lastUpdateTime] = await Promise.all([
    dataService.getStories(source, 1, 20),
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { type } = params
  const { stories, total, hasMore, lastUpdateTime } = await getCategoryData(type)
  
  const categoryLabel = getCategoryLabel(type)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header lastUpdateTime={lastUpdateTime} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {categoryLabel}
            </h1>
            <p className="text-gray-600">
              {type === 'new' && '最新发布的文章和讨论'}
              {type === 'best' && '社区评分最高的优质内容'}
              {type === 'ask' && '社区问答和求助讨论'}
              {type === 'show' && '项目展示和作品分享'}
              {type === 'job' && '技术职位和招聘信息'}
            </p>
          </div>

          <Suspense fallback={<LoadingStories />}>
            <StoryList
              initialStories={stories}
              initialTotal={total}
              initialHasMore={hasMore}
              source={type}
            />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 