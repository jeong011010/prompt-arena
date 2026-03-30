"use client";

import { useState, useEffect, useCallback } from "react";
import { RoundHistory } from "@/types";

const STORAGE_KEY = "prompt-arena-history";

export function useHistory() {
  const [history, setHistory] = useState<RoundHistory[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const saveRound = useCallback((round: Omit<RoundHistory, "id" | "round">) => {
    setHistory((prev) => {
      const next: RoundHistory = {
        ...round,
        id: crypto.randomUUID(),
        round: prev.length + 1,
      };
      const updated = [...prev, next];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  const bestRound = history.reduce<RoundHistory | null>(
    (best, r) => (!best || r.score > best.score ? r : best),
    null
  );

  return { history, saveRound, clearHistory, bestRound };
}
