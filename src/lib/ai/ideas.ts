import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * AI idea generation (INTEGRATION.md §4a). Server-only — holds ANTHROPIC_API_KEY.
 * Used by Build my Pathway and re-runnable from the dashboard / Essay Studio.
 * Always keeps the deterministic fallback so onboarding never dead-ends.
 */

export interface IdeaInputs {
  name: string;
  grade: number;
  major: string;
  interests: string[];
  gpa: number;
  activities: string[];
  leadership: string;
  serviceHours: number;
  research: boolean;
  helpWith: string[];
}

export interface EssayIdea {
  title: string;
  angle: string;
}
export interface PassionProject {
  name: string;
  description: string;
  impact: string;
}
export interface Ideas {
  strategy: string;
  essayIdeas: EssayIdea[];
  passionProjects: PassionProject[];
}

// Model is configurable; INTEGRATION.md §1 specifies claude-haiku-4-5 for this route.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

/** The exact prompt from the prototype's `ideaPrompt()`. */
export function ideaPrompt(f: IdeaInputs): string {
  const acts = f.activities.join("; ");
  return (
    "You are an expert U.S. college admissions strategist. Profile of a grade " +
    f.grade +
    " student.\n" +
    "Name: " +
    (f.name || "Student") +
    ". Intended major: " +
    (f.major || "undecided") +
    ". Interests: " +
    (f.interests.join(", ") || "n/a") +
    ".\n" +
    "GPA: " +
    f.gpa +
    ". Activities: " +
    (acts || "few") +
    ". Leadership: " +
    f.leadership +
    ". Service hours: " +
    f.serviceHours +
    ". Research: " +
    f.research +
    ".\n" +
    "They want help with: " +
    (f.helpWith.join(", ") || "overall strategy") +
    ".\n" +
    "Respond with ONLY valid minified JSON, no markdown, exactly this shape: " +
    '{"strategy":"2-3 sentence personalized strategy","essayIdeas":[{"title":"short title","angle":"one sentence angle"}],"passionProjects":[{"name":"short name","description":"one sentence","impact":"short measurable-impact phrase"}]} ' +
    "Give exactly 3 essayIdeas and 3 passionProjects tailored to THIS student. Keep each field under 28 words."
  );
}

/** Deterministic fallback from the prototype's `fallbackIdeas()`. */
export function fallbackIdeas(f: IdeaInputs): Ideas {
  const major = f.major || "your field";
  const i0 = f.interests?.[0] || major;
  const i2 = f.interests?.slice(0, 2).join(" and ") || major;
  return {
    strategy:
      "As a grade " +
      f.grade +
      " student aiming for " +
      major +
      ", your edge is depth: pair your strongest interest with one research experience and one leadership role, then tell that story consistently across your application.",
    essayIdeas: [
      {
        title: "The spark behind " + major,
        angle:
          "A specific moment that turned a casual interest in " +
          i0 +
          " into something you pursue seriously.",
      },
      {
        title: "A problem you couldn't ignore",
        angle:
          "A real problem in your community and how you tried to solve it — and what it revealed about how you think.",
      },
      {
        title: "Where your worlds meet",
        angle:
          "Connect two interests (" +
          i2 +
          ") and what their intersection lets you notice that others miss.",
      },
    ],
    passionProjects: [
      {
        name: major + " for your community",
        description:
          "A small, real project applying " + major + " to a local need you care about.",
        impact: "a measurable benefit for a group you can reach",
      },
      {
        name: "An open build in " + i0,
        description:
          "Make something public — an app, dataset, site, or study — and share it openly.",
        impact: "real users or an audience you can point to",
      },
      {
        name: "Teach what you love",
        description: "Start a club or workshop that teaches " + i0 + " to younger students.",
        impact: "students reached and skills taught",
      },
    ],
  };
}

/**
 * Generate ideas via Anthropic, parsing minified JSON. Falls back deterministically
 * if the key is missing, the model errors, or the response can't be parsed.
 */
export async function generateIdeas(f: IdeaInputs): Promise<Ideas> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-anthropic-api-key") return fallbackIdeas(f);

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: ideaPrompt(f) }],
    });
    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const j = JSON.parse(m[0]);
      if (j && Array.isArray(j.essayIdeas) && Array.isArray(j.passionProjects)) {
        return {
          strategy: String(j.strategy ?? fallbackIdeas(f).strategy),
          essayIdeas: j.essayIdeas.slice(0, 3),
          passionProjects: j.passionProjects.slice(0, 3),
        };
      }
    }
  } catch {
    // fall through to deterministic ideas
  }
  return fallbackIdeas(f);
}
