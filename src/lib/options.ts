// Plain constant module (NOT a "use server" file). Option arrays live here so
// client components can import them safely. Exporting non-async values from a
// "use server" action file turns them into server-action references, which are
// not usable as arrays on the client (`.map` throws) — so keep them here.

export const SAVED_STATUSES = ["Saved", "Applying", "Submitted", "Awarded", "Not selected"];

export const ACHIEVEMENT_CATEGORIES = [
  "Award",
  "Competition",
  "Certification",
  "Research",
  "Project",
  "Leadership",
  "Volunteer",
  "Job",
  "Internship",
  "Presentation",
  "Publication",
  "Media",
  "Community",
] as const;

export const OPPORTUNITY_TYPES = [
  "Internship",
  "Summer Program",
  "Competition",
  "Research",
  "Job",
  "Volunteer",
  "Fellowship",
  "Course",
  "Other",
] as const;

export const OPPORTUNITY_STATUSES = [
  "Interested",
  "Applying",
  "Applied",
  "Accepted",
  "Declined",
] as const;

export const REQUIREMENT_CATEGORIES = [
  "Essay",
  "Recommendation",
  "Transcript",
  "Testing",
  "Form",
  "Fee",
  "Portfolio",
  "Interview",
  "Other",
] as const;

export const REQUIREMENT_STATUSES = ["Not started", "In progress", "Done", "Waived"] as const;

export const RECOMMENDER_ROLES = [
  "Teacher",
  "Counselor",
  "Coach",
  "Mentor",
  "Employer",
  "Other",
] as const;

export const RECOMMENDER_STATUSES = [
  "To ask",
  "Requested",
  "Confirmed",
  "Submitted",
  "Thank-you sent",
] as const;

export const DOCUMENT_CATEGORIES = [
  "Transcript",
  "Test Score Report",
  "Essay",
  "Resume",
  "Recommendation",
  "Financial (FAFSA/Tax)",
  "ID / Certificate",
  "Portfolio",
  "Other",
] as const;

export const SIZE_OPTIONS = ["No preference", "Small (< 5k)", "Medium (5k–15k)", "Large (15k+)"] as const;
export const SETTING_OPTIONS = ["No preference", "Urban", "Suburban", "Rural / college town"] as const;
export const DISTANCE_OPTIONS = ["No preference", "Close to home (< 3 hrs)", "In-region", "Anywhere in the U.S."] as const;
export const COST_OPTIONS = ["No preference", "Lowest net price", "Strong merit aid", "Best value / ROI"] as const;
export const SELECTIVITY_OPTIONS = ["Balanced list", "Reach-heavy", "Match-heavy", "Safety-heavy"] as const;
export const REGION_OPTIONS = ["Northeast", "Mid-Atlantic", "South", "Midwest", "Southwest", "West", "Pacific Northwest"] as const;
