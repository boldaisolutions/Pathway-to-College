import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Activity } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

export interface ExperienceContext {
  grade: number;
  major: string;
  interests: string[];
}

function hasKey(): string | null {
  const k = process.env.ANTHROPIC_API_KEY;
  return k && k !== "your-anthropic-api-key" ? k : null;
}

async function ask(prompt: string, maxTokens: number): Promise<string | null> {
  const apiKey = hasKey();
  if (!apiKey) return null;
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    return message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  } catch {
    return null;
  }
}

function truncate(s: string, n = 150): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/[,;:\s]+\S*$/, "").trim() + "…";
}

/** Deterministic Common App-style line from the fields we have. */
function fallbackDescription(a: Activity): string {
  const lead = a.role && !/member|participant/i.test(a.role) ? a.role : "";
  const parts = [lead, a.name].filter(Boolean).join(": ");
  const extra = [a.description, a.hours ? `~${a.hours}` : ""].filter(Boolean).join("; ");
  return truncate([parts, extra].filter(Boolean).join(" — "));
}

function polishPrompt(a: Activity, c: ExperienceContext): string {
  return [
    "Rewrite this high school student's extracurricular into ONE strong Common App activity description.",
    "",
    "ACTIVITY (use ONLY these facts — invent nothing, add no numbers that are not given):",
    `- Name: ${a.name}`,
    `- Role/position: ${a.role || "not specified"}`,
    `- Category: ${a.category || "not specified"}`,
    `- Time commitment: ${a.hours || "not specified"}`,
    `- What the student did: ${a.description || "not specified"}`,
    "",
    "RULES:",
    "- Maximum 150 characters. Hard limit.",
    "- Start with a strong action verb (Led, Founded, Organized, Built, Taught, Coordinated, Mentored…).",
    "- Only quantify impact if a number is actually given above. Do NOT invent figures, awards, or outcomes.",
    "- No first-person pronouns. No period is required. Plain, factual, specific.",
    "- Do not exaggerate a role: a member is not a leader.",
    "",
    "Return ONLY the description line — no preamble, no quotes.",
  ].join("\n");
}

export async function polishActivityDescription(a: Activity, c: ExperienceContext): Promise<string> {
  const out = await ask(polishPrompt(a, c), 120);
  if (!out) return fallbackDescription(a);
  return truncate(out.replace(/^["']|["']$/g, ""));
}

function fallbackIdeas(a: Activity): string[] {
  const label = a.name || "this activity";
  return [
    `Quantify your impact in ${label}: add real numbers — people reached, hours, funds raised, or results.`,
    a.role && /lead|captain|president|founder|director/i.test(a.role)
      ? `Document a concrete outcome you drove as ${a.role} (a project shipped, an event run, a metric moved).`
      : `Step into a leadership slice — run one project, mentor a newer member, or own a recurring task.`,
    `Expand the reach: partner with another club, school, or a community organization to grow ${label}.`,
  ];
}

function ideasPrompt(a: Activity, c: ExperienceContext): string {
  return [
    "Give a high school student 3 concrete, realistic ways to strengthen this extracurricular so it becomes more compelling on a college application.",
    "",
    `Student: grade ${c.grade}, interested in ${c.major || c.interests.join(", ") || "various fields"}.`,
    "ACTIVITY:",
    `- Name: ${a.name}`,
    `- Role: ${a.role || "not specified"}`,
    `- Category: ${a.category || "not specified"}`,
    `- What they do: ${a.description || "not specified"}`,
    "",
    "RULES:",
    "- Exactly 3 suggestions, each one sentence, each starting with an action verb.",
    "- Concrete and doable for a high schooler this year — no vague advice.",
    "- Focus on adding leadership, measurable impact, or wider reach.",
    "- Return each suggestion on its own line with no numbering or bullets.",
  ].join("\n");
}

export async function levelUpIdeas(a: Activity, c: ExperienceContext): Promise<string[]> {
  const out = await ask(ideasPrompt(a, c), 300);
  if (!out) return fallbackIdeas(a);
  const lines = out
    .split("\n")
    .map((l) => l.replace(/^[\d.)\-•\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
  return lines.length ? lines : fallbackIdeas(a);
}
