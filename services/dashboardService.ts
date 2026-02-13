import { AIDashboardData, AIDashboardStats, AIInsight } from '../types/dashboard';

/**
 * 获取 AI 驾驶舱数据
 */
export const getDashboardData = async (userId: string): Promise<AIDashboardData> => {
  // TODO: 从后端 API 获取真实数据
  // 目前返回 mock 数据
  
  const stats: AIDashboardStats = {
    opportunitiesExplored: Math.floor(Math.random() * 50) + 100,
    conversationsHeld: Math.floor(Math.random() * 5) + 5,
    highPriorityMatches: Math.floor(Math.random() * 3) + 2,
    meetingsScheduled: Math.floor(Math.random() * 2) + 1
  };

  const insights: AIInsight[] = [
    {
      id: '1',
      type: 'trend',
      title: '行业趋势',
      description: '今天 Web3 领域活跃度提升 23%，建议关注相关创业者',
      priority: 'high',
      actionable: true
    },
    {
      id: '2',
      type: 'opportunity',
      title: '新机会',
      description: '发现 5 位新注册的 AI 领域投资人，匹配度较高',
      priority: 'medium',
      actionable: true
    },
    {
      id: '3',
      type: 'suggestion',
      title: '行动建议',
      description: '建议优先联系张伟，他最近在寻找技术合伙人',
      priority: 'high',
      actionable: true
    }
  ];

  return {
    stats,
    insights,
    recommendations: [],
    lastUpdated: new Date()
  };
};

/**
 * 生成 AI 洞察
 */
export const generateAIInsights = async (
  userProfile: any,
  recentActivity: any[]
): Promise<AIInsight[]> => {
  // TODO: 调用 AI 生成真实洞察
  // 目前返回模拟数据
  
  const insights: AIInsight[] = [];
  
  // 分析用户行为
  if (recentActivity.length < 5) {
    insights.push({
      id: 'activity_low',
      type: 'suggestion',
      title: '活跃度建议',
      description: '最近活跃度较低，建议每天查看推荐并进行互动',
      priority: 'medium',
      actionable: true
    });
  }
  
  // 分析行业趋势
  insights.push({
    id: 'trend_analysis',
    type: 'trend',
    title: '行业动态',
    description: `${userProfile.industry || 'AI'} 领域本周新增 ${Math.floor(Math.random() * 20) + 10} 个机会`,
    priority: 'high',
    actionable: false
  });
  
  return insights;
};

/**
 * 更新统计数据
 */
export const updateDashboardStats = async (
  userId: string,
  action: 'explore' | 'conversation' | 'match' | 'meeting'
): Promise<void> => {
  // TODO: 更新后端统计数据
  console.log(`User ${userId} performed action: ${action}`);
};
