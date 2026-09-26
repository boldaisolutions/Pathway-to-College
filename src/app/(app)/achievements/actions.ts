"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AchievementInput {
  category: string;
  title: string;
  organization: string;
  role: string;
  result: string;
  date: string;
  skills: string[];
  evidence_url: string;
}

export async function addAchievement(a: AchievementInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!a.title.trim()) return { ok: false as const, error: "Add a title (what did you do?)." };

  const { error } = await supabase.from("achievements").insert({
    student_id: user.id,
    category: a.category || "Award",
    title: a.title.trim(),
    organization: a.organization.trim(),
    role: a.role.trim(),
    result: a.result.trim(),
    date: a.date.trim(),
    skills: a.skills.filter(Boolean),
    evidence_url: a.evidence_url.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/achievements");
  revalidatePath("/resume");
  return { ok: true as const };
}

export async function deleteAchievement(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("achievements").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/achievements");
  revalidatePath("/resume");
}
