import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const VERIFY_SYSTEM_PROMPT = `You are a Senior Tech Lead reviewing interview answers for a Vietnamese IT student preparation platform called DevReady.

Your task: Evaluate the technical accuracy and completeness of a sample answer for an interview question.

Rules:
1. Be strict but fair — this content will be shown to students as reference material
2. Check for factual errors, outdated information, missing key concepts
3. For code snippets, check for syntax errors and logical bugs
4. Respond ONLY in the exact JSON format below, nothing else
5. Feedback must be in Vietnamese

Response format (JSON only, no markdown):
{"score": <number 1-10>, "feedback": "<Vietnamese feedback>", "errors": ["<error 1>", "<error 2>"]}

Scoring guide:
- 9-10: Excellent, production-ready content
- 7-8: Good but has minor gaps or could be more detailed
- 5-6: Acceptable but has notable issues
- 1-4: Significant errors, should not be published`;

interface VerifyResult {
  questionId: string;
  title: string;
  score: number;
  feedback: string;
  errors: string[];
  status: string;
}

async function verifyQuestion(
  title: string,
  sampleAnswer: string,
): Promise<{ score: number; feedback: string; errors: string[] }> {
  const userMessage = `Interview Question: "${title}"

Sample Answer:
${sampleAnswer}

Evaluate this answer for technical accuracy and completeness.`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: VERIFY_SYSTEM_PROMPT }] },
        {
          role: "model",
          parts: [
            {
              text: '{"score": 0, "feedback": "Ready to evaluate. Send the question and answer.", "errors": []}',
            },
          ],
        },
        { role: "user", parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    score: Math.min(10, Math.max(1, Math.round(parsed.score))),
    feedback: parsed.feedback || "Không có phản hồi",
    errors: parsed.errors || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 },
      );
    }

    const supabase = await createClient();

    // Check admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get question IDs from request body (optional — if empty, fetch all pending)
    const body = await request.json();
    const questionIds: string[] | undefined = body.question_ids;

    // Fetch questions to verify
    let query = supabase
      .from("questions")
      .select("id, title, sample_answer")
      .eq("status", "pending")
      .not("sample_answer", "is", null)
      .order("created_at", { ascending: true })
      .limit(20); // Max 20 at a time to avoid timeout

    if (questionIds && questionIds.length > 0) {
      query = query.in("id", questionIds);
    }

    const { data: questions, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 },
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({
        message: "Không có câu hỏi nào cần xác minh",
        results: [],
      });
    }

    const AI_VERIFY_THRESHOLD = 8;
    const results: VerifyResult[] = [];

    // Process each question sequentially
    for (const q of questions) {
      try {
        const { score, feedback, errors } = await verifyQuestion(
          q.title,
          q.sample_answer!,
        );

        const newStatus = score >= AI_VERIFY_THRESHOLD ? "ai_verified" : "pending";

        // Update the question in DB
        await supabase
          .from("questions")
          .update({
            ai_score: score,
            ai_feedback: feedback,
            status: newStatus,
          })
          .eq("id", q.id);

        results.push({
          questionId: q.id,
          title: q.title,
          score,
          feedback,
          errors,
          status: newStatus,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Error verifying question ${q.id}:`, err);
        results.push({
          questionId: q.id,
          title: q.title,
          score: 0,
          feedback: "Lỗi khi xác minh câu hỏi này",
          errors: [(err as Error).message],
          status: "pending",
        });
      }
    }

    const verified = results.filter((r) => r.status === "ai_verified").length;
    const failed = results.filter((r) => r.status === "pending").length;

    return NextResponse.json({
      message: `Đã xác minh ${results.length} câu hỏi: ${verified} đạt, ${failed} cần xem lại`,
      results,
    });
  } catch (error) {
    console.error("Verify content API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
