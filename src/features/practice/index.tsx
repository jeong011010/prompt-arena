"use client";

import { useCallback } from "react";
import { usePractice } from "./hooks/usePractice";
import { useHistory } from "@/features/history/hooks/useHistory";
import { TopicCard } from "./components/TopicCard";
import { PromptEditor } from "./components/PromptEditor";
import { GradeResult } from "./components/GradeResult";
import { SessionHistory } from "./components/SessionHistory";
import { FinalResult } from "./components/FinalResult";

export function PracticeView() {
  const {
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
  } = usePractice();

  const { saveRound } = useHistory();

  const handleSubmit = useCallback(async () => {
    if (!topic || !testCases) return;
    const result = await submitPrompt();
    if (result) {
      saveRound({
        topicId: topic.id,
        topicTitle: topic.title,
        topicDescription: topic.description,
        topicOutputFormat: topic.outputFormat,
        testCases: testCases,
        prompt,
        score: result.score.total,
        correctCount: result.results.filter((r) => r.passed).length,
        promptLength: prompt.length,
        results: result.results,
        createdAt: new Date().toISOString(),
      });
    }
  }, [submitPrompt, saveRound, topic, testCases, prompt]);

  const isLoading =
    phase === "generating_topic" ||
    phase === "generating_cases" ||
    phase === "grading";

  const canSubmit = (phase === "ready" || phase === "graded") && !isFinalSubmitted;

  return (
    <div className="flex gap-5 items-start">
      {/* 메인 영역 */}
      <div className="flex-1 min-w-0 space-y-4">
        <TopicCard
          topic={topic}
          testCases={testCases}
          phase={phase}
          onGenerate={generateTopic}
        />

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {topic && testCases && !isFinalSubmitted && (
          <PromptEditor
            prompt={prompt}
            onChange={setPrompt}
            onSubmit={handleSubmit}
            submitCount={submitCount}
            disabled={isLoading || !canSubmit}
            isGrading={phase === "grading"}
          />
        )}

        {isFinalSubmitted && bestResult && testCases ? (
          <FinalResult
            bestScore={bestResult.score}
            bestResults={bestResult.results}
            testCases={testCases}
          />
        ) : (
          latestResult && !isFinalSubmitted && (
            <GradeResult
              results={latestResult.results}
              score={latestResult.score}
              bestScore={bestResult?.score.total ?? null}
              submitCount={submitCount}
            />
          )
        )}
      </div>

      {/* 우측 세션 기록 패널 */}
      {topic && (
        <div className="w-56 shrink-0">
          <SessionHistory
            rounds={sessionRounds}
            totalCases={testCases?.length ?? 0}
            onFinalSubmit={finalSubmit}
            isFinalSubmitted={isFinalSubmitted}
          />
        </div>
      )}
    </div>
  );
}
