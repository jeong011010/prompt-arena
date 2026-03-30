"use client";

import { SubmitResult, ScoreBreakdown } from "@/types";

interface Props {
  results: SubmitResult[];
  score: ScoreBreakdown;
  bestScore: number | null;
  submitCount: number;
}

export function GradeResult({ results, score, bestScore, submitCount }: Props) {
  const isNewBest = bestScore !== null && score.total >= bestScore;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          채점 결과 — 시도 #{submitCount}
        </h2>
        {isNewBest && (
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 font-semibold">
            최고점 갱신
          </span>
        )}
      </div>

      {/* 점수 분리 표시 */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreCard
          label="정확도 점수"
          value={score.accuracy}
          sub="× 0.9"
          color="blue"
        />
        <ScoreCard
          label="길이 점수"
          value={score.lengthScore}
          sub="× 0.1"
          color="purple"
        />
        <ScoreCard
          label="최종 점수"
          value={score.total}
          sub={`정답 ${results.filter((r) => r.passed).length} / ${results.length}`}
          color="green"
          large
        />
      </div>

      {/* 테스트케이스별 결과 (최종 제출 전 입력/정답 비공개) */}
      <div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
          테스트케이스 상세는 최종 제출 후 공개됩니다
        </p>
        <div className="flex flex-wrap gap-1.5">
          {results.map((r, i) => (
            <div
              key={r.testCaseId}
              title={`#${i + 1} — ${r.passed ? "통과" : "실패"}`}
              className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                r.passed
                  ? "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  sub,
  color,
  large,
}: {
  label: string;
  value: number;
  sub: string;
  color: "blue" | "purple" | "green";
  large?: boolean;
}) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
  };
  const bgMap = {
    blue: "bg-blue-50 dark:bg-blue-950/30",
    purple: "bg-purple-50 dark:bg-purple-950/30",
    green: "bg-green-50 dark:bg-green-950/30",
  };

  return (
    <div className={`rounded-lg p-3 ${bgMap[color]} text-center`}>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className={`${large ? "text-2xl" : "text-xl"} font-bold ${colorMap[color]}`}>
        {value.toFixed(4)}
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>
    </div>
  );
}
