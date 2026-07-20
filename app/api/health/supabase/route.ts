import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        ok: false,
        env: false,
        database: false,
        message: "Missing Supabase environment variables.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const tables = ["homes", "rooms", "expenses", "appliances", "documents", "timeline_events"];
  const checks = await Promise.all(
    tables.map(async (table) => {
      const { error } = await supabase.from(table).select("id").limit(1);
      return { table, error };
    }),
  );
  const failed = checks.find((check) => check.error);

  if (failed) {
    return NextResponse.json(
      {
        ok: false,
        env: true,
        database: false,
        table: failed.table,
        message: failed.error?.message,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    env: true,
    database: true,
    tables,
    message: "Supabase is connected and Phase 1 tables are reachable.",
  });
}
