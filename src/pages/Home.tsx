import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar: string;
  matchScore: number;
  isOnline: boolean;
  aiInsight: string;
}

const COLORS = {
  bgDarkPrimary: '#0F1C2E',
  bgDarkSecondary: '#1A2332',
  bgDarkTertiary: '#0F1A27',
  primary: '#2196F3',
  primaryDark: '#1976D2',
  statusOnline: '#4CAF50',
  textGray: '#9CA3AF',
  textLightGray: '#6B7280',
  borderGray: '#4B5563',
};

export default function Home() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [newCount] = useState(3);

  useEffect(() => {
    setRecommendations([
      {
        id: 1,
        name: '张伟',
        title: 'CTO',
        company: 'TechFlow',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        matchScore: 94,
        isOnline: true,
        aiInsight: '双方在供应链 AI 领域有极高重合度，他在 Web3 的技术背景能补充您的项目短板。'
      },
      {
        id: 2,
        name: '李思明',
        title: '创始合伙人',
        company: 'Nova Capital',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
        matchScore: 86,
        isOnline: false,
        aiInsight: '她近期关注的投资赛道与您的产品高度契合，且有 4 位共同联系人。'
      },
      {
        id: 3,
        name: '陈默',
        title: '主理人',
        company: 'DesignX',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        matchScore: 77,
        isOnline: true,
        aiInsight: '在设计系统和品牌自动化方向具有深厚经验，适合目前的品牌重塑计划。'
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen text-white mx-auto" style={{ backgroundColor: COLORS.bgDarkPrimary, maxWidth: '480px' }}>
      {/* 顶部导航栏 */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-sm px-5 py-4"
        style={{ backgroundColor: `${COLORS.bgDarkPrimary}f2` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">链机</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.primary }}>
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="w-11 h-11 rounded-full overflow-hidden border-2" style={{ borderColor: '#FFC107' }}>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" 
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="px-5 py-6 pb-24">
        {/* 标题区 */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold">为你找到的合作机会</h1>
            <span 
              className="text-white text-xs font-bold px-3 py-1 rounded-md"
              style={{ backgroundColor: COLORS.primary }}
            >
              {newCount} NEW
            </span>
          </div>
          <p className="text-sm" style={{ color: COLORS.textGray }}>
            基于您的业务需求，AI 已为您匹配以下最佳人选
          </p>
        </div>

        {/* 推荐卡片列表 */}
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-2xl p-5"
              style={{
                backgroundColor: COLORS.bgDarkSecondary,
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* 用户信息和匹配度 - 横向布局 */}
              <div className="flex items-center justify-between mb-5">
                {/* 左侧：头像和用户信息 */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-700">
                      <img 
                        src={rec.avatar} 
                        alt={rec.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {rec.isOnline && (
                      <span 
                        className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                        style={{ 
                          backgroundColor: COLORS.statusOnline,
                          borderColor: COLORS.bgDarkSecondary
                        }}
                      ></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1">{rec.name}</h3>
                    <p className="text-sm truncate" style={{ color: COLORS.textGray }}>
                      {rec.company} · {rec.title}
                    </p>
                  </div>
                </div>

                {/* 右侧：匹配度圆环 */}
                <div className="relative flex-shrink-0 ml-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#2D3748"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={COLORS.primary}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${rec.matchScore * 2.51} 251`}
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(33, 150, 243, 0.6))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{rec.matchScore}%</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: COLORS.textLightGray }}>MATCH</span>
                  </div>
                </div>
              </div>

              {/* AI INSIGHT */}
              <div                  className="rounded-2xl p-4 mb-5 border-l-4"
                style={{
                  backgroundColor: COLORS.bgDarkTertiary,
                  borderColor: COLORS.primary,
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: COLORS.primary }}>
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.primary }}>
                    AI INSIGHT
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  "{rec.aiInsight}"
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(`/match/${rec.id}`)}
                  className="flex-1 border text-white font-medium py-3.5 rounded-2xl transition-all hover:bg-gray-800/50"
                  style={{ borderColor: COLORS.borderGray }}
                >
                  查看对话
                </button>
                <button 
                  className="flex-1 text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: COLORS.primary,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryDark}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                >
                  <span>立即联系</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 底部导航栏 */}
      <nav 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-sm border-t border-gray-800/50"
        style={{ backgroundColor: `${COLORS.bgDarkPrimary}f2` }}
      >
        <div className="px-5 py-3">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center space-y-1" style={{ color: COLORS.primary }}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="text-xs font-medium">首页</span>
            </button>

            <button className="flex flex-col items-center space-y-1 text-gray-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium">推荐</span>
            </button>

            <button className="relative -mt-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: COLORS.primary,
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.5)'
                }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>

            <button className="flex flex-col items-center space-y-1 text-gray-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">消息</span>
            </button>

            <button className="flex flex-col items-center space-y-1 text-gray-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">我的</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
