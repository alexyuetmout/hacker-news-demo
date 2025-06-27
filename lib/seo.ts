import type { Metadata } from 'next'

const baseUrl = 'https://hackernews-zh.com'
const siteName = 'Hacker News 中文站'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  section?: string
  tags?: string[]
  images?: {
    url: string
    width?: number
    height?: number
    alt?: string
  }[]
}

export function generateMetadata({
  title,
  description = '发现科技世界的精彩故事，汇聚全球最新的技术资讯、创业故事和深度思考',
  keywords = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  images = [{ url: '/og-image.jpg', width: 1200, height: 630, alt: siteName }]
}: SEOConfig = {}): Metadata {
  const fullTitle = title ? `${title} - ${siteName}` : `${siteName} - 发现科技世界的精彩故事`
  const defaultKeywords = ['Hacker News', '技术新闻', '程序员', '创业', '科技资讯', '人工智能', '编程', '开源']
  const allKeywords = [...defaultKeywords, ...keywords].join(', ')

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: authors ? authors.map(name => ({ name })) : [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    openGraph: {
      title: fullTitle,
      description,
      type,
      locale: 'zh_CN',
      url: baseUrl,
      siteName,
      images: images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`
      })),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: images.map(img => img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`),
      creator: '@hackernews_zh',
      site: '@hackernews_zh',
    },
    alternates: {
      canonical: baseUrl,
      types: {
        'application/rss+xml': [{ url: '/rss.xml', title: `${siteName} RSS` }],
      },
    },
  }
}

export function generateArticleStructuredData({
  id,
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  url,
  imageUrl,
  keywords = [],
  section = 'Technology'
}: {
  id: string
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime?: string
  url?: string
  imageUrl?: string
  keywords?: string[]
  section?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${baseUrl}/story/${id}`,
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author,
      "url": `https://news.ycombinator.com/user?id=${author}`
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": publishedTime,
    ...(modifiedTime && { "dateModified": modifiedTime }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/story/${id}`
    },
    ...(imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": imageUrl,
        "width": 1200,
        "height": 630
      }
    }),
    "articleSection": section,
    "keywords": keywords,
    "inLanguage": "zh-CN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`
    },
    ...(url && {
      "isBasedOn": {
        "@type": "WebPage",
        "url": url
      }
    })
  }
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(item.url && { "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}` })
    }))
  }
}

export function generateWebPageStructuredData({
  url,
  name,
  description,
  breadcrumbs
}: {
  url: string
  name: string
  description: string
  breadcrumbs?: Array<{ name: string; url?: string }>
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url.startsWith('http') ? `${url}#webpage` : `${baseUrl}${url}#webpage`,
    "url": url.startsWith('http') ? url : `${baseUrl}${url}`,
    "name": name,
    "description": description,
    "isPartOf": {
      "@id": `${baseUrl}/#website`
    },
    "about": {
      "@id": `${baseUrl}/#organization`
    },
    "inLanguage": "zh-CN",
    ...(breadcrumbs && {
      "breadcrumb": generateBreadcrumbStructuredData(breadcrumbs)
    })
  }
} 