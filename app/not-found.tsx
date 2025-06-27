import Link from 'next/link'

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
          <Link href="/" className="btn btn-primary w-full block text-center">
            🏠 返回首页
          </Link>
          
          <Link href="/search" className="btn btn-secondary w-full block text-center">
            🔍 搜索文章
          </Link>
        </div>
      </div>
    </div>
  )
} 