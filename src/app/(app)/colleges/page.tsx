import { Topbar } from "@/components/Topbar";
import { CollegesList, type CollegeCard } from "@/components/CollegesList";
import { AddCollege } from "@/components/AddCollege";
import { getSession, getLatestScore } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { CollegeFit } from "@/lib/types";

function acceptancePct(raw: string): number {
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 50;
}

/** Fit + match derived from acceptance rate vs the student's Pathway Score. */
function fitAndMatch(rate: number, score: number): { fit: CollegeFit; match: number } {
  const fit: CollegeFit = rate < 15 ? "Reach" : rate < 40 ? "Target" : "Safety";
  // Higher score narrows the gap on selective schools.
  const base = fit === "Reach" ? 55 : fit === "Target" ? 74 : 88;
  const match = Math.max(40, Math.min(97, Math.round(base + (score - 65) * 0.4)));
  return { fit, match };
}

export default async function CollegesPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const score = await getLatestScore(profile.id);
  const [{ data: colleges }, { data: list }] = await Promise.all([
    supabase.from("colleges").select("*").order("name"),
    supabase.from("college_list").select("college_id").eq("student_id", profile.id),
  ]);

  const onListIds = new Set((list ?? []).map((r) => r.college_id));
  const overall = score?.overall ?? 65;
  const items: CollegeCard[] = (colleges ?? []).map((c) => {
    const { fit, match } = fitAndMatch(acceptancePct(c.acceptance_rate), overall);
    return { ...c, fit, match, onList: onListIds.has(c.id) };
  });

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="College Explorer"
        subtitle="Find and match your list"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">{items.length} colleges · fit is estimated from acceptance rate vs your score</p>
          <AddCollege />
        </div>
        {items.length === 0 ? (
          <div className="card p-8 text-center text-[14px] text-ink-muted">
            Run <code>seed.sql</code> to load the college catalog.
          </div>
        ) : (
          <CollegesList items={items} />
        )}
      </div>
    </>
  );
}
