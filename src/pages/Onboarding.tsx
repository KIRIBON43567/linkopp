import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'basic' | 'skills' | 'needs'>('basic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = {
    basic: ['互联网', '金融', '教育', '医疗'],
    skills: ['技术开发', 'UI/UX设计', 'SaaS框架', '产品管理'],
    needs: ['寻找开发者', '寻求营销方案', '找投资人', '寻找合伙人'],
  };

  useEffect(() => {
    // 初始化对话
    initConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initConversation = async () => {
    setLoading(true);
    try {
      const result = await api.onboardingChat([], 'basic');
      if (result.success && result.message) {
        setMessages([{ role: 'assistant', content: result.message }]);
      }
    } catch (error) {
      console.error('Failed to init conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const result = await api.onboardingChat(newMessages, currentStep);
      if (result.success && result.message) {
        setMessages([...newMessages, { role: 'assistant', content: result.message }]);
        
        // 更新进度
        const newProgress = Math.min(progress + 15, 90);
        setProgress(newProgress);

        // 切换阶段
        if (newProgress >= 30 && currentStep === 'basic') {
          setCurrentStep('skills');
        } else if (newProgress >= 60 && currentStep === 'skills') {
          setCurrentStep('needs');
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages([...newMessages, { role: 'assistant', content: '抱歉，我遇到了一些问题，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部 */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">链</span>
            </div>
            <span className="text-lg font-semibold text-white">LinkMech</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
          >
            跳过
          </button>
        </div>

        {/* 进度条 */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">信息完善度</span>
            <span className="text-sm font-semibold text-blue-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-lg">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-[var(--bg-card)] text-white border border-[var(--border-color)]'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center ml-3 flex-shrink-0">
                  <span className="text-white text-lg">👤</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div className="bg-[var(--bg-card)] px-4 py-3 rounded-2xl border border-[var(--border-color)]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] p-4">
        <div className="max-w-4xl mx-auto">
          {/* 快速回复 */}
          {quickReplies[currentStep].length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">点击快速回复</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies[currentStep].map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="px-4 py-2 rounded-full bg-[var(--bg-secondary)] text-white text-sm hover:bg-[var(--border-color)] transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入框 */}
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              🎤
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的需求或选择上方选项..."
              className="flex-1 px-4 py-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
