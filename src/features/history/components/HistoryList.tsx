"use client";

import { useState } from "react";
import { RoundHistory } from "@/types";

interface Props {
  history: RoundHistory[];
  bestRound: RoundHistory | null;
  onClear: () => void;
}

export function HistoryList({ history, bestRound, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400 dark:text-zinc-600 text-sm">
          아직 기록이 없습니다. 연습 탭에서 채점을 시작하세요.
        </p>
      </div>
    );
  }

  // topicId 기준으로 그룹핑 (최근 주제가 위로)
  const groups = groupByTopic(history);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          총 {history.length}회 제출 · {groups.length}개 주제
        </p>
        <button
          onClick={onClear}
          className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          기록 초기화
        </button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <TopicGroup key={group.topicId} group={group} bestRoundId={bestRound?.id ?? null} />
        ))}
      </div>
    </div>
  );
}

interface TopicGroup {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  topicOutputFormat: string;
  rounds: RoundHistory[];
  bestScore: number;
}

function groupByTopic(history: RoundHistory[]): TopicGroup[] {
  const map = new Map<string, TopicGroup>();
  for (const r of history) {
    if (!map.has(r.topicId)) {
      map.set(r.topicId, {
        topicId: r.topicId,
        topicTitle: r.topicTitle,
        topicDescription: r.topicDescription,
        topicOutputFormat: r.topicOutputFormat,
        rounds: [],
        bestScore: 0,
      });
    }
    const group = map.get(r.topicId)!;
    group.rounds.push(r);
    if (r.score > group.bestScore) group.bestScore = r.score;
  }
  // 최근 제출 기준 내림차순
  return [...map.values()].reverse();
}

function TopicGroup({ group, bestRoundId }: { group: TopicGroup; bestRoundId: string | null }) {
  const [showTC, setShowTC] = useState(false);
  const [showRounds, setShowRounds] = useState(true);

  // 테스트케이스는 가장 최근 라운드에서 가져옴
  const testCases = group.rounds[group.rounds.length - 1]?.testCases ?? [];

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* 주제 헤더 */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{group.topicTitle}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{group.topicDescription}</p>
            <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono">
              출력: {group.topicOutputFormat}
            </span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">최고 점수</p>
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {group.bestScore.toFixed(4)}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{group.rounds.length}회 시도</p>
          </div>
        </div>

        {/* TC 토글 */}
        {testCases.length > 0 && (
          <button
            onClick={() => setShowTC((v) => !v)}
            className="mt-3 text-xs text-blue-500 dark:text-blue-400 hover:underline"
          >
            {showTC ? "테스트케이스 숨기기" : `테스트케이스 보기 (${testCases.length}개)`}
          </button>
        )}
      </div>

      {/* 테스트케이스 목록 */}
      {showTC && testCases.length > 0 && (
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {testCases.map((tc, i) => (
              <div
                key={tc.id}
                className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
              >
                <span className="shrink-0 text-zinc-400 dark:text-zinc-500 font-mono w-5">
                  {i + 1}.
                </span>
                <span className="flex-1 min-w-0">{tc.input}</span>
                <code className="shrink-0 font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                  {tc.expectedOutput}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 라운드 기록 */}
      <div className="px-5 py-3">
        <button
          onClick={() => setShowRounds((v) => !v)}
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 mb-2"
        >
          {showRounds ? "제출 기록 접기" : "제출 기록 펼치기"}
        </button>

        {showRounds && (
          <div className="space-y-1.5">
            {[...group.rounds].reverse().map((round) => {
              const isBest = bestRoundId === round.id;
              return (
                <div
                  key={round.id}
                  className={`rounded-lg px-3 py-2 ${
                    isBest
                      ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                      : "bg-zinc-50 dark:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                        #{round.round}
                      </span>
                      {isBest && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 font-semibold">
                          최고점
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-right text-xs shrink-0">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {round.correctCount} / {round.results.length}
                      </span>
                      <span className={round.promptLength > 1200 ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"}>
                        {round.promptLength}자
                      </span>
                      <span className={`font-bold ${isBest ? "text-yellow-600 dark:text-yellow-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {round.score.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <details className="mt-1.5">
                    <summary className="text-xs text-zinc-400 dark:text-zinc-600 cursor-pointer hover:text-zinc-500 select-none">
                      프롬프트 보기
                    </summary>
                    <pre className="mt-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap bg-white dark:bg-zinc-900 rounded p-2.5 max-h-28 overflow-y-auto">
                      {round.prompt}
                    </pre>
                  </details>

                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                    {new Date(round.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
