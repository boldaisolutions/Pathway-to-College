import { TopbarActions } from "@/components/TopbarActions";

/** Sticky top bar: page title, quick-search, status pill, notifications, chip. */
export function Topbar({
  title,
  subtitle,
  name,
  initials,
  status = "On track",
}: {
  title: string;
  subtitle: string;
  name: string;
  initials: string;
  status?: string;
}) {
  return (
    <header className="no-print sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-app/80 px-[28px] py-[15px] backdrop-blur">
      <div className="min-w-0">
        <h1 className="truncate text-[19px] font-extrabold tracking-[-.02em]">{title}</h1>
        <p className="truncate text-[12.5px] text-ink-muted">{subtitle}</p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <TopbarActions />

        <div className="hidden items-center gap-1.5 rounded-pill bg-success-bg px-3 py-[6px] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span className="text-[12px] font-bold text-success-deep">{status}</span>
        </div>

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
