/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, ShopItem } from '../types';
import { SHOP_ITEMS } from '../data/shop';
import { playSynthSound } from '../lib/sound';
import { ShoppingCart, CheckCircle, Sparkles, Coins, ShoppingBag, ShieldCheck } from 'lucide-react';

interface RewardShopProps {
  user: UserProfile;
  buyBorder: (borderId: string, price: number) => void;
  equipBorder: (borderId: string) => void;
}

export default function RewardShop({ user, buyBorder, equipBorder }: RewardShopProps) {
  
  const handlePurchase = (item: ShopItem) => {
    if (user.mochiCoins < item.price) {
      alert(`Bạn không có đủ Mochi Coins. Cần thêm ${item.price - user.mochiCoins} Xu để mở khóa.`);
      playSynthSound('click');
      return;
    }
    
    // Process Purchase
    buyBorder(item.id, item.price);
    playSynthSound('success');
  };

  const handleEquip = (borderId: string) => {
    equipBorder(borderId);
    playSynthSound('start');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Shop Intro Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-neutral-950 to-neutral-950 border border-amber-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        {/* Subtle matrix-like decor */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(to_bottom,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>

        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            <span className="font-mono text-xs text-amber-400 tracking-widest uppercase font-semibold">COSMETIC LAB // STORE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-sans">
            CỬA HÀNG <span className="text-amber-500">ĐỘ KHUNG AVATAR</span>
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Dùng số <strong className="text-amber-400">Mochi Coins</strong> tích lũy từ những giờ học căng thẳng để mở khóa những bộ khung viền hologram đỉnh cao. Tạo điểm nhấn cá tính cực "pro" khi khoe thành quả cày deadline với bạn bè!
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="bg-black/60 border border-neutral-800 rounded px-3 py-1.5 flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-mono text-neutral-400">Số dư hiện tại:</span>
              <strong className="text-sm font-mono text-amber-400">{user.mochiCoins} Xu</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.map((item) => {
          const isOwned = user.ownedBorders.includes(item.id);
          const isActive = user.activeBorder === item.id;
          
          return (
            <div 
              key={item.id} 
              className={`bg-neutral-950 border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                isActive 
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                  : 'border-neutral-900 hover:border-neutral-800'
              }`}
              id={`shop-item-${item.id}`}
            >
              {/* Active Badge */}
              {isActive && (
                <span className="absolute top-3 right-3 bg-amber-500 text-black px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5" /> ĐANG TRANG BỊ
                </span>
              )}

              {/* Top half: Preview & Description */}
              <div className="space-y-4">
                {/* Live Preview Circle */}
                <div className="flex justify-center py-4 bg-neutral-900/40 rounded-lg border border-neutral-900/50">
                  <div className="relative">
                    <div
                      className={`h-20 w-20 rounded-full bg-neutral-950 flex items-center justify-center text-amber-400 font-bold text-2xl transition-all duration-300 ${item.previewClass}`}
                      style={item.style}
                    >
                      {user.nickname ? user.nickname.substring(0, 2).toUpperCase() : 'MC'}
                    </div>
                  </div>
                </div>

                {/* Info details */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-white font-sans">{item.name}</h3>
                  <p className="text-xs text-neutral-500 leading-normal min-h-[48px] font-sans">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom half: Buy/Equip actions */}
              <div className="border-t border-neutral-900 mt-5 pt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Mức giá</div>
                  <div className="font-mono text-sm font-bold text-amber-400">
                    {item.price === 0 ? 'MIỄN PHÍ' : `${item.price} Xu`}
                  </div>
                </div>

                <div>
                  {isActive ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-500/50 border border-amber-500/10 text-xs font-semibold font-sans uppercase"
                    >
                      KÍCH HOẠT
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 hover:border-amber-500/30 text-xs font-semibold font-sans uppercase transition-all duration-200"
                      id={`btn-equip-${item.id}`}
                    >
                      Trang bị
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold font-sans uppercase flex items-center gap-1.5 transition-all duration-200 shadow-md"
                      id={`btn-buy-${item.id}`}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Mua ngay
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frame usage policy info */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-400 leading-relaxed font-sans">
          <strong className="text-neutral-300">Quy tắc Cửa hàng:</strong> Tất cả khung viền sau khi mua sẽ được sở hữu vĩnh viễn và gắn liền với biệt danh của bạn. Bạn có thể đổi khung bất kỳ lúc nào để làm mới giao diện học tập của mình.
        </div>
      </div>
    </div>
  );
}
