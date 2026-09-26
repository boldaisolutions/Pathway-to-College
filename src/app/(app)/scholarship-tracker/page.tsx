import { Topbar } from "@/components/Topbar";
import { ScholarshipTracker, type TrackedScholarship } from "@/components/ScholarshipTracker";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ScholarshipTrackerPage() {
  const { profile } = await getSession();
  const supabase = await createClient();

  const { data: saved } = await supabase
    .from("saved_scholarships")
    .select("scholarship_id, status")
    .eq("student_id", profile.id);

  const ids = (saved ?? []).map((r) => r.scholarship_id);
  const { data: scholarships } = ids.length
    ? await supabase.from("scholarships").select("*").in("id", ids)
    : { data: [] };
  const byId = new Map((scholarships ?? []).map((s) => [s.id, s]));

  const items: TrackedScholarship[] = (saved ?? [])
    .map((r) => {
      const s = byId.get(r.scholarship_id);
      if (!s) return null;
      return { id: s.id, name: s.name, amount: s.amount, deadline: s.deadline, status: r.status || "Saved" };
    })
    .filter((x): x is TrackedScholarship => x !== null);

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Scholarship Tracker"
        subtitle="Manage every application"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <ScholarshipTracker items={items} />
      </div>
    </>
  );
}
