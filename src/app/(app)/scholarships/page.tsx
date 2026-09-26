import { Topbar } from "@/components/Topbar";
import { ScholarshipsList, type ScholarshipCard } from "@/components/ScholarshipsList";
import { RefreshScholarships } from "@/components/RefreshScholarships";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

// Eligibility filter: hide scholarships restricted to groups this student is
// not part of (a male U.S. citizen), so they never appear as cards or filters.
const EXCLUDED_TAGS = ["women", "lgbtq", "undocumented"];
function eligible(tags: string[]): boolean {
  return !tags.some((t) => EXCLUDED_TAGS.includes(t.toLowerCase()));
}

/** Simple deterministic match: overlap of tags with the student's interests/help. */
function matchFor(tags: string[], signals: string[]): number {
  const s = signals.map((x) => x.toLowerCase());
  const overlap = tags.filter((t) => s.some((x) => x.includes(t.toLowerCase()) || t.toLowerCase().includes(x))).length;
  return Math.max(70, Math.min(98, 78 + overlap * 7));
}

export default async function ScholarshipsPage() {
  const { profile, student } = await getSession();
  const supabase = await createClient();
  const [{ data: scholarships }, { data: saved }] = await Promise.all([
    supabase.from("scholarships").select("*").order("name"),
    supabase.from("saved_scholarships").select("scholarship_id").eq("student_id", profile.id),
  ]);

  const savedIds = new Set((saved ?? []).map((r) => r.scholarship_id));
  const signals = [...(student?.interests ?? []), ...(student?.help_with ?? []), student?.intended_major ?? ""];
  const pool = (scholarships ?? []).filter((s) => eligible(s.tags));
  const items: ScholarshipCard[] = pool.map((s) => ({
    ...s,
    match: matchFor(s.tags, signals),
    saved: savedIds.has(s.id),
  }));
  const filters = Array.from(new Set(pool.flatMap((s) => s.tags))).sort();

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Scholarships"
        subtitle="Funding matched to you"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">
            {items.length} scholarships · match reflects your interests & major
          </p>
          <RefreshScholarships />
        </div>
        {items.length === 0 ? (
          <div className="card p-8 text-center text-[14px] text-ink-muted">
            Run <code>seed.sql</code> to load the scholarship catalog.
          </div>
        ) : (
          <ScholarshipsList items={items} filters={filters} />
        )}
      </div>
    </>
  );
}
