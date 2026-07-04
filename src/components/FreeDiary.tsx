/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { DiaryEntry, UserProfile } from '../types';
import { playSynthSound } from '../lib/sound';
import { BookOpen, Image, FileText, Plus, Trash2, Calendar, FileCheck, Upload, Sparkles, Download, Edit3, Palette, Type, ShieldAlert } from 'lucide-react';
import html2canvas from 'html2canvas';

interface FreeDiaryProps {
  user: UserProfile;
  deductMochiCoins: (coins: number) => boolean;
  diaries: DiaryEntry[];
  addDiary: (entry: DiaryEntry) => void;
  deleteDiary: (id: string) => void;
  updateDiary: (entry: DiaryEntry) => void;
}

const FONTS = [
  { id: 'font-sans', name: 'Sans Clean', class: 'font-sans' },
  { id: 'font-serif', name: 'Serif Classic', class: 'font-serif' },
  { id: 'font-mono', name: 'Mono Tech', class: 'font-mono' }
];

const COLORS = [
  { id: 'text-neutral-200', name: 'White', hex: '#e5e5e5' },
  { id: 'text-amber-400', name: 'Amber Gold', hex: '#fbbf24' },
  { id: 'text-emerald-400', name: 'Matrix Green', hex: '#34d399' },
  { id: 'text-cyan-400', name: 'Neon Blue', hex: '#22d3ee' }
];

const BORDERS = [
  { id: 'border-gold', name: 'Viền Vàng Kim (Standard)', price: 0, class: 'border-2 border-amber-500/50 bg-neutral-950/90' },
  { id: 'border-cyber-pulse', name: 'Viền Cyber Neon (Upgraded)', price: 50, class: 'border-2 border-cyan-500 animate-pulse bg-neutral-950/90 shadow-[0_0_12px_rgba(34,211,238,0.3)]' },
  { id: 'border-nova-fire', name: 'Viền Bão Lửa (Shiny Premium)', price: 100, class: 'border-2 border-transparent bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 bg-[length:200%_auto] animate-pulse bg-neutral-950/90 shadow-[0_0_15px_rgba(239,68,68,0.4)]' }
];

