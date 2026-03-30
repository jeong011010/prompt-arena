import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { TestCase, SubmitResult, calculateScore } from "@/types";

interface GradeRequest {
  systemPrompt: string;
  testCases: TestCase[];
}

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, testCases }: GradeRequest = await req.json();
    const clientKey = req.headers.get("x-openai-key") ?? undefined;
    const baseURL = req.headers.get("x-base-url") ?? undefined;
    const model = req.headers.get("x-model") ?? "gpt-4o-mini";
    const openai = getOpenAIClient(clientKey, baseURL);

    const results: SubmitResult[] = await Promise.all(
      testCases.map(async (tc) => {
        const message = await openai.chat.completions.create({
          model,
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
