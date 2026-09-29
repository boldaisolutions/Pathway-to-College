import { Topbar } from "@/components/Topbar";
import { TestingManager } from "@/components/TestingManager";
import { SkillGapAnalyzer } from "@/components/SkillGapAnalyzer";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { SkillAssessment, Test } from "@/lib/types";

export default async function TestingPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const [{ data }, { data: assessments }] = await Promise.all([
    supabase
      .from("tests")
      .select("*")
      .eq("student_id", profile.id)
      .order("test_date", { ascending: true }),
    supabase
      .from("skill_assessments")
      .select("*")
      .eq("student_id", profile.id)
      .order("taken_on", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: true }),
  ]);

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Testing Center"
        subtitle="PSAT, SAT, ACT, AP & IB"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade space-y-[28px] px-[28px] py-[22px]">
        <section>
          <h2 className="mb-1 text-[17px] font-extrabold tracking-[-.01em]">Skill Gap Analyzer</h2>
          <p className="mb-4 text-[13px] text-ink-muted">
            Enter diagnostic results by section and domain. Pathway finds the gaps and puts them in study order.
          </p>
          <SkillGapAnalyzer assessments={(assessments ?? []) as SkillAssessment[]} />
        </section>
        <section>
          <h2 className="mb-3 text-[17px] font-extrabold tracking-[-.01em]">Test Plan & Scores</h2>
          <TestingManager tests={(data ?? []) as Test[]} />
        </section>
      </div>
    </>
  );
}
