export async function GET() {
  const baseUrl = 'https://hackernews-zh.com'
  
  const robotsTxt = `User-agent: *
Allow: /

# 主要站点地图
Sitemap: ${baseUrl}/sitemap.xml

# 搜索引擎特定规则
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 2

# 禁止访问的路径
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# 允许但限制的路径
Allow: /api/stories/
Allow: /api/sync/

# 清理规则
Clean-param: utm_source
Clean-param: utm_medium
Clean-param: utm_campaign
Clean-param: utm_term
Clean-param: utm_content
Clean-param: ref
Clean-param: source

# 主机信息
Host: ${baseUrl}`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24小时缓存
    },
  })
} 