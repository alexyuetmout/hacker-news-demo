import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">页面未找到</h2>
          <p className="text-gray-600">
            抱歉，您访问的页面不存在或已被移除。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
          
          <Link href="/search">
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              搜索文章
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 