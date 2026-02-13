import { Database } from '../db/database';

/**
 * Agent 对话 API
 * 用户可以与自己的 AI Agent 对话来：
 * 1. 更新个人画像（技能、资源、需求）
 * 2. 设置社交策略（频率、偏好）
 * 3. 查询 Agent 状态和任务
 * 4. 下达指令
 */

// Agent 人设 Prompt
const AGENT_SYSTEM_PROMPT = (userName: string, userProfile: any) => `你是 ${userName} 的专属 AI Agent（AI经纪人），负责帮助他/她：
- 管理个人画像和技能资源
- 自动寻找合作伙伴
- 代表他/她与其他 Agent 对话
- 提供智能建议和洞察

你的性格：专业、友好、主动、高效
你的目标：帮助主人建立更多有价值的连接

当前主人的画像：
- 公司：${userProfile?.company_name || '未设置'}
- 职位：${userProfile?.role || '未设置'}
- 行业：${userProfile?.industry || '未设置'}
- 地区：${userProfile?.location || '未设置'}
- 技能：${userProfile?.skills || '[]'}
- 资源：${userProfile?.resources || '[]'}
- 需求：${userProfile?.needs || '[]'}

你需要：
1. 理解用户的意图（更新画像、设置策略、查询状态等）
2. 从对话中提取关键信息
3. 用友好的语气回复
4. 主动提供建议

当用户想要更新画像时，请提取信息并以 JSON 格式返回：
{
  "intent": "update_profile",
  "updates": {
    "skills": ["新技能1", "新技能2"],
    "resources": ["新资源"],
    "needs": ["新需求"]
  }
}

当用户想要设置社交策略时，请返回：
{
  "intent": "set_strategy",
  "config": {
    "auto_social_enabled": true,
    "daily_limit": 5,
    "preferences": {
      "target_industry": "投资",
      "target_role": "投资人"
    }
  }
}

当用户询问状态时，请返回：
{
  "intent": "query_status"
}`;

/**
 * 与 Agent 对话
 */
export async function chatWithAgent(
  db: Database,
  userId: number,
  userMessage: string,
  conversationHistory: any[] = []
): Promise<{
  reply: string;
  intent?: string;
  updates?: any;
  conversationId?: number;
}> {
  try {
    // 获取用户信息和画像
    const user = await db.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await db.getUserProfile(userId);
    
    // 构建对话历史
    const messages = [
      {
        role: 'system',
        content: AGENT_SYSTEM_PROMPT(user.username, profile)
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    // 调用 AI API（这里需要实际调用 VectorEngine AI）
    const aiResponse = await callAI(messages);
    
    // 解析 AI 响应，提取意图和数据
    const { reply, intent, updates } = parseAgentResponse(aiResponse);

    // 保存对话记录
    const conversationId = await saveAgentConversation(db, userId, messages, {
      intent,
      updates
    });

    // 如果有更新意图，执行相应操作
    if (intent === 'update_profile' && updates) {
      await updateProfileFromAgent(db, userId, updates);
    } else if (intent === 'set_strategy' && updates?.config) {
      await updateAgentSettings(db, userId, updates.config);
    }

    return {
      reply,
      intent,
      updates,
      conversationId
    };
  } catch (error) {
    console.error('Agent chat error:', error);
    throw error;
  }
}

/**
 * 调用 AI API
 */
async function callAI(messages: any[]): Promise<string> {
  const apiKey = process.env.VECTORENGINE_API_KEY;
  const apiUrl = process.env.VECTORENGINE_API_URL || 'https://api.vectorengine.ai/v1';

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gemini-2.0-flash-exp',
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * 解析 Agent 响应
 */
function parseAgentResponse(response: string): {
  reply: string;
  intent?: string;
  updates?: any;
} {
  // 尝试从响应中提取 JSON
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        reply: response.replace(jsonMatch[0], '').trim() || '好的，我已经记录下来了！',
        intent: parsed.intent,
        updates: parsed.updates || parsed.config || parsed
      };
    } catch (e) {
      // JSON 解析失败，返回原始回复
    }
  }

  return {
    reply: response
  };
}

