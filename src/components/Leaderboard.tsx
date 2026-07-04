/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, LeaderboardUser } from '../types';
import { BADGES, SHOP_ITEMS } from '../data/shop';
import { playSynthSound } from '../lib/sound';
import { Trophy, Gift, Award, Zap, Heart, Star, Sparkles, MessageSquareHeart } from 'lucide-react';

interface LeaderboardProps {
  user: UserProfile;
  addMochiCoins: (coins: number, minutes: number) => void;
  deductMochiCoins: (coins: number) => boolean;
}

// Initial mockup data of active student buddies cày deadline
const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { id: 'buddy-1', nickname: 'Chúa Tể Cày Code', studyMinutes: 480, activeBorder: 'border-nova-fire', giftScore: 12 },
  { id: 'buddy-2', nickname: 'Nữ Hoàng Figma', studyMinutes: 390, activeBorder: 'border-cosmic-purple', giftScore: 8 },
  { id: 'buddy-3', nickname: 'Anh Ba Báo Cáo', studyMinutes: 280, activeBorder: 'border-matrix-green', giftScore: 5 },
  { id: 'buddy-4', nickname: 'Đệ Nhất Slide', studyMinutes: 210, activeBorder: 'border-amber-glow', giftScore: 3 },
  { id: 'buddy-5', nickname: 'Mỹ Nữ Trì Hoãn', studyMinutes: 140, activeBorder: 'border-none', giftScore: 1 },
];

