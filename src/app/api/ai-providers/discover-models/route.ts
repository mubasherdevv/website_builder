import { NextResponse } from "next/server";
import { getProviderInstance } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider_type, api_key, base_url } = body;

    if (!provider_type || !api_key) {
      return NextResponse.json(
        { success: false, error: "provider_type and api_key are required" },
        { status: 400 }
      );
    }

    const adapter = getProviderInstance(provider_type);
    const models = await adapter.listModels(api_key.trim(), base_url);

    return NextResponse.json({ success: true, models });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch models" },
      { status: 500 }
    );
  }
}

