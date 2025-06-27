import { pgTable, serial, varchar, text, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core'

export const stories = pgTable('stories', {
  id: serial('id').primaryKey(),
  hnId: integer('hn_id').notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  titleZh: varchar('title_zh', { length: 500 }),
  url: text('url'),
  text: text('text'),
  textZh: text('text_zh'),
  by: varchar('by', { length: 100 }).notNull(),
  score: integer('score').default(0),
  descendants: integer('descendants').default(0),
  time: timestamp('time').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  deleted: boolean('deleted').default(false),
  dead: boolean('dead').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  hnIdIdx: index('stories_hn_id_idx').on(table.hnId),
  typeIdx: index('stories_type_idx').on(table.type),
  scoreIdx: index('stories_score_idx').on(table.score),
  timeIdx: index('stories_time_idx').on(table.time),
}))

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  hnId: integer('hn_id').notNull().unique(),
  parentId: integer('parent_id'),
  storyId: integer('story_id').notNull(),
  text: text('text'),
  textZh: text('text_zh'),
  by: varchar('by', { length: 100 }).notNull(),
  time: timestamp('time').notNull(),
  deleted: boolean('deleted').default(false),
  dead: boolean('dead').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  hnIdIdx: index('comments_hn_id_idx').on(table.hnId),
  parentIdx: index('comments_parent_id_idx').on(table.parentId),
  storyIdx: index('comments_story_id_idx').on(table.storyId),
  timeIdx: index('comments_time_idx').on(table.time),
}))

export const translations = pgTable('translations', {
  id: serial('id').primaryKey(),
  originalText: text('original_text').notNull(),
  translatedText: text('translated_text').notNull(),
  sourceType: varchar('source_type', { length: 20 }).notNull(), // 'story_title', 'story_text', 'comment'
  sourceId: integer('source_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  sourceIdx: index('translations_source_idx').on(table.sourceType, table.sourceId),
}))

export type Story = typeof stories.$inferSelect
export type NewStory = typeof stories.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Translation = typeof translations.$inferSelect
export type NewTranslation = typeof translations.$inferInsert 