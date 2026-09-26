import { Topbar } from "@/components/Topbar";
import { MilestoneCard } from "@/components/MilestoneCard";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapMilestone } from "@/lib/types";

export default async function RoadmapPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("roadmap_milestones")
    .select("*")
    .eq("student_id", profile.id)
    .order("grade", { ascending: true })
    .order("position", { ascending: true });

  const milestones = (data ?? []) as RoadmapMilestone[];
  const grades = Array.from(new Set(milestones.map((m) => m.grade))).sort((a, b) => a - b);

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Roadmap"
        subtitle="Your multi-year plan"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        {grades.length === 0 ? (
          <div className="card p-8 text-center text-[14px] text-ink-muted">
            Your roadmap will appear here after onboarding.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {grades.map((g) => (
              <div key={g} className="flex flex-col gap-3">
                <div className="eyebrow">Grade {g}</div>
                {milestones
                  .filter((m) => m.grade === g)
                  .map((m) => (
                    <MilestoneCard key={m.id} m={m} />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
