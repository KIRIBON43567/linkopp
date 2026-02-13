import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateOnboardingResponse, extractUserProfileFromChat } from '../services/geminiService';
import { QuickReply, ChatMessage } from '../types';
import { useUser } from '../contexts/UserContext';

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  sender: 'ai',
  text: '您好！我是您的 AI 助手。为了帮您找到最完美的合作伙伴，能告诉我您目前核心的业务需求是什么吗？',
  timestamp: new Date()
};

const QUICK_REPLIES: QuickReply[] = [
  { id: '1', text: '寻找开发人员' },
  { id: '2', text: '需要营销策略' },
  { id: '3', text: '寻求融资' },
  { id: '4', text: '寻找联合创始人' }
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice Input Logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("您的浏览器不支持语音输入，请使用 Chrome。");
      return;
    }
    
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      // Auto send after short delay or just let user confirm? Let's user confirm.
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate network delay for realism
    setTimeout(async () => {
      // Prepare history for Gemini
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: m.text
      }));
      // Add current user message
      history.push({ role: 'user', parts: text });

      const aiResponseText = await generateOnboardingResponse(history, text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      
      const newProgress = Math.min(user.progress + 15, 100);
      updateUser({ progress: newProgress });

      extractUserProfileFromChat(history).then(extractedData => {
         const cleanUpdates: any = {};
         if (extractedData.name) cleanUpdates.name = extractedData.name;
         if (extractedData.role) cleanUpdates.role = extractedData.role;
         if (extractedData.company) cleanUpdates.company = extractedData.company;
         if (extractedData.tags && extractedData.tags.length > 0) cleanUpdates.tags = extractedData.tags;
         
         if (Object.keys(cleanUpdates).length > 0) {
            updateUser(cleanUpdates);
         }
      });

    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-2 border-b border-gray-100 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold animate-fade-in">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 animate-fade-in">LINKOPP</h1>
          </div>
          <button onClick={() => navigate('/')} className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors">完成</button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-1 animate-slide-up">
          <span className="text-xs font-bold text-gray-400">资料完善度</span>
          <span className="text-xs font-bold text-blue-500">{user.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden animate-slide-up delay-100">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${user.progress}%` }}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
             <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
             </svg>
         </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} relative z-10 animate-slide-up`}
          >
            <div className={`flex items-start max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-500 shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
              )}
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={user.avatar} alt="User" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex w-full justify-start relative z-10 animate-fade-in">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-500">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies & Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F8FAFC] pb-6 pt-2 z-20">
        
        {/* Quick Replies Scroll */}
        <div className="overflow-x-auto whitespace-nowrap px-4 mb-4 hide-scrollbar">
          <div className="flex gap-2">
              <span className="text-xs text-gray-400 font-medium py-2 mr-1">快速回复</span>
            {QUICK_REPLIES.map(reply => (
              <button
                key={reply.id}
                onClick={() => handleSend(reply.text)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm hover:border-blue-400 hover:text-blue-500 transition-colors animate-fade-in"
              >
                {reply.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field with Voice */}
        <div className="px-4">
          <div className={`bg-white rounded-full shadow-lg border transition-colors duration-300 p-2 flex items-center gap-2 ${isListening ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-100'}`}>
            <button 
                onClick={startListening}
                className={`p-2 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isListening ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              placeholder={isListening ? "正在聆听..." : "输入需求..."}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-sm h-10"
            />
            <button 
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              className={`p-2 rounded-full transition-colors ${inputText.trim() ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
