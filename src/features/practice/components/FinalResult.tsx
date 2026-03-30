"use client";

import { TestCase, SubmitResult, ScoreBreakdown } from "@/types";

interface Props {
  bestScore: ScoreBreakdown;
  bestResults: SubmitResult[];
  testCases: TestCase[];
}

export function FinalResult({ bestScore, bestResults, testCases }: Props) {
  const correctCount = bestResults.filter((r) => r.passed).length;

  const resultMap = new Map(bestResults.map((r) => [r.testCaseId, r]));

  return (
    <div className="rounded-xl border-2 border-emerald-400 dark:border-emerald-600 bg-white dark:bg-zinc-900 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          최종 제출 결과
        </h2>
      </div>

      {/* 최고 점수 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">정확도 점수</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {bestScore.accuracy.toFixed(4)}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">× 0.9</p>
        </div>
        <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">길이 점수</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {bestScore.lengthScore.toFixed(4)}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">× 0.1</p>
        </div>
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">최고 점수</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {bestScore.total.toFixed(4)}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            정답 {correctCount} / {testCases.length}
          </p>
        </div>
      </div>

      {/* 테스트케이스 공개 */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
          테스트케이스 전체 공개
        </h3>
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {testCases.map((tc, i) => {
            const r = resultMap.get(tc.id);
            const passed = r?.passed ?? false;
            return (
              <div
                key={tc.id}
                className={`rounded-lg px-3 py-2 text-xs ${
                  passed
                    ? "bg-green-50 dark:bg-green-950/30"
                    : "bg-red-50 dark:bg-red-950/30"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 shrink-0 font-bold ${
                      passed
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {passed ? "✓" : "✗"}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <span className="text-zinc-400 dark:text-zinc-500 mr-1">#{i + 1}</span>
                      {tc.input}
                    </p>
                    <div className="flex gap-4 text-zinc-500 dark:text-zinc-400">
                      <span>
                        정답:{" "}
                        <code className="font-mono text-zinc-700 dark:text-zinc-300">
                          {tc.expectedOutput}
                        </code>
                      </span>
                      {r && (
                        <span>
                          실제:{" "}
                          <code
                            className={`font-mono ${
                              passed
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {r.actualOutput}
                          </code>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
