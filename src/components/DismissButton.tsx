"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { dismissRecommendation } from "@/app/(app)/actions";

export function DismissButton({ id }: { id: string }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await dismissRecommendation(id); router.refresh(); })}
      title="Dismiss"
      className="text-ink-placeholder transition hover:text-ink-muted"
      aria-label="Dismiss recommendation"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
