"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { polishActivity, suggestLevelUps } from "@/app/(app)/experience/actions";
import type { Activity } from "@/lib/types";

const CAT_COLOR: Record<string, [string, string]> = {
  STEM: ["#eaf1fe", "#2563bd"],
  Research: ["#f3eefe", "#7c3aed"],
  Leadership: ["#fef0e7", "#c2410c"],
  Service: ["#eafaf1", "#1b9e5f"],
  Arts: ["#f3eefe", "#7c3aed"],
  Athletics: ["#fef0e7", "#c2410c"],
  Work: ["#eaf1fe", "#2563bd"],
};

function Card({ a }: { a: Activity }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<null | "polish" | "ideas">(null);
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [bg, fg] = CAT_COLOR[a.category] ?? ["#f3f2ee", "#6b7079"];
  const len = a.description?.length ?? 0;

  function polish() {
    setErr(null); setBusy("polish");
    start(async () => {
      const res = await polishActivity(a.id);
      setBusy(null);
      if (res.ok) router.refresh();
      else setErr(res.error || "Could not polish.");
    });
  }
  function ideasFn() {
    setErr(null); setBusy("ideas");
    start(async () => {
      const res = await suggestLevelUps(a.id);
      setBusy(null);
      if (res.ok) setIdeas(res.ideas);
      else setErr(res.error || "Could not load ideas.");
    });
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-ink-2">{a.name}</div>
          <div className="mt-0.5 text-[12.5px] text-ink-muted">{[a.role, a.hours, a.since].filter(Boolean).join(" · ")}</div>
        </div>
        {a.category && <span className="rounded-chip px-2 py-[2px] text-[11px] font-bold" style={{ background: bg, color: fg }}>{a.category}</span>}
      </div>

      <div className="mt-3 rounded-input bg-app p-3">
        {a.description ? (
          <p className="text-[13px] text-ink-2">{a.description}</p>
        ) : (
          <p className="text-[13px] italic text-ink-muted">No description yet — polish it into a strong Common App line.</p>
        )}
        <div className="mt-1.5 text-[11px] font-semibold" style={{ color: len > 150 ? "#dc2626" : "#8a909a" }}>
          {len}/150 characters (Common App limit)
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={polish} disabled={pending} className="inline-flex items-center gap-1.5 rounded-btn bg-accent px-3.5 py-[7px] text-[12.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
          <Icon id="sparkle" size={13} color="#fff" />
          {busy === "polish" ? "Polishing…" : a.description ? "Repolish description" : "Polish description"}
        </button>
        <button onClick={ideasFn} disabled={pending} className="inline-flex items-center gap-1.5 rounded-btn border border-border-input2 px-3.5 py-[7px] text-[12.5px] font-semibold text-ink-3 transition hover:bg-app disabled:opacity-60">
          <Icon id="bolt" size={13} color="#8a909a" />
          {busy === "ideas" ? "Thinking…" : "Level-up ideas"}
        </button>
      </div>

      {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[12.5px] text-danger">{err}</div>}

      {ideas && (
        <div className="mt-3 rounded-card border border-ai-bg bg-ai-bg/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ai">
            <Icon id="sparkle" size={12} color="#7c3aed" /> Ways to strengthen this
          </div>
          <ul className="flex flex-col gap-1.5">
            {ideas.map((i, idx) => (
              <li key={idx} className="flex gap-2 text-[13px] text-ink-2">
                <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-ai" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ExperienceBuilder({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="card p-8 text-center text-[14px] text-ink-muted">
        No activities yet. Add your clubs, sports, jobs, and projects on the{" "}
        <a href="/activities" className="font-semibold text-accent hover:text-accent-hover">Activities</a>{" "}
        page, then come back here to turn each one into a strong application-ready line.
      </div>
    );
  }
  return (
    <div className="space-y-[18px]">
      <p className="text-[13px] text-ink-muted">
        Turn each activity into a crisp, quantified Common App line, and get concrete ideas to deepen your involvement. Polished descriptions flow straight into your Résumé and Applications.
      </p>
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        {activities.map((a) => <Card key={a.id} a={a} />)}
      </div>
    </div>
  );
}
