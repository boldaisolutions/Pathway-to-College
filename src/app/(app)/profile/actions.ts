"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computePathwayScore, type StudentInputs } from "@/lib/pathway-score";
import type { LeadershipLevel, RigorLevel, TestingState } from "@/lib/types";

export interface ProfileForm {
  grade: string;
  school: string;
  major: string;
  interests: string[];
  gpa: number;
  rigor: RigorLevel;
  testing: TestingState;
  leadership: LeadershipLevel;
  serviceHours: number;
  research: boolean;
  awards: number;
}

/**
 * Save edited profile inputs, recompute the Pathway Score, append a new
 * pathway_scores snapshot (so the trend chart grows), and refresh recommendations.
 */
export async function updateProfileAndRescore(form: ProfileForm) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const gradeNum = parseInt(form.grade, 10) || 10;

  const { error: updErr } = await supabase
    .from("students")
    .update({
      grade: gradeNum,
      school: form.school,
      intended_major: form.major,
      interests: form.interests,
      gpa: Number(form.gpa),
      rigor: form.rigor,
      testing: form.testing,
      leadership: form.leadership,
      service_hours: Number(form.serviceHours) || 0,
      research: form.research,
      awards_count: Number(form.awards) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (updErr) return { ok: false as const, error: updErr.message };

  // Recompute using the live activity count.
  const { data: acts } = await supabase
    .from("activities")
    .select("name")
    .eq("student_id", user.id);

  const inputs: StudentInputs = {
    grade: gradeNum,
    intended_major: form.major,
    interests: form.interests,
    gpa: Number(form.gpa),
    rigor: form.rigor,
    testing: form.testing,
    leadership: form.leadership,
    service_hours: Number(form.serviceHours) || 0,
    research: form.research,
    awards_count: Number(form.awards) || 0,
    activities: (acts ?? []).map((a) => a.name),
  };
  const score = computePathwayScore(inputs);

  const { error: scoreErr } = await supabase.from("pathway_scores").insert({
    student_id: user.id,
    overall: score.overall,
    tier: score.tier,
    percentile: score.percentile,
    categories: score.categories,
    strengths: score.strengths,
    improvements: score.improvements,
  });
  if (scoreErr) return { ok: false as const, error: scoreErr.message };

  await supabase.from("recommendations").delete().eq("student_id", user.id);
  await supabase.from("recommendations").insert(
    score.recommendations.map((r) => ({
      student_id: user.id,
      title: r.title,
      why: r.why,
      impact: r.impact,
      category: r.category,
      icon: r.icon,
    })),
  );

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/pathway");
  return { ok: true as const, overall: score.overall };
}
