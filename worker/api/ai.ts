// VectorEngine AI 配置
const VECTORENGINE_API_KEY = process.env.VECTORENGINE_API_KEY || 'sk-wPQgdsL67lZAmlArEMnmr9gH1BgYX7S3KiBVyoCVXCOUGEIg';
const VECTORENGINE_API_URL = process.env.VECTORENGINE_API_URL || 'https://api.vectorengine.ai/v1';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// 调用 VectorEngine AI (Gemini)
export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const {
    messages,
    model = 'gemini-2.0-flash-exp',
    temperature = 0.7,
    max_tokens = 2000,
  } = request;

  try {
    const response = await fetch(`${VECTORENGINE_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VECTORENGINE_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      return {
        success: false,
        error: `AI 服务错误: ${response.status}`,
      };
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return {
        success: false,
        error: 'AI 响应格式错误',
      };
    }

    return {
      success: true,
      message: aiMessage,
    };
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return {
      success: false,
      error: error.message || 'AI 服务暂时不可用',
    };
  }
}

// 生成用户画像采集对话
export async function generateOnboardingMessage(
  conversationHistory: Message[],
  currentStep: 'basic' | 'skills' | 'needs'
): Promise<ChatResponse> {
  const systemPrompts = {
    basic: `你是一个友好的 AI 经纪人，正在帮助用户完善个人资料。
当前阶段：收集基本信息（公司名称、职位、行业、地区）。
请用简短、友好的方式提问，一次只问一个问题。
如果用户已经提供了信息，请确认并继续下一个问题。`,
    
    skills: `你是一个友好的 AI 经纪人，正在帮助用户整理技能和资源。
当前阶段：收集用户的核心技能、资源和优势。
请引导用户分享他们能提供的价值，例如：技术能力、行业资源、人脉网络等。
用鼓励的语气，让用户感到自豪地分享自己的优势。`,
    
    needs: `你是一个友好的 AI 经纪人，正在帮助用户明确需求和目标。
当前阶段：了解用户的需求和寻找的合作机会。
请帮助用户清晰地表达他们的需求，例如：寻找开发者、投资人、营销专家、合伙人等。
保持专业但不失亲切。`,
  };

  const messages: Message[] = [
    { role: 'system', content: systemPrompts[currentStep] },
    ...conversationHistory,
  ];

  return chat({ messages });
}

// 生成双 Agent 匹配对话
export async function generateAgentMatchConversation(
  user1Profile: any,
  user2Profile: any
): Promise<{ conversation: Message[]; analysis: any }> {
  // 构建 Agent 人设
  const agent1Prompt = `你是 ${user1Profile.username} 的 AI Agent。
你的主人信息：
- 公司：${user1Profile.company_name || '未知'}
- 职位：${user1Profile.role || '未知'}
- 技能：${user1Profile.skills || '未知'}
- 资源：${user1Profile.resources || '未知'}
- 需求：${user1Profile.needs || '未知'}

你的任务是代表主人与另一个 Agent 对话，探索合作可能性。
请保持专业、友好，主动介绍你主人的优势，并询问对方的情况。`;

  const agent2Prompt = `你是 ${user2Profile.username} 的 AI Agent。
你的主人信息：
- 公司：${user2Profile.company_name || '未知'}
- 职位：${user2Profile.role || '未知'}
- 技能：${user2Profile.skills || '未知'}
- 资源：${user2Profile.resources || '未知'}
- 需求：${user2Profile.needs || '未知'}

你的任务是代表主人与另一个 Agent 对话，探索合作可能性。
请保持专业、友好，回应对方的介绍，并分享你主人的优势。`;

  // 生成 5-8 轮对话
  const conversation: Message[] = [];
  const rounds = 6;

  for (let i = 0; i < rounds; i++) {
    // Agent 1 发言
    const agent1Messages: Message[] = [
      { role: 'system', content: agent1Prompt },
      ...conversation,
      { role: 'user', content: i === 0 ? '开始介绍你的主人并探索合作机会。' : '继续对话。' },
    ];

    const agent1Response = await chat({ messages: agent1Messages, max_tokens: 300 });
    if (agent1Response.success && agent1Response.message) {
      conversation.push({ role: 'assistant', content: agent1Response.message });
    }

    // Agent 2 回应
    const agent2Messages: Message[] = [
      { role: 'system', content: agent2Prompt },
      ...conversation,
      { role: 'user', content: '回应对方的消息。' },
    ];

    const agent2Response = await chat({ messages: agent2Messages, max_tokens: 300 });
    if (agent2Response.success && agent2Response.message) {
      conversation.push({ role: 'assistant', content: agent2Response.message });
    }
  }

  // 生成匹配分析
  const analysisPrompt = `基于以下两个 Agent 的对话，分析他们的合作潜力。

对话记录：
${conversation.map((m, i) => `${i % 2 === 0 ? 'Agent A' : 'Agent B'}: ${m.content}`).join('\n\n')}

请以 JSON 格式返回分析结果：
{
  "match_score": 0-100的匹配度分数,
  "demand_satisfaction": 0-10的需求满足度,
  "skill_complementarity": 0-10的技能互补性,
  "collaboration_willingness": 0-10的合作意愿,
  "core_reason": "核心匹配原因（一句话）",
  "collaboration_areas": ["协作领域1", "协作领域2"],
  "potential_directions": ["潜在合作方向1", "潜在合作方向2"]
}`;

  const analysisResponse = await chat({
    messages: [{ role: 'user', content: analysisPrompt }],
    temperature: 0.3,
  });

  let analysis = {
    match_score: 75,
    demand_satisfaction: 8,
    skill_complementarity: 7,
    collaboration_willingness: 8,
    core_reason: '双方在技术和资源上有较强互补性',
    collaboration_areas: ['技术合作', '资源共享'],
    potential_directions: ['联合项目开发', '资源对接'],
  };

  if (analysisResponse.success && analysisResponse.message) {
    try {
      const parsed = JSON.parse(analysisResponse.message);
      analysis = { ...analysis, ...parsed };
    } catch (e) {
      console.error('Failed to parse analysis:', e);
    }
  }

  return { conversation, analysis };
}
