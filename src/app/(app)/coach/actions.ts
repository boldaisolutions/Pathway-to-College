"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { coachReply, type CoachContext } from "@/lib/ai/coach";
import { getLatestScore } from "@/lib/queries";
import type { Category } from "@/lib/types";

export interface CoachTurn {
  role: "user" | "assistant";
  content: string;
}

/** Persist the user's message, generate a grounded reply, persist it, return it. */
export async function sendCoachMessage(text: string): Promise<{
  ok: boolean;
  reply?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const clean = text.trim();
  if (!clean) return { ok: false, error: "Empty message." };

  // Save the user turn.
  await supabase.from("coach_messages").insert({
    student_id: user.id,
    role: "user",
    content: clean,
  });

  // Build grounded context.
  const [{ data: profile }, { data: student }, score, { data: acts }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("students").select("intended_major, grade").eq("id", user.id).single(),
    getLatestScore(user.id),
    supabase.from("activities").select("name").eq("student_id", user.id),
  ]);

  const context: CoachContext = {
    name: profile?.full_name || "there",
    grade: student?.grade ?? 10,
    major: student?.intended_major ?? "",
    overall: score?.overall ?? 50,
    tier: score?.tier ?? "Building foundation",
    categories: (score?.categories as Category[]) ?? [],
    activities: (acts ?? []).map((a) => a.name),
  };

  // Recent history (last ~12 turns) for continuity.
  const { data: rows } = await supabase
    .from("coach_messages")
    .select("role, content")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);
  const history: CoachTurn[] = (rows ?? [])
    .reverse()
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content }));

  const reply = await coachReply(history, context);

  await supabase.from("coach_messages").insert({
    student_id: user.id,
    role: "assistant",
    content: reply,
  });

  revalidatePath("/coach");
  return { ok: true, reply };
}
