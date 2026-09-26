"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface RecommenderInput {
  name: string;
  role: string;
  relationship: string;
  email: string;
  request_date: string;
  due_date: string;
  for_colleges: string;
  notes: string;
}

export async function addRecommender(r: RecommenderInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!r.name.trim()) return { ok: false as const, error: "Add a name." };

  const { error } = await supabase.from("recommenders").insert({
    student_id: user.id,
    name: r.name.trim(),
    role: r.role || "Teacher",
    relationship: r.relationship.trim(),
    email: r.email.trim(),
    status: "To ask",
    request_date: r.request_date.trim(),
    due_date: r.due_date.trim(),
    for_colleges: r.for_colleges.trim(),
    notes: r.notes.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/recommendations");
  return { ok: true as const };
}

export async function updateRecommenderStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("recommenders").update({ status }).eq("id", id).eq("student_id", user.id);
  revalidatePath("/recommendations");
}

export async function deleteRecommender(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("recommenders").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/recommendations");
}
