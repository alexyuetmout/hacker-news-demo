import { getStoriesByType } from '@/lib/services/data'

export async function GET() {
  const baseUrl = 'https://hackernews-zh.com'
  
  // 获取最新的故事
  const [topStories, newStories, bestStories] = await Promise.all([
    getStoriesByType('top', 20),
    getStoriesByType('new', 20),
    getStoriesByType('best', 20),
  ])
  
  // 合并并按时间排序
  const allStories = [...topStories, ...newStories, ...bestStories]
  const uniqueStories = Array.from(
    new Map(allStories.map(story => [story.id, story])).values()
  ).sort((a, b) => b.time - a.time).slice(0, 50)

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hacker News 中文站</title>
    <description>发现科技世界的精彩故事，汇聚全球最新的技术资讯、创业故事和深度思考</description>
    <link>${baseUrl}</link>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js</generator>
    <webMaster>contact@hackernews-zh.com (Hacker News 中文站)</webMaster>
    <managingEditor>contact@hackernews-zh.com (Hacker News 中文站)</managingEditor>
    <copyright>© 2024 Hacker News 中文站</copyright>
    <category>Technology</category>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>Hacker News 中文站</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    
    ${uniqueStories.map(story => {
      const pubDate = new Date(story.time).toUTCString()
      const title = story.titleZh || story.title
      const description = `来自 ${story.by} 的分享${story.score ? `，获得 ${story.score} 分` : ''}${story.descendants ? `，${story.descendants} 条评论` : ''}`
      
      return `
    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${baseUrl}/story/${story.id}</link>
      <guid isPermaLink="true">${baseUrl}/story/${story.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>contact@hackernews-zh.com (${story.by})</author>
      <category>Technology</category>
      ${story.url ? `<content:encoded><![CDATA[
        <p>${description}</p>
        <p><strong>原文链接：</strong> <a href="${story.url}" target="_blank" rel="noopener">${story.url}</a></p>
        <p><strong>查看详情：</strong> <a href="${baseUrl}/story/${story.id}">点击查看完整内容和讨论</a></p>
      ]]></content:encoded>` : ''}
    </item>`
    }).join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30分钟缓存
    },
  })
} 