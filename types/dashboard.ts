// AI 驾驶舱相关类型定义

export interface AIDashboardStats {
  opportunitiesExplored: number;    // 探索的机会数
  conversationsHeld: number;        // 进行的对话数
  highPriorityMatches: number;      // 高优先级匹配数
  meetingsScheduled: number;        // 安排的会议数
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'opportunity' | 'warning' | 'suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AIRecommendation {
  id: string;
  type: 'match' | 'action' | 'content';
  title: string;
  description: string;
  confidence: number;  // 0-100
  reasons: string[];
  cta: {
    label: string;
    action: string;
  };
}

export interface AIDashboardData {
  stats: AIDashboardStats;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  lastUpdated: Date;
}
