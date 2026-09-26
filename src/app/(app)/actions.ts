"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Add a new "This Week" task. */
export async function addTask(body: string, tag: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!body.trim()) return { ok: false as const, error: "Task text required." };

  const { error } = await supabase
    .from("tasks")
    .insert({ student_id: user.id, body: body.trim(), tag: tag || "", done: false });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

/** Toggle a "This Week" task's done state. */
export async function toggleTask(id: string, done: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("tasks")
    .update({ done })
    .eq("id", id)
    .eq("student_id", user.id);

  revalidatePath("/dashboard");
}
