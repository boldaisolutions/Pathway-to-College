/**
 * Pathway Score algorithm — the single source of truth.
 *
 * Ported verbatim from the prototype's `computeProfile()` (see INTEGRATION.md §3).
 * Implement once; the score is recomputed server-side whenever inputs change and
 * a new `pathway_scores` row is appended (the trend chart reads the history).
 */

import type {
  Category,
  LeadershipLevel,
  RigorLevel,
  TestingState,
} from "@/lib/types";

/** The self-report inputs that feed the score (subset of `students`). */
export interface StudentInputs {
  name?: string;
  grade: number;
  intended_major?: string;
  interests: string[];
  gpa: number;
  rigor: RigorLevel;
  testing: TestingState;
  leadership: LeadershipLevel;
  service_hours: number;
  research: boolean;
  awards_count: number;
  /** Activity names — count drives Extracurricular Depth. */
  activities: string[];
}

export const clamp = (n: number) => Math.max(10, Math.min(99, Math.round(n)));

export const WEIGHTS: Record<string, number> = {
  Academics: 0.18,
  Rigor: 0.12,
  Testing: 0.1,
  Leadership: 0.1,
  Activities: 0.12,
  Service: 0.1,
  Research: 0.12,
  Awards: 0.08,
  Narrative: 0.08,
};

export function computeCategories(s: StudentInputs): Category[] {
  const actCount = s.activities.length;
  const rigorNote: Record<RigorLevel, string> = {
    none: "standard load",
    some: "some honors",
    many: "honors/AP",
  };
  const testingNote: Record<TestingState, string> = {
    notyet: "not yet",
    psat: "PSAT done",
    taken: "SAT/ACT",
  };
  const leadershipNote: Record<LeadershipLevel, string> = {
    none: "none yet",
    member: "member",
    leader: "a role",
  };
  return [
    {
      name: "Academic Performance",
      short: "Academics",
      score: clamp(((s.gpa - 2) / 2) * 100),
      note: `GPA ${s.gpa}`,
    },
    {
      name: "Course Rigor",
      short: "Rigor",
      score: { none: 42, some: 68, many: 88 }[s.rigor] ?? 60,
      note: rigorNote[s.rigor] ?? "",
    },
    {
      name: "Standardized Testing",
      short: "Testing",
      score: { notyet: 46, psat: 66, taken: 85 }[s.testing] ?? 50,
      note: testingNote[s.testing] ?? "",
    },
    {
      name: "Leadership",
      short: "Leadership",
      score: { none: 42, member: 60, leader: 84 }[s.leadership] ?? 55,
      note: leadershipNote[s.leadership] ?? "",
    },
    {
      name: "Extracurricular Depth",
      short: "Activities",
      score: clamp(40 + actCount * 9),
      note: `${actCount} activities`,
    },
    {
      name: "Community Impact",
      short: "Service",
      score: clamp(40 + (Number(s.service_hours) || 0) / 3),
      note: `${Number(s.service_hours) || 0} hrs`,
    },
    {
      name: "Research",
      short: "Research",
      score: s.research ? 84 : 42,
      note: s.research ? "yes" : "none yet",
    },
    {
      name: "Awards & Honors",
      short: "Awards",
      score: clamp(44 + (Number(s.awards_count) || 0) * 12),
      note: `${Number(s.awards_count) || 0} awards`,
    },
    {
      name: "Personal Narrative",
      short: "Narrative",
      score: clamp(
        54 + (s.intended_major ? 10 : 0) + (s.interests.length >= 3 ? 8 : 0),
      ),
      note: "developing",
    },
  ];
}

export function overallScore(cats: Category[]): number {
  return clamp(cats.reduce((a, c) => a + c.score * (WEIGHTS[c.short] ?? 0), 0));
}

export function tierFor(overall: number): string {
  return overall < 50
    ? "Getting started"
    : overall < 65
      ? "Building foundation"
      : overall < 75
        ? "Building momentum"
        : overall < 85
          ? "Highly competitive"
          : "Elite tier";
}

export const percentileFor = (overall: number): number =>
  Math.max(2, Math.min(60, Math.round((100 - overall) * 0.8)));

/** Category → UI color rule used throughout the app. */
export const catColor = (s: number): string =>
  s >= 75 ? "#059669" : s >= 60 ? "#4f46e5" : "#e8943a";

const STRENGTH_COPY: Record<string, string> = {
  Academics: "Strong academic performance anchors your profile",
  Rigor: "A challenging course load shows you push yourself",
  Testing: "Solid standardized-testing progress",
  Leadership: "Real leadership experience stands out",
  Activities: "Good extracurricular breadth and commitment",
  Service: "Meaningful community-service contribution",
  Research: "Research experience — rare and valuable for applicants",
  Awards: "Recognition that strengthens your profile",
  Narrative: "A clear, developing personal story",
};

const improvementCopy = (short: string, major: string): string =>
  ({
    Academics: "Keep your GPA trending up — it anchors everything",
    Rigor: `Add honors/AP courses, especially in ${major}`,
    Testing: "Build a testing plan: PSAT → SAT/ACT",
    Leadership: "Turn membership into a real leadership role",
    Activities: `Add 1–2 activities tied to ${major}`,
    Service: "Grow consistent community-service hours",
    Research: "Pursue a research experience — your highest-leverage gap",
    Awards: "Enter competitions to earn recognition",
    Narrative: "Develop your personal narrative in Essay Studio",
  })[short] ?? "Keep building this area";

const REC_ICON: Record<string, string> = {
  Research: "flask",
  Leadership: "bolt",
  Activities: "bolt",
  Service: "heart",
  Academics: "book",
  Rigor: "book",
  Testing: "book",
  Awards: "scholarships",
  Narrative: "essays",
};

export interface RecommendationSeed {
  title: string;
  why: string;
  impact: string;
  category: string;
  icon: string;
}

export interface ScoreResult {
  overall: number;
  tier: string;
  percentile: number;
  categories: Category[];
  strengths: string[];
  improvements: string[];
  recommendations: RecommendationSeed[];
}

/** Compute the full score result for a student's inputs. */
export function computePathwayScore(s: StudentInputs): ScoreResult {
  const categories = computeCategories(s);
  const overall = overallScore(categories);
  const tier = tierFor(overall);
  const percentile = percentileFor(overall);

  const sorted = [...categories].sort((a, b) => b.score - a.score);
  const major = s.intended_major || "your field";
  const strengths = sorted.slice(0, 3).map((c) => STRENGTH_COPY[c.short]);
  const bottom = sorted.slice(-3).reverse();
  const improvements = bottom.map((c) => improvementCopy(c.short, major));

  const impacts = ["+6", "+4", "+3"];
  const recommendations: RecommendationSeed[] = bottom.map((c, i) => ({
    title: improvementCopy(c.short, major),
    why: `Your ${c.short} score is ${c.score} — the biggest opportunity to grow.`,
    impact: impacts[i] || "+2",
    category: c.short,
    icon: REC_ICON[c.short] || "target",
  }));

  return {
    overall,
    tier,
    percentile,
    categories,
    strengths,
    improvements,
    recommendations,
  };
}

/** Keyword rules used to bucket onboarding activities into a category. */
export function guessCat(name: string): string {
  const l = name.toLowerCase();
  if (/debate|model un|president|captain|founder|council|lead/.test(l))
    return "Leadership";
  if (/volunteer|service|food|habitat|tutor|hospital|charity|clean|shelter/.test(l))
    return "Service";
  return "STEM";
}

/**
 * Build a synthetic score history so the trend chart has something to draw on a
 * brand-new profile (start ~12 points below current, 6 points to "Now").
 * Real history accumulates from successive `pathway_scores` rows.
 */
export function syntheticHistory(overall: number): { m: string; v: number }[] {
  const startScore = clamp(overall - 12);
  return [0, 1, 2, 3, 4, 5].map((i) => ({
    m: i === 5 ? "Now" : "-" + (5 - i),
    v: clamp(startScore + ((overall - startScore) * i) / 5),
  }));
}
