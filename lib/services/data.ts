import { db, stories, comments, translations, type Story, type Comment, type NewStory, type NewComment } from '@/lib/db'
import { eq, desc, and, or, ilike, count, gt, max } from 'drizzle-orm'
import { HackerNewsService, type HNItem } from './hacker-news'
import { TranslationService } from './translation'

export class DataService {
  private hnService = new HackerNewsService()
  private translationService = new TranslationService()

  // 获取文章列表
  async getStories(source?: string, page = 1, limit = 20): Promise<{
    stories: Story[]
    total: number
    hasMore: boolean
  }> {
    try {
      if (!db) {
        throw new Error('Database not connected')
      }

      const offset = (page - 1) * limit
      
      // 构建 where 条件
      const whereConditions = [
        eq(stories.deleted, false),
        eq(stories.dead, false)
      ]
      
      if (source && source !== 'all') {
        whereConditions.push(eq(stories.source, source))
      }
      
      const result = await db.select().from(stories)
        .where(and(...whereConditions))
        .orderBy(desc(stories.score), desc(stories.time))
        .limit(limit)
        .offset(offset)

      const [{ count: total }] = await db.select({ count: count() }).from(stories)
        .where(and(...whereConditions))

      return {
        stories: result,
        total,
        hasMore: total > offset + limit
      }
    } catch (error) {
      console.warn('Database not connected, returning empty results:', error instanceof Error ? error.message : error)
      return {
        stories: [],
        total: 0,
        hasMore: false
      }
    }
  }

  // 获取单个文章详情
  async getStoryById(id: number): Promise<Story | null> {
    try {
      if (!db) {
        console.warn('Database not connected')
        return null
      }
      const result = await db.select().from(stories).where(eq(stories.id, id)).limit(1)
      return result[0] || null
    } catch (error) {
      console.warn('Database not connected, returning null:', error instanceof Error ? error.message : error)
      return null
    }
  }

  // 获取单个文章详情（通过 HN ID）
  async getStoryByHnId(hnId: number): Promise<Story | null> {
    try {
      if (!db) {
        console.warn('Database not connected')
        return null
      }
      const result = await db.select().from(stories).where(eq(stories.hnId, hnId)).limit(1)
      return result[0] || null
    } catch (error) {
      console.warn('Database not connected, returning null:', error instanceof Error ? error.message : error)
      return null
    }
  }

  // 获取文章的评论
  async getCommentsByStoryId(storyId: number): Promise<Comment[]> {
    try {
      if (!db) {
        console.warn('Database not connected, returning empty comments')
        return []
      }
      
      console.log('Searching for comments with storyId:', storyId)
      
      const result = await db.select().from(comments)
        .where(and(
          eq(comments.storyId, storyId),
          eq(comments.deleted, false),
          eq(comments.dead, false)
        ))
        .orderBy(comments.time)
        
      console.log('Found comments:', result.length)
      
      return result
    } catch (error) {
      console.warn('Database error getting comments:', error instanceof Error ? error.message : error)
      return []
    }
  }

  // 搜索文章
  async searchStories(query: string, page = 1, limit = 20): Promise<{
    stories: Story[]
    total: number
    hasMore: boolean
  }> {
    try {
      if (!db) {
        console.warn('Database not connected')
        return { stories: [], total: 0, hasMore: false }
      }

      const offset = (page - 1) * limit
      
      const searchPattern = `%${query}%`
      
      const result = await db.select().from(stories)
        .where(and(
          or(
            ilike(stories.titleZh, searchPattern),
            ilike(stories.title, searchPattern),
            ilike(stories.textZh, searchPattern),
            ilike(stories.text, searchPattern)
          ),
          eq(stories.deleted, false),
          eq(stories.dead, false)
        ))
        .orderBy(desc(stories.score), desc(stories.time))
        .limit(limit)
        .offset(offset)

      const [{ count: total }] = await db.select({ count: count() }).from(stories)
        .where(and(
          or(
            ilike(stories.titleZh, searchPattern),
            ilike(stories.title, searchPattern),
            ilike(stories.textZh, searchPattern),
            ilike(stories.text, searchPattern)
          ),
          eq(stories.deleted, false),
          eq(stories.dead, false)
        ))

      return {
        stories: result,
        total,
        hasMore: total > offset + limit
      }
    } catch (error) {
      console.warn('Database not connected, returning empty search results:', error instanceof Error ? error.message : error)
      return {
        stories: [],
        total: 0,
        hasMore: false
      }
    }
  }

