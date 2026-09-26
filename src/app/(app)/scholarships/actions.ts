"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Save or unsave a scholarship for the current student. */
export async function toggleSaveScholarship(scholarshipId: string, save: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (save) {
    await supabase
      .from("saved_scholarships")
      .upsert({ student_id: user.id, scholarship_id: scholarshipId, status: "saved" });
  } else {
    await supabase
      .from("saved_scholarships")
      .delete()
      .eq("student_id", user.id)
      .eq("scholarship_id", scholarshipId);
  }
  revalidatePath("/scholarships");
}
