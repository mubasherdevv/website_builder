import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = performance.now();

  try {
    const admin = createAdminClient();

    // Perform a lightweight ping query
    const { data: pingData, error: pingError } = await admin
      .from("websites")
      .select("id")
      .limit(1);

    const latency = Math.round(performance.now() - start);

    if (pingError) {
      // If table doesn't exist yet in Supabase schema cache
      if (pingError.code === "PGRST205") {
        return NextResponse.json(
          {
            status: "pending_migration",
            connected: true,
            latencyMs: latency,
            message: "Supabase connection verified, but database migration 001_initial_schema.sql has not been executed yet.",
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          status: "unhealthy",
          connected: false,
          latencyMs: latency,
          error: pingError.message,
          code: pingError.code,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "healthy",
        connected: true,
        latencyMs: latency,
        sampleCount: pingData ? pingData.length : 0,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const latency = Math.round(performance.now() - start);
    return NextResponse.json(
      {
        status: "error",
        connected: false,
        latencyMs: latency,
        error: error instanceof Error ? error.message : "Unknown connection error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

