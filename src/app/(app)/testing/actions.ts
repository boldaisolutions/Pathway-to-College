"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALL_KEYS } from "@/lib/skill-gaps";

export interface TestInput {
  kind: string;
  label: string;
  score: string;
  test_date: string;
  status: string;
}

export async function addTest(t: TestInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!t.kind.trim()) return { ok: false as const, error: "Pick a test type." };

  const { error } = await supabase.from("tests").insert({
    student_id: user.id,
    kind: t.kind,
    label: t.label.trim(),
    score: t.score.trim(),
    test_date: t.test_date ? t.test_date : null,
    status: t.status || "planned",
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/testing");
  return { ok: true as const };
}

export async function updateTestStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("tests").update({ status }).eq("id", id).eq("student_id", user.id);
  revalidatePath("/testing");
}

export async function deleteTest(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("tests").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/testing");
}

// ---------- Skill Gap Analyzer ----------------------------------------------

export interface AssessmentInput {
  source: string;
  label: string;
  taken_on: string;
  scores: Record<string, number>;
  notes: string;
}

function cleanScores(raw: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    if (!ALL_KEYS.includes(k)) continue;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (v < 0 || v > 100) return { error: "Scores must be percentages between 0 and 100." };
    out[k] = Math.round(v * 100) / 100;
  }
  if (Object.keys(out).length === 0) return { error: "Enter at least one section or domain score." };
  return { scores: out };
}

export async function saveAssessment(a: AssessmentInput, id?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  const c = cleanScores(a.scores);
  if ("error" in c) return { ok: false as const, error: c.error };

  const row = {
    source: a.source.trim() || "Progress Learning",
    label: a.label.trim(),
    taken_on: a.taken_on ? a.taken_on : null,
    scores: c.scores,
    notes: a.notes.trim(),
  };
  const { error } = id
    ? await supabase.from("skill_assessments").update(row).eq("id", id).eq("student_id", user.id)
    : await supabase.from("skill_assessments").insert({ ...row, student_id: user.id });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/testing");
  return { ok: true as const };
}

export async function deleteAssessment(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("skill_assessments").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/testing");
}
