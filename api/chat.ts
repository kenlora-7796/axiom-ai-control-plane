import type { IncomingMessage, ServerResponse } from "node:http";

type ApiRequest = IncomingMessage & { body?: unknown };

export default async function handler(
  req: ApiRequest,
  res: ServerResponse
) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // Public deployments remain in demonstration mode.
  if (process.env.NEBIUS_LIVE_ENABLED !== "true") {
    res.statusCode = 403;
    res.end(JSON.stringify({
      error: "Live inference is disabled. Local demo mode is available."
    }));
    return;
  }

  // Additional private access gate for live inference.
  const accessCode = process.env.AXIOM_LIVE_ACCESS_CODE;
  const suppliedCode = req.headers["x-axiom-access-code"];

  if (
    !accessCode ||
    typeof suppliedCode !== "string" ||
    suppliedCode !== accessCode
  ) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "Live access not authorized" }));
    return;
  }

  const apiKey = process.env.NEBIUS_API_KEY;
  const model = process.env.NEBIUS_MODEL_ID;

  if (!apiKey || !model) {
    res.statusCode = 503;
    res.end(JSON.stringify({
      error: "Nebius integration is not configured"
    }));
    return;
  }

  try {
    let body: unknown = req.body;

    if (body === undefined) {
      const chunks: Buffer[] = [];
      let size = 0;

      for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk);

        size += buffer.length;

        if (size > 8192) {
          res.statusCode = 413;
          res.end(JSON.stringify({ error: "Request too large" }));
          return;
        }

        chunks.push(buffer);
      }

      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }

    const prompt =
      body && typeof body === "object" && "prompt" in body
        ? (body as { prompt: unknown }).prompt
        : undefined;

    if (
      typeof prompt !== "string" ||
      !prompt.trim() ||
      prompt.length > 2000
    ) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: "Prompt must contain 1–2000 characters"
      }));
      return;
    }

    const started = performance.now();

    const response = await fetch(
      "https://api.tokenfactory.nebius.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 64,
          stream: false
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    const latencyMs = Math.round(performance.now() - started);

    if (!response.ok) {
      res.statusCode = 502;
      res.end(JSON.stringify({
        error: "Nebius inference request failed",
        upstreamStatus: response.status
      }));
      return;
    }

    const data = await response.json() as {
      choices?: Array<{
        message?: { content?: string }
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };

    res.statusCode = 200;
    res.end(JSON.stringify({
      provider: "Nebius Token Factory",
      model,
      output: data.choices?.[0]?.message?.content ?? "",
      latencyMs,
      usage: data.usage ?? null,
      mode: "LIVE_INFERENCE"
    }));
  } catch {
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: "Inference could not be completed"
    }));
  }
}
