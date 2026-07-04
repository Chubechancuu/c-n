/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { playSynthSound } from '../lib/sound';
import { Sparkles, Send, Brain, Bot, HelpCircle, Loader2, RefreshCw, AlertTriangle, MessageSquare } from 'lucide-react';

interface CompanionRoomProps {
  user: UserProfile;
  todayStudyMinutes: number;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const COMPANIONS = [
  {
    id: 'mochi',
    name: 'Mochi Trí Tuệ',
    emoji: '🍡',
    desc: 'Bé bánh nếp công nghệ cao, chuyên phân tích tiến độ và mắng yêu khi bạn lười học.',
    personality: 'hóm hỉnh, thông minh, thỉnh thoảng mắng yêu bằng thuật ngữ IT',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-400',
    animation: 'animate-bounce',
  },
  {
    id: 'usagyuuun',
    name: 'Thỏ Usagyuuun',
    emoji: '🐰',
    desc: 'Chú thỏ tăng động siêu cấp vũ trụ, truyền năng lượng tích cực cuồng nhiệt cho bạn.',
    personality: 'tăng động, phấn khích, dùng nhiều dấu chấm than, cực kỳ nhiệt huyết',
    color: 'from-pink-500/20 to-purple-500/10 border-pink-500/40 text-pink-400',
    animation: 'animate-pulse',
  },
  {
    id: 'capybara',
    name: 'Bộ Trưởng Capybara',
    emoji: '🍊',
    desc: 'Nhà ngoại giao điềm tĩnh tối thượng, giúp bạn xoa dịu lo lắng và cân bằng áp lực.',
    personality: 'điềm tĩnh, chill, thông thái, nhẹ nhàng, thích ngâm mình dưới nước nóng',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
    animation: 'animate-bounce',
  }
];

const SUGGESTIONS = [
  'Lên lịch ôn thi đại học hiệu quả',
  'Mẹo Pomodoro chống mỏi vai gáy',
  'Tại sao học code hay bị nản và cách giải quyết?',
  'Viết code Python giải bài toán Fibonacci',
];

export default function CompanionRoom({ user, todayStudyMinutes }: CompanionRoomProps) {
  const [selectedCompanion, setSelectedCompanion] = useState(() => {
    return localStorage.getItem('mochi_selected_companion') || 'mochi';
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`mochi_companion_chat_${selectedCompanion}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        content: `Hệ thống kiểm soát học tập xin chào Đặc vụ ${user.nickname || 'Mochi'}! Tôi là người bạn đồng hành của bạn. Hãy gửi tin nhắn để cùng nhau giải quyết mọi deadline học tập nhé!`
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const companion = COMPANIONS.find(c => c.id === selectedCompanion) || COMPANIONS[0];

  useEffect(() => {
    localStorage.setItem('mochi_selected_companion', selectedCompanion);
    // Reload messages for this companion or set default welcome
    const saved = localStorage.getItem(`mochi_companion_chat_${selectedCompanion}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch (e) { }
    }
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: `Hệ thống trực quan kết nối thành công! Tôi là ${COMPANIONS.find(c => c.id === selectedCompanion)?.name}. Hôm nay bạn muốn chinh phục môn học nào?`
      }
    ]);
  }, [selectedCompanion]);

  useEffect(() => {
    localStorage.setItem(`mochi_companion_chat_${selectedCompanion}`, JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    playSynthSound('click');
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Package payload for chat
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: chatHistory,
          companionType: companion.name + " (tính cách: " + companion.personality + ")"
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setMessages(prev => [...prev, {
          id: `msg-ai-${Date.now()}`,
          role: 'model',
          content: data.text
        }]);
        playSynthSound('success');
      } else {
        throw new Error(data.error || 'AI Server Connection Error');
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        content: `🔴 [MẤT KẾT NỐI] Không thể truyền dữ liệu tới máy chủ AI: ${err.message || 'Lỗi bất định'}. Vui lòng thử lại.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện với người bạn này?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: `Đã khởi tạo lại liên kết mạng lưới với ${companion.name}! Sẵn sàng nhận lệnh.`
        }
      ]);
      playSynthSound('click');
    }
  };

  // Simple formatter to parse linebreaks, bullets and bold tags
  const renderFormattedText = (txt: string) => {
    const lines = txt.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;
      // Handle bold texts like **bold**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-amber-400 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : formattedLine;

      // Handle simple bullet lines
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc mt-1 text-neutral-300">
            {line.trim().substring(2)}
          </li>
        );
      }

      return (
        <p key={idx} className="mt-1 leading-relaxed text-neutral-300">
          {content}
        </p>
      );
    });
  };

  const isPetHungry = todayStudyMinutes === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Left panel: Companion Selector */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Companion Picker */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
          
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4" /> BẠN ĐỒNG HÀNH
          </h2>

          <div className="space-y-3">
            {COMPANIONS.map((c) => {
              const isSelected = selectedCompanion === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCompanion(c.id);
                    playSynthSound('click');
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all duration-200 flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-amber-500/5 border-amber-500 text-neutral-100 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                      : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                  id={`comp-select-${c.id}`}
                >
                  <span className={`text-3xl select-none shrink-0 ${isSelected ? c.animation : ''}`}>
                    {c.emoji}
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider font-sans">{c.name}</span>
                      {isSelected && (
                        <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono uppercase px-1.5 py-0.2 rounded animate-pulse">
                          Đang kết nối
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-normal font-sans">
                      {c.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Pet Container State */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-mono text-[8px] text-neutral-600">LIVE_CAPSULE</span>
          </div>

          <div className="relative h-28 w-28 rounded-full bg-neutral-900/80 border border-neutral-800 flex items-center justify-center mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)] animate-pulse"></div>
            <span className={`text-6xl select-none ${companion.animation}`}>
              {companion.emoji}
            </span>
          </div>

          <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-widest">{companion.name}</h3>
          
          <div className="mt-3 w-full">
            {isPetHungry ? (
              <div className="bg-amber-500/5 border border-amber-500/30 rounded p-2.5 text-center animate-pulse">
                <div className="flex items-center justify-center gap-1.5 text-amber-500 font-mono text-[10px] font-bold">
                  <AlertTriangle className="h-3.5 w-3.5" /> THÚ CƯNG ĐANG ĐÓI!
                </div>
                <div className="text-[9px] text-neutral-400 font-sans mt-1 leading-normal">
                  Hôm nay bạn chưa học phút nào. Hãy hoàn thành tối thiểu 1 phiên học tập để cho thú cưng ăn nhé!
                </div>
              </div>
            ) : (
              <div className="bg-green-500/5 border border-green-500/30 rounded p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-green-500 font-mono text-[10px] font-bold">
                  ✓ NO NÊ & VUI VẺ
                </div>
                <div className="text-[9px] text-neutral-400 font-sans mt-1 leading-normal">
                  Hôm nay bạn đã tích lũy {todayStudyMinutes} phút tập trung. Thú cưng đang tràn đầy năng lượng!
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right panel: Chat Interactive Engine */}
      <div className="lg:col-span-8 flex flex-col h-[520px] bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden shadow-2xl">
        {/* Chat header */}
        <div className="bg-neutral-900/50 border-b border-neutral-900 px-5 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Bot className="h-4 w-4 text-amber-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
                LIÊN KẾT TRỰC TUYẾN // {companion.name}
              </h3>
              <p className="text-[9px] font-sans text-neutral-500 leading-tight">
                Mẫu AI Gemini-3.5-Flash tối ưu hóa học thuật
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-[9px] font-mono bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2 py-1 rounded text-neutral-500 hover:text-red-400 transition-colors"
            title="Xóa lịch sử chat"
          >
            RESET CHAT
          </button>
        </div>

        {/* Message body container */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 border leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-black border-amber-600 font-medium rounded-tr-none shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'bg-neutral-900/80 text-neutral-200 border-neutral-800/80 rounded-tl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="font-mono text-[9px] text-amber-500/60 uppercase tracking-widest mb-1 font-bold flex items-center gap-1">
                      <span>{companion.name}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line">
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-900/80 text-neutral-400 border border-neutral-800/80 rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase animate-pulse">
                  Đang giải mã phản hồi...
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion prompt microchips */}
        <div className="px-5 py-2.5 border-t border-neutral-900 bg-neutral-900/20">
          <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500/80" /> GỢI Ý CÂU HỎI NHANH
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug)}
                disabled={isLoading}
                className="text-[9px] font-sans bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 px-2.5 py-1 rounded border border-neutral-800 hover:border-amber-500/30 transition-all disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="border-t border-neutral-900 p-3 bg-neutral-950 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Gửi câu hỏi của bạn cho ${companion.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-black border border-neutral-800 focus:border-amber-500 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
            id="companion-chat-input"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-900 text-black disabled:text-neutral-600 font-semibold p-2.5 rounded-lg transition-all flex items-center justify-center shrink-0"
            id="companion-chat-submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
