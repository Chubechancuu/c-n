/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';
import { Coins, User, Calendar, MessageSquare, BookOpen, Shield, Palette, Zap } from 'lucide-react';
import { SHOP_ITEMS } from '../data/shop';
import { playSynthSound } from '../lib/sound';

interface NavbarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  colorTheme: 'amber' | 'blue' | 'green';
  setColorTheme: (theme: 'amber' | 'blue' | 'green') => void;
}

export default function Navbar({ user, activeTab, setActiveTab, colorTheme, setColorTheme }: NavbarProps) {
  // Find current active border styling
  const activeBorderObj = SHOP_ITEMS.find(item => item.id === user.activeBorder) || SHOP_ITEMS[0];

  const themeColors = {
    amber: 'text-amber-500 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    blue: 'text-cyan-400 border-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.2)]',
    green: 'text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
  };

  const activeTabClasses = {
    amber: 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    blue: 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]',
    green: 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(52,211,153,0.25)]'
  };

  const accentTextClasses = {
    amber: 'text-amber-500',
    blue: 'text-cyan-400',
    green: 'text-emerald-400'
  };

  const accentBorderClasses = {
    amber: 'border-amber-500/20',
    blue: 'border-cyan-500/20',
    green: 'border-emerald-500/20'
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b bg-black/90 backdrop-blur-md px-4 py-3 md:px-8 transition-colors duration-300 ${accentBorderClasses[colorTheme]}`}>
      <div className="mx-auto max-w-7xl flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Logo and App Brand */}
        <div className="flex items-center gap-3">
          <div className={`relative flex h-9 w-9 items-center justify-center rounded bg-neutral-900 border text-xl font-bold transition-all ${accentTextClasses[colorTheme]} ${accentBorderClasses[colorTheme]}`}>
            <span className="font-mono animate-pulse">M</span>
            <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorTheme === 'amber' ? 'bg-amber-400' : colorTheme === 'blue' ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${colorTheme === 'amber' ? 'bg-amber-500' : colorTheme === 'blue' ? 'bg-cyan-500' : 'bg-emerald-500'}`}></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 font-semibold">PROJECT // 2026</span>
              <span className="bg-neutral-900 text-neutral-400 border border-neutral-800 rounded px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider animate-pulse">
                CONFIDENTIAL_NET
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight text-white font-sans uppercase">
              CHRONOS <span className={accentTextClasses[colorTheme]}>VAULT</span>
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap gap-1 p-1 bg-neutral-950 border border-neutral-900 rounded-lg">
          {[
            { id: 'companion', label: '🌟 AI Đồng Hành', icon: MessageSquare },
            { id: 'study', label: '⏱️ Phòng Tập Trung', icon: Zap },
            { id: 'schedule', label: '📅 Lịch Trình AI', icon: Calendar },
            { id: 'diary', label: '📝 Nhật Ký', icon: BookOpen },
            { id: 'profile', label: '👤 Cá Nhân', icon: User },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  playSynthSound('click');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium font-sans tracking-wide transition-all duration-200 ${
                  isActive
                    ? activeTabClasses[colorTheme]
                    : `text-neutral-400 hover:${accentTextClasses[colorTheme]} hover:bg-neutral-900/40`
                }`}
                id={`tab-${tab.id}`}
              >
                <IconComponent className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Toggles & Coins display */}
        <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end">
          
          {/* Cyberpunk Theme Palette Switches */}
          <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-lg border border-neutral-900">
            <Palette className="h-3.5 w-3.5 text-neutral-500 shrink-0 ml-1" />
            
            {[
              { id: 'amber', label: 'Classic Amber', color: 'bg-amber-500' },
              { id: 'blue', label: 'Neon Blue', color: 'bg-cyan-400' },
              { id: 'green', label: 'Matrix Green', color: 'bg-emerald-400' }
            ].map((theme) => {
              const isSelected = colorTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme.id as any);
                    playSynthSound('success');
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                    isSelected 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={`Switch to ${theme.label}`}
                >
                  <span className={`h-2 w-2 rounded-full ${theme.color}`}></span>
                  <span className="hidden sm:inline">{theme.label.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Mochi Coins balance display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-900 rounded-lg">
            <Coins className={`h-4 w-4 animate-pulse ${accentTextClasses[colorTheme]}`} />
            <div className="text-right font-mono">
              <div className="text-[8px] text-neutral-500 uppercase leading-none">Coins</div>
              <div className={`text-xs font-bold leading-none mt-0.5 ${accentTextClasses[colorTheme]}`}>
                {user.mochiCoins.toLocaleString()} <span className="text-[9px] font-normal text-neutral-500">Xu</span>
              </div>
            </div>
          </div>

          {/* User Profile Mini Tab indicator */}
          <button
            onClick={() => {
              setActiveTab('profile');
              playSynthSound('click');
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            id="navbar-profile-trigger"
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center bg-neutral-950 text-neutral-200 font-bold text-xs overflow-hidden relative transition-all duration-300 ${activeBorderObj.previewClass}`}
              style={activeBorderObj.style}
            >
              {user.nickname ? user.nickname.substring(0, 2).toUpperCase() : 'MC'}
            </div>
            <div className="hidden xl:block">
              <div className={`text-xs font-semibold text-neutral-200 group-hover:${accentTextClasses[colorTheme]} transition-colors`}>
                {user.nickname || 'Đặc vụ Mochi'}
              </div>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
}
