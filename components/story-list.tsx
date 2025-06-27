'use client'

import { useState, useEffect } from 'react'
import { StoryCard } from '@/components/story-card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { Story } from '@/lib/db'

interface StoryListProps {
  initialStories: Story[]
  initialTotal: number
  initialHasMore: boolean
  type?: string
  searchQuery?: string
}

export function StoryList({ 
  initialStories, 
  initialTotal, 
  initialHasMore, 
  type = 'all',
  searchQuery = ''
}: StoryListProps) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(2)

  useEffect(() => {
    setStories(initialStories)
    setHasMore(initialHasMore)
    setPage(2)
  }, [initialStories, initialHasMore, type, searchQuery])

  const loadMore = async () => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (type !== 'all') {
        params.set('type', type)
      }
      
      if (searchQuery) {
        params.set('search', searchQuery)
      }

      const response = await fetch(`/api/stories?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      
      setStories(prev => [...prev, ...data.stories])
      setHasMore(data.hasMore)
      setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error loading more stories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery ? '没有找到相关文章' : '暂无文章'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 文章总数 */}
      <div className="text-sm text-gray-500 mb-6">
        共找到 {initialTotal} 篇文章
      </div>

      {/* 文章列表 */}
      <div className="space-y-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
            className="min-w-32"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </>
            ) : (
              '加载更多'
            )}
          </Button>
        </div>
      )}

      {/* 已加载完所有内容的提示 */}
      {!hasMore && stories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">已加载全部内容</p>
        </div>
      )}
    </div>
  )
} 