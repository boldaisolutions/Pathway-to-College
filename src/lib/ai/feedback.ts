import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Essay feedback (INTEGRATION.md §4c). "Get full review" → send the essay body +
 * prompt, return tagged notes (Strong / Develop / Watch). Deterministic fallback
 * keeps the feature working without a key.
 */

export interface FeedbackNote {
  tag: "Strong" | "Develop" | "Watch" | "Tip";
  color: string;
  body: string;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

const TAG_COLOR: Record<string, string> = {
  Strong: "#059669",
  Develop: "#d97706",
  Watch: "#dc2626",
  Tip: "#7c3aed",
};

function reviewPrompt(prompt: string, body: string): string {
  return (
    "You are an expert U.S. college admissions essay coach. The prompt is:\n" +
    (prompt || "(no prompt given)") +
    "\n\nThe student's draft:\n" +
    (body || "(empty draft)") +
    "\n\nRespond with ONLY valid minified JSON, no markdown, exactly this shape: " +
    '{"notes":[{"tag":"Strong|Develop|Watch","body":"one specific sentence"}]} ' +
    "Give 3-4 notes: at least one Strong, one Develop, and one Watch. Be specific to THIS draft. Keep each body under 24 words."
  );
}

function fallbackNotes(body: string): FeedbackNote[] {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return [
    { tag: "Strong", color: TAG_COLOR.Strong, body: "Clear voice — keep the concrete, specific details that ground the story." },
    { tag: "Develop", color: TAG_COLOR.Develop, body: "Connect what you did back to who you are and how you think." },
    {
      tag: "Watch",
      color: TAG_COLOR.Watch,
      body:
        words < 200
          ? "Draft is short — the reflection section needs the most room."
          : "Tighten the opening so the reader reaches your point faster.",
    },
  ];
}

export async function reviewEssay(
  prompt: string,
  body: string,
): Promise<FeedbackNote[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key") return fallbackNotes(body);

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      messages: [{ role: "user", content: reviewPrompt(prompt, body) }],
    });
    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const j = JSON.parse(m[0]);
      if (j && Array.isArray(j.notes) && j.notes.length) {
        return j.notes.slice(0, 4).map((n: { tag?: string; body?: string }) => {
          const tag = (["Strong", "Develop", "Watch", "Tip"].includes(n.tag ?? "")
            ? n.tag
            : "Tip") as FeedbackNote["tag"];
          return { tag, color: TAG_COLOR[tag], body: String(n.body ?? "") };
        });
      }
    }
  } catch {
    // fall through
  }
  return fallbackNotes(body);
}
