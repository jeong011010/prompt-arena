"use client";

import { useState, useCallback } from "react";
import { Topic, TestCase, SubmitResult, ScoreBreakdown } from "@/types";
import { useApiKey } from "@/lib/ApiKeyContext";


export type PracticePhase =
  | "idle"
  | "generating_topic"
  | "generating_cases"
  | "ready"
  | "grading"
  | "graded";

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

export const MAX_SUBMIT = 20;
export const MAX_PROMPT_LENGTH = 1200;

export function usePractice() {
  const { activeKey, activeProvider } = useApiKey();
  const [phase, setPhase] = useState<PracticePhase>("idle");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [testCases, setTestCases] = useState<TestCase[] | null>(null);
  const [prompt, setPrompt] = useState("");
  const [submitCount, setSubmitCount] = useState(0);
  const [latestResult, setLatestResult] = useState<GradeResult | null>(null);
  const [bestResult, setBestResult] = useState<GradeResult | null>(null);
  const [sessionRounds, setSessionRounds] = useState<SessionRound[]>([]);
  const [isFinalSubmitted, setIsFinalSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerHeaders = () => ({
    ...(activeKey ? { "x-openai-key": activeKey } : {}),
    "x-base-url": activeProvider.baseURL,
    "x-model": activeProvider.model,
  });

  const generateTopic = useCallback(async () => {
    setPhase("generating_topic");
    setError(null);
    setTestCases(null);
    setPrompt("");
    setSubmitCount(0);
    setLatestResult(null);
    setBestResult(null);
    setSessionRounds([]);
    setIsFinalSubmitted(false);

    try {
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: providerHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTopic(data);
      setPhase("generating_cases");
      await generateTestCases(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "주제 생성 실패");
      setPhase("idle");
    }
  }, []);

  const generateTestCases = useCallback(async (t: Topic) => {
    try {
      const res = await fetch("/api/testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...providerHeaders() },
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

  const submitPrompt = useCallback(
    async (): Promise<GradeResult | null> => {
      if (!testCases || submitCount >= MAX_SUBMIT) return null;
      setPhase("grading");
      setError(null);

      try {
        const res = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...providerHeaders() },
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

  const resetSession = useCallback(() => {
    setPhase("idle");
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

  return {
    phase,
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
    submitPrompt,
    finalSubmit,
    resetSession,
  };
}
