/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, StudyHistory } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, Calendar, Zap, Award, Flame } from 'lucide-react';

interface ProgressChartProps {
  user: UserProfile;
  history: StudyHistory[];
}

export default function ProgressChart({ user, history }: ProgressChartProps) {
  
  // Calculate average
  const totalMinutes = history.reduce((sum, h) => sum + h.minutes, 0);
  const avgMinutes = history.length > 0 ? Math.round(totalMinutes / history.length) : 0;

  // Custom tooltip renderer for Recharts to keep design unified
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-950 border border-amber-500/30 p-2.5 rounded-lg shadow-xl font-mono text-[11px]">
          <p className="text-neutral-400 uppercase tracking-wider">{label}</p>
          <p className="text-amber-400 font-bold mt-1">
            Thời lượng: <span className="text-white font-sans text-xs">{payload[0].value} Phút</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* Analytics Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-900 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span className="font-mono text-xs text-amber-500/60 font-semibold tracking-widest uppercase">STATISTICS HUD</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-sans mt-1">
            PHÂN TÍCH <span className="text-amber-500">HIỆU SUẤT TẬP TRUNG</span>
          </h1>
        </div>

        {/* Dynamic Streak Indicator */}
        <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 px-4 py-2 rounded-lg w-fit">
          <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[9px] font-mono text-neutral-500 uppercase">Chuỗi liên tục</div>
            <div className="font-mono text-xs font-bold text-amber-400">
              {user.streakDays} Ngày tập trung
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Study */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4.5 space-y-2">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Tổng phút học
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {user.totalStudyMinutes} <span className="text-xs text-neutral-500 font-sans font-normal">phút</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-sans">Thời lượng ghi nhận thực tế từ các phiên học tập trung.</p>
        </div>

        {/* Stat 2: Daily Avg */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4.5 space-y-2">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-amber-500" /> Trung bình ngày
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {avgMinutes} <span className="text-xs text-neutral-500 font-sans font-normal">phút</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-sans">Hiệu suất phân bổ trung bình tính theo ngày trong tuần.</p>
        </div>

        {/* Stat 3: Coins earned */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4.5 space-y-2">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-amber-500" /> Số Huy Hiệu
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            {user.badges.length} / 4 <span className="text-xs text-neutral-500 font-sans font-normal">đạt được</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-sans">Tổng số huân chương vinh danh đã mở khóa.</p>
        </div>

        {/* Stat 4: Trend Direction */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4.5 space-y-2">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> Xu hướng năng lực
          </div>
          <div className="font-mono text-lg font-bold text-green-400 flex items-center gap-1">
            BỀN BỈ +{avgMinutes > 60 ? 'CAO' : 'ỔN ĐỊNH'}
          </div>
          <p className="text-[10px] text-neutral-500 font-sans">Dữ liệu phân tích mức độ kiên định vượt qua hoảng loạn.</p>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-widest">ĐỒ THỊ HIỆU SUẤT TRONG TUẦN</h3>
          <span className="text-[10px] text-amber-500/70 font-mono">DỮ LIỆU ĐƯỢC CHUẨN HÓA (PHÚT)</span>
        </div>

        {/* Responsive Recharts container */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#404040" 
                fontSize={10} 
                fontFamily="Courier New, monospace"
                tickLine={false}
              />
              <YAxis 
                stroke="#404040" 
                fontSize={10} 
                fontFamily="Courier New, monospace"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="minutes" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorMinutes)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[10px] text-neutral-600 font-mono text-center">
          * Đồ thị được cập nhật tự động sau mỗi phiên học tập trung thành công của bạn.
        </div>
      </div>

    </div>
  );
}
