import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callParseBot, extractRecords, parseBotConfigured } from "@/lib/parsebot";

/**
 * Inspect a parse.bot action's raw response so we can see the real field names.
 * GET /api/scholarships/preview?action=<name>&<extra params>
 * Requires a signed-in user.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!parseBotConfigured())
    return NextResponse.json({ error: "PARSE_API_KEY is not set." }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "get_scholarship_directory_categories";
  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => {
    if (k !== "action") params[k] = v;
  });

  try {
    const payload = await callParseBot(action, params);
    const records = extractRecords(payload);
    return NextResponse.json({
      action,
      recordCount: records.length,
      sampleKeys: records[0] ? Object.keys(records[0]) : [],
      sample: records.slice(0, 3),
      // Include the raw top-level shape when we couldn't find records.
      rawShape: records.length === 0 ? payload : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
