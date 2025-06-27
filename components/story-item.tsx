'use client'

import Link from 'next/link'
import { ExternalLink, MessageSquare, TrendingUp, User, Clock } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import type { Story } from '@/lib/db'

interface StoryItemProps {
  story: Story
  index: number
}

export function StoryItem({ story, index }: StoryItemProps) {
  const title = story.titleZh || story.title
  const displayIndex = (index + 1).toString().padStart(2, '0')

  return (
    <div className="py-2 px-1">
      <div className="flex items-start gap-3">
        {/* 序号 */}
        <span className="text-sm text-gray-400 font-mono mt-1 w-7 flex-shrink-0 text-right">
          {displayIndex}.
        </span>

        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="mb-1">
            <Link 
              href={`/story/${story.id}`}
              className="text-gray-900 hover:text-blue-600 font-medium text-sm leading-tight mr-2"
            >
              {title}
            </Link>
            {story.url && (
              <>
                <span className="text-gray-400 text-xs">
                  (
                </span>
                <a 
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 text-xs"
                  title="访问原文"
                >
                  {new URL(story.url).hostname}
                </a>
                <span className="text-gray-400 text-xs">
                  )
                </span>
                <a 
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 ml-1"
                  title="访问原文"
                >
                  <ExternalLink className="h-3 w-3 inline" />
                </a>
              </>
            )}
          </div>

          {/* 元数据行 */}
          <div className="text-xs text-gray-500 space-x-3">
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {story.score} 分
            </span>
            
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {story.by}
            </span>
            
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(story.time)}
            </span>
            
            <Link 
              href={`/story/${story.id}`}
              className="inline-flex items-center gap-1 hover:text-blue-600"
            >
              <MessageSquare className="h-3 w-3" />
              {story.descendants} 评论
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 