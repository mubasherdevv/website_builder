import {
  FormDefinition,
  FormSubmission,
  FormTemplate,
  FormSettings,
  SubmissionStatus,
} from "@/types/forms";

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  design: {
    title: "Get in Touch",
    description: "Fill out the form below and we will get back to you shortly.",
    layout: "stacked",
    fieldSpacing: "normal",
    labelPosition: "top",
    inputVariant: "outlined",
    borderRadius: "md",
    submitButtonText: "Submit",
    submitButtonAlign: "left",
    successMessage: "Thank you! Your submission has been received.",
    redirectUrl: "",
  },
  notifications: {
    emailAlertsEnabled: true,
    recipientEmails: ["admin@example.com"],
    emailSubjectTemplate: "New Form Submission: {{formName}}",
  },
  spam: {
    honeypotEnabled: true,
    rateLimitPerMinute: 5,
  },
};

export const READY_MADE_FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "tpl_contact",
    name: "Contact Form",
    type: "contact",
    description: "Standard inquiry form with Name, Email, Phone, and Message fields.",
    category: "General",
    iconName: "Mail",
    fields: [
      {
        id: "fld_name",
        type: "text",
        name: "fullName",
        label: "Full Name",
        placeholder: "John Doe",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_email",
        type: "email",
        name: "email",
        label: "Email Address",
        placeholder: "john@example.com",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_phone",
        type: "phone",
        name: "phone",
        label: "Phone Number",
        placeholder: "+1 (555) 000-0000",
        required: false,
        width: "full",
      },
      {
        id: "fld_message",
        type: "textarea",
        name: "message",
        label: "Message",
        placeholder: "How can we assist you today?",
        required: true,
        width: "full",
      },
    ],
    defaultSettings: {
      ...DEFAULT_FORM_SETTINGS,
      design: {
        ...DEFAULT_FORM_SETTINGS.design,
        title: "Contact Our Team",
        description: "Have questions? Send us a message and our team will respond within 24 hours.",
        submitButtonText: "Send Message",
      },
    },
  },
  {
    id: "tpl_quote",
    name: "Request a Quote",
    type: "quote",
    description: "Lead generation form with project details, budget range, and timeline selection.",
    category: "Sales",
    iconName: "DollarSign",
    fields: [
      {
        id: "fld_q_name",
        type: "text",
        name: "fullName",
        label: "Full Name",
        placeholder: "Jane Smith",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_q_email",
        type: "email",
        name: "email",
        label: "Work Email",
        placeholder: "jane@company.com",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_q_service",
        type: "select",
        name: "serviceType",
        label: "Service Required",
        required: true,
        width: "1/2",
        options: [
          { label: "Website Design & Development", value: "web-design" },
          { label: "SEO & Growth Marketing", value: "seo" },
          { label: "Branding & Identity", value: "branding" },
          { label: "Custom Software", value: "custom-software" },
        ],
      },
      {
        id: "fld_q_budget",
        type: "select",
        name: "budget",
        label: "Estimated Budget",
        required: true,
        width: "1/2",
        options: [
          { label: "$1,000 - $3,000", value: "1k-3k" },
          { label: "$3,000 - $5,000", value: "3k-5k" },
          { label: "$5,000 - $10,000", value: "5k-10k" },
          { label: "$10,000+", value: "10k-plus" },
        ],
      },
      {
        id: "fld_q_details",
        type: "textarea",
        name: "projectDetails",
        label: "Project Scope & Objectives",
        placeholder: "Please describe your project, goals, and any specific requirements...",
        required: true,
        width: "full",
      },
    ],
    defaultSettings: {
      ...DEFAULT_FORM_SETTINGS,
      design: {
        ...DEFAULT_FORM_SETTINGS.design,
        title: "Request a Free Project Quote",
        description: "Tell us about your project and receive a tailored estimate within 1 business day.",
        submitButtonText: "Request Quote Now",
      },
    },
  },
  {
    id: "tpl_appointment",
    name: "Appointment Request",
    type: "appointment",
    description: "Booking request form with date selector, preferred time, and meeting type.",
    category: "Services",
    iconName: "Calendar",
    fields: [
      {
        id: "fld_a_name",
        type: "text",
        name: "clientName",
        label: "Your Name",
        placeholder: "Alex Johnson",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_a_email",
        type: "email",
        name: "clientEmail",
        label: "Email Address",
        placeholder: "alex@example.com",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_a_date",
        type: "date",
        name: "preferredDate",
        label: "Preferred Date",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_a_time",
        type: "select",
        name: "preferredTime",
        label: "Preferred Time Window",
        required: true,
        width: "1/2",
        options: [
          { label: "Morning (9:00 AM - 12:00 PM)", value: "morning" },
          { label: "Afternoon (1:00 PM - 5:00 PM)", value: "afternoon" },
          { label: "Evening (5:00 PM - 7:00 PM)", value: "evening" },
        ],
      },
      {
        id: "fld_a_notes",
        type: "textarea",
        name: "notes",
        label: "Reason for Appointment",
        placeholder: "Brief description of topics to cover...",
        required: false,
        width: "full",
      },
    ],
    defaultSettings: {
      ...DEFAULT_FORM_SETTINGS,
      design: {
        ...DEFAULT_FORM_SETTINGS.design,
        title: "Book an Appointment",
        description: "Schedule a dedicated consultation session with our experts.",
        submitButtonText: "Confirm Request",
      },
    },
  },
  {
    id: "tpl_newsletter",
    name: "Newsletter Subscription",
    type: "newsletter",
    description: "Compact single-row newsletter subscription with email and name.",
    category: "Marketing",
    iconName: "Send",
    fields: [
      {
        id: "fld_nl_name",
        type: "text",
        name: "name",
        label: "First Name",
        placeholder: "Sarah",
        required: false,
        width: "1/3",
      },
      {
        id: "fld_nl_email",
        type: "email",
        name: "email",
        label: "Email Address",
        placeholder: "sarah@domain.com",
        required: true,
        width: "2/3",
      },
    ],
    defaultSettings: {
      ...DEFAULT_FORM_SETTINGS,
      design: {
        ...DEFAULT_FORM_SETTINGS.design,
        title: "Subscribe to Our Insights",
        description: "Get monthly product updates, case studies, and engineering strategies straight to your inbox.",
        submitButtonText: "Subscribe",
        layout: "inline",
      },
    },
  },
  {
    id: "tpl_feedback",
    name: "Customer Feedback",
    type: "feedback",
    description: "Collect user satisfaction ratings, suggestions, and testimonial consent.",
    category: "Customer Experience",
    iconName: "MessageSquare",
    fields: [
      {
        id: "fld_fb_name",
        type: "text",
        name: "customerName",
        label: "Your Name",
        placeholder: "Michael Brown",
        required: true,
        width: "1/2",
      },
      {
        id: "fld_fb_rating",
        type: "radio",
        name: "satisfactionRating",
        label: "How would you rate your overall experience?",
        required: true,
        width: "full",
        options: [
          { label: "⭐ Excellent (5/5)", value: "5" },
          { label: "👍 Good (4/5)", value: "4" },
          { label: "😐 Average (3/5)", value: "3" },
          { label: "👎 Needs Improvement (1-2/5)", value: "2" },
        ],
      },
      {
        id: "fld_fb_comment",
        type: "textarea",
        name: "feedbackText",
        label: "What did you like most, or what could we improve?",
        placeholder: "Share your thoughts here...",
        required: true,
        width: "full",
      },
      {
        id: "fld_fb_consent",
        type: "checkbox",
        name: "allowPublish",
        label: "Permission to feature this feedback anonymously on our website",
        required: false,
        width: "full",
      },
    ],
    defaultSettings: {
      ...DEFAULT_FORM_SETTINGS,
      design: {
        ...DEFAULT_FORM_SETTINGS.design,
        title: "We Value Your Feedback",
        description: "Help us refine our service by sharing your candid thoughts.",
        submitButtonText: "Send Feedback",
      },
    },
  },
];

