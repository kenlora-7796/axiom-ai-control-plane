import { classifyTask } from "./TaskClassifier.js";
import { assessComplexity } from "./ComplexityScorer.js";
import { assessPrivacy } from "./PrivacyAnalyzer.js";

export interface RoutingDecision {
  provider: "NVIDIA";
  model: string;
  taskType: string;
  complexity: string;
  privacy: string;
  restricted: boolean;
  reason: string;
}

const NVIDIA_DEFAULT_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";

export function routeTask(input: string): RoutingDecision {
  const task = classifyTask(input);
  const complexity = assessComplexity(input, task.type);
  const privacy = assessPrivacy(input);

  if (privacy.requiresRestrictedRouting) {
    return {
      provider: "NVIDIA",
      model: NVIDIA_DEFAULT_MODEL,
      taskType: task.type,
      complexity: complexity.level,
      privacy: privacy.level,
      restricted: true,
      reason:
        "Sensitive context detected. Axiom requires restricted routing policy before execution.",
    };
  }

  if (complexity.level === "HIGH") {
    return {
      provider: "NVIDIA",
      model: NVIDIA_DEFAULT_MODEL,
      taskType: task.type,
      complexity: complexity.level,
      privacy: privacy.level,
      restricted: false,
      reason:
        "High-complexity engineering task routed to NVIDIA for advanced reasoning.",
    };
  }

  return {
    provider: "NVIDIA",
    model: NVIDIA_DEFAULT_MODEL,
    taskType: task.type,
    complexity: complexity.level,
    privacy: privacy.level,
    restricted: false,
    reason:
      "Standard developer workload routed through the verified NVIDIA inference path.",
  };
}
