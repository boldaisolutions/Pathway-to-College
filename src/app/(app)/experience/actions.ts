"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/queries";
import { polishActivityDescription, levelUpIdeas, type ExperienceContext } from "@/lib/ai/experience";
import type { Activity } from "@/lib/types";

async function loadActivity(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, activity: null };
  const { data } = await supabase.from("activities").select("*").eq("id", id).eq("student_id", user.id).maybeSingle();
  return { supabase, user, activity: (data as Activity | null) ?? null };
}

function contextFrom(student: { grade?: number | null; intended_major?: string | null; interests?: string[] | null } | null): ExperienceContext {
  return {
    grade: student?.grade ?? 11,
    major: student?.intended_major ?? "",
    interests: student?.interests ?? [],
  };
}

export async function polishActivity(id: string) {
  const { supabase, user, activity } = await loadActivity(id);
  if (!user || !activity) return { ok: false as const, error: "Activity not found." };
  const { student } = await getSession();
  const description = await polishActivityDescription(activity, contextFrom(student));
  const { error } = await supabase.from("activities").update({ description }).eq("id", id).eq("student_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/experience");
  revalidatePath("/activities");
  revalidatePath("/resume");
  return { ok: true as const, description };
}

export async function suggestLevelUps(id: string) {
  const { user, activity } = await loadActivity(id);
  if (!user || !activity) return { ok: false as const, error: "Activity not found." };
  const { student } = await getSession();
  const ideas = await levelUpIdeas(activity, contextFrom(student));
  return { ok: true as const, ideas };
}
