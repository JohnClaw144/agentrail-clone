const REPLICATE_URL = "https://api.replicate.com/v1/models/google/gemini-2.5-flash/predictions";

interface SummaryInput {
  goal: string;
  screenshotUrl?: string | null;
  resultJson: Record<string, unknown>;
}

interface SummaryResult {
  text: string;
  model: string;
}

export async function summarizeExecution(
  input: SummaryInput
): Promise<SummaryResult | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return null;
  }

  const prompt = `You are a compliance assistant summarizing AI agent actions.
Goal: ${input.goal}
Result JSON: ${JSON.stringify(input.resultJson)}
Provide a concise 2-3 sentence summary describing what the agent saw and extracted.`;

  const body = {
    input: {
      top_p: 0.95,
      temperature: 0.8,
      max_output_tokens: 2048,
      dynamic_thinking: false,
      prompt,
      images: input.screenshotUrl
        ? [
            {
              value: input.screenshotUrl,
            },
          ]
        : [],
      videos: [],
    },
  };

  try {
    const res = await fetch(REPLICATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Replicate summary failed:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const text = extractTextFromPrediction(data);
    if (!text) {
      return null;
    }

    return { text, model: data.model ?? "google/gemini-2.5-flash" };
  } catch (error) {
    console.error("Replicate summary error:", error);
    return null;
  }
}

function extractTextFromPrediction(prediction: unknown): string | null {
  if (!isRecord(prediction)) return null;
  const output = prediction.output;
  if (!output) return null;

  const first = Array.isArray(output) ? output[0] : output;
  const fromContent = extractFromContent(first);
  if (fromContent) return fromContent;

  if (isRecord(output) && typeof output.text === "string") {
    return output.text.trim();
  }

  if (Array.isArray(output) && isRecord(output[0]) && typeof output[0].text === "string") {
    return output[0].text.trim();
  }

  return null;
}

function extractFromContent(value: unknown): string | null {
  if (!isRecord(value)) return null;
  const content = value.content;
  if (!Array.isArray(content) || content.length === 0) return null;
  const block = content[0];
  if (isRecord(block)) {
    if (typeof block.text === "string") return block.text.trim();
    if (Array.isArray(block.content) && block.content.length > 0) {
      const nested = block.content[0];
      if (isRecord(nested) && typeof nested.text === "string") {
        return nested.text.trim();
      }
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
