import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computePathwayScore, type StudentInputs } from "@/lib/pathway-score";
import type { Database } from "@/lib/types";

/**
 * Recompute the Pathway Score from the student's current DB state, append a new
 * pathway_scores snapshot, and refresh recommendations. Call after any change
 * that affects the score (e.g. adding/removing an activity).
 */
export async function rescore(supabase: SupabaseClient<Database>, studentId: string) {
  const [{ data: student }, { data: acts }] = await Promise.all([
    supabase.from("students").select("*").eq("id", studentId).single(),
    supabase.from("activities").select("name").eq("student_id", studentId),
  ]);
  if (!student) return;

  const inputs: StudentInputs = {
    grade: student.grade,
    intended_major: student.intended_major,
    interests: student.interests,
    gpa: student.gpa,
    rigor: student.rigor,
    testing: student.testing,
    leadership: student.leadership,
    service_hours: student.service_hours,
    research: student.research,
    awards_count: student.awards_count,
    activities: (acts ?? []).map((a) => a.name),
  };
  const score = computePathwayScore(inputs);

  await supabase.from("pathway_scores").insert({
    student_id: studentId,
    overall: score.overall,
    tier: score.tier,
    percentile: score.percentile,
    categories: score.categories,
    strengths: score.strengths,
    improvements: score.improvements,
  });
  await supabase.from("recommendations").delete().eq("student_id", studentId);
  await supabase.from("recommendations").insert(
    score.recommendations.map((r) => ({
      student_id: studentId,
      title: r.title,
      why: r.why,
      impact: r.impact,
      category: r.category,
      icon: r.icon,
    })),
  );
}
