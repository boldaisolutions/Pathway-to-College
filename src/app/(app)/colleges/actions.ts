"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { CollegeFit } from "@/lib/types";

/** Add a custom college to the shared catalog (service-role write), then add it
 *  to the current student's list. */
export async function addCollege(input: {
  name: string;
  abbr: string;
  location: string;
  acceptance_rate: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not signed in." };
  if (!input.name.trim()) return { ok: false as const, error: "College name required." };

  const admin = createServiceClient();
  // Skip if a catalog row with the same name already exists.
  const { data: existing } = await admin
    .from("colleges")
    .select("id")
    .eq("name", input.name.trim())
    .maybeSingle();

  if (!existing) {
    const abbr =
      input.abbr.trim() ||
      input.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 4)
        .toUpperCase();
    const { error } = await admin.from("colleges").insert({
      name: input.name.trim(),
      abbr,
      location: input.location.trim(),
      acceptance_rate: input.acceptance_rate.trim(),
    });
    if (error) return { ok: false as const, error: error.message };
  }

  revalidatePath("/colleges");
  return { ok: true as const };
}

/** Add or remove a college from the student's list (pipeline starts at Researching). */
export async function toggleCollege(collegeId: string, fit: CollegeFit, add: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (add) {
    await supabase
      .from("college_list")
      .upsert({ student_id: user.id, college_id: collegeId, fit, stage: "Researching" });
  } else {
    await supabase
      .from("college_list")
      .delete()
      .eq("student_id", user.id)
      .eq("college_id", collegeId);
  }
  revalidatePath("/colleges");
  revalidatePath("/applications");
}
