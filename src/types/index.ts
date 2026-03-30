export interface Topic {
  id: string;
  title: string;
  description: string;
  outputFormat: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface SubmitResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
}

export interface RoundHistory {
  id: string;
  round: number;
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  topicOutputFormat: string;
  testCases: TestCase[];
  prompt: string;
  score: number;
  correctCount: number;
  promptLength: number;
  results: SubmitResult[];
  createdAt: string;
}

export interface ScoreBreakdown {
  accuracy: number;
  lengthScore: number;
  total: number;
}

/** Score = 0.9 × (정답수 / 전체케이스수) + 0.1 × (1 - L / 1200) */
export function calculateScore(correctCount: number, totalCount: number, promptLength: number): ScoreBreakdown {
  const accuracy = correctCount / totalCount;
  const L = Math.min(promptLength, 1200);
  const lengthScore = 1 - L / 1200;

  const total = 0.9 * accuracy + 0.1 * lengthScore;

  return {
    accuracy: parseFloat((0.9 * accuracy).toFixed(4)),
    lengthScore: parseFloat((0.1 * lengthScore).toFixed(4)),
    total: parseFloat(total.toFixed(4)),
  };
}
