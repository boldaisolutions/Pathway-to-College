import { redirect } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { Icon } from "@/components/Icon";
import { BigRing, Trend, Radar } from "@/components/Charts";
import { getSession, getLatestScore, getScoreHistory } from "@/lib/queries";
import { catColor, syntheticHistory } from "@/lib/pathway-score";

const GOAL = 85;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function PathwayPage() {
  const { profile } = await getSession();
  const score = await getLatestScore(profile.id);
  if (!score) redirect("/signup");

  const history = await getScoreHistory(profile.id);
  const initials =
    profile.full_name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";

  // Trend: real snapshots if we have a few, else a synthetic ramp to "Now".
  const trend =
    history.length > 1
      ? history.map((h) => ({
          m: MONTHS[new Date(h.computed_at).getMonth()],
          v: h.overall,
        }))
      : syntheticHistory(score.overall);

  const cats = score.categories;
  const sorted = [...cats].sort((a, b) => b.score - a.score);

  return (
    <>
      <Topbar
        title="Pathway Score"
        subtitle="Your competitiveness, measured"
        name={profile.full_name || "Student"}
        initials={initials}
      />

      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        {/* Hero ring + trend */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.4fr]">
          <div
            className="relative flex flex-col items-center justify-center overflow-hidden rounded-hero p-7 text-white shadow-hero"
            style={{ background: "linear-gradient(135deg,#4f46e5,#4338ca 60%,#312e81)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 85% 10%, rgba(255,255,255,.16), transparent 55%)" }}
            />
            <div className="relative grid place-items-center">
              <BigRing value={score.overall} />
              <div className="absolute text-center">
                <div className="display-number text-[56px] leading-none">{score.overall}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                  out of 100
                </div>
              </div>
            </div>
            <div className="relative mt-4 text-center">
              <div className="text-[17px] font-extrabold">{score.tier}</div>
              <div className="mt-1 text-[13px] text-white/70">
                Estimated top {score.percentile}% of applicants
              </div>
            </div>
          </div>

          <section className="card p-5">
            <h3 className="mb-1 text-[15px] font-bold">Score over time</h3>
            <p className="mb-2 text-[12.5px] text-ink-muted">
              Goal {GOAL} — recomputed each time your inputs change.
            </p>
            <Trend hist={trend} goal={GOAL} />
          </section>
        </div>

        {/* Radar + breakdown */}
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.4fr]">
          <section className="card p-5">
            <h3 className="mb-2 text-[15px] font-bold">9-category radar</h3>
            <Radar cats={cats} />
          </section>

          <section className="card p-5">
            <h3 className="mb-4 text-[15px] font-bold">Category breakdown</h3>
            <div className="flex flex-col gap-3">
              {cats.map((c) => {
                const color = catColor(c.score);
                return (
                  <div key={c.short} className="flex items-center gap-3">
                    <div className="w-[150px] shrink-0">
                      <div className="text-[13px] font-semibold text-ink-2">{c.name}</div>
                      <div className="text-[11.5px] text-ink-muted">{c.note}</div>
                    </div>
                    <div className="h-[8px] flex-1 overflow-hidden rounded-pill bg-border">
                      <div
                        className="h-full rounded-pill transition-all"
                        style={{ width: `${c.score}%`, background: color }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[13px] font-bold" style={{ color }}>
                      {c.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Strengths + Grow next */}
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-success-bg">
                <Icon id="bolt" size={15} color="#059669" />
              </span>
              <h3 className="text-[15px] font-bold">Strengths</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-ink-3">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {s} <span className="ml-auto font-mono text-[12px] font-bold text-success">{sorted[i]?.score}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-warning-bg">
                <Icon id="target" size={15} color="#d97706" />
              </span>
              <h3 className="text-[15px] font-bold">Grow next</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {score.improvements.map((s, i) => {
                const cat = sorted[sorted.length - 1 - i];
                return (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-ink-3">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {s} <span className="ml-auto font-mono text-[12px] font-bold text-warning">{cat?.score}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
