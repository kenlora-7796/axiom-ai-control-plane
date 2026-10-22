export type AxiomTaskType =
  | "CODE_GENERATION"
  | "CODE_REVIEW"
  | "BUG_FIX"
  | "REFACTOR"
  | "ARCHITECTURE"
  | "DOCUMENTATION"
  | "TESTING"
  | "GENERAL";

export interface ClassifiedTask {
  type: AxiomTaskType;
  confidence: number;
  reason: string;
}

export function classifyTask(input: string): ClassifiedTask {
  const text = input.toLowerCase();

  const rules: Array<{
    type: AxiomTaskType;
    keywords: string[];
    reason: string;
  }> = [
    {
      type: "BUG_FIX",
      keywords: ["bug", "fix", "error", "broken", "exception", "crash"],
      reason: "Task contains debugging or error-resolution language.",
    },
    {
      type: "CODE_REVIEW",
      keywords: ["review", "audit", "inspect code", "code quality"],
      reason: "Task requests analysis or review of existing code.",
    },
    {
      type: "REFACTOR",
      keywords: ["refactor", "clean up", "restructure", "simplify code"],
      reason: "Task requests restructuring or improvement of existing code.",
    },
    {
      type: "ARCHITECTURE",
      keywords: ["architecture", "system design", "design system", "migration"],
      reason: "Task involves system-level design or architecture.",
    },
    {
      type: "TESTING",
      keywords: ["test", "unit test", "integration test", "coverage"],
      reason: "Task involves software testing or validation.",
    },
    {
      type: "DOCUMENTATION",
      keywords: ["document", "documentation", "readme", "explain"],
      reason: "Task involves documentation or explanation.",
    },
    {
      type: "CODE_GENERATION",
      keywords: ["create", "build", "implement", "write code", "generate"],
      reason: "Task requests creation or implementation of code.",
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return {
        type: rule.type,
        confidence: 0.85,
        reason: rule.reason,
      };
    }
  }

  return {
    type: "GENERAL",
    confidence: 0.5,
    reason: "No specialized developer-task pattern was detected.",
  };
}
