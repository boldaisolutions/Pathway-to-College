import { Topbar } from "@/components/Topbar";
import { ActivitiesList } from "@/components/ActivitiesList";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ActivitiesPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Activities"
        subtitle="Extracurriculars & leadership"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <ActivitiesList activities={activities ?? []} />
      </div>
    </>
  );
}
