/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple synthesizer using Web Audio API to avoid external asset dependency
export function playSynthSound(type: 'start' | 'success' | 'click' | 'break' | 'alarm') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'start') {
      // Ascending chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      // Retro triumphant cyberpunk melody
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
        
        gain.gain.setValueAtTime(0.0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.32);
      });
    } else if (type === 'break') {
      // Gentle break alert
      const notes = [783.99, 587.33, 523.25]; // G5, D5, C5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);

        gain.gain.setValueAtTime(0.0, ctx.currentTime + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + index * 0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.15);
        osc.stop(ctx.currentTime + index * 0.15 + 0.45);
      });
    } else if (type === 'alarm') {
      // Attention grabbing double-beep cybersecurity warning
      const beeps = [880, 880, 1046.50, 1046.50];
      beeps.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

        gain.gain.setValueAtTime(0.0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.10);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.12);
      });
    }
  } catch (e) {
    console.warn('Audio Context is not allowed or supported yet', e);
  }
}
