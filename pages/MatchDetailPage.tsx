import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatMessage, AgentAnalysis, MatchProfile } from '../types';
import { useUser } from '../contexts/UserContext';
import { simulateAgentInteraction } from '../services/geminiService';

// Expanded Mock Data
const MOCK_PROFILES: Record<string, MatchProfile> = {
  '1': {
    id: '1', name: '张伟', role: '技术总监 (CTO)', company: 'TechFlow', avatar: 'https://picsum.photos/id/1/200/200', matchScore: 94, status: 'new',
    insight: '供应链 AI 领域高度重合。他的 Web3 技术背景完美互补您的项目缺口。'
  },
  '2': {
    id: '2', name: '李思敏', role: '创始合伙人', company: 'Nova Capital', avatar: 'https://picsum.photos/id/64/200/200', matchScore: 86, status: 'new',
    insight: '她最近的投资赛道与您的产品高度一致。你们有 4 个共同好友。'
  },
  '3': {
    id: '3', name: '陈默', role: '设计总监', company: 'DesignX', avatar: 'https://picsum.photos/id/91/200/200', matchScore: 77, status: 'viewed',
    insight: '在设计系统和品牌自动化方面经验丰富，适合您当前的品牌重塑计划。'
  }
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'agent-a',
    text: '你好。我已经扫描了你的 API 文档。我可以为你处理高并发数据提取任务。目前我的吞吐量支持 5k+ QPS。',
    timestamp: new Date()
  },
  {
    id: '2',
    sender: 'agent-b',
    text: '太好了。我需要一个能自动将非结构化 JSON 映射到标准 SQL 模式的合作伙伴。这方面你的映射准确率如何？',
    timestamp: new Date()
  },
  {
    id: '3',
    sender: 'agent-a',
    text: '在基准测试中，我对复杂嵌套结构的映射准确率为 98.4%。我可以实时处理你的 LogicFlow 管道输出。',
    timestamp: new Date()
  }
];

const ANALYSIS: AgentAnalysis = {
  satisfaction: 9,
  complementary: 8,
  willingness: 9,
  reason: 'Agent A 的高吞吐量数据处理能力完美弥补了 Agent B 在复杂数据标准化方面的短板。双方已就协议接口达成共识。'
};

const ProgressBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
      <span>{label}</span>
      <span className="text-blue-500">{score}/10</span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 rounded-full" 
        style={{ width: `${score * 10}%` }}
      />
    </div>
  </div>
);

export const MatchDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [userQuery, setUserQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const matchProfile = id ? MOCK_PROFILES[id] : MOCK_PROFILES['1'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSimulate = async () => {
    if (!userQuery.trim() || isSimulating) return;
    
    setIsSimulating(true);
    // Add user's "off-the-record" instruction
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
        id: tempId,
        sender: 'user', // We'll treat this specially in UI
        text: `(指令) 帮我问问他：${userQuery}`,
        timestamp: new Date(),
        isInsight: true
    }]);
    
    setUserQuery('');

    // Call Gemini
    const result = await simulateAgentInteraction(userQuery, user, matchProfile);
    
    setMessages(prev => [
        ...prev,
        {
            id: (Date.now() + 1).toString(),
            sender: 'agent-a',
            text: result.question,
            timestamp: new Date()
        },
        {
            id: (Date.now() + 2).toString(),
            sender: 'agent-b',
            text: result.answer,
            timestamp: new Date()
        }
    ]);
    
    setIsSimulating(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI 智能体协作</span>
            <h1 className="text-lg font-bold text-gray-900">AI 对话记录</h1>
        </div>
        <button className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
        </button>
      </div>

      {/* Match Header Visualization */}
      <div className="py-6 px-8 flex justify-between items-center bg-white relative">
          <div className="absolute top-1/2 left-8 right-8 h-px bg-gray-100 -z-10 transform -translate-y-1/2"></div>
          
          <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full p-1 bg-white border border-gray-100 shadow-sm">
                 <img src={user.avatar} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="mt-2 text-xs font-bold text-gray-400 uppercase">You (Agent A)</span>
          </div>

          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-200 flex flex-col items-center justify-center text-white z-10 border-4 border-white">
              <span className="text-[10px] font-medium opacity-80">匹配度</span>
              <span className="text-2xl font-bold leading-none">{matchProfile.matchScore}<span className="text-sm">%</span></span>
          </div>

          <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full p-1 bg-white border border-gray-100 shadow-sm">
                 <img src={matchProfile.avatar} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="mt-2 text-xs font-bold text-gray-400 uppercase">{matchProfile.name} (Agent B)</span>
          </div>
      </div>

      {/* Chat Transcript */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-6 pb-32">
        <div className="text-center">
             <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">历史自动对话</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col space-y-1">
             {/* System/User Command Messages */}
             {msg.isInsight ? (
                 <div className="flex justify-center my-2">
                     <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-lg font-mono">{msg.text}</span>
                 </div>
             ) : (
                <>
                 <span className={`text-[10px] text-gray-400 px-1 ${msg.sender === 'agent-a' ? 'text-left' : 'text-right'}`}>
                     {msg.sender === 'agent-a' ? 'Your Agent' : 'Remote Agent'}
                 </span>
                 <div className={`flex items-end gap-2 ${msg.sender === 'agent-b' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white shadow-sm">
                       <img 
                        src={msg.sender === 'agent-a' ? user.avatar : matchProfile.avatar} 
                        className="w-full h-full object-cover" 
                       />
                    </div>
                    <div 
                        className={`max-w-[80%] p-4 text-[15px] leading-relaxed shadow-sm ${
                            msg.sender === 'agent-b' 
                            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none' 
                            : 'bg-white text-gray-700 rounded-2xl rounded-tl-none border border-gray-100'
                        }`}
                    >
                        {msg.text}
                    </div>
                 </div>
                </>
             )}
          </div>
        ))}
        {isSimulating && (
            <div className="flex justify-center my-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    <span className="text-xs text-gray-500 font-medium">Agent 正在谈判...</span>
                </div>
            </div>
        )}

        {/* Smart Analysis Card */}
        <div className="mt-8 bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                <h3 className="font-bold text-gray-900">智能协作分析</h3>
            </div>
            
            <ProgressBar label="需求满足度" score={ANALYSIS.satisfaction} />
            <ProgressBar label="技能互补性" score={ANALYSIS.complementary} />
            <ProgressBar label="合作意愿" score={ANALYSIS.willingness} />
            
            <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 mb-2">核心匹配原因</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {ANALYSIS.reason}
                </p>
            </div>
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Simulation Input (Agent Action) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 pb-safe">
        <div className="p-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                <span className="text-xs font-bold text-blue-600 whitespace-nowrap">让 Agent 问:</span>
                <input 
                    type="text" 
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                    placeholder="例如: 你懂 React 吗?"
                    className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                    disabled={isSimulating}
                />
                <button 
                    onClick={handleSimulate}
                    disabled={!userQuery.trim() || isSimulating}
                    className={`p-1.5 rounded-full ${userQuery.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                >
                    <svg className="w-4 h-4 transform -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </div>
            <div className="flex justify-between mt-2 px-2">
                <button 
                    onClick={() => navigate('/')}
                    className="text-xs text-gray-400 font-medium hover:text-gray-600"
                >
                    返回列表
                </button>
                <button className="text-xs text-blue-600 font-bold hover:text-blue-700">
                    立即连接 (Connect)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
