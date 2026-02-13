import { Database } from '../db/database';
import { generateAgentMatchConversation } from './ai';

/**
 * Agent 自动社交功能
 * 根据用户设置，每天自动匹配指定数量的合适人选
 */

/**
 * 执行自动社交（为单个用户）
 */
export async function executeAutoSocial(db: Database, userId: number): Promise<{
  success: boolean;
  matchedCount: number;
  matches: any[];
  message?: string;
}> {
  try {
    // 1. 检查用户是否启用自动社交
    const settings = await db.query(
      'SELECT * FROM agent_settings WHERE user_id = ? AND auto_social_enabled = 1',
      [userId]
    );

    if (settings.length === 0) {
      return {
        success: false,
        matchedCount: 0,
        matches: [],
        message: '自动社交未启用'
      };
    }

    const setting = settings[0];
    const dailyLimit = Math.min(setting.daily_limit || 5, 10); // 上限 10

    // 2. 检查今日配额
    const today = new Date().toISOString().split('T')[0];
    let quota = await db.query(
      'SELECT * FROM daily_social_quota WHERE user_id = ? AND quota_date = ?',
      [userId, today]
    );

    if (quota.length === 0) {
      // 创建今日配额记录
      await db.execute(
        `INSERT INTO daily_social_quota (user_id, quota_date, used_count, limit_count)
         VALUES (?, ?, 0, ?)`,
        [userId, today, dailyLimit]
      );
      quota = await db.query(
        'SELECT * FROM daily_social_quota WHERE user_id = ? AND quota_date = ?',
        [userId, today]
      );
    }

    const currentQuota = quota[0];
    const remainingCount = currentQuota.limit_count - currentQuota.used_count;

    if (remainingCount <= 0) {
      return {
        success: false,
        matchedCount: 0,
        matches: [],
        message: '今日配额已用完'
      };
    }

    // 3. 获取用户画像
    const userProfile = await db.getUserProfile(userId);
    if (!userProfile || userProfile.profile_completion < 50) {
      return {
        success: false,
        matchedCount: 0,
        matches: [],
        message: '请先完善个人画像（完成度需达到 50% 以上）'
      };
    }

    // 4. 智能推荐候选人
    const candidates = await findMatchCandidates(db, userId, setting.preferences, remainingCount);

    if (candidates.length === 0) {
      return {
        success: true,
        matchedCount: 0,
        matches: [],
        message: '暂无合适的匹配候选人'
      };
    }

    // 5. 执行自动匹配
    const matches = [];
    let successCount = 0;

    for (const candidate of candidates) {
      try {
        const matchResult = await createAutoMatch(db, userId, candidate.id, userProfile, candidate);
        if (matchResult.success) {
          matches.push(matchResult);
          successCount++;

          // 更新配额
          await db.execute(
            `UPDATE daily_social_quota
             SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ? AND quota_date = ?`,
            [userId, today]
          );

          // 记录自动匹配历史
          await db.execute(
            `INSERT INTO auto_match_history (user_id, target_id, match_request_id, match_date, success)
             VALUES (?, ?, ?, ?, 1)`,
            [userId, candidate.id, matchResult.matchId, today]
          );
        }
      } catch (error) {
        console.error(`Auto match failed for candidate ${candidate.id}:`, error);
        // 记录失败
        await db.execute(
          `INSERT INTO auto_match_history (user_id, target_id, match_date, success)
           VALUES (?, ?, ?, 0)`,
          [userId, candidate.id, today]
        );
      }
    }

    return {
      success: true,
      matchedCount: successCount,
      matches,
      message: `成功匹配 ${successCount} 位候选人`
    };
  } catch (error) {
    console.error('Auto social execution error:', error);
    throw error;
  }
}

/**
 * 智能推荐匹配候选人
 */
async function findMatchCandidates(
  db: Database,
  userId: number,
  preferences: string | null,
  limit: number
): Promise<any[]> {
  const prefs = preferences ? JSON.parse(preferences) : {};

  // 获取已匹配过的用户 ID
  const matchedIds = await db.query(
    `SELECT DISTINCT target_id FROM match_requests WHERE requester_id = ?`,
    [userId]
  );
  const excludeIds = matchedIds.map((m: any) => m.target_id);
  excludeIds.push(userId); // 排除自己

  // 构建查询条件
  let query = `
    SELECT u.id, u.username, u.avatar_url,
           p.company_name, p.role, p.industry, p.location,
           p.skills, p.resources, p.needs, p.profile_completion
    FROM users u
    JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id NOT IN (${excludeIds.join(',')})
      AND p.profile_completion >= 50
  `;

  // 应用偏好筛选
  const params: any[] = [];
  if (prefs.target_industry) {
    query += ` AND p.industry LIKE ?`;
    params.push(`%${prefs.target_industry}%`);
  }
  if (prefs.target_location) {
    query += ` AND p.location LIKE ?`;
    params.push(`%${prefs.target_location}%`);
  }

  query += ` ORDER BY p.profile_completion DESC, RANDOM() LIMIT ?`;
  params.push(limit);

  const candidates = await db.query(query, params);
  return candidates;
}

