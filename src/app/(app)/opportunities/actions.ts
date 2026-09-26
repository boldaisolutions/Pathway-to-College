"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface OpportunityInput {
  title: string;
  type: string;
  org: string;
  location: string;
  url: string;
  deadline: string;
  cost: string;
  notes: string;
}

export async function addOpportunity(o: OpportunityInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!o.title.trim()) return { ok: false as const, error: "Add a title." };

  const { error } = await supabase.from("opportunities").insert({
    student_id: user.id,
    title: o.title.trim(),
    type: o.type || "Internship",
    org: o.org.trim(),
    location: o.location.trim(),
    url: o.url.trim(),
    deadline: o.deadline.trim(),
    cost: o.cost.trim(),
    status: "Interested",
    notes: o.notes.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/opportunities");
  revalidatePath("/deadlines");
  return { ok: true as const };
}

export async function updateOpportunityStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("opportunities").update({ status }).eq("id", id).eq("student_id", user.id);
  revalidatePath("/opportunities");
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("opportunities").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/opportunities");
  revalidatePath("/deadlines");
}
