import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FormRepository } from "@/lib/database/repositories/form.repo";

// Simple in-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    if (!formId) {
      return NextResponse.json(
        { success: false, error: "Form ID is required" },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Browser Client";

    // Rate Limiting Check: Max 10 requests per minute per IP
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < 60000);
    if (validTimestamps.length >= 10) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please wait a moment." },
        { status: 429 }
      );
    }
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);

    const body = await request.json();
    const { _hp, websiteId: providedWebsiteId, formName, ...formData } = body;

    // Honeypot bot protection: If honeypot field has any value, silently discard
    if (_hp && String(_hp).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: "Submission received successfully",
      });
    }

    // Basic Validation: Ensure at least one data key exists
    if (!formData || Object.keys(formData).length === 0) {
      return NextResponse.json(
        { success: false, error: "Submission data cannot be empty" },
        { status: 400 }
      );
    }

    // Connect to Supabase using Admin client for public website submissions
    const adminClient = createAdminClient();
    const repo = new FormRepository(adminClient);

    // Resolve websiteId if not directly provided
    let websiteId = providedWebsiteId;
    if (!websiteId) {
      const existingForm = await repo.getFormById(formId);
      websiteId = existingForm?.websiteId || "my-site-1";
    }

    // Insert into database
    const submission = await repo.createSubmission(
      websiteId,
      formId,
      formData,
      { ip, userAgent, formName }
    );

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      formId,
      websiteId,
      message: "Form submitted successfully",
      submittedAt: submission.submittedAt,
      data: submission.data,
    });
  } catch (error: unknown) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process form submission" },
      { status: 500 }
    );
  }
}
