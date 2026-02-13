import { getDatabase } from './db/database';
import { register, login, verifyToken, getCurrentUser } from './api/auth';
import { chat, generateOnboardingMessage, generateAgentMatchConversation } from './api/ai';

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 获取数据库实例
    const db = getDatabase(env);

    try {
      // 认证 API
      if (path === '/api/auth/register' && request.method === 'POST') {
        const data = await request.json();
        const result = await register(db, data);
        return Response.json(result, { headers: corsHeaders });
      }

      if (path === '/api/auth/login' && request.method === 'POST') {
        const data = await request.json();
        const result = await login(db, data);
        return Response.json(result, { headers: corsHeaders });
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        const user = getCurrentUser(db, decoded.userId);
        if (!user) {
          return Response.json({ success: false, message: '用户不存在' }, { status: 404, headers: corsHeaders });
        }

        return Response.json({ success: true, user }, { headers: corsHeaders });
      }

      // AI 对话 API
      if (path === '/api/ai/chat' && request.method === 'POST') {
        const data = await request.json();
        const result = await chat(data);
        return Response.json(result, { headers: corsHeaders });
      }

      if (path === '/api/ai/onboarding' && request.method === 'POST') {
        const { conversationHistory, currentStep } = await request.json();
        const result = await generateOnboardingMessage(conversationHistory, currentStep);
        return Response.json(result, { headers: corsHeaders });
      }

      // 用户画像 API
      if (path === '/api/profile' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        const profile = db.prepare(
          'SELECT * FROM user_profiles WHERE user_id = ?'
        ).bind(decoded.userId).get();

        return Response.json({ success: true, profile }, { headers: corsHeaders });
      }

      if (path === '/api/profile' && request.method === 'PUT') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        const data = await request.json();
        const { company_name, role, industry, location, skills, resources, needs, bio, profile_completion } = data;

        db.prepare(`
          UPDATE user_profiles 
          SET company_name = ?, role = ?, industry = ?, location = ?, 
              skills = ?, resources = ?, needs = ?, bio = ?, 
              profile_completion = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).bind(
          company_name, role, industry, location,
          JSON.stringify(skills), JSON.stringify(resources), JSON.stringify(needs), bio,
          profile_completion, decoded.userId
        ).run();

        return Response.json({ success: true, message: '画像更新成功' }, { headers: corsHeaders });
      }

      // 社群成员列表 API
      if (path === '/api/members' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        // 获取所有用户（排除自己）
        const members = db.prepare(`
          SELECT u.id, u.username, u.avatar_url, u.created_at,
                 p.company_name, p.role, p.industry, p.location, p.skills, p.resources, p.needs
          FROM users u
          LEFT JOIN user_profiles p ON u.id = p.user_id
          WHERE u.id != ? AND p.profile_completion > 30
          ORDER BY p.profile_completion DESC
        `).bind(decoded.userId).all();

        return Response.json({ success: true, members }, { headers: corsHeaders });
      }

      // 匹配请求 API
      if (path === '/api/match/create' && request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        const { targetId } = await request.json();

        // 获取双方画像
        const user1Profile = db.prepare(`
          SELECT u.id, u.username, p.company_name, p.role, p.skills, p.resources, p.needs
          FROM users u
          LEFT JOIN user_profiles p ON u.id = p.user_id
          WHERE u.id = ?
        `).bind(decoded.userId).get();

        const user2Profile = db.prepare(`
          SELECT u.id, u.username, p.company_name, p.role, p.skills, p.resources, p.needs
          FROM users u
          LEFT JOIN user_profiles p ON u.id = p.user_id
          WHERE u.id = ?
        `).bind(targetId).get();

        if (!user1Profile || !user2Profile) {
          return Response.json({ success: false, message: '用户不存在' }, { status: 404, headers: corsHeaders });
        }

        // 生成 Agent 对话和分析
        const { conversation, analysis } = await generateAgentMatchConversation(user1Profile, user2Profile);

        // 保存匹配请求
        const result = db.prepare(`
          INSERT INTO match_requests (
            requester_id, target_id, match_score, agent_conversation, 
            ai_insights, collaboration_analysis, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `).bind(
          decoded.userId,
          targetId,
          analysis.match_score,
          JSON.stringify(conversation),
          JSON.stringify({ core_reason: analysis.core_reason }),
          JSON.stringify({
            demand_satisfaction: analysis.demand_satisfaction,
            skill_complementarity: analysis.skill_complementarity,
            collaboration_willingness: analysis.collaboration_willingness,
          }),
        ).run();

        return Response.json({
          success: true,
          matchId: result.meta!.last_row_id,
          analysis,
        }, { headers: corsHeaders });
      }

      // 获取匹配历史
      if (path === '/api/match/history' && request.method === 'GET') {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        const matches = db.prepare(`
          SELECT m.*, u.username as target_username, u.avatar_url as target_avatar
          FROM match_requests m
          JOIN users u ON m.target_id = u.id
          WHERE m.requester_id = ?
          ORDER BY m.created_at DESC
        `).bind(decoded.userId).all();

        return Response.json({ success: true, matches }, { headers: corsHeaders });
      }

      // 获取匹配详情
      if (path.startsWith('/api/match/') && request.method === 'GET') {
        const matchId = path.split('/').pop();
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return Response.json({ success: false, message: '未授权' }, { status: 401, headers: corsHeaders });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        
        if (!decoded) {
          return Response.json({ success: false, message: 'Token 无效' }, { status: 401, headers: corsHeaders });
        }

        const match = db.prepare(`
          SELECT m.*, 
                 u1.username as requester_username, u1.avatar_url as requester_avatar,
                 u2.username as target_username, u2.avatar_url as target_avatar
          FROM match_requests m
          JOIN users u1 ON m.requester_id = u1.id
          JOIN users u2 ON m.target_id = u2.id
          WHERE m.id = ? AND (m.requester_id = ? OR m.target_id = ?)
        `).bind(matchId, decoded.userId, decoded.userId).get();

        if (!match) {
          return Response.json({ success: false, message: '匹配记录不存在' }, { status: 404, headers: corsHeaders });
        }

        return Response.json({ success: true, match }, { headers: corsHeaders });
      }

      // 404
      return Response.json(
        { success: false, message: 'API 端点不存在' },
        { status: 404, headers: corsHeaders }
      );

    } catch (error: any) {
      console.error('API Error:', error);
      return Response.json(
        { success: false, message: error.message || '服务器错误' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
} satisfies ExportedHandler<Env>;
