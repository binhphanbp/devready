import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Bạn là ReadyBot — AI Mentor của DevReady, nền tảng luyện phỏng vấn IT cho sinh viên và Junior Developer Việt Nam.

Quy tắc:
1. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu
2. Luôn đưa ra ví dụ code khi giải thích khái niệm kỹ thuật
3. Sử dụng Markdown để format câu trả lời (headers, code blocks, bullet points)
4. Khi được hỏi câu phỏng vấn, hãy đưa ra:
   - Câu trả lời mẫu
   - Tips khi trả lời
   - Lỗi thường gặp cần tránh
5. Khuyến khích và động viên người dùng
6. Nếu không chắc chắn, hãy nói rõ ràng thay vì đoán mò
7. Giữ câu trả lời dưới 500 từ trừ khi được yêu cầu chi tiết hơn`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Build conversation for Gemini
    const contents = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Xin chào! Mình là ReadyBot 🤖 — AI Mentor của DevReady. Mình có thể giúp bạn:\n\n- 💡 Giải thích khái niệm kỹ thuật\n- 📝 Luyện tập câu hỏi phỏng vấn\n- 🎯 Tips và tricks cho buổi phỏng vấn\n- 🔧 Debug và review code\n\nBạn cần giúp gì nào?",
          },
        ],
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ];

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, mình không thể trả lời lúc này. Vui lòng thử lại!";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
