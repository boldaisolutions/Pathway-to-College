import { Topbar } from "@/components/Topbar";
import { PrintButton } from "@/components/PrintButton";
import { GenerateSummaryButton } from "@/components/GenerateSummaryButton";
import { getSession, getLatestScore } from "@/lib/queries";
import { buildResumeSummary } from "@/lib/resume";
import { createClient } from "@/lib/supabase/server";

export default async function ResumePage() {
  const { profile, student } = await getSession();
  const supabase = await createClient();
  const [{ data: activities }, { data: projects }, score] = await Promise.all([
    supabase.from("activities").select("*").eq("student_id", profile.id).order("created_at"),
    supabase.from("projects").select("*").eq("student_id", profile.id).order("created_at"),
    getLatestScore(profile.id),
  ]);

  // Prefer the saved AI summary; fall back to the deterministic résumé-voice one.
  const summary =
    student?.resume_summary?.trim() ||
    (student
      ? buildResumeSummary(student, {
          tier: score?.tier,
          activityCount: (activities ?? []).length,
        })
      : "");

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Resume"
        subtitle="Your one-page story"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade px-[28px] py-[22px]">
        <div className="mb-4 flex justify-end">
          <PrintButton />
        </div>

        {/* Paper document */}
        <div className="mx-auto max-w-[760px] rounded-card border border-border bg-white p-10 shadow-card">
          <div className="border-b border-ink/10 pb-4 text-center">
            <h1 className="text-[26px] font-extrabold tracking-[-.02em]">{profile.full_name || "Your Name"}</h1>
            <p className="mt-1 text-[13px] text-ink-muted">
              {[student && `Grade ${student.grade}`, student?.school, profile.email].filter(Boolean).join("  ·  ")}
            </p>
            {student?.intended_major && (
              <p className="mt-1 text-[13px] font-semibold text-accent">Intended major: {student.intended_major}</p>
            )}
          </div>

          {summary && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[.12em] text-accent">Summary</h2>
                <GenerateSummaryButton />
              </div>
              <p className="text-[13.5px] leading-relaxed text-ink-2">{summary}</p>
            </div>
          )}

          <Section title="Activities & Leadership">
            {(activities ?? []).length === 0 ? (
              <p className="text-[13px] text-ink-muted">No activities logged yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {(activities ?? []).map((a) => (
                  <li key={a.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13.5px] font-bold text-ink">{a.name}</span>
                      <span className="text-[12px] text-ink-muted">{a.category} · {a.hours || "—"}</span>
                    </div>
                    <div className="text-[12.5px] text-ink-3">{a.role}{a.description ? ` — ${a.description}` : ""}</div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {(projects ?? []).length > 0 && (
            <Section title="Projects">
              <ul className="flex flex-col gap-2">
                {(projects ?? []).map((p) => (
                  <li key={p.id}>
                    <span className="text-[13.5px] font-bold text-ink">{p.name}</span>
                    <span className="text-[12.5px] text-ink-3"> — {p.description}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Academics">
            <p className="text-[13.5px] text-ink-2">
              Weighted GPA {student?.gpa.toFixed(2) ?? "—"} · Course rigor {student?.rigor ?? "—"} ·{" "}
              {student?.service_hours ?? 0} service hours{student?.research ? " · Research experience" : ""}
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-accent">{title}</h2>
      {children}
    </div>
  );
}
