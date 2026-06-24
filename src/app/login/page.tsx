"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Icon, type IconId } from "@/components/Icon";

const FEATURES: { title: string; sub: string; icon: IconId }[] = [
  { title: "Your Pathway Score", sub: "See how competitive you are", icon: "pathway" },
  { title: "AI College Coach", sub: "Personalized strategy, anytime", icon: "coach" },
  { title: "A multi-year roadmap", sub: "Every step from grade 6 to 12", icon: "roadmap" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
      {/* Brand panel */}
      <div
        className="relative hidden flex-col overflow-hidden p-[48px_52px] text-white md:flex"
        style={{
          background: "linear-gradient(165deg,#4f46e5 0%,#4338ca 55%,#312e81 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 85% 8%, rgba(255,255,255,.14), transparent 50%)",
          }}
        />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative mt-auto">
          <h1 className="max-w-[420px] text-[34px] font-extrabold leading-[1.15] tracking-[-.02em]">
            Build a standout path to college.
          </h1>
          <p className="mt-3 max-w-[400px] text-[15px] text-white/70">
            One platform for your score, your story, and every step in between.
          </p>
          <div className="mt-9 flex flex-col gap-[18px]">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-[14px]">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15">
                  <Icon id={f.icon} size={18} color="#fff" />
                </div>
                <div>
                  <div className="text-[14.5px] font-semibold">{f.title}</div>
                  <div className="text-[13px] text-white/65">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-app px-6 py-12">
        <div className="w-full max-w-[380px] animate-pw-fade">
          <div className="mb-1 md:hidden">
            <Logo />
          </div>
          <h2 className="text-[24px] font-extrabold tracking-[-.02em]">Welcome back</h2>
          <p className="mt-1 text-[14px] text-ink-muted">
            Log in to continue building your pathway.
          </p>

          <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-4">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="input"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </Field>

            {error && (
              <div className="rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <Link
            href="/signup"
            className="mt-3 block w-full rounded-btn border border-border-input2 bg-surface py-[11px] text-center text-[14px] font-semibold text-ink-3 transition hover:bg-app"
          >
            Explore the demo profile
          </Link>

          <p className="mt-6 text-center text-[13.5px] text-ink-muted">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:text-accent-hover">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[12.5px] font-semibold text-ink-3">{label}</span>
      {children}
    </label>
  );
}
