"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_MILESTONES = [
  "Define scope & a clear goal",
  "Build a first working version",
  "Get feedback from real users",
  "Measure impact & present it",
];

/** Create a new passion project with the four default milestones. */
export async function createProject(name: string, description: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!name.trim()) return { ok: false as const, error: "Name is required." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      student_id: user.id,
      name: name.trim(),
      stage: "Idea",
      progress: 0,
      description: description.trim(),
      ai_origin: false,
    })
    .select("id")
    .single();
  if (error || !project) return { ok: false as const, error: error?.message ?? "Failed." };

  await supabase.from("project_milestones").insert(
    DEFAULT_MILESTONES.map((body, position) => ({
      project_id: project.id,
      body,
      done: false,
      position,
    })),
  );
  revalidatePath("/projects");
  return { ok: true as const };
}

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
