export interface UsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  completionRatio: number;
  tokensPerSecond: number;
}

export function calculateUsageMetrics(
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  latencyMs: number
): UsageMetrics {
  const seconds = latencyMs / 1000;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    completionRatio:
      totalTokens > 0 ? completionTokens / totalTokens : 0,
    tokensPerSecond:
      seconds > 0 ? completionTokens / seconds : 0,
  };
}
