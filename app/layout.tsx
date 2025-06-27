import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/header'

export const metadata: Metadata = {
  title: 'Hacker News 中文站 - 发现科技世界的精彩故事',
  description: '实时获取和翻译 Hacker News 热门内容的中文平台，汇聚全球最新的技术资讯、创业故事和深度思考，为开发者和技术爱好者提供高质量的中文内容',
  keywords: 'Hacker News, 技术新闻, 程序员, 创业, 科技资讯, 人工智能, 编程, 开源, 技术博客, 软件开发',
  authors: [{ name: 'Hacker News 中文站' }],
  creator: 'Hacker News 中文站',
  publisher: 'Hacker News 中文站',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  alternates: {
    canonical: 'https://hackernews-zh.com',
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Hacker News 中文站 RSS' },
      ],
    },
  },
  openGraph: {
    title: 'Hacker News 中文站 - 发现科技世界的精彩故事',
    description: '实时获取和翻译 Hacker News 热门内容的中文平台，为开发者和技术爱好者提供高质量的中文内容',
    type: 'website',
    locale: 'zh_CN',
    url: 'https://hackernews-zh.com',
    siteName: 'Hacker News 中文站',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hacker News 中文站',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hacker News 中文站 - 发现科技世界的精彩故事',
    description: '实时获取和翻译 Hacker News 热门内容的中文平台',
    images: ['/og-image.jpg'],
    creator: '@hackernews_zh',
    site: '@hackernews_zh',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

// 结构化数据
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://hackernews-zh.com/#website",
      "url": "https://hackernews-zh.com",
      "name": "Hacker News 中文站",
      "description": "发现科技世界的精彩故事，为中文开发者提供高质量技术资讯",
      "publisher": {
        "@id": "https://hackernews-zh.com/#organization"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://hackernews-zh.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "zh-CN"
    },
    {
      "@type": "Organization",
      "@id": "https://hackernews-zh.com/#organization",
      "name": "Hacker News 中文站",
      "url": "https://hackernews-zh.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hackernews-zh.com/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://twitter.com/hackernews_zh",
        "https://github.com/hackernews-zh",
        "https://weibo.com/hackernews_zh"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://hackernews-zh.com/#webpage",
      "url": "https://hackernews-zh.com",
      "name": "Hacker News 中文站 - 首页",
      "isPartOf": {
        "@id": "https://hackernews-zh.com/#website"
      },
      "about": {
        "@id": "https://hackernews-zh.com/#organization"
      },
      "description": "汇聚全球最新的技术资讯、创业故事和深度思考",
      "breadcrumb": {
        "@id": "https://hackernews-zh.com/#breadcrumb"
      },
      "inLanguage": "zh-CN"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://hackernews-zh.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://hackernews-zh.com"
        }
      ]
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="application/rss+xml" title="Hacker News 中文站 RSS" href="/rss.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <footer className="footer-section">
            <div className="container">
              <div className="footer-content">
                {/* 主要信息 */}
                <div className="footer-main">
                  <div className="footer-brand">
                    <div className="footer-logo">
                      <span>H</span>
                    </div>
                    <div>
                      <h3 className="footer-title">Hacker News 中文站</h3>
                      <p className="footer-description">
                        发现科技世界的精彩故事，为中文开发者提供高质量技术资讯
                      </p>
                    </div>
                  </div>
                  
                  {/* 社交媒体链接 */}
                  <div className="footer-social">
                    <h4 className="footer-social-title">关注我们</h4>
                    <div className="social-links">
                      <a href="https://twitter.com/hackernews_zh" className="social-link" aria-label="Twitter" rel="noopener noreferrer" target="_blank">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                      <a href="https://github.com/hackernews-zh" className="social-link" aria-label="GitHub" rel="noopener noreferrer" target="_blank">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                      <a href="https://weibo.com/hackernews_zh" className="social-link" aria-label="微博" rel="noopener noreferrer" target="_blank">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.31 8.17c-2.73-.14-4.82.81-4.82 2.83 0 2.04 2.34 3.04 4.82 2.83 2.73.14 4.82-.81 4.82-2.83 0-2.04-2.34-3.04-4.82-2.83zM21 12.5c.5-5.5-4.4-8.5-9.5-8.5S2.5 7 2 12.5c-.5 5.5 4.4 8.5 9.5 8.5s9.5-3 9.5-8.5z"/>
                        </svg>
                      </a>
                      <a href="mailto:contact@hackernews-zh.com" className="social-link" aria-label="邮箱">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* 版权信息 */}
                <div className="footer-bottom">
                  <div className="footer-links">
                    <a href="/about" className="footer-link">关于我们</a>
                    <a href="/privacy" className="footer-link">隐私政策</a>
                    <a href="/terms" className="footer-link">使用条款</a>
                    <a href="/api" className="footer-link">API 文档</a>
                    <a href="/sitemap" className="footer-link">网站地图</a>
                    <a href="/rss.xml" className="footer-link">RSS订阅</a>
                  </div>
                  <div className="footer-copyright">
                    <p>© 2024 Hacker News 中文站. 基于 Hacker News API 构建</p>
                    <p>使用 AI 技术提供中文翻译服务</p>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 