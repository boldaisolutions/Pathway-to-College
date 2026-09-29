/**
 * Skill Gap Analyzer — PSAT/SAT domain taxonomy + gap analysis.
 *
 * Diagnostic platforms (Progress Learning, etc.) report percent correct by
 * section and domain. We deliberately do NOT convert those percentages into
 * PSAT/SAT scale scores: the scoring systems differ and the number would mislead.
 * Instead we rank domains by gap and turn them into a study order.
 *
 * Domain names and approximate question shares follow the College Board's
 * digital SAT Suite specifications.
 */

export type SectionKey = "rw" | "math";

export type Domain = {
  key: string;
  name: string;
  section: SectionKey;
  /** Approximate share of the section's questions (percent). */
  weight: number;
  skills: string[];
  tip: string;
};

export const SECTION_NAMES: Record<SectionKey, string> = {
  rw: "Reading & Writing",
  math: "Math",
};

export const DOMAINS: Domain[] = [
  {
    key: "information_ideas",
    name: "Information and Ideas",
    section: "rw",
    weight: 26,
    skills: ["Central ideas and details", "Command of evidence (textual)", "Command of evidence (quantitative: tables & graphs)", "Inferences"],
    tip: "Answer only from the text. Find the exact line that proves your choice. On table/graph questions, read the title and units before the choices, and check that the answer matches the data and the claim.",
  },
  {
    key: "craft_structure",
    name: "Craft and Structure",
    section: "rw",
    weight: 28,
    skills: ["Words in context", "Text structure and purpose", "Cross-text connections"],
    tip: "For words in context, predict your own word before reading the choices. For paired texts, sum up each author's view in a few words first.",
  },
  {
    key: "expression_ideas",
    name: "Expression of Ideas",
    section: "rw",
    weight: 20,
    skills: ["Transitions", "Rhetorical synthesis (using notes to meet a goal)"],
    tip: "Transitions: name the relationship between the two sentences (contrast, cause, addition, example) before looking. Rhetorical synthesis: pick the choice that does exactly what the question's goal says, not the most interesting fact.",
  },
  {
    key: "english_conventions",
    name: "Standard English Conventions",
    section: "rw",
    weight: 26,
    skills: ["Boundaries (commas, semicolons, colons, dashes)", "Form, structure, and sense (agreement, verb tense, pronouns, modifiers)"],
    tip: "These are rule-based. Learn the punctuation rules for joining clauses and the agreement rules, then drill short sets until they're automatic.",
  },
  {
    key: "algebra",
    name: "Algebra",
    section: "math",
    weight: 35,
    skills: ["Linear equations in one variable", "Linear equations in two variables", "Linear functions (slope and intercept in context)", "Systems of two linear equations", "Linear inequalities"],
    tip: "Practice turning word problems into equations and explaining what slope and intercept mean in context. Use Desmos to check systems and graphs.",
  },
  {
    key: "advanced_math",
    name: "Advanced Math",
    section: "math",
    weight: 35,
    skills: ["Equivalent expressions (factoring, exponents)", "Nonlinear equations and systems (quadratics)", "Nonlinear functions (quadratic and exponential)"],
    tip: "Get fluent with factoring, the quadratic formula, exponent rules, and function notation. Know how vertex form and exponential growth/decay show up in word problems.",
  },
  {
    key: "problem_solving_data",
    name: "Problem-Solving and Data Analysis",
    section: "math",
    weight: 15,
    skills: ["Ratios, rates, proportions, and units", "Percentages", "One-variable data (mean, median, spread)", "Two-variable data and scatterplots", "Probability and conditional probability", "Sample statistics and margin of error", "Evaluating statistical claims"],
    tip: "Write out units and set up proportions before calculating. Know percent change, how mean and median respond to outliers, and how to read two-way tables.",
  },
  {
    key: "geometry_trig",
    name: "Geometry and Trigonometry",
    section: "math",
    weight: 15,
    skills: ["Area and volume", "Lines, angles, and triangles", "Right triangles and trigonometry", "Circles"],
    tip: "Learn what's on the reference sheet and what isn't: special right triangles, SOH-CAH-TOA, circle equations, and arc/sector ratios.",
  },
];

export const domainsFor = (s: SectionKey) => DOMAINS.filter((d) => d.section === s);

export type Band = "strength" | "developing" | "needs_work" | "gap";

export const BAND_LABEL: Record<Band, string> = {
  strength: "Strength",
  developing: "Developing toward strong",
  needs_work: "Needs work",
  gap: "Significant gap",
};

/** [background, foreground] */
export const BAND_COLOR: Record<Band, [string, string]> = {
  strength: ["#eafaf1", "#047857"],
  developing: ["#eaf1fe", "#2563bd"],
  needs_work: ["#fff7ed", "#c2410c"],
  gap: ["#fef2f2", "#dc2626"],
};

export function band(pct: number): Band {
  if (pct >= 80) return "strength";
  if (pct >= 70) return "developing";
  if (pct >= 60) return "needs_work";
  return "gap";
}

/** Suggested practice sessions (~30 min) per week for a band. */
export const SESSIONS_PER_WEEK: Record<Band, number> = {
  strength: 1,
  developing: 2,
  needs_work: 2,
  gap: 3,
};

export type Scores = Record<string, number>;

