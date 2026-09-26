import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Category } from "@/lib/types";

/**
 * AI Coach (INTEGRATION.md §4b). System prompt is grounded in the student's live
 * profile (score, category gaps, activities). Persists every turn to
 * coach_messages. Deterministic canned replies when no key is set.
 */

export interface CoachContext {
  name: string;
  grade: number;
  major: string;
  overall: number;
  tier: string;
  categories: Category[];
  activities: string[];
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

export function coachSystemPrompt(c: CoachContext): string {
  const gaps = [...c.categories]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((g) => `${g.short} (${g.score})`)
    .join(", ");
  const strengths = [...c.categories]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((g) => `${g.short} (${g.score})`)
    .join(", ");
  return (
    "You are Pathway Coach, an expert, warm, and practical U.S. college admissions strategist. " +
    "Give specific, encouraging, actionable advice in 2-4 short paragraphs. " +
    "Ground every answer in THIS student's real profile; suggest concrete next steps.\n\n" +
    `Student: ${c.name}, grade ${c.grade}, intended major ${c.major || "undecided"}.\n` +
    `Pathway Score: ${c.overall} (${c.tier}).\n` +
    `Biggest gaps to grow: ${gaps}.\n` +
    `Strengths: ${strengths}.\n` +
    `Activities: ${c.activities.join(", ") || "none logged yet"}.`
  );
}

/** Keyword-based fallback covering the four canned topics from the prototype. */
export function cannedReply(q: string, c: CoachContext): string {
  const l = q.toLowerCase();
  const gap = [...c.categories].sort((a, b) => a.score - b.score)[0];
  if (/research|lab|summer program/.test(l)) {
    return `Research is your highest-leverage move, ${c.name.split(" ")[0]}. Email 3–5 professors or local labs whose work touches ${c.major || "your field"} with a short, specific note about why their work interests you and how you'd help. Apply to 2–3 structured summer research programs as a backup. Even a small, real project you can describe and show results from moves your Research score meaningfully.`;
  }
  if (/score|competitive|improve|raise/.test(l)) {
    return `Your Pathway Score is ${c.overall} — ${c.tier.toLowerCase()}. The fastest way up is your lowest category right now: ${gap.short} (${gap.score}). Pick one concrete action there this month, log it, and your score will climb. Depth beats breadth: one strong, well-documented commitment outperforms five shallow ones.`;
  }
  if (/junior|11th|next year|plan/.test(l)) {
    return `For junior year, aim for three things: (1) raise course rigor with AP/Honors in ${c.major || "your intended field"}, (2) turn a membership into a real leadership role, and (3) lock in a testing plan (PSAT this fall → SAT/ACT in spring). Keep your GPA trending up — it anchors everything. Want me to draft a term-by-term roadmap?`;
  }
  if (/project|passion|build|idea/.test(l)) {
    return `Great passion projects solve a real problem you can point to. Start small: pick something in ${c.major || "your area"}, ship a first version in a few weeks, then get feedback from real users and measure the impact. Check your Passion Projects tab — I've seeded a few ideas tailored to you that you can turn into something concrete.`;
  }
  return `Here's where I'd focus, ${c.name.split(" ")[0]}: your biggest opportunity is ${gap.short} (${gap.score}). Take one concrete step there this week and log it. Ask me about landing research, raising your score, planning junior year, or starting a passion project and I'll give you a specific plan.`;
}

export async function coachReply(
  history: { role: "user" | "assistant"; content: string }[],
  context: CoachContext,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const last = history[history.length - 1]?.content ?? "";
  if (!apiKey || apiKey === "your-anthropic-api-key") return cannedReply(last, context);

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: coachSystemPrompt(context),
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return text || cannedReply(last, context);
  } catch {
    return cannedReply(last, context);
  }
}
