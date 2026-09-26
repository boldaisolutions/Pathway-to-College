"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CourseLevel } from "@/lib/types";

export async function addCourse(grade: number, name: string, level: CourseLevel) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!name.trim()) return { ok: false as const, error: "Course name is required." };

  const { error } = await supabase.from("courses").insert({
    student_id: user.id,
    grade,
    name: name.trim(),
    level,
    planned: false,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/academics");
  return { ok: true as const };
}
