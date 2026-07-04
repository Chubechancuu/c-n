/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SecureAuth from './components/SecureAuth';
import CompanionRoom from './components/CompanionRoom';
import StudyRoom from './components/StudyRoom';
import SmartSchedule from './components/SmartSchedule';
import FreeDiary from './components/FreeDiary';
import UserProfileTab from './components/UserProfileTab';
import { UserProfile, DiaryEntry, StudyHistory } from './types';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';
import { playSynthSound } from './lib/sound';

// Baseline mockup data for standard week study history
const DEFAULT_HISTORY: StudyHistory[] = [
  { date: 'Thứ 2', minutes: 45 },
  { date: 'Thứ 3', minutes: 90 },
  { date: 'Thứ 4', minutes: 50 },
  { date: 'Thứ 5', minutes: 120 },
  { date: 'Thứ 6', minutes: 75 },
  { date: 'Thứ 7', minutes: 0 },
  { date: 'Chủ Nhật', minutes: 0 }
];

// Baseline mockup for a welcome diary entry
const DEFAULT_DIARY: DiaryEntry[] = [
  {
    id: 'diary-welcome',
    date: new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' }),
    timestamp: Date.now() - 3600000,
    mode: 'both',
    title: 'Hành trình chinh phục đỉnh cao tri thức',
    content: 'Chào mừng bạn đến với Chronos Vault! Đây là nơi bạn biến áp lực thi cử và deadline dồn dập thành những cuộc đua kì thú. \n\nMọi nỗ lực tập trung của bạn đều được quy đổi ra Mochi Coins để độ khung avatar xịn xò. Hãy thẳng lưng lên, dẹp bỏ điện thoại và bắt đầu gõ những dòng code/bài tập đầu tiên nhé!',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    fontFamily: 'font-sans',
    textColor: 'text-neutral-200',
    borderType: 'border-gold'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('companion');
  
  // Color palette state: 'amber' | 'blue' | 'green'
  const [colorTheme, setColorTheme] = useState<'amber' | 'blue' | 'green'>(() => {
    return (localStorage.getItem('mochi_color_theme') as any) || 'amber';
  });

  // Active secure login session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mochi_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return null;
  });

  // Diaries state
  const [diaries, setDiaries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('mochi_diaries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_DIARY;
  });

  // Study history state
  const [history, setHistory] = useState<StudyHistory[]>(() => {
    const saved = localStorage.getItem('mochi_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_HISTORY;
  });

  // Quick Lock security state
  const [isQuickLocked, setIsQuickLocked] = useState(false);
  const [lockPasswordInput, setLockPasswordInput] = useState('');

  // Save states to LocalStorage
  useEffect(() => {
    localStorage.setItem('mochi_color_theme', colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mochi_active_user', JSON.stringify(currentUser));
      // Save/update this user in general list as well
      localStorage.setItem(`mochi_user_${currentUser.fullName.toLowerCase()}`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mochi_active_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mochi_diaries', JSON.stringify(diaries));
  }, [diaries]);

  useEffect(() => {
    localStorage.setItem('mochi_history', JSON.stringify(history));
  }, [history]);

  const updateUser = (updated: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updated };
    });
  };

  const addMochiCoins = (coins: number, minutes: number) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const newCoins = prev.mochiCoins + coins;
      const newMinutes = prev.totalStudyMinutes + minutes;
      const currentBadges = [...prev.badges];

      if (!currentBadges.includes('badge-welcome')) {
        currentBadges.push('badge-welcome');
      }

      // Unlock "Chúa tể Sprint" if focus is 90 mins or more
      if (minutes >= 90 && !currentBadges.includes('badge-sprint')) {
        currentBadges.push('badge-sprint');
        playSynthSound('success');
      }

      // Unlock "Kẻ hủy diệt Deadline" if study minutes >= 120 mins
      if (minutes >= 120 && !currentBadges.includes('badge-emergency')) {
        currentBadges.push('badge-emergency');
        playSynthSound('success');
      }

      return {
        ...prev,
        mochiCoins: newCoins,
        totalStudyMinutes: newMinutes,
        badges: currentBadges
      };
    });
  };

  const deductMochiCoins = (coins: number): boolean => {
    if (!currentUser || currentUser.mochiCoins < coins) return false;
    setCurrentUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        mochiCoins: prev.mochiCoins - coins
      };
    });
    return true;
  };

  const awardBadge = (badgeId: string) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      if (prev.badges.includes(badgeId)) return prev;
      return {
        ...prev,
        badges: [...prev.badges, badgeId]
      };
    });
  };

  const addDiary = (entry: DiaryEntry) => {
    setDiaries((prev) => [entry, ...prev]);
  };

  const deleteDiary = (id: string) => {
    setDiaries((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDiary = (updatedEntry: DiaryEntry) => {
    setDiaries((prev) => prev.map((d) => d.id === updatedEntry.id ? updatedEntry : d));
  };

  const addStudyHistory = (minutes: number) => {
    const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const todayLabel = weekdays[new Date().getDay()];

    setHistory((prev) => {
      return prev.map((item) => {
        if (item.date === todayLabel) {
          return { ...item, minutes: item.minutes + minutes };
        }
        return item;
      });
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('companion');
  };

  // Get focus minutes accumulated today
  const getTodayMinutes = () => {
    const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const todayLabel = weekdays[new Date().getDay()];
    const todayItem = history.find(h => h.date === todayLabel);
    return todayItem ? todayItem.minutes : 0;
  };

  const todayMinutes = getTodayMinutes();

  // Handle unlocking from quick lock screen
  const handleUnlockQuickLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (lockPasswordInput === currentUser.password) {
      setIsQuickLocked(false);
      setLockPasswordInput('');
      playSynthSound('success');
    } else {
      alert('Mật khẩu khóa sai. Không thể mở khóa hệ thống.');
      playSynthSound('click');
    }
  };

  // Theme styling mappings
  const themeAccentText = {
    amber: 'text-amber-500',
    blue: 'text-cyan-400',
    green: 'text-emerald-400'
  };

  const themeAccentBorder = {
    amber: 'border-amber-500/20',
    blue: 'border-cyan-500/20',
    green: 'border-emerald-500/20'
  };

  const themeAccentBg = {
    amber: 'bg-amber-500',
    blue: 'bg-cyan-500',
    green: 'bg-emerald-500'
  };

  // Render gate screen if user is quick-locked
  if (currentUser && isQuickLocked) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-950 border-2 border-neutral-900 rounded-2xl p-6 shadow-2xl relative text-center space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>
          
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold font-sans text-white uppercase">HỆ THỐNG ĐÃ KHÓA NHANH</h2>
            <p className="text-[11px] font-mono text-neutral-500 mt-1 uppercase">QUICK_LOCK_MODE // ACCESS_SUSPENDED</p>
          </div>

          <form onSubmit={handleUnlockQuickLock} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Nhập mật khẩu để mở khóa..."
                required
                value={lockPasswordInput}
                onChange={(e) => setLockPasswordInput(e.target.value)}
                className="w-full bg-black border border-neutral-900 focus:border-red-500 rounded-lg px-3 py-2.5 text-xs text-white text-center focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-lg transition-all font-mono uppercase"
            >
              MỞ KHÓA TRUY CẬP
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black`}>
      
      {/* Dynamic line grid overlay background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,18,18,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.1)_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>

      {/* Gatekeeper for Non-Authenticated views */}
      {!currentUser ? (
        <div className="flex-1 flex items-center justify-center py-10 relative z-10">
          <SecureAuth onLoginSuccess={(u) => setCurrentUser(u)} />
        </div>
      ) : (
        <>
          {/* Top Custom Dashboard controls (Quick lock & theme indicator) */}
          <div className="bg-neutral-950/40 border-b border-neutral-900/60 py-1.5 px-4 md:px-8 text-[10px] font-mono text-neutral-500 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>Hồ Sơ Mật: <strong className="text-neutral-300 uppercase">{currentUser.nickname}</strong></span>
              </span>
              <span className="hidden md:inline text-neutral-700">|</span>
              <span className="hidden md:inline">MÃ KHÔI PHỤC: {currentUser.securityCode}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsQuickLocked(true);
                  playSynthSound('start');
                }}
                className="hover:text-red-400 font-bold transition-colors uppercase cursor-pointer"
                title="Khóa khẩn cấp"
              >
                [ KHÓA NHANH ]
              </button>
            </div>
          </div>

          {/* Fully Managed Cyber Header */}
          <Navbar
            user={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
          />

          {/* Main workspace contents */}
          <main className="flex-1 relative z-10 pb-12">
            
            {activeTab === 'companion' && (
              <CompanionRoom 
                user={currentUser} 
                todayStudyMinutes={todayMinutes}
              />
            )}

            {activeTab === 'study' && (
              <StudyRoom
                user={currentUser}
                addMochiCoins={addMochiCoins}
                awardBadge={awardBadge}
                addStudyHistory={addStudyHistory}
                todayStudyMinutes={todayMinutes}
              />
            )}

            {activeTab === 'schedule' && (
              <SmartSchedule setActiveTab={setActiveTab} />
            )}

            {activeTab === 'diary' && (
              <FreeDiary
                user={currentUser}
                deductMochiCoins={deductMochiCoins}
                diaries={diaries}
                addDiary={addDiary}
                deleteDiary={deleteDiary}
                updateDiary={updateDiary}
              />
            )}

            {activeTab === 'profile' && (
              <UserProfileTab
                user={currentUser}
                updateUser={updateUser}
                deductMochiCoins={deductMochiCoins}
                onLogout={handleLogout}
              />
            )}

          </main>
        </>
      )}

      {/* Cyberpunk console log footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-4.5 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-mono text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>SYSTEM_ACTIVE // SECURE_PORT:3000 // DECRYPTED_AGENT_OK</span>
          </div>
          <div>
            <span>© 2026 MOCHI DEADLINE STUDIO. POWERED BY ANTIGRAVITY CODES.</span>
          </div>
          <div>
            <span className="uppercase text-neutral-500">THEME_ACTIVE: {colorTheme}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
