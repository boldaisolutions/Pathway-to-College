import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Student } from "@/lib/types";
import { buildResumeSummary } from "@/lib/resume";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

export interface ResumeContext {
  grade: number;
  major: string;
  interests: string[];
  activities: { name: string; category: string }[];
  work?: { title: string; employer: string }[];
  research: boolean;
  serviceHours: number;
  awards: number;
  gpa: number;
}

/** Prompt encoding the tone + accuracy rules (no exaggeration, no inferred
 *  expertise, no aspirational/admissions language, 2 sentences). */
function resumePrompt(c: ResumeContext): string {
  const acts = c.activities.map((a) => `${a.name} (${a.category})`).join("; ") || "none listed";
  const work =
    (c.work ?? []).map((w) => [w.title, w.employer].filter(Boolean).join(" at ")).join("; ") ||
    "none listed";
  return [
    "Write a concise resume summary for a high school student using ONLY the information provided below. Invent nothing.",
    "",
    "STUDENT PROFILE (this is all you know — do not assume anything beyond it):",
    `- Grade: ${c.grade}`,
    `- Intended field of study: ${c.major || "not specified"}`,
    `- Documented INTERESTS (these are interests, NOT expertise or experience): ${c.interests.join(", ") || "none listed"}`,
    `- Documented EXPERIENCE / activities: ${acts}`,
    `- Documented WORK EXPERIENCE (real jobs/internships): ${work}`,
    `- Has research experience: ${c.research ? "yes" : "no"}`,
    `- Community service hours: ${c.serviceHours}`,
    `- Awards / honors: ${c.awards}`,
    `- Weighted GPA: ${c.gpa}`,
    "",
    "RULES:",
    "- Keep the language natural, clear, and appropriate for a high school student. It should sound like a strong student profile, not a professional, college admissions consultant, or corporate resume writer.",
    "- Describe the student's documented interests, experience, activities, skills, and accomplishments accurately.",
    "- Do NOT exaggerate. An interest is not expertise. A goal is not experience. A planned activity is not a completed activity.",
    "- Use straightforward language. Avoid unnecessarily advanced or academic terms such as scientific inquiry, interdisciplinary, scholarly, emerging technologies, or technical expertise unless those terms are explicitly supported by the profile.",
    "- Do NOT use progressive or aspirational language such as exploring, developing, building, pursuing, deepening, or strengthening.",
    "- Do NOT use admissions language such as competitive candidate, competitiveness, college-ready, or strengthen college applications.",
    "- Do NOT combine separate interests into an expertise or experience the student has not explicitly documented. For example, an interest in robotics and an interest in regenerative medicine does NOT mean the student has biomedical engineering experience.",
    "- Focus on what the student is interested in, has experience with, and has accomplished.",
    "",
    "FORMAT: exactly 2 sentences. Follow this formula:",
    "[Student type] with interests in [documented interests]. [Documented experience] with [simple description of strengths/interests].",
    "",
    "EXAMPLE STYLE (match the tone and structure, not the content):",
    '"STEM-focused student with interests in AI, nanotechnology, regenerative medicine, and biomedical engineering. Experience with STEM projects, research, and invention, with a strong interest in problem-solving and creating innovative solutions."',
    "",
    "Return ONLY the summary text — no preamble, no quotation marks.",
  ].join("\n");
}

export async function generateResumeSummary(
  student: Student,
  context: ResumeContext,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = () =>
    buildResumeSummary(student, {
      activityCount: context.activities.length,
    });
  if (!apiKey || apiKey === "your-anthropic-api-key") return fallback();

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: "user", content: resumePrompt(context) }],
    });
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^["']|["']$/g, "");
    return text || fallback();
  } catch {
    return fallback();
  }
}
