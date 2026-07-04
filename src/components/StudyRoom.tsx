/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { playSynthSound } from '../lib/sound';
import { Play, Pause, RotateCcw, Zap, Coffee, ShieldAlert, Flame, BellRing, Star, Terminal, BookOpen, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StudyRoomProps {
  user: UserProfile;
  addMochiCoins: (coins: number, minutes: number) => void;
  awardBadge: (badgeId: string) => void;
  addStudyHistory: (minutes: number) => void;
  todayStudyMinutes: number;
}

interface DailyMission {
  id: string;
  desc: string;
  targetMinutes: number;
  reward: number;
  claimedKey: string;
}

const MISSIONS: DailyMission[] = [
  { id: 'm1', desc: 'Tập trung tích lũy 30 phút', targetMinutes: 30, reward: 10, claimedKey: 'mochi_mission_30_claimed' },
  { id: 'm2', desc: 'Tập trung tích lũy 60 phút', targetMinutes: 60, reward: 20, claimedKey: 'mochi_mission_60_claimed' },
  { id: 'm3', desc: 'Tập trung tích lũy 90 phút', targetMinutes: 90, reward: 30, claimedKey: 'mochi_mission_90_claimed' },
];

export default function StudyRoom({ user, addMochiCoins, awardBadge, addStudyHistory, todayStudyMinutes }: StudyRoomProps) {
  const [mode, setMode] = useState<'study' | 'read' | 'rest'>('study');
  const [duration, setDuration] = useState(50); // minutes
  const [timeLeft, setTimeLeft] = useState(50 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<{ id: string; title: string; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mochi_target_focus_task');
    if (saved) {
      try {
        const task = JSON.parse(saved);
        setActiveFocusTask(task);
        const totalMinutes = (task.hours || 0) * 60 + (task.minutes || 0);
        if (totalMinutes > 0) {
          setDuration(totalMinutes);
          setTimeLeft(totalMinutes * 60);
          setSmartQuote(`Mục tiêu được đồng bộ từ Lịch trình: "${task.title}". Hãy thẳng lưng và bấm BẮT ĐẦU!`);
        }
      } catch (e) {
        console.error('Error parsing active focus task', e);
      }
    }
  }, []);
  
  // Urgent Deadline state
  const [urgentMode, setUrgentMode] = useState<'none' | 'hourly' | 'daily'>(() => {
    return (localStorage.getItem('mochi_urgent_deadline_mode') as any) || 'none';
  });

  // Daily missions claim state
  const [claimedMissions, setClaimedMissions] = useState<string[]>(() => {
    const saved = [];
    if (localStorage.getItem('mochi_mission_30_claimed') === 'true') saved.push('m1');
    if (localStorage.getItem('mochi_mission_60_claimed') === 'true') saved.push('m2');
    if (localStorage.getItem('mochi_mission_90_claimed') === 'true') saved.push('m3');
    return saved;
  });

  // Feedback Board State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastSessionDuration, setLastSessionDuration] = useState(0);
  const [feedbackStars, setFeedbackStars] = useState(5);
  const [feedbackStatus, setFeedbackStatus] = useState('Hoàn thành tốt');

  const [sessionLogs, setSessionLogs] = useState<{ time: string; text: string; coinsEarned: number }[]>(() => {
    const saved = localStorage.getItem('mochi_session_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [smartQuote, setSmartQuote] = useState('Chào mừng bạn đến với Phòng Tập Trung. Hãy chọn thời lượng và bắt đầu cày deadline!');
  
  const smartTips = [
    'Lời nhắc: Thẳng lưng lên nào! Cột sống của bạn đang cảm ơn bạn đấy.',
    'Nhấp một ngụm nước ấm nhé, não bộ cần đủ nước để xử lý bài tập.',
    'Đừng mở tab mạng xã hội. Điện thoại nên úp màn hình xuống.',
    'Hít sâu vào... Thở ra chậm rãi... Bạn đang làm rất tốt!',
    'Mochi Coins đang được tích lũy. Hãy tập trung tối đa!',
    'Không gì có thể cản bước bạn hôm nay. Chạy nốt trang này nào!',
  ];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-enforce Hourly deadline constraints
  useEffect(() => {
    if (urgentMode === 'hourly') {
      // Force short focus sessions (30 or 45 mins)
      if (duration !== 30 && duration !== 45) {
        setDuration(30);
        setTimeLeft(30 * 60);
      }
    }
  }, [urgentMode]);

  // Save logs and urgent mode to local storage
  useEffect(() => {
    localStorage.setItem('mochi_session_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  useEffect(() => {
    localStorage.setItem('mochi_urgent_deadline_mode', urgentMode);
  }, [urgentMode]);

  // Synchronize initial timeLeft when duration changes (only if not currently running)
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isRunning]);

  // Handle countdown ticks
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          // Randomly trigger smart quotes
          if (prev % 300 === 0 && prev > 0) {
            const randomTip = smartTips[Math.floor(Math.random() * smartTips.length)];
            setSmartQuote(randomTip);
            playSynthSound('click');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, duration]);

  const handleStart = () => {
    playSynthSound('start');
    setIsRunning(true);
    setSmartQuote('Bắt đầu chu trình tập trung nghiêm ngặt. Hệ thống khóa các tác vụ gây xao nhãng!');
  };

  const handlePause = () => {
    playSynthSound('click');
    setIsRunning(false);
    setSmartQuote('Đã tạm dừng. Hãy quay lại ngay khi sẵn sàng nhé!');
  };

  const handleReset = () => {
    playSynthSound('click');
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setSmartQuote('Đã thiết lập lại đồng hồ. Sẵn sàng khởi động lại bất cứ lúc nào.');
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    setLastSessionDuration(duration);
    setShowFeedbackModal(true);
    playSynthSound('success');
  };

  const handleFeedbackSubmit = () => {
    // Calculate coins: 1 min = 1 Mochi Coin
    let earnedCoins = lastSessionDuration;
    
    // Enforce Hourly Deadline rule: Doubles Coins reward!
    if (urgentMode === 'hourly') {
      earnedCoins = earnedCoins * 2;
    }

    // Add Mochi Coins and record focus minutes
    addMochiCoins(earnedCoins, lastSessionDuration);
    addStudyHistory(lastSessionDuration);

    const now = new Date();
    const timeString = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    const newLog = {
      time: timeString,
      text: `Hoàn thành phiên [${mode === 'study' ? 'Học tập' : mode === 'read' ? 'Đọc sách' : 'Nghỉ ngơi'}] ${lastSessionDuration}p - Đánh giá: ${feedbackStars}⭐ (${feedbackStatus})`,
      coinsEarned: earnedCoins
    };

    setSessionLogs(prev => [newLog, ...prev]);
    setShowFeedbackModal(false);
    playSynthSound('success');
    setSmartQuote(`Xuất sắc! Bạn vừa nhận được ${earnedCoins} Mochi Coins.`);

    // If focusing on a target task, clear and mark completed
    if (activeFocusTask) {
      try {
        const savedGoals = localStorage.getItem('mochi_goals');
        if (savedGoals) {
          const goalsList = JSON.parse(savedGoals);
          const updated = goalsList.map((g: any) => g.id === activeFocusTask.id ? { ...g, completed: true } : g);
          localStorage.setItem('mochi_goals', JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Error updating goal status', e);
      }
      localStorage.removeItem('mochi_target_focus_task');
      setActiveFocusTask(null);
    }
  };

  // Claim Daily Mission Reward
  const handleClaimMission = (mission: DailyMission) => {
    if (todayStudyMinutes < mission.targetMinutes) return;
    if (claimedMissions.includes(mission.id)) return;

    addMochiCoins(mission.reward, 0);
    localStorage.setItem(mission.claimedKey, 'true');
    setClaimedMissions(prev => [...prev, mission.id]);
    playSynthSound('success');
    alert(`Đã nhận thành công +${mission.reward} Xu từ Nhiệm vụ hàng ngày!`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / (duration * 60)) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 max-w-7xl mx-auto relative">
      
      {/* star feedback board overlay */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-neutral-950 border border-amber-500/40 rounded-xl p-6 shadow-2xl relative space-y-5 text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
            
            <div className="space-y-1">
              <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest font-bold">PHIÊN HOÀN THÀNH</h2>
              <p className="text-xs text-neutral-400 font-sans">Vui lòng cung cấp phản hồi nhanh để tích hợp dữ liệu AI</p>
            </div>

            {/* Star selector */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setFeedbackStars(star);
                    playSynthSound('click');
                  }}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    className={`h-7 w-7 ${
                      star <= feedbackStars 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-neutral-700'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Mood selector */}
            <div className="space-y-1 text-left">
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Trạng thái tập trung</label>
              <select
                value={feedbackStatus}
                onChange={(e) => setFeedbackStatus(e.target.value)}
                className="w-full bg-black border border-neutral-900 text-xs text-neutral-200 rounded p-2 focus:outline-none focus:border-amber-500"
              >
                <option value="Hoàn thành tốt">Hoàn thành tốt (Good)</option>
                <option value="Bị xao nhãng">Bị xao nhãng (Distracted)</option>
                <option value="Quá mệt mỏi">Quá mệt mỏi (Too tired)</option>
              </select>
            </div>

            <button
              onClick={handleFeedbackSubmit}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2.5 rounded-lg transition-all font-mono uppercase tracking-widest"
            >
              NHẬN XU MOCHI COINS
            </button>
          </div>
        </div>
      )}

      {/* Left Column: Preset Selectors & Custom Duration Slider */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Deadline Urgency Selector */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40"></div>
          
          <h2 className="text-sm font-mono text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 animate-pulse" /> THUẬT TOÁN DEADLINE KHẨN CẤP
          </h2>

          <div className="space-y-2.5">
            {[
              { id: 'none', label: 'Tiêu chuẩn (Học tự do)', desc: 'Thời lượng tùy chọn tự do không ràng buộc hệ thống.' },
              { id: 'hourly', label: '🚨 Deadline bằng GIỜ (< 6 tiếng)', desc: 'Ép phiên học ngắn (30m/45m), khóa đổi viền, NHÂN ĐÔI (+200%) XU hoàn thành!' },
              { id: 'daily', label: '📅 Deadline bằng NGÀY (1-3 ngày)', desc: 'Gợi ý luân phiên tối ưu: 2 phiên Học sâu (50m) xen kẽ 1 phiên Nghỉ (10m).' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setUrgentMode(option.id as any);
                  playSynthSound('click');
                }}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                  urgentMode === option.id
                    ? 'bg-red-500/5 border-red-500 text-neutral-100'
                    : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-semibold uppercase tracking-wider">{option.label}</div>
                <p className="text-[10px] mt-1 text-neutral-500 font-sans leading-normal">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Daily Mission Section */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg">
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> NHIỆM VỤ HÀNG NGÀY
          </h2>

          <div className="space-y-3">
            {MISSIONS.map((m) => {
              const isAchieved = todayStudyMinutes >= m.targetMinutes;
              const isClaimed = claimedMissions.includes(m.id);
              
              return (
                <div 
                  key={m.id} 
                  className="p-3 bg-neutral-900/30 border border-neutral-900 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <p className={`font-semibold ${isAchieved ? 'text-amber-400' : 'text-neutral-400'}`}>{m.desc}</p>
                    <div className="text-[10px] font-mono text-neutral-500">
                      TIẾN ĐỘ: {todayStudyMinutes}/{m.targetMinutes} PHÚT • THƯỞNG: +{m.reward} XU
                    </div>
                  </div>

                  {isClaimed ? (
                    <span className="text-[10px] font-mono text-green-500 font-bold uppercase shrink-0">ĐÃ NHẬN</span>
                  ) : isAchieved ? (
                    <button
                      onClick={() => handleClaimMission(m)}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-2.5 py-1 rounded text-[10px] font-mono font-bold shrink-0 animate-bounce"
                    >
                      NHẬN THƯỞNG
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-600 font-bold uppercase shrink-0">CHƯA ĐẠT</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Center Column: The Visual Terminal Clock */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* The Cyber Timer Panel */}
        <div className="bg-neutral-950 border-2 border-neutral-900 rounded-2xl p-8 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden min-h-[400px]">
          
          {/* Active styling bg pulse */}
          {isRunning && (
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_70%)] animate-pulse`}></div>
          )}

          {/* Top Status Header */}
          <div className="absolute top-4 left-6 right-6 flex justify-between items-center border-b border-neutral-900 pb-3 w-full">
            {/* Mode selection tabs */}
            <div className="flex gap-1.5 p-0.5 bg-neutral-900 rounded-lg">
              {[
                { id: 'study', label: 'Học tập', icon: BookOpen },
                { id: 'read', label: 'Đọc sách', icon: Terminal },
                { id: 'rest', label: 'Nghỉ ngơi', icon: Coffee }
              ].map(opt => (
                <button
                  key={opt.id}
                  disabled={isRunning}
                  onClick={() => {
                    setMode(opt.id as any);
                    playSynthSound('click');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                    mode === opt.id 
                      ? 'bg-amber-500 text-black' 
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <opt.icon className="h-3 w-3" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="font-mono text-[10px] text-amber-500/60 bg-neutral-900/60 px-2 py-0.5 rounded">
              {urgentMode === 'hourly' ? '🚨 DEADLINE KHẨN CẤP' : urgentMode === 'daily' ? '📅 DEADLINE NGÀY' : 'POMODORO CHUẨN'}
            </div>
          </div>

          {activeFocusTask && (
            <div className="w-full max-w-sm mt-12 mb-[-24px] bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex items-center justify-between text-[11px] font-mono z-20">
              <span className="text-neutral-300 font-semibold truncate flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span className="truncate">🎯 FOCUS: <strong className="text-white">{activeFocusTask.title}</strong> ({(activeFocusTask.hours || 0) > 0 ? `${activeFocusTask.hours}h ` : ''}{activeFocusTask.minutes}m)</span>
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('mochi_target_focus_task');
                  setActiveFocusTask(null);
                  playSynthSound('click');
                }}
                className="text-[9px] text-neutral-500 hover:text-red-400 uppercase font-bold shrink-0 ml-2"
                title="Hủy lựa chọn"
              >
                [X]
              </button>
            </div>
          )}

          {/* Time Dial */}
          <div className="relative flex items-center justify-center my-8 h-64 w-64">
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-neutral-900"
                strokeWidth="2.5"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-300 stroke-amber-500`}
                strokeWidth="3"
                fill="transparent"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progressPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>

            <div className="z-10 text-center flex flex-col items-center">
              <Zap className="h-8 w-8 text-amber-500 mb-2" />
              <div className="font-mono text-5xl font-bold tracking-wider text-white select-none">
                {formatTime(timeLeft)}
              </div>
              <div className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase mt-1">
                {isRunning ? 'Hệ thống đang hoạt động' : 'Hệ thống chờ lệnh'}
              </div>
            </div>
          </div>

          {/* Slider input if not running */}
          {!isRunning && (
            <div className="w-full max-w-sm space-y-2 mb-4">
              <div className="flex justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                <span>Cấu hình thời lượng</span>
                <span className="text-amber-400 font-bold">{duration} phút</span>
              </div>
              <input
                type="range"
                min={urgentMode === 'hourly' ? 30 : 5}
                max={urgentMode === 'hourly' ? 45 : 120}
                step={5}
                value={duration}
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  playSynthSound('click');
                }}
                className="w-full h-1 bg-neutral-800 accent-amber-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[9px] text-neutral-600">
                <span>{urgentMode === 'hourly' ? '30 PHÚT' : '5 PHÚT'}</span>
                <span>{urgentMode === 'hourly' ? '45 PHÚT' : '120 PHÚT'}</span>
              </div>
            </div>
          )}

          {/* Controls Panel */}
          <div className="flex items-center gap-4 mt-2">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-95"
              >
                <Play className="h-4 w-4 fill-black" />
                <span>BẮT ĐẦU PHÊN CHẠY</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
              >
                <Pause className="h-4 w-4" />
                <span>TẠM DỪNG</span>
              </button>
            )}

            {!isRunning && (
              <button
                onClick={handleReset}
                className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-amber-500 rounded-xl transition-colors"
                title="Đặt lại"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Smart notification HUD bar */}
          <div className="mt-8 w-full bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 flex items-start gap-3">
            <BellRing className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-xs text-neutral-300 font-sans italic leading-relaxed">
              &ldquo;{smartQuote}&rdquo;
            </div>
          </div>
        </div>

        {/* History of Completed Sessions Today */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-500" /> BẢN GHI PHIÊN TẬP TRUNG HÔM NAY
          </h3>

          {sessionLogs.length === 0 ? (
            <div className="text-center py-6 text-neutral-600 text-xs">
              Chưa ghi nhận phiên tập trung thành công nào hôm nay. Sẵn sàng tích lũy Mochi Coins!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
              {sessionLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center bg-neutral-900/30 border border-neutral-900/80 rounded px-3 py-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-neutral-500 text-[10px]">{log.time}</span>
                    <span className="text-neutral-200 font-sans">{log.text}</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold">+{log.coinsEarned} Xu</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
