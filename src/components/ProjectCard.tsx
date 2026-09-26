"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@/components/Icon";
import { toggleMilestone, changeProjectStage, deleteProject } from "@/app/(app)/projects/actions";
import type { Project, ProjectMilestone, ProjectStage } from "@/lib/types";

const STAGE_COLOR: Record<string, [string, string]> = {
  Idea: ["#f3eefe", "#7c3aed"],
  Planning: ["#eef0fc", "#4f46e5"],
  Building: ["#fef0e7", "#c2410c"],
  Launched: ["#eafaf1", "#1b9e5f"],
};
const STAGES: ProjectStage[] = ["Idea", "Planning", "Building", "Launched"];

export interface ProjectWithMilestones extends Project {
  milestones: ProjectMilestone[];
}

export function ProjectCard({ project }: { project: ProjectWithMilestones }) {
  const router = useRouter();
  const sorted = [...project.milestones].sort((a, b) => a.position - b.position);
  const [milestones, setMilestones] = useState(sorted);
  const [, startTransition] = useTransition();

  const done = milestones.filter((m) => m.done).length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : project.progress;
  const [bg, fg] = STAGE_COLOR[project.stage] ?? ["#f3f2ee", "#5b6068"];

  function toggle(m: ProjectMilestone) {
    const next = !m.done;
    setMilestones((ms) => ms.map((x) => (x.id === m.id ? { ...x, done: next } : x)));
    startTransition(() => {
      toggleMilestone(m.id, project.id, next);
    });
  }

  return (
    <div className="card group flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-extrabold tracking-[-.01em]">{project.name}</h3>
        <div className="flex items-center gap-1.5">
          <select
            value={project.stage}
            onChange={(e) => startTransition(async () => { await changeProjectStage(project.id, e.target.value as ProjectStage); router.refresh(); })}
            className="rounded-chip border px-1.5 py-[2px] text-[10.5px] font-bold"
            style={{ background: bg, color: fg, borderColor: "transparent" }}
          >
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => deleteProject(project.id).then(() => router.refresh())}
            title="Delete project"
            className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100"
            aria-label="Delete project"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">{project.description}</p>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-[6px] flex-1 overflow-hidden rounded-pill bg-border">
          <div className="h-full rounded-pill bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[11.5px] font-semibold text-ink-muted">{pct}%</span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {milestones.map((m) => (
          <button
            key={m.id}
            onClick={() => toggle(m)}
            className="flex items-center gap-2.5 rounded-input px-1.5 py-[7px] text-left transition hover:bg-app"
          >
            <span
              className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border"
              style={{ borderColor: m.done ? "#4f46e5" : "#d4d2cc", background: m.done ? "#4f46e5" : "#fff" }}
            >
              {m.done && <Check />}
            </span>
            <span
              className="text-[13px]"
              style={{ color: m.done ? "#aab2bd" : "#2c313a", textDecoration: m.done ? "line-through" : "none" }}
            >
              {m.body}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
