import React from 'react';
import { AIDashboardData } from '../types/dashboard';

interface AIDashboardProps {
  data: AIDashboardData;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ data }) => {
  const { stats, insights } = data;

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 mb-6 border border-blue-600/30 shadow-xl">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">
          AI 今日工作概览
        </h2>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label="探索机会"
          value={stats.opportunitiesExplored}
          unit="个"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          label="进行对话"
          value={stats.conversationsHeld}
          unit="次"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="高优先级"
          value={stats.highPriorityMatches}
          unit="个"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          label="安排会议"
          value={stats.meetingsScheduled}
          unit="个"
        />
      </div>

      {/* AI 洞察 */}
      {insights.length > 0 && (
        <div className="bg-blue-800/30 rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wide">
              智能洞察
            </h3>
          </div>
          <div className="space-y-2">
            {insights.slice(0, 2).map((insight) => (
              <div
                key={insight.id}
                className="text-sm text-blue-100 leading-relaxed"
              >
                "{insight.description}"
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 统计卡片组件
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, unit }) => {
  return (
    <div className="bg-blue-800/30 rounded-xl p-4 border border-blue-500/20">
      <div className="flex items-center gap-3">
        <div className="text-blue-300">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-blue-200/80 mb-1">
            {label}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white leading-none">
              {value}
            </span>
            <span className="text-sm text-blue-200/80">
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
