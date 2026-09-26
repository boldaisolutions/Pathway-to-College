import "server-only";

/**
 * parse.bot Scholarships.com scraper client.
 * Base: https://api.parse.bot/scraper/<scraperId>/<action>
 * Auth: X-API-Key header. Requires API-Snapshot-Version header.
 *
 * Configure with env vars (set in Vercel):
 *   PARSE_API_KEY               – your parse.bot API key (server-only secret)
 *   PARSE_SCRAPER_ID            – defaults to the Scholarships.com scraper id
 *   PARSE_SNAPSHOT_VERSION      – defaults to "5"
 */

const SCRAPER_ID =
  process.env.PARSE_SCRAPER_ID || "e39726f8-b69f-440d-a6f6-d53c1a3e549b";
const SNAPSHOT = process.env.PARSE_SNAPSHOT_VERSION || "5";

export function parseBotConfigured(): boolean {
  return Boolean(process.env.PARSE_API_KEY);
}

/** Call a named scraper action (GET) with optional query params. */
export async function callParseBot(
  action: string,
  params?: Record<string, string | number | undefined>,
): Promise<unknown> {
  const key = process.env.PARSE_API_KEY;
  if (!key) throw new Error("PARSE_API_KEY is not set.");

  const url = new URL(`https://api.parse.bot/scraper/${SCRAPER_ID}/${action}`);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "X-API-Key": key,
      "API-Snapshot-Version": SNAPSHOT,
      Accept: "application/json",
    },
    // parse.bot scraping can be slow; give it room.
    signal: AbortSignal.timeout(60_000),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`parse.bot ${action} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`parse.bot ${action} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

/** A scholarship mapped to our `scholarships` table shape. */
export type MappedScholarship = {
  name: string;
  amount: string;
  deadline: string | null; // yyyy-mm-dd
  tags: string[];
  url: string;
};

const pick = (o: Record<string, unknown>, keys: string[]): string => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return "";
};

function toDate(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

/**
 * Best-effort mapping — the exact field names from Scholarships.com vary, so we
 * accept several common spellings for each column.
 */
export function mapScholarship(raw: Record<string, unknown>): MappedScholarship | null {
  const name = pick(raw, ["name", "title", "scholarship_name", "scholarship", "award_name"]);
  if (!name) return null;
  const amount = pick(raw, ["amount", "award_amount", "award", "value", "prize", "amount_text"]) || "Varies";
  const deadline = toDate(pick(raw, ["deadline", "due_date", "deadline_date", "date", "close_date"]));
  const url = pick(raw, ["url", "link", "apply_url", "href", "detail_url", "source_url"]);
  const tagSource = pick(raw, ["category", "categories", "eligibility", "type", "tags", "field"]);
  const tags = tagSource
    ? tagSource.split(/[,;|]/).map((t) => t.trim()).filter(Boolean).slice(0, 4)
    : [];
  return { name, amount, deadline, tags, url };
}

/**
 * Find the array of scholarship-like records anywhere in a parse.bot response
 * (responses may wrap the list under different keys).
 */
export function extractRecords(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload.filter((x) => x && typeof x === "object");
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    // Common wrapper keys first.
    for (const k of ["scholarships", "data", "results", "items", "records", "rows"]) {
      if (Array.isArray(obj[k])) return (obj[k] as unknown[]).filter((x) => x && typeof x === "object") as Record<string, unknown>[];
    }
    // Otherwise, the first array-of-objects we find.
    for (const v of Object.values(obj)) {
      if (Array.isArray(v) && v.length && typeof v[0] === "object") {
        return v.filter((x) => x && typeof x === "object") as Record<string, unknown>[];
      }
    }
  }
  return [];
}
