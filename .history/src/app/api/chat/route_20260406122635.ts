import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback list: tries each model in order until one succeeds (handles rate limits)
const FREE_MODELS = process.env.OPENROUTER_MODEL
  ? [process.env.OPENROUTER_MODEL]
  : [
      'deepseek/deepseek-chat-v3-0324:free',
      'meta-llama/llama-4-maverick:free',
      'google/gemini-2.0-flash-exp:free',
      'qwen/qwen3.6-plus:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
    ];

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

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      );
    }

    const payload = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2048,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://devready.app',
      'X-Title': 'DevReady - ReadyBot',
    };

    let lastError = '';
    for (const model of FREE_MODELS) {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model, ...payload }),
      });

      if (response.status === 429 || response.status === 503) {
        lastError = await response.text();
        console.warn(`Model ${model} rate-limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        lastError = await response.text();
        console.error(`OpenRouter API error (${model}):`, lastError);
        continue;
      }

      const data = await response.json();
      const reply: string =
        data.choices?.[0]?.message?.content ||
        'Xin lỗi, mình không thể trả lời lúc này. Vui lòng thử lại!';

      return NextResponse.json({ reply });
    }

    console.error('All models failed. Last error:', lastError);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 },
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
