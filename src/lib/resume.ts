import type { Student } from "@/lib/types";

/**
 * A résumé-voice professional summary: present tense, third-person implied
 * (no "I"/"your"), sentence fragments — the register résumés use. It adjusts to
 * the student's live profile while keeping a consistent voice and tense.
 */
export function buildResumeSummary(
  student: Student,
  opts: { tier?: string; activityCount: number },
): string {
  const major = student.intended_major?.trim() || "an undecided field";
  const school = student.school?.trim();
  const tier = (opts.tier || "").toLowerCase();

  const opener = tier.includes("elite")
    ? "Exceptional"
    : tier.includes("competitive")
      ? "Highly competitive"
      : tier.includes("momentum")
        ? "Driven"
        : "Motivated";

  const rigorPhrase =
    student.rigor === "many"
      ? "a rigorous honors/AP course load"
      : student.rigor === "some"
        ? "an honors-level course load"
        : "a solid academic course load";

  const sentences: string[] = [];

  // Sentence 1 — who they are.
  sentences.push(
    `${opener} grade ${student.grade} student${school ? ` at ${school}` : ""} pursuing ${major}.`,
  );

  // Sentence 2 — academics.
  sentences.push(
    `Maintains a ${student.gpa.toFixed(2)} weighted GPA across ${rigorPhrase}.`,
  );

  // Sentence 3 — activities / service / research.
  const parts: string[] = [];
  if (opts.activityCount > 0) {
    parts.push(
      `${opts.activityCount} extracurricular ${opts.activityCount === 1 ? "commitment" : "commitments"}`,
    );
  }
  if (student.service_hours > 0) {
    parts.push(`${student.service_hours} hours of community service`);
  }
  if (student.research) parts.push("hands-on research experience");
  if (parts.length) {
    const joined =
      parts.length === 1
        ? parts[0]
        : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
    sentences.push(`Balances ${joined}.`);
  }

  // Sentence 4 — interests.
  if (student.interests.length) {
    sentences.push(`Core interests: ${student.interests.slice(0, 4).join(", ")}.`);
  }

  return sentences.join(" ");
}
