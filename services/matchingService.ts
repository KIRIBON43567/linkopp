import { MatchScore, EnhancedUserProfile, UserNeeds, UserCapability } from '../types/matching';

/**
 * 计算两个用户的匹配分数
 */
export const calculateMatchScore = (
  user1: EnhancedUserProfile,
  user2: EnhancedUserProfile
): MatchScore => {
  // 1. 需求匹配（40%）
  const needsScore = calculateNeedsMatch(user1.needs, user2.capabilities);
  
  // 2. 能力匹配（30%）
  const capabilityScore = calculateCapabilityMatch(user1.capabilities, user2.capabilities);
  
  // 3. 关系匹配（20%）
  const relationshipScore = calculateRelationshipMatch(user1.network, user2.network);
  
  // 4. 行为匹配（10%）
  const behaviorScore = calculateBehaviorMatch(user1.behavior, user2.behavior);
  
  // 加权计算总分
  const total = Math.round(
    needsScore * 0.4 + 
    capabilityScore * 0.3 + 
    relationshipScore * 0.2 + 
    behaviorScore * 0.1
  );
  
  // 计算置信度
  const confidence = calculateConfidence(user1, user2);
  
  // 生成匹配理由
  const reasons = generateMatchReasons(
    { needsScore, capabilityScore, relationshipScore, behaviorScore },
    user1,
    user2
  );
  
  return {
    total,
    breakdown: {
      needsMatch: Math.round(needsScore),
      capabilityMatch: Math.round(capabilityScore),
      relationshipMatch: Math.round(relationshipScore),
      behaviorMatch: Math.round(behaviorScore)
    },
    confidence,
    reasons
  };
};

/**
 * 计算需求匹配度
 */
const calculateNeedsMatch = (
  needs: UserNeeds[],
  capabilities: UserCapability[]
): number => {
  if (needs.length === 0) return 50; // 默认分数
  
  let totalScore = 0;
  let weightSum = 0;
  
  for (const need of needs) {
    // 根据优先级设置权重
    const weight = need.priority === 'high' ? 3 : need.priority === 'medium' ? 2 : 1;
    
    // 检查能力是否匹配需求
    const matchingCapabilities = capabilities.filter(cap => 
      need.tags.some(tag => cap.skill.toLowerCase().includes(tag.toLowerCase()))
    );
    
    if (matchingCapabilities.length > 0) {
      // 计算匹配质量
      const qualityScore = matchingCapabilities.reduce((sum, cap) => {
        const levelScore = cap.level === 'expert' ? 100 : 
                          cap.level === 'advanced' ? 80 : 
                          cap.level === 'intermediate' ? 60 : 40;
        return sum + levelScore;
      }, 0) / matchingCapabilities.length;
      
      totalScore += qualityScore * weight;
    } else {
      totalScore += 20 * weight; // 基础分
    }
    
    weightSum += weight;
  }
  
  return weightSum > 0 ? totalScore / weightSum : 50;
};

/**
 * 计算能力匹配度
 */
const calculateCapabilityMatch = (
  capabilities1: UserCapability[],
  capabilities2: UserCapability[]
): number => {
  if (capabilities1.length === 0 || capabilities2.length === 0) return 50;
  
  // 提取技能标签
  const skills1 = new Set(capabilities1.map(c => c.skill.toLowerCase()));
  const skills2 = new Set(capabilities2.map(c => c.skill.toLowerCase()));
  
  // 计算交集和并集
  const intersection = new Set([...skills1].filter(s => skills2.has(s)));
  const union = new Set([...skills1, ...skills2]);
  
  // Jaccard 相似度
  const similarity = intersection.size / union.size;
  
  // 互补性分数（技能不重叠但相关）
  const complementarity = calculateComplementarity(capabilities1, capabilities2);
  
  // 综合分数：70% 相似度 + 30% 互补性
  return similarity * 70 + complementarity * 30;
};

/**
 * 计算技能互补性
 */
const calculateComplementarity = (
  capabilities1: UserCapability[],
  capabilities2: UserCapability[]
): number => {
  // 简化版：检查是否有互补的技能领域
  const domains1 = extractDomains(capabilities1);
  const domains2 = extractDomains(capabilities2);
  
  // 如果有不同但相关的领域，互补性高
  const uniqueDomains1 = domains1.filter(d => !domains2.includes(d));
  const uniqueDomains2 = domains2.filter(d => !domains1.includes(d));
  
  if (uniqueDomains1.length > 0 && uniqueDomains2.length > 0) {
    return 80; // 高互补性
  }
  
  return 40; // 低互补性
};

/**
 * 提取技能领域
 */
