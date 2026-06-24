import { Topbar } from "@/components/Topbar";
import { EssayStudio, type EssayWithFeedback } from "@/components/EssayStudio";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function EssaysPage() {
  const { profile } = await getSession();
  const supabase = await createClient();

  const { data: essays } = await supabase
    .from("essays")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: true });

  const ids = (essays ?? []).map((e) => e.id);
  const { data: feedback } = ids.length
    ? await supabase.from("essay_feedback").select("*").in("essay_id", ids)
    : { data: [] };

  const withFeedback: EssayWithFeedback[] = (essays ?? []).map((e) => ({
    ...e,
    feedback: (feedback ?? [])
      .filter((f) => f.essay_id === e.id)
      .map((f) => ({ id: f.id, tag: f.tag, color: f.color, body: f.body })),
  }));

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Essay Studio"
        subtitle="Write, review, refine"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <EssayStudio essays={withFeedback} />
      </div>
    </>
  );
}
