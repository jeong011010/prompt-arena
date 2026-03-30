# prompt-arena — Claude Code 프로젝트 설정

## 프로젝트 개요
프롬프트 엔지니어링 경진대회 연습용 GUI. OpenAI API(openai)를 Next.js 15 App Router로 연동.

## 기술 스택
- Next.js 15 (App Router, `src/` 디렉토리)
- TypeScript
- Tailwind CSS
- openai

## 폴더 컨벤션
- `src/features/practice/` — 프롬프트 연습 관련 컴포넌트·훅·타입
- `src/features/history/` — 히스토리 관련 컴포넌트·훅·타입
- `src/components/ui/` — 재사용 가능한 기본 UI 컴포넌트
- `src/components/shared/` — 여러 feature에서 공유하는 컴포넌트
- `src/lib/openai.ts` — OpenAI 클라이언트 싱글턴

## 환경변수
- `OPENAI_API_KEY` — OpenAI API 키 (`.env.local`에 설정, 절대 커밋 금지)

## OpenAI API 사용 시 주의사항
- 클라이언트는 항상 `src/lib/openai.ts`에서 import
- API 호출은 서버사이드(Route Handler 또는 Server Action)에서만 수행
- 모델: `gpt-4o-mini`
