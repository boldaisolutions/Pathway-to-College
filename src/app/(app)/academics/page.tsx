import { Topbar } from "@/components/Topbar";
import { Icon, type IconId } from "@/components/Icon";
import { AddCourseForm } from "@/components/AddCourseForm";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";

const LEVEL_COLOR: Record<string, [string, string]> = {
  AP: ["#f3eefe", "#7c3aed"],
  Honors: ["#eaf1fe", "#2563bd"],
  IB: ["#eef0fc", "#4338ca"],
  Dual: ["#eafaf1", "#1b9e5f"],
  Reg: ["#f3f2ee", "#6b7079"],
};

const RIGOR_LABEL: Record<string, string> = { none: "Standard", some: "Some Honors", many: "Honors / AP" };

export default async function AcademicsPage() {
  const { profile, student } = await getSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("student_id", profile.id)
    .order("grade", { ascending: true });

  const courses = (data ?? []) as Course[];
  const advanced = courses.filter((c) => ["AP", "Honors", "IB", "Dual"].includes(c.level)).length;
  // Always show a planning column for grades 9–12.
  const grades = [9, 10, 11, 12];

  const stats: { icon: IconId; value: string; label: string; tint: [string, string] }[] = [
    { icon: "academics", value: student ? student.gpa.toFixed(2) : "—", label: "Weighted GPA", tint: ["#eaf1fe", "#2563bd"] },
    { icon: "book", value: student ? RIGOR_LABEL[student.rigor] : "—", label: "Course rigor", tint: ["#f3eefe", "#7c3aed"] },
    { icon: "sparkle", value: String(advanced), label: "Advanced courses", tint: ["#fef0e7", "#c2410c"] },
    { icon: "scholarships", value: student ? student.testing.toUpperCase() : "—", label: "Testing", tint: ["#eafaf1", "#1b9e5f"] },
  ];

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Academic Planner"
        subtitle="Courses, rigor & GPA"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        <div className="grid grid-cols-2 gap-[14px] xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card flex flex-col gap-2 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px]" style={{ background: s.tint[0] }}>
                <Icon id={s.icon} size={17} color={s.tint[1]} />
              </div>
              <div className="text-[19px] font-extrabold tracking-[-.02em]">{s.value}</div>
              <div className="text-[12px] text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {grades.length === 0 ? null : (
          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {grades.map((g) => (
              <div key={g} className="flex flex-col gap-2">
                <div className="eyebrow">Grade {g}</div>
                {courses
                  .filter((c) => c.grade === g)
                  .map((c) => {
                    const [bg, fg] = LEVEL_COLOR[c.level] ?? LEVEL_COLOR.Reg;
                    return (
                      <div key={c.id} className="card flex items-center justify-between gap-2 p-3.5">
                        <span className="text-[13.5px] font-semibold text-ink-2">{c.name}</span>
                        <span className="rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: bg, color: fg }}>{c.level}</span>
                      </div>
                    );
                  })}
                <AddCourseForm grade={g} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
