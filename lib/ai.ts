export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key || key === "your-gemini-api-key") return null;
  return key;
}

export function isGeminiConfigured(): boolean {
  return getApiKey() !== null;
}

function buildPrompt(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_GEMINI_API_KEY. Copy .env.example to .env and add your Gemini API key.",
    );
  }

  const prompt = buildPrompt(messages);
  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

/**
 * Streams a Gemini response to `onChunk`. Uses the streamGenerateContent endpoint
 * when available; falls back to chunked delivery of a full generateContent result.
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    const demo =
      "Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file to enable live Gemini responses. " +
      "Until then, this is a local demo reply so you can build and theme the AI playground.";
    await simulateStream(demo, onChunk, signal);
    return demo;
  }

  try {
    const streamed = await streamFromGemini(messages, onChunk, signal, apiKey);
    if (streamed) return streamed;
  } catch {
    // Fall through to non-streaming generateContent
  }

  const full = await callGemini(messages);
  if (signal?.aborted) throw new Error("Request aborted");
  await simulateStream(full, onChunk, signal);
  return full;
}

async function streamFromGemini(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal: AbortSignal | undefined,
  apiKey: string,
): Promise<string | null> {
  const prompt = buildPrompt(messages);
  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    return null;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assembled = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const json = JSON.parse(payload) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const piece = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (piece) {
          assembled += piece;
          onChunk(assembled);
        }
      } catch {
        // Ignore malformed SSE chunks
      }
    }
  }

  return assembled || null;
}

async function simulateStream(
  text: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const words = text.split(/(\s+)/);
  let current = "";

  for (const word of words) {
    if (signal?.aborted) throw new Error("Request aborted");
    current += word;
    onChunk(current);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
