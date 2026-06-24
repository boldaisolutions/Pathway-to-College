"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";
import { Segmented, MultiChips } from "@/components/Segmented";
import { BuildingScreen } from "@/components/BuildingScreen";
import { completeOnboarding, type OnboardingForm } from "./actions";
import type { LeadershipLevel, RigorLevel, TestingState } from "@/lib/types";

type Phase = "wizard" | "building" | "confirm";

interface Form extends OnboardingForm {
  name: string;
  email: string;
  password: string;
  interestDraft: string;
}

const blankForm = (): Form => ({
  name: "",
  email: "",
  password: "",
  grade: "10",
  school: "",
  major: "",
  interests: [],
  interestDraft: "",
  gpa: 3.5,
  rigor: "some",
  testing: "notyet",
  activitiesText: "",
  leadership: "member",
  serviceHours: 40,
  research: "no",
  awards: 1,
  helpWith: [],
});

const STEP_TITLES = [
  ["Create your account", "Start with the basics"],
  ["About you", "Tell us where you are today"],
  ["Academics", "Your grades, rigor & testing"],
  ["Activities & goals", "What you do and where you need help"],
];

const HELP_OPTIONS = [
  "Essays",
  "Passion projects",
  "Course planning",
  "Scholarships",
  "Leadership",
  "Research",
];