  // 更新文章数据
  async updateStoriesFromHN(type: 'top' | 'new' | 'best' | 'ask' | 'show' | 'job', limit = 50): Promise<void> {
    let storyIds: number[] = []
    
    // 注意：ask 和 show 类型的文章在 HN API 中实际类型仍然是 'story'
    // 只是通过不同的端点获取，job 是真正的 'job' 类型
    switch (type) {
      case 'top':
        storyIds = await this.hnService.getTopStories(limit)
        break
      case 'new':
        storyIds = await this.hnService.getNewStories(limit)
        break
      case 'best':
        storyIds = await this.hnService.getBestStories(limit)
        break
      case 'ask':
        storyIds = await this.hnService.getAskStories(limit)
        break
      case 'show':
        storyIds = await this.hnService.getShowStories(limit)
        break
      case 'job':
        storyIds = await this.hnService.getJobStories(limit)
        break
    }

    for (const id of storyIds) {
      await this.syncStory(id, type)
    }
  }

  // 同步单个文章
  private async syncStory(hnId: number, source: string): Promise<void> {
    try {
      const hnItem = await this.hnService.getStory(hnId)
      if (!hnItem || hnItem.deleted || hnItem.dead || !hnItem.by || !hnItem.time) return

      const existingStory = await this.getStoryByHnId(hnId)
      
      // 处理 HTML 内容并翻译
      const cleanTitle = this.stripHtml(hnItem.title || '')
      const cleanText = hnItem.text ? this.stripHtml(hnItem.text) : null
      
      const titleZh = await this.translationService.smartTranslate(cleanTitle)
      const textZh = cleanText ? await this.translationService.smartTranslate(cleanText) : null

      const storyData: NewStory = {
        hnId: hnItem.id,
        title: cleanTitle,
        titleZh,
        url: hnItem.url || null,
        text: cleanText,
        textZh,
        by: hnItem.by,
        score: hnItem.score || 0,
        descendants: hnItem.descendants || 0,
        time: new Date(hnItem.time * 1000), // 转换 Unix 时间戳
        type: hnItem.type || 'story',
        source, // 记录来源
        deleted: hnItem.deleted || false,
        dead: hnItem.dead || false,
        updatedAt: new Date(),
      }

      if (existingStory) {
        if (db) {
          await db.update(stories).set(storyData).where(eq(stories.hnId, hnId))
        }
      } else {
        if (db) {
          await db.insert(stories).values(storyData)
        }
      }

      // 同步评论
      if (hnItem.kids && hnItem.kids.length > 0) {
        await this.syncComments(hnItem.kids, hnId)
      }
    } catch (error) {
      console.error(`Error syncing story ${hnId}:`, error)
    }
  }

  // 同步评论
  private async syncComments(commentIds: number[], storyHnId: number): Promise<void> {
    const story = await this.getStoryByHnId(storyHnId)
    if (!story) return

    for (const commentId of commentIds) {
      await this.syncComment(commentId, story.id, null)
    }
  }

  // 同步单个评论
  private async syncComment(hnId: number, storyId: number, parentId: number | null): Promise<void> {
    try {
      if (!db) {
        console.warn('Database not connected')
        return
      }
      
      const hnItem = await this.hnService.getComment(hnId)
      if (!hnItem || hnItem.deleted || hnItem.dead || !hnItem.by || !hnItem.time) return

      const existingComment = await db.select().from(comments).where(eq(comments.hnId, hnId)).limit(1)
      
      // 处理 HTML 内容并翻译
      const cleanText = hnItem.text ? this.stripHtml(hnItem.text) : null
      const textZh = cleanText ? await this.translationService.smartTranslate(cleanText) : null

      const commentData = {
        hnId: hnItem.id,
        parentId,
        storyId,
        text: cleanText,
        textZh,
        by: hnItem.by,
        time: new Date(hnItem.time * 1000), // 转换 Unix 时间戳
        deleted: hnItem.deleted || false,
        dead: hnItem.dead || false,
        updatedAt: new Date(),
      }

      if (existingComment.length > 0) {
        if (db) {
          await db.update(comments).set(commentData).where(eq(comments.hnId, hnId))
        }
      } else {
        if (db) {
          await db.insert(comments).values(commentData)
        }
      }

      // 递归同步子评论
      if (hnItem.kids && hnItem.kids.length > 0) {
        for (const childId of hnItem.kids) {
          await this.syncComment(childId, storyId, hnId)
        }
      }
    } catch (error) {
      console.error(`Error syncing comment ${hnId}:`, error)
    }
  }

