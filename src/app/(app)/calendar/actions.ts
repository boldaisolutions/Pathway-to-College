"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addDeadline(title: string, dueDate: string, kind: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!title.trim() || !dueDate) return { ok: false as const, error: "Title and date required." };

  const { error } = await supabase.from("deadlines").insert({
    student_id: user.id,
    title: title.trim(),
    org: "",
    kind: kind || "Personal",
    due_date: dueDate,
    urgent: false,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
