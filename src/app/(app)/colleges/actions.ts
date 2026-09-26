"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CollegeFit } from "@/lib/types";

/** Add or remove a college from the student's list (pipeline starts at Researching). */
export async function toggleCollege(collegeId: string, fit: CollegeFit, add: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (add) {
    await supabase
      .from("college_list")
      .upsert({ student_id: user.id, college_id: collegeId, fit, stage: "Researching" });
  } else {
    await supabase
      .from("college_list")
      .delete()
      .eq("student_id", user.id)
      .eq("college_id", collegeId);
  }
  revalidatePath("/colleges");
  revalidatePath("/applications");
}
