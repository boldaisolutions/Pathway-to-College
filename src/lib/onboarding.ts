import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * A student is "onboarded" once at least one pathway_scores snapshot exists
 * (Build my Pathway has run). Used to route between the wizard and the app.
 */
export async function isOnboarded(
  supabase: SupabaseClient<Database>,
  studentId: string,
): Promise<boolean> {
  const { count } = await supabase
    .from("pathway_scores")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId);
  return (count ?? 0) > 0;
}
