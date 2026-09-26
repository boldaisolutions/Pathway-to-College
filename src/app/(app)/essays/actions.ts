"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewEssay } from "@/lib/ai/feedback";
import { generateIdeas } from "@/lib/ai/ideas";
import { persistIdeas } from "@/lib/ai/persist";
import type { EssayStatus } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Save the editor's prompt/body/title/status for one essay. */
export async function saveEssay(
  id: string,
  patch: { title?: string; prompt?: string; body?: string; status?: EssayStatus },
) {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const { error } = await supabase
    .from("essays")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("student_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/essays");
  return { ok: true as const };
}

/** "Get full review" (§4c): generate tagged notes and replace this essay's feedback. */
export async function requestReview(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const { data: essay } = await supabase
    .from("essays")
    .select("id, prompt, body, student_id")
    .eq("id", id)
    .eq("student_id", user.id)
    .single();
  if (!essay) return { ok: false as const, error: "Essay not found." };

  const notes = await reviewEssay(essay.prompt, essay.body);
  await supabase.from("essay_feedback").delete().eq("essay_id", id);
  await supabase.from("essay_feedback").insert(
    notes.map((n) => ({ essay_id: id, tag: n.tag, color: n.color, body: n.body })),
  );
  revalidatePath("/essays");
  return { ok: true as const };
}

/** Re-run idea generation (§4a) from the dashboard / Essay Studio banner. */
export async function regenerateIdeas() {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", user.id)
    .single();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const { data: acts } = await supabase
    .from("activities")
    .select("name")
    .eq("student_id", user.id);
  if (!student) return { ok: false as const, error: "No student profile." };

  const leadershipText = { none: "Not yet", member: "Member", leader: "Leadership role" }[
    student.leadership
  ];

  const ideas = await generateIdeas({
    name: (profile?.full_name || "Student").split(" ")[0],
    grade: student.grade,
    major: student.intended_major,
    interests: student.interests,
    gpa: student.gpa,
    activities: (acts ?? []).map((a) => a.name),
    leadership: leadershipText,
    serviceHours: student.service_hours,
    research: student.research,
    helpWith: student.help_with,
  });
  await persistIdeas(supabase, user.id, ideas);
  revalidatePath("/essays");
  revalidatePath("/projects");
  return { ok: true as const };
}
