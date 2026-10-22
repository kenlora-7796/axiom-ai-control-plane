export interface NvidiaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface NvidiaChatRequest {
  model: string;
  messages: NvidiaChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface NvidiaChatResponse {
  id?: string;
  model?: string;
  choices: Array<{
    index: number;
    message: NvidiaChatMessage;
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}
