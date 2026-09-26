"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DocumentInput {
  name: string;
  category: string;
  url: string;
  notes: string;
}

export async function addDocument(d: DocumentInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!d.name.trim()) return { ok: false as const, error: "Add a name." };

  const { error } = await supabase.from("documents").insert({
    student_id: user.id,
    name: d.name.trim(),
    category: d.category || "Other",
    url: d.url.trim(),
    notes: d.notes.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/documents");
  return { ok: true as const };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("documents").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/documents");
}
