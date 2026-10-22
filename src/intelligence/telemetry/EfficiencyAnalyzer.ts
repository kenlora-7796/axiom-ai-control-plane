export type EfficiencyRating = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export interface EfficiencyAssessment {
  score: number;
  rating: EfficiencyRating;
  latencyMs: number;
  tokensPerSecond: number;
  reasons: string[];
}

export function assessEfficiency(
  latencyMs: number,
  tokensPerSecond: number
): EfficiencyAssessment {
  let score = 100;
  const reasons: string[] = [];

  if (latencyMs > 60000) {
    score -= 40;
    reasons.push("Execution latency exceeded 60 seconds.");
  } else if (latencyMs > 30000) {
    score -= 25;
    reasons.push("Execution latency exceeded 30 seconds.");
  } else if (latencyMs > 10000) {
    score -= 10;
    reasons.push("Execution latency exceeded 10 seconds.");
  }

  if (tokensPerSecond < 2) {
    score -= 30;
    reasons.push("Generation throughput was below 2 tokens per second.");
  } else if (tokensPerSecond < 5) {
    score -= 15;
    reasons.push("Generation throughput was below 5 tokens per second.");
  }

  const boundedScore = Math.max(0, Math.min(score, 100));

  let rating: EfficiencyRating = "POOR";

  if (boundedScore >= 85) {
    rating = "EXCELLENT";
  } else if (boundedScore >= 70) {
    rating = "GOOD";
  } else if (boundedScore >= 50) {
    rating = "FAIR";
  }

  return {
    score: boundedScore,
    rating,
    latencyMs,
    tokensPerSecond,
    reasons:
      reasons.length > 0
        ? reasons
        : ["Execution performance is within target thresholds."],
  };
}
