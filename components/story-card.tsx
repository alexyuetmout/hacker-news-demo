'use client'

import Link from 'next/link'
import { formatScore, formatTimeAgo } from '@/lib/utils'
import type { Story } from '@/lib/db'

interface StoryCardProps {
  story: Story
}

export default function StoryCard({ story }: StoryCardProps) {
  const displayTitle = story.titleZh || story.title
  
  return (
    <article className="card">
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold leading-snug">
          <Link 
            href={`/story/${story.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {displayTitle}
          </Link>
        </h3>

        {/* Meta information */}
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {formatScore(story.score || 0)}
          </span>
          
          <span>by {story.by}</span>
          
          <span>{formatTimeAgo(story.time)}</span>
          
          {story.descendants !== null && story.descendants !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {story.descendants}
            </span>
          )}
        </div>

        {/* External link if available */}
        {story.url && (
          <div className="flex items-center gap-2">
            <a 
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              原文链接
            </a>
            <span className="text-muted text-xs">
              {new URL(story.url).hostname}
            </span>
          </div>
        )}

        {/* Type badge */}
        {story.type && (
          <div className="flex">
            <span className={`badge ${story.type === 'job' ? 'badge-primary' : ''}`}>
              {story.type === 'job' ? '招聘' : story.type}
            </span>
          </div>
        )}
      </div>
    </article>
  )
} 