"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface TestInput {
  kind: string;
  label: string;
  score: string;
  test_date: string;
  status: string;
}

export async function addTest(t: TestInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!t.kind.trim()) return { ok: false as const, error: "Pick a test type." };

  const { error } = await supabase.from("tests").insert({
    student_id: user.id,
    kind: t.kind,
    label: t.label.trim(),
    score: t.score.trim(),
    test_date: t.test_date ? t.test_date : null,
    status: t.status || "planned",
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/testing");
  return { ok: true as const };
}

export async function updateTestStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("tests").update({ status }).eq("id", id).eq("student_id", user.id);
  revalidatePath("/testing");
}

export async function deleteTest(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("tests").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/testing");
}
