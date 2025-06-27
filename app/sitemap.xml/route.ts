import { getStoriesByType } from '@/lib/services/data'

export async function GET() {
  const baseUrl = 'https://hackernews-zh.com'
  
  // 获取所有类型的故事
  const [topStories, newStories, bestStories] = await Promise.all([
    getStoriesByType('top', 100),
    getStoriesByType('new', 100), 
    getStoriesByType('best', 100),
  ])
  
  const allStories = [...topStories, ...newStories, ...bestStories]
  const uniqueStories = Array.from(
    new Map(allStories.map(story => [story.id, story])).values()
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 主要页面 -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  
  <!-- 分类页面 -->
  <url>
    <loc>${baseUrl}/category/top</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/category/new</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/category/best</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/category/ask</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/category/show</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/category/job</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  
  <!-- 搜索页面 -->
  <url>
    <loc>${baseUrl}/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  
  <!-- 静态页面 -->
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/api</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <!-- 故事详情页面 -->
  ${uniqueStories.map(story => `
  <url>
    <loc>${baseUrl}/story/${story.id}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date(story.time).toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
} 