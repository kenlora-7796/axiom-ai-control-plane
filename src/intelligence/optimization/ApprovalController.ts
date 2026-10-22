import type { OptimizationProposal } from "./RecommendationEngine.js";

export type ApprovalAction = "APPROVE" | "REJECT";

export interface ApprovalResult {
  action: ApprovalAction;
  approved: boolean;
  executed: boolean;
  configuration: string;
  message: string;
}

export function handleOptimizationApproval(
  proposal: OptimizationProposal,
  action: ApprovalAction
): ApprovalResult {
  if (action === "REJECT") {
    return {
      action,
      approved: false,
      executed: false,
      configuration: proposal.recommendedConfiguration,
      message: "Optimization proposal rejected. No configuration change executed.",
    };
  }

  if (proposal.decision !== "PROPOSE_CHANGE") {
    return {
      action,
      approved: false,
      executed: false,
      configuration: proposal.recommendedConfiguration,
      message: "No configuration change is currently proposed.",
    };
  }

  return {
    action,
    approved: true,
    executed: true,
    configuration: proposal.recommendedConfiguration,
    message: "Optimization approved for execution.",
  };
}
