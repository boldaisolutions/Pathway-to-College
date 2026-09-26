import { Topbar } from "@/components/Topbar";
import { RequirementsManager } from "@/components/RequirementsManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { AppRequirement } from "@/lib/types";

export default async function AppRequirementsPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_requirements")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Application Requirements"
        subtitle="Every college's checklist in one place"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <RequirementsManager items={(data ?? []) as AppRequirement[]} />
      </div>
    </>
  );
}
