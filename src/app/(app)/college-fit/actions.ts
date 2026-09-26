"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const SIZE_OPTIONS = ["No preference", "Small (< 5k)", "Medium (5k–15k)", "Large (15k+)"] as const;
export const SETTING_OPTIONS = ["No preference", "Urban", "Suburban", "Rural / college town"] as const;
export const DISTANCE_OPTIONS = ["No preference", "Close to home (< 3 hrs)", "In-region", "Anywhere in the U.S."] as const;
export const COST_OPTIONS = ["No preference", "Lowest net price", "Strong merit aid", "Best value / ROI"] as const;
export const SELECTIVITY_OPTIONS = ["Balanced list", "Reach-heavy", "Match-heavy", "Safety-heavy"] as const;
export const REGION_OPTIONS = ["Northeast", "Mid-Atlantic", "South", "Midwest", "Southwest", "West", "Pacific Northwest"] as const;

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
