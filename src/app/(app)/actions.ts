"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
