"use server";

import { createClient } from "@/lib/supabase/server";
import {
  computePathwayScore,
  guessCat,
  type StudentInputs,
} from "@/lib/pathway-score";
import { generateIdeas } from "@/lib/ai/ideas";
import { persistIdeas } from "@/lib/ai/persist";
import type { LeadershipLevel, RigorLevel, TestingState } from "@/lib/types";

export interface OnboardingForm {
  grade: string;
  school: string;
  major: string;
  interests: string[];
  gpa: number;
  rigor: RigorLevel;
  testing: TestingState;
  activitiesText: string;
  leadership: LeadershipLevel;
  serviceHours: number;
  research: "yes" | "no";
  awards: number;
  helpWith: string[];
}

export interface OnboardingResult {
  ok: boolean;
  error?: string;
}

/** Starter tasks seeded so the new dashboard isn't empty. */
const STARTER_TASKS = [
  { body: 'Finish "Why CS" reflection in Essay Studio', tag: "Essay", done: false },
  { body: "Email a teacher about a research opportunity", tag: "Research", done: false },
  { body: "Pick next-year courses in the Planner", tag: "Academic", done: false },
  { body: "Log a recent activity or result", tag: "Activity", done: true },
  { body: "Add 3 reach schools to College Explorer", tag: "College", done: true },
];

/** Global-ish starter deadlines (attached to the student for this milestone). */
const STARTER_DEADLINES = [
  { title: "AP course summer prep signup", org: "School", kind: "Academic", due: "2026-06-28", urgent: true },
  { title: "Summer program — application", org: "Summer Program", kind: "Program", due: "2026-07-03", urgent: false },
  { title: "Regeneron registration opens", org: "Competition", kind: "Competition", due: "2026-07-15", urgent: false },
  { title: "Bank of America scholarship", org: "Scholarship", kind: "Scholarship", due: "2026-08-01", urgent: false },
];

const STARTER_ROADMAP = [
  { grade: 9, term: "Year", title: "Build strong GPA habits", detail: "Honors track foundation", status: "done", position: 0 },
  { grade: 10, term: "Fall", title: "Take the PSAT", detail: "Establish a testing baseline", status: "doing", position: 0 },
  { grade: 10, term: "Summer", title: "Research or summer program", detail: "Apply to 3 — highest priority", status: "todo", position: 1 },
  { grade: 11, term: "Fall", title: "AP courses in your major", detail: "Raise course rigor", status: "todo", position: 0 },
  { grade: 12, term: "Fall", title: "Submit applications", detail: "EA/ED + balanced list", status: "todo", position: 0 },
] as const;

export async function completeOnboarding(
  form: OnboardingForm,
): Promise<OnboardingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const gradeNum = parseInt(form.grade, 10) || 10;
  const activityNames = form.activitiesText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const inputs: StudentInputs = {
    name: undefined,
    grade: gradeNum,
    intended_major: form.major,
    interests: form.interests,
    gpa: Number(form.gpa),
    rigor: form.rigor,
    testing: form.testing,
    leadership: form.leadership,
    service_hours: Number(form.serviceHours) || 0,
    research: form.research === "yes",
    awards_count: Number(form.awards) || 0,
    activities: activityNames,
  };

  const score = computePathwayScore(inputs);

  // 1) Persist the student self-report.
  const classOf = 2026 + Math.max(0, 12 - gradeNum);
  const firstName = (user.user_metadata?.full_name || "You").split(" ")[0];
  const narrative =
    `${firstName} is a grade ${gradeNum} student drawn to ${form.major || "their field"}` +
    (form.interests.length
      ? `, with interests in ${form.interests.slice(0, 3).join(", ")}`
      : "") +
    `. The strongest next move is ${
      score.recommendations[0]?.category.toLowerCase() ?? "depth"
    } — that is where this profile can grow the most.`;

  const { error: studentErr } = await supabase
    .from("students")
    .update({
      grade: gradeNum,
      class_of: classOf,
      school: form.school,
      intended_major: form.major,
      interests: form.interests,
      help_with: form.helpWith,
      gpa: Number(form.gpa),
      rigor: form.rigor,
      testing: form.testing,
      leadership: form.leadership,
      service_hours: Number(form.serviceHours) || 0,
      research: form.research === "yes",
      awards_count: Number(form.awards) || 0,
      narrative,
    })
    .eq("id", user.id);
  if (studentErr) return { ok: false, error: studentErr.message };

  // 2) Activities (replace any prior onboarding rows).
  await supabase.from("activities").delete().eq("student_id", user.id);
  const activityRows =
    activityNames.length > 0
      ? activityNames.map((name) => ({
          student_id: user.id,
          name,
          role: "Member",
          category: guessCat(name),
          hours: "—",
          since: "2024",
          description:
            "Added during onboarding — open it to log hours, your role and highlights.",
        }))
      : [];
  if (activityRows.length) {
    const { error } = await supabase.from("activities").insert(activityRows);
    if (error) return { ok: false, error: error.message };
  }

  // 3) Pathway score snapshot (the trend chart reads the history).
  const { error: scoreErr } = await supabase.from("pathway_scores").insert({
    student_id: user.id,
    overall: score.overall,
    tier: score.tier,
    percentile: score.percentile,
    categories: score.categories,
    strengths: score.strengths,
    improvements: score.improvements,
  });
  if (scoreErr) return { ok: false, error: scoreErr.message };

  // 4) Recommendations (bottom-3 categories).
  await supabase.from("recommendations").delete().eq("student_id", user.id);
  const { error: recErr } = await supabase.from("recommendations").insert(
    score.recommendations.map((r) => ({
      student_id: user.id,
      title: r.title,
      why: r.why,
      impact: r.impact,
      category: r.category,
      icon: r.icon,
    })),
  );
  if (recErr) return { ok: false, error: recErr.message };

  // 5) Starter content so the dashboard has signal (only if empty).
  const { count: taskCount } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user.id);
  if ((taskCount ?? 0) === 0) {
    await supabase
      .from("tasks")
      .insert(STARTER_TASKS.map((t) => ({ ...t, student_id: user.id })));
    await supabase.from("deadlines").insert(
      STARTER_DEADLINES.map((d) => ({
        student_id: user.id,
        title: d.title,
        org: d.org,
        kind: d.kind,
        due_date: d.due,
        urgent: d.urgent,
      })),
    );
    await supabase.from("roadmap_milestones").insert(
      STARTER_ROADMAP.map((m) => ({ student_id: user.id, ...m })),
    );
  }

  // 6) AI ideas (§4a): essay ideas + passion projects + narrative strategy.
  // Always resolves (deterministic fallback) so onboarding never dead-ends.
  const ideas = await generateIdeas({
    name: firstName,
    grade: gradeNum,
    major: form.major,
    interests: form.interests,
    gpa: Number(form.gpa),
    activities: activityNames,
    leadership: form.leadership,
    serviceHours: Number(form.serviceHours) || 0,
    research: form.research === "yes",
    helpWith: form.helpWith,
  });
  await persistIdeas(supabase, user.id, ideas);

  return { ok: true };
}
