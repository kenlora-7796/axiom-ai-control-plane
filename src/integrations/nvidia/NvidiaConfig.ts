export interface NvidiaConfig {
  apiKey: string;
  baseUrl: string;
}

export function getNvidiaConfig(): NvidiaConfig {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  return {
    apiKey,
    baseUrl: process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
  };
}