  // HTML 清理方法
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/&quot;/g, '"') // 解码 HTML 实体
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()
  }

  // 获取最新更新时间
  async getLastUpdateTime(): Promise<Date | null> {
    try {
      if (!db) {
        console.warn('Database not connected')
        return null
      }
      const result = await db.select({ updatedAt: stories.updatedAt })
        .from(stories)
        .orderBy(desc(stories.updatedAt))
        .limit(1)
      return result[0]?.updatedAt || null
    } catch (error) {
      console.warn('Database not connected, returning null update time:', error instanceof Error ? error.message : error)
      return null
    }
  }

  // 获取数据库中最大的 HN ID
  async getLastKnownItemId(): Promise<number | null> {
    try {
      if (!db) {
        console.warn('Database not connected')
        return null
      }
      const result = await db.select({ maxHnId: max(stories.hnId) }).from(stories)
      return result[0]?.maxHnId || null
    } catch (error) {
      console.warn('Database not connected, returning null max item id:', error instanceof Error ? error.message : error)
      return null
    }
  }

  // 更新最后已知的 item ID（这里我们用更新时间戳的方式来追踪）
  async updateLastKnownItemId(itemId: number): Promise<void> {
    if (!db) {
      console.warn('Database not connected')
      return
    }
    // 这里只是存储最新的item id，实际实现可能需要专门的表
    // 暂时不做实际操作
  }

  // 批量保存文章（用于增量同步）
  async saveStory(storyData: {
    hn_id: number
    title: string
    url?: string | null
    text?: string | null
    by: string
    score: number
    descendants: number
    time: number
    type: string
    source: string
    deleted: boolean
    dead: boolean
  }): Promise<void> {
    if (!db) {
      console.warn('Database not connected')
      return
    }

    try {
      // 创建符合数据库schema的数据结构
      const newStory: NewStory = {
        hnId: storyData.hn_id,
        title: storyData.title,
        titleZh: null, // 稍后翻译
        url: storyData.url || null,
        text: storyData.text || null,
        textZh: null, // 稍后翻译
        by: storyData.by,
        score: storyData.score,
        descendants: storyData.descendants,
        time: new Date(storyData.time * 1000), // Unix 时间戳转换
        type: storyData.type,
        source: storyData.source,
        deleted: storyData.deleted,
        dead: storyData.dead,
        updatedAt: new Date(),
      }

      await db.insert(stories).values(newStory)
    } catch (error) {
      console.error('Error saving story:', error)
      throw error
    }
  }
}

// 简化的按类型获取文章函数（用于首页）
export async function getStoriesByType(type: string, limit = 10): Promise<Story[]> {
  try {
    if (!db) {
      console.warn('Database not connected')
      return []
    }

    let result: Story[]

    if (type === 'best') {
      // 使用评分和时间综合排序来模拟 "best"
      result = await db.select().from(stories)
        .where(and(
          eq(stories.deleted, false),
          eq(stories.dead, false),
          gt(stories.score, 5) // 只获取评分 > 5 的
        ))
        .orderBy(desc(stories.score), desc(stories.time))
        .limit(limit)
    } else {
      result = await db.select().from(stories)
        .where(and(
          eq(stories.source, type),
          eq(stories.deleted, false),
          eq(stories.dead, false)
        ))
        .orderBy(desc(stories.time))
        .limit(limit)
    }

    return result
  } catch (error) {
    console.warn(`Database error for type ${type}, returning empty results:`, error instanceof Error ? error.message : error)
    return []
  }
}

// 优化的首页数据获取函数 - 串行执行减少并发连接
export async function getHomePageData(): Promise<{
  topStories: Story[]
  newStories: Story[]
  askStories: Story[]
}> {
  try {
    // 串行执行，减少并发连接数
    const topStories = await getStoriesByType('top', 10)
    await new Promise(resolve => setTimeout(resolve, 100)) // 短暂延迟
    
    const newStories = await getStoriesByType('new', 5)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const askStories = await getStoriesByType('ask', 5)
    
    return { topStories, newStories, askStories }
  } catch (error) {
    console.warn('Error getting home page data:', error instanceof Error ? error.message : error)
    return { topStories: [], newStories: [], askStories: [] }
  }
} 