/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playSynthSound } from '../lib/sound';
import { Shield, Key, Eye, EyeOff, User, Calendar, Terminal, CheckCircle2, Copy } from 'lucide-react';

interface SecureAuthProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function SecureAuth({ onLoginSuccess }: SecureAuthProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration success state to display the generated security code
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Login inputs
  const [loginFullName, setLoginFullName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const generateSecurityCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MOCHI-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !password || !confirmPassword) {
      alert('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    // Check if user already exists
    const existing = localStorage.getItem(`mochi_user_${fullName.trim().toLowerCase()}`);
    if (existing) {
      alert('Họ và tên này đã được đăng ký hệ thống. Vui lòng chuyển sang Đăng nhập.');
      return;
    }

    const finalNickname = nickname.trim() || `Đặc vụ ${fullName.trim().split(' ').pop() || 'Mochi'}`;
    const securityCode = generateSecurityCode();

    const newUserProfile: UserProfile = {
      nickname: finalNickname,
      fullName: fullName.trim(),
      dob: dob,
      password: password,
      securityCode: securityCode,
      linkName: 'GitHub của tôi',
      linkUrl: 'https://github.com',
      activeBorder: 'border-none',
      ownedBorders: ['border-none'],
      mochiCoins: 150, // Initial coins balance
      totalStudyMinutes: 0,
      streakDays: 1,
      badges: ['badge-welcome']
    };

    // Save user profile to storage
    localStorage.setItem(`mochi_user_${fullName.trim().toLowerCase()}`, JSON.stringify(newUserProfile));
    setGeneratedCode(securityCode);
    playSynthSound('success');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginFullName.trim() || !loginPassword) {
      setLoginError('Vui lòng nhập cả họ tên và mật khẩu.');
      return;
    }

    const savedUserStr = localStorage.getItem(`mochi_user_${loginFullName.trim().toLowerCase()}`);
    if (!savedUserStr) {
      setLoginError('Hồ sơ không tồn tại trên thiết bị này. Vui lòng Đăng ký.');
      return;
    }

    try {
      const savedUser = JSON.parse(savedUserStr) as UserProfile;
      if (savedUser.password === loginPassword) {
        // Authenticated!
        playSynthSound('success');
        onLoginSuccess(savedUser);
      } else {
        setLoginError('Mật khẩu mật mã sai. Truy cập bị từ chối.');
        playSynthSound('click');
      }
    } catch (err) {
      setLoginError('Đã xảy ra lỗi giải mã hồ sơ bảo mật.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    playSynthSound('success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCompleteRegistrationFlow = () => {
    const savedUserStr = localStorage.getItem(`mochi_user_${fullName.trim().toLowerCase()}`);
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      onLoginSuccess(savedUser);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-neutral-950 border-2 border-neutral-900 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col relative"
        id="auth-container"
      >
        {/* Glow Line decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        {/* Display Security Code upon successful signup */}
        {generatedCode ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500">
              <CheckCircle2 className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-sans text-white">ĐĂNG KÝ HỆ THỐNG THÀNH CÔNG</h2>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-sm mx-auto">
                Hệ thống bảo mật đã mã hóa hồ sơ của bạn thành công. Dưới đây là mã bảo mật duy nhất của bạn. Hãy lưu lại để xác minh khi cần thiết.
              </p>
            </div>

            {/* Generated Code Panel */}
            <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="text-left font-mono">
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest leading-none">MÃ SỐ BẢO MẬT CÁ NHÂN</div>
                <div className="text-lg font-bold text-amber-400 tracking-wider mt-1.5">{generatedCode}</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-black hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 hover:text-amber-500 transition-all shrink-0"
                title="Sao chép mã bảo mật"
              >
                {copiedCode ? (
                  <span className="text-[10px] font-mono text-green-400">ĐÃ SAO CHÉP</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              onClick={handleCompleteRegistrationFlow}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3 rounded-lg transition-all font-mono uppercase tracking-widest"
            >
              VÀO HỆ SINH THÁI HỌC TẬP
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            {/* Brand Logo and Title */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="h-12 w-12 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Shield className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white uppercase font-sans">
                  MOCHI <span className="text-amber-500">DEADLINE</span>
                </h1>
                <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mt-0.5">
                  HỆ SINH THÁI HỌC TẬP BẢO MẬT CAO
                </p>
              </div>
            </div>

            {/* Login Error Notification */}
            {loginError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs flex items-start gap-2">
                <Terminal className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {isRegistering ? (
              /* Register Form UI */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Họ và tên (Tên Đăng Nhập)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Biệt danh (Tùy chọn)
                  </label>
                  <div className="relative">
                    <Terminal className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                    <input
                      type="text"
                      placeholder="Ví dụ: Chiến Thần Deadline"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Ngày tháng năm sinh
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                      Mật khẩu mật mã
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Show/Hide checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-pass-checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded bg-black border-neutral-900 text-amber-500 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5"
                  />
                  <label htmlFor="show-pass-checkbox" className="text-[10px] font-mono text-neutral-500 select-none uppercase">
                    Hiển thị mật khẩu
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3 rounded-lg transition-all font-mono uppercase tracking-widest mt-2"
                >
                  TẠO TÀI KHOẢN MỚI
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      playSynthSound('click');
                    }}
                    className="text-[10px] font-mono text-neutral-500 hover:text-amber-500 uppercase tracking-wider"
                  >
                    Đã có tài khoản? Đăng nhập ngay
                  </button>
                </div>
              </form>
            ) : (
              /* Login Form UI */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Full name input */}
                <div>
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                    Họ và tên Đặc vụ
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={loginFullName}
                      onChange={(e) => setLoginFullName(e.target.value)}
                      className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      Mật khẩu khóa
                    </label>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-black border border-neutral-900 focus:border-amber-500 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-700 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-neutral-600 hover:text-amber-500"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-3 rounded-lg transition-all font-mono uppercase tracking-widest mt-2"
                >
                  XÁC THỰC TRUY CẬP
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      playSynthSound('click');
                    }}
                    className="text-[10px] font-mono text-neutral-500 hover:text-amber-500 uppercase tracking-wider"
                  >
                    Chưa có tài khoản? Đăng ký tại đây
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
