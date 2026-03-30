# prompt-arena 워크플로우 규칙

## 작업 단위
- 기능 단위(feature)로 작업 진행
- 단위 완료마다 사용자 검토 후 다음 단계 진행

## 브랜치 전략
- `main` — 배포 브랜치
- `feat/<기능명>` — 기능 개발
- `fix/<버그명>` — 버그 수정

## 커밋 컨벤션 (Conventional Commits, 한국어)
- `feat(practice): 프롬프트 입력 폼 추가`
- `fix(history): 히스토리 목록 렌더링 오류 수정`
- `chore: 패키지 의존성 업데이트`

## API 호출 규칙
- Claude API는 서버사이드에서만 호출 (Route Handler / Server Action)
- 클라이언트 컴포넌트에서 직접 API 키 사용 금지

## 금지 사항
- `.env.local` 커밋 금지
- `git commit`, `git push` 임의 수행 금지
