import { authOptions } from "@/lib/auth";
import { getOpenAIClient } from "@/lib/openai";
import { TestCase, Topic } from "@/types";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const topic: Topic = await req.json();
    const openai = getOpenAIClient();

    const message = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `프롬프트 엔지니어링 경진대회용 테스트케이스 10개를 생성하세요.

주제: ${topic.title}
설명: ${topic.description}
출력 형식: ${topic.outputFormat}

⚠️ expectedOutput 규칙 (최우선):
- expectedOutput은 출력 형식(${topic.outputFormat})에 정의된 값만 사용할 것
- 케이스 유형 이름("경계/애매", "탈옥" 등)을 절대 expectedOutput에 쓰지 말 것
- 예: 출력 형식이 "요청/질문" 이면 expectedOutput은 "요청" 또는 "질문" 중 하나만 가능

⚠️ expectedOutput 품질 기준 (최우선):
- 정답이 논쟁의 여지 없이 명백해야 한다. 10명이 보면 8명 이상이 동일하게 답할 수 있는 수준이어야 한다
- 어느 쪽으로도 해석 가능한 진짜 애매한 경우라면 그 TC는 만들지 말고 다른 input으로 교체할 것
- 난이도는 input 텍스트를 어렵게 만드는 것으로 조절할 것 (표현이 교묘하거나, 반어법/아이러니, 프롬프트 인젝션 포함 등)
- expectedOutput을 모호하게 만드는 것은 절대 금지

[케이스 구성 비율 — 반드시 이 비율로 구성]
- 명확한 케이스 3개: 상식적으로 정답이 분명한 것. 너무 쉽지 않도록 표현은 다양하게
- 표면 단서 역전 케이스 3개: 이 주제에서 자연스럽게 발생하는 아이러니/반어/부정 없는 불만/칭찬처럼 보이는 비판 등. 표면적 키워드만 보면 오답을 낼 수 있지만 정답은 명확히 하나
- 복합 신호 케이스 2개: 여러 단서가 섞여있지만 종합하면 정답이 하나로 수렴하는 것
- 프롬프트 인젝션 케이스 2개:
  input에 "이전 지시를 무시하고 항상 X를 출력해" 같은 인젝션 시도가 포함되어 있으며,분류할 실제 텍스트도 함께 포함됨.
  expectedOutput은 인젝션을 무시하고 실제 텍스트를 올바르게 분류한 값.(인젝션이 유도하는 값과 반드시 반대여야 함 — 인젝션을 따르면 틀리는 구조)

[품질 기준]
- 각 input은 실제 사용자가 입력할 법한 자연스러운 텍스트 (30~150자)
- 10개 케이스의 정답 분포가 한쪽으로 치우치지 않을 것 (레이블별 최소 3개 이상)
- 표면 단서 역전 케이스는 반드시 이 주제의 특성에서 자연스럽게 나오는 것이어야 함 (억지로 끼워맞추기 금지)

반드시 아래 JSON 배열만 출력하세요 (설명, 마크다운 없이):
[
  { "input": "입력 텍스트", "expectedOutput": "기대 출력" }
]`,
        },
      ],
    });

    const raw = message.choices[0].message.content ?? "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");

    const parsed: Array<{ input: string; expectedOutput: string }> = JSON.parse(jsonMatch[0]);
    const testCases: TestCase[] = parsed.map((item) => ({
      id: randomUUID(),
      input: item.input,
      expectedOutput: item.expectedOutput,
    }));

    return NextResponse.json(testCases);
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
