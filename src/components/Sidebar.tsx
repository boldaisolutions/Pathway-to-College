"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Icon, type IconId } from "@/components/Icon";

interface NavItem {
  icon: IconId;
  label: string;
  href?: string;
  badge?: string;
  ready?: boolean;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

// Mirrors the prototype's nav, grouped by the four pillars. Items without a
// route are built in later modules (shown with a "Soon" tag).
const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { icon: "home", label: "Dashboard", href: "/dashboard", ready: true },
      { icon: "coach", label: "AI Coach", badge: "AI" },
    ],
  },
  {
    label: "Discover",
    items: [
      { icon: "pathway", label: "Pathway Score", href: "/pathway", ready: true },
      { icon: "profile", label: "My Profile" },
      { icon: "roadmap", label: "Roadmap" },
    ],
  },
  {
    label: "Build",
    items: [
      { icon: "academics", label: "Academic Planner" },
      { icon: "activities", label: "Activities" },
      { icon: "projects", label: "Passion Projects" },
      { icon: "resume", label: "Resume" },
    ],
  },
  {
    label: "Apply",
    items: [
      { icon: "essays", label: "Essay Studio" },
      { icon: "scholarships", label: "Scholarships" },
      { icon: "colleges", label: "College Explorer" },
      { icon: "applications", label: "Applications" },
    ],
  },
  {
    label: "Manage",
    items: [
      { icon: "calendar", label: "Calendar" },
      { icon: "settings", label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-[250px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-[22px] py-[20px]">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-3 pb-1.5 pt-2 eyebrow">{group.label}</div>
            <div className="flex flex-col gap-[2px]">
              {group.items.map((it) => {
                const active = it.href && pathname === it.href;
                const content = (
                  <span
                    className="flex items-center gap-[11px] rounded-nav px-3 py-[9px] text-[13.5px]"
                    style={{
                      background: active ? "#eef0fc" : "transparent",
                      color: active ? "#4338ca" : it.ready ? "#454a54" : "#aab2bd",
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    <Icon
                      id={it.icon}
                      size={18}
                      color={active ? "#4f46e5" : it.ready ? "#8a909a" : "#c7c4bd"}
                    />
                    <span className="flex-1">{it.label}</span>
                    {it.badge && (
                      <span className="rounded-chip bg-ai-bg px-1.5 py-[1px] text-[9px] font-bold text-ai">
                        {it.badge}
                      </span>
                    )}
                    {!it.ready && !it.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-ink-placeholder">
                        Soon
                      </span>
                    )}
                  </span>
                );
                return it.href ? (
                  <Link key={it.label} href={it.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={it.label} className="cursor-default select-none" title="Coming soon">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Pathway Pro upsell */}
      <div className="mx-3 mb-3 rounded-card bg-gradient-to-br from-accent to-accent-deeper p-4 text-white">
        <div className="flex items-center gap-2">
          <Icon id="sparkle" size={15} color="#fff" />
          <span className="text-[13px] font-bold">Pathway Pro</span>
        </div>
        <p className="mt-1 text-[11.5px] leading-snug text-white/75">
          Unlock unlimited AI coaching and deep college matching.
        </p>
        <button className="mt-3 w-full rounded-btn bg-white py-[7px] text-[12.5px] font-bold text-accent-deep">
          Upgrade
        </button>
      </div>

      <button
        onClick={logout}
        className="mx-3 mb-4 rounded-nav px-3 py-[9px] text-left text-[13px] font-semibold text-ink-muted transition hover:bg-app"
      >
        Log out
      </button>
    </aside>
  );
}
