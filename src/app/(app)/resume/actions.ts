"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateResumeSummary } from "@/lib/ai/resume-ai";

/** Generate an AI résumé summary from the live profile and save it. */
export async function regenerateResumeSummary() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const [{ data: student }, { data: acts }, { data: work }] = await Promise.all([
    supabase.from("students").select("*").eq("id", user.id).single(),
    supabase.from("activities").select("name, category").eq("student_id", user.id),
    supabase.from("work_experience").select("title, employer").eq("student_id", user.id),
  ]);
  if (!student) return { ok: false as const, error: "No student profile." };

  const summary = await generateResumeSummary(student, {
    grade: student.grade,
    major: student.intended_major,
    interests: student.interests,
    activities: (acts ?? []).map((a) => ({ name: a.name, category: a.category })),
    work: (work ?? []).map((w) => ({ title: w.title, employer: w.employer })),
    research: student.research,
    serviceHours: student.service_hours,
    awards: student.awards_count,
    gpa: student.gpa,
  });

  const { error } = await supabase
    .from("students")
    .update({ resume_summary: summary })
    .eq("id", user.id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/resume");
  return { ok: true as const, summary };
}
