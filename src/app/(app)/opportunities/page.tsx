import { Topbar } from "@/components/Topbar";
import { OpportunitiesManager } from "@/components/OpportunitiesManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Opportunity } from "@/lib/types";

export default async function OpportunitiesPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Opportunity Center"
        subtitle="Programs, internships & competitions worth pursuing"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <OpportunitiesManager items={(data ?? []) as Opportunity[]} />
      </div>
    </>
  );
}
