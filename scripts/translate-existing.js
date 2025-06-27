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

    // 获取需要翻译的文章（中英文相同或中文为空的文章）
    const result = await client.query(`
      SELECT id, hn_id, title, title_zh, text, text_zh 
      FROM stories 
      WHERE (
        title = title_zh OR               -- 中英文相同
        title_zh IS NULL OR               -- 中文为空
        title_zh = '' OR                  -- 中文为空字符串
        (text IS NOT NULL AND text = text_zh) OR  -- 内容中英文相同
        (text IS NOT NULL AND text_zh IS NULL) OR -- 内容中文为空
        (text IS NOT NULL AND text_zh = '')       -- 内容中文为空字符串
      )
      AND title IS NOT NULL 
      AND title != ''
      ORDER BY created_at DESC
      LIMIT 50
    `)

    console.log(`找到 ${result.rows.length} 篇文章需要翻译`)

    // 显示详细统计
    const statsQuery = await client.query(`
      SELECT 
        COUNT(*) as total_stories,
        COUNT(CASE WHEN title = title_zh THEN 1 END) as title_same_as_zh,
        COUNT(CASE WHEN title_zh IS NULL OR title_zh = '' THEN 1 END) as title_zh_empty,
        COUNT(CASE WHEN text IS NOT NULL AND text = text_zh THEN 1 END) as text_same_as_zh,
        COUNT(CASE WHEN text IS NOT NULL AND (text_zh IS NULL OR text_zh = '') THEN 1 END) as text_zh_empty,
        COUNT(CASE WHEN title != title_zh AND title_zh IS NOT NULL AND title_zh != '' THEN 1 END) as already_translated
      FROM stories
    `)
    
    const currentStats = statsQuery.rows[0]
    console.log(`\n当前翻译状态:`)
    console.log(`- 总文章数: ${currentStats.total_stories}`)
    console.log(`- 标题中英文相同: ${currentStats.title_same_as_zh}`)
    console.log(`- 标题中文为空: ${currentStats.title_zh_empty}`)
    console.log(`- 内容中英文相同: ${currentStats.text_same_as_zh}`)
    console.log(`- 内容中文为空: ${currentStats.text_zh_empty}`)
    console.log(`- 已正确翻译: ${currentStats.already_translated}`)
    console.log(``)

    let translatedCount = 0
    for (const story of result.rows) {
      try {
        console.log(`\n正在翻译文章 ${story.hn_id}: ${story.title}`)

        // 翻译标题（只有当标题需要翻译时）
        let titleZh = story.title // 默认保持原文
        if (story.title && (story.title === story.title_zh || !story.title_zh)) {
          const translated = await translateText(story.title)
          if (translated && translated !== story.title) {
            titleZh = translated
            console.log(`标题翻译: ${titleZh}`)
          } else {
            console.log('标题翻译失败或翻译结果与原文相同，跳过')
            continue
          }
        } else {
          console.log('标题已有翻译，跳过')
          continue
        }

        // 翻译内容（如果有的话）
        let textZh = story.text // 默认保持原文
        if (story.text && story.text.trim() && (story.text === story.text_zh || !story.text_zh)) {
          console.log('正在翻译内容...')
          const translatedText = await translateText(story.text)
          if (translatedText && translatedText !== story.text) {
            textZh = translatedText
            console.log(`内容翻译完成，长度: ${textZh.length} 字符`)
          } else {
            console.log('内容翻译失败或与原文相同，保持原文')
            textZh = story.text
          }
        } else if (!story.text) {
          textZh = null
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
        COUNT(title_zh) as translated,
        COUNT(CASE WHEN title_zh IS NOT NULL AND title_zh != '' THEN 1 END) as has_translation
      FROM stories
    `)
    
    const stats = statsResult.rows[0]
    console.log(`\n统计信息:`)
    console.log(`- 总文章数: ${stats.total}`)
    console.log(`- title_zh不为NULL: ${stats.translated}`)
    console.log(`- title_zh有内容: ${stats.has_translation}`)
    console.log(`- 未翻译: ${stats.total - stats.has_translation}`)

    // 查看几个样本
    const sampleResult = await client.query(`
      SELECT title, title_zh 
      FROM stories 
      ORDER BY created_at DESC 
      LIMIT 3
    `)
    
    console.log(`\n样本数据:`)
    sampleResult.rows.forEach((row, i) => {
      console.log(`${i + 1}. 英文: ${row.title}`)
      console.log(`   中文: ${row.title_zh || '(无翻译)'}`)
    })

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