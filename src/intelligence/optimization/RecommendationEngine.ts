import type { ConfigurationComparison } from "./ConfigurationComparator.js";

export type RecommendationDecision =
  | "KEEP_CURRENT"
  | "PROPOSE_CHANGE";

export interface OptimizationProposal {
  decision: RecommendationDecision;
  recommendedConfiguration: string;
  confidence: number;
  summary: string;
  requiresHumanApproval: boolean;
}

export function createOptimizationProposal(
  comparison: ConfigurationComparison
): OptimizationProposal {
  const candidateSelected =
    comparison.recommended === comparison.candidate.name;

  const strongImprovement =
    comparison.efficiencyImprovement >= 20 &&
    comparison.latencyImprovementPercent >= 20;

  if (candidateSelected && strongImprovement) {
    return {
      decision: "PROPOSE_CHANGE",
      recommendedConfiguration: comparison.candidate.name,
      confidence: 0.9,
      summary:
        "Candidate configuration materially improves measured efficiency and latency.",
      requiresHumanApproval: true,
    };
  }

  return {
    decision: "KEEP_CURRENT",
    recommendedConfiguration: comparison.current.name,
    confidence: 0.75,
    summary:
      "Available evidence does not justify changing the current configuration.",
    requiresHumanApproval: false,
  };
}
