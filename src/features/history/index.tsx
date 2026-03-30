"use client";

import { useHistory } from "./hooks/useHistory";
import { HistoryList } from "./components/HistoryList";

export function HistoryView() {
  const { history, bestRound, clearHistory } = useHistory();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
          제출 기록
        </h2>
        {bestRound && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            최고점:{" "}
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              {bestRound.score.toFixed(4)}
            </span>{" "}
            (#{bestRound.round}회)
          </p>
        )}
      </div>

      <HistoryList
        history={history}
        bestRound={bestRound}
        onClear={clearHistory}
      />
    </div>
  );
}
