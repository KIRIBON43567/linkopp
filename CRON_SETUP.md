# Cloudflare Cron Triggers 配置指南

## 概述

Cloudflare Cron Triggers 允许你在 Cloudflare Workers 中设置定时任务，用于自动执行 Agent 自动社交功能。

## 配置步骤

### 1. 更新 wrangler.jsonc

在 `wrangler.jsonc` 中添加 `triggers` 配置：

```jsonc
{
  "name": "linkopp",
  "main": "worker/index.ts",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "linkopp-db",
      "database_id": "your-database-id"
    }
  ],
  // 添加定时任务配置
  "triggers": {
    "crons": [
      // 每天早上 9:00 执行自动社交
      "0 9 * * *"
    ]
  }
}
```

### 2. 在 Worker 中添加 scheduled 处理函数

在 `worker/index.ts` 中添加 `scheduled` 导出：

```typescript
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // ... 现有的 fetch 处理逻辑
  },

  // 定时任务处理函数
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    console.log('Cron trigger fired at:', new Date(event.scheduledTime).toISOString());
    
    const db = getDatabase(env);
    
    try {
      // 获取所有启用了自动社交的用户
      const enabledUsers = await db.getAutoSocialEnabledUsers();
      
      console.log(`Found ${enabledUsers.length} users with auto-social enabled`);
      
      // 为每个用户执行自动社交
      for (const user of enabledUsers) {
        try {
          await executeAutoSocialForUser(db, user.id);
          console.log(`Auto-social executed for user ${user.id}`);
        } catch (error) {
          console.error(`Failed to execute auto-social for user ${user.id}:`, error);
        }
      }
      
      console.log('Cron job completed successfully');
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  }
};

// 辅助函数：为单个用户执行自动社交
async function executeAutoSocialForUser(db: Database, userId: number) {
  // 获取用户的自动社交设置
  const settings = await db.getAgentSettings(userId);
  if (!settings || !settings.auto_social_enabled) {
    return;
  }

  // 获取今日配额
  const quota = await db.getDailySocialQuota(userId);
  if (quota.used_count >= quota.limit_count) {
    console.log(`User ${userId} has reached daily limit`);
    return;
  }

  // 计算剩余次数
  const remaining = quota.limit_count - quota.used_count;
  
  // 执行自动匹配
  const engine = new RecommendationEngine(db);
  const recommendations = await engine.getRecommendations(userId, remaining);
  
  // 为每个推荐创建匹配请求
  for (const rec of recommendations) {
    try {
      // 创建匹配请求
      const matchId = await db.createMatchRequest(userId, rec.userId, true);
      
      // 执行 Agent 对话
      const conversation = await generateAgentMatchConversation(
        db,
        userId,
        rec.userId
      );
      
      // 保存对话记录
      await db.updateMatchRequest(matchId, {
        conversation: JSON.stringify(conversation),
        status: 'completed'
      });
      
      // 更新配额
      await db.incrementDailySocialQuota(userId);
      
      console.log(`Match created for user ${userId} with ${rec.userId}`);
    } catch (error) {
      console.error(`Failed to create match for user ${userId}:`, error);
    }
  }
}
```

### 3. Cron 表达式说明

Cloudflare Cron Triggers 使用标准的 Cron 表达式（5 个字段）：

```
┌───────────── 分钟 (0 - 59)
│ ┌───────────── 小时 (0 - 23)
│ │ ┌───────────── 日 (1 - 31)
│ │ │ ┌───────────── 月 (1 - 12)
│ │ │ │ ┌───────────── 星期 (0 - 7) (0 和 7 都表示星期日)
│ │ │ │ │
* * * * *
```

**常用示例：**

- `0 9 * * *` - 每天早上 9:00
- `0 */6 * * *` - 每 6 小时执行一次
- `0 9,18 * * *` - 每天 9:00 和 18:00
- `0 9 * * 1-5` - 工作日（周一到周五）早上 9:00
- `*/30 * * * *` - 每 30 分钟

### 4. 部署

```bash
# 部署 Worker（包含 Cron Triggers）
wrangler deploy

# 查看 Cron Triggers 状态
wrangler tail
```

### 5. 测试

你可以手动触发 Cron 任务进行测试：

```bash
wrangler dev --test-scheduled
```

或者在 Cloudflare Dashboard 中手动触发：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 "Triggers" 标签
4. 点击 "Cron Triggers" 旁边的 "Send Test Event"

## 注意事项

1. **时区**: Cron Triggers 使用 UTC 时间，需要根据你的时区调整
2. **频率限制**: 最小间隔为 1 分钟
3. **执行时间**: 每次执行最多 30 秒（CPU 时间）
4. **并发**: 同一时间只能有一个 Cron 任务在执行

## 监控和日志

使用 `wrangler tail` 查看实时日志：

```bash
wrangler tail --format pretty
```

或在 Cloudflare Dashboard 中查看日志：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 "Logs" 标签

## 故障排查

### Cron 任务没有执行
1. 检查 `wrangler.jsonc` 中的配置是否正确
2. 确认已部署最新版本
3. 查看日志是否有错误信息

### 执行超时
1. 优化代码，减少执行时间
2. 分批处理用户，避免一次处理太多
3. 使用 `ctx.waitUntil()` 处理异步任务

### 数据库连接失败
1. 确认 D1 数据库绑定正确
2. 检查数据库是否已初始化
3. 查看环境变量是否配置正确

## 相关文档

- [Cloudflare Cron Triggers 官方文档](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Cron 表达式生成器](https://crontab.guru/)
