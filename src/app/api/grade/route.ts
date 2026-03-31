import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAIClient } from "@/lib/openai";
import { TestCase, SubmitResult, calculateScore } from "@/types";

interface GradeRequest {
  systemPrompt: string;
  testCases: TestCase[];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { systemPrompt, testCases }: GradeRequest = await req.json();
    const openai = getOpenAIClient();

    const results: SubmitResult[] = await Promise.all(
      testCases.map(async (tc) => {
        const message = await openai.chat.completions.create({
          model: "gpt-4.1-nano",
          max_tokens: 64,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: tc.input },
          ],
        });

        const actualOutput = (message.choices[0].message.content ?? "").trim();
        const passed =
          actualOutput.toLowerCase() === tc.expectedOutput.trim().toLowerCase();

        return {
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          passed,
        };
      })
    );

    const correctCount = results.filter((r) => r.passed).length;
    const score = calculateScore(correctCount, testCases.length, systemPrompt.length);

    return NextResponse.json({ results, score });
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
