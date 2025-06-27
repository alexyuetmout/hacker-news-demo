require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function fetchHNData() {
  try {
    console.log('正在获取 Hacker News 数据...')
    
    // 获取热门文章ID
    const topResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const topIds = await topResponse.json()
    console.log(`获取到 ${topIds.length} 个热门文章ID`)
    
    // 取前5个文章
    const selectedIds = topIds.slice(0, 5)
    
    // 获取文章详情
    const stories = []
    for (const id of selectedIds) {
      console.log(`正在获取文章 ${id} 的详情...`)
      const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      const item = await itemResponse.json()
      
      if (item && !item.deleted && !item.dead && item.by && item.time) {
        stories.push(item)
        console.log(`✅ 获取成功: ${item.title}`)
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    return stories
  } catch (error) {
    console.error('获取 Hacker News 数据失败:', error)
    return []
  }
}

async function insertToDB(stories) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'hackernews_zh',
    user: process.env.POSTGRES_USER || 'yuewuwang',
    password: process.env.POSTGRES_PASSWORD || '',
  })
  
  try {
    await client.connect()
    console.log('数据库连接成功')
    
    let insertCount = 0
    for (const story of stories) {
      try {
        // 检查是否已存在
        const checkResult = await client.query('SELECT id FROM stories WHERE hn_id = $1', [story.id])
        if (checkResult.rows.length > 0) {
          console.log(`文章 ${story.id} 已存在，跳过`)
          continue
        }
        
        // 插入新文章
        const insertQuery = `
          INSERT INTO stories (hn_id, title, url, text, by, score, descendants, time, type, source, deleted, dead, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        `
        
        const values = [
          story.id,
          story.title || '',
          story.url || null,
          story.text || null,
          story.by,
          story.score || 0,
          story.descendants || 0,
          new Date(story.time * 1000),
          story.type || 'story',
          'top',
          false,
          false
        ]
        
        await client.query(insertQuery, values)
        insertCount++
        console.log(`✅ 成功插入文章: ${story.title}`)
        
      } catch (error) {
        console.error(`插入文章 ${story.id} 失败:`, error.message)
      }
    }
    
    console.log(`\n同步完成！成功插入 ${insertCount} 篇文章`)
    
    // 查询总数
    const countResult = await client.query('SELECT COUNT(*) FROM stories')
    console.log(`数据库中现在共有 ${countResult.rows[0].count} 篇文章`)
    
  } catch (error) {
    console.error('数据库操作失败:', error)
  } finally {
    await client.end()
  }
}

async function main() {
  console.log('开始简单同步...')
  
  const stories = await fetchHNData()
  if (stories.length > 0) {
    await insertToDB(stories)
  } else {
    console.log('没有获取到有效的文章数据')
  }
}

main().catch(console.error) 