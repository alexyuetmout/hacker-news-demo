import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { 
    addSuffix: true,
    locale: {
      formatDistance: (token, count) => {
        const formatDistanceLocale = {
          lessThanXSeconds: '刚刚',
          xSeconds: `{{count}} 秒前`,
          halfAMinute: '半分钟前',
          lessThanXMinutes: '1 分钟前',
          xMinutes: `{{count}} 分钟前`,
          aboutXHours: `约 {{count}} 小时前`,
          xHours: `{{count}} 小时前`,
          xDays: `{{count}} 天前`,
          aboutXWeeks: `约 {{count}} 周前`,
          xWeeks: `{{count}} 周前`,
          aboutXMonths: `约 {{count}} 个月前`,
          xMonths: `{{count}} 个月前`,
          aboutXYears: `约 {{count}} 年前`,
          xYears: `{{count}} 年前`,
          overXYears: `超过 {{count}} 年前`,
          almostXYears: `将近 {{count}} 年前`,
        }
        
        const result = formatDistanceLocale[token]
        return result.replace('{{count}}', count.toString())
      }
    }
  })
}

export function formatScore(score: number): string {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`
  }
  return score.toString()
}

export function getStoryTypeLabel(type: string): string {
  switch (type) {
    case 'job':
      return '招聘'
    case 'story':
      return '文章'
    case 'comment':
      return '评论'
    case 'poll':
      return '投票'
    default:
      return '其他'
  }
}

export function getCategoryLabel(source: string): string {
  switch (source) {
    case 'top':
      return '热门'
    case 'new':
      return '最新'
    case 'best':
      return '最佳'
    case 'ask':
      return '问答'
    case 'show':
      return '展示'
    case 'job':
      return '工作'
    default:
      return '其他'
  }
}

export function getStoryTypeColor(type: string): string {
  switch (type) {
    case 'job':
      return 'bg-purple-100 text-purple-800'
    case 'story':
      return 'bg-gray-100 text-gray-800'
    case 'comment':
      return 'bg-blue-100 text-blue-800'
    case 'poll':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
} 