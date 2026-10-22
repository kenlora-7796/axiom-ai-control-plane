export interface ConfigurationMetrics {
  name: string;
  model: string;
  latencyMs: number;
  tokensPerSecond: number;
  efficiencyScore: number;
}

export interface ConfigurationComparison {
  current: ConfigurationMetrics;
  candidate: ConfigurationMetrics;
  recommended: string;
  latencyImprovementPercent: number;
  throughputImprovementPercent: number;
  efficiencyImprovement: number;
}

export function compareConfigurations(
  current: ConfigurationMetrics,
  candidate: ConfigurationMetrics
): ConfigurationComparison {
  const latencyImprovementPercent =
    current.latencyMs > 0
      ? ((current.latencyMs - candidate.latencyMs) / current.latencyMs) * 100
      : 0;

  const throughputImprovementPercent =
    current.tokensPerSecond > 0
      ? ((candidate.tokensPerSecond - current.tokensPerSecond) /
          current.tokensPerSecond) *
        100
      : 0;

  const efficiencyImprovement =
    candidate.efficiencyScore - current.efficiencyScore;

  const candidateWins =
    candidate.efficiencyScore > current.efficiencyScore &&
    candidate.latencyMs < current.latencyMs;

  return {
    current,
    candidate,
    recommended: candidateWins ? candidate.name : current.name,
    latencyImprovementPercent,
    throughputImprovementPercent,
    efficiencyImprovement,
  };
}
