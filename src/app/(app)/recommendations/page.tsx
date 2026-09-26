import { Topbar } from "@/components/Topbar";
import { RecommendersManager } from "@/components/RecommendersManager";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Recommender } from "@/lib/types";

export default async function RecommendationsPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("recommenders")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Recommendation Manager"
        subtitle="Track every letter, from ask to thank-you"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <RecommendersManager items={(data ?? []) as Recommender[]} />
      </div>
    </>
  );
}
