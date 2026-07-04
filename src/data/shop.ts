/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'border-none',
    name: 'Khung Cơ Bản (Classic)',
    description: 'Khung viền mỏng tiêu chuẩn, thanh lịch cho chiến binh tối giản.',
    price: 0,
    previewClass: 'border-2 border-neutral-700',
    style: {}
  },
  {
    id: 'border-amber-glow',
    name: 'Hổ Phách Neon (Amber Glow)',
    description: 'Hào quang neon vàng hổ phách đặc trưng của hệ điều hành Cyberpunk cổ điển.',
    price: 50,
    previewClass: 'border-2 border-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]',
    style: {
      boxShadow: '0 0 12px #f59e0b',
    }
  },
  {
    id: 'border-matrix-green',
    name: 'Hacker Ma Trận (Matrix Stream)',
    description: 'Dòng mã nguồn kỹ thuật số xanh lá rực rỡ, tượng trưng cho sự bền bỉ.',
    price: 100,
    previewClass: 'border-2 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse',
    style: {
      boxShadow: '0 0 12px #22c55e',
    }
  },
  {
    id: 'border-nova-fire',
    name: 'Bão Lửa Siêu Tân Tinh (Nova Fire)',
    description: 'Viền chuyển sắc rực rỡ giữa cam cháy và vàng kim lấp lánh cực độ.',
    price: 180,
    previewClass: 'border-2 border-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-[length:200%_auto] animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    style: {
      backgroundImage: 'linear-gradient(to right, #f59e0b, #f97316, #eab308)',
      boxShadow: '0 0 15px rgba(249,115,22,0.6)'
    }
  },
  {
    id: 'border-cosmic-purple',
    name: 'Vũ Trụ Vô Tận (Cosmic Nebula)',
    description: 'Khung viền xoay chuyển sắc màu tím sâu thẳm kết hợp nhịp đập vàng neon.',
    price: 250,
    previewClass: 'border-2 border-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.7)] animate-pulse',
    style: {
      boxShadow: '0 0 18px #8b5cf6, inset 0 0 8px #f59e0b'
    }
  }
];

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  conditionText: string;
}

export const BADGES: Badge[] = [
  {
    id: 'badge-welcome',
    name: 'Tân Binh Cyber',
    description: 'Gia nhập mạng lưới học tập Mochi Deadline.',
    icon: 'Terminal',
    conditionText: 'Nhận ngay khi đăng ký biệt danh.'
  },
  {
    id: 'badge-sprint',
    name: 'Chúa Tể Sprint',
    description: 'Hoàn thành trọn vẹn 1 phiên Chạy nước rút 90 phút.',
    icon: 'Zap',
    conditionText: 'Hoàn thành phiên Sprint 90p.'
  },
  {
    id: 'badge-emergency',
    name: 'Kẻ Hủy Diệt Deadline',
    description: 'Sử dụng Thuật toán Khẩn cấp cứu vãn deadline thành công.',
    icon: 'Flame',
    conditionText: 'Hoàn thành phiên Khẩn cấp 120p.'
  },
  {
    id: 'badge-rich',
    name: 'Đại Gia Mochi',
    description: 'Độ thành công khung viền siêu cao cấp từ Cửa hàng.',
    icon: 'Award',
    conditionText: 'Sở hữu khung viền cao cấp bất kỳ.'
  }
];
