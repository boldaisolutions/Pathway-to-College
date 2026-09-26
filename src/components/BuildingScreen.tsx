"use client";

import { useEffect, useState } from "react";
import { Check } from "@/components/Icon";

const BUILD_STEPS = [
  "Analyzing your profile",
  "Scoring 9 categories",
  "Generating essay ideas",
  "Designing passion projects",
];

/**
 * Full-screen build state shown while the score computes. `done` flips true once
 * the onboarding write resolves; we then call onComplete to enter the app.
 */
export function BuildingScreen({
  done,
  onComplete,
}: {
  done: boolean;
  onComplete: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => Math.min(BUILD_STEPS.length - 1, a + 1));
    }, 650);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (done && active >= BUILD_STEPS.length - 1) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
  }, [done, active, onComplete]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app px-6">
      <div className="animate-pw-pop flex w-full max-w-[420px] flex-col items-center text-center">
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 animate-spin rounded-full border-[3px] border-indigo-tint2"
            style={{ borderTopColor: "#4f46e5" }}
          />
        </div>
        <h2 className="mt-7 text-[22px] font-extrabold tracking-[-.02em]">
          Building your Pathway
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-muted">
          Crunching your profile across 9 categories…
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          {BUILD_STEPS.map((label, i) => {
            const complete = i < active || (done && i <= active);
            const current = i === active && !complete;
            return (
              <div
                key={label}
                className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 text-left shadow-card"
              >
                <div
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full transition"
                  style={{
                    background: complete ? "#4f46e5" : current ? "#eef0fc" : "#f3f2ee",
                  }}
                >
                  {complete ? (
                    <Check />
                  ) : current ? (
                    <div className="h-2 w-2 animate-spin rounded-full border border-accent border-t-transparent" />
                  ) : null}
                </div>
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: complete || current ? "#2c313a" : "#9aa0ab" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
