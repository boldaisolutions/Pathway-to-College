"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { addDocument, deleteDocument } from "@/app/(app)/documents/actions";
import { DOCUMENT_CATEGORIES } from "@/lib/options";
import type { VaultDocument } from "@/lib/types";

const CAT_COLOR: Record<string, [string, string]> = {
  Transcript: ["#eaf1fe", "#2563bd"],
  "Test Score Report": ["#eef0fc", "#4338ca"],
  Essay: ["#f3eefe", "#7c3aed"],
  Resume: ["#fef0e7", "#c2410c"],
  Recommendation: ["#eafaf1", "#1b9e5f"],
  "Financial (FAFSA/Tax)": ["#fef2f2", "#dc2626"],
  "ID / Certificate": ["#f3f2ee", "#6b7079"],
  Portfolio: ["#f3eefe", "#7c3aed"],
  Other: ["#f3f2ee", "#6b7079"],
};

const blank = { name: "", category: "Transcript", url: "", notes: "" };

export function DocumentsManager({ items }: { items: VaultDocument[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const cats = Array.from(new Set(items.map((i) => i.category)));

  function submit() {
    setErr(null);
    start(async () => {
      const res = await addDocument(f);
      if (res.ok) { setF(blank); setOpen(false); router.refresh(); }
      else setErr(res.error || "Could not add.");
    });
  }

  return (
    <div className="space-y-[18px]">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-ink-muted">
          Keep links to every document you&apos;ll need — transcripts, score reports, essays, résumé, FAFSA — in one place. Store shareable links (Google Drive, Dropbox…).
        </p>
        <button onClick={() => setOpen((o) => !o)} className="rounded-btn bg-accent px-4 py-[8px] text-[13px] font-semibold text-white transition hover:bg-accent-hover">
          {open ? "Close" : "+ Add document"}
        </button>
      </div>

      {open && (
        <div className="card p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Name *"><input className="input" placeholder="e.g. Official transcript (Fall 2025)" value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink-3">Category</span>
              <select className="input" value={f.category} onChange={(e) => set("category", e.target.value)}>
                {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <Field label="Link"><input className="input" placeholder="https:// (Drive, Dropbox, etc.)" value={f.url} onChange={(e) => set("url", e.target.value)} /></Field>
            <Field label="Notes"><input className="input" placeholder="Optional" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          </div>
          {err && <div className="mt-3 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">{err}</div>}
          <button onClick={submit} disabled={pending} className="mt-4 rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60">
            {pending ? "Saving…" : "Save to vault"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center text-[14px] text-ink-muted">
          Your vault is empty. Add links to transcripts, score reports, essays, your résumé, and financial documents so they&apos;re ready when an application asks.
        </div>
      ) : (
        cats.map((cat) => {
          const [bg, fg] = CAT_COLOR[cat] ?? CAT_COLOR.Other;
          return (
            <section key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-chip px-2 py-[2px] text-[11px] font-bold" style={{ background: bg, color: fg }}>{cat}</span>
                <span className="font-mono text-[12px] text-ink-subtle">{items.filter((i) => i.category === cat).length}</span>
              </div>
              <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-3">
                {items.filter((i) => i.category === cat).map((d) => (
                  <div key={d.id} className="card group flex flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon id="doc" size={16} color={fg} />
                        <div className="text-[13.5px] font-bold text-ink-2">{d.name}</div>
                      </div>
                      <button onClick={() => deleteDocument(d.id).then(() => router.refresh())} className="text-ink-placeholder opacity-0 transition hover:text-danger group-hover:opacity-100" aria-label="Delete">
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    </div>
                    {d.notes && <div className="mt-1.5 text-[12.5px] text-ink-3">{d.notes}</div>}
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noreferrer" className="mt-auto pt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent hover:text-accent-hover">
                        Open document →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-semibold text-ink-3">{label}</span>
      {children}
    </label>
  );
}