export function readScore(scores: Scores, key: string): number | null {
  const v = scores?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export type SectionSummary = {
  section: SectionKey;
  name: string;
  pct: number | null;
  /** True when the section % was computed from domain scores rather than entered. */
  derived: boolean;
  band: Band | null;
  domainsReported: number;
  missed: number | null; // "about X of every 10 questions missed"
};

export type PlanStep =
  | { kind: "diagnose"; section: SectionKey; name: string; pct: number; reason: string }
  | { kind: "work"; domain: Domain; pct: number; band: Band; sessions: number; reason: string };

export type Analysis = {
  sections: SectionSummary[];
  plan: PlanStep[];
  maintain: { domain: Domain; pct: number }[];
  missingSections: SectionKey[];
  summary: string;
};

function sectionPct(scores: Scores, s: SectionKey): { pct: number | null; derived: boolean } {
  const entered = readScore(scores, s);
  if (entered !== null) return { pct: entered, derived: false };
  const ds = domainsFor(s)
    .map((d) => ({ d, p: readScore(scores, d.key) }))
    .filter((x): x is { d: Domain; p: number } => x.p !== null);
  if (ds.length === 0) return { pct: null, derived: false };
  const w = ds.reduce((a, x) => a + x.d.weight, 0);
  return { pct: ds.reduce((a, x) => a + x.p * x.d.weight, 0) / w, derived: true };
}

export function fmtPct(p: number) {
  return `${Math.round(p * 10) / 10}%`;
}

export function analyze(scores: Scores, source = "the diagnostic"): Analysis {
  const sections: SectionSummary[] = (["rw", "math"] as SectionKey[]).map((s) => {
    const { pct, derived } = sectionPct(scores, s);
    return {
      section: s,
      name: SECTION_NAMES[s],
      pct,
      derived,
      band: pct === null ? null : band(pct),
      domainsReported: domainsFor(s).filter((d) => readScore(scores, d.key) !== null).length,
      missed: pct === null ? null : Math.round((100 - pct) / 10),
    };
  });

  // 1) Sections with a score but no domain breakdown come first. We can't
  //    target practice until we know which domains cause the missed questions.
  const diagnose: PlanStep[] = sections
    .filter((s) => s.pct !== null && s.domainsReported === 0 && s.band !== "strength")
    .sort((a, b) => (a.pct as number) - (b.pct as number))
    .map((s) => ({
      kind: "diagnose" as const,
      section: s.section,
      name: s.name,
      pct: s.pct as number,
      reason: `${s.name} is at ${fmtPct(s.pct as number)}, so ${fmtPct(100 - (s.pct as number))} of questions were missed, but there's no domain breakdown yet. Open the category report in ${source} and enter the ${domainsFor(s.section).length} ${s.name} domain scores so we can see which topics are causing the misses.`,
    }));

  // 2) Domain gaps, weakest first; ties go to the heavier-weighted domain.
  const reported = DOMAINS.map((d) => ({ domain: d, pct: readScore(scores, d.key) })).filter(
    (x): x is { domain: Domain; pct: number } => x.pct !== null,
  );
  const work: PlanStep[] = reported
    .filter((x) => band(x.pct) !== "strength")
    .sort((a, b) => a.pct - b.pct || b.domain.weight - a.domain.weight)
    .map((x) => {
      const b = band(x.pct);
      const secName = SECTION_NAMES[x.domain.section];
      return {
        kind: "work" as const,
        domain: x.domain,
        pct: x.pct,
        band: b,
        sessions: SESSIONS_PER_WEEK[b],
        reason: `${fmtPct(x.pct)}. ${b === "gap" ? "One of the lowest areas" : "Room to grow"} in ${secName}. This domain is about ${x.domain.weight}% of the ${secName} section.`,
      };
    });

  const maintain = reported
    .filter((x) => band(x.pct) === "strength")
    .sort((a, b) => b.pct - a.pct);

  const missingSections = sections.filter((s) => s.pct === null).map((s) => s.section);

  // Plain-language summary
  const withPct = sections.filter((s) => s.pct !== null);
  let summary = "Enter section or domain scores to see the analysis.";
  if (withPct.length === 2) {
    const [a, b] = withPct;
    const diff = Math.abs((a.pct as number) - (b.pct as number));
    if (diff < 5) summary = `Balanced results: ${a.name} ${fmtPct(a.pct as number)} and ${b.name} ${fmtPct(b.pct as number)}.`;
    else {
      const [hi, lo] = (a.pct as number) > (b.pct as number) ? [a, b] : [b, a];
      summary = `Mixed results: ${hi.name} (${fmtPct(hi.pct as number)}) is stronger than ${lo.name} (${fmtPct(lo.pct as number)}). ${lo.name} needs more attention.`;
    }
  } else if (withPct.length === 1) {
    const s = withPct[0];
    summary = `${s.name}: ${fmtPct(s.pct as number)} (${BAND_LABEL[s.band as Band].toLowerCase()}). Add the other section when you have it.`;
  }

  return { sections, plan: [...diagnose, ...work], maintain, missingSections, summary };
}

/** Change per key vs. an earlier assessment (only keys present in both). */
export function deltas(latest: Scores, previous: Scores): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of ["rw", "math", ...DOMAINS.map((d) => d.key)]) {
    const a = readScore(latest, k);
    const b = readScore(previous, k);
    if (a !== null && b !== null) out[k] = a - b;
  }
  return out;
}

export const ALL_KEYS = ["rw", "math", ...DOMAINS.map((d) => d.key)];
