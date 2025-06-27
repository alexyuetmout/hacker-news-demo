'use client'

import StoryCard from './story-card'
import type { Story } from '@/lib/db'

interface StoryListProps {
  stories: Story[]
}

export default function StoryList({ stories }: StoryListProps) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">暂无故事</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
} 