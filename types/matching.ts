// 匹配算法相关类型定义

export interface MatchScore {
  total: number;                    // 总分 0-100
  breakdown: {
    needsMatch: number;             // 需求匹配 40%
    capabilityMatch: number;        // 能力匹配 30%
    relationshipMatch: number;      // 关系匹配 20%
    behaviorMatch: number;          // 行为匹配 10%
  };
  confidence: number;               // 置信度 0-100
  reasons: string[];                // 匹配理由
}

export interface UserNeeds {
  type: 'funding' | 'partnership' | 'hiring' | 'mentorship' | 'supplier' | 'customer';
  description: string;
  priority: 'high' | 'medium' | 'low';
  urgency: number;  // 1-10
  deadline?: Date;
  tags: string[];
}

export interface UserCapability {
  skill: string;
  level: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  yearsOfExperience: number;
  verified: boolean;
}

export interface UserBehavior {
  lastActive: Date;
  averageResponseTime: number;  // 分钟
  preferredContactTime: string; // "9:00-18:00"
  meetingPreference: 'online' | 'offline' | 'both';
  activityScore: number;  // 0-100
}

export interface EnhancedUserProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  industry: string;
  location: string;
  
  // 需求图谱
  needs: UserNeeds[];
  
  // 能力图谱
  capabilities: UserCapability[];
  
  // 关系网络
  network: {
    connections: string[];  // 用户 ID 列表
    mutualConnections: string[];  // 共同好友
    networkSize: number;
  };
  
  // 行为数据
  behavior: UserBehavior;
  
  // AI 学习数据
  aiInsights: {
    personality: string;
    communicationStyle: string;
    goals: string[];
    painPoints: string[];
  };
}

export interface MatchRecord {
  id: string;
  user1Id: string;
  user2Id: string;
  score: MatchScore;
  status: 'pending' | 'contacted' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}
