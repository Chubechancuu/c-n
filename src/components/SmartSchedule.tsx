/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TimetableItem, GoalItem } from '../types';
import { playSynthSound } from '../lib/sound';
import { 
  Calendar, Plus, Trash2, Sparkles, BrainCircuit, Loader2, AlertCircle, 
  Clock, BookOpen, ListTodo, ShieldAlert, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle2, Play, Hourglass, CalendarRange, Check, X
} from 'lucide-react';

interface SmartScheduleProps {
  setActiveTab?: (tab: string) => void;
}

const DEFAULT_TIMETABLE: TimetableItem[] = [
  { id: 't1', day: 'Thứ 2', time: '08:00 - 10:00', subject: 'Cấu trúc dữ liệu & Giải thuật' },
  { id: 't2', day: 'Thứ 3', time: '14:00 - 16:30', subject: 'Lập trình Hướng đối tượng' },
  { id: 't3', day: 'Thứ 4', time: '09:00 - 11:30', subject: 'Cơ sở dữ liệu SQL' },
  { id: 't4', day: 'Thứ 5', time: '13:30 - 15:30', subject: 'Hệ điều hành Unix/Linux' },
  { id: 't5', day: 'Thứ 6', time: '10:00 - 12:00', subject: 'Đại số tuyến tính' },
];

const DEFAULT_GOALS: GoalItem[] = [
  { id: 'g1', title: 'Nộp Lab 3 Cấu trúc dữ liệu', deadline: '2026-07-01', priority: 'high', focusHours: 1, focusMinutes: 30, completed: true },
  { id: 'g2', title: 'Thi giữa kỳ Lập trình OOP', deadline: '2026-07-03', priority: 'high', focusHours: 2, focusMinutes: 0, completed: false },
  { id: 'g3', title: 'Đọc chương 4 Hệ điều hành', deadline: '2026-07-05', priority: 'medium', focusHours: 0, focusMinutes: 45, completed: false },
  { id: 'g4', title: 'Tìm hiểu Drizzle ORM', deadline: '2026-07-10', priority: 'low', focusHours: 3, focusMinutes: 0, completed: false },
];

