/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CSSProperties } from 'react';

export interface UserProfile {
  nickname: string;
  fullName: string;
  dob: string;
  password?: string;
  securityCode: string;
  linkName: string;
  linkUrl: string;
  activeBorder: string; // ID of the active border
  ownedBorders: string[]; // List of owned border IDs
  mochiCoins: number;
  totalStudyMinutes: number;
  streakDays: number;
  badges: string[]; // List of badge IDs
}

export interface DiaryEntry {
  id: string;
  date: string;
  timestamp: number;
  mode: 'text' | 'photo' | 'both';
  title: string;
  content: string;
  imageUrl?: string;
  fontFamily?: string;
  textColor?: string;
  borderType?: string; // e.g., 'standard', 'gold-neon', 'cyber-shiny'
}

export interface TimetableItem {
  id: string;
  day: string; // e.g., "Thứ 2"
  time: string; // e.g., "08:00 - 10:00"
  subject: string;
}

export interface GoalItem {
  id: string;
  title: string;
  deadline: string; // "YYYY-MM-DD" style
  deadlineTime?: string; // "HH:MM" style, e.g. "23:59"
  priority: 'high' | 'medium' | 'low';
  focusHours?: number;
  focusMinutes?: number;
  completed?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  previewClass: string; // Tailwind class for border rendering
  style: CSSProperties;
}

export interface LeaderboardUser {
  id: string;
  nickname: string;
  studyMinutes: number;
  activeBorder: string;
  isCurrentUser?: boolean;
  giftScore: number;
}

export interface StudyHistory {
  date: string; // e.g. "Thu 2", "Thu 3" or formatted
  minutes: number;
}
