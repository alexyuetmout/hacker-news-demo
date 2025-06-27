# 本地 PostgreSQL 设置指南

## 1. 安装 PostgreSQL

### macOS (推荐使用 Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows

下载并安装 PostgreSQL 官方安装包：https://www.postgresql.org/download/windows/

## 2. 创建数据库和用户

```bash
# 连接到 PostgreSQL
psql postgres

# 创建数据库
CREATE DATABASE hackernews_zh;

# 创建用户（可选，也可以使用默认用户）
CREATE USER hn_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hackernews_zh TO hn_user;

# 退出
\q
```

## 3. 配置环境变量

创建 `.env.local` 文件：

```env
# 本地 PostgreSQL 连接（使用默认用户）
POSTGRES_URL="postgresql://localhost:5432/hackernews_zh"

# 或者使用自定义用户
# POSTGRES_URL="postgresql://hn_user:your_password@localhost:5432/hackernews_zh"

# 翻译服务 API Key（可选）
# TRANSLATION_API_KEY="your_4omini_api_key"

# Cron 任务密钥
CRON_SECRET="local_dev_secret_123"

# 开发环境 URL
NEXTAUTH_URL="http://localhost:3000"
```

## 4. 初始化数据库表结构

```bash
npm run db:push
```

## 5. 同步测试数据

```bash
# 同步 10 篇热门文章
curl "http://localhost:3000/api/sync?type=top&limit=10"

# 同步 5 篇 Ask HN 文章
curl "http://localhost:3000/api/sync?type=ask&limit=5"

# 同步 5 篇 Show HN 文章
curl "http://localhost:3000/api/sync?type=show&limit=5"
```

## 6. 验证数据

```bash
# 连接数据库查看数据
psql postgresql://localhost:5432/hackernews_zh

# 查看表
\dt

# 查看文章数量
SELECT COUNT(*) FROM stories;

# 查看最新文章
SELECT id, title, by, score FROM stories ORDER BY time DESC LIMIT 5;

# 退出
\q
```

## 常见问题

### Q: 连接被拒绝

确保 PostgreSQL 服务正在运行：

```bash
# macOS
brew services restart postgresql

# Ubuntu/Debian
sudo systemctl restart postgresql
```

### Q: 认证失败

检查用户名和密码是否正确，或使用默认连接：

```env
POSTGRES_URL="postgresql://localhost:5432/hackernews_zh"
```

### Q: 数据库不存在

确保已创建数据库：

```bash
createdb hackernews_zh
```

### Q: 权限问题

给用户授权：

```sql
GRANT ALL PRIVILEGES ON DATABASE hackernews_zh TO your_user;
GRANT ALL ON SCHEMA public TO your_user;
```
