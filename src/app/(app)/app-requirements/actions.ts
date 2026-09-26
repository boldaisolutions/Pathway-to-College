"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const REQUIREMENT_CATEGORIES = [
  "Essay",
  "Recommendation",
  "Transcript",
  "Testing",
  "Form",
  "Fee",
  "Portfolio",
  "Interview",
  "Other",
] as const;

export const REQUIREMENT_STATUSES = ["Not started", "In progress", "Done", "Waived"] as const;

// A starter checklist applied when a student adds a new college.
const COMMON_APP_STARTER: { requirement: string; category: string }[] = [
  { requirement: "Common/Coalition application", category: "Form" },
  { requirement: "Personal statement / main essay", category: "Essay" },
  { requirement: "Supplemental essays", category: "Essay" },
  { requirement: "Official transcript", category: "Transcript" },
  { requirement: "Counselor recommendation", category: "Recommendation" },
  { requirement: "Teacher recommendation(s)", category: "Recommendation" },
  { requirement: "Test scores (SAT/ACT)", category: "Testing" },
  { requirement: "Application fee / fee waiver", category: "Fee" },
];

export interface RequirementInput {
  college_name: string;
  requirement: string;
  category: string;
  due_date: string;
  notes: string;
}

export async function addRequirement(r: RequirementInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!r.requirement.trim()) return { ok: false as const, error: "Add a requirement." };

  const { error } = await supabase.from("app_requirements").insert({
    student_id: user.id,
    college_name: r.college_name.trim(),
    requirement: r.requirement.trim(),
    category: r.category || "Other",
    status: "Not started",
    due_date: r.due_date.trim(),
    notes: r.notes.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/app-requirements");
  return { ok: true as const };
}

export async function addCollegeChecklist(collegeName: string, dueDate: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  const name = collegeName.trim();
  if (!name) return { ok: false as const, error: "Add a college name." };

  const rows = COMMON_APP_STARTER.map((s) => ({
    student_id: user.id,
    college_name: name,
    requirement: s.requirement,
    category: s.category,
    status: "Not started",
    due_date: dueDate.trim(),
    notes: "",
  }));
  const { error } = await supabase.from("app_requirements").insert(rows);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/app-requirements");
  return { ok: true as const };
}

export async function updateRequirementStatus(id: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("app_requirements").update({ status }).eq("id", id).eq("student_id", user.id);
  revalidatePath("/app-requirements");
}

export async function deleteRequirement(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("app_requirements").delete().eq("id", id).eq("student_id", user.id);
  revalidatePath("/app-requirements");
}
