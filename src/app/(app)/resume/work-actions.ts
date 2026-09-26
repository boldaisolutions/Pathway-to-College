"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface WorkInput {
  title: string;
  employer: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

export async function addWorkExperience(w: WorkInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!w.title.trim() && !w.employer.trim())
    return { ok: false as const, error: "Add a job title or employer." };

  const { error } = await supabase.from("work_experience").insert({
    student_id: user.id,
    title: w.title.trim(),
    employer: w.employer.trim(),
    location: w.location.trim(),
    start_date: w.start_date.trim(),
    end_date: w.end_date.trim(),
    description: w.description.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/resume");
  return { ok: true as const };
}

export async function deleteWorkExperience(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("work_experience").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/resume");
}
