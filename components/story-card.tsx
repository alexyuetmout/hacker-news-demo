'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, MessageSquare, TrendingUp, User, Clock } from 'lucide-react'
import { formatTimeAgo, formatScore, getStoryTypeLabel, getStoryTypeColor, truncateText } from '@/lib/utils'
import type { Story } from '@/lib/db'

interface StoryCardProps {
  story: Story
}

export function StoryCard({ story }: StoryCardProps) {
  const title = story.titleZh || story.title
  const content = story.textZh || story.text

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* 标题和类型标签 */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <Link 
                href={`/story/${story.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
              >
                {title}
              </Link>
            </div>
            <Badge 
              variant="secondary" 
              className={getStoryTypeColor(story.type)}
            >
              {getStoryTypeLabel(story.type)}
            </Badge>
          </div>

          {/* 内容预览 */}
          {content && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {truncateText(content, 200)}
            </p>
          )}

          {/* 原文链接 */}
          {story.url && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <a 
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm truncate"
              >
                {new URL(story.url).hostname}
              </a>
            </div>
          )}

          {/* 元数据 */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{story.by}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{formatScore(story.score)} 分</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{story.descendants} 评论</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{formatTimeAgo(story.time)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 