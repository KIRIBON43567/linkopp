import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MatchProfile } from "../types";

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Error initializing Gemini:", error);
}

// ... existing generateOnboardingResponse ...
export const generateOnboardingResponse = async (
  history: { role: string; parts: string }[],
  userMessage: string
): Promise<string> => {
  if (!ai) {
    return "我现在处于演示模式（无 API 密钥）。通常我会分析您的输入 '" + userMessage + "' 并提出相关的后续问题来完善您的职业档案。";
  }

  try {
    const model = ai.models.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: "你是 LINKOPP 的 AI 智能体，一个专业的商业匹配平台助手。你的目标是通过采访用户来构建他们的职业档案。请保持问题简短、友好且专业。询问他们当前的项目、技能以及正在寻找什么样的合作伙伴。请用中文（简体）回复。不要输出 markdown 列表，使用自然的对话文本。",
    });

    const prompt = `Previous conversation:\n${history.map(h => `${h.role}: ${h.parts}`).join('\n')}\nUser: ${userMessage}\nAI:`;
    
    const result = await model.generateContent({
      contents: prompt,
    });
    
    return result.text || "我明白了。能具体说说吗？";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "我现在连接网络有些问题。我们就假设我已经记下这些信息了！";
  }
};

// ... existing extractUserProfileFromChat ...
export const extractUserProfileFromChat = async (
  history: { role: string; parts: string }[]
): Promise<Partial<UserProfile>> => {
  if (!ai) return {};

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `分析以下对话并提取用户的个人资料信息。标签(tags)请提取为中文。
      Conversation:
      ${history.map(h => `${h.role}: ${h.parts}`).join('\n')}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The user's name if mentioned." },
            role: { type: Type.STRING, description: "The user's job title or role." },
            company: { type: Type.STRING, description: "The user's company name." },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "A list of 3-5 professional skill tags or interest tags inferred from the conversation (in Chinese)." 
            }
          },
          required: ["tags"], 
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Error extracting profile:", error);
  }
  return {};
};

// NEW: Agent Simulation Service
export const simulateAgentInteraction = async (
  userQuery: string,
  userProfile: UserProfile,
  matchProfile: MatchProfile
): Promise<{ question: string; answer: string }> => {
  if (!ai) {
    return {
      question: `(模拟) 关于"${userQuery}"，我来帮您问问他。`,
      answer: `(模拟) 根据资料，我对此很有经验。`
    };
  }

  try {
    const model = ai.models.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: "你正在模拟两个 AI Agent 之间的对话。Agent A 代表提问用户，Agent B 代表被匹配的目标用户。你的任务是生成 Agent A 的专业提问（基于用户的原始意图）和 Agent B 的回答（基于其个人资料）。返回 JSON 格式。",
    });

    const prompt = `
      用户意图: "${userQuery}"
      
      Agent A (代表用户): ${userProfile.name}, ${userProfile.role}, ${userProfile.company}
      Agent B (目标): ${matchProfile.name}, ${matchProfile.role}, ${matchProfile.company}, Insight: ${matchProfile.insight}
      
      请生成:
      1. Agent A 对 Agent B 的提问（专业、礼貌，将用户意图转化为商务询问）。
      2. Agent B 的回答（基于其身份和可能的经验进行合理推断，用第一人称）。
      
      请用中文。
    `;

    const response = await model.generateContent({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agent_a_question: { type: Type.STRING },
            agent_b_answer: { type: Type.STRING },
          },
          required: ["agent_a_question", "agent_b_answer"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      question: data.agent_a_question || "我来帮您问问这个问题。",
      answer: data.agent_b_answer || "这方面我有一些经验。"
    };

  } catch (error) {
    console.error("Simulation error:", error);
    return {
      question: "网络连接不稳定，无法发起提问。",
      answer: "请稍后再试。"
    };
  }
};
