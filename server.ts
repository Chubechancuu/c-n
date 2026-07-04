/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini SDK with telemetry User-Agent
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini SDK initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not defined. AI features will require config.");
  }

  // API Route: AI Chat Companion
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ 
          error: "Gemini API client not initialized. Vui lòng thiết lập API key trong Settings > Secrets." 
        });
      }
      const { message, history, companionType } = req.body;
      
      const systemInstruction = `You are ${companionType || 'Mochi'}, a supportive, highly specialized study companion with a cyberpunk, retro-futuristic aesthetic. 
Your goal is to help the student overcome study stress, stay focused, plan tasks, and solve homework. 
Respond in Vietnamese, keep your tone enthusiastic, sharp, cyber-styled, yet extremely encouraging.
Use occasional cyberpunk jargon (like "cyber", "system", "offline-first", "decrypt", "matrix", "hologram").`;

      // Build contents for multi-turn chat
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        });
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text || "Hệ thống AI đang phản hồi trống." });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi xử lý AI." });
    }
  });

  // API Route: AI Schedule Optimization
  app.post("/api/gemini/optimize-schedule", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ 
          error: "Gemini API client not initialized. Vui lòng thiết lập API key trong Settings > Secrets." 
        });
      }
      const { timetable, goals } = req.body;

      const prompt = `Hãy tối ưu hóa thời khóa biểu học tập này của tôi.
Thời khóa biểu hiện tại:
${JSON.stringify(timetable, null, 2)}

Mục tiêu học tập & Môn học ưu tiên:
${JSON.stringify(goals, null, 2)}

Hãy viết một phản hồi bằng tiếng Việt ngắn gọn, súc tích (bằng định dạng Markdown). 
Cung cấp:
1. Gợi ý thứ tự học tập tối ưu nhất dựa trên mức độ ưu tiên.
2. Phân bổ thời gian nghỉ hợp lý (vd Pomodoro 50/10 hoặc chu kỳ 90 phút).
3. Lời khuyên công nghệ để tăng năng suất và giữ tập trung.
Giữ phong cách trò chuyện cyberpunk, thông minh và khích lệ mãnh liệt.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an advanced AI Smart Schedule Optimizer in a high-security study ecosystem. Respond in Vietnamese using structured Markdown.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text || "Không thể tối ưu hóa lịch trình." });
    } catch (error: any) {
      console.error("Gemini Optimizer Error:", error);
      res.status(500).json({ error: error.message || "Đã xảy ra lỗi khi xử lý AI tối ưu hóa." });
    }
  });

  // Serve static assets / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
