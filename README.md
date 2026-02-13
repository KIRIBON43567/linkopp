# AI链机 LINKOPP

> AI Native OPC 社群智能匹配平台

## 项目简介

AI链机（LINKOPP）是一个为 OPC（一人公司）社群打造的 AI 驱动智能匹配平台。通过 AI Agent 自动对话和智能分析，帮助社群成员发现合作机会和资源互补。

### 核心特性

- 🤖 **AI Native 交互**: 对话式信息采集，自然语言优先
- 🔗 **智能匹配**: AI Agent 自动对话，分析合作潜力
- 📊 **深度分析**: 匹配度评分、需求满足度、技能互补性分析
- 📱 **移动优先**: 响应式设计，完美适配手机端
- ⚡ **极速部署**: Cloudflare 全栈，全球 CDN 加速

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **AI**: VectorEngine AI (Gemini 3 Flash/Pro)
- **认证**: JWT + bcryptjs

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量（创建 .dev.vars 文件）
VECTORENGINE_API_KEY=your-api-key
JWT_SECRET=your-secret-key

# 初始化数据库
npx tsx worker/db/init.ts

# 启动开发服务器
npm run dev
```

### 部署到 Cloudflare

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 功能模块

1. **用户认证** - 账号密码注册/登录，JWT Token 认证
2. **AI 信息采集** - 多轮对话式引导，智能问题生成
3. **用户画像** - 公司信息、技能资源、需求目标管理
4. **智能推荐** - AI 驱动的匹配算法，个性化推荐
5. **Agent 匹配** - 双 Agent 自动对话，深度分析合作潜力
6. **对话记录** - 完整对话历史，匹配结果详情

## 项目结构

```
linkopp-cloudflare/
├── src/                    # 前端源码
│   ├── pages/             # 页面组件
│   ├── utils/             # 工具函数
│   └── App.tsx            # 应用入口
├── worker/                 # 后端源码
│   ├── api/               # API 模块
│   ├── db/                # 数据库
│   └── index.ts           # Worker 入口
├── wrangler.jsonc         # Cloudflare 配置
└── package.json           # 项目配置
```

## 许可证

MIT License

---

Made with ❤️ for OPC Community
