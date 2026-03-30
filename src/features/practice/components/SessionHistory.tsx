"use client";

import { SessionRound } from "../hooks/usePractice";
import { MAX_SUBMIT } from "../hooks/usePractice";

interface Props {
  rounds: SessionRound[];
  totalCases: number;
  onFinalSubmit: () => void;
  isFinalSubmitted: boolean;
}

export function SessionHistory({ rounds, totalCases, onFinalSubmit, isFinalSubmitted }: Props) {
  const bestScore = rounds.length > 0 ? Math.max(...rounds.map((r) => r.score.total)) : null;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 sticky top-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          이번 세션 기록
        </h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {rounds.length} / {MAX_SUBMIT}회
        </span>
      </div>

      {bestScore !== null && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-2">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">최고 점수</p>
          <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
            {bestScore.toFixed(4)}
          </p>
        </div>
      )}

      {rounds.length === 0 ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-4">
          채점 결과가 여기에 쌓입니다
        </p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {[...rounds].reverse().map((r) => {
            const isBest = r.score.total === bestScore;
            return (
              <div
                key={r.round}
                className={`rounded-lg px-3 py-2 text-xs ${
                  isBest
                    ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                    : "bg-zinc-50 dark:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 dark:text-zinc-500 font-mono">#{r.round}</span>
                  <span
                    className={`font-bold ${
                      isBest
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {r.score.total.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-zinc-400 dark:text-zinc-500">
                  <span>정답 {r.correctCount}/{totalCases}</span>
                  <span>{r.promptLength}자</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onFinalSubmit}
        disabled={rounds.length === 0 || isFinalSubmitted}
        className={`w-full py-2 rounded-lg text-sm font-semibold transition-opacity ${
          isFinalSubmitted
            ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 opacity-60 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
        }`}
      >
        {isFinalSubmitted ? "최종 제출 완료" : "최종 제출"}
      </button>
    </div>
  );
}
