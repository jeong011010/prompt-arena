import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { Topic } from "@/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const clientKey = req.headers.get("x-openai-key") ?? undefined;
    const baseURL = req.headers.get("x-base-url") ?? undefined;
    const model = req.headers.get("x-model") ?? "gpt-4o-mini";
    const openai = getOpenAIClient(clientKey, baseURL);

    const message = await openai.chat.completions.create({
      model,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `당신은 프롬프트 엔지니어링 경진대회 출제자입니다.
참가자들은 시스템 프롬프트를 작성해 모델이 주어진 입력을 정확하게 분류하도록 만들어야 합니다.
참가자들은 zero-shot 최소 프롬프트에서 시작해 오류 패턴을 파악하고 필요한 것만 추가하는 방식으로 최적화합니다.

아래 기준을 모두 만족하는 분류 태스크 주제 1개를 생성하세요:

[좋은 주제 기준]
1. 입력 하나에 정답이 정확히 하나 존재 (모호한 정답 불가)
2. 정답이 사람 상식으로 명백히 판단 가능한 수준
3. 출력은 고정된 짧은 레이블 1~2개 (예: 0/1, 긍정/부정, 스팸/정상, 요청/질문)
   - 반드시 각 레이블이 10자 이내의 단어/숫자여야 함
   - "공감하는 문장", "정보를 제공하는 답변" 같은 자유 형식 출력은 절대 안 됨
   - 레이블은 모든 TC에 동일하게 적용되는 고정값이어야 함
4. 단순 지식 테스트가 아닌, 텍스트 패턴/의도/맥락 분류
5. 제목은 태스크를 한 문장으로 명확히 표현 (예: "리뷰 감성 분류", "스팸 메시지 탐지")
6. description은 입력이 무엇이고 무엇을 판별해야 하는지만 간결하게 2문장 이내

[피해야 할 주제]
- 정답이 주관적이거나 맥락에 따라 달라지는 것
- 외부 지식(DB, 사전)이 필요한 것
- 입력 형식이 고정적이어서 패턴 하나로 100% 해결되는 것 (너무 쉬운 것)
- 챗봇처럼 자유로운 문장 응답이 필요한 것 (항상 레이블 출력 태스크여야 함)

반드시 아래 JSON만 출력하세요 (설명, 마크다운 없이):
{
  "title": "태스크 제목 (10자 이내)",
  "description": "입력 설명 + 판별 기준 (2문장 이내)",
  "outputFormat": "가능한 출력값 명시 (예: 1 또는 0)"
}`,
        },
      ],
    });

    const raw = message.choices[0].message.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");

    const parsed = JSON.parse(jsonMatch[0]);
    const topic: Topic = {
      id: randomUUID(),
      title: parsed.title,
      description: parsed.description,
      outputFormat: parsed.outputFormat,
    };

    return NextResponse.json(topic);
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
