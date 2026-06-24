/** Shared UI color maps ported from the prototype. */

/** Category/tag chip → [bg, fg]. */
export function chipColors(cat: string): [string, string] {
  const m: Record<string, [string, string]> = {
    Leadership: ["#fef0e7", "#c2410c"],
    STEM: ["#eaf1fe", "#2563bd"],
    Service: ["#eafaf1", "#1b9e5f"],
    Research: ["#f3eefe", "#7c3aed"],
    Academics: ["#eaf1fe", "#2563bd"],
    Essay: ["#eef0fc", "#4f46e5"],
    Activity: ["#fef0e7", "#c2410c"],
    Academic: ["#eaf1fe", "#2563bd"],
    College: ["#eafaf1", "#1b9e5f"],
  };
  return m[cat] || ["#f3f2ee", "#5b6068"];
}

/** Recommendation icon → [tintBg, tintFg]. */
export function recTint(icon: string): [string, string] {
  const m: Record<string, [string, string]> = {
    flask: ["#f3eefe", "#7c3aed"],
    bolt: ["#fef0e7", "#c2410c"],
    book: ["#eaf1fe", "#2563bd"],
    heart: ["#eafaf1", "#1b9e5f"],
    scholarships: ["#f3eefe", "#7c3aed"],
    essays: ["#eef0fc", "#4f46e5"],
    target: ["#eef0fc", "#4f46e5"],
  };
  return m[icon] || m.target;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Format a yyyy-mm-dd date into { mon, day, in } relative to `today`. */
export function formatDeadline(due: string, today = new Date()) {
  const d = new Date(due + "T00:00:00");
  const mon = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  const inLabel =
    days < 0 ? "past due" : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return { mon, day, in: inLabel, days };
}