export default function FreeDiary({ user, deductMochiCoins, diaries, addDiary, deleteDiary, updateDiary }: FreeDiaryProps) {
  const [mode, setMode] = useState<'text' | 'photo' | 'both'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [textColor, setTextColor] = useState('text-neutral-200');
  const [borderType, setBorderType] = useState('border-gold');
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Inline edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState<string>('');
  const [inlineEditContent, setInlineEditContent] = useState<string>('');
  
  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Owned border types
  const [ownedBorders, setOwnedBorders] = useState<string[]>(() => {
    const saved = localStorage.getItem('mochi_diary_owned_borders');
    return saved ? JSON.parse(saved) : ['border-gold'];
  });

  const saveOwnedBorders = (updated: string[]) => {
    setOwnedBorders(updated);
    localStorage.setItem('mochi_diary_owned_borders', JSON.stringify(updated));
  };

  const sampleImages = [
    { name: 'Góc học tập ban đêm', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Ly cà phê chạy deadline', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
    { name: 'Thành phố mờ sương', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80' }
  ];

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng tải lên định dạng hình ảnh (PNG, JPG, WEBP).');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        playSynthSound('success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleCreateOrUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode !== 'photo' && !content.trim()) {
      alert('Vui lòng điền nội dung nhật ký.');
      return;
    }
    
    if (mode !== 'text' && !imageUrl) {
      alert('Vui lòng tải lên ảnh hoặc dán link ảnh.');
      return;
    }

    if (editingId) {
      // Update existing diary
      const existing = diaries.find(d => d.id === editingId);
      if (existing) {
        const updated: DiaryEntry = {
          ...existing,
          mode,
          title: title.trim() || 'Nhật ký không đề',
          content: mode !== 'photo' ? content.trim() : '',
          imageUrl: mode !== 'text' ? imageUrl : undefined,
          fontFamily,
          textColor,
          borderType
        };
        updateDiary(updated);
        playSynthSound('success');
      }
      setEditingId(null);
    } else {
      // Create new diary
      const newEntry: DiaryEntry = {
        id: `diary-${Date.now()}`,
        date: new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' }),
        timestamp: Date.now(),
        mode,
        title: title.trim() || 'Nhật ký không đề',
        content: mode !== 'photo' ? content.trim() : '',
        imageUrl: mode !== 'text' ? imageUrl : undefined,
        fontFamily,
        textColor,
        borderType
      };
      addDiary(newEntry);
      playSynthSound('success');
    }

    // Reset Form
    setTitle('');
    setContent('');
    setImageUrl('');
    setMode('text');
  };

  const handleEditTrigger = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setImageUrl(entry.imageUrl || '');
    setMode(entry.mode);
    setFontFamily(entry.fontFamily || 'font-sans');
    setTextColor(entry.textColor || 'text-neutral-200');
    setBorderType(entry.borderType || 'border-gold');
    playSynthSound('click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setMode('text');
    playSynthSound('click');
  };

  const handleInlineEditTrigger = (entry: DiaryEntry) => {
    setInlineEditingId(entry.id);
    setInlineEditTitle(entry.title);
    setInlineEditContent(entry.content || '');
    playSynthSound('click');
  };

  const handleInlineSave = (id: string) => {
    const existing = diaries.find(d => d.id === id);
    if (!existing) return;
    
    const updated: DiaryEntry = {
      ...existing,
      title: inlineEditTitle.trim() || 'Nhật ký không đề',
      content: inlineEditContent.trim()
    };
    updateDiary(updated);
    setInlineEditingId(null);
    playSynthSound('success');
  };

  // Buy/unlock dynamic borders
  const handleUnlockBorder = (borderId: string, price: number) => {
    if (ownedBorders.includes(borderId)) {
      setBorderType(borderId);
      playSynthSound('click');
      return;
    }

    if (deductMochiCoins(price)) {
      const updated = [...ownedBorders, borderId];
      saveOwnedBorders(updated);
      setBorderType(borderId);
      playSynthSound('success');
      alert(`Đã nâng cấp viền thành công! Khấu trừ ${price} Mochi Coins.`);
    } else {
      alert('Bạn không đủ Mochi Coins để mở khóa viền đặc biệt này.');
    }
  };

  // Capture and export diary card as PNG
  const handleExportCard = async (id: string, entryTitle: string) => {
    const elId = `diary-export-area-${id}`;
    const el = document.getElementById(elId);
    if (!el) return;

    playSynthSound('start');
    try {
      // Make export triggers invisible temporarily
      const btnGroup = document.getElementById(`diary-card-actions-${id}`);
      if (btnGroup) btnGroup.style.display = 'none';

      const canvas = await html2canvas(el, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true
      });

      if (btnGroup) btnGroup.style.display = 'flex';

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `mochi-diary-${entryTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      playSynthSound('success');
    } catch (err) {
      console.error(err);
      alert('Không thể xuất ảnh thẻ nhật ký. Vui lòng kiểm tra lại quyền của trình duyệt.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Left panel: Diary formulation form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 shadow-lg relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
          
          <h2 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> 
            {editingId ? 'HIỆU CHỈNH NHẬT KÝ ĐÃ GHI' : 'GHI NHẬT KÝ KHÔNG GIAN'}
          </h2>

          {/* Mode selections */}
          <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-lg mb-4">
            {[
              { id: 'text', label: 'Chỉ Chữ', icon: FileText },
              { id: 'photo', label: 'Chỉ Ảnh', icon: Image },
              { id: 'both', label: 'Chữ & Ảnh', icon: Palette },
            ].map((m) => {
              const IconComp = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id as any);
                    playSynthSound('click');
                  }}
                  className={`flex flex-col items-center gap-1.5 py-2 rounded text-[10px] font-sans font-medium transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-black font-semibold shadow-inner' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-950/50'
                  }`}
                >
                  <IconComp className="h-3.5 w-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleCreateOrUpdateEntry} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                Tiêu đề nhật ký (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Chạy deadline Triết học lúc nửa đêm..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            {/* Typography style customization */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Type className="h-3 w-3 text-amber-500" /> Kiểu Font Chữ
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-black border border-neutral-900 text-xs text-white p-1.5 rounded focus:outline-none focus:border-amber-500"
                >
                  {FONTS.map(f => (
                    <option key={f.id} value={f.class}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Palette className="h-3 w-3 text-amber-500" /> Màu Sắc Văn Bản
                </label>
                <select
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full bg-black border border-neutral-900 text-xs text-white p-1.5 rounded focus:outline-none focus:border-amber-500"
                >
                  {COLORS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Field */}
            {mode !== 'photo' && (
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  Nội dung nhật ký
                </label>
                <textarea
                  placeholder="Hôm nay tiến trình học tập thế nào, bạn có bị xao nhãng không?..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none leading-relaxed ${fontFamily} ${textColor}`}
                />
              </div>
            )}

            {/* Image upload */}
            {mode !== 'text' && (
              <div className="space-y-3">
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  Đính kèm ảnh không gian chạy deadline
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/5'
                      : imageUrl
                      ? 'border-neutral-800 bg-neutral-900/10'
                      : 'border-neutral-900 hover:border-neutral-800 bg-neutral-950 hover:bg-neutral-900/20'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  {imageUrl ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <FileCheck className="h-5 w-5 text-green-500 animate-pulse" />
                      <span className="text-[10px] text-green-400 font-mono font-bold uppercase">ĐÃ ĐÍNH KÈM HÌNH ẢNH</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl('');
                        }}
                        className="text-[9px] text-red-400 underline uppercase mt-1 hover:text-red-300"
                      >
                        Hủy ảnh đính kèm
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="h-5 w-5 text-neutral-600" />
                      <span className="text-[10px] text-neutral-300 font-sans">Kéo thả ảnh hoặc click để tải file</span>
                      <span className="text-[9px] text-neutral-600 font-mono">PNG, JPG, WEBP</span>
                    </div>
                  )}
                </div>

                {/* Direct Image URL input */}
                <div className="pt-1">
                  <div className="text-[9px] text-neutral-500 font-mono mb-1">HOẶC DÁN ĐƯỜNG DẪN ẢNH (IMAGE URL)</div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl.startsWith('data:') ? '' : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded px-3 py-1.5 text-[11px] text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono"
                  />
                </div>

                {/* Preset Suggestions */}
                <div className="pt-1">
                  <div className="text-[9px] text-neutral-500 font-mono mb-1">ẢNH HỌC TẬP KHUYÊN DÙNG</div>
                  <div className="flex flex-wrap gap-1">
                    {sampleImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setImageUrl(img.url);
                          playSynthSound('click');
                        }}
                        className="text-[9px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded border border-neutral-800 hover:border-amber-500 hover:text-white transition-colors"
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Interactive Border Selector */}
            <div className="pt-2 border-t border-neutral-900/60">
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> CHỌN KHUNG VIỀN NHẬT KÝ (UPGRADE)
              </label>
              
              <div className="space-y-2">
                {BORDERS.map((b) => {
                  const isOwned = ownedBorders.includes(b.id);
                  const isSelected = borderType === b.id;
                  
                  return (
                    <div 
                      key={b.id} 
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                        isSelected 
                          ? 'bg-amber-500/5 border-amber-500/60' 
                          : 'bg-neutral-900/20 border-neutral-900'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-neutral-200">{b.name}</div>
                        <div className="text-[9px] text-neutral-500">{isOwned ? 'Đã sở hữu' : `Mở khóa bằng ${b.price} Xu`}</div>
                      </div>
                      
                      {isOwned ? (
                        <button
                          type="button"
                          onClick={() => setBorderType(b.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                            isSelected 
                              ? 'bg-amber-500 text-black' 
                              : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-850'
                          }`}
                        >
                          DÙNG
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUnlockBorder(b.id, b.price)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold border border-amber-500/30"
                        >
                          MỞ KHÓA
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-semibold text-xs py-2 rounded-lg transition-all"
                >
                  HỦY BỎ
                </button>
              )}
              <button
                type="submit"
                className={`bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2 rounded-lg transition-all duration-200 shadow-md font-mono uppercase tracking-wider ${
                  editingId ? 'w-2/3' : 'w-full'
                }`}
              >
                {editingId ? 'CẬP NHẬT NHẬT KÝ ✓' : 'LƯU LẠI NHẬT KÝ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel: Render historical Logs */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="text-sm font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-amber-500" /> CÁC BẢN GHI LỊCH SỬ CHẠY DEADLINE ({diaries.length})
        </h3>

        {diaries.length === 0 ? (
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-8 text-center text-neutral-600 text-xs">
            Hộp đen nhật ký đang trống rỗng. Hãy để lại một vài cảm xúc hoặc hình ảnh chạy deadline của bạn tại đây!
          </div>
        ) : (
          <div className="space-y-5 max-h-[620px] overflow-y-auto pr-1">
            {diaries.map((entry) => {
              const borderObj = BORDERS.find(b => b.id === (entry.borderType || 'border-gold')) || BORDERS[0];
              const customFont = entry.fontFamily || 'font-sans';
              const customColor = entry.textColor || 'text-neutral-200';
              const isDeletingThis = confirmDeleteId === entry.id;
              const isInlineEditing = inlineEditingId === entry.id;
              
              return (
                <div 
                  key={entry.id} 
                  id={`diary-export-area-${entry.id}`}
                  className={`rounded-xl overflow-hidden p-5 space-y-4 relative group transition-all duration-300 shadow-md ${borderObj.class}`}
                >
                  {/* Cyberpunk styled Delete Confirmation Overlay */}
                  {isDeletingThis && (
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30 border border-red-500/50 rounded-xl space-y-3">
                      <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
                      <p className="text-xs font-mono text-neutral-300 text-center uppercase tracking-wider px-4">
                        Bạn có chắc chắn muốn hủy bỏ bản ghi này vĩnh viễn?
                      </p>
                      <div className="flex items-center gap-3 w-full max-w-[240px]">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            playSynthSound('click');
                          }}
                          className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 font-mono text-[10px] rounded uppercase font-bold cursor-pointer"
                        >
                          HỦY BỎ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteDiary(entry.id);
                            setConfirmDeleteId(null);
                            playSynthSound('success');
                          }}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] rounded uppercase font-bold shadow-[0_0_8px_rgba(239,68,68,0.4)] cursor-pointer"
                        >
                          XÓA BỎ
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header info */}
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <div className="text-[10px] font-mono text-amber-500/60 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> {entry.date} {isInlineEditing && ' // ĐANG HIỆU CHỈNH TRỰC TIẾP'}
                      </div>
                      {isInlineEditing ? (
                        <input
                          type="text"
                          value={inlineEditTitle}
                          onChange={(e) => setInlineEditTitle(e.target.value)}
                          className="w-full bg-black/70 border border-amber-500/30 rounded mt-1.5 px-3 py-1.5 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-semibold font-sans"
                          placeholder="Tiêu đề nhật ký..."
                        />
                      ) : (
                        <h4 className={`text-base font-bold text-neutral-100 mt-1 ${customFont}`}>
                          {entry.title}
                        </h4>
                      )}
                    </div>
                  </div>

                  {/* Content body based on mode */}
                  <div className="space-y-3">
                    {/* Photo Component */}
                    {entry.imageUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-neutral-900/60 max-h-[240px]">
                        <img 
                          src={entry.imageUrl} 
                          alt="Diary space" 
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Text Component */}
                    {isInlineEditing ? (
                      <textarea
                        rows={4}
                        value={inlineEditContent}
                        onChange={(e) => setInlineEditContent(e.target.value)}
                        className={`w-full bg-black/70 border border-amber-500/30 rounded p-3 text-xs leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 ${customFont} ${customColor}`}
                        placeholder="Nội dung nhật ký của bạn..."
                      />
                    ) : (
                      entry.content && (
                        <p className={`text-xs whitespace-pre-line leading-relaxed ${customFont} ${customColor}`}>
                          {entry.content}
                        </p>
                      )
                    )}
                  </div>

                  {/* Action group triggers */}
                  {isInlineEditing ? (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-900/40 z-20">
                      <button
                        type="button"
                        onClick={() => {
                          setInlineEditingId(null);
                          playSynthSound('click');
                        }}
                        className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>HỦY BỎ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInlineSave(entry.id)}
                        className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      >
                        <span>LƯU LẠI ✓</span>
                      </button>
                    </div>
                  ) : (
                    <div 
                      id={`diary-card-actions-${entry.id}`}
                      className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-900/40 z-20"
                    >
                      <button
                        type="button"
                        onClick={() => handleInlineEditTrigger(entry)}
                        className="px-3 py-1.5 rounded bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Hiệu chỉnh nội dung"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>SỬA</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleExportCard(entry.id, entry.title)}
                        className="px-3 py-1.5 rounded bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-cyan-400 text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Xuất làm ảnh Cyberpunk"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>XUẤT ẢNH THẺ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(entry.id);
                          playSynthSound('click');
                        }}
                        className="px-3 py-1.5 rounded bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-red-500 text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>XÓA GHI CHÚ</span>
                      </button>
                    </div>
                  )}

                  {/* Aesthetic footer */}
                  <div className="flex items-center justify-between pt-1.5 text-[8px] font-mono text-neutral-600">
                    <span>DECRYPTED_LOG_ID: {entry.id}</span>
                    <span>STYLE: {customFont.toUpperCase()} // COLOR: {customColor.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
