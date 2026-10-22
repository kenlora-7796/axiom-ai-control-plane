import type { EfficiencyAssessment } from "../telemetry/EfficiencyAnalyzer.js";

export type OptimizationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface OptimizationRecommendation {
  priority: OptimizationPriority;
  action: string;
  reason: string;
}

export function generateOptimizations(
  efficiency: EfficiencyAssessment
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  if (efficiency.latencyMs > 60000) {
    recommendations.push({
      priority: "HIGH",
      action: "Evaluate a lower-latency NVIDIA model or deployment configuration.",
      reason: "Observed execution latency exceeded 60 seconds.",
    });
  } else if (efficiency.latencyMs > 30000) {
    recommendations.push({
      priority: "MEDIUM",
      action: "Compare NVIDIA model configurations for lower latency.",
      reason: "Observed execution latency exceeded 30 seconds.",
    });
  }

  if (efficiency.tokensPerSecond < 2) {
    recommendations.push({
      priority: "HIGH",
      action: "Benchmark an alternative NVIDIA inference configuration.",
      reason: "Observed generation throughput was below 2 tokens per second.",
    });
  } else if (efficiency.tokensPerSecond < 5) {
    recommendations.push({
      priority: "MEDIUM",
      action: "Evaluate throughput optimization options.",
      reason: "Observed generation throughput was below 5 tokens per second.",
    });
  }

  if (efficiency.score >= 85) {
    recommendations.push({
      priority: "LOW",
      action: "Keep the current NVIDIA configuration.",
      reason: "Current execution efficiency is within target thresholds.",
    });
  }

  return recommendations;
}
