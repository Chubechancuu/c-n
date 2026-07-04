/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, ShopItem } from '../types';
import { SHOP_ITEMS, BADGES } from '../data/shop';
import { playSynthSound } from '../lib/sound';
import { Shield, User, Link2, Award, Info, Flame, Trophy, Terminal, Zap, LogOut, Check, Heart } from 'lucide-react';

interface UserProfileTabProps {
  user: UserProfile;
  updateUser: (updated: Partial<UserProfile>) => void;
  deductMochiCoins: (coins: number) => boolean;
  onLogout: () => void;
}

export default function UserProfileTab({ user, updateUser, deductMochiCoins, onLogout }: UserProfileTabProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [linkName, setLinkName] = useState(user.linkName);
  const [linkUrl, setLinkUrl] = useState(user.linkUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      nickname: nickname || 'Đặc vụ Mochi',
      linkName: linkName || '',
      linkUrl: linkUrl || '',
    });
    setSaveSuccess(true);
    playSynthSound('success');
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handlePurchaseBorder = (item: ShopItem) => {
    if (user.ownedBorders.includes(item.id)) {
      updateUser({ activeBorder: item.id });
      playSynthSound('success');
      return;
    }

    if (deductMochiCoins(item.price)) {
      const updatedOwned = [...user.ownedBorders, item.id];
      const hasPremiumBadge = updatedOwned.length > 1;
      const updatedBadges = [...user.badges];
      
      if (hasPremiumBadge && !updatedBadges.includes('badge-rich')) {
        updatedBadges.push('badge-rich');
        playSynthSound('success');
      }

      updateUser({
        ownedBorders: updatedOwned,
        activeBorder: item.id,
        badges: updatedBadges
      });
      playSynthSound('success');
      alert(`Mua thành công ${item.name}! Đã khấu trừ ${item.price} Mochi Coins.`);
    } else {
      alert('Bạn không có đủ Mochi Coins để mở khóa viền này.');
    }
  };

  const currentBorder = SHOP_ITEMS.find(item => item.id === user.activeBorder) || SHOP_ITEMS[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Left Column: Avatar & Secure Hologram ID Card */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* The Cyber ID Hologram */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 shadow-lg flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-mono text-[8px] text-neutral-600">CONFIDENTIAL_ID</span>
          </div>

          <div className="text-[10px] font-mono text-amber-500/50 uppercase tracking-widest mb-6 mt-2">AGENT HOLOGRAPHIC ID</div>
          
          {/* Avatar frame rendered based on currentBorder */}
          <div className="relative mb-5">
            <div
              className={`h-28 w-28 rounded-full bg-neutral-950 flex items-center justify-center text-amber-400 font-bold text-4xl select-none transition-all duration-300 ${currentBorder.previewClass}`}
              style={currentBorder.style}
            >
              {nickname ? nickname.substring(0, 2).toUpperCase() : 'MC'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              AGENT
            </div>
          </div>

          <h3 className="text-lg font-bold text-neutral-100 text-center font-sans tracking-wide">
            {nickname || 'Chưa Đăng Ký'}
          </h3>

          <p className="text-xs text-neutral-500 font-mono mt-1 text-center truncate max-w-full">
            {linkUrl ? (
              <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline inline-flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" /> {linkName || 'Liên kết ngoài'}
              </a>
            ) : (
              'Chưa cấu hình liên kết xã hội'
            )}
          </p>

          {/* Core Stats Block */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6 border-t border-neutral-900 pt-5">
            <div className="bg-black/40 border border-neutral-900 rounded p-3 text-center">
              <div className="flex justify-center text-amber-500 mb-1">
                <Flame className="h-4 w-4 animate-pulse" />
              </div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Chuỗi Liên Tục</div>
              <div className="font-mono text-sm font-bold text-amber-400 mt-0.5">
                {user.streakDays} <span className="text-xs font-normal text-neutral-500">Ngày</span>
              </div>
            </div>

            <div className="bg-black/40 border border-neutral-900 rounded p-3 text-center">
              <div className="flex justify-center text-amber-500 mb-1">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">Tổng Thời Lượng</div>
              <div className="font-mono text-sm font-bold text-amber-400 mt-0.5">
                {(user.totalStudyMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-neutral-500">Giờ</span>
              </div>
            </div>
          </div>

          <div className="w-full text-center mt-4 text-[11px] font-mono bg-neutral-900/40 border border-neutral-900 py-2 rounded">
            <span className="text-neutral-500">TÀI KHOẢN COINS: </span>
            <span className="font-bold text-amber-400">{user.mochiCoins} XU</span>
          </div>
        </div>

        {/* Secure Credentials View Card */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Shield className="h-3 w-3 text-amber-500" />
            <span className="font-mono text-[8px] text-neutral-600">SECURE_VAULT</span>
          </div>

          <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-3">THÔNG TIN BẢO MẬT CỨU HỘ</h4>
          
          <div className="space-y-3 font-sans text-xs">
            <div className="bg-black/50 p-2.5 rounded border border-neutral-900">
              <span className="block text-[9px] font-mono text-neutral-500 uppercase">Họ và tên Đặc vụ</span>
              <span className="font-semibold text-neutral-200 mt-0.5 block">{user.fullName}</span>
            </div>
            
            <div className="bg-black/50 p-2.5 rounded border border-neutral-900">
              <span className="block text-[9px] font-mono text-neutral-500 uppercase">Ngày tháng năm sinh</span>
              <span className="font-semibold text-neutral-200 mt-0.5 block">{user.dob}</span>
            </div>

            <div className="bg-black/50 p-2.5 rounded border-neutral-900">
              <span className="block text-[9px] font-mono text-neutral-500 uppercase">Mã khôi phục bảo mật</span>
              <span className="font-mono font-bold text-amber-400 mt-0.5 block tracking-wider">{user.securityCode}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn đăng xuất khỏi hồ sơ bảo mật này trên thiết bị này?')) {
                playSynthSound('click');
                onLogout();
              }
            }}
            className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 font-bold text-xs py-2 rounded-lg transition-all font-mono flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> ĐĂNG XUẤT HỒ SƠ
          </button>
        </div>

      </div>

      {/* Right Column: Profile Edits, Badge Grid & Frame Shop */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Profile Settings Form */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg">
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> CẬP NHẬT BIỆT DANH & LIÊN KẾT
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                Biệt danh hiển thị (Display Nickname)
              </label>
              <input
                type="text"
                maxLength={24}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  Tiêu đề liên kết
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="Ví dụ: My GitHub"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  Đường dẫn (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2 px-5 rounded-lg transition-all duration-200 shadow-md font-sans uppercase"
              >
                {saveSuccess ? 'ĐÃ LƯU ✓' : 'LƯU THAY ĐỔI'}
              </button>
            </div>
          </form>
        </div>

        {/* Badge Achieved Systems */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg">
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Award className="h-4 w-4" /> DANH SÁCH HUY HIỆU CYBER ĐÃ ĐẠT
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGES.map((b) => {
              const isEarned = user.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`relative p-3 rounded-lg border text-center transition-all duration-300 ${
                    isEarned
                      ? 'bg-amber-500/5 border-amber-500/30 text-amber-400 shadow-sm'
                      : 'bg-neutral-950 border-neutral-900 text-neutral-700'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {b.icon === 'Terminal' && <Terminal className="h-5 w-5" />}
                    {b.icon === 'Zap' && <Zap className="h-5 w-5" />}
                    {b.icon === 'Flame' && <Flame className="h-5 w-5 animate-pulse" />}
                    {b.icon === 'Award' && <Award className="h-5 w-5" />}
                  </div>
                  <h4 className="text-[11px] font-bold font-sans truncate">{b.name}</h4>
                  <p className="text-[9px] text-neutral-500 mt-1 leading-normal font-sans">{b.description}</p>
                  <div className="text-[8px] font-mono text-neutral-600 mt-2 border-t border-neutral-900/60 pt-1">
                    {isEarned ? '✓ ĐÃ HOÀN THÀNH' : `ĐK: ${b.conditionText}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Avatar Frame Shop Segment */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg">
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4" /> CỬA HÀNG KHUNG HÀO QUANG AVATAR
          </h2>

          <div className="space-y-3">
            {SHOP_ITEMS.map((item) => {
              const isOwned = user.ownedBorders.includes(item.id);
              const isActive = user.activeBorder === item.id;
              
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                    isActive
                      ? 'bg-amber-500/5 border-amber-500'
                      : 'bg-neutral-900/30 border-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Visual Preview Frame of this shop item */}
                    <div 
                      className={`h-11 w-11 rounded-full bg-neutral-950 flex items-center justify-center font-bold text-neutral-500 text-sm border ${item.previewClass}`}
                      style={item.style}
                    >
                      {nickname ? nickname.substring(0, 2).toUpperCase() : 'MC'}
                    </div>

                    <div className="space-y-0.5">
                      <div className="font-semibold text-neutral-200">{item.name}</div>
                      <p className="text-[10px] text-neutral-500 max-w-sm md:max-w-md leading-normal font-sans">{item.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isActive ? (
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> ĐANG DÙNG
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={() => handlePurchaseBorder(item)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded text-[10px] font-mono font-bold border border-neutral-800 hover:border-neutral-700"
                      >
                        SỬ DỤNG
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseBorder(item)}
                        className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5"
                      >
                        <span>{item.price} XU</span>
                      </button>
                    )}
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
