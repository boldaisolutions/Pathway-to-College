import { Topbar } from "@/components/Topbar";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { College, CollegeListRow, PipelineStage } from "@/lib/types";

const STAGES: PipelineStage[] = ["Researching", "Shortlisted", "Applying", "Submitted"];

export default async function ApplicationsPage() {
  const { profile } = await getSession();
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("college_list")
    .select("*")
    .eq("student_id", profile.id);

  const rows = (list ?? []) as CollegeListRow[];
  const ids = rows.map((r) => r.college_id);
  const { data: colleges } = ids.length
    ? await supabase.from("colleges").select("*").in("id", ids)
    : { data: [] as College[] };
  const byId = new Map((colleges ?? []).map((c) => [c.id, c]));

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Applications"
        subtitle="Your college pipeline"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        {rows.length === 0 ? (
          <div className="card p-8 text-center text-[14px] text-ink-muted">
            Add colleges from the College Explorer to build your pipeline.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((stage) => {
              const inStage = rows.filter((r) => r.stage === stage);
              return (
                <div key={stage} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">{stage}</span>
                    <span className="font-mono text-[12px] text-ink-subtle">{inStage.length}</span>
                  </div>
                  {inStage.map((r) => {
                    const c = byId.get(r.college_id);
                    if (!c) return null;
                    return (
                      <div key={r.college_id} className="card p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-tint text-[11px] font-extrabold text-indigo-text">
                            {c.abbr}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[13.5px] font-bold text-ink-2">{c.name}</div>
                            <div className="text-[11.5px] text-ink-muted">{r.fit ?? "—"}</div>
                          </div>
                        </div>
                        {r.match != null && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="h-[6px] flex-1 overflow-hidden rounded-pill bg-border">
                              <div className="h-full rounded-pill bg-accent" style={{ width: `${r.match}%` }} />
                            </div>
                            <span className="font-mono text-[11px] text-ink-muted">{r.match}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {inStage.length === 0 && (
                    <div className="rounded-card border border-dashed border-border p-4 text-center text-[12px] text-ink-placeholder">
                      Nothing here yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
