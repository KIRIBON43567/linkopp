# AI链机 LINKOPP - 部署文档

## 项目概述

AI链机（LINKOPP）是一个 AI Native 的 OPC 社群智能匹配平台，使用 Cloudflare Workers + D1 + Pages 全栈架构。

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS + React Router
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **AI**: VectorEngine AI (Gemini 3 Flash/Pro)
- **认证**: JWT
- **部署**: Cloudflare Pages + Workers

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.dev.vars` 文件：

```
VECTORENGINE_API_KEY=sk-wPQgdsL67lZAmlArEMnmr9gH1BgYX7S3KiBVyoCVXCOUGEIg
VECTORENGINE_API_URL=https://api.vectorengine.ai/v1
JWT_SECRET=your-secret-key-change-in-production
```

### 3. 初始化数据库

```bash
npx tsx worker/db/init.ts
```

### 4. 启动开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5173` 运行
Worker API 将在 `http://localhost:8787` 运行

## Cloudflare 部署

### 前置要求

1. Cloudflare 账号
2. Wrangler CLI: `npm install -g wrangler`
3. 登录 Cloudflare: `wrangler login`

### 1. 创建 D1 数据库

```bash
wrangler d1 create linkopp-db
```

记录返回的 `database_id`，更新 `wrangler.jsonc`:

```jsonc
{
  "name": "linkopp-cloudflare",
  "main": "worker/index.ts",
  "compatibility_date": "2026-02-12",
  "assets": {
    "not_found_handling": "single-page-application"
  },
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "linkopp-db",
      "database_id": "YOUR_DATABASE_ID"
    }
  ]
}
```

### 2. 初始化 D1 数据库

```bash
wrangler d1 execute linkopp-db --file=worker/db/schema.sql
```

### 3. 配置环境变量（Secrets）

```bash
wrangler secret put VECTORENGINE_API_KEY
wrangler secret put VECTORENGINE_API_URL
wrangler secret put JWT_SECRET
```

### 4. 部署到 Cloudflare

```bash
npm run deploy
```

部署成功后，你的应用将在 `https://linkopp-cloudflare.YOUR_SUBDOMAIN.workers.dev` 可用。

### 5. 配置自定义域名（可选）

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择你的项目
3. 点击 "Custom Domains"
4. 添加你的域名

## 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `VECTORENGINE_API_KEY` | VectorEngine AI API 密钥 | 是 |
| `VECTORENGINE_API_URL` | VectorEngine AI API 地址 | 是 |
| `JWT_SECRET` | JWT 签名密钥（生产环境必须更改） | 是 |

## API 端点

### 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### AI 对话 API

- `POST /api/ai/chat` - AI 对话
- `POST /api/ai/onboarding` - 信息采集对话

### 用户画像 API

- `GET /api/profile` - 获取用户画像
- `PUT /api/profile` - 更新用户画像

### 社群成员 API

- `GET /api/members` - 获取社群成员列表

### 匹配 API

- `POST /api/match/create` - 创建匹配请求
- `GET /api/match/history` - 获取匹配历史
- `GET /api/match/:id` - 获取匹配详情

## 数据库 Schema

详见 `worker/db/schema.sql`

主要表：
- `users` - 用户表
- `user_profiles` - 用户画像表
- `conversations` - 对话记录表
- `match_requests` - 匹配请求表

## 故障排查

### 1. 数据库连接失败

确保 D1 数据库已正确配置在 `wrangler.jsonc` 中，并且已执行初始化脚本。

### 2. AI API 调用失败

检查 `VECTORENGINE_API_KEY` 是否正确配置，并且有足够的配额。

### 3. CORS 错误

Worker 已配置 CORS 头，如果仍有问题，检查请求的 Origin。

## 监控和日志

在 Cloudflare Dashboard 中查看：
- Workers Analytics - 请求统计
- Logs - 实时日志
- D1 Analytics - 数据库查询统计

## 性能优化

1. **D1 查询优化**: 使用索引，避免全表扫描
2. **AI 调用优化**: 缓存常见对话，减少 API 调用
3. **CDN 缓存**: 静态资源自动通过 Cloudflare CDN 分发

## 安全建议

1. 定期更新 `JWT_SECRET`
2. 实施速率限制防止滥用
3. 定期备份 D1 数据库
4. 监控异常 API 调用

## 支持

- GitHub: https://github.com/KIRIBON43567/linkopp
- 问题反馈: 在 GitHub Issues 中提交

## 许可证

MIT License
