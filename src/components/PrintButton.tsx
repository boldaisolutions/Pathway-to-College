"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover"
    >
      Export PDF
    </button>
  );
}
