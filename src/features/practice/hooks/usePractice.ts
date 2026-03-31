"use client";

import { useState, useCallback, useEffect } from "react";
import { Topic, TestCase, SubmitResult, ScoreBreakdown } from "@/types";
import { useUsage } from "@/lib/UsageContext";

export type PracticePhase =
  | "idle"
  | "generating_topic"
  | "selecting_topic"
  | "generating_cases"
  | "ready"
  | "grading"
  | "graded";

// 새로고침 후 복원 가능한 phase만 허용
const RESTORABLE_PHASES: PracticePhase[] = ["selecting_topic", "ready", "graded"];

interface GradeResult {
  results: SubmitResult[];
  score: ScoreBreakdown;
}

export interface SessionRound {
  round: number;
  score: ScoreBreakdown;
  correctCount: number;
  promptLength: number;
  prompt: string;
}

interface PersistedSession {
  phase: PracticePhase;
  topics: Topic[];
  topic: Topic | null;
  testCases: TestCase[] | null;
  prompt: string;
  submitCount: number;
  sessionRounds: SessionRound[];
  isFinalSubmitted: boolean;
  bestResult: GradeResult | null;
  latestResult: GradeResult | null;
}

const STORAGE_KEY = "prompt-arena-session";

function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s: PersistedSession = JSON.parse(raw);
    if (!RESTORABLE_PHASES.includes(s.phase)) return null;
    return s;
  } catch {
    return null;
  }
}

function saveSession(s: PersistedSession) {
  try {
    if (RESTORABLE_PHASES.includes(s.phase)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export const MAX_SUBMIT = 20;
export const MAX_PROMPT_LENGTH = 1200;

export function usePractice() {
  const { refresh: refreshUsage } = useUsage();

  const [phase, setPhase] = useState<PracticePhase>("idle");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [prompt, setPrompt] = useState("");
  const [submitCount, setSubmitCount] = useState(0);
  const [latestResult, setLatestResult] = useState<GradeResult | null>(null);
  const [bestResult, setBestResult] = useState<GradeResult | null>(null);
  const [sessionRounds, setSessionRounds] = useState<SessionRound[]>([]);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트 마운트 후 localStorage에서 복원
  useEffect(() => {
    const s = loadSession();
    if (s) {
      setPhase(s.phase);
      setTopics(s.topics);
      setTopic(s.topic);
      setTestCases(s.testCases);
      setPrompt(s.prompt);
      setSubmitCount(s.submitCount);
      setSessionRounds(s.sessionRounds);
      setIsFinalSubmitted(s.isFinalSubmitted);
      setBestResult(s.bestResult);
      setLatestResult(s.latestResult);
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 상태 변경 시 localStorage 저장 (복원 완료 후에만)
  useEffect(() => {
    if (!hydrated) return;
    saveSession({
      phase,
      topics,
      topic,
      testCases,
      prompt,
      submitCount,
      sessionRounds,
      isFinalSubmitted,
      bestResult,
      latestResult,
    });
  }, [hydrated, phase, topics, topic, testCases, prompt, submitCount, sessionRounds, isFinalSubmitted, bestResult, latestResult]);

  const resetSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("idle");
    setTopics([]);
    setTopic(null);
    setTestCases(null);
    setPrompt("");
    setSubmitCount(0);
    setLatestResult(null);
    setBestResult(null);
    setSessionRounds([]);
    setIsFinalSubmitted(false);
    setError(null);
  }, []);

  const generateTestCases = useCallback(async (t: Topic) => {
    try {
      const res = await fetch("/api/testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestCases(data);
      setPhase("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "테스트케이스 생성 실패");
      setPhase("idle");
    }
  }, []);

  const generateTopic = useCallback(async () => {
    setError(null);
    setPhase("generating_topic");
    setTopics([]);
    setTopic(null);
    setTestCases(null);
    setPrompt("");
    setSubmitCount(0);
    setLatestResult(null);
    setBestResult(null);
    setSessionRounds([]);
    setIsFinalSubmitted(false);

    try {
      const res = await fetch("/api/topic", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTopics(data);
      setPhase("selecting_topic");
    } catch (e) {
      setError(e instanceof Error ? e.message : "주제 생성 실패");
      setPhase("idle");
    }
  }, []);

  const selectTopic = useCallback(
    async (t: Topic) => {
      setError(null);

      const usageRes = await fetch("/api/usage", { method: "POST" });
      if (usageRes.status === 401) {
        setError("로그인이 필요합니다");
        return;
      }
      if (usageRes.status === 403) {
        const data = await usageRes.json();
        setError(data.error ?? "오늘 사용 횟수를 모두 소진했습니다 (10/10)");
        return;
      }

      refreshUsage();
      setTopic(t);
      setPhase("generating_cases");
      await generateTestCases(t);
    },
    [generateTestCases, refreshUsage]
  );

  const submitPrompt = useCallback(
    async (): Promise<GradeResult | null> => {
      if (!testCases || submitCount >= MAX_SUBMIT) return null;
      setPhase("grading");
      setError(null);

      try {
        const res = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt: prompt, testCases }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const result: GradeResult = data;
        const newCount = submitCount + 1;
        setSubmitCount(newCount);
        setLatestResult(result);
        setBestResult((prev) =>
          !prev || result.score.total > prev.score.total ? result : prev
        );
        setSessionRounds((prev) => [
          ...prev,
          {
            round: newCount,
            score: result.score,
            correctCount: result.results.filter((r) => r.passed).length,
            promptLength: prompt.length,
            prompt,
          },
        ]);
        setPhase("graded");
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "채점 실패");
        setPhase("ready");
        return null;
      }
    },
    [testCases, submitCount, prompt]
  );

  const finalSubmit = useCallback(() => {
    setIsFinalSubmitted(true);
  }, []);

  return {
    phase,
    topics,
    topic,
    testCases,
    prompt,
    setPrompt,
    submitCount,
    latestResult,
    bestResult,
    sessionRounds,
    isFinalSubmitted,
    error,
    generateTopic,
    selectTopic,
    submitPrompt,
    finalSubmit,
    resetSession,
  };
}
