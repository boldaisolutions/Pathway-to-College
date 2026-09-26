"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshScholarships() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/scholarships/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(`Added ${data.added} new (${data.found} found).`);
        router.refresh();
      } else {
        setMsg(data.error || "Sync failed.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {msg && <span className="text-[12.5px] text-ink-muted">{msg}</span>}
      <button
        onClick={refresh}
        disabled={busy}
        className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? "Refreshing…" : "Refresh from Scholarships.com"}
      </button>
    </div>
  );
}
