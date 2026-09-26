"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MilestoneStatus } from "@/lib/types";

export async function cycleMilestone(id: string, status: MilestoneStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const next: MilestoneStatus =
    status === "todo" ? "doing" : status === "doing" ? "done" : "todo";
  await supabase
    .from("roadmap_milestones")
    .update({ status: next })
    .eq("id", id)
    .eq("student_id", user.id);
  revalidatePath("/roadmap");
}
