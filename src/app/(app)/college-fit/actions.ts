"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FitInput {
  size: string;
  setting: string;
  regions: string[];
  max_distance: string;
  cost_priority: string;
  selectivity: string;
  major_focus: string;
  campus_life: string;
  must_haves: string;
  deal_breakers: string;
}

export async function saveCollegeFit(f: FitInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };

  const { error } = await supabase.from("college_fit_profile").upsert(
    {
      student_id: user.id,
      size: f.size,
      setting: f.setting,
      regions: f.regions,
      max_distance: f.max_distance,
      cost_priority: f.cost_priority,
      selectivity: f.selectivity,
      major_focus: f.major_focus.trim(),
      campus_life: f.campus_life.trim(),
      must_haves: f.must_haves.trim(),
      deal_breakers: f.deal_breakers.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id" },
  );
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/college-fit");
  return { ok: true as const };
}
