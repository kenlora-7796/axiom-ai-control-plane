import type { AxiomTelemetryRecord } from "./TelemetryTypes.js";
import { calculateUsageMetrics } from "./UsageMetrics.js";
import { assessEfficiency } from "./EfficiencyAnalyzer.js";

export interface TelemetryDashboardSummary {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageLatencyMs: number;
  totalTokens: number;
  averageTokensPerSecond: number;
  efficiencyScore: number;
  efficiencyRating: string;
}

export function buildTelemetrySummary(
  records: AxiomTelemetryRecord[]
): TelemetryDashboardSummary {
  const totalExecutions = records.length;
  const successfulExecutions = records.filter(
    (record) => record.success
  ).length;
  const failedExecutions = totalExecutions - successfulExecutions;

  const averageLatencyMs =
    totalExecutions > 0
      ? records.reduce((sum, record) => sum + record.latencyMs, 0) /
        totalExecutions
      : 0;

  const totalTokens = records.reduce(
    (sum, record) => sum + (record.totalTokens ?? 0),
    0
  );

  const successfulWithUsage = records.filter(
    (record) =>
      record.success &&
      record.completionTokens !== undefined &&
      record.totalTokens !== undefined
  );

  const throughputValues = successfulWithUsage.map((record) =>
    calculateUsageMetrics(
      record.promptTokens ?? 0,
      record.completionTokens ?? 0,
      record.totalTokens ?? 0,
      record.latencyMs
    ).tokensPerSecond
  );

  const averageTokensPerSecond =
    throughputValues.length > 0
      ? throughputValues.reduce((sum, value) => sum + value, 0) /
        throughputValues.length
      : 0;

  const efficiency = assessEfficiency(
    averageLatencyMs,
    averageTokensPerSecond
  );

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate:
      totalExecutions > 0
        ? successfulExecutions / totalExecutions
        : 0,
    averageLatencyMs,
    totalTokens,
    averageTokensPerSecond,
    efficiencyScore: efficiency.score,
    efficiencyRating: efficiency.rating,
  };
}
