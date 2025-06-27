'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StoryList from '@/components/story-list'
import type { Story } from '@/lib/db'

function SearchForm({ 
  initialQuery, 
  onSearch 
}: { 
  initialQuery: string
  onSearch: (query: string) => void 
}) {
  const [query, setQuery] = useState(initialQuery)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章标题、内容或作者..."
          className="input w-full pl-4 pr-20 py-3 text-lg"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary"
          disabled={!query.trim()}
        >
          搜索
        </button>
      </div>
      
      {/* 搜索提示 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted">
          提示：搜索支持中英文关键词，可以搜索标题、内容和作者
        </p>
      </div>
    </form>
  )
}

function SearchResults({ 
  query, 
  results, 
  loading, 
  total 
}: { 
  query: string
  results: Story[]
  loading: boolean
  total: number 
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
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

  if (!query) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔍</span>
        </div>
        <h2 className="text-2xl font-semibold mb-2">搜索 Hacker News 中文内容</h2>
        <p className="text-lg text-muted mb-6">
          在这里搜索感兴趣的技术文章、讨论和观点
        </p>
        
        {/* 热门搜索建议 */}
        <div className="max-w-lg mx-auto">
          <h3 className="text-lg font-semibold mb-4">热门话题</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'AI', 'React', 'Python', 'Startup', 'Web3', 
              'Machine Learning', 'Open Source', 'DevOps'
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  const input = document.querySelector('input[type="search"]') as HTMLInputElement
                  if (input) {
                    input.value = topic
                    input.dispatchEvent(new Event('change', { bubbles: true }))
                    input.form?.requestSubmit()
                  }
                }}
                className="badge hover:badge-primary cursor-pointer transition-all"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">未找到相关内容</h3>
        <p className="text-muted mb-6">
          没有找到与 <strong>"{query}"</strong> 相关的文章
        </p>
        <div className="space-y-2">
          <p className="text-sm">建议：</p>
          <ul className="text-sm text-muted space-y-1">
            <li>• 尝试使用不同的关键词</li>
            <li>• 检查拼写是否正确</li>
            <li>• 使用更通用的搜索词</li>
            <li>• 尝试英文关键词</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜索结果统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">搜索结果</h2>
          <p className="text-muted">
            找到 <strong>{total}</strong> 篇相关文章，搜索词：<strong>"{query}"</strong>
          </p>
        </div>
      </div>

      {/* 搜索结果列表 */}
      <StoryList stories={results} />
      
      {/* 加载更多按钮 */}
      {results.length < total && (
        <div className="text-center pt-6">
          <button className="btn btn-secondary">
            加载更多结果
          </button>
        </div>
      )}
    </div>
  )
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const handleSearch = async (searchQuery: string) => {
    setLoading(true)
    setQuery(searchQuery)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.stories || [])
        setTotal(data.total || 0)
      } else {
        setResults([])
        setTotal(0)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
    
    // 更新 URL
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  // 初始搜索
  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [])

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 搜索表单 */}
        <div className="mb-8">
          <SearchForm initialQuery={query} onSearch={handleSearch} />
        </div>

        {/* 搜索结果 */}
        <SearchResults 
          query={query}
          results={results}
          loading={loading}
          total={total}
        />
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}