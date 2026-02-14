import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

interface MatchDetail {
  id: number;
  targetUser: {
    id: number;
    username: string;
    company?: string;
    position?: string;
  };
  conversation: Array<{
    agent: string;
    message: string;
  }>;
  analysis: {
    matchScore: number;
    needsFulfillment: number;
    skillComplementarity: number;
    collaborationWillingness: number;
    collaborationAreas: string[];
    potentialDirections: string[];
    strengths: string[];
  };
  createdAt: string;
}

export default function MatchDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchDetail();
  }, [id]);

  const loadMatchDetail = async () => {
    try {
      const result = await api.getMatchDetail(Number(id));
      if (result.success && result.match) {
        setMatch(result.match);
      }
    } catch (error) {
      console.error('Failed to load match detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">匹配记录不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 顶部导航 */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            ← 返回
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">匹配详情</h1>
            <p className="text-sm text-gray-400">
              {new Date(match.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 用户信息卡片 */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{match.targetUser.username}</h2>
                <p className="text-gray-400">
                  {match.targetUser.company && match.targetUser.position
                    ? `${match.targetUser.company} · ${match.targetUser.position}`
                    : match.targetUser.company || match.targetUser.position || 'OPC 创业者'}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{match.analysis.matchScore}%</div>
                  <div className="text-xs text-gray-400">MATCH</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 匹配分析 */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-white mb-4">🎯 匹配分析</h3>
          
          <div className="space-y-4">
            {/* 各维度评分 */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">需求满足度</span>
                  <span className="text-sm font-semibold text-blue-400">{match.analysis.needsFulfillment}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: `${match.analysis.needsFulfillment}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">技能互补性</span>
                  <span className="text-sm font-semibold text-green-400">{match.analysis.skillComplementarity}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                    style={{ width: `${match.analysis.skillComplementarity}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">合作意愿</span>
                  <span className="text-sm font-semibold text-purple-400">{match.analysis.collaborationWillingness}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${match.analysis.collaborationWillingness}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 协作领域 */}
            {match.analysis.collaborationAreas.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">协作领域</h4>
                <div className="flex flex-wrap gap-2">
                  {match.analysis.collaborationAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 潜在合作方向 */}
            {match.analysis.potentialDirections.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">潜在合作方向</h4>
                <ul className="space-y-2">
                  {match.analysis.potentialDirections.map((direction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span className="text-gray-300 text-sm">{direction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 互补优势 */}
            {match.analysis.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">互补优势</h4>
                <ul className="space-y-2">
                  {match.analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">★</span>
                      <span className="text-gray-300 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Agent 对话记录 */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-white mb-4">🤖 Agent 对话记录</h3>
          
          <div className="space-y-4">
            {match.conversation.map((turn, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  turn.agent === 'user'
                    ? 'bg-blue-500/10 border-l-4 border-blue-500'
                    : 'bg-green-500/10 border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-semibold text-white">
                    {turn.agent === 'user' ? '你的 Agent' : `${match.targetUser.username} 的 Agent`}
                  </span>
                  <span className="text-xs text-gray-400">第 {index + 1} 轮</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{turn.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-lg border border-[var(--border-color)] text-white hover:bg-[var(--bg-secondary)] transition-colors"
          >
            返回首页
          </button>
          <button className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
            立即联系
          </button>
        </div>
      </div>
    </div>
  );
}
