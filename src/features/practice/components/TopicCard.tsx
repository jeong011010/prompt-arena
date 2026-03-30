"use client";

import { Topic, TestCase } from "@/types";

interface Props {
  topic: Topic | null;
  testCases: TestCase[] | null;
  phase: string;
  onGenerate: () => void;
}

export function TopicCard({ topic, testCases, phase, onGenerate }: Props) {
  const isLoading = phase === "generating_topic" || phase === "generating_cases";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          주제
        </h2>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="text-sm px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isLoading
            ? phase === "generating_topic"
              ? "주제 생성 중…"
              : "케이스 생성 중…"
            : topic
            ? "새 주제 생성"
            : "주제 생성"}
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