const extractDomains = (capabilities: UserCapability[]): string[] => {
  const domainKeywords: { [key: string]: string[] } = {
    'tech': ['开发', '编程', '技术', 'AI', '算法', 'Python', 'JavaScript'],
    'design': ['设计', 'UI', 'UX', '视觉', '品牌'],
    'business': ['商务', '销售', '市场', '运营', '管理'],
    'finance': ['财务', '投资', '融资', '会计']
  };
  
  const domains: string[] = [];
  
  for (const cap of capabilities) {
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => cap.skill.includes(kw))) {
        if (!domains.includes(domain)) {
          domains.push(domain);
        }
      }
    }
  }
  
  return domains;
};

/**
 * 计算关系匹配度
 */
const calculateRelationshipMatch = (
  network1: any,
  network2: any
): number => {
  // 共同好友数量
  const mutualCount = network1.mutualConnections?.length || 0;
  
  // 网络规模相似度
  const sizeRatio = Math.min(network1.networkSize, network2.networkSize) / 
                    Math.max(network1.networkSize, network2.networkSize);
  
  // 共同好友分数（最高 70 分）
  const mutualScore = Math.min(mutualCount * 15, 70);
  
  // 网络规模分数（最高 30 分）
  const sizeScore = sizeRatio * 30;
  
  return mutualScore + sizeScore;
};

/**
 * 计算行为匹配度
 */
const calculateBehaviorMatch = (
  behavior1: any,
  behavior2: any
): number => {
  let score = 50; // 基础分
  
  // 活跃度匹配
  const activityDiff = Math.abs(
    (behavior1.activityScore || 50) - (behavior2.activityScore || 50)
  );
  score += (50 - activityDiff) * 0.4;
  
  // 沟通偏好匹配
  if (behavior1.meetingPreference === behavior2.meetingPreference ||
      behavior1.meetingPreference === 'both' ||
      behavior2.meetingPreference === 'both') {
    score += 20;
  }
  
  // 响应速度匹配
  const avgResponseTime = (behavior1.averageResponseTime + behavior2.averageResponseTime) / 2;
  if (avgResponseTime < 60) { // 1小时内
    score += 10;
  }
  
  return Math.min(score, 100);
};

/**
 * 计算置信度
 */
const calculateConfidence = (
  user1: EnhancedUserProfile,
  user2: EnhancedUserProfile
): number => {
  let confidence = 50; // 基础置信度
  
  // 信息完整度
  const completeness1 = calculateProfileCompleteness(user1);
  const completeness2 = calculateProfileCompleteness(user2);
  confidence += (completeness1 + completeness2) / 2 * 0.3;
  
  // 验证状态
  const verifiedCount = [
    ...user1.capabilities.filter(c => c.verified),
    ...user2.capabilities.filter(c => c.verified)
  ].length;
  confidence += Math.min(verifiedCount * 5, 20);
  
  return Math.min(Math.round(confidence), 100);
};

/**
 * 计算用户画像完整度
 */
const calculateProfileCompleteness = (user: EnhancedUserProfile): number => {
  let score = 0;
  
  if (user.needs && user.needs.length > 0) score += 25;
  if (user.capabilities && user.capabilities.length > 0) score += 25;
  if (user.network && user.network.networkSize > 0) score += 25;
  if (user.behavior && user.behavior.activityScore > 0) score += 25;
  
  return score;
};

/**
 * 生成匹配理由
 */
const generateMatchReasons = (
  scores: any,
  user1: EnhancedUserProfile,
  user2: EnhancedUserProfile
): string[] => {
  const reasons: string[] = [];
  
  // 需求匹配理由
  if (scores.needsScore > 70) {
    reasons.push(`${user2.name}的技能完美匹配您的需求`);
  }
  
  // 能力匹配理由
  if (scores.capabilityScore > 70) {
    reasons.push('你们在专业领域高度重合，有很多共同话题');
  } else if (scores.capabilityScore > 40) {
    reasons.push('你们的技能互补，可以形成良好的合作');
  }
  
  // 关系匹配理由
  const mutualCount = user1.network.mutualConnections?.length || 0;
  if (mutualCount > 0) {
    reasons.push(`你们有 ${mutualCount} 个共同好友`);
  }
  
  // 行为匹配理由
  if (scores.behaviorScore > 70) {
    reasons.push('你们的工作习惯和沟通方式相似');
  }
  
  // 如果没有生成任何理由，添加默认理由
  if (reasons.length === 0) {
    reasons.push('基于 AI 分析，你们有潜在的合作机会');
  }
  
  return reasons;
};

/**
 * 批量计算匹配分数
 */
export const batchCalculateMatchScores = (
  currentUser: EnhancedUserProfile,
  candidates: EnhancedUserProfile[]
): Array<{ user: EnhancedUserProfile; score: MatchScore }> => {
  return candidates
    .map(candidate => ({
      user: candidate,
      score: calculateMatchScore(currentUser, candidate)
    }))
    .sort((a, b) => b.score.total - a.score.total);
};
