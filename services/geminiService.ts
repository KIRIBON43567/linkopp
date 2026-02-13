import OpenAI from 'openai';
import { UserProfile, MatchProfile } from "../types";

// 使用 VectorEngine AI (OpenAI 兼容 API)
const client = new OpenAI({
  apiKey: import.meta.env.VITE_VECTORENGINE_API_KEY || 'sk-wPQgdsL67lZAmlArEMnmr9gH1BgYX7S3KiBVyoCVXCOUGEIg',
  baseURL: import.meta.env.VITE_VECTORENGINE_BASE_URL || 'https://api.vectorengine.ai/v1',
  dangerouslyAllowBrowser: true // 仅用于开发测试
});

// 默认使用 Gemini Flash 3（快速、低成本）
const DEFAULT_MODEL = 'gemini-2.5-flash';

// 生成 Onboarding 对话响应
export const generateOnboardingResponse = async (
  history: { role: string; parts: string }[],
  userMessage: string
): Promise<string> => {
  try {
    // 转换历史消息格式为 OpenAI 格式
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: 'system',
        content: '你是 LINKOPP 的 AI 智能体，一个专业的商业匹配平台助手。你的目标是通过采访用户来构建他们的职业档案。请保持问题简短、友好且专业。询问他们当前的项目、技能以及正在寻找什么样的合作伙伴。请用中文（简体）回复。不要输出 markdown 列表，使用自然的对话文本。'
      }
    ];

    // 添加历史对话
    history.forEach(h => {
      messages.push({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.parts
      });
    });

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || "我明白了。能具体说说吗？";
  } catch (error) {
    console.error("VectorEngine AI API Error:", error);
    return "我现在处于演示模式。通常我会分析您的输入 '" + userMessage + "' 并提出相关的后续问题来完善您的职业档案。";
  }
};

// 从对话中提取用户资料
export const extractUserProfileFromChat = async (
  history: { role: string; parts: string }[]
): Promise<Partial<UserProfile>> => {
  try {
    const conversationText = history.map(h => `${h.role}: ${h.parts}`).join('\n');

    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个信息提取助手。分析对话并提取用户的个人资料信息。返回 JSON 格式，包含：name（姓名）、role（职位）、company（公司）、tags（3-5个中文技能标签数组）。如果信息未提及，对应字段可以省略，但 tags 必须返回。'
        },
        {
          role: 'user',
          content: `请分析以下对话并提取用户资料：\n\n${conversationText}\n\n返回 JSON 格式。`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        name: parsed.name,
        role: parsed.role,
        company: parsed.company,
        tags: Array.isArray(parsed.tags) ? parsed.tags : []
      };
    }
  } catch (error) {
    console.error("Error extracting profile:", error);
  }
  return { tags: [] };
};

// 模拟 Agent 之间的对话
export const simulateAgentInteraction = async (
  userQuery: string,
  userProfile: UserProfile,
  matchProfile: MatchProfile
): Promise<{ question: string; answer: string }> => {
  try {
    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: '你正在模拟两个 AI Agent 之间的对话。Agent A 代表提问用户，Agent B 代表被匹配的目标用户。你的任务是生成 Agent A 的专业提问（基于用户的原始意图）和 Agent B 的回答（基于其个人资料）。返回 JSON 格式，包含 agent_a_question 和 agent_b_answer 两个字段。'
        },
        {
          role: 'user',
          content: `
用户意图: "${userQuery}"

Agent A (代表用户): ${userProfile.name}, ${userProfile.role}, ${userProfile.company}
Agent B (目标): ${matchProfile.name}, ${matchProfile.role}, ${matchProfile.company}, Insight: ${matchProfile.insight}

请生成:
1. Agent A 对 Agent B 的提问（专业、礼貌，将用户意图转化为商务询问）。
2. Agent B 的回答（基于其身份和可能的经验进行合理推断，用第一人称）。

请用中文。返回 JSON 格式。
          `
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const data = JSON.parse(content);
      return {
        question: data.agent_a_question || "我来帮您问问这个问题。",
        answer: data.agent_b_answer || "这方面我有一些经验。"
      };
    }
  } catch (error) {
    console.error("Simulation error:", error);
  }

  // 降级到模拟模式
  return {
    question: `(模拟) 关于"${userQuery}"，我来帮您问问他。`,
    answer: `(模拟) 根据资料，我对此很有经验。`
  };
};
