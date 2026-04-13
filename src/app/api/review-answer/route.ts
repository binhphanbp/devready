import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const REVIEW_SYSTEM_PROMPT = `Bạn là ReadyBot — AI Mentor của DevReady, nền tảng luyện phỏng vấn IT cho sinh viên Việt Nam.

Nhiệm vụ: So sánh câu trả lời của sinh viên với đáp án mẫu cho một câu hỏi phỏng vấn IT, rồi đưa ra đánh giá chi tiết.

Quy tắc:
1. Trả lời bằng tiếng Việt, rõ ràng và mang tính xây dựng
2. Sử dụng Markdown để format câu trả lời
3. Luôn khuyến khích và động viên, không chê bai
4. Đánh giá theo đúng format bên dưới, KHÔNG thêm phần nào khác
5. Điểm đánh giá phải công bằng và hợp lý (1-10)

Format bắt buộc:
## 📊 Điểm đánh giá: X/10

## ✅ Điểm tốt
- [Liệt kê những điểm sinh viên trả lời đúng/hay]

## ⚠️ Thiếu sót
- [Liệt kê những kiến thức quan trọng bị thiếu so với đáp án mẫu]

## 💡 Gợi ý cải thiện
- [Đưa ra lời khuyên cụ thể để cải thiện câu trả lời]`;

export async function POST(request: NextRequest) {
  try {
    const { userAnswer, sampleAnswer, questionTitle } = await request.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    if (!userAnswer || !sampleAnswer || !questionTitle) {
      return NextResponse.json(
        { error: "Missing required fields: userAnswer, sampleAnswer, questionTitle" },
        { status: 400 }
      );
    }

    const userMessage = `Câu hỏi phỏng vấn: "${questionTitle}"

Đáp án mẫu:
${sampleAnswer}

Câu trả lời của sinh viên:
${userAnswer}

Hãy đánh giá câu trả lời của sinh viên so với đáp án mẫu.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: REVIEW_SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Đã hiểu! Tôi sẽ đánh giá câu trả lời của sinh viên theo đúng format yêu cầu. Hãy gửi câu hỏi và câu trả lời để tôi bắt đầu.",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ];

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.4,
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
    const feedback =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Xin lỗi, mình không thể đánh giá lúc này. Vui lòng thử lại!";

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
