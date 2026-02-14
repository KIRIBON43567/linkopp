import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchProfile } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useUser } from '../contexts/UserContext';
import { AIDashboard } from '../components/AIDashboard';
import { AIDashboardData } from '../types/dashboard';
import { matchesAPI, dashboardAPI, autoCommunicationsAPI } from '../src/services/apiClient';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<AIDashboardData | null>(null);
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentCommId, setCurrentCommId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleDispatch = async (matchId: string, agentId: string) => {
    try {
      setDispatchingId(matchId);
      
      // Dispatch AI Agent
      const result = await autoCommunicationsAPI.dispatch({
        match_id: matchId,
        agent_id: agentId
      });

      setCurrentCommId(result.id);
      setShowProgress(true);
      setProgress(0);
      setProgressMessage('准备开始沟通...');

      // Start polling for progress
      const pollInterval = setInterval(async () => {
        try {
          const status = await autoCommunicationsAPI.getStatus(result.id);
          setProgress(status.progress || 0);
          setProgressMessage(status.message || '');

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setShowProgress(false);
            setDispatchingId(null);
            // Navigate to report page
            navigate(`/communication/${result.id}`);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setShowProgress(false);
            setDispatchingId(null);
            alert('沟通失败，请重试');
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 3000);

      // Cleanup on unmount
      return () => clearInterval(pollInterval);
    } catch (error: any) {
      console.error('Dispatch error:', error);
      setDispatchingId(null);
      alert(error.message || '派遣失败，请重试');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 加载驾驶舱数据
      try {
        const [statsResult, insightsResult] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getInsights()
        ]);
        
        setDashboardData({
          stats: {
            opportunitiesExplored: statsResult.stats?.opportunities_explored || 0,
            conversationsHeld: statsResult.stats?.conversations_held || 0,
            highPriorityMatches: statsResult.stats?.high_priority_matches || 0,
            meetingsScheduled: statsResult.stats?.meetings_scheduled || 0,
          },
          insights: insightsResult.insights || []
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        // 使用默认数据
        setDashboardData({
          stats: {
            opportunitiesExplored: 0,
            conversationsHeld: 0,
            highPriorityMatches: 0,
            meetingsScheduled: 0,
          },
          insights: []
        });
      }

      // 加载匹配数据
      try {
        let matchesResult = await matchesAPI.list({ limit: 20 });
        
        // 如果没有匹配记录，先计算匹配
        if (!matchesResult.matches || matchesResult.matches.length === 0) {
          await matchesAPI.calculate();
          matchesResult = await matchesAPI.list({ limit: 20 });
        }

        // 转换为前端格式
        const formattedMatches: MatchProfile[] = matchesResult.matches.map((m: any) => ({
          id: m.id,
          agentId: m.agent_id, // 保存 agent_id 用于派遣
          name: m.name,
          role: m.agent_role || m.role,
          company: m.agent_company || m.company,
          avatar: m.agent_avatar || 'https://picsum.photos/200/200',
          matchScore: m.match_score,
          insight: m.match_reason || '高度匹配',
          status: m.status || 'new'
        }));

        setMatches(formattedMatches);
      } catch (err: any) {
        console.error('Failed to load matches:', err);
        setError('加载匹配数据失败，请刷新重试');
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError(error.message || '加载失败，请刷新重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white pb-20">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-[#111827] sticky top-0 z-10 shadow-md shadow-[#111827]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          </div>
          <span className="text-xl font-bold tracking-tight animate-fade-in">LINKOPP</span>
        </div>
        <div className="flex gap-4 animate-fade-in">
            <button className="relative">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>
            <div className="w-8 h-8 rounded-full bg-yellow-200 overflow-hidden border border-white/20 cursor-pointer" onClick={() => navigate('/profile')}>
                <img src={user?.avatar || 'https://picsum.photos/200/200'} className="w-full h-full object-cover" alt="User" />
            </div>
        </div>
      </div>

      {/* AI Dashboard */}
      <div className="px-6">
        {dashboardData && <AIDashboard data={dashboardData} />}
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold animate-slide-up">推荐匹配</h1>
          <span className="bg-[#1F2937] text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-900/50 animate-slide-up">
            {matches.filter(m => m.status === 'new').length} 新增
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1 animate-slide-up delay-100">根据您的业务需求，AI 精选了最佳合作伙伴。</p>
      </div>

      {matches.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-400 mb-4">暂无匹配推荐</p>
          <button 
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            重新计算匹配
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {matches.map((match, index) => (
            <div 
              key={match.id} 
              onClick={() => navigate(`/match/${match.id}`)} 
              className="bg-[#1F2937] rounded-2xl p-5 border border-gray-700/50 shadow-xl cursor-pointer hover:bg-[#283546] transition-colors animate-slide-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700">
                      <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1F2937] rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{match.name}</h3>
                    <p className="text-gray-400 text-sm">{match.company} • {match.role}</p>
                  </div>
                </div>

                {/* Match Score Circle */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="26" stroke="#374151" strokeWidth="4" fill="none" />
                    <circle cx="28" cy="28" r="26" stroke="#3B82F6" strokeWidth="4" fill="none" strokeDasharray="163.36" strokeDashoffset={163.36 * (1 - match.matchScore / 100)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-bold leading-none">{match.matchScore}%</span>
                    <span className="text-[8px] text-gray-500 uppercase">匹配度</span>
                  </div>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className="bg-[#18202F] rounded-xl p-4 mb-5 border-l-2 border-blue-500 relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-2">
                     <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                     <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">AI 洞察</span>
                 </div>
                 <p className="text-gray-300 text-sm italic leading-relaxed">
                   "{match.insight}"
                 </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/match/${match.id}`);
                  }}
                  className="bg-[#374151] hover:bg-[#4B5563] text-white py-3 rounded-lg text-sm font-semibold transition-colors"
                >
                  查看详情
                </button>
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      handleDispatch(match.id, match.agentId || '');
                  }}
                  disabled={dispatchingId === match.id}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {dispatchingId === match.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>派遣中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>派遣 AI 沟通</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) - 场景选择 */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up delay-300">
        <button 
          onClick={() => navigate('/scenarios')}
          className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform text-white"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* Progress Modal */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-[#1F2937] rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">AI Agent 沟通中...</h3>
              <p className="text-gray-400 text-sm mb-6">{progressMessage}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-blue-400 font-semibold mb-6">{progress}%</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProgress(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  后台运行
                </button>
                <button
                  onClick={() => currentCommId && navigate(`/communication/${currentCommId}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  查看实时进度
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