export default function SmartSchedule({ setActiveTab }: SmartScheduleProps) {
  const [timetable, setTimetable] = useState<TimetableItem[]>(() => {
    const saved = localStorage.getItem('mochi_timetable');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_TIMETABLE;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const saved = localStorage.getItem('mochi_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_GOALS;
  });

  // Calendar View states
  // We mock default calendar around current local time of July 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-03');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);

  // Sub-tab selection inside scheduler panel
  const [scheduleSubTab, setScheduleSubTab] = useState<'calendar' | 'list' | 'timetable'>('calendar');

  // Timetable form inputs
  const [newDay, setNewDay] = useState('Thứ 2');
  const [newTime, setNewTime] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // Goal form inputs
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('2026-07-03');
  const [newGoalDeadlineTime, setNewGoalDeadlineTime] = useState('22:00');
  const [newGoalPriority, setNewGoalPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newGoalHours, setNewGoalHours] = useState<number>(1);
  const [newGoalMinutes, setNewGoalMinutes] = useState<number>(0);
  const [selectedTaskType, setSelectedTaskType] = useState<'logic' | 'creative' | 'review'>('logic');

  // AI optimizer states
  const [aiReport, setAiReport] = useState(() => {
    return localStorage.getItem('mochi_ai_timetable_optimization') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Browser Notification & Alert States
  const [notifPermission, setNotifPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [activeAlerts, setActiveAlerts] = useState<{ id: string; title: string; timeRemainingStr: string }[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('chronos_notified_goal_ids');
    try { return saved ? JSON.parse(saved) : []; } catch (e) { return []; }
  });

  // Simulated July 2026 Clock ticking
  const [simulatedClock, setSimulatedClock] = useState<Date>(() => {
    const d = new Date();
    d.setFullYear(2026);
    d.setMonth(6); // July
    return d;
  });

  // Ticks the simulated clock to stay in sync with the current system hour/minute/second in July 2026
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      d.setFullYear(2026);
      d.setMonth(6); // July
      setSimulatedClock(d);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check deadlines every 5 seconds
  useEffect(() => {
    const checkDeadlines = () => {
      const nowMs = simulatedClock.getTime();
      const newAlerts: { id: string; title: string; timeRemainingStr: string }[] = [];
      const updatedNotified = [...notifiedIds];
      let didUpdateNotified = false;

      goals.forEach(g => {
        if (g.completed) return;
        if (updatedNotified.includes(g.id)) return;

        // Parse deadline "YYYY-MM-DD"
        const parts = g.deadline.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          
          let hour = 23;
          let min = 59;
          if (g.deadlineTime) {
            const tParts = g.deadlineTime.split(':');
            if (tParts.length === 2) {
              hour = parseInt(tParts[0], 10);
              min = parseInt(tParts[1], 10);
            }
          }

          const deadlineDate = new Date(year, month, day, hour, min, 0);
          const diffMs = deadlineDate.getTime() - nowMs;
          const diffMinutes = diffMs / (1000 * 60);

          // If the deadline is within the next 15 minutes (and has not passed by more than 5 minutes)
          if (diffMinutes > -5 && diffMinutes <= 15) {
            // Mark as notified so we don't spam
            updatedNotified.push(g.id);
            didUpdateNotified = true;

            // 1. Native Browser Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`⚠️ CHRONOS VAULT WARNING`, {
                  body: `Mục tiêu "${g.title}" sắp đến hạn chót! (${Math.ceil(diffMinutes)} phút nữa)`,
                  icon: '/favicon.ico'
                });
              } catch (err) {
                console.warn('Native notification failed', err);
              }
            }

            // 2. Play Warning Synthesizer Sound
            playSynthSound('alarm');

            // 3. Queue in-app toast alerts
            let timeStr = `${Math.ceil(diffMinutes)} phút nữa`;
            if (diffMinutes <= 0) {
              timeStr = 'NGAY BÂY GIỜ 🚨';
            }
            newAlerts.push({
              id: g.id,
              title: g.title,
              timeRemainingStr: timeStr
            });
          }
        }
      });

      if (didUpdateNotified) {
        setNotifiedIds(updatedNotified);
        localStorage.setItem('chronos_notified_goal_ids', JSON.stringify(updatedNotified));
      }

      if (newAlerts.length > 0) {
        setActiveAlerts(prev => {
          const filteredPrev = prev.filter(p => !newAlerts.some(n => n.id === p.id));
          return [...filteredPrev, ...newAlerts];
        });
      }
    };

    checkDeadlines();
  }, [simulatedClock, goals, notifiedIds]);

  // Request browser permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ API Notification.');
      return;
    }
    playSynthSound('click');
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        playSynthSound('success');
        try {
          new Notification('🚀 CHRONOS VAULT', {
            body: 'Hệ thống thông báo nhắc nhở đã kết nối thành công!',
          });
        } catch (e) {}
      } else {
        alert('Quyền thông báo bị từ chối. Bạn có thể sử dụng hệ thống cảnh báo in-app cyberpunk.');
      }
    } catch (err) {
      console.warn('Error requesting permission', err);
      alert('Không thể kích hoạt quyền thông báo trực tiếp từ iframe. Đừng lo, hệ thống cảnh báo in-app Chronos Vault vẫn sẽ tự động kích hoạt!');
    }
  };

  useEffect(() => {
    localStorage.setItem('mochi_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('mochi_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (aiReport) {
      localStorage.setItem('mochi_ai_timetable_optimization', aiReport);
    } else {
      localStorage.removeItem('mochi_ai_timetable_optimization');
    }
  }, [aiReport]);

  const handleAddTimetable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return alert('Vui lòng điền tên môn học.');
    if (!newTime.trim()) return alert('Vui lòng điền thời gian học (ví dụ: 08:00 - 10:00).');

    const item: TimetableItem = {
      id: `time-${Date.now()}`,
      day: newDay,
      time: newTime.trim(),
      subject: newSubject.trim()
    };

    setTimetable(prev => [...prev, item]);
    setNewSubject('');
    setNewTime('');
    playSynthSound('success');
  };

  const handleDeleteTimetable = (id: string) => {
    setTimetable(prev => prev.filter(item => item.id !== id));
    playSynthSound('click');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return alert('Vui lòng điền tiêu đề mục tiêu.');
    if (!newGoalDeadline) return alert('Vui lòng nhập ngày hạn chót.');

    const prefix = selectedTaskType === 'logic' 
      ? '🧠 [Deep Logic]' 
      : selectedTaskType === 'creative' 
        ? '🎨 [Deep Creative]' 
        : '📖 [Review]';

    const goal: GoalItem = {
      id: `goal-${Date.now()}`,
      title: `${prefix} ${newGoalTitle.trim()}`,
      deadline: newGoalDeadline,
      deadlineTime: newGoalDeadlineTime,
      priority: newGoalPriority,
      focusHours: newGoalHours,
      focusMinutes: newGoalMinutes,
      completed: false
    };

    setGoals(prev => [...prev, goal]);
    setNewGoalTitle('');
    setNewGoalHours(1);
    setNewGoalMinutes(0);
    playSynthSound('success');
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    playSynthSound('click');
  };

  const toggleGoalCompleted = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    playSynthSound('success');
  };

  // Launch target task focus session
  const handleLaunchFocus = (g: GoalItem) => {
    const focusTask = {
      id: g.id,
      title: g.title,
      hours: g.focusHours || 0,
      minutes: g.focusMinutes || 0
    };
    localStorage.setItem('mochi_target_focus_task', JSON.stringify(focusTask));
    playSynthSound('start');
    
    if (setActiveTab) {
      setActiveTab('study');
    } else {
      alert(`Đã chuẩn bị phiên chạy cho: "${g.title}". Hãy chuyển sang Phòng Tập Trung để bắt đầu nhé!`);
    }
  };

  // Safe status calculation
  const getGoalDeadlineStatus = (g: GoalItem) => {
    if (g.completed) {
      return { 
        label: 'ĐÃ HOÀN THÀNH ✓', 
        colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
        isUrgent: false, 
        isOverdue: false, 
        text: 'Nhiệm vụ hoàn thành tốt' 
      };
    }

    const now = simulatedClock;
    const parts = g.deadline.split('-');
    
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      let hour = 23;
      let min = 59;
      if (g.deadlineTime) {
        const tParts = g.deadlineTime.split(':');
        if (tParts.length === 2) {
          hour = parseInt(tParts[0], 10);
          min = parseInt(tParts[1], 10);
        }
      }
      
      const deadlineDate = new Date(year, month, day, hour, min, 0);
      const diffTime = deadlineDate.getTime() - now.getTime();
      
      if (diffTime < 0) {
        return { 
          label: 'ĐÃ QUÁ HẠN 🚨', 
          colorClass: 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse', 
          isUrgent: true, 
          isOverdue: true, 
          text: 'Vượt quá thời hạn chót!' 
        };
      }
      
      const diffHours = diffTime / (1000 * 60 * 60);
      if (diffHours <= 24) {
        const hoursLeft = Math.max(0, Math.ceil(diffHours));
        return { 
          label: `🚨 SẮP HẾT HẠN! (Còn ${hoursLeft} giờ)`, 
          colorClass: 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse', 
          isUrgent: true, 
          isOverdue: false, 
          text: 'Deadline khẩn cấp dưới 24h!' 
        };
      }
      
      const diffDays = Math.ceil(diffHours / 24);
      return { 
        label: `Còn ${diffDays} ngày`, 
        colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
        isUrgent: false, 
        isOverdue: false, 
        text: `Hạn chót ngày ${g.deadline}` 
      };
    }
    
    return { 
      label: g.deadline, 
      colorClass: 'bg-neutral-800 text-neutral-400 border-neutral-900', 
      isUrgent: false, 
      isOverdue: false, 
      text: 'Không có mốc thời gian cụ thể' 
    };
  };

  // AI Automated Heuristic recommendation sorting
  const getAISuggestion = () => {
    const uncompleted = goals.filter(g => !g.completed);
    if (uncompleted.length === 0) return null;

    const scored = uncompleted.map(g => {
      let score = 0;
      
      // Base priority score
      if (g.priority === 'high') score += 40;
      else if (g.priority === 'medium') score += 25;
      else score += 10;

      // Deadline weight
      const status = getGoalDeadlineStatus(g);
      if (status.isOverdue) score += 50;
      else if (status.isUrgent) score += 100; // Sát deadline được ưu tiên hàng đầu!
      else {
        // Less remaining days = higher score
        const parts = g.deadline.split('-');
        if (parts.length === 3) {
          const deadlineDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          const diffDays = Math.ceil((deadlineDate.getTime() - new Date('2026-07-03').getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            score += Math.max(0, 30 - diffDays);
          }
        }
      }

      return { goal: g, score };
    });

    // Sort descending
    scored.sort((a, b) => b.score - a.score);
    return scored[0].goal;
  };

  const recommendedGoal = getAISuggestion();

  // Calendar generation helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon-Sun index (0-6)
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    playSynthSound('click');
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    playSynthSound('click');
  };

  const generateCalendarCells = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
    
    const cells = [];
    
    // Previous month padding
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isPadding: true,
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isPadding: false,
      });
    }
    
    // Next month padding (making a grid of 42 cells)
    const remainingCells = 42 - cells.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isPadding: true,
      });
    }
    
    return cells;
  };

  const calendarCells = generateCalendarCells();

  // Split calendar cells into 6 weeks of 7 days
  const weeks = (() => {
    const w = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
      w.push(calendarCells.slice(i, i + 7));
    }
    return w;
  })();

  // Filter tasks due on a specific cell date
  const getTasksForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return goals.filter(g => g.deadline === dateStr);
  };

  const getDayOfWeekName = (year: number, month: number, day: number) => {
    const dayIndex = new Date(year, month, day).getDay();
    if (dayIndex === 0) return 'Chủ Nhật';
    return `Thứ ${dayIndex + 1}`;
  };

  // Deep Gemini API Optimization
  const handleOptimizeWithAI = async () => {
    setIsLoading(true);
    setErrorText('');
    playSynthSound('start');

    try {
      const res = await fetch('/api/gemini/optimize-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable,
          goals: goals.map(g => ({
            id: g.id,
            title: g.title,
            deadline: g.deadline,
            priority: g.priority,
            focusTimeExpected: `${g.focusHours || 0} giờ ${g.focusMinutes || 0} phút`,
            completed: g.completed ? "Đã xong" : "Chưa hoàn tất"
          }))
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setAiReport(data.text);
        playSynthSound('success');
      } else {
        throw new Error(data.error || 'AI Optimization Failed');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(`🔴 [MẤT LIÊN KẾT] Không thể kết nối với lõi xử lý AI: ${err.message || 'Lỗi bất định'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearReport = () => {
    setAiReport('');
    playSynthSound('click');
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      let isHeader = false;
      let headerClass = '';
      let displayLine = line;

      if (line.startsWith('### ')) {
        isHeader = true;
        headerClass = 'text-xs font-bold text-amber-400 mt-4 mb-1.5 uppercase tracking-widest font-mono';
        displayLine = line.substring(4);
      } else if (line.startsWith('## ')) {
        isHeader = true;
        headerClass = 'text-sm font-extrabold text-amber-500 mt-5 mb-2 border-b border-amber-500/10 pb-1 uppercase tracking-widest font-mono';
        displayLine = line.substring(3);
      } else if (line.startsWith('# ')) {
        isHeader = true;
        headerClass = 'text-base font-black text-amber-400 mt-6 mb-3 uppercase tracking-widest border-b-2 border-amber-500 pb-1 font-mono';
        displayLine = line.substring(2);
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(displayLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(displayLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-yellow-400 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < displayLine.length) {
        parts.push(displayLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : displayLine;

      if (isHeader) {
        return <h4 key={i} className={headerClass}>{content}</h4>;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 list-disc mt-1 text-neutral-300 text-xs font-sans leading-relaxed">
            {line.trim().substring(2)}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }

      return (
        <p key={i} className="mt-1 text-xs text-neutral-300 font-sans leading-relaxed">
          {content}
        </p>
      );
    });
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const selectedDateTasks = goals.filter(g => g.deadline === selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 max-w-7xl mx-auto relative">
      
      {/* Dynamic Cybersecurity Alerts Overlay (if any deadline is triggered) */}
      {activeAlerts.length > 0 && (
        <div className="lg:col-span-12 space-y-3">
          {activeAlerts.map(alert => (
            <div 
              key={alert.id} 
              className="bg-red-950/90 border border-red-500 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500 animate-pulse"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 text-black rounded-lg shrink-0 animate-ping">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    🚨 CẢNH BÁO DEADLINE CHRONOS VAULT
                  </h4>
                  <p className="text-xs text-neutral-200 mt-1">
                    Công việc <strong className="text-white underline">"{alert.title}"</strong> sắp đến hạn chót trong <span className="text-red-400 font-bold font-mono bg-red-500/10 px-1 py-0.5 rounded">{alert.timeRemainingStr}</span>!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    // Launch Pomodoro directly for this task
                    const matchedGoal = goals.find(g => g.id === alert.id);
                    if (matchedGoal) {
                      handleLaunchFocus(matchedGoal);
                    }
                    setActiveAlerts(prev => prev.filter(p => p.id !== alert.id));
                  }}
                  className="bg-red-500 hover:bg-red-600 text-black font-mono font-bold text-[10px] px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                >
                  🔥 CHẠY POMODORO NGAY
                </button>
                <button
                  onClick={() => {
                    setActiveAlerts(prev => prev.filter(p => p.id !== alert.id));
                    playSynthSound('click');
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-500 text-neutral-400 hover:text-white font-mono text-[10px] px-3 py-2 rounded-lg transition-all"
                >
                  ĐÃ HIỂU
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time Simulated Clock & Browser Notification Connection Hub */}
      <div className="lg:col-span-12 bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-500/70">CHRONOS CLOCK FEED</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
              <span>Hệ thống Chronos:</span>
              <strong className="font-mono text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded text-xs">
                {simulatedClock.toLocaleDateString('vi-VN', { weekday: 'long' })}, {simulatedClock.toLocaleTimeString('vi-VN')} ({simulatedClock.toLocaleDateString('vi-VN')})
              </strong>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {notifPermission === 'granted' ? (
            <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              🔔 ĐÃ LIÊN KẾT BROWSER NOTIFICATION
            </div>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="bg-amber-500 hover:bg-amber-600 text-black font-mono font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <span>🔔 BẬT NHẮC NHỞ DEADLINE TRÌNH DUYỆT</span>
            </button>
          )}

          {/* Test Simulation trigger */}
          <button
            onClick={() => {
              playSynthSound('click');
              const testGoalId = `test-${Date.now()}`;
              setGoals(prev => [
                ...prev,
                {
                  id: testGoalId,
                  title: '🎯 [THỬ NGHIỆM] Nộp bài báo cáo Nhịp sinh học',
                  deadline: '2026-07-03',
                  deadlineTime: (() => {
                    const future = new Date(simulatedClock.getTime() + 60 * 1000);
                    const h = future.getHours().toString().padStart(2, '0');
                    const m = future.getMinutes().toString().padStart(2, '0');
                    return `${h}:${m}`;
                  })(),
                  priority: 'high',
                  focusHours: 0,
                  focusMinutes: 15,
                  completed: false
                }
              ]);
              alert(`🚀 ĐÃ LÊN LỊCH THỬ NGHIỆM: Mục tiêu thử nghiệm vừa được tạo lúc ${simulatedClock.toLocaleTimeString('vi-VN')} với hạn chót là 1 phút tiếp theo! Hãy chờ xem chuông cảnh báo kêu nhé!`);
            }}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/30 text-neutral-300 hover:text-white font-mono text-xs px-3.5 py-2.5 rounded-lg transition-all cursor-pointer"
            title="Tạo nhanh 1 deadline khẩn cấp sau 1 phút để test tính năng chuông báo và thông báo"
          >
            ⚡ CHẠY THỬ NGHIỆM
          </button>
        </div>
      </div>
      
      {/* Left panel: Schedule Management Controls */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Navigation Tabs for Schedule Sub-sections */}
        <div className="flex bg-neutral-950 p-1.5 rounded-xl border border-neutral-900 gap-1.5">
          <button
            onClick={() => { setScheduleSubTab('calendar'); playSynthSound('click'); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              scheduleSubTab === 'calendar'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            <CalendarRange className="h-4 w-4" />
            Lịch Biểu Tháng
          </button>
          
          <button
            onClick={() => { setScheduleSubTab('list'); playSynthSound('click'); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              scheduleSubTab === 'list'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Chi Tiết Deadline ({goals.filter(g => !g.completed).length})
          </button>

          <button
            onClick={() => { setScheduleSubTab('timetable'); playSynthSound('click'); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              scheduleSubTab === 'timetable'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            <Calendar className="h-4 w-4" />
            TKB Cố Định ({timetable.length})
          </button>
        </div>

        {/* 1. CALENDAR VIEW SUB-TAB */}
        {scheduleSubTab === 'calendar' && (
          <div className="space-y-6">
            
            {/* The Visual Monthly Grid Calendar Card */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-xl relative">
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="font-mono text-[8px] text-neutral-600">SCHEDULER_MATRIX_v3</span>
              </div>

              {/* Monthly Heading bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-4 mb-4 pt-1 gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    <CalendarRange className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" />
                    CHRONOS VAULT
                  </h2>
                  
                  {/* Month/Week Switcher */}
                  <div className="flex bg-neutral-900 p-0.5 rounded border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => { setViewMode('month'); playSynthSound('click'); }}
                      className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${viewMode === 'month' ? 'bg-amber-500 text-black font-extrabold' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      📅 Tháng
                    </button>
                    <button
                      type="button"
                      onClick={() => { setViewMode('week'); playSynthSound('click'); }}
                      className={`px-2 py-0.5 text-[8px] font-mono font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${viewMode === 'week' ? 'bg-amber-500 text-black font-extrabold' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      📆 Tuần
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 justify-end">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs font-bold text-neutral-200 tracking-wider">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Weekly View dropdown selection if Week mode is active */}
              {viewMode === 'week' && (
                <div className="mb-4 flex items-center justify-between bg-neutral-900/40 border border-neutral-900 p-3 rounded-lg">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Lọc Theo Tuần Lịch Trình:</span>
                  <select
                    value={selectedWeekIndex}
                    onChange={(e) => { setSelectedWeekIndex(Number(e.target.value)); playSynthSound('click'); }}
                    className="bg-black border border-neutral-800 text-xs text-amber-500 font-mono focus:border-amber-500 rounded px-3 py-1.5 focus:outline-none"
                  >
                    {weeks.map((week, idx) => {
                      const firstDay = week[0];
                      const lastDay = week[6];
                      const firstLabel = `${firstDay.day.toString().padStart(2, '0')}/${(firstDay.month + 1).toString().padStart(2, '0')}`;
                      const lastLabel = `${lastDay.day.toString().padStart(2, '0')}/${(lastDay.month + 1).toString().padStart(2, '0')}`;
                      return (
                        <option key={idx} value={idx}>
                          Tuần {idx + 1} (Từ ngày {firstLabel} đến {lastLabel})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {viewMode === 'month' ? (
                <>
                  {/* Calendar Days Header */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-neutral-500 uppercase font-bold tracking-wider mb-2">
                    <div>T2</div>
                    <div>T3</div>
                    <div>T4</div>
                    <div>T5</div>
                    <div>T6</div>
                    <div>T7</div>
                    <div className="text-amber-500/70">CN</div>
                  </div>

                  {/* Grid of Days (Month view) */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarCells.map((cell, idx) => {
                      const tasks = getTasksForDate(cell.year, cell.month, cell.day);
                      const isToday = cell.day === 3 && cell.month === 6 && cell.year === 2026; // anchor today is 2026-07-03
                      const cellDateStr = `${cell.year}-${(cell.month + 1).toString().padStart(2, '0')}-${cell.day.toString().padStart(2, '0')}`;
                      const isSelected = selectedDate === cellDateStr;
                      
                      // Day of week calculation for timetable check
                      const cellDayName = getDayOfWeekName(cell.year, cell.month, cell.day);
                      const hasSchoolClass = !cell.isPadding && timetable.some(item => item.day === cellDayName);
                      const hasDeadline = !cell.isPadding && tasks.some(g => !g.completed);

                      // Detect any uncompleted urgent task under 24 hours on this day
                      const hasUrgentTask = tasks.some(g => {
                        const status = getGoalDeadlineStatus(g);
                        return status.isUrgent && !g.completed;
                      });

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDate(cellDateStr);
                            setNewGoalDeadline(cellDateStr);
                            playSynthSound('click');
                          }}
                          className={`min-h-[76px] p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all relative cursor-pointer ${
                            cell.isPadding 
                              ? 'bg-neutral-950/20 border-neutral-950 text-neutral-700 pointer-events-none' 
                              : isSelected
                                ? 'bg-amber-500/5 border-amber-500 text-neutral-100 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                                : isToday
                                  ? 'bg-neutral-900 border-amber-500/30 text-amber-400'
                                  : 'bg-neutral-950/80 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:bg-neutral-900/30'
                          } ${hasUrgentTask ? 'shadow-[inset_0_0_8px_rgba(239,68,68,0.15)] border-red-500/40 animate-pulse' : ''}`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className={`text-xs font-mono font-bold ${isToday ? 'bg-amber-500 text-black h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px]' : ''}`}>
                              {cell.day}
                            </span>
                            
                            {/* Smart color indicators & mini icons */}
                            <div className="flex items-center gap-1">
                              {hasSchoolClass && (
                                <div className="flex items-center" title="Lịch học">
                                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse inline-block mr-0.5"></span>
                                  <span className="text-[9px]">📚</span>
                                </div>
                              )}
                              {hasDeadline && (
                                <div className="flex items-center" title="Việc làm/Deadline">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse inline-block mr-0.5"></span>
                                  <span className="text-[9px]">💼</span>
                                </div>
                              )}
                              {isToday && (
                                <span className="text-[7px] font-mono text-amber-500 uppercase tracking-widest font-black hidden sm:inline-block ml-1">HÔM NAY</span>
                              )}
                            </div>
                          </div>

                          {/* Small visual items/capsules inside cell */}
                          <div className="mt-1 space-y-1 w-full max-h-[38px] overflow-hidden">
                            {tasks.slice(0, 2).map(g => {
                              let dotColor = 'bg-neutral-500';
                              if (g.priority === 'high') dotColor = 'bg-red-500';
                              if (g.priority === 'medium') dotColor = 'bg-amber-500';
                              if (g.completed) dotColor = 'bg-green-500';

                              return (
                                <div 
                                  key={g.id} 
                                  className={`text-[8px] font-sans truncate px-1 rounded-sm flex items-center gap-1 ${
                                    g.completed 
                                      ? 'bg-neutral-900 text-neutral-600 line-through' 
                                      : g.priority === 'high'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                                        : 'bg-neutral-900 text-neutral-300'
                                  }`}
                                >
                                  <span className={`h-1 w-1 rounded-full shrink-0 ${dotColor}`}></span>
                                  <span className="truncate">{g.title}</span>
                                </div>
                              );
                            })}
                            {tasks.length > 2 && (
                              <div className="text-[8px] font-mono text-neutral-500 text-right pr-1">
                                +{tasks.length - 2} mục tiêu...
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Else if WEEK view is active (7 columns representing selected week) */
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {weeks[selectedWeekIndex]?.map((cell, idx) => {
                    const tasks = getTasksForDate(cell.year, cell.month, cell.day);
                    const isToday = cell.day === 3 && cell.month === 6 && cell.year === 2026; // anchor 2026-07-03
                    const cellDateStr = `${cell.year}-${(cell.month + 1).toString().padStart(2, '0')}-${cell.day.toString().padStart(2, '0')}`;
                    const isSelected = selectedDate === cellDateStr;
                    
                    const cellDayName = getDayOfWeekName(cell.year, cell.month, cell.day);
                    const dayClasses = timetable.filter(item => item.day === cellDayName);
                    const hasSchoolClass = !cell.isPadding && dayClasses.length > 0;
                    const hasDeadline = !cell.isPadding && tasks.some(g => !g.completed);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDate(cellDateStr);
                          setNewGoalDeadline(cellDateStr);
                          playSynthSound('click');
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[160px] relative cursor-pointer ${
                          cell.isPadding 
                            ? 'bg-neutral-950/20 border-neutral-950 text-neutral-700 pointer-events-none opacity-40' 
                            : isSelected
                              ? 'bg-amber-500/5 border-amber-500 text-neutral-100 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                              : isToday
                                ? 'bg-neutral-900 border-amber-500/40 text-amber-400'
                                : 'bg-neutral-900/50 border-neutral-900 text-neutral-400 hover:border-neutral-800 hover:bg-neutral-900/30'
                        }`}
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-center w-full pb-1.5 border-b border-neutral-900">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold tracking-wider">{cellDayName}</span>
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded-full ${isToday ? 'bg-amber-500 text-black' : ''}`}>
                              {cell.day}
                            </span>
                          </div>

                          {/* Dynamic Classes & Deadlines visual items */}
                          <div className="mt-2.5 space-y-2 w-full">
                            {/* School Classes */}
                            {hasSchoolClass && (
                              <div className="space-y-1">
                                {dayClasses.map(item => (
                                  <div key={item.id} className="text-[9px] font-sans bg-yellow-400/10 text-yellow-300 border border-yellow-400/10 p-1 rounded flex flex-col text-left" title={`Lịch học: ${item.subject}`}>
                                    <span className="font-mono text-[7px] text-yellow-400/60 font-bold uppercase">📚 LỊCH HỌC</span>
                                    <span className="font-semibold truncate">{item.subject}</span>
                                    <span className="text-[7px] text-neutral-500 mt-0.5">{item.time}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Goals / Deadlines */}
                            {tasks.length > 0 ? (
                              <div className="space-y-1">
                                {tasks.map(g => {
                                  let prioColor = 'bg-neutral-800 text-neutral-400';
                                  if (g.priority === 'high') prioColor = 'bg-red-500/10 text-red-400 border border-red-500/10';
                                  if (g.priority === 'medium') prioColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/10';
                                  if (g.completed) prioColor = 'bg-green-500/10 text-emerald-400 border border-green-500/10';

                                  return (
                                    <div key={g.id} className={`text-[9px] p-1 rounded flex flex-col border text-left ${prioColor} ${g.completed ? 'line-through opacity-50' : ''}`} title={`Deadline: ${g.title} lúc ${g.deadlineTime || '23:59'}`}>
                                      <span className="text-[7px] font-mono font-bold uppercase flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-0.5">💼 {g.priority.toUpperCase()}</span>
                                        <span className="text-[7px] text-neutral-400 font-mono">{g.deadlineTime || '23:59'}</span>
                                      </span>
                                      <span className="font-medium truncate mt-0.5">{g.title}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              !hasSchoolClass && (
                                <div className="text-center py-4 text-[9px] text-neutral-600 font-mono uppercase tracking-wider">
                                  Thảnh thơi 🌱
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {isToday && (
                          <div className="mt-3 text-right w-full">
                            <span className="text-[7px] font-mono text-amber-500 uppercase tracking-widest font-black bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded">HÔM NAY</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Date Focus Panel (Drawer block) */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-900 pb-3 mb-4 gap-2">
                <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest">
                  MỤC TIÊU NGÀY: <strong className="text-white">{selectedDate}</strong>
                </h3>
                <span className="text-[10px] font-sans text-neutral-500">
                  Click vào ngày bất kỳ trên cuốn lịch để lọc nhanh danh sách học tập
                </span>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-neutral-600 text-xs">
                  Không có mục tiêu/deadline nào được thiết lập cho ngày này. 
                  Hãy điền form bên dưới để thêm mới mục tiêu cho ngày này!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                  {selectedDateTasks.map(g => {
                    const status = getGoalDeadlineStatus(g);
                    let priorityColor = 'text-neutral-400 border-neutral-900';
                    if (g.priority === 'high') priorityColor = 'text-red-400 border-red-500/20 bg-red-500/5';
                    if (g.priority === 'medium') priorityColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';

                    return (
                      <div 
                        key={g.id} 
                        className={`flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/30 border border-neutral-900 rounded-lg p-3 text-xs gap-3 transition-all ${
                          g.completed ? 'opacity-60' : ''
                        } ${status.isUrgent ? 'border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.05)]' : ''}`}
                      >
                        <div className="flex items-start gap-2.5 overflow-hidden">
                          <button
                            onClick={() => toggleGoalCompleted(g.id)}
                            className="p-1 rounded text-neutral-500 hover:text-amber-500 shrink-0 mt-0.5 cursor-pointer"
                            title={g.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                          >
                            <CheckCircle2 className={`h-4.5 w-4.5 ${g.completed ? 'text-emerald-500 fill-emerald-500/10' : 'text-neutral-600'}`} />
                          </button>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-mono border px-1 py-0.2 rounded text-[8px] uppercase font-bold tracking-wider ${priorityColor}`}>
                                {g.priority}
                              </span>
                              <span className="text-neutral-200 font-semibold text-xs">{g.title}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-[10px] text-neutral-500 flex-wrap">
                              <span className="font-mono flex items-center gap-1">
                                <Hourglass className="h-3 w-3 text-amber-500/70" />
                                Thời gian: {g.focusHours || 0}h {g.focusMinutes || 0}m
                              </span>
                              <span>•</span>
                              <span className="font-mono flex items-center gap-1 text-amber-500/90">
                                <Clock className="h-3 w-3" /> Hạn chót: {g.deadline} lúc {g.deadlineTime || '22:00'}
                              </span>
                              <span>•</span>
                              <span className="font-sans text-neutral-400">{status.text}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:justify-end">
                          <span className={`px-2 py-0.5 border rounded font-mono text-[9px] font-bold shrink-0 ${status.colorClass}`}>
                            {status.label}
                          </span>
                          
                          {!g.completed && (
                            <button
                              onClick={() => handleLaunchFocus(g)}
                              className="bg-amber-500 hover:bg-amber-600 text-black px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                              title="Bắt đầu chạy Pomodoro"
                            >
                              <Play className="h-3 w-3 fill-black" />
                              CHẠY
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1.5 rounded text-neutral-600 hover:text-red-500 hover:bg-neutral-900/60 transition-colors cursor-pointer"
                            title="Xóa mục tiêu"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add form inside Selected Day Drawer */}
              <form onSubmit={handleAddGoal} className="mt-5 pt-4 border-t border-neutral-900 grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3">
                  <label className="block text-[8px] font-mono text-neutral-500 uppercase mb-1">TÊN MỤC TIÊU / DEADLINE</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Thi cuối kỳ đại số tuyến tính..."
                    required
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[8px] font-mono text-neutral-500 uppercase mb-1">MÔN HỌC / NHỊP SINH HỌC</label>
                  <select
                    value={selectedTaskType}
                    onChange={(e) => setSelectedTaskType(e.target.value as any)}
                    className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none font-mono text-amber-500"
                  >
                    <option value="logic">🧠 DEEP LOGIC</option>
                    <option value="creative">🎨 DEEP CREATIVE</option>
                    <option value="review">📖 REVIEW & L.</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[8px] font-mono text-neutral-500 uppercase mb-1">HẠN DEADLINE (DATE)</label>
                  <input
                    type="date"
                    required
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                    className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[8px] font-mono text-neutral-500 uppercase mb-1">GIỜ (TIME)</label>
                  <input
                    type="time"
                    required
                    value={newGoalDeadlineTime}
                    onChange={(e) => setNewGoalDeadlineTime(e.target.value)}
                    className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[8px] font-mono text-neutral-500 uppercase mb-1">ƯU TIÊN</label>
                  <select
                    value={newGoalPriority}
                    onChange={(e) => setNewGoalPriority(e.target.value as any)}
                    className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[8px] font-mono text-neutral-500 uppercase mb-1">THỜI LƯỢNG HỌC</label>
                  <div className="flex gap-1">
                    <select
                      value={newGoalHours}
                      onChange={(e) => setNewGoalHours(Number(e.target.value))}
                      className="w-1/2 bg-black border border-neutral-900 focus:border-amber-500 rounded py-1.5 text-xs text-white text-center focus:outline-none"
                      title="Giờ"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h}h</option>)}
                    </select>
                    <select
                      value={newGoalMinutes}
                      onChange={(e) => setNewGoalMinutes(Number(e.target.value))}
                      className="w-1/2 bg-black border border-neutral-900 focus:border-amber-500 rounded py-1.5 text-xs text-white text-center focus:outline-none"
                      title="Phút"
                    >
                      {[0, 15, 30, 45].map(m => <option key={m} value={m}>{m}m</option>)}
                    </select>
                  </div>
                </div>

                {/* Cyberpunk Biorhythm Suggester Panel */}
                <div className="md:col-span-12 bg-neutral-950 border border-neutral-900/80 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                      <BrainCircuit className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold">LÕI TỐI ƯU HÓA CHRONOS VAULT AI</div>
                      {selectedTaskType === 'logic' && (
                        <p className="text-neutral-300 text-[11px] font-sans mt-0.5">
                          Khuyên dùng: <strong className="text-emerald-400">Deep Work Logic</strong>. Phù hợp nhất vào ca <strong>Sáng (08:30 – 11:00)</strong> hoặc ca <strong>Chiều (14:00 – 16:30)</strong> khi Cortisol đỉnh cao.
                        </p>
                      )}
                      {selectedTaskType === 'creative' && (
                        <p className="text-neutral-300 text-[11px] font-sans mt-0.5">
                          Khuyên dùng: <strong className="text-cyan-400">Deep Work Sáng tạo</strong>. Phù hợp nhất vào ca <strong>Chiều (14:00 – 17:00)</strong> khi não phục hồi năng lượng sau ngủ trưa.
                        </p>
                      )}
                      {selectedTaskType === 'review' && (
                        <p className="text-neutral-300 text-[11px] font-sans mt-0.5">
                          Khuyên dùng: <strong className="text-purple-400">Review & Ngoại ngữ</strong>. Phù hợp nhất vào ca <strong>Tối (20:00 – 22:15)</strong> giúp Melatonin khắc sâu ký ức dài hạn.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {selectedTaskType === 'logic' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setNewGoalDeadlineTime('11:00');
                            setNewGoalHours(2);
                            setNewGoalMinutes(30);
                            playSynthSound('success');
                          }}
                          className="bg-neutral-900 hover:bg-emerald-500/10 border border-neutral-800 hover:border-emerald-500/40 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer"
                        >
                          Ca Sáng (2.5h)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewGoalDeadlineTime('16:30');
                            setNewGoalHours(2);
                            setNewGoalMinutes(30);
                            playSynthSound('success');
                          }}
                          className="bg-neutral-900 hover:bg-emerald-500/10 border border-neutral-800 hover:border-emerald-500/40 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer"
                        >
                          Ca Chiều (2.5h)
                        </button>
                      </>
                    )}
                    {selectedTaskType === 'creative' && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewGoalDeadlineTime('17:00');
                          setNewGoalHours(3);
                          setNewGoalMinutes(0);
                          playSynthSound('success');
                        }}
                        className="bg-neutral-900 hover:bg-cyan-500/10 border border-neutral-800 hover:border-cyan-500/40 text-cyan-400 font-mono text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        Ca Chiều (3h)
                      </button>
                    )}
                    {selectedTaskType === 'review' && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewGoalDeadlineTime('22:15');
                          setNewGoalHours(2);
                          setNewGoalMinutes(15);
                          playSynthSound('success');
                        }}
                        className="bg-neutral-900 hover:bg-purple-500/10 border border-neutral-800 hover:border-purple-500/40 text-purple-400 font-mono text-[10px] px-2.5 py-1 rounded transition-all cursor-pointer"
                      >
                        Ca Tối (2.25h)
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-12 flex justify-end">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2 px-5 rounded-lg transition-all flex items-center gap-1 font-mono uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                  >
                    <Plus className="h-4 w-4" /> Thêm Mục Tiêu Lịch Biểu
                  </button>
                </div>
              </form>
            </div>

            {/* Daily Mission List (Bảng kê chi tiết nhiệm vụ cần làm theo ngày) */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
              <div className="flex items-center gap-1.5 absolute top-2 left-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="font-mono text-[8px] text-neutral-600">DAILY_MISSIONS_STREAM</span>
              </div>
              <div className="border-b border-neutral-900 pb-3 mb-4 pt-1">
                <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  BẢNG KÊ CHI TIẾT NHIỆM VỤ CẦN LÀM THEO NGÀY
                </h3>
              </div>

              {(() => {
                const activeDays = calendarCells.filter(cell => !cell.isPadding).map(cell => {
                  const cellDateStr = `${cell.year}-${(cell.month + 1).toString().padStart(2, '0')}-${cell.day.toString().padStart(2, '0')}`;
                  const cellDayName = getDayOfWeekName(cell.year, cell.month, cell.day);
                  const dayGoals = goals.filter(g => g.deadline === cellDateStr);
                  const dayClasses = timetable.filter(item => item.day === cellDayName);
                  
                  return {
                    cell,
                    dateStr: cellDateStr,
                    dayName: cellDayName,
                    goals: dayGoals,
                    classes: dayClasses,
                    hasMission: dayGoals.length > 0 || dayClasses.length > 0
                  };
                }).filter(d => d.hasMission);

                if (activeDays.length === 0) {
                  return (
                    <div className="text-center py-8 text-neutral-600 text-xs font-mono uppercase tracking-wider">
                      Hiện tại chưa có nhiệm vụ nào được lên lịch trình.
                    </div>
                  );
                }

                // Sort by date string
                activeDays.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

                return (
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
                    {activeDays.map(dayInfo => (
                      <div key={dayInfo.dateStr} className="space-y-2 border-l-2 border-neutral-900 pl-4 relative">
                        <div className="absolute h-2 w-2 rounded-full bg-amber-500 -left-[5px] top-1.5 ring-4 ring-neutral-950"></div>
                        <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                          <span>📅</span>
                          <span>{dayInfo.dayName}, Ngày {dayInfo.cell.day}/{dayInfo.cell.month + 1}/{dayInfo.cell.year}</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Render fixed school classes first */}
                          {dayInfo.classes.map(cls => (
                            <div key={cls.id} className="bg-neutral-900/30 border border-neutral-900 rounded-lg p-3 flex flex-col justify-between hover:border-yellow-500/20 transition-all">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="bg-yellow-400 text-black px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase tracking-wider">
                                    📚 Lịch học cố định
                                  </span>
                                  <span className="text-[9px] font-mono text-neutral-500">{cls.time}</span>
                                </div>
                                <h5 className="text-xs font-semibold text-neutral-200 mt-1">{cls.subject}</h5>
                              </div>
                            </div>
                          ))}

                          {/* Render self-created goals / deadlines */}
                          {dayInfo.goals.map(g => {
                            const status = getGoalDeadlineStatus(g);
                            let badgeColor = 'bg-neutral-900 text-neutral-400 border-neutral-800';
                            if (g.priority === 'high') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
                            if (g.priority === 'medium') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                            if (g.completed) badgeColor = 'bg-green-500/10 text-emerald-400 border-green-500/20';

                            return (
                              <div key={g.id} className={`bg-neutral-900/30 border border-neutral-900 rounded-lg p-3 flex flex-col justify-between hover:border-amber-500/20 transition-all ${g.completed ? 'opacity-60' : ''}`}>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`px-1.5 py-0.2 border rounded text-[8px] font-mono font-bold uppercase tracking-wider ${badgeColor}`}>
                                      {g.completed ? '✓ ĐÃ XONG' : `💼 ${g.priority.toUpperCase()}`}
                                    </span>
                                    <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {g.focusHours || 0}h {g.focusMinutes || 0}m
                                    </span>
                                  </div>
                                  <h5 className="text-xs font-semibold text-neutral-200 mt-1">{g.title}</h5>
                                </div>

                                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-neutral-900/40 text-[9px]">
                                  <span className="text-neutral-500 font-sans">{status.text}</span>
                                  <span className={`font-mono font-bold ${g.completed ? 'text-emerald-400' : 'text-amber-500'}`}>{status.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* 2. CHOOSE FULL LIST SUB-TAB */}
        {scheduleSubTab === 'list' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <ListTodo className="h-4.5 w-4.5 text-amber-500" />
                TOÀN BỘ DANH SÁCH MỤC TIÊU & DEADLINE HỌC TẬP
              </h2>
            </div>

            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {goals.length === 0 ? (
                <div className="text-center py-12 text-neutral-600 text-xs font-mono">
                  CHƯA GHI NHẬN MỤC TIÊU NÀO TRÊN HỆ THỐNG
                </div>
              ) : (
                goals.map((g) => {
                  const status = getGoalDeadlineStatus(g);
                  let priorityColor = 'text-neutral-400 border-neutral-900';
                  if (g.priority === 'high') priorityColor = 'text-red-400 border-red-500/20 bg-red-500/5';
                  if (g.priority === 'medium') priorityColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';

                  return (
                    <div 
                      key={g.id} 
                      className={`flex flex-col md:flex-row md:items-center justify-between bg-neutral-900/30 border border-neutral-900 rounded-lg p-3 text-xs gap-3 transition-all ${
                        g.completed ? 'opacity-60' : ''
                      } ${status.isUrgent ? 'border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.05)]' : ''}`}
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <button
                          onClick={() => toggleGoalCompleted(g.id)}
                          className="p-1 rounded text-neutral-500 hover:text-amber-500 shrink-0 mt-0.5"
                          title={g.completed ? 'Chưa xong' : 'Đã xong'}
                        >
                          <CheckCircle2 className={`h-4.5 w-4.5 ${g.completed ? 'text-emerald-500 fill-emerald-500/10' : 'text-neutral-600'}`} />
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-mono border px-1 py-0.2 rounded text-[8px] uppercase font-bold tracking-wider ${priorityColor}`}>
                              {g.priority}
                            </span>
                            <span className="text-neutral-200 font-semibold text-xs">{g.title}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] text-neutral-500 flex-wrap font-mono">
                            <span className="flex items-center gap-1 text-amber-500">
                              <Calendar className="h-3 w-3" /> Hạn: {g.deadline}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Hourglass className="h-3 w-3" /> Thời lượng: {g.focusHours || 0}h {g.focusMinutes || 0}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 md:justify-end">
                        <span className={`px-2 py-0.5 border rounded font-mono text-[9px] font-bold shrink-0 ${status.colorClass}`}>
                          {status.label}
                        </span>

                        {!g.completed && (
                          <button
                            onClick={() => handleLaunchFocus(g)}
                            className="bg-amber-500 hover:bg-amber-600 text-black px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1"
                          >
                            <Play className="h-3 w-3 fill-black" />
                            CHẠY
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="p-1.5 rounded text-neutral-600 hover:text-red-500 hover:bg-neutral-900/60 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. FIXED TIMETABLE SUB-TAB */}
        {scheduleSubTab === 'timetable' && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5" /> Thời Khóa Biểu Cố Định Hàng Tuần
            </h2>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
              {timetable.length === 0 ? (
                <div className="text-center py-10 text-neutral-600 text-xs">
                  Chưa cấu hình thời khóa biểu cố định.
                </div>
              ) : (
                timetable.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-neutral-900/30 border border-neutral-900/80 rounded px-3 py-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0">{item.day}</span>
                      <span className="text-neutral-500 font-mono text-[10px] shrink-0">{item.time}</span>
                      <span className="text-neutral-200 font-semibold truncate">{item.subject}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTimetable(item.id)}
                      className="p-1 rounded text-neutral-600 hover:text-red-500 hover:bg-neutral-900/60 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add fixed TKB Form */}
            <form onSubmit={handleAddTimetable} className="pt-4 border-t border-neutral-900/60 grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <div className="md:col-span-3">
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="08:00 - 10:00"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                />
              </div>
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Tên môn học/nội dung"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-700 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-amber-500 text-neutral-300 hover:text-black border border-neutral-800 hover:border-amber-500 font-semibold text-xs py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Ghi
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Right panel: AI Assistant & Optimization Console */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* 💡 AI IMMEDIATE RECOMMENDATION CARD (AI Gợi ý sắp xếp) */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative overflow-hidden">
          {/* Subtle tech grid background element */}
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-[8px] text-neutral-600">HEURISTIC_AI_DECISION</span>
          </div>

          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4 font-bold mt-1">
            🤖 CHỈ ĐỊNH ĐẶC VỤ TỐI ƯU (AI SMART TIPS)
          </h3>

          {recommendedGoal ? (
            <div className="space-y-4">
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3 text-xs space-y-2.5 relative">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                  <AlertTriangle className="h-3.5 w-3.5" /> AI CHỈ ĐỊNH LÀM NGAY:
                </div>

                <div className="space-y-1">
                  <h4 className="text-neutral-100 font-extrabold text-sm font-sans">{recommendedGoal.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span className="text-red-400 border border-red-500/10 px-1 py-0.2 rounded uppercase font-bold bg-red-500/5">
                      ƯU TIÊN: {recommendedGoal.priority}
                    </span>
                    <span>•</span>
                    <span>Hạn: {recommendedGoal.deadline}</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                  Công việc này yêu cầu <strong className="text-cyan-400">{(recommendedGoal.focusHours || 0) * 60 + (recommendedGoal.focusMinutes || 0)} phút</strong> tập trung học sâu và hiện tại có độ khẩn cấp cao nhất dựa trên thuật toán AI. Đừng trì hoãn!
                </p>

                <div className="pt-1.5 border-t border-neutral-900">
                  <button
                    onClick={() => handleLaunchFocus(recommendedGoal)}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs py-2 rounded-md transition-all font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    BẮT ĐẦU CHẠY PHÊN NGAY
                  </button>
                </div>
              </div>

              <div className="bg-black/40 border border-neutral-900 rounded p-2.5 text-[10px] font-mono text-neutral-500 leading-normal font-sans">
                💡 <span className="text-neutral-400">Lời khuyên AI:</span> Sắp xếp các phiên Pomodoro vào buổi sáng sớm từ 05:00 - 08:00 để tăng hiệu quả ghi nhớ thông tin lên đến 250% so với học tối muộn!
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500 text-xs space-y-1 font-sans">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-neutral-300 uppercase text-[10px]">TẤT CẢ MỤC TIÊU ĐÃ HOÀN TẤT!</p>
              <p className="text-[10px] text-neutral-500 max-w-xs mx-auto">Tuyệt vời đặc vụ, không còn deadline dồn dập nào lúc này. Hãy tận hưởng thời gian nghỉ ngơi xịn xò.</p>
            </div>
          )}
        </div>

        {/* Deep Gemini Scheduler Optimizer Panel */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
          <div className="bg-neutral-900/50 border-b border-neutral-900 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-amber-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
                  LÕI TỐI ƯU HÓA GEMINI AI
                </h3>
                <p className="text-[8px] font-sans text-neutral-500 leading-tight">
                  Phân tích thời gian biểu và đưa ra chiến lược học sâu
                </p>
              </div>
            </div>
            {aiReport && (
              <button
                onClick={clearReport}
                className="text-[8px] font-mono bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 px-1.5 py-0.5 rounded text-neutral-500 hover:text-red-400 transition-colors"
              >
                HỦY BÁO CÁO
              </button>
            )}
          </div>

          {/* AI response content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                <div className="space-y-1">
                  <span className="font-mono text-[9px] tracking-widest text-amber-500 uppercase animate-pulse block">
                    ĐANG KẾT NỐI VỆ TINH GEMINI...
                  </span>
                  <span className="text-[9px] font-sans text-neutral-500 block leading-normal max-w-[200px] mx-auto">
                    Mô hình đang đọc toàn bộ thời khóa biểu và danh sách deadline của bạn để thiết kế lộ trình ôn tập tối ưu.
                  </span>
                </div>
              </div>
            ) : errorText ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-3">
                <ShieldAlert className="h-8 w-8 text-red-500 mb-1.5 animate-bounce" />
                <p className="text-[10px] font-sans text-neutral-400 leading-relaxed">{errorText}</p>
              </div>
            ) : aiReport ? (
              <div className="markdown-body text-xs leading-relaxed space-y-1.5 text-neutral-300">
                {renderMarkdown(aiReport)}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                <div className="h-11 w-11 rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-neutral-200 font-sans uppercase tracking-wider">CHƯA TỐI ƯU HÓA LỊCH TRÌNH</h4>
                  <p className="text-[9px] font-sans text-neutral-500 max-w-[220px] mx-auto leading-relaxed">
                    Bấm nút kích hoạt bên dưới để gửi dữ liệu thời khóa biểu cố định và các mục tiêu deadline lên lõi AI phân tích chiến lược.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optimize button triggers */}
          <div className="p-3 border-t border-neutral-900 bg-neutral-950">
            <button
              onClick={handleOptimizeWithAI}
              disabled={isLoading || (timetable.length === 0 && goals.length === 0)}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-900 text-black disabled:text-neutral-600 font-bold text-[10px] py-2.5 rounded-lg shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-1.5 font-mono uppercase tracking-widest"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>KÍCH HOẠT GEMINI OPTIMIZER</span>
            </button>
          </div>
        </div>

        {/* 🧠 BRAIN BIORHYTHM & OPTIMAL STUDY HOURS CARD */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl"></div>
          
          <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ⚙️ NHỊP SINH HỌC & KHUNG GIỜ VÀNG
          </h3>

          <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
            Khoa học chứng minh rằng hiệu suất học tập tăng vọt khi bạn phân bổ môn học đúng nhịp sinh học của não bộ:
          </p>

          <div className="space-y-2.5">
            {/* Morning Slot */}
            <div className="bg-neutral-900/30 border border-neutral-900 hover:border-emerald-500/20 p-2.5 rounded-lg text-xs transition-colors">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold text-amber-400 mb-1">
                <span>🌅 SÁNG: 08:00 AM – 11:00 AM</span>
                <span className="bg-amber-500/10 px-1 rounded text-[8px]">TẬP TRUNG CAO</span>
              </div>
              <p className="text-[10px] text-neutral-300 font-sans">
                Cortisol cao nhất, não bộ đạt đỉnh tư duy logic, phân tích sâu.
              </p>
              <div className="text-[8px] font-mono text-neutral-500 mt-1 uppercase">
                Môn phù hợp: Kế toán, Toán cao cấp, Thuật toán, Pháp luật.
              </div>
            </div>

            {/* Afternoon Slot */}
            <div className="bg-neutral-900/30 border border-neutral-900 hover:border-emerald-500/20 p-2.5 rounded-lg text-xs transition-colors">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold text-cyan-400 mb-1">
                <span>☀️ CHIỀU: 02:00 PM – 05:00 PM</span>
                <span className="bg-cyan-500/10 px-1 rounded text-[8px]">SÁNG TẠO & CODE</span>
              </div>
              <p className="text-[10px] text-neutral-300 font-sans">
                Năng lượng phục hồi sau giấc ngủ trưa, lý tưởng để viết lách, xây dựng dự án.
              </p>
              <div className="text-[8px] font-mono text-neutral-500 mt-1 uppercase">
                Môn phù hợp: Coding, Vẽ thiết kế, Làm đồ án, Nghiên cứu lịch sử.
              </div>
            </div>

            {/* Evening Slot */}
            <div className="bg-neutral-900/30 border border-neutral-900 hover:border-emerald-500/20 p-2.5 rounded-lg text-xs transition-colors">
              <div className="flex items-center justify-between font-mono text-[10px] font-bold text-purple-400 mb-1">
                <span>🌌 TỐI: 08:00 PM – 10:15 PM</span>
                <span className="bg-purple-500/10 px-1 rounded text-[8px]">GHI NHỚ DÀI HẠN</span>
              </div>
              <p className="text-[10px] text-neutral-300 font-sans">
                Không gian yên tĩnh nhất ngày, lượng melatonin tăng giúp khắc ghi kiến thức lâu dài.
              </p>
              <div className="text-[8px] font-mono text-neutral-500 mt-1 uppercase">
                Môn phù hợp: Từ vựng Ngoại ngữ, Văn học, Ôn tập cuối ngày.
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded text-[10px] font-mono text-emerald-400 leading-normal">
            ⏳ <strong>Cơ chế Pomodoro khuyên dùng:</strong> 50 phút tập trung cao độ + 10 phút nghỉ ngơi ngắn. Sau cùng dành ra 30 phút rà soát lại toàn bộ!
          </div>
        </div>

      </div>

    </div>
  );
}
