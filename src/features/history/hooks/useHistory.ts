"use client";

import { useState, useEffect, useCallback } from "react";
import { RoundHistory } from "@/types";

// Supabase row → RoundHistory 변환
function rowToRoundHistory(row: Record<string, unknown>, index: number): RoundHistory {
  return {
    id: row.id as string,
    round: (row.round as number) ?? index + 1,
    topicId: row.topic_id as string,
    topicTitle: row.topic_title as string,
    topicDescription: row.topic_description as string,
    topicOutputFormat: row.topic_output_format as string,
    testCases: (row.test_cases as RoundHistory["testCases"]) ?? [],
    prompt: row.prompt as string,
    score: row.score as number,
    correctCount: row.correct_count as number,
    promptLength: row.prompt_length as number,
    results: (row.results as RoundHistory["results"]) ?? [],
    createdAt: row.created_at as string,
  };
}

export function useHistory() {
  const [history, setHistory] = useState<RoundHistory[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((rows: Record<string, unknown>[]) => {
        if (Array.isArray(rows)) {
          setHistory(rows.map(rowToRoundHistory));
        }
      })
      .catch(() => {});
  }, []);

  const saveRound = useCallback(async (round: Omit<RoundHistory, "id" | "round">) => {
    const newRound: RoundHistory = {
      ...round,
      id: crypto.randomUUID(),
      round: 0,
    };
    // 낙관적 업데이트
    setHistory((prev) => {
      const withRound = { ...newRound, round: prev.length + 1 };
      return [...prev, withRound];
    });

    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...round, round: 0 }),
    }).catch(() => {});
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const bestRound = history.reduce<RoundHistory | null>(
    (best, r) => (!best || r.score > best.score ? r : best),
    null
  );

  return { history, saveRound, clearHistory, bestRound };
}
