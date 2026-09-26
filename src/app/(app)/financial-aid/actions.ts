"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AidInput {
  college_name: string;
  cost_of_attendance: number;
  grants: number;
  scholarships: number;
  loans: number;
  work_study: number;
  notes: string;
}

export async function addAidAward(a: AidInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!a.college_name.trim()) return { ok: false as const, error: "Add a college name." };

  const { error } = await supabase.from("aid_awards").insert({
    student_id: user.id,
    college_name: a.college_name.trim(),
    cost_of_attendance: a.cost_of_attendance || 0,
    grants: a.grants || 0,
    scholarships: a.scholarships || 0,
    loans: a.loans || 0,
    work_study: a.work_study || 0,
    notes: a.notes.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/financial-aid");
  return { ok: true as const };
}

export async function deleteAidAward(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("aid_awards").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/financial-aid");
}