export default function Leaderboard({ user, addMochiCoins, deductMochiCoins }: LeaderboardProps) {
  const [buddies, setBuddies] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [activeGiftTarget, setActiveGiftTarget] = useState<LeaderboardUser | null>(null);

  // Combine mockup with current user's live values
  const leaderboardData: LeaderboardUser[] = [
    ...buddies,
    {
      id: 'current-user',
      nickname: user.nickname || 'Đặc vụ Mochi',
      studyMinutes: user.totalStudyMinutes,
      activeBorder: user.activeBorder,
      isCurrentUser: true,
      giftScore: 0 // Local tracker
    }
  ].sort((a, b) => b.studyMinutes - a.studyMinutes);

  const handleSendGift = (buddy: LeaderboardUser, giftType: 'milktea' | 'energy' | 'bun') => {
    let cost = 0;
    let giftName = '';
    
    if (giftType === 'milktea') {
      cost = 15;
      giftName = 'Trà Sữa Mochi';
    } else if (giftType === 'energy') {
      cost = 25;
      giftName = 'Nước Tăng Lực Cyber';
    } else if (giftType === 'bun') {
      cost = 30;
      giftName = 'Bánh Bao Deadline';
    }

    if (user.mochiCoins < cost) {
      alert(`Bạn không đủ Mochi Coins. Cần thêm ${cost - user.mochiCoins} Xu để mua quà này.`);
      playSynthSound('click');
      return;
    }

    // Process deduction
    const success = deductMochiCoins(cost);
    if (success) {
      // Update local state for buddy
      setBuddies(prev => prev.map(b => {
        if (b.id === buddy.id) {
          return { ...b, giftScore: b.giftScore + 1 };
        }
        return b;
      }));

      playSynthSound('success');
      alert(`Đã gửi thành công 1 [${giftName}] cho ${buddy.nickname}! Khí chất bùng nổ, tình hữu nghị tăng cao!`);
      setActiveGiftTarget(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Left Panel: The Weekly Leaderboard */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="h-4 w-4" /> BẢNG VÀNG CÀY DEADLINE // TUẦN NÀY
            </h2>
            <span className="text-[10px] text-neutral-500 font-mono">RESETS IN 4 DAYS</span>
          </div>

          {/* Ranking list */}
          <div className="space-y-2.5">
            {leaderboardData.map((buddy, index) => {
              const borderObj = SHOP_ITEMS.find(item => item.id === buddy.activeBorder) || SHOP_ITEMS[0];
              const rank = index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;

              return (
                <div 
                  key={buddy.id}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                    buddy.isCurrentUser 
                      ? 'bg-amber-500/5 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.08)]' 
                      : 'bg-neutral-900/40 border-neutral-900 hover:border-neutral-800'
                  }`}
                  id={`rank-${rank}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-6 text-center">
                      {isGold && <span className="text-xl">🥇</span>}
                      {isSilver && <span className="text-xl">🥈</span>}
                      {isBronze && <span className="text-xl">🥉</span>}
                      {!isGold && !isSilver && !isBronze && (
                        <span className="font-mono text-xs text-neutral-500">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar with dynamic frame */}
                    <div className="relative">
                      <div
                        className={`h-9 w-9 rounded-full bg-neutral-950 flex items-center justify-center text-amber-400 font-mono font-bold text-xs select-none ${borderObj.previewClass}`}
                        style={borderObj.style}
                      >
                        {buddy.nickname.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* Username and social status */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-200">
                          {buddy.nickname}
                        </span>
                        {buddy.isCurrentUser && (
                          <span className="text-[8px] bg-amber-500 text-black px-1.5 rounded font-bold font-mono">BẠN</span>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <span>{buddy.studyMinutes} Phút học</span>
                        <span>•</span>
                        <span className="text-amber-500/80 inline-flex items-center gap-0.5">
                          <Heart className="h-2 w-2 fill-current" /> {buddy.giftScore} Quà tặng
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Send Gift Trigger */}
                  {!buddy.isCurrentUser && (
                    <button
                      onClick={() => {
                        setActiveGiftTarget(buddy);
                        playSynthSound('click');
                      }}
                      className="p-2 bg-neutral-900 hover:bg-neutral-800 text-amber-500 hover:text-amber-400 border border-neutral-800 hover:border-amber-500/20 rounded transition-all duration-200 text-xs flex items-center gap-1.5 font-sans"
                      title="Gửi quà tiếp sức"
                      id={`btn-gift-${buddy.id}`}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Tiếp Sức</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel: Gift Shop Selector & Badges Grid */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Active Gift Sender Panel */}
        {activeGiftTarget ? (
          <div className="bg-neutral-950 border-2 border-amber-500/40 rounded-xl p-5 shadow-lg relative animate-pulse">
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MessageSquareHeart className="h-4 w-4" /> GỬI QUÀ TIẾP SỨC ĐỒNG ĐỘI
            </h3>
            <p className="text-xs text-neutral-400 font-sans mb-4">
              Gửi quà ảo tiếp lửa cho <strong className="text-neutral-200">{activeGiftTarget.nickname}</strong> để nâng cấp vị thế tình bạn và nhận phản hồi ấm áp!
            </p>

            <div className="space-y-3">
              {/* Option 1: Milk tea */}
              <button
                onClick={() => handleSendGift(activeGiftTarget, 'milktea')}
                className="w-full flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 hover:border-amber-500 rounded-lg text-left transition-colors"
                id="gift-milktea"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🧋</span>
                  <div>
                    <div className="text-xs font-semibold text-neutral-200 font-sans">Trà Sữa Mochi</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Tiếp nước ngọt ngào, xua tan áp lực</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-amber-400 font-bold">15 Xu</div>
                  <div className="text-[8px] text-neutral-500 font-mono">SEND NOW</div>
                </div>
              </button>

              {/* Option 2: Energy drink */}
              <button
                onClick={() => handleSendGift(activeGiftTarget, 'energy')}
                className="w-full flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 hover:border-amber-500 rounded-lg text-left transition-colors"
                id="gift-energy"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="text-xs font-semibold text-neutral-200 font-sans">Nước Tăng Lực Cyber</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Bứt phá nơ-ron, gõ code xuyên đêm</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-amber-400 font-bold">25 Xu</div>
                  <div className="text-[8px] text-neutral-500 font-mono">SEND NOW</div>
                </div>
              </button>

              {/* Option 3: Bun */}
              <button
                onClick={() => handleSendGift(activeGiftTarget, 'bun')}
                className="w-full flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 hover:border-amber-500 rounded-lg text-left transition-colors"
                id="gift-bun"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🥟</span>
                  <div>
                    <div className="text-xs font-semibold text-neutral-200 font-sans">Bánh Bao Deadline</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Ấm lòng dạ dày, sẵn sàng nộp bài</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-amber-400 font-bold">30 Xu</div>
                  <div className="text-[8px] text-neutral-500 font-mono">SEND NOW</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setActiveGiftTarget(null);
                playSynthSound('click');
              }}
              className="w-full text-center text-xs text-neutral-500 underline font-mono mt-4 hover:text-neutral-300"
              id="btn-cancel-gift"
            >
              HỦY BỎ
            </button>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg text-center py-6">
            <div className="text-3xl mb-2 flex justify-center">💌</div>
            <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Chọn đồng đội để tặng quà</h4>
            <p className="text-[11px] text-neutral-600 mt-1 max-w-xs mx-auto">
              Chỉ cần nhấp nút <strong>&quot;Tiếp Sức&quot;</strong> bên cạnh tên của một đồng đội bất kỳ để mở rộng không gian gắn kết và truyền cảm hứng.
            </p>
          </div>
        )}

        {/* Badges display card */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" /> DANH SÁCH HUY HIỆU ĐẠT ĐƯỢC
          </h3>

          <div className="space-y-3">
            {BADGES.map((badge) => {
              const isEarned = user.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                    isEarned 
                      ? 'bg-amber-500/5 border-amber-500/20 text-neutral-200' 
                      : 'bg-neutral-900/20 border-neutral-900 text-neutral-600'
                  }`}
                >
                  <div className={`p-2 rounded bg-black border ${isEarned ? 'border-amber-500/30 text-amber-400 animate-pulse' : 'border-neutral-900 text-neutral-700'}`}>
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                      <span>{badge.name}</span>
                      {isEarned && <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 rounded font-mono">EARNED</span>}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{badge.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
