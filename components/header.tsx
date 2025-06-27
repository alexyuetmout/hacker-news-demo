'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Hash, RefreshCw } from 'lucide-react'

interface HeaderProps {
  lastUpdateTime?: Date | null
}

export function Header({ lastUpdateTime }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const categories = [
    { key: 'all', label: '全部', href: '/' },
    { key: 'story', label: '文章', href: '/category/story' },
    { key: 'ask', label: 'Ask HN', href: '/category/ask' },
    { key: 'show', label: 'Show HN', href: '/category/show' },
    { key: 'job', label: '招聘', href: '/category/job' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo 和网站名 */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Hash className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              中文黑客新闻
            </span>
          </Link>
        </div>

        {/* 导航分类 */}
        <nav className="hidden md:flex items-center space-x-1">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={category.href}
              className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {category.label}
            </Link>
          ))}
        </nav>

        {/* 搜索框 */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </form>

          {/* 最后更新时间 */}
          {lastUpdateTime && (
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4" />
              <span>更新于 {lastUpdateTime.toLocaleString('zh-CN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 移动端导航 */}
      <div className="md:hidden border-t bg-background">
        <div className="container px-4 py-2">
          <nav className="flex items-center space-x-1 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.key}
                href={category.href}
                className="flex-shrink-0 px-3 py-1 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
} 