# 中文黑客新闻 - Hacker News 中文版

基于 Hacker News API 的中文内容展示平台，通过 OpenAI 兼容翻译服务自动翻译为中文，为中文用户提供高质量的技术资讯和讨论内容。

## 项目特点

- 🌏 **全中文界面**：所有内容通过 AI 翻译服务自动翻译为中文
- ⚡ **高性能**：使用 Next.js 14 SSR/ISR 技术，确保快速加载
- 🎨 **现代化 UI**：基于 shadcn/ui 组件库，响应式设计
- 🔄 **自动更新**：通过 Vercel Cron Jobs 每小时自动同步最新内容
- 📱 **移动端优化**：完美适配手机和平板设备
- 🔍 **智能搜索**：支持中英文搜索，快速找到相关内容

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **UI 组件**：shadcn/ui + Tailwind CSS
- **图标库**：Lucide Icons
- **数据库**：PostgreSQL + Drizzle ORM
- **翻译服务**：OpenAI 兼容 API (gpt-4o-mini)
- **部署平台**：Vercel
- **语言**：TypeScript

## 功能特性

### 首页展示

- 展示热门文章、最新文章和评分最高的文章
- 支持分页加载，用户体验流畅
- 显示文章分数、评论数、发布时间等元信息

### 分类浏览

- **Ask HN**：问答类文章
- **Show HN**：项目展示类文章
- **Job**：招聘信息
- **Story**：一般技术文章

### 文章详情

- 完整的文章内容（如有）
- 嵌套评论树结构
- 所有内容均翻译为中文
- 原文链接跳转

### 搜索功能

- 支持中英文关键词搜索
- 搜索文章标题和内容
- 实时搜索结果

### 数据同步

- 每小时自动同步热门文章
- 每 2 小时同步最新文章
- 每 3 小时同步 Ask HN 和 Show HN
- 每 6 小时同步招聘信息

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库（可选，开发时可先跳过）
- OpenAI 兼容 API Key（可选，开发时会跳过翻译）

### 1. 克隆并安装依赖

```bash
git clone <your-repo>
cd hacker-news-demo
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
# 数据库配置（生产环境必需）
DATABASE_URL="postgresql://username:password@host:port/database"

# OpenAI 兼容翻译服务配置（可选，开发时不配置会跳过翻译）
OPENAI_API_KEY="your_openai_compatible_api_key_here"
OPENAI_BASE_URL="https://oneapi.gptnb.ai/v1"  # 或其他兼容API的地址

# Cron 任务密钥（生产环境必需）
CRON_SECRET="your_random_secret_key_here"

# 开发环境 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 数据库设置

**选项 A：使用 Vercel Postgres（推荐）**

1. 在 Vercel 创建 Postgres 数据库
2. 复制连接字符串到 `DATABASE_URL`
3. 运行：`npm run db:push`

**选项 B：本地 PostgreSQL**

1. 安装并启动 PostgreSQL
2. 创建数据库：`createdb hackernews_zh`
3. 配置 `DATABASE_URL`
4. 运行：`npm run db:push`

**选项 C：跳过数据库（仅查看 UI）**

- 暂时跳过此步骤，直接启动开发服务器

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看效果

### 5. 手动同步测试数据

配置数据库后，可以手动同步一些测试数据：

```bash
# 同步 10 篇热门文章（开发环境）
curl "http://localhost:3000/api/sync?type=top&limit=10"

# 同步 5 篇 Ask HN 文章
curl "http://localhost:3000/api/sync?type=ask&limit=5"
```

### 开发模式说明

- **无数据库**：页面会显示"暂无文章"，但可以查看 UI 设计
- **无翻译 API**：会显示英文原文，不影响功能测试
- **有数据库但无数据**：需要手动同步数据才能看到内容

## 本地完整体验设置

### macOS 本地 PostgreSQL 设置

如果你使用 macOS 并想体验完整功能：

```bash
# 1. 安装 PostgreSQL（如果还没安装）
brew install postgresql

# 2. 启动 PostgreSQL 服务
brew services start postgresql

# 3. 创建数据库
createdb hackernews_zh

# 4. 配置环境变量（.env.local）
DATABASE_URL="postgresql://$(whoami):@localhost:5432/hackernews_zh"
OPENAI_API_KEY="your_api_key_here"
OPENAI_BASE_URL="https://oneapi.gptnb.ai/v1"

# 5. 推送数据库结构
npm run db:push

# 6. 同步测试数据
curl "http://localhost:3000/api/sync?type=top&limit=10"
curl "http://localhost:3000/api/sync?type=ask&limit=5"
curl "http://localhost:3000/api/sync?type=show&limit=5"
```

现在访问 http://localhost:3000 就能看到完整的中文界面和翻译功能了！

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 设置 PostgreSQL 数据库（推荐使用 Vercel Postgres 或 Supabase）
5. 部署完成后，Cron Jobs 将自动开始工作

## 数据库架构

### Stories 表

- 存储文章信息，包括原文和翻译后的标题、内容
- 支持按分数、时间、类型查询和排序

### Comments 表

- 存储评论信息，支持嵌套结构
- 同样包含原文和翻译后的内容

### Translations 表

- 缓存翻译结果，避免重复翻译
- 提高翻译服务调用效率

## API 接口

### 获取文章列表

```
GET /api/stories?type=all&page=1&limit=20
```

### 搜索文章

```
GET /api/stories?search=关键词&page=1&limit=20
```

### 获取文章详情

```
GET /api/stories/[id]
```

### 手动同步数据

```
POST /api/sync?type=top&limit=50
Authorization: Bearer <CRON_SECRET>
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 发起 Pull Request

## 项目成果

✅ **已完成功能**

- [x] 完整的前端界面设计（shadcn/ui + Tailwind CSS）
- [x] Hacker News API 数据获取和同步
- [x] PostgreSQL 数据库设计和 ORM 配置
- [x] OpenAI 兼容翻译服务集成（文章标题、内容、评论）
- [x] 文章列表、详情页、搜索功能
- [x] 评论树状结构显示
- [x] 响应式设计，移动端友好
- [x] 自动数据同步 API（支持 Vercel Cron Jobs）
- [x] 本地开发环境完整配置

✅ **翻译效果**

- 文章标题中英对照
- 完整评论翻译（支持技术术语）
- 智能检测，避免重复翻译

✅ **性能优化**

- Next.js SSR/ISR 缓存策略
- 数据库索引优化
- 批量翻译减少 API 调用

## 许可证

MIT License
