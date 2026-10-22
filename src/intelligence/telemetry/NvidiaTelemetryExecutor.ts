import { NvidiaClient } from "../../integrations/nvidia/NvidiaClient.js";
import { routeTask } from "../routing/ModelRouter.js";
import {
  recordTelemetry,
  type AxiomTelemetryRecord,
} from "./index.js";

const client = new NvidiaClient();

export async function executeWithTelemetry(input: string) {
  const route = routeTask(input);

  if (route.restricted) {
    throw new Error(
      "Axiom blocked hosted execution because restricted routing is required."
    );
  }

  const startedAt = performance.now();

  try {
    const response = await client.chat({
      model: route.model,
      messages: [{ role: "user", content: input }],
      temperature: 0.2,
      maxTokens: 150,
    });

    const latencyMs = Math.round(performance.now() - startedAt);

    const telemetry: AxiomTelemetryRecord = {
      timestamp: new Date().toISOString(),
      provider: "NVIDIA",
      model: route.model,
      taskType: route.taskType,
      complexity: route.complexity,
      privacy: route.privacy,
      restricted: route.restricted,
      latencyMs,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
      success: true,
    };

    recordTelemetry(telemetry);

    return { response, telemetry };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startedAt);

    recordTelemetry({
      timestamp: new Date().toISOString(),
      provider: "NVIDIA",
      model: route.model,
      taskType: route.taskType,
      complexity: route.complexity,
      privacy: route.privacy,
      restricted: route.restricted,
      latencyMs,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
