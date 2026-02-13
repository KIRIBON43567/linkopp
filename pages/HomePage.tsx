import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchProfile } from '../types';
import { BottomNav } from '../components/BottomNav';
import { useUser } from '../contexts/UserContext';

const MOCK_MATCHES: MatchProfile[] = [
  {
    id: '1',
    name: '张伟',
    role: '技术总监 (CTO)',
    company: 'TechFlow',
    avatar: 'https://picsum.photos/id/1/200/200',
    matchScore: 94,
    insight: '供应链 AI 领域高度重合。他的 Web3 技术背景完美互补您的项目缺口。',
    status: 'new'
  },
  {
    id: '2',
    name: '李思敏',
    role: '创始合伙人',
    company: 'Nova Capital',
    avatar: 'https://picsum.photos/id/64/200/200',
    matchScore: 86,
    insight: '她最近的投资赛道与您的产品高度一致。你们有 4 个共同好友。',
    status: 'new'
  },
  {
    id: '3',
    name: '陈默',
    role: '设计总监',
    company: 'DesignX',
    avatar: 'https://picsum.photos/id/91/200/200',
    matchScore: 77,
    insight: '在设计系统和品牌自动化方面经验丰富，适合您当前的品牌重塑计划。',
    status: 'viewed'
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

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
            <div className="w-8 h-8 rounded-full bg-yellow-200 overflow-hidden border border-white/20" onClick={() => navigate('/profile')}>
                <img src={user.avatar} className="w-full h-full object-cover" alt="User" />
            </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold animate-slide-up">推荐匹配</h1>
          <span className="bg-[#1F2937] text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-900/50 animate-slide-up">3 新增</span>
        </div>
        <p className="text-gray-400 text-sm mt-1 animate-slide-up delay-100">根据您的业务需求，AI 精选了最佳合作伙伴。</p>
      </div>

      <div className="px-4 space-y-4">
        {MOCK_MATCHES.map((match, index) => (
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
                查看对话
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold transition-colors">
                立即连接
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button (FAB) from screenshot */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up delay-300">
        <button className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};
