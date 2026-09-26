"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PipelineStage } from "@/lib/types";

export async function changeStage(collegeId: string, stage: PipelineStage) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("college_list")
    .update({ stage })
    .eq("student_id", user.id)
    .eq("college_id", collegeId);
  revalidatePath("/applications");
}
