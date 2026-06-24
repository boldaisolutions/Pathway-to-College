import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import type { Ideas } from "@/lib/ai/ideas";

const DEFAULT_MILESTONES = [
  "Define scope & a clear goal",
  "Build a first working version",
  "Get feedback from real users",
  "Measure impact & present it",
];

/**
 * Persist generated ideas (INTEGRATION.md §4a):
 * - strategy → students.narrative
 * - each essayIdea → essays (status Idea, ai_origin, prompt=angle) + an "Idea" feedback note
 * - each passionProject → projects (stage Idea, ai_origin) + 4 default milestones
 *
 * Idempotent for onboarding: clears prior ai_origin rows before inserting.
 */
export async function persistIdeas(
  supabase: SupabaseClient<Database>,
  studentId: string,
  ideas: Ideas,
) {
  await supabase
    .from("students")
    .update({ narrative: ideas.strategy })
    .eq("id", studentId);

  // Replace prior AI-suggested essays/projects so re-runs don't duplicate.
  await supabase
    .from("essays")
    .delete()
    .eq("student_id", studentId)
    .eq("ai_origin", true);
  await supabase
    .from("projects")
    .delete()
    .eq("student_id", studentId)
    .eq("ai_origin", true);

  for (const e of ideas.essayIdeas) {
    const { data: essay } = await supabase
      .from("essays")
      .insert({
        student_id: studentId,
        title: e.title,
        status: "Idea",
        prompt: e.angle,
        body: `Start drafting here…\n\nWhy this works: ${e.angle}`,
        word_target: 650,
        ai_origin: true,
      })
      .select("id")
      .single();
    if (essay) {
      await supabase.from("essay_feedback").insert({
        essay_id: essay.id,
        tag: "Idea",
        color: "#7c3aed",
        body: e.angle,
      });
    }
  }

  for (const p of ideas.passionProjects) {
    const { data: project } = await supabase
      .from("projects")
      .insert({
        student_id: studentId,
        name: p.name,
        stage: "Idea",
        progress: 0,
        description: p.description + (p.impact ? `  ·  Impact: ${p.impact}` : ""),
        impact: p.impact,
        ai_origin: true,
      })
      .select("id")
      .single();
    if (project) {
      await supabase.from("project_milestones").insert(
        DEFAULT_MILESTONES.map((body, position) => ({
          project_id: project.id,
          body,
          done: false,
          position,
        })),
      );
    }
  }
}
