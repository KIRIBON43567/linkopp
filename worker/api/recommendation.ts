import { Database } from '../db/database';

interface UserProfile {
  userId: number;
  company?: string;
  position?: string;
  industry?: string;
  location?: string;
  skills?: string;
  resources?: string;
  needs?: string;
}

interface RecommendationScore {
  userId: number;
  score: number;
  reasons: string[];
}

/**
 * 智能推荐算法
 * 基于用户画像计算匹配度
 */
export class RecommendationEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * 为用户推荐最匹配的候选人
   */
  async getRecommendations(
    userId: number,
    limit: number = 10,
    excludeUserIds: number[] = []
  ): Promise<RecommendationScore[]> {
    // 获取当前用户画像
    const userProfile = await this.getUserProfile(userId);
    if (!userProfile) {
      return [];
    }

    // 获取所有其他用户的画像
    const allProfiles = await this.getAllUserProfiles(userId, excludeUserIds);

    // 计算每个用户的匹配度
    const scores: RecommendationScore[] = [];
    for (const targetProfile of allProfiles) {
      const score = this.calculateMatchScore(userProfile, targetProfile);
      scores.push(score);
    }

    // 按分数降序排序
    scores.sort((a, b) => b.score - a.score);

    // 返回前 N 个
    return scores.slice(0, limit);
  }

  /**
   * 计算两个用户之间的匹配度
   */
  private calculateMatchScore(
    user: UserProfile,
    target: UserProfile
  ): RecommendationScore {
    let totalScore = 0;
    const reasons: string[] = [];

    // 1. 行业相似度 (20%)
    if (user.industry && target.industry) {
      if (user.industry.toLowerCase() === target.industry.toLowerCase()) {
        totalScore += 20;
        reasons.push(`同行业（${user.industry}）`);
      }
    }

    // 2. 地区相似度 (10%)
    if (user.location && target.location) {
      if (user.location.toLowerCase() === target.location.toLowerCase()) {
        totalScore += 10;
        reasons.push(`同地区（${user.location}）`);
      }
    }

    // 3. 需求与技能互补 (40%)
    const needsSkillsScore = this.calculateNeedsSkillsMatch(user, target);
    totalScore += needsSkillsScore.score;
    reasons.push(...needsSkillsScore.reasons);

    // 4. 资源互补 (20%)
    const resourcesScore = this.calculateResourcesMatch(user, target);
    totalScore += resourcesScore.score;
    reasons.push(...resourcesScore.reasons);

    // 5. 职位互补 (10%)
    if (user.position && target.position) {
      const positionScore = this.calculatePositionMatch(user.position, target.position);
      totalScore += positionScore.score;
      reasons.push(...positionScore.reasons);
    }

    return {
      userId: target.userId,
      score: Math.min(100, totalScore),
      reasons,
    };
  }

  /**
   * 计算需求与技能的互补性
   */
  private calculateNeedsSkillsMatch(
    user: UserProfile,
    target: UserProfile
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    if (!user.needs || !target.skills) {
      return { score, reasons };
    }

    const userNeeds = this.extractKeywords(user.needs);
    const targetSkills = this.extractKeywords(target.skills);

    // 计算交集
    const matches = userNeeds.filter(need =>
      targetSkills.some(skill => this.isSimilar(need, skill))
    );

    if (matches.length > 0) {
      score = Math.min(40, matches.length * 10);
      reasons.push(`对方擅长你需要的领域（${matches.slice(0, 3).join('、')}）`);
    }

    // 反向匹配：对方需要的，你擅长的
    if (target.needs && user.skills) {
      const targetNeeds = this.extractKeywords(target.needs);
      const userSkills = this.extractKeywords(user.skills);

      const reverseMatches = targetNeeds.filter(need =>
        userSkills.some(skill => this.isSimilar(need, skill))
      );

      if (reverseMatches.length > 0) {
        score += Math.min(20, reverseMatches.length * 5);
        reasons.push(`你擅长对方需要的领域（${reverseMatches.slice(0, 3).join('、')}）`);
      }
    }

    return { score, reasons };
  }

  /**
   * 计算资源互补性
   */
  private calculateResourcesMatch(
    user: UserProfile,
    target: UserProfile
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    if (!user.resources || !target.resources) {
      return { score, reasons };
    }

    const userResources = this.extractKeywords(user.resources);
    const targetResources = this.extractKeywords(target.resources);

    // 资源互补：不同的资源更有价值
    const uniqueResources = targetResources.filter(
      res => !userResources.some(ur => this.isSimilar(ur, res))
    );

    if (uniqueResources.length > 0) {
      score = Math.min(20, uniqueResources.length * 5);
      reasons.push(`拥有互补资源（${uniqueResources.slice(0, 3).join('、')}）`);
    }

    return { score, reasons };
  }

  /**
   * 计算职位互补性
   */
  private calculatePositionMatch(
    userPosition: string,
    targetPosition: string
  ): { score: number; reasons: string[] } {
    const complementaryPairs = [
      ['CEO', 'CTO'],
      ['CEO', 'CFO'],
      ['产品经理', '技术总监'],
      ['设计师', '开发者'],
      ['市场', '销售'],
    ];

    for (const [pos1, pos2] of complementaryPairs) {
      if (
        (userPosition.includes(pos1) && targetPosition.includes(pos2)) ||
        (userPosition.includes(pos2) && targetPosition.includes(pos1))
      ) {
        return {
          score: 10,
          reasons: [`职位互补（${pos1} + ${pos2}）`],
        };
      }
    }

    return { score: 0, reasons: [] };
  }

  /**
   * 从文本中提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取：按逗号、顿号、空格分割
    return text
      .split(/[,，、\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
  }

  /**
   * 判断两个词是否相似
   */
  private isSimilar(word1: string, word2: string): boolean {
    // 简单的相似度判断：包含关系
    const w1 = word1.toLowerCase();
    const w2 = word2.toLowerCase();
    return w1.includes(w2) || w2.includes(w1);
  }

  /**
   * 获取用户画像
   */
  private async getUserProfile(userId: number): Promise<UserProfile | null> {
    const profile = await this.db.getUserProfile(userId);
    if (!profile) {
      return null;
    }

    return {
      userId,
      company: profile.company,
      position: profile.position,
      industry: profile.industry,
      location: profile.location,
      skills: profile.skills,
      resources: profile.resources,
      needs: profile.needs,
    };
  }

  /**
   * 获取所有其他用户的画像
   */
  private async getAllUserProfiles(
    currentUserId: number,
    excludeUserIds: number[]
  ): Promise<UserProfile[]> {
    const allUsers = await this.db.getAllUsers();
    const profiles: UserProfile[] = [];

    for (const user of allUsers) {
      // 排除当前用户和已排除的用户
      if (user.id === currentUserId || excludeUserIds.includes(user.id)) {
        continue;
      }

      const profile = await this.getUserProfile(user.id);
      if (profile) {
        profiles.push(profile);
      }
    }

    return profiles;
  }
}
