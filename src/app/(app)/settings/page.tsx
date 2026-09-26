import { Topbar } from "@/components/Topbar";
import { Icon, type IconId } from "@/components/Icon";
import { SignOutButton } from "@/components/SignOutButton";
import { getSession } from "@/lib/queries";

const PORTALS: { label: string; sub: string; icon: IconId }[] = [
  { label: "Parent / Guardian", sub: "Share progress with a parent", icon: "users" },
  { label: "Counselor", sub: "Connect your school counselor", icon: "profile" },
  { label: "Mentor", sub: "Invite a mentor to advise you", icon: "coach" },
  { label: "Administrator", sub: "School or program admin access", icon: "settings" },
];

export default async function SettingsPage() {
  const { profile, student } = await getSession();
  const initials =
    profile.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";

  const fields = [
    { label: "Full name", value: profile.full_name || "—" },
    { label: "Email", value: profile.email || "—" },
    { label: "School", value: student?.school || "—" },
    { label: "Grade", value: student ? `Grade ${student.grade}` : "—" },
    { label: "Intended major", value: student?.intended_major || "—" },
  ];

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Account & portals"
        name={profile.full_name || "Student"}
        initials={initials}
      />
      <div className="animate-pw-fade grid grid-cols-1 gap-[18px] px-[28px] py-[22px] lg:grid-cols-2">
        {/* Account */}
        <section className="card p-6">
          <h3 className="mb-4 text-[15px] font-bold">Account</h3>
          <div className="flex flex-col gap-3">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between border-b border-border-inner pb-3 last:border-0">
                <span className="text-[13px] text-ink-muted">{f.label}</span>
                <span className="text-[13.5px] font-semibold text-ink-2">{f.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <a href="/profile" className="rounded-btn bg-accent px-5 py-[10px] text-[13.5px] font-semibold text-white transition hover:bg-accent-hover">
              Edit profile
            </a>
            <SignOutButton />
          </div>
        </section>

        {/* Portals */}
        <section className="card p-6">
          <h3 className="mb-1 text-[15px] font-bold">Connected portals</h3>
          <p className="mb-4 text-[12.5px] text-ink-muted">
            Invite the people supporting your journey (coming soon).
          </p>
          <div className="flex flex-col gap-2.5">
            {PORTALS.map((p) => (
              <div key={p.label} className="flex items-center gap-3 rounded-card border border-border-inner p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-indigo-tint">
                  <Icon id={p.icon} size={17} color="#4338ca" />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-ink-2">{p.label}</div>
                  <div className="text-[12px] text-ink-muted">{p.sub}</div>
                </div>
                <span className="rounded-chip bg-app px-2.5 py-[3px] text-[11px] font-semibold text-ink-subtle">
                  Not connected
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
