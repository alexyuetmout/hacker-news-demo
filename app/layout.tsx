import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '中文黑客新闻 - Hacker News 中文版',
  description: '基于 Hacker News API 的中文内容展示平台，提供最新的技术资讯、讨论和分享',
  keywords: 'Hacker News, 中文, 技术, 编程, 创业, 科技新闻',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 