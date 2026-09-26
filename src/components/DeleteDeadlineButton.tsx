"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDeadline } from "@/app/(app)/calendar/actions";

export function DeleteDeadlineButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() =>
        start(async () => {
          await deleteDeadline(id);
          router.refresh();
        })
      }
      disabled={pending}
      className="shrink-0 text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100 disabled:opacity-40"
      aria-label="Remove event"
      title="Remove event"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );
}
