import { Topbar } from "@/components/Topbar";
import { AchievementsManager } from "@/components/AchievementsManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Achievement } from "@/lib/types";

export default async function AchievementsPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("achievements")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Achievement Bank"
        subtitle="Everything you've done, in one place"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <AchievementsManager items={(data ?? []) as Achievement[]} />
      </div>
    </>
  );
}
