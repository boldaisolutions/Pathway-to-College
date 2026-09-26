import Link from "next/link";
import { redirect } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { Icon, type IconId } from "@/components/Icon";
import { HeroRing, RingMini } from "@/components/Charts";
import { TaskList } from "@/components/TaskList";
import { createClient } from "@/lib/supabase/server";
import {
  getSession,
  getLatestScore,
  getScoreHistory,
  getRecommendations,
  getTasks,
  getDeadlines,
} from "@/lib/queries";
import { recTint, formatDeadline } from "@/lib/ui";

export default async function DashboardPage() {
  const { profile, student } = await getSession();
  const score = await getLatestScore(profile.id);
  if (!score || !student) redirect("/signup");

  const supabase = await createClient();
  const [history, recs, tasks, deadlines, { count: actCount }, { data: scholarships }] =
    await Promise.all([
      getScoreHistory(profile.id),
      getRecommendations(profile.id),
      getTasks(profile.id),
      getDeadlines(profile.id),
      supabase
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("student_id", profile.id),
      supabase.from("scholarships").select("*").limit(3),
    ]);

  const firstName = profile.full_name.split(" ")[0] || "there";
  const initials =
    profile.full_name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";
  const delta = history.length > 1 ? score.overall - history[0].overall : 12;
  const activities = actCount ?? 0;

  const quickActions: { label: string; icon: IconId; href: string }[] = [
    { label: "View score", icon: "pathway", href: "/pathway" },
    { label: "Add activity", icon: "activities", href: "/dashboard" },
    { label: "Find scholarships", icon: "scholarships", href: "/dashboard" },
  ];

  const overviewCards = [
    { icon: "academics" as IconId, value: student.gpa.toFixed(2), label: "Weighted GPA", tint: ["#eaf1fe", "#2563bd"] },
    { icon: "activities" as IconId, value: String(activities), label: "Active commitments", tint: ["#fef0e7", "#c2410c"] },
    { icon: "heart" as IconId, value: String(student.service_hours), label: "Service hours", tint: ["#eafaf1", "#1b9e5f"] },
    { icon: "pathway" as IconId, value: `Top ${score.percentile}%`, label: "Estimated percentile", tint: ["#f3eefe", "#7c3aed"] },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Let's make progress today"
        name={profile.full_name || "Student"}
        initials={initials}
      />

      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        {/* Greeting + quick actions */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-extrabold tracking-[-.02em]">
              Good afternoon, {firstName}
            </h2>
            <p className="text-[13.5px] text-ink-muted">
              You're {score.tier.toLowerCase()} — here's where to focus.
            </p>
          </div>
          <div className="flex gap-2">
            {quickActions.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="flex items-center gap-2 rounded-btn border border-border bg-surface px-3 py-2 text-[13px] font-semibold text-ink-3 shadow-card transition hover:bg-app"
              >
                <Icon id={q.icon} size={14} color="#6b7079" />
                {q.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Hero + overview cards */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.3fr_1fr]">
          {/* Pathway Score hero */}
          <Link
            href="/pathway"
            className="relative flex items-center gap-6 overflow-hidden rounded-hero p-6 text-white shadow-hero"
            style={{ background: "linear-gradient(135deg,#4f46e5,#4338ca 60%,#3730a3)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 88% 10%, rgba(255,255,255,.14), transparent 55%)" }}
            />
            <div className="relative grid place-items-center">
              <HeroRing value={score.overall} />
              <div className="absolute text-center">
                <div className="display-number text-[40px] leading-none">{score.overall}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  / 100
                </div>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="eyebrow text-white/60">Pathway Score</div>
              <div className="mt-0.5 text-[18px] font-extrabold tracking-[-.01em]">{score.tier}</div>
              <div className="mt-1 flex items-center gap-2 text-[13px]">
                <span className="rounded-pill bg-white/15 px-2 py-[2px] font-bold text-white">
                  ▲ +{delta} this term
                </span>
                <span className="text-white/70">Top {score.percentile}% percentile</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/15 pt-3">
                {[
                  { val: student.gpa.toFixed(2), label: "Weighted GPA" },
                  { val: String(activities), label: "Activities" },
                  { val: String(student.service_hours), label: "Service hrs" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="font-mono text-[18px] font-bold">{s.val}</div>
                    <div className="text-[11px] text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          {/* 4 stat cards */}
          <div className="grid grid-cols-2 gap-[14px]">
            {overviewCards.map((c) => (
              <div key={c.label} className="card flex flex-col gap-2 p-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                  style={{ background: c.tint[0] }}
                >
                  <Icon id={c.icon} size={17} color={c.tint[1]} />
                </div>
                <div className="display-number text-[24px]">{c.value}</div>
                <div className="text-[12px] text-ink-muted">{c.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column lower section */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-[18px]">
            {/* AI Recommendations */}
            <section className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon id="sparkle" size={15} color="#7c3aed" />
                <h3 className="text-[15px] font-bold">AI Recommendations</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {recs.map((r) => {
                  const [bg, fg] = recTint(r.icon);
                  return (
                    <div key={r.id} className="flex items-start gap-3 rounded-card border border-border-inner p-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                        style={{ background: bg }}
                      >
                        <Icon id={r.icon as IconId} size={18} color={fg} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold text-ink-2">{r.title}</div>
                        <div className="text-[12.5px] text-ink-muted">{r.why}</div>
                      </div>
                      <span className="rounded-chip bg-success-bg px-2 py-[2px] font-mono text-[12px] font-bold text-success-deep">
                        {r.impact}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* This Week */}
            <section className="card p-5">
              <h3 className="mb-3 text-[15px] font-bold">This Week</h3>
              <TaskList initial={tasks} />
            </section>
          </div>

          <div className="space-y-[18px]">
            {/* Upcoming Deadlines */}
            <section className="card p-5">
              <h3 className="mb-3 text-[15px] font-bold">Upcoming Deadlines</h3>
              <div className="flex flex-col gap-2.5">
                {deadlines.map((d) => {
                  const f = formatDeadline(d.due_date);
                  return (
                    <div key={d.id} className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px]"
                        style={{ background: d.urgent ? "#fef0e7" : "#f3f2ee" }}
                      >
                        <span className="text-[9px] font-bold uppercase" style={{ color: d.urgent ? "#c2410c" : "#9aa0ab" }}>
                          {f.mon}
                        </span>
                        <span className="font-mono text-[15px] font-bold" style={{ color: d.urgent ? "#c2410c" : "#2c313a" }}>
                          {f.day}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13.5px] font-semibold text-ink-2">{d.title}</div>
                        <div className="text-[12px] text-ink-muted">{d.org}</div>
                      </div>
                      <span className="text-[11.5px] font-semibold text-ink-subtle">{f.in}</span>
                    </div>
                  );
                })}
                {deadlines.length === 0 && (
                  <p className="text-[13px] text-ink-muted">No upcoming deadlines.</p>
                )}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="card p-5">
              <h3 className="mb-3 text-[15px] font-bold">Recent Activity</h3>
              <div className="flex flex-col gap-3">
                {[
                  `Pathway Score computed — ${score.overall}/100`,
                  `Profile created for ${profile.full_name || "you"}`,
                  `${activities} activities added during onboarding`,
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span className="text-[13px] text-ink-3">{line}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Matches */}
            <section className="card p-5">
              <h3 className="mb-3 text-[15px] font-bold">Top Scholarship Matches</h3>
              <div className="flex flex-col gap-3">
                {(scholarships ?? []).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <RingMini value={92 - i * 7} color="#7c3aed" size={42} />
                    <div className="flex-1">
                      <div className="text-[13.5px] font-semibold text-ink-2">{s.name}</div>
                      <div className="text-[12px] text-ink-muted">
                        {s.amount} · {s.tags.slice(0, 2).join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
                {(!scholarships || scholarships.length === 0) && (
                  <p className="text-[13px] text-ink-muted">
                    Run <code>seed.sql</code> to load the scholarship catalog.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
