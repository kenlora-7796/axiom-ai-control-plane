import { getNvidiaConfig } from "./NvidiaConfig.js";
import type {
  NvidiaChatRequest,
  NvidiaChatResponse,
} from "./NvidiaTypes.js";

export class NvidiaClient {
  async chat(request: NvidiaChatRequest): Promise<NvidiaChatResponse> {
    const config = getNvidiaConfig();

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `NVIDIA API request failed (${response.status}): ${errorBody}`
      );
    }

    return (await response.json()) as NvidiaChatResponse;
  }
}