/**
 * 保存 Agent 对话记录
 */
async function saveAgentConversation(
  db: Database,
  userId: number,
  messages: any[],
  context: any
): Promise<number> {
  const result = await db.execute(
    `INSERT INTO agent_conversations (user_id, messages, context, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [userId, JSON.stringify(messages), JSON.stringify(context)]
  );

  return result.lastInsertRowid as number;
}

/**
 * 从 Agent 对话更新用户画像
 */
async function updateProfileFromAgent(
  db: Database,
  userId: number,
  updates: any
): Promise<void> {
  const profile = await db.getUserProfile(userId);
  
  if (!profile) {
    // 创建新画像
    await db.execute(
      `INSERT INTO user_profiles (user_id, skills, resources, needs)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(updates.skills || []),
        JSON.stringify(updates.resources || []),
        JSON.stringify(updates.needs || [])
      ]
    );
  } else {
    // 更新现有画像
    const currentSkills = profile.skills ? JSON.parse(profile.skills) : [];
    const currentResources = profile.resources ? JSON.parse(profile.resources) : [];
    const currentNeeds = profile.needs ? JSON.parse(profile.needs) : [];

    const newSkills = updates.skills ? [...new Set([...currentSkills, ...updates.skills])] : currentSkills;
    const newResources = updates.resources ? [...new Set([...currentResources, ...updates.resources])] : currentResources;
    const newNeeds = updates.needs ? [...new Set([...currentNeeds, ...updates.needs])] : currentNeeds;

    await db.execute(
      `UPDATE user_profiles
       SET skills = ?, resources = ?, needs = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        JSON.stringify(newSkills),
        JSON.stringify(newResources),
        JSON.stringify(newNeeds),
        userId
      ]
    );
  }
}

/**
 * 更新 Agent 设置
 */
async function updateAgentSettings(
  db: Database,
  userId: number,
  config: any
): Promise<void> {
  // 检查是否已有设置
  const existing = await db.query(
    'SELECT * FROM agent_settings WHERE user_id = ?',
    [userId]
  );

  if (existing.length === 0) {
    // 创建新设置
    await db.execute(
      `INSERT INTO agent_settings (user_id, auto_social_enabled, daily_limit, preferences)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        config.auto_social_enabled ? 1 : 0,
        Math.min(config.daily_limit || 5, 10), // 上限 10
        JSON.stringify(config.preferences || {})
      ]
    );
  } else {
    // 更新现有设置
    await db.execute(
      `UPDATE agent_settings
       SET auto_social_enabled = ?,
           daily_limit = ?,
           preferences = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        config.auto_social_enabled ? 1 : 0,
        Math.min(config.daily_limit || 5, 10),
        JSON.stringify(config.preferences || {}),
        userId
      ]
    );
  }
}

/**
 * 获取 Agent 状态
 */
export async function getAgentStatus(db: Database, userId: number): Promise<{
  settings: any;
  todayUsage: number;
  todayLimit: number;
  recentMatches: any[];
}> {
  // 获取 Agent 设置
  const settings = await db.query(
    'SELECT * FROM agent_settings WHERE user_id = ?',
    [userId]
  );

  // 获取今日配额
  const today = new Date().toISOString().split('T')[0];
  const quota = await db.query(
    'SELECT * FROM daily_social_quota WHERE user_id = ? AND quota_date = ?',
    [userId, today]
  );

  // 获取最近的自动匹配记录
  const recentMatches = await db.query(
    `SELECT amh.*, u.username as target_username
     FROM auto_match_history amh
     JOIN users u ON amh.target_id = u.id
     WHERE amh.user_id = ?
     ORDER BY amh.created_at DESC
     LIMIT 5`,
    [userId]
  );

  return {
    settings: settings[0] || null,
    todayUsage: quota[0]?.used_count || 0,
    todayLimit: quota[0]?.limit_count || (settings[0]?.daily_limit || 5),
    recentMatches: recentMatches || []
  };
}
