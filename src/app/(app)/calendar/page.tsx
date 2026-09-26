import { Topbar } from "@/components/Topbar";
import { getSession, getDeadlines } from "@/lib/queries";
import { formatDeadline } from "@/lib/ui";

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function CalendarPage() {
  const { profile } = await getSession();
  const deadlines = await getDeadlines(profile.id);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map day-of-month -> deadlines in the current month.
  const byDay = new Map<number, typeof deadlines>();
  for (const d of deadlines) {
    const dt = new Date(d.due_date + "T00:00:00");
    if (dt.getFullYear() === year && dt.getMonth() === month) {
      const arr = byDay.get(dt.getDate()) ?? [];
      arr.push(d);
      byDay.set(dt.getDate(), arr);
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar
        title="Calendar"
        subtitle="Deadlines & milestones"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade grid grid-cols-1 gap-[18px] px-[28px] py-[22px] lg:grid-cols-[1.6fr_1fr]">
        {/* Month grid */}
        <section className="card p-5">
          <h3 className="mb-3 text-[15px] font-bold">{MONTHS[month]} {year}</h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DOW.map((d, i) => (
              <div key={i} className="pb-1 text-[11px] font-bold text-ink-subtle">{d}</div>
            ))}
            {cells.map((day, i) => {
              const items = day ? byDay.get(day) : undefined;
              const isToday = day === today.getDate();
              return (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center rounded-input text-[12.5px]"
                  style={{ background: isToday ? "#eef0fc" : day ? "#fbfaf8" : "transparent" }}
                >
                  {day && (
                    <>
                      <span className="font-mono" style={{ fontWeight: isToday ? 800 : 500, color: isToday ? "#4338ca" : "#4a4f59" }}>
                        {day}
                      </span>
                      {items && (
                        <span
                          className="mt-0.5 h-1.5 w-1.5 rounded-full"
                          style={{ background: items.some((x) => x.urgent) ? "#ea580c" : "#4f46e5" }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Next up */}
        <section className="card p-5">
          <h3 className="mb-3 text-[15px] font-bold">Next up</h3>
          <div className="flex flex-col gap-2.5">
            {deadlines.map((d) => {
              const f = formatDeadline(d.due_date);
              return (
                <div key={d.id} className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px]"
                    style={{ background: d.urgent ? "#fef0e7" : "#f3f2ee" }}
                  >
                    <span className="text-[9px] font-bold uppercase" style={{ color: d.urgent ? "#c2410c" : "#9aa0ab" }}>{f.mon}</span>
                    <span className="font-mono text-[15px] font-bold" style={{ color: d.urgent ? "#c2410c" : "#2c313a" }}>{f.day}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-ink-2">{d.title}</div>
                    <div className="text-[12px] text-ink-muted">{d.org} · {f.in}</div>
                  </div>
                </div>
              );
            })}
            {deadlines.length === 0 && <p className="text-[13px] text-ink-muted">No deadlines yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
