import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOpenAIClient } from "@/lib/openai";
import { Topic } from "@/types";
import { randomUUID } from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const openai = getOpenAIClient();

    const message = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `당신은 프롬프트 엔지니어링 경진대회 출제자입니다.
참가자들은 시스템 프롬프트를 작성해 모델이 주어진 입력을 정확하게 분류하도록 만들어야 합니다.
참가자들은 zero-shot 최소 프롬프트에서 시작해 오류 패턴을 파악하고 필요한 것만 추가하는 방식으로 최적화합니다.

아래 기준을 모두 만족하는 서로 다른 분류 태스크 주제 3개를 생성하세요:

[좋은 주제 기준]
1. 입력 하나에 정답이 정확히 하나 존재 (모호한 정답 불가)
2. 정답이 사람 상식으로 명백히 판단 가능한 수준
3. 출력은 고정된 짧은 레이블 1~2개 (예: 0/1, 긍정/부정, 스팸/정상, 요청/질문)
   - 반드시 각 레이블이 10자 이내의 단어/숫자여야 함
   - 레이블은 모든 TC에 동일하게 적용되는 고정값이어야 함
4. 단순 지식 테스트가 아닌, 텍스트 패턴/의도/맥락 분류
5. 제목은 태스크를 한 문장으로 명확히 표현
6. description은 입력이 무엇이고 무엇을 판별해야 하는지만 간결하게 2문장 이내

[난이도를 높이는 필수 조건 — 반드시 아래 중 하나 이상 해당해야 함]
A. 표면적 단서와 실제 정답이 반대인 케이스가 자연스럽게 발생하는 태스크
   예: 비꼬는 칭찬, 형식은 질문이지만 실제론 명령, 부정어 없는 불만 표현
B. 단어/키워드 매칭으로는 절대 풀리지 않고 문장 전체 맥락이 필요한 태스크
   예: 동일 단어가 문맥에 따라 다른 레이블로 분류되는 경우
C. 경계선이 미묘해서 규칙을 정교하게 다듬어야 하는 태스크
   예: 과장 광고 vs 일반 홍보, 부탁 vs 명령, 질문 vs 수사적 질문

[피해야 할 주제]
- 정답이 주관적이거나 맥락에 따라 달라지는 것
- 외부 지식(DB, 사전)이 필요한 것
- 키워드나 패턴 하나로 100% 해결되는 것 (너무 쉬운 것)
- 챗봇처럼 자유로운 문장 응답이 필요한 것
- 3개가 서로 유사하거나 같은 도메인인 것
- 감성분류, 스팸탐지, 카테고리분류 같은 뻔한 주제

반드시 아래 JSON 배열만 출력하세요 (설명, 마크다운 없이):
[
  { "title": "태스크 제목 (10자 이내)", "description": "입력 설명 + 판별 기준 (2문장 이내)", "outputFormat": "가능한 출력값 명시 (예: 1 또는 0)" },
  { "title": "...", "description": "...", "outputFormat": "..." },
  { "title": "...", "description": "...", "outputFormat": "..." }
]`,
        },
      ],
    });

    const raw = message.choices[0].message.content ?? "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("JSON 파싱 실패");

    const parsed: Array<{ title: string; description: string; outputFormat: string }> =
      JSON.parse(jsonMatch[0]);

    const topics: Topic[] = parsed.map((item) => ({
      id: randomUUID(),
      title: item.title,
      description: item.description,
      outputFormat: item.outputFormat,
    }));

    return NextResponse.json(topics);
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