export default function SignupPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("wizard");
  const [step, setStep] = useState(0);
  const [hasAccount, setHasAccount] = useState(false);
  const [form, setForm] = useState<Form>(blankForm());
  const [error, setError] = useState<string | null>(null);
  const [buildDone, setBuildDone] = useState(false);

  // If already signed in (came back without finishing onboarding), skip the
  // account step and prefill identity.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setHasAccount(true);
        setStep((s) => (s === 0 ? 1 : s));
        setForm((f) => ({
          ...f,
          email: user.email ?? "",
          name: (user.user_metadata?.full_name as string) ?? "",
        }));
      }
    })();
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const minStep = hasAccount ? 1 : 0;
  const lastStep = 3;

  function addInterest() {
    const d = form.interestDraft.trim();
    if (!d) return;
    setForm((f) => ({ ...f, interests: [...f.interests, d], interestDraft: "" }));
  }
  function removeInterest(i: number) {
    setForm((f) => ({ ...f, interests: f.interests.filter((_, x) => x !== i) }));
  }
  function toggleHelp(v: string) {
    setForm((f) => ({
      ...f,
      helpWith: f.helpWith.includes(v)
        ? f.helpWith.filter((x) => x !== v)
        : [...f.helpWith, v],
    }));
  }

  function canContinue(): boolean {
    if (step === 0) return !!form.name && !!form.email && form.password.length >= 6;
    return true;
  }

  async function buildPathway() {
    setError(null);
    const supabase = createClient();

    // 1) Create the account if needed (trigger seeds profiles + students).
    if (!hasAccount) {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, role: "student" } },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      if (!data.session) {
        // Email confirmation is enabled on this Supabase project.
        setPhase("confirm");
        return;
      }
    }

    // 2) Run scoring + persist (show the building screen meanwhile).
    setPhase("building");
    setBuildDone(false);
    const result = await completeOnboarding({
      grade: form.grade,
      school: form.school,
      major: form.major,
      interests: form.interests,
      gpa: form.gpa,
      rigor: form.rigor,
      testing: form.testing,
      activitiesText: form.activitiesText,
      leadership: form.leadership,
      serviceHours: form.serviceHours,
      research: form.research,
      awards: form.awards,
      helpWith: form.helpWith,
    });
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      setPhase("wizard");
      return;
    }
    setBuildDone(true);
  }

  if (phase === "building") {
    return (
      <BuildingScreen
        done={buildDone}
        onComplete={() => {
          router.push("/dashboard");
          router.refresh();
        }}
      />
    );
  }

  if (phase === "confirm") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-6">
        <div className="card max-w-[420px] animate-pw-fade p-8 text-center">
          <Logo />
          <h2 className="mt-6 text-[22px] font-extrabold tracking-[-.02em]">
            Confirm your email
          </h2>
          <p className="mt-2 text-[14px] text-ink-muted">
            We sent a confirmation link to <b>{form.email}</b>. Confirm it, then come
            back and log in to finish building your Pathway.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-block">
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((step - minStep + 1) / (lastStep - minStep + 1)) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center bg-app px-6 py-10">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/login" className="text-[13.5px] font-semibold text-ink-muted hover:text-ink">
            Log in
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <span className="eyebrow">
              Step {step - minStep + 1} of {lastStep - minStep + 1}
            </span>
            <span className="font-mono text-[12px] text-ink-subtle">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="mt-2 h-[6px] w-full overflow-hidden rounded-pill bg-border">
            <div
              className="h-full rounded-pill bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div key={step} className="card mt-6 animate-pw-fade p-7">
          <h2 className="text-[22px] font-extrabold tracking-[-.02em]">
            {STEP_TITLES[step][0]}
          </h2>
          <p className="mt-1 text-[14px] text-ink-muted">{STEP_TITLES[step][1]}</p>

          <div className="mt-6 flex flex-col gap-5">
            {step === 0 && (
              <>
                <Field label="Full name">
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Jordan Rivera"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                  />
                </Field>
                <Field label="Password" hint="At least 6 characters">
                  <input
                    type="password"
                    className="input"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Current grade">
                  <Segmented
                    value={form.grade}
                    columns={7}
                    onChange={(v) => set("grade", v)}
                    options={["6", "7", "8", "9", "10", "11", "12"].map((g) => ({
                      value: g,
                      label: g,
                    }))}
                  />
                </Field>
                <Field label="School">
                  <input
                    className="input"
                    value={form.school}
                    onChange={(e) => set("school", e.target.value)}
                    placeholder="Riverside High School"
                  />
                </Field>
                <Field label="Intended major or field">
                  <input
                    className="input"
                    value={form.major}
                    onChange={(e) => set("major", e.target.value)}
                    placeholder="Computational Biology"
                  />
                </Field>
                <Field label="Interests" hint="Add a few — they shape your story">
                  <div className="flex gap-2">
                    <input
                      className="input"
                      value={form.interestDraft}
                      onChange={(e) => set("interestDraft", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                      placeholder="e.g. Machine learning"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="rounded-btn border border-border-input2 bg-surface px-4 text-[14px] font-semibold text-ink-3 hover:bg-app"
                    >
                      Add
                    </button>
                  </div>
                  {form.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.interests.map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="flex items-center gap-1.5 rounded-pill bg-indigo-tint px-3 py-[6px] text-[13px] font-semibold text-indigo-text"
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeInterest(i)}
                            className="text-indigo-text/60 hover:text-indigo-text"
                            aria-label={`Remove ${t}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Weighted GPA" hint={form.gpa.toFixed(2)}>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.01}
                    value={form.gpa}
                    onChange={(e) => set("gpa", Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </Field>
                <Field label="Honors / AP / IB taken">
                  <Segmented
                    value={form.rigor}
                    onChange={(v) => set("rigor", v as RigorLevel)}
                    options={[
                      { value: "none", label: "None" },
                      { value: "some", label: "A few" },
                      { value: "many", label: "Many" },
                    ]}
                  />
                </Field>
                <Field label="Standardized testing">
                  <Segmented
                    value={form.testing}
                    onChange={(v) => set("testing", v as TestingState)}
                    options={[
                      { value: "notyet", label: "Not yet" },
                      { value: "psat", label: "PSAT/PreACT" },
                      { value: "taken", label: "SAT/ACT taken" },
                    ]}
                  />
                </Field>
                <Field label="Awards / honors" hint={`${form.awards}`}>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={form.awards}
                    onChange={(e) => set("awards", Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                <Field label="Activities" hint="One per line">
                  <textarea
                    className="input min-h-[110px] resize-y"
                    value={form.activitiesText}
                    onChange={(e) => set("activitiesText", e.target.value)}
                    placeholder={"Varsity Debate\nCoding Club\nCity Food Bank"}
                  />
                </Field>
                <Field label="Leadership">
                  <Segmented
                    value={form.leadership}
                    onChange={(v) => set("leadership", v as LeadershipLevel)}
                    options={[
                      { value: "none", label: "Not yet" },
                      { value: "member", label: "Member" },
                      { value: "leader", label: "Leadership role" },
                    ]}
                  />
                </Field>
                <Field label="Service hours" hint={`${form.serviceHours} hrs`}>
                  <input
                    type="range"
                    min={0}
                    max={300}
                    step={5}
                    value={form.serviceHours}
                    onChange={(e) => set("serviceHours", Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </Field>
                <Field label="Research experience?">
                  <Segmented
                    value={form.research}
                    columns={2}
                    onChange={(v) => set("research", v as "yes" | "no")}
                    options={[
                      { value: "no", label: "Not yet" },
                      { value: "yes", label: "Yes" },
                    ]}
                  />
                </Field>
                <Field label="What do you want help with?">
                  <MultiChips
                    values={form.helpWith}
                    options={HELP_OPTIONS}
                    onToggle={toggleHelp}
                  />
                </Field>
              </>
            )}
          </div>

          {error && (
            <div className="mt-5 rounded-input bg-danger-bg px-3 py-2 text-[13px] text-danger">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-7 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(minStep, s - 1))}
              disabled={step === minStep}
              className="rounded-btn px-4 py-[11px] text-[14px] font-semibold text-ink-3 transition enabled:hover:bg-app disabled:opacity-40"
            >
              Back
            </button>
            {step < lastStep ? (
              <button
                type="button"
                onClick={() => canContinue() && setStep((s) => Math.min(lastStep, s + 1))}
                disabled={!canContinue()}
                className="rounded-btn bg-accent px-6 py-[11px] text-[14px] font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={buildPathway}
                className="rounded-btn bg-accent px-6 py-[11px] text-[14px] font-semibold text-white shadow-hero transition hover:bg-accent-hover"
              >
                Build my Pathway
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-ink-3">{label}</span>
        {hint && <span className="font-mono text-[12px] text-ink-subtle">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
