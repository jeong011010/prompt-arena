"use client";

import { MAX_PROMPT_LENGTH, MAX_SUBMIT } from "../hooks/usePractice";

interface Props {
  prompt: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitCount: number;
  disabled: boolean;
  isGrading: boolean;
}

export function PromptEditor({
  prompt,
  onChange,
  onSubmit,
  submitCount,
  disabled,
  isGrading,
}: Props) {
  const len = prompt.length;
  const overLimit = len > MAX_PROMPT_LENGTH;
  const remaining = MAX_SUBMIT - submitCount;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          시스템 프롬프트
        </h2>
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            제출{" "}
            <span className={remaining <= 5 ? "text-orange-500 font-semibold" : ""}>
              {submitCount}
            </span>{" "}
            / {MAX_SUBMIT}
          </span>
          <span
            className={
              overLimit
                ? "text-red-500 font-semibold"
                : len > MAX_PROMPT_LENGTH * 0.8
                ? "text-orange-500"
                : ""
            }
          >
            {len.toLocaleString()} / {MAX_PROMPT_LENGTH.toLocaleString()}자
          </span>
        </div>
      </div>

      {overLimit && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg">
          1200자 초과 시 길이 페널티가 최대치로 적용됩니다.
        </p>
      )}

      <textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="LLM에게 줄 시스템 프롬프트를 작성하세요.&#10;예: 당신은 쇼핑몰 Q&A 분류기입니다. 관리자 답변이 필요하면 1, 필요하지 않으면 0만 출력하세요."
        className="w-full h-48 resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 p-3 font-mono focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
      />

      <button
        onClick={onSubmit}
        disabled={disabled || !prompt.trim() || remaining <= 0}
        className="w-full py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
        {isGrading ? "채점 중…" : remaining <= 0 ? "제출 횟수 초과" : "채점하기"}
      </button>
    </div>
  );
}
