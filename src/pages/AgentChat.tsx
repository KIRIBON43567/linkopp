import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

const skillTags = ['Python', 'UI Design', 'Marketing', 'React', 'Data Analysis', 'Product Management'];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userSkills, setUserSkills] = useState(['UI/UX设计', 'SaaS框架']);
  const [progress, setProgress] = useState(65);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: '了解！我已经记录了您对 AI Agent 开发的浓厚兴趣。'
      },
      {
        role: 'ai',
        content: '太棒了！那么，作为交换，你能提供哪些核心资源或技能呢？'
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '非常好！您的技能组合很有价值。我会为您匹配需要这些技能的合作伙伴。还有其他想补充的吗？'
      }]);
      setProgress(prev => Math.min(prev + 15, 100));
    }, 1500);
  };

  const handleSkillTag = (skill: string) => {
    setInputValue(skill);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部状态栏 */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">9:41</span>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 用户信息卡片 */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-start space-x-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
            alt="User"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-800">张伟 (Alex)</h2>
              <div className="w-6 h-6 bg-[#2196F3] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">正在完善个人资源库...</p>

            {/* 技能标签 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {userSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-[#E3F2FD] text-[#2196F3] text-xs font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
              <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg">
                正在录入...
              </span>
            </div>

            {/* 进度条 */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2196F3] to-[#1976D2] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.role === 'ai' && (
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <div className="bg-[#F5F7FA] rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm text-gray-800 leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="flex items-end space-x-3 max-w-[80%]">
                  <div className="bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-2xl rounded-br-sm px-4 py-3">
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                  </div>
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                </div>
              )}
            </div>
          ))}

          {/* 加载动画 */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div className="bg-[#F5F7FA] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部输入区 */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {skillTags.map((skill, index) => (
              <button
                key={index}
                onClick={() => handleSkillTag(skill)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-[#E3F2FD] hover:border-[#2196F3] hover:text-[#2196F3] transition-all"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder="回复助手..."
            className="flex-1 bg-[#F5F7FA] border-0 rounded-full px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
          />
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-gradient-to-br from-[#2196F3] to-[#1976D2] rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
