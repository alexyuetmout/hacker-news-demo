const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'

export interface HNItem {
  id: number
  deleted?: boolean
  type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt'
  by?: string
  time?: number
  text?: string
  dead?: boolean
  parent?: number
  poll?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  parts?: number[]
  descendants?: number
}

export class HackerNewsService {
  private async fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Chinese-HackerNews-Bot/1.0'
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) return null // 项目不存在
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        return data
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed for ${url}:`, error)
        if (i === retries - 1) {
          console.error(`All ${retries} attempts failed for ${url}`)
          return null
        }
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
    return null
  }

  private async fetchItem(id: number): Promise<HNItem | null> {
    const item = await this.fetchWithRetry<HNItem>(`${HN_API_BASE}/item/${id}.json`)
    
    // 过滤掉已删除或无效的项目
    if (!item || item.deleted || item.dead) return null
    
    return item
  }

  async getMaxItemId(): Promise<number | null> {
    return await this.fetchWithRetry<number>(`${HN_API_BASE}/maxitem.json`)
  }

  private async fetchStoryIds(endpoint: string): Promise<number[]> {
    const ids = await this.fetchWithRetry<number[]>(`${HN_API_BASE}/${endpoint}.json`)
    return ids || []
  }

  async getTopStories(limit = 500): Promise<number[]> {
    const ids = await this.fetchStoryIds('topstories')
    return ids.slice(0, Math.min(limit, 500)) // API 最多返回 500 个
  }

  async getNewStories(limit = 500): Promise<number[]> {
    const ids = await this.fetchStoryIds('newstories')
    return ids.slice(0, Math.min(limit, 500)) // API 最多返回 500 个
  }

  async getBestStories(limit = 500): Promise<number[]> {
    const ids = await this.fetchStoryIds('beststories')
    return ids.slice(0, Math.min(limit, 500)) // API 最多返回 500 个
  }

  async getAskStories(limit = 200): Promise<number[]> {
    const ids = await this.fetchStoryIds('askstories')
    return ids.slice(0, Math.min(limit, 200)) // API 最多返回 200 个
  }

  async getShowStories(limit = 200): Promise<number[]> {
    const ids = await this.fetchStoryIds('showstories')
    return ids.slice(0, Math.min(limit, 200)) // API 最多返回 200 个
  }

  async getJobStories(limit = 200): Promise<number[]> {
    const ids = await this.fetchStoryIds('jobstories')
    return ids.slice(0, Math.min(limit, 200)) // API 最多返回 200 个
  }

  async getStory(id: number): Promise<HNItem | null> {
    return this.fetchItem(id)
  }

  async getComment(id: number): Promise<HNItem | null> {
    return this.fetchItem(id)
  }

  async getStoryWithComments(id: number): Promise<{
    story: HNItem | null
    comments: HNItem[]
  }> {
    const story = await this.getStory(id)
    if (!story || !story.kids) {
      return { story, comments: [] }
    }

    const comments = await Promise.all(
      story.kids.map(id => this.getComment(id))
    )

    return {
      story,
      comments: comments.filter((c): c is HNItem => c !== null)
    }
  }

  async getAllComments(commentIds: number[]): Promise<HNItem[]> {
    const comments = await Promise.all(
      commentIds.map(id => this.getComment(id))
    )
    return comments.filter((c): c is HNItem => c !== null)
  }

  // 获取最近更新的项目和用户
  async getUpdates(): Promise<{
    items: number[]
    profiles: string[]
  } | null> {
    const updates = await this.fetchWithRetry<{
      items: number[]
      profiles: string[]
    }>(`${HN_API_BASE}/updates.json`)
    
    return updates || { items: [], profiles: [] }
  }

  // 批量获取项目（用于优化性能）
  async getItemsBatch(ids: number[], batchSize = 10): Promise<HNItem[]> {
    const results: HNItem[] = []
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(id => this.fetchItem(id))
      )
      
      results.push(...batchResults.filter((item): item is HNItem => item !== null))
      
      // 避免过于频繁的请求
      if (i + batchSize < ids.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }
} 