import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FormRepository } from "@/lib/database/repositories/form.repo";

export async function GET(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const websiteId = params.websiteId;
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("formId") || undefined;

    const client = await createServerSupabaseClient();
    const repo = new FormRepository(client);

    const submissions = await repo.getSubmissionsByWebsite(websiteId, formId);
    return NextResponse.json({ success: true, submissions });
  } catch (error: unknown) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, status, note, author } = body;

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const client = await createServerSupabaseClient();
    const repo = new FormRepository(client);

    let updated;
    if (status) {
      updated = await repo.updateSubmissionStatus(submissionId, status);
    }
    if (note) {
      updated = await repo.addSubmissionNote(
        submissionId,
        author || "Team Member",
        note
      );
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: unknown) {
    console.error("Failed to update submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("id");

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const client = await createServerSupabaseClient();
    const repo = new FormRepository(client);

    await repo.deleteSubmission(submissionId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to delete submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
