"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { saveEssay, requestReview, regenerateIdeas } from "@/app/(app)/essays/actions";
import type { Essay, EssayStatus } from "@/lib/types";

interface FeedbackNote {
  id: string;
  tag: string;
  color: string;
  body: string;
}
export interface EssayWithFeedback extends Essay {
  feedback: FeedbackNote[];
}

const STATUS_OPTIONS: EssayStatus[] = ["Idea", "Outline", "Drafting", "In review", "Done"];

const STATUS_COLOR: Record<string, [string, string]> = {
  Idea: ["#f3eefe", "#7c3aed"],
  Outline: ["#eef0fc", "#4f46e5"],
  Drafting: ["#fef0e7", "#c2410c"],
  "In review": ["#eaf1fe", "#2563bd"],
  Done: ["#eafaf1", "#1b9e5f"],
};

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function EssayStudio({ essays }: { essays: EssayWithFeedback[] }) {
  const [selectedId, setSelectedId] = useState(essays[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, { body: string; prompt: string; status: EssayStatus }>>(
    Object.fromEntries(essays.map((e) => [e.id, { body: e.body, prompt: e.prompt, status: e.status }])),
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const active = essays.find((e) => e.id === selectedId);
  const draft = active ? drafts[active.id] : undefined;
  const hasAiIdeas = essays.some((e) => e.ai_origin);

  function patchDraft(id: string, patch: Partial<{ body: string; prompt: string; status: EssayStatus }>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function onSave() {
    if (!active || !draft) return;
    setSavingId(active.id);
    await saveEssay(active.id, draft);
    setSavingId(null);
  }

  async function onReview() {
    if (!active || !draft) return;
    setReviewingId(active.id);
    await saveEssay(active.id, draft); // persist latest body before reviewing
    await requestReview(active.id);
    setReviewingId(null);
  }

  if (essays.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[14px] text-ink-muted">
          No essays yet. Generate AI essay ideas to get started.
        </p>
        <RegenButton />
      </div>
    );
  }

  return (
    <div className="space-y-[18px]">
      {hasAiIdeas && (
        <div className="flex items-center gap-3 rounded-card border border-ai-bg2 bg-ai-bg p-4">
          <Icon id="sparkle" size={18} color="#7c3aed" />
          <div className="flex-1">
            <div className="text-[14px] font-bold text-ai-deep">AI essay ideas for you</div>
            <div className="text-[12.5px] text-ai-2">
              Ideas seeded from your profile — select one on the left to start drafting.
            </div>
          </div>
          <RegenButton />
        </div>
      )}

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[260px_1fr_280px]">
        {/* Essay list */}
        <div className="flex flex-col gap-2">
          {essays.map((e) => {
            const [bg, fg] = STATUS_COLOR[e.status] ?? ["#f3f2ee", "#5b6068"];
            const words = wordCount(drafts[e.id]?.body ?? e.body);
            const pct = Math.min(100, Math.round((words / (e.word_target || 650)) * 100));
            const on = e.id === selectedId;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className="rounded-card border p-3 text-left transition"
                style={{ borderColor: on ? "#4f46e5" : "#ececea", background: on ? "#fbfaff" : "#fff" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 text-[13.5px] font-semibold text-ink-2">{e.title}</span>
                  <span className="shrink-0 rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: bg, color: fg }}>
                    {e.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-[5px] flex-1 overflow-hidden rounded-pill bg-border">
                    <div className="h-full rounded-pill bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-[10.5px] text-ink-subtle">
                    {words}/{e.word_target}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Editor */}
        {active && draft && (
          <div className="card flex flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[16px] font-extrabold tracking-[-.01em]">{active.title}</h3>
              <select
                value={draft.status}
                onChange={(e) => patchDraft(active.id, { status: e.target.value as EssayStatus })}
                className="rounded-input border border-border-input2 bg-surface px-2 py-1 text-[12.5px] font-semibold text-ink-3"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <label className="mt-4 text-[11.5px] font-semibold uppercase tracking-wide text-ink-subtle">Prompt</label>
            <textarea
              value={draft.prompt}
              onChange={(e) => patchDraft(active.id, { prompt: e.target.value })}
              className="input mt-1 min-h-[56px] resize-y text-[13px]"
              placeholder="Paste the essay prompt…"
            />

            <label className="mt-4 text-[11.5px] font-semibold uppercase tracking-wide text-ink-subtle">Draft</label>
            <textarea
              value={draft.body}
              onChange={(e) => patchDraft(active.id, { body: e.target.value })}
              className="input mt-1 min-h-[300px] resize-y text-[14px] leading-relaxed"
              placeholder="Write your essay here…"
            />

            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-[12px] text-ink-muted">
                {wordCount(draft.body)} / {active.word_target} words
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={onSave}
                  disabled={savingId === active.id}
                  className="rounded-btn border border-border-input2 bg-surface px-4 py-2 text-[13px] font-semibold text-ink-3 transition hover:bg-app disabled:opacity-60"
                >
                  {savingId === active.id ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={onReview}
                  disabled={reviewingId === active.id}
                  className="flex items-center gap-1.5 rounded-btn bg-accent px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
                >
                  <Icon id="sparkle" size={14} color="#fff" />
                  {reviewingId === active.id ? "Reviewing…" : "Get full review"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coach feedback */}
        <div className="card h-fit p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon id="coach" size={15} color="#7c3aed" />
            <h3 className="text-[14px] font-bold">Coach feedback</h3>
          </div>
          {active && active.feedback.length > 0 ? (
            <div className="flex flex-col gap-3">
              {active.feedback.map((f) => (
                <div key={f.id} className="rounded-card border border-border-inner p-3">
                  <span className="rounded-chip px-2 py-[2px] text-[10.5px] font-bold" style={{ background: `${f.color}1a`, color: f.color }}>
                    {f.tag}
                  </span>
                  <p className="mt-1.5 text-[13px] text-ink-3">{f.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-ink-muted">
              No feedback yet. Click <b>Get full review</b> for tagged notes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RegenButton() {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => { regenerateIdeas(); })}
      disabled={pending}
      className="rounded-btn border border-ai bg-surface px-3 py-2 text-[12.5px] font-semibold text-ai transition hover:bg-ai-bg disabled:opacity-60"
    >
      {pending ? "Generating…" : "Regenerate ideas"}
    </button>
  );
}
