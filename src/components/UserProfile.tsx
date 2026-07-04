/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, ShopItem } from '../types';
import { BADGES, SHOP_ITEMS } from '../data/shop';
import { X, Shield, Link2, Award, Info, Flame, Trophy, Terminal, Zap, CheckCircle2 } from 'lucide-react';

interface UserProfileProps {
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ user, updateUser, isOpen, onClose }: UserProfileProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [linkName, setLinkName] = useState(user.linkName);
  const [linkUrl, setLinkUrl] = useState(user.linkUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      nickname: nickname || 'Đặc vụ Mochi',
      linkName: linkName || '',
      linkUrl: linkUrl || '',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const currentBorder = SHOP_ITEMS.find(item => item.id === user.activeBorder) || SHOP_ITEMS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-neutral-950 border border-amber-500/30 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] flex flex-col md:flex-row"
        id="profile-settings-modal"
      >
        {/* Left Side: Cyber Avatar Card & Stats */}
        <div className="md:w-5/12 bg-neutral-900/60 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-amber-500/10">
          <div className="w-full flex flex-col items-center">
            {/* Hologram Avatar Indicator */}
            <div className="text-[10px] font-mono text-amber-500/50 uppercase tracking-widest mb-4">HOLOGRAPHIC ID</div>
            
            <div className="relative mb-4">
              <div
                className={`h-24 w-24 rounded-full bg-neutral-950 flex items-center justify-center text-amber-400 font-bold text-3xl select-none transition-all duration-300 ${currentBorder.previewClass}`}
                style={currentBorder.style}
              >
                {nickname ? nickname.substring(0, 2).toUpperCase() : 'MC'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                Agent
              </div>
            </div>

            <h3 className="text-lg font-bold text-neutral-100 text-center font-sans">
              {nickname || 'Chưa Đăng Ký'}
            </h3>
            
            <p className="text-xs text-neutral-500 font-mono mt-1 text-center truncate max-w-full">
              {linkUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline inline-flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> {linkName || 'Liên kết mật'}
                </a>
              ) : (
                'Chưa cấu hình liên kết ngoại vi'
              )}
            </p>
          </div>

          {/* Stats Segment */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6 border-t border-neutral-800 pt-6">
            <div className="bg-black/55 border border-neutral-900 rounded p-3 text-center">
              <div className="flex justify-center text-amber-500 mb-1">
                <Flame className="h-4 w-4 animate-pulse" />
              </div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Focus Streak</div>
              <div className="font-mono text-base font-bold text-amber-400 mt-0.5">
                {user.streakDays} <span className="text-xs font-normal">Ngày</span>
              </div>
            </div>

            <div className="bg-black/55 border border-neutral-900 rounded p-3 text-center">
              <div className="flex justify-center text-amber-500 mb-1">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Tổng Giờ Học</div>
              <div className="font-mono text-base font-bold text-amber-400 mt-0.5">
                {(user.totalStudyMinutes / 60).toFixed(1)} <span className="text-xs font-normal">H</span>
              </div>
            </div>
          </div>

          <div className="w-full text-center mt-4">
            <span className="text-[10px] font-mono text-neutral-500">Mochi Coins: </span>
            <span className="text-xs font-mono font-bold text-amber-400">{user.mochiCoins} Xu</span>
          </div>
        </div>

        {/* Right Side: Setup Form & Badges */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" /> THIẾT LẬP THÔNG TIN MẬT
              </h2>
              <button 
                onClick={onClose}
                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 transition-colors"
                id="btn-close-profile-modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Privacy Shield Notice */}
            <div className="mb-4 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
              <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300 leading-relaxed">
                <strong className="text-amber-400">Bảo mật tuyệt đối:</strong> Chúng tôi <strong className="text-amber-400">KHÔNG</strong> thu thập MSSV, tên thật hay trường học của bạn. Hãy tự do đặt biệt hiệu và liên kết mạng xã hội theo phong cách riêng của mình.
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Biệt danh (Nickname)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Ví dụ: Coder Cô Độc, Deadline Destroyer..."
                  className="w-full bg-black border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Tên liên kết tùy biến
                  </label>
                  <input
                    type="text"
                    maxLength={18}
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    placeholder="Ví dụ: Mạng nhện, My GitHub"
                    className="w-full bg-black border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                    Đường dẫn liên kết (URL)
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-black border border-neutral-800 focus:border-amber-500 rounded px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between pt-2">
                <span className="text-[10px] text-neutral-500 font-mono">ID: 2590f9f4-STUDENT-MCH</span>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs py-2 px-4 rounded-md transition-all duration-200 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-sans"
                  id="btn-save-profile"
                >
                  {saveSuccess ? 'ĐÃ ĐỒNG BỘ ✓' : 'LƯU THAY ĐỔI'}
                </button>
              </div>
            </form>
          </div>

          {/* Badges Segment */}
          <div className="mt-6 border-t border-neutral-900 pt-4">
            <h4 className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500" /> Hệ thống Huy hiệu Cyber
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((badge) => {
                const isEarned = user.badges.includes(badge.id);
                // Simple color logic
                return (
                  <div 
                    key={badge.id}
                    className={`relative p-2.5 rounded-lg border text-center group cursor-pointer transition-all duration-300 ${
                      isEarned 
                        ? 'bg-amber-500/5 border-amber-500/30 text-amber-400' 
                        : 'bg-neutral-950 border-neutral-900 text-neutral-600'
                    }`}
                    title={`${badge.name}: ${badge.description} (${badge.conditionText})`}
                  >
                    <div className="flex justify-center">
                      {badge.icon === 'Terminal' && <Terminal className="h-5 w-5" />}
                      {badge.icon === 'Zap' && <Zap className="h-5 w-5" />}
                      {badge.icon === 'Flame' && <Flame className="h-5 w-5" />}
                      {badge.icon === 'Award' && <Award className="h-5 w-5" />}
                    </div>
                    <div className="text-[9px] font-semibold truncate mt-1">{badge.name}</div>
                    
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-neutral-950 border border-neutral-800 rounded p-2 text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-250 z-50 shadow-2xl">
                      <div className="font-bold text-amber-400">{badge.name}</div>
                      <div className="text-neutral-400 mt-0.5">{badge.description}</div>
                      <div className="text-amber-500/70 font-mono mt-1 border-t border-neutral-900 pt-1">ĐK: {badge.conditionText}</div>
                      {isEarned && <div className="text-green-500 font-mono mt-0.5">✓ ĐÃ ĐẠT ĐƯỢC</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
