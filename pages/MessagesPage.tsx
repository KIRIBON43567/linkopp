import React from 'react';
import { BottomNav } from '../components/BottomNav';

export const MessagesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <div className="bg-white p-6 border-b border-gray-100 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-900">消息列表</h1>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">暂无消息</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">一旦您与匹配对象建立连接，私密对话将显示在这里。</p>
        </div>

        <BottomNav />
    </div>
  );
};
