# AI链机 LINKOPP

> AI Native OPC 社群智能匹配平台

一个真正的 AI Native 产品，让你的 AI Agent 代表你自动寻找合作伙伴，建立有价值的连接。

## 🌟 核心特性

### 1. AI 引导式信息采集
- 通过自然对话完成个人画像构建
- 三阶段采集：基本信息、技能资源、需求目标
- 智能提取关键信息，无需填写表单

### 2. 用户与 Agent 对话 🆕
- **与自己的 AI Agent 对话**，像和朋友聊天一样
- 通过对话更新个人画像（技能、资源、需求）
- 通过对话设置社交策略（频率、偏好）
- Agent 理解你的意图并自动执行

### 3. Agent 自动社交 🆕
- **每天自动匹配**指定数量的合适人选（上限 10 次）
- 智能推荐算法：基于画像相似度和需求互补性
- 自动执行 Agent 对话和匹配分析
- 实时统计：今日已用次数、总匹配数、成功率

### 4. AI Agent 一对一匹配
- 双方 Agent 自动进行 5-8 轮对话
- 探索合作可能性和资源互补度
- 生成详细的匹配分析报告

### 5. 智能匹配分析
- 匹配度评分（0-100）
- 需求满足度、技能互补性、合作意愿分析
- 协作领域识别、潜在合作方向建议

## 🚀 快速开始

\`\`\`bash
# 安装依赖
pnpm install

# 初始化数据库
npx tsx worker/db/init.ts

# 启动开发
pnpm dev
\`\`\`

## 📁 项目结构

\`\`\`
src/pages/          # 前端页面
  ├── AgentChat.tsx          # 用户与 Agent 对话 🆕
  ├── AutoSocialSettings.tsx # 自动社交设置 🆕
  └── ...
worker/api/         # 后端 API
  ├── agent.ts               # Agent 对话 API 🆕
  ├── autoSocial.ts          # 自动社交 API 🆕
  └── ...
\`\`\`

## 🔌 新增 API 端点

- \`POST /api/agent/chat\` - 与 Agent 对话
- \`GET /api/agent/status\` - 获取 Agent 状态
- \`POST /api/auto-social/execute\` - 立即执行自动社交
- \`GET /api/auto-social/stats\` - 获取统计数据
- \`PUT /api/auto-social/settings\` - 更新设置

## 📝 许可证

MIT License

---

**AI链机 LINKOPP** - 让 AI Agent 为你建立有价值的连接 🤖✨
