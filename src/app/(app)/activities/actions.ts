"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rescore } from "@/lib/rescore";
import { guessCat } from "@/lib/pathway-score";

async function user() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export interface NewActivity {
  name: string;
  role: string;
  category: string;
  hours: string;
  since: string;
  description: string;
}

/** Add an activity, then recompute the score (activity count feeds it). */
export async function addActivity(a: NewActivity) {
  const { supabase, user: u } = await user();
  if (!u) return { ok: false as const, error: "Not signed in." };
  if (!a.name.trim()) return { ok: false as const, error: "Name is required." };

  const { error } = await supabase.from("activities").insert({
    student_id: u.id,
    name: a.name.trim(),
    role: a.role || "Member",
    category: a.category || guessCat(a.name),
    hours: a.hours || "",
    since: a.since || "",
    description: a.description || "",
  });
  if (error) return { ok: false as const, error: error.message };

  await rescore(supabase, u.id);
  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/pathway");
  return { ok: true as const };
}

export async function deleteActivity(id: string) {
  const { supabase, user: u } = await user();
  if (!u) return;
  await supabase.from("activities").delete().eq("id", id).eq("student_id", u.id);
  await rescore(supabase, u.id);
  revalidatePath("/activities");
  revalidatePath("/dashboard");
  revalidatePath("/pathway");
}
