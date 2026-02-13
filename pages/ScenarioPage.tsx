import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Scenario {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'funding',
    icon: '💰',
    title: '找投资人',
    description: 'AI 帮你匹配最适合的投资人，提升融资成功率',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'partnership',
    icon: '🤝',
    title: '找合伙人',
    description: 'AI 分析技能互补性，找到最佳创业伙伴',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'supplier',
    icon: '🏢',
    title: '找供应商',
    description: 'AI 评估供应商能力，推荐可靠的合作伙伴',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'mentorship',
    icon: '👨‍🏫',
    title: '找导师',
    description: 'AI 匹配行业专家，获得职业发展指导',
    color: 'from-purple-500 to-pink-500'
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
          className="mb-4 text-gray-400 hover:text-white transition-colors"
        >
          ← 返回
        </button>
        <h1 className="text-3xl font-bold mb-2">选择你的目标</h1>
        <p className="text-gray-400">
          告诉 AI 你的需求，让智能匹配为你工作
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 gap-4">
        {SCENARIOS.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => handleScenarioSelect(scenario.id)}
            className={`
              relative overflow-hidden rounded-2xl p-6 cursor-pointer
              transform transition-all duration-300
              ${selectedScenario === scenario.id ? 'scale-95' : 'hover:scale-105'}
              bg-gradient-to-br ${scenario.color}
            `}
            style={{
              boxShadow: selectedScenario === scenario.id
                ? '0 0 0 4px rgba(59, 130, 246, 0.5)'
                : '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Icon */}
            <div className="text-6xl mb-4">{scenario.icon}</div>

            {/* Content */}
            <h3 className="text-2xl font-bold mb-2">{scenario.title}</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              {scenario.description}
            </p>

            {/* Arrow */}
            <div className="absolute top-6 right-6">
              <svg
                className="w-6 h-6 text-white/50"
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
        ))}
      </div>

      {/* AI Hint */}
      <div className="mt-8 bg-[#1F2937] rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold mb-1">AI 智能引导</h4>
            <p className="text-sm text-gray-400">
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
