import React from 'react';
import { BottomNav } from '../components/BottomNav';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm animate-slide-up">
        <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => navigate('/onboarding')}>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button className="absolute bottom-4 right-0 bg-blue-500 rounded-full p-1.5 text-white border-2 border-white group-hover:bg-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.role} | {user.company}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {user.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    {tag}
                  </span>
                ))}
            </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-up delay-200">
            <h3 className="font-bold text-gray-800 mb-3">您的智能体</h3>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                </div>
                <div>
                    <p className="text-sm font-semibold">智能体运行中</p>
                    <p className="text-xs text-gray-400">每 24 小时自动扫描新匹配</p>
                </div>
                <div className="ml-auto">
                    <div className="w-10 h-6 bg-green-500 rounded-full flex items-center px-1 justify-end">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="bg-white rounded-2xl p-4 shadow-sm animate-slide-up delay-300">
            <h3 className="font-bold text-gray-800 mb-3">设置</h3>
            <div className="space-y-3">
                 <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-sm text-gray-600">通知提醒</span>
                     <span className="text-gray-400 text-xs">已开启</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-sm text-gray-600">隐私设置</span>
                     <span className="text-gray-400 text-xs">公开</span>
                 </div>
                 <div className="flex justify-between items-center py-2 cursor-pointer">
                     <span className="text-sm text-red-500">退出登录</span>
                 </div>
            </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
