import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  callParseBot,
  extractRecords,
  mapScholarship,
  parseBotConfigured,
} from "@/lib/parsebot";

/**
 * Sync real scholarships from the parse.bot Scholarships.com scraper into the
 * `scholarships` catalog. POST body (optional): { action, params }.
 * Requires a signed-in user; writes use the service-role client.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

  if (!parseBotConfigured()) {
    return NextResponse.json(
      { ok: false, error: "PARSE_API_KEY is not set in the environment." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const action: string = body.action || process.env.PARSE_SCHOLARSHIPS_ACTION || "get_scholarships";
  const params: Record<string, string> | undefined = body.params;

  try {
    const payload = await callParseBot(action, params);
    const records = extractRecords(payload);
    const mapped = records
      .map(mapScholarship)
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (mapped.length === 0) {
      return NextResponse.json({
        ok: true,
        added: 0,
        found: 0,
        note: "No scholarship records found for that action — check the action name.",
      });
    }

    // Insert only new names (catalog has no unique constraint on name).
    const admin = createServiceClient();
    const { data: existing } = await admin.from("scholarships").select("name");
    const have = new Set((existing ?? []).map((r: { name: string }) => r.name));
    const fresh = mapped.filter((s) => !have.has(s.name));

    if (fresh.length) {
      const { error } = await admin.from("scholarships").insert(fresh);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, added: fresh.length, found: mapped.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
