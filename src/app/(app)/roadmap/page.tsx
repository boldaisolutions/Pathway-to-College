import { Topbar } from "@/components/Topbar";
import { Check } from "@/components/Icon";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapMilestone } from "@/lib/types";

const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  done: { bg: "#eafaf1", fg: "#059669", label: "Done" },
  doing: { bg: "#eef0fc", fg: "#4f46e5", label: "In progress" },
  todo: { bg: "#f3f2ee", fg: "#9aa0ab", label: "To do" },
};

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
                  .map((m) => {
                    const s = STATUS[m.status] ?? STATUS.todo;
                    return (
                      <div key={m.id} className="card p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                            {m.term}
                          </span>
                          <span className="flex items-center gap-1 rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: s.bg, color: s.fg }}>
                            {m.status === "done" && <Check color={s.fg} size={9} />}
                            {s.label}
                          </span>
                        </div>
                        <div className="mt-1.5 text-[14px] font-bold text-ink-2">{m.title}</div>
                        {m.detail && <div className="mt-0.5 text-[12.5px] text-ink-muted">{m.detail}</div>}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
