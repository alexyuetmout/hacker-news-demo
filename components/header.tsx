'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="header-simple">
      <div className="container py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="logo-icon">
              <span>H</span>
            </div>
            <span className="logo-text">Hacker News</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/category/top" className="nav-link">热门</Link>
            <Link href="/category/new" className="nav-link">最新</Link>
            <Link href="/category/best" className="nav-link">精选</Link>
            <Link href="/category/ask" className="nav-link">问答</Link>
            <Link href="/category/show" className="nav-link">展示</Link>
            <Link href="/category/job" className="nav-link">招聘</Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="search"
              placeholder="搜索故事..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-3 pt-3 border-t border-gray-100">
          <div className="flex gap-4 overflow-x-auto">
            <Link href="/category/top" className="nav-link-mobile">热门</Link>
            <Link href="/category/new" className="nav-link-mobile">最新</Link>
            <Link href="/category/best" className="nav-link-mobile">精选</Link>
            <Link href="/category/ask" className="nav-link-mobile">问答</Link>
            <Link href="/category/show" className="nav-link-mobile">展示</Link>
            <Link href="/category/job" className="nav-link-mobile">招聘</Link>
          </div>
        </nav>
      </div>
    </header>
  )
} 