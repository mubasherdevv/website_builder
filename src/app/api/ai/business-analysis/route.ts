import { NextResponse } from "next/server";
import { runBusinessAnalysis } from "@/lib/ai/business-analysis-adapter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { basicInfo, locationStrategy, providerId } = body;

    if (!basicInfo) {
      return NextResponse.json(
        { success: false, error: "basicInfo is required" },
        { status: 400 }
      );
    }

    const result = await runBusinessAnalysis(
      basicInfo,
      locationStrategy || "neighborhoods",
      { providerId: providerId || undefined }
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("AI Business Analysis API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}

