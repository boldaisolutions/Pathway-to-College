import { Topbar } from "@/components/Topbar";
import { Icon, type IconId } from "@/components/Icon";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Course, Test } from "@/lib/types";

const LEVELS = ["AP", "IB", "Dual", "Honors", "Reg"] as const;
const LEVEL_COLOR: Record<string, string> = {
  AP: "#7c3aed",
  IB: "#4338ca",
  Dual: "#059669",
  Honors: "#2563bd",
  Reg: "#9aa0ab",
};
const RIGOR_LABEL: Record<string, string> = { none: "Standard load", some: "Some Honors/AP", many: "Rigorous (Honors/AP)" };

export default async function AcademicRecordPage() {
  const { profile, student } = await getSession();
  const supabase = await createClient();
  const [{ data: courseData }, { data: testData }] = await Promise.all([
    supabase.from("courses").select("*").eq("student_id", profile.id).order("grade"),
    supabase.from("tests").select("*").eq("student_id", profile.id),
  ]);
  const courses = (courseData ?? []) as Course[];
  const tests = (testData ?? []) as Test[];

  const counts: Record<string, number> = { AP: 0, IB: 0, Dual: 0, Honors: 0, Reg: 0 };
  for (const c of courses) counts[c.level] = (counts[c.level] ?? 0) + 1;
  const advanced = counts.AP + counts.IB + counts.Dual + counts.Honors;
  const total = courses.length || 1;
  const maxCount = Math.max(1, ...Object.values(counts));

  const bestScore = (kind: string) =>
    tests.filter((t) => t.kind.toUpperCase().includes(kind) && t.score).map((t) => t.score)[0];

  const stats: { icon: IconId; value: string; label: string; tint: [string, string] }[] = [
    { icon: "academics", value: student ? student.gpa.toFixed(2) : "—", label: "Weighted GPA", tint: ["#eaf1fe", "#2563bd"] },
    { icon: "sparkle", value: String(advanced), label: "Advanced courses", tint: ["#f3eefe", "#7c3aed"] },
    { icon: "book", value: String(courses.length), label: "Total courses logged", tint: ["#fef0e7", "#c2410c"] },
    { icon: "scholarships", value: bestScore("SAT") || bestScore("ACT") || (student ? student.testing.toUpperCase() : "—"), label: "Best test score", tint: ["#eafaf1", "#1b9e5f"] },
  ];

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar title="Academic Record" subtitle="Your academic profile" name={profile.full_name || "Student"} initials={initials} />
      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        <div className="grid grid-cols-2 gap-[14px] xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card flex flex-col gap-2 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: s.tint[0] }}>
                <Icon id={s.icon} size={17} color={s.tint[1]} />
              </div>
              <div className="display-number text-[22px]">{s.value}</div>
              <div className="text-[12px] text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.3fr]">
          {/* Rigor breakdown */}
          <section className="card p-5">
            <h3 className="mb-1 text-[15px] font-bold">Course rigor</h3>
            <p className="mb-4 text-[12.5px] text-ink-muted">{student ? RIGOR_LABEL[student.rigor] : "—"}</p>
            <div className="flex flex-col gap-3">
              {LEVELS.map((lvl) => (
                <div key={lvl} className="flex items-center gap-3">
                  <span className="w-14 text-[12.5px] font-semibold text-ink-3">{lvl}</span>
                  <div className="h-[8px] flex-1 overflow-hidden rounded-pill bg-border">
                    <div className="h-full rounded-pill" style={{ width: `${(counts[lvl] / maxCount) * 100}%`, background: LEVEL_COLOR[lvl] }} />
                  </div>
                  <span className="w-6 text-right font-mono text-[13px] font-bold" style={{ color: LEVEL_COLOR[lvl] }}>{counts[lvl]}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-input bg-app p-3 text-[12.5px] text-ink-3">
              {advanced === 0
                ? "No advanced courses logged yet. Adding AP/Honors/IB/Dual courses raises your Course Rigor score."
                : `${Math.round((advanced / total) * 100)}% of your logged courses are advanced (AP/Honors/IB/Dual).`}
            </div>
          </section>

          {/* Courses by grade */}
          <section className="card p-5">
            <h3 className="mb-3 text-[15px] font-bold">Courses by grade</h3>
            {courses.length === 0 ? (
              <p className="text-[13px] text-ink-muted">No courses yet — add them in the Academic Planner.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[9, 10, 11, 12].map((g) => {
                  const inGrade = courses.filter((c) => c.grade === g);
                  if (inGrade.length === 0) return null;
                  return (
                    <div key={g}>
                      <div className="eyebrow mb-1.5">Grade {g}</div>
                      <ul className="flex flex-col gap-1">
                        {inGrade.map((c) => (
                          <li key={c.id} className="flex items-center justify-between text-[13px]">
                            <span className="text-ink-2">{c.name}</span>
                            <span className="font-mono text-[11px] font-bold" style={{ color: LEVEL_COLOR[c.level] }}>{c.level}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
            <a href="/academics" className="mt-4 inline-block text-[12.5px] font-semibold text-accent hover:text-accent-hover">Edit courses in Academic Planner →</a>
          </section>
        </div>

        {/* Test scores */}
        {tests.length > 0 && (
          <section className="card p-5">
            <h3 className="mb-3 text-[15px] font-bold">Test scores</h3>
            <div className="flex flex-wrap gap-3">
              {tests.filter((t) => t.score).map((t) => (
                <div key={t.id} className="rounded-card border border-border-inner px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">{t.kind}</div>
                  <div className="font-mono text-[20px] font-bold text-accent">{t.score}</div>
                </div>
              ))}
              {tests.filter((t) => t.score).length === 0 && <p className="text-[13px] text-ink-muted">No scores recorded yet — add them in the Testing Center.</p>}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
