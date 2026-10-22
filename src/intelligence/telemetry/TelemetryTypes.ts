export interface AxiomTelemetryRecord {
  timestamp: string;
  provider: "NVIDIA";
  model: string;
  taskType: string;
  complexity: string;
  privacy: string;
  restricted: boolean;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  success: boolean;
  error?: string;
}
