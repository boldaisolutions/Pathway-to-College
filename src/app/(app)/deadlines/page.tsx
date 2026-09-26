import { Topbar } from "@/components/Topbar";
import { Icon, type IconId } from "@/components/Icon";
import { getSession } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { formatDeadline } from "@/lib/ui";

interface Item {
  date: string;
  title: string;
  sub: string;
  type: string;
  icon: IconId;
  tint: [string, string];
}

export default async function DeadlinesPage() {
  const { profile } = await getSession();
  const supabase = await createClient();

  const [{ data: deadlines }, { data: tasks }, { data: tests }, { data: saved }] = await Promise.all([
    supabase.from("deadlines").select("*").or(`student_id.eq.${profile.id},student_id.is.null`),
    supabase.from("tasks").select("*").eq("student_id", profile.id).eq("done", false),
    supabase.from("tests").select("*").eq("student_id", profile.id).neq("status", "taken"),
    supabase.from("saved_scholarships").select("scholarship_id, status").eq("student_id", profile.id),
  ]);

  const savedIds = (saved ?? []).map((r) => r.scholarship_id);
  const { data: schs } = savedIds.length
    ? await supabase.from("scholarships").select("*").in("id", savedIds)
    : { data: [] };

  const items: Item[] = [];
  for (const d of deadlines ?? []) {
    items.push({ date: d.due_date, title: d.title, sub: `${d.kind || "Deadline"}${d.org ? ` · ${d.org}` : ""}`, type: "Deadline", icon: "calendar", tint: ["#eef0fc", "#4338ca"] });
  }
  for (const t of tasks ?? []) {
    if (t.due_date) items.push({ date: t.due_date, title: t.body, sub: `Task${t.tag ? ` · ${t.tag}` : ""}`, type: "Task", icon: "applications", tint: ["#fef0e7", "#c2410c"] });
  }
  for (const t of tests ?? []) {
    if (t.test_date) items.push({ date: t.test_date, title: `${t.kind}${t.label ? ` — ${t.label}` : ""}`, sub: `Test · ${t.status}`, type: "Test", icon: "book", tint: ["#eaf1fe", "#2563bd"] });
  }
  for (const s of schs ?? []) {
    if (s.deadline) items.push({ date: s.deadline, title: s.name, sub: `Scholarship · ${s.amount}`, type: "Scholarship", icon: "scholarships", tint: ["#f3eefe", "#7c3aed"] });
  }

  const withDays = items
    .map((i) => ({ ...i, f: formatDeadline(i.date) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = withDays.filter((i) => i.f.days >= 0);
  const next30 = upcoming.filter((i) => i.f.days <= 30);
  const later = upcoming.filter((i) => i.f.days > 30);
  const overdue = withDays.filter((i) => i.f.days < 0);
  const thisWeek = upcoming.filter((i) => i.f.days <= 7).length;
  const thisMonth = next30.length;

  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  return (
    <>
      <Topbar title="Deadlines" subtitle="Everything due, in one place" name={profile.full_name || "Student"} initials={initials} />
      <div className="animate-pw-fade space-y-[18px] px-[28px] py-[22px]">
        {/* Counters */}
        <div className="grid grid-cols-2 gap-[14px] md:grid-cols-4">
          <Counter value={thisWeek} label="Due this week" tint={["#fef2f2", "#dc2626"]} />
          <Counter value={thisMonth} label="Next 30 days" tint={["#fef0e7", "#c2410c"]} />
          <Counter value={upcoming.length} label="Upcoming total" tint={["#eef0fc", "#4338ca"]} />
          <Counter value={overdue.length} label="Overdue" tint={["#f3f2ee", "#6b7079"]} />
        </div>

        {overdue.length > 0 && <Group title="Overdue" items={overdue} danger />}
        <Group title="Your next 30 days" items={next30} emptyText="Nothing due in the next 30 days — nice." />
        {later.length > 0 && <Group title="Later" items={later} />}
      </div>
    </>
  );
}

function Counter({ value, label, tint }: { value: number; label: string; tint: [string, string] }) {
  return (
    <div className="card p-4">
      <div className="display-number text-[26px]" style={{ color: tint[1] }}>{value}</div>
      <div className="text-[12px] text-ink-muted">{label}</div>
    </div>
  );
}

function Group({ title, items, emptyText, danger }: { title: string; items: (Item & { f: ReturnType<typeof formatDeadline> })[]; emptyText?: string; danger?: boolean }) {
  return (
    <section className="card p-5">
      <h3 className="mb-3 text-[15px] font-bold" style={danger ? { color: "#dc2626" } : undefined}>{title}</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-muted">{emptyText ?? "Nothing here."}</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((i, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px]" style={{ background: i.tint[0] }}>
                <span className="text-[9px] font-bold uppercase" style={{ color: i.tint[1] }}>{i.f.mon}</span>
                <span className="font-mono text-[15px] font-bold" style={{ color: i.tint[1] }}>{i.f.day}</span>
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-ink-2">{i.title}</div>
                <div className="text-[12px] text-ink-muted">{i.sub}</div>
              </div>
              <div className="flex items-center gap-2">
                <Icon id={i.icon} size={15} color={i.tint[1]} />
                <span className="w-[70px] text-right text-[11.5px] font-semibold text-ink-subtle">{i.f.in}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
