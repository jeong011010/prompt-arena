"use client";

import { useState } from "react";
import { Topic, TestCase } from "@/types";

interface Props {
  topic: Topic | null;
  topics: Topic[];
  testCases: TestCase[] | null;
  phase: string;
  isUsageExhausted: boolean;
  onGenerate: () => void;
  onSelectTopic: (topic: Topic) => void;
}

export function TopicCard({ topic, topics, testCases, phase, isUsageExhausted, onGenerate, onSelectTopic }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isLoadingTopic = phase === "generating_topic";
  const isLoadingCases = phase === "generating_cases";
  const isSelecting = phase === "selecting_topic";

  if (isLoadingTopic) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400 dark:text-zinc-500 animate-pulse">주제 생성 중…</p>
      </div>
    );
  }

  if (isSelecting) {
    const selected = topics.find((t) => t.id === selectedId) ?? null;
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          주제 선택
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topics.map((t) => {
            const isActive = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`text-left rounded-lg border transition-colors p-3 space-y-1.5 ${
                  isActive
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800 ring-1 ring-zinc-900 dark:ring-zinc-100"
                    : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500"
                }`}
              >
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{t.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t.description}
                </p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono">
                  {t.outputFormat}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              if (selected) {
                setSelectedId(null);
                onSelectTopic(selected);
              }
            }}
            disabled={!selected}
            className="text-sm px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
          >
            이 주제로 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          주제
        </h2>
        <button
          onClick={onGenerate}
          disabled={isLoadingCases || isUsageExhausted}
          className="text-sm px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
          title={isUsageExhausted ? "오늘 사용 횟수를 모두 소진했습니다" : undefined}
        >
          {isLoadingCases ? "케이스 생성 중…" : topic ? "새 주제 생성" : "주제 생성"}
        </button>
      </div>

      {!topic ? (
        <p className="text-zinc-400 dark:text-zinc-600 text-sm">
          주제 생성 버튼을 눌러 시작하세요.
        </p>
      ) : (
        <div className="space-y-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{topic.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{topic.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
              출력: {topic.outputFormat}
            </span>
            {testCases && (
              <span className="text-xs px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                테스트케이스 {testCases.length}개 준비됨
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
