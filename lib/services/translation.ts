import OpenAI from "openai"

export class TranslationService {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    const baseURL = process.env.OPENAI_BASE_URL || "https://oneapi.gptnb.ai/v1"

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        baseURL
      })
    } else {
      console.warn('No OpenAI API key found. Translation will be skipped.')
    }
  }

  async translateText(text: string, fromLang = 'en', toLang = 'zh'): Promise<string> {
    if (!text || !this.openai) return text

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: false,
        messages: [
          { 
            role: "system", 
            content: `你是一个专业的翻译助手。请将用户提供的文本从${fromLang === 'en' ? '英文' : fromLang}翻译成${toLang === 'zh' ? '中文' : toLang}。要求：
1. 保持原文的语气和风格
2. 技术术语保持准确性
3. 只返回翻译结果，不要添加任何解释
4. 如果是代码、链接或特殊格式，请保持原样`
          },
          { 
            role: "user", 
            content: text 
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })

      const translatedText = completion.choices[0]?.message?.content?.trim()
      return translatedText || text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  async translateBatch(texts: string[], fromLang = 'en', toLang = 'zh'): Promise<string[]> {
    if (!texts.length || !this.openai) return texts

    try {
      // 批量翻译：将多个文本合并为一个请求
      const combinedText = texts.map((text, index) => `[${index}]${text}`).join('\n\n')
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: false,
        messages: [
          { 
            role: "system", 
            content: `你是一个专业的翻译助手。请将用户提供的文本从${fromLang === 'en' ? '英文' : fromLang}翻译成${toLang === 'zh' ? '中文' : toLang}。

文本格式为：[索引]文本内容，每个文本之间用两个换行符分隔。

要求：
1. 保持原文的语气和风格
2. 技术术语保持准确性
3. 保持相同的索引格式：[0]翻译后的文本1，[1]翻译后的文本2
4. 如果是代码、链接或特殊格式，请保持原样`
          },
          { 
            role: "user", 
            content: combinedText 
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      })

      const result = completion.choices[0]?.message?.content?.trim()
      if (!result) return texts

      // 解析批量翻译结果
      const translatedTexts: string[] = []
      const lines = result.split('\n\n')
      
      for (let i = 0; i < texts.length; i++) {
        const line = lines.find(l => l.startsWith(`[${i}]`))
        if (line) {
          translatedTexts[i] = line.substring(`[${i}]`.length).trim()
        } else {
          translatedTexts[i] = texts[i] // 如果解析失败，使用原文
        }
      }

      return translatedTexts
    } catch (error) {
      console.error('Batch translation error:', error)
      // 如果批量翻译失败，逐个翻译
      const results = await Promise.all(
        texts.map(text => this.translateText(text, fromLang, toLang))
      )
      return results
    }
  }

  // 智能翻译：检测是否需要翻译（避免重复翻译中文内容）
  private containsChinese(text: string): boolean {
    return /[\u4e00-\u9fff]/.test(text)
  }

  async smartTranslate(text: string): Promise<string> {
    if (!text || this.containsChinese(text)) {
      return text
    }
    return this.translateText(text)
  }

  async smartTranslateBatch(texts: string[]): Promise<string[]> {
    const textsToTranslate: { index: number; text: string }[] = []
    const results = [...texts]

    texts.forEach((text, index) => {
      if (text && !this.containsChinese(text)) {
        textsToTranslate.push({ index, text })
      }
    })

    if (textsToTranslate.length === 0) return texts

    const translatedTexts = await this.translateBatch(
      textsToTranslate.map(item => item.text)
    )

    textsToTranslate.forEach((item, i) => {
      results[item.index] = translatedTexts[i] || item.text
    })

    return results
  }
} 