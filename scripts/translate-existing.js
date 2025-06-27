require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')
const OpenAI = require('openai')

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})

async function translateText(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个专业的翻译助手，专门将英文技术内容翻译成中文。请保持原意，使用简洁清晰的中文表达。对于专业术语，如果有通用的中文译名则使用，否则保留英文并在括号内标注中文解释。"
        },
        {
          role: "user",
          content: `请将以下英文翻译成中文：\n\n${text}`
        }
      ],
      temperature: 0.3,
    })

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('翻译失败:', error.message)
    return null
  }
}

async function translateExistingData() {
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

    // 获取需要翻译的文章（没有中文标题的）
    const result = await client.query(`
      SELECT id, hn_id, title, text 
      FROM stories 
      WHERE title_zh IS NULL OR title_zh = ''
      ORDER BY created_at DESC
      LIMIT 10
    `)

    console.log(`找到 ${result.rows.length} 篇文章需要翻译`)

    let translatedCount = 0
    for (const story of result.rows) {
      try {
        console.log(`\n正在翻译文章 ${story.hn_id}: ${story.title}`)

        // 翻译标题
        const titleZh = await translateText(story.title)
        if (!titleZh) {
          console.log('标题翻译失败，跳过')
          continue
        }

        console.log(`标题翻译: ${titleZh}`)

        // 翻译内容（如果有的话）
        let textZh = null
        if (story.text && story.text.trim()) {
          console.log('正在翻译内容...')
          textZh = await translateText(story.text)
          if (textZh) {
            console.log(`内容翻译完成，长度: ${textZh.length} 字符`)
          }
        }

        // 更新数据库
        const updateQuery = `
          UPDATE stories 
          SET title_zh = $1, text_zh = $2, updated_at = NOW()
          WHERE id = $3
        `
        
        await client.query(updateQuery, [titleZh, textZh, story.id])
        translatedCount++
        console.log(`✅ 文章 ${story.hn_id} 翻译完成`)

        // 避免API请求过快
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`翻译文章 ${story.hn_id} 时出错:`, error.message)
      }
    }

    console.log(`\n翻译完成！成功翻译 ${translatedCount} 篇文章`)

    // 查询统计信息
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(title_zh) as translated
      FROM stories
    `)
    
    const stats = statsResult.rows[0]
    console.log(`\n统计信息:`)
    console.log(`- 总文章数: ${stats.total}`)
    console.log(`- 已翻译: ${stats.translated}`)
    console.log(`- 未翻译: ${stats.total - stats.translated}`)

  } catch (error) {
    console.error('翻译过程出错:', error)
  } finally {
    await client.end()
    console.log('数据库连接已关闭')
  }
}

async function main() {
  console.log('开始翻译现有数据...')
  await translateExistingData()
}

main().catch(console.error) 