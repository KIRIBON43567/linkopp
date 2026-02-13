import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const result = await api.getCurrentUser();
      if (result.success) {
        setUser(result.user);
      } else {
        navigate('/login');
      }
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.clearToken();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航 */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">链</span>
            </div>
            <span className="text-xl font-bold text-white">链机</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              🔔
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-white">👤</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            为你找到的合作机会
            <span className="ml-3 text-sm px-3 py-1 rounded-full bg-blue-500 text-white">3 NEW</span>
          </h1>
          <p className="text-gray-400">基于您的业务需求，AI 已为您匹配以下最佳人选</p>
        </div>

        {/* 推荐卡片 */}
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-color)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center relative">
                  <span className="text-2xl">👤</span>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-card)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">张伟</h3>
                  <p className="text-gray-400">TechFlow · CTO</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">94%</div>
                    <div className="text-xs text-gray-400">MATCH</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4 border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-400">💡</span>
                <span className="text-sm font-semibold text-blue-400">AI INSIGHT</span>
              </div>
              <p className="text-gray-300 italic">
                "双方在供应链 AI 领域有极高重合度，他在 Web3 的技术背景能补充您的项目短板。"
              </p>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 py-3 rounded-lg border border-[var(--border-color)] text-white hover:bg-[var(--bg-secondary)] transition-colors">
                查看对话
              </button>
              <button className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
                立即联系
              </button>
            </div>
          </div>
        </div>

        {/* 底部导航 */}
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-around">
            <button className="flex flex-col items-center space-y-1 text-blue-400">
              <span className="text-2xl">🏠</span>
              <span className="text-xs">首页</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white">
              <span className="text-2xl">✨</span>
              <span className="text-xs">推荐</span>
            </button>
            <button className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl -mt-8">
              +
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white">
              <span className="text-2xl">💬</span>
              <span className="text-xs">消息</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white"
            >
              <span className="text-2xl">👤</span>
              <span className="text-xs">我的</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