const STORAGE_FORMS_KEY_PREFIX = "securesite_forms_";
const STORAGE_SUBMISSIONS_KEY_PREFIX = "securesite_submissions_";

export class FormsManagerService {
  private static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- FORMS CRUD ---

  public static getForms(websiteId: string): FormDefinition[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(`${STORAGE_FORMS_KEY_PREFIX}${websiteId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to load forms from storage:", e);
    }

    // Default Seed Form if none exist
    const seedForm: FormDefinition = {
      id: "form_default_contact",
      websiteId,
      name: "General Contact Form",
      type: "contact",
      status: "active",
      fields: READY_MADE_FORM_TEMPLATES[0].fields,
      settings: READY_MADE_FORM_TEMPLATES[0].defaultSettings,
      submissionsCount: 2,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialForms = [seedForm];
    this.saveForms(websiteId, initialForms);
    this.seedInitialSubmissions(websiteId, seedForm.id);
    return initialForms;
  }

  public static getFormById(websiteId: string, formId: string): FormDefinition | null {
    const forms = this.getForms(websiteId);
    return forms.find((f) => f.id === formId) || null;
  }

  public static saveForms(websiteId: string, forms: FormDefinition[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(`${STORAGE_FORMS_KEY_PREFIX}${websiteId}`, JSON.stringify(forms));
    } catch (e) {
      console.error("Failed to save forms to storage:", e);
    }
  }

  public static saveForm(websiteId: string, form: FormDefinition): FormDefinition {
    const forms = this.getForms(websiteId);
    const index = forms.findIndex((f) => f.id === form.id);
    const updatedForm = {
      ...form,
      websiteId,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      forms[index] = updatedForm;
    } else {
      forms.unshift(updatedForm);
    }

    this.saveForms(websiteId, forms);
    return updatedForm;
  }

  public static duplicateForm(websiteId: string, formId: string): FormDefinition | null {
    const existing = this.getFormById(websiteId, formId);
    if (!existing) return null;

    const duplicated: FormDefinition = {
      ...existing,
      id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${existing.name} (Copy)`,
      status: "draft",
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveForm(websiteId, duplicated);
  }

  public static toggleFormStatus(websiteId: string, formId: string): FormDefinition | null {
    const form = this.getFormById(websiteId, formId);
    if (!form) return null;

    const newStatus = form.status === "active" ? "inactive" : "active";
    form.status = newStatus;
    return this.saveForm(websiteId, form);
  }

  public static deleteForm(websiteId: string, formId: string): boolean {
    const forms = this.getForms(websiteId);
    const filtered = forms.filter((f) => f.id !== formId);
    if (filtered.length === forms.length) return false;
    this.saveForms(websiteId, filtered);
    return true;
  }

  public static createFromTemplate(
    websiteId: string,
    templateId: string,
    customName?: string
  ): FormDefinition {
    const template =
      READY_MADE_FORM_TEMPLATES.find((t) => t.id === templateId) || READY_MADE_FORM_TEMPLATES[0];

    const newForm: FormDefinition = {
      id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      websiteId,
      name: customName || template.name,
      type: template.type,
      status: "active",
      fields: JSON.parse(JSON.stringify(template.fields)),
      settings: JSON.parse(JSON.stringify(template.defaultSettings)),
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveForm(websiteId, newForm);
  }

  // --- SUBMISSIONS CRUD ---

  public static getSubmissions(websiteId: string, formId?: string): FormSubmission[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(`${STORAGE_SUBMISSIONS_KEY_PREFIX}${websiteId}`);
      if (data) {
        const parsed: FormSubmission[] = JSON.parse(data);
        if (formId) {
          return parsed.filter((s) => s.formId === formId);
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    }
    return [];
  }

  public static saveSubmissions(websiteId: string, submissions: FormSubmission[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(
        `${STORAGE_SUBMISSIONS_KEY_PREFIX}${websiteId}`,
        JSON.stringify(submissions)
      );
    } catch (e) {
      console.error("Failed to save submissions:", e);
    }
  }

  public static addSubmission(
    websiteId: string,
    formId: string,
    data: Record<string, unknown>,
    meta?: { ip?: string; userAgent?: string }
  ): FormSubmission {
    const forms = this.getForms(websiteId);
    const form = forms.find((f) => f.id === formId);
    const formName = form ? form.name : "Website Form";

    const submission: FormSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      formId,
      websiteId,
      formName,
      data,
      status: "new",
      submittedAt: new Date().toISOString(),
      ipAddress: meta?.ip || "127.0.0.1",
      userAgent: meta?.userAgent || "Browser Client",
      notes: [],
    };

    const allSubmissions = this.getSubmissions(websiteId);
    allSubmissions.unshift(submission);
    this.saveSubmissions(websiteId, allSubmissions);

    // Update submissions count on the form
    if (form) {
      form.submissionsCount = (form.submissionsCount || 0) + 1;
      this.saveForm(websiteId, form);
    }

    return submission;
  }

  public static updateSubmissionStatus(
    websiteId: string,
    submissionId: string,
    status: SubmissionStatus
  ): FormSubmission | null {
    const submissions = this.getSubmissions(websiteId);
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return null;

    sub.status = status;
    this.saveSubmissions(websiteId, submissions);
    return sub;
  }

  public static addSubmissionNote(
    websiteId: string,
    submissionId: string,
    author: string,
    content: string
  ): FormSubmission | null {
    const submissions = this.getSubmissions(websiteId);
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return null;

    if (!sub.notes) sub.notes = [];
    sub.notes.push({
      id: `note_${Date.now()}`,
      author,
      content,
      createdAt: new Date().toISOString(),
    });

    this.saveSubmissions(websiteId, submissions);
    return sub;
  }

  public static deleteSubmission(websiteId: string, submissionId: string): boolean {
    const submissions = this.getSubmissions(websiteId);
    const target = submissions.find((s) => s.id === submissionId);
    const filtered = submissions.filter((s) => s.id !== submissionId);
    if (filtered.length === submissions.length) return false;

    this.saveSubmissions(websiteId, filtered);

    // Decrement form counter if possible
    if (target) {
      const form = this.getFormById(websiteId, target.formId);
      if (form && form.submissionsCount > 0) {
        form.submissionsCount -= 1;
        this.saveForm(websiteId, form);
      }
    }

    return true;
  }

  // --- EXPORT TO CSV ---

  public static exportSubmissionsCsv(websiteId: string, formId?: string): string {
    const submissions = this.getSubmissions(websiteId, formId);
    if (submissions.length === 0) return "";

    // Collect all unique data keys
    const dataKeySet = new Set<string>();
    submissions.forEach((s) => {
      Object.keys(s.data || {}).forEach((k) => dataKeySet.add(k));
    });
    const dataKeys = Array.from(dataKeySet);

    const headers = [
      "Submission ID",
      "Form Name",
      "Status",
      "Submitted At",
      ...dataKeys,
      "Notes Count",
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = submissions.map((sub) => {
      const fieldValues = dataKeys.map((key) => escapeCsv(sub.data[key]));
      return [
        escapeCsv(sub.id),
        escapeCsv(sub.formName),
        escapeCsv(sub.status),
        escapeCsv(sub.submittedAt),
        ...fieldValues,
        escapeCsv(sub.notes?.length || 0),
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  // --- SEED INITIAL DATA ---

  private static seedInitialSubmissions(websiteId: string, formId: string) {
    if (!this.isBrowser()) return;
    const existing = localStorage.getItem(`${STORAGE_SUBMISSIONS_KEY_PREFIX}${websiteId}`);
    if (existing) return;

    const mockSubmissions: FormSubmission[] = [
      {
        id: `sub_${Date.now() - 1200000}`,
        formId,
        websiteId,
        formName: "General Contact Form",
        data: {
          fullName: "Sarah Jenkins",
          email: "sarah.j@techcorp.io",
          phone: "+1 (512) 555-8901",
          message:
            "Hi, we are interested in migrating our company landing pages to your platform. Can we book a brief 15-minute call?",
        },
        status: "new",
        submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        ipAddress: "192.168.1.104",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        notes: [
          {
            id: "note_1",
            author: "System",
            content: "Auto-verified: no spam flags triggered.",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ],
      },
      {
        id: `sub_${Date.now() - 86400000}`,
        formId,
        websiteId,
        formName: "General Contact Form",
        data: {
          fullName: "Marcus Vance",
          email: "marcus@vancecapital.com",
          phone: "+1 (415) 302-9911",
          message:
            "Looking for enterprise pricing and custom subdomain configuration details.",
        },
        status: "read",
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        ipAddress: "10.0.0.45",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        notes: [
          {
            id: "note_2",
            author: "Support Lead",
            content: "Sent preliminary pricing sheet via email.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
    ];

    this.saveSubmissions(websiteId, mockSubmissions);
  }
}
