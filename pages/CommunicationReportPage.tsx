import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { autoCommunicationsAPI, conversationsAPI } from '../src/services/apiClient';

interface CommunicationReport {
  id: string;
  status: string;
  agent_name: string;
  agent_company: string;
  summary: string;
  key_points: string[];
  sentiment: string;
  next_steps: string;
  conversation_id: string;
  message_count: number;
  duration: number;
  created_at: number;
  completed_at: number;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export const CommunicationReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<CommunicationReport | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportData = await autoCommunicationsAPI.getReport(id!);
      setReport(reportData);

      // Load messages
      if (reportData.conversation_id) {
        const messagesData = await conversationsAPI.getMessages(reportData.conversation_id);
        setMessages(messagesData.messages || []);
      }
    } catch (err: any) {
      console.error('Load report error:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'negative':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '积极';
      case 'negative':
        return '消极';
      default:
        return '中性';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-300 mb-4">{error || '报告不存在'}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white pb-6">
      {/* Header */}
      <div className="p-6 bg-[#1F2937] border-b border-gray-700 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">沟通报告</h1>
            <p className="text-sm text-gray-400">与 {report.agent_name} 的 AI 对话</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Agent Info Card */}
        <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {report.agent_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{report.agent_name}</h2>
              <p className="text-gray-400">{report.agent_company}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">对话轮数</p>
              <p className="text-2xl font-bold text-blue-400">{report.message_count}</p>
            </div>
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">用时</p>
              <p className="text-2xl font-bold text-blue-400">{formatDuration(report.duration)}</p>
            </div>
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">情感</p>
              <p className={`text-sm font-bold px-2 py-1 rounded border ${getSentimentColor(report.sentiment)}`}>
                {getSentimentText(report.sentiment)}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold">对话摘要</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{report.summary}</p>
        </div>

        {/* Key Points Card */}
        <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-lg font-bold">关键要点</h3>
          </div>
          <ul className="space-y-3">
            {report.key_points.map((point, index) => (
              <li key={index} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-300 flex-1">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps Card */}
        <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <h3 className="text-lg font-bold">下一步建议</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{report.next_steps}</p>
        </div>

        {/* Conversation Toggle */}
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="w-full bg-[#1F2937] hover:bg-[#283546] rounded-2xl p-6 border border-gray-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-bold">完整对话记录</h3>
          </div>
          <svg 
            className={`w-5 h-5 transition-transform ${showMessages ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Conversation Messages */}
        {showMessages && (
          <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  <span className="text-white text-xs font-bold">
                    {msg.sender === 'user' ? 'U' : 'A'}
                  </span>
                </div>
                <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#111827] text-gray-300'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            返回首页
          </button>
          <button
            onClick={() => {
              // TODO: Share functionality
              alert('分享功能开发中...');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            分享报告
          </button>
        </div>
      </div>
    </div>
  );
};
