import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Scenario {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'funding',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: '找投资人',
    description: 'AI 帮你匹配最适合的投资人，提升融资成功率',
    bgColor: 'bg-[#1F2937]',
    borderColor: 'border-yellow-500/30'
  },
  {
    id: 'partnership',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: '找合伙人',
    description: 'AI 分析技能互补性，找到最佳创业伙伴',
    bgColor: 'bg-[#1F2937]',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'supplier',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: '找供应商',
    description: 'AI 评估供应商能力，推荐可靠的合作伙伴',
    bgColor: 'bg-[#1F2937]',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'mentorship',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: '找导师',
    description: 'AI 匹配行业专家，获得职业发展指导',
    bgColor: 'bg-[#1F2937]',
    borderColor: 'border-purple-500/30'
  }
];

export const ScenarioPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    // 跳转到对应的场景引导页面
    setTimeout(() => {
      navigate(`/onboarding?scenario=${scenarioId}`);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1 className="text-3xl font-bold mb-2">选择你的目标</h1>
        <p className="text-gray-400">
          告诉 AI 你的需求，让智能匹配为你工作
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-4">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => handleScenarioSelect(scenario.id)}
            className={`
              ${scenario.bgColor}
              border-2 ${scenario.borderColor}
              rounded-2xl p-6 cursor-pointer
              transform transition-all duration-200
              ${selectedScenario === scenario.id ? 'scale-95 opacity-80' : 'hover:scale-[1.02] hover:border-opacity-60'}
              shadow-lg
            `}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 bg-gray-800/50 rounded-xl flex items-center justify-center text-white border border-gray-700/50">
                {scenario.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Hint */}
      <div className="mt-8 bg-[#1F2937] rounded-xl p-5 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-blue-300">AI 智能引导</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              选择场景后，AI 将通过对话深入了解你的需求，
              并自动匹配最合适的人选。整个过程就像和朋友聊天一样简单。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioPage;
