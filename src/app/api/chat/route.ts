import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Fallback list: tries each model in order until one succeeds
// Groq models: https://console.groq.com/docs/models
const GROQ_MODELS = process.env.GROQ_MODEL
  ? [process.env.GROQ_MODEL]
  : [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'mixtral-8x7b-32768',
    ];

const SYSTEM_PROMPT = `Bạn là ReadyBot — AI Mentor của DevReady, nền tảng luyện phỏng vấn IT cho sinh viên và Junior Developer Việt Nam.

Quy tắc trả lời:
1. Trả lời bằng tiếng Việt, rõ ràng và dễ hiểu
2. Dùng Markdown chuẩn: heading (##), bullet list (-), code block (\`\`\`lang ... \`\`\`), in đậm (**text**)
3. Code phải luôn nằm trong code block riêng biệt — KHÔNG đặt code vào trong bảng hay inline text dài
4. Dùng bảng (table) CHỈ khi so sánh các mục có cùng thuộc tính (tối đa 3 cột, KHÔNG chứa code trong ô)
5. Ví dụ code: đặt NGOÀI bảng, dùng code block với tên ngôn ngữ (\`\`\`js, \`\`\`sql, ...)
6. Khi trả lời câu hỏi phỏng vấn, cấu trúc theo thứ tự: Định nghĩa ngắn → Ví dụ code → Tips → Lỗi thường gặp
7. Giữ câu trả lời dưới 400 từ trừ khi được yêu cầu chi tiết hơn
8. Khuyến khích và động viên người dùng`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Please set GROQ_API_KEY in .env.local' },
        { status: 500 },
      );
    }

    const payload = {
      stream: true,
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
      Authorization: `Bearer ${GROQ_API_KEY}`,
    };

    let lastError = '';
    for (const model of GROQ_MODELS) {
      let response: Response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        response = await fetch(GROQ_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model, ...payload }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        lastError = String(fetchErr);
        console.warn(`Model ${model} fetch failed (${lastError}), trying next...`);
        continue;
      }

      if (response.status === 429 || response.status === 503) {
        lastError = await response.text();
        console.warn(`Model ${model} rate-limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        lastError = await response.text();
        console.error(`Groq API error (${model}):`, lastError);
        continue;
      }

      const upstreamReader = response.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(ctrl) {
          let buf = '';
          try {
            while (true) {
              const { done, value } = await upstreamReader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() ?? '';
              for (const line of lines) {
                const t = line.trim();
                if (!t || t === 'data: [DONE]') continue;
                if (!t.startsWith('data: ')) continue;
                try {
                  const json = JSON.parse(t.slice(6));
                  const text: string = json.choices?.[0]?.delta?.content ?? '';
                  if (text) ctrl.enqueue(encoder.encode(text));
                } catch { /* skip malformed SSE line */ }
              }
            }
          } finally {
            ctrl.close();
          }
        },
        cancel() { upstreamReader.cancel(); },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-store',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    console.error('All Groq models failed. Last error:', lastError);
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
