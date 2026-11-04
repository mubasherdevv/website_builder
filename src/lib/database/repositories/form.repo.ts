import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/database";
import { FormDefinition, FormSubmission, SubmissionStatus } from "@/types/forms";
import { handleDatabaseError, NotFoundError } from "@/lib/database/errors";

export type FormRow = Database["public"]["Tables"]["forms"]["Row"];
export type FormSubmissionRow = Database["public"]["Tables"]["form_submissions"]["Row"];

export class FormRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  // --- FORMS ---

  async getFormsByWebsite(websiteId: string): Promise<FormDefinition[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("forms")
        .select("*")
        .eq("website_id", websiteId)
        .order("created_at", { ascending: false });

      if (error) throw handleDatabaseError(error);
      if (!data) return [];

      return (data as FormRow[]).map((row) => ({
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        type: row.type as FormDefinition["type"],
        status: row.status as FormDefinition["status"],
        fields: (row.fields as unknown as FormDefinition["fields"]) || [],
        settings: (row.settings as unknown as FormDefinition["settings"]) || {},
        submissionsCount: row.submissions_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async getFormById(formId: string): Promise<FormDefinition | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("forms")
        .select("*")
        .eq("id", formId)
        .maybeSingle();

      if (error) throw handleDatabaseError(error);
      if (!data) return null;

      const row = data as FormRow;
      return {
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        type: row.type as FormDefinition["type"],
        status: row.status as FormDefinition["status"],
        fields: (row.fields as unknown as FormDefinition["fields"]) || [],
        settings: (row.settings as unknown as FormDefinition["settings"]) || {},
        submissionsCount: row.submissions_count || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async saveForm(form: FormDefinition): Promise<FormDefinition> {
    try {
      const now = new Date().toISOString();
      const payload = {
        id: form.id,
        website_id: form.websiteId,
        name: form.name,
        type: form.type,
        status: form.status,
        fields: form.fields as unknown as Json,
        settings: form.settings as unknown as Json,
        submissions_count: form.submissionsCount || 0,
        updated_at: now,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("forms")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);

      const row = data as FormRow;
      return {
        id: row.id,
        websiteId: row.website_id,
        name: row.name,
        type: row.type as FormDefinition["type"],
        status: row.status as FormDefinition["status"],
        fields: (row.fields as unknown as FormDefinition["fields"]) || [],
        settings: (row.settings as unknown as FormDefinition["settings"]) || {},
        submissionsCount: row.submissions_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deleteForm(formId: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.client as any).from("forms").delete().eq("id", formId);
      if (error) throw handleDatabaseError(error);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  // --- SUBMISSIONS ---

  async getSubmissionsByWebsite(
    websiteId: string,
    formId?: string
  ): Promise<FormSubmission[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (this.client as any)
        .from("form_submissions")
        .select("*")
        .eq("website_id", websiteId)
        .order("submitted_at", { ascending: false });

      if (formId) {
        query = query.eq("form_id", formId);
      }

      const { data, error } = await query;
      if (error) throw handleDatabaseError(error);
      if (!data) return [];

      return (data as FormSubmissionRow[]).map((row) => ({
        id: row.id,
        formId: row.form_id,
        websiteId: row.website_id,
        formName: row.form_name,
        data: (row.data as unknown as Record<string, unknown>) || {},
        status: row.status as SubmissionStatus,
        submittedAt: row.submitted_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        notes: (row.notes as unknown as FormSubmission["notes"]) || [],
      }));
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async createSubmission(
    websiteId: string,
    formId: string,
    submissionData: Record<string, unknown>,
    meta?: { ip?: string; userAgent?: string; formName?: string }
  ): Promise<FormSubmission> {
    try {
      const form = await this.getFormById(formId);
      const formName = meta?.formName || form?.name || "Website Form";
      const now = new Date().toISOString();
      const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("form_submissions")
        .insert({
          id,
          form_id: formId,
          website_id: websiteId,
          form_name: formName,
          data: submissionData as unknown as Json,
          status: "new",
          submitted_at: now,
          ip_address: meta?.ip || "127.0.0.1",
          user_agent: meta?.userAgent || "Browser Client",
          notes: [] as unknown as Json,
        })
        .select()
        .single();

      if (error) throw handleDatabaseError(error);

      // Increment form submission count if form exists
      if (form) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.client as any)
          .from("forms")
          .update({
            submissions_count: (form.submissionsCount || 0) + 1,
            updated_at: now,
          })
          .eq("id", formId);
      }

      const row = data as FormSubmissionRow;
      return {
        id: row.id,
        formId: row.form_id,
        websiteId: row.website_id,
        formName: row.form_name,
        data: (row.data as unknown as Record<string, unknown>) || {},
        status: row.status as SubmissionStatus,
        submittedAt: row.submitted_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        notes: (row.notes as unknown as FormSubmission["notes"]) || [],
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus
  ): Promise<FormSubmission> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("form_submissions")
        .update({ status })
        .eq("id", submissionId)
        .select()
        .single();

      if (error) throw handleDatabaseError(error);
      if (!data) throw new NotFoundError("FormSubmission", submissionId);

      const row = data as FormSubmissionRow;
      return {
        id: row.id,
        formId: row.form_id,
        websiteId: row.website_id,
        formName: row.form_name,
        data: (row.data as unknown as Record<string, unknown>) || {},
        status: row.status as SubmissionStatus,
        submittedAt: row.submitted_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        notes: (row.notes as unknown as FormSubmission["notes"]) || [],
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async addSubmissionNote(
    submissionId: string,
    author: string,
    content: string
  ): Promise<FormSubmission> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing, error: fetchErr } = await (this.client as any)
        .from("form_submissions")
        .select("*")
        .eq("id", submissionId)
        .single();

      if (fetchErr) throw handleDatabaseError(fetchErr);
      if (!existing) throw new NotFoundError("FormSubmission", submissionId);

      const notes = ((existing.notes as unknown as FormSubmission["notes"]) || []).concat({
        id: `note_${Date.now()}`,
        author,
        content,
        createdAt: new Date().toISOString(),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (this.client as any)
        .from("form_submissions")
        .update({ notes: notes as unknown as Json })
        .eq("id", submissionId)
        .select()
        .single();

      if (error) throw handleDatabaseError(error);

      const row = data as FormSubmissionRow;
      return {
        id: row.id,
        formId: row.form_id,
        websiteId: row.website_id,
        formName: row.form_name,
        data: (row.data as unknown as Record<string, unknown>) || {},
        status: row.status as SubmissionStatus,
        submittedAt: row.submitted_at,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        notes: (row.notes as unknown as FormSubmission["notes"]) || [],
      };
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.client as any)
        .from("form_submissions")
        .delete()
        .eq("id", submissionId);

      if (error) throw handleDatabaseError(error);
    } catch (error) {
      throw handleDatabaseError(error);
    }
  }
}
