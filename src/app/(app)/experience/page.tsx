import { Topbar } from "@/components/Topbar";
import { ExperienceBuilder } from "@/components/ExperienceBuilder";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/lib/types";

export default async function ExperiencePage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Experience Builder"
        subtitle="Turn activities into application-ready wins"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <ExperienceBuilder activities={(data ?? []) as Activity[]} />
      </div>
    </>
  );
}
