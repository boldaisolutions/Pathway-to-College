"use client";

import { useState, useTransition } from "react";
import { Check } from "@/components/Icon";
import { chipColors } from "@/lib/ui";
import { toggleTask } from "@/app/(app)/actions";
import type { Task } from "@/lib/types";

/** "This Week" checklist with optimistic toggles + progress bar. */
export function TaskList({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [, startTransition] = useTransition();

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  function toggle(id: string) {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    const next = !tasks.find((t) => t.id === id)?.done;
    startTransition(() => {
      toggleTask(id, next);
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="h-[6px] flex-1 overflow-hidden rounded-pill bg-border">
          <div className="h-full rounded-pill bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[12px] font-semibold text-ink-muted">
          {done}/{tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {tasks.map((t) => {
          const [bg, fg] = chipColors(t.tag);
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="flex items-center gap-3 rounded-input px-2 py-[9px] text-left transition hover:bg-app"
            >
              <span
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border"
                style={{
                  borderColor: t.done ? "#4f46e5" : "#d4d2cc",
                  background: t.done ? "#4f46e5" : "#fff",
                }}
              >
                {t.done && <Check />}
              </span>
              <span
                className="flex-1 text-[13.5px]"
                style={{
                  color: t.done ? "#aab2bd" : "#2c313a",
                  textDecoration: t.done ? "line-through" : "none",
                }}
              >
                {t.body}
              </span>
              {t.tag && (
                <span
                  className="rounded-chip px-2 py-[2px] text-[11px] font-semibold"
                  style={{ background: bg, color: fg }}
                >
                  {t.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
