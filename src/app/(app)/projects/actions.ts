"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Toggle a project milestone and recompute the parent project's progress
 * (% of milestones done). The student can only touch their own projects (RLS).
 */
export async function toggleMilestone(
  milestoneId: string,
  projectId: string,
  done: boolean,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("project_milestones").update({ done }).eq("id", milestoneId);

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("done")
    .eq("project_id", projectId);
  if (milestones && milestones.length) {
    const completed = milestones.filter((m) => m.done).length;
    const progress = Math.round((completed / milestones.length) * 100);
    await supabase
      .from("projects")
      .update({ progress })
      .eq("id", projectId)
      .eq("student_id", user.id);
  }

  revalidatePath("/projects");
}
