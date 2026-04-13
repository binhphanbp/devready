import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Fallback list: tries each model in order until one succeeds (handles rate limits)
// openrouter/free = OpenRouter's meta-router that auto-picks available free models
const FREE_MODELS = process.env.OPENROUTER_MODEL
  ? [process.env.OPENROUTER_MODEL]
  : [
      'openrouter/free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-3-27b-it:free',
      'openai/gpt-oss-20b:free',
      'nousresearch/hermes-3-llama-3.1-405b:free',
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

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
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
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://devready.app',
      'X-Title': 'DevReady - ReadyBot',
    };

    let lastError = '';
    for (const model of FREE_MODELS) {
      let response: Response;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        response = await fetch(OPENROUTER_URL, {
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
        console.error(`OpenRouter API error (${model}):`, lastError);
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
