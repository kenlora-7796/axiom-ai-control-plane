import type { AxiomTaskType } from "./TaskClassifier.js";

export type ComplexityLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ComplexityAssessment {
  level: ComplexityLevel;
  score: number;
  reasons: string[];
}

export function assessComplexity(
  input: string,
  taskType: AxiomTaskType
): ComplexityAssessment {
  const text = input.toLowerCase();
  let score = 1;
  const reasons: string[] = [];

  if (input.length > 500) {
    score += 2;
    reasons.push("Large task description or context.");
  } else if (input.length > 200) {
    score += 1;
    reasons.push("Moderate task description or context.");
  }

  if (taskType === "ARCHITECTURE") {
    score += 3;
    reasons.push("Architecture tasks require system-level reasoning.");
  }

  if (taskType === "REFACTOR" || taskType === "CODE_REVIEW") {
    score += 2;
    reasons.push("Task requires reasoning over existing code.");
  }

  if (
    text.includes("repository") ||
    text.includes("multiple files") ||
    text.includes("entire codebase")
  ) {
    score += 2;
    reasons.push("Task may require multi-file or repository-level context.");
  }

  if (
    text.includes("security") ||
    text.includes("production") ||
    text.includes("migration")
  ) {
    score += 2;
    reasons.push("Task has elevated engineering impact.");
  }

  const boundedScore = Math.min(score, 10);

  if (boundedScore >= 7) {
    return { level: "HIGH", score: boundedScore, reasons };
  }

  if (boundedScore >= 3) {
    return { level: "MEDIUM", score: boundedScore, reasons };
  }

  return {
    level: "LOW",
    score: boundedScore,
    reasons:
      reasons.length > 0
        ? reasons
        : ["Task appears narrow and requires limited context."],
  };
}
