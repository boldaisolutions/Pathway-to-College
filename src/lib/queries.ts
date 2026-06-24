import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Deadline,
  PathwayScore,
  Profile,
  Recommendation,
  Student,
  Task,
} from "@/lib/types";

export interface SessionData {
  profile: Profile;
  student: Student | null;
}

/** Loads the signed-in user's profile + student row, redirecting if absent. */
export async function getSession(): Promise<SessionData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: student }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("students").select("*").eq("id", user.id).single(),
  ]);

  if (!profile) redirect("/login");
  return { profile, student: student ?? null };
}

/** The most recent pathway score snapshot (the "live" score). */
export async function getLatestScore(
  studentId: string,
): Promise<PathwayScore | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pathway_scores")
    .select("*")
    .eq("student_id", studentId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Full score history ordered for the trend chart. */
export async function getScoreHistory(
  studentId: string,
): Promise<PathwayScore[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pathway_scores")
    .select("*")
    .eq("student_id", studentId)
    .order("computed_at", { ascending: true });
  return data ?? [];
}

export async function getRecommendations(
  studentId: string,
): Promise<Recommendation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recommendations")
    .select("*")
    .eq("student_id", studentId)
    .eq("dismissed", false)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getTasks(studentId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getDeadlines(studentId: string): Promise<Deadline[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deadlines")
    .select("*")
    .or(`student_id.eq.${studentId},student_id.is.null`)
    .order("due_date", { ascending: true })
    .limit(6);
  return data ?? [];
}
