import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AgentChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 加载 Agent 状态
    loadAgentStatus();
    
    // 初始化对话
    setMessages([
      {
        role: 'assistant',
        content: '你好！我是你的专属 AI Agent。我可以帮你：\n\n1. 更新个人画像（技能、资源、需求）\n2. 设置自动社交策略\n3. 查看匹配状态和历史\n4. 提供智能建议\n\n有什么我可以帮你的吗？'
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAgentStatus = async () => {
    try {
      const response = await api.get('/api/agent/status');
      if (response.data.success) {
        setAgentStatus(response.data.status);
      }
    } catch (error) {
      console.error('Failed to load agent status:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // 添加用户消息
    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);

    try {
      const response = await api.post('/api/agent/chat', {
        message: userMessage,
        conversationHistory: messages
      });

      if (response.data.success) {
        // 添加 Agent 回复
        setMessages([
          ...newMessages,
          { role: 'assistant', content: response.data.reply }
        ]);

        // 如果有更新，刷新状态
        if (response.data.intent) {
          loadAgentStatus();
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '抱歉，我遇到了一些问题。请稍后再试。' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: '查看今日匹配', message: '今天帮我匹配了谁？' },
    { label: '开启自动社交', message: '我想每天自动匹配 5 个人' },
    { label: '更新技能', message: '我最近学会了新技能' },
    { label: '查看设置', message: '我的当前设置是什么？' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">AI Agent</h1>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Agent Status Card */}
      {agentStatus && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">今日自动社交</p>
                <p className="text-2xl font-bold text-white">
                  {agentStatus.todayUsage} / {agentStatus.todayLimit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">最近匹配</p>
                <p className="text-2xl font-bold text-white">
                  {agentStatus.recentMatches?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="container mx-auto px-4 pb-32">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-100 border border-gray-700'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/50 rounded-2xl px-4 py-3 border border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="fixed bottom-24 left-0 right-0 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(action.message);
                  }}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl px-4 py-3 text-sm border border-gray-700 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1 bg-gray-800 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