/**
 * 创建自动匹配请求
 */
async function createAutoMatch(
  db: Database,
  userId: number,
  targetId: number,
  userProfile: any,
  targetProfile: any
): Promise<{
  success: boolean;
  matchId?: number;
  analysis?: any;
}> {
  try {
    // 生成 Agent 对话和分析
    const { conversation, analysis } = await generateAgentMatchConversation(
      {
        id: userId,
        username: userProfile.username || 'User',
        company_name: userProfile.company_name,
        role: userProfile.role,
        skills: userProfile.skills,
        resources: userProfile.resources,
        needs: userProfile.needs
      },
      {
        id: targetId,
        username: targetProfile.username || 'Target',
        company_name: targetProfile.company_name,
        role: targetProfile.role,
        skills: targetProfile.skills,
        resources: targetProfile.resources,
        needs: targetProfile.needs
      }
    );

    // 保存匹配请求
    const result = await db.execute(
      `INSERT INTO match_requests (
        requester_id, target_id, match_score, agent_conversation,
        ai_insights, collaboration_analysis, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        targetId,
        analysis.match_score,
        JSON.stringify(conversation),
        JSON.stringify({ core_reason: analysis.core_reason }),
        JSON.stringify({
          demand_satisfaction: analysis.demand_satisfaction,
          skill_complementarity: analysis.skill_complementarity,
          collaboration_willingness: analysis.collaboration_willingness,
        })
      ]
    );

    return {
      success: true,
      matchId: result.lastInsertRowid as number,
      analysis
    };
  } catch (error) {
    console.error('Create auto match error:', error);
    return {
      success: false
    };
  }
}

/**
 * 获取自动社交统计
 */
export async function getAutoSocialStats(db: Database, userId: number): Promise<{
  todayUsed: number;
  todayLimit: number;
  totalMatches: number;
  successRate: number;
  recentMatches: any[];
}> {
  const today = new Date().toISOString().split('T')[0];

  // 今日配额
  const quota = await db.query(
    'SELECT * FROM daily_social_quota WHERE user_id = ? AND quota_date = ?',
    [userId, today]
  );

  // 总匹配数
  const totalResult = await db.query(
    'SELECT COUNT(*) as count FROM auto_match_history WHERE user_id = ?',
    [userId]
  );

  // 成功率
  const successResult = await db.query(
    'SELECT COUNT(*) as count FROM auto_match_history WHERE user_id = ? AND success = 1',
    [userId]
  );

  const total = totalResult[0]?.count || 0;
  const success = successResult[0]?.count || 0;
  const successRate = total > 0 ? (success / total) * 100 : 0;

  // 最近匹配
  const recentMatches = await db.query(
    `SELECT amh.*, u.username as target_username, mr.match_score
     FROM auto_match_history amh
     JOIN users u ON amh.target_id = u.id
     LEFT JOIN match_requests mr ON amh.match_request_id = mr.id
     WHERE amh.user_id = ?
     ORDER BY amh.created_at DESC
     LIMIT 10`,
    [userId]
  );

  return {
    todayUsed: quota[0]?.used_count || 0,
    todayLimit: quota[0]?.limit_count || 5,
    totalMatches: total,
    successRate: Math.round(successRate),
    recentMatches: recentMatches || []
  };
}

/**
 * 更新自动社交设置
 */
export async function updateAutoSocialSettings(
  db: Database,
  userId: number,
  settings: {
    auto_social_enabled?: boolean;
    daily_limit?: number;
    preferences?: any;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    // 检查是否已有设置
    const existing = await db.query(
      'SELECT * FROM agent_settings WHERE user_id = ?',
      [userId]
    );

    const dailyLimit = settings.daily_limit ? Math.min(settings.daily_limit, 10) : undefined;

    if (existing.length === 0) {
      // 创建新设置
      await db.execute(
        `INSERT INTO agent_settings (user_id, auto_social_enabled, daily_limit, preferences)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          settings.auto_social_enabled ? 1 : 0,
          dailyLimit || 5,
          JSON.stringify(settings.preferences || {})
        ]
      );
    } else {
      // 更新现有设置
      const updates: string[] = [];
      const params: any[] = [];

      if (settings.auto_social_enabled !== undefined) {
        updates.push('auto_social_enabled = ?');
        params.push(settings.auto_social_enabled ? 1 : 0);
      }
      if (dailyLimit !== undefined) {
        updates.push('daily_limit = ?');
        params.push(dailyLimit);
      }
      if (settings.preferences !== undefined) {
        updates.push('preferences = ?');
        params.push(JSON.stringify(settings.preferences));
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId);

        await db.execute(
          `UPDATE agent_settings SET ${updates.join(', ')} WHERE user_id = ?`,
          params
        );
      }
    }

    return {
      success: true,
      message: '设置更新成功'
    };
  } catch (error) {
    console.error('Update auto social settings error:', error);
    throw error;
  }
}
