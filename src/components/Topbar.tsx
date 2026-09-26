/** Sticky top bar: page title, search, "On track" pill, notifications, chip. */
export function Topbar({
  title,
  subtitle,
  name,
  initials,
}: {
  title: string;
  subtitle: string;
  name: string;
  initials: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-app/80 px-[28px] py-[15px] backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-[19px] font-extrabold tracking-[-.02em]">{title}</h1>
        <p className="truncate text-[12.5px] text-ink-muted">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-pill border border-border bg-surface px-3 py-[7px] lg:flex">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#9aa0ab" strokeWidth={2}>
            <circle cx={11} cy={11} r={7} />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Search"
            className="w-[120px] bg-transparent text-[13px] text-ink placeholder:text-ink-placeholder"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-pill bg-success-bg px-3 py-[6px]">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[12px] font-bold text-success-deep">On track</span>
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink-subtle">
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </button>

        <div className="flex items-center gap-2 rounded-pill border border-border bg-surface py-[5px] pl-[5px] pr-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#fb923c,#ea580c)" }}
          >
            {initials}
          </div>
          <span className="hidden text-[13px] font-semibold text-ink-2 sm:block">{name}</span>
        </div>
      </div>
    </header>
  );
}
