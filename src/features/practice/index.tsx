"use client";

import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useHistory } from "@/features/history/hooks/useHistory";
import { useCallback, useState } from "react";
import { FinalResult } from "./components/FinalResult";
import { GradeResult } from "./components/GradeResult";
import { PromptEditor } from "./components/PromptEditor";
import { SessionHistory } from "./components/SessionHistory";
import { TopicCard } from "./components/TopicCard";
import { usePractice } from "./hooks/usePractice";

export function PracticeView() {
  const {
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
  } = usePractice();

  const { saveRound } = useHistory();
  const [showNewTopicConfirm, setShowNewTopicConfirm] = useState(false);

  const isInProgress =
    phase === "ready" || phase === "grading" || phase === "graded";

  const handleGenerateTopic = useCallback(() => {
    if (isInProgress) {
      setShowNewTopicConfirm(true);
    } else {
      generateTopic();
    }
  }, [isInProgress, generateTopic]);

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
    phase === "selecting_topic" ||
    phase === "generating_cases" ||
    phase === "grading";

  const canSubmit = (phase === "ready" || phase === "graded") && !isFinalSubmitted;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* 메인 영역 */}
        <div className="flex-1 min-w-0 space-y-4">
          <TopicCard
            topic={topic}
            topics={topics}
            testCases={testCases}
            phase={phase}
            onGenerate={handleGenerateTopic}
            onSelectTopic={selectTopic}
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
          <div className="w-full md:w-56 md:shrink-0">
            <SessionHistory
              rounds={sessionRounds}
              totalCases={testCases?.length ?? 0}
              onFinalSubmit={finalSubmit}
              isFinalSubmitted={isFinalSubmitted}
            />
          </div>
        )}
      </div>

      {showNewTopicConfirm && (
        <ConfirmModal
          title="새 주제를 생성할까요?"
          message="이미 오늘 횟수 1회가 차감되었으며, 진행 중인 라운드가 초기화됩니다. 계속하시겠어요?"
          confirmLabel="새 주제 생성"
          onConfirm={() => {
            setShowNewTopicConfirm(false);
            generateTopic();
          }}
          onCancel={() => setShowNewTopicConfirm(false)}
        />
      )}
    </>
  );
}
