export type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "number"
  | "hidden";

export type FieldWidth = "full" | "1/2" | "1/3" | "2/3";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customError?: string;
  allowedFileTypes?: string[];
  maxFileSizeMb?: number;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean | string[];
  required: boolean;
  width: FieldWidth;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
}

export interface FormDesignSettings {
  title: string;
  description?: string;
  layout: "stacked" | "inline";
  fieldSpacing: "tight" | "normal" | "relaxed";
  labelPosition: "top" | "left" | "floating";
  inputVariant: "outlined" | "filled" | "underlined";
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  submitButtonText: string;
  submitButtonAlign: "left" | "center" | "right" | "full";
  submitButtonColor?: string;
  submitButtonTextColor?: string;
  successMessage: string;
  redirectUrl?: string;
}

export interface FormNotificationSettings {
  emailAlertsEnabled: boolean;
  recipientEmails: string[];
  emailSubjectTemplate?: string;
  replyToFieldId?: string;
}

export interface FormSpamSettings {
  honeypotEnabled: boolean;
  rateLimitPerMinute: number;
}

export interface FormSettings {
  design: FormDesignSettings;
  notifications: FormNotificationSettings;
  spam: FormSpamSettings;
}

export type FormStatus = "active" | "inactive" | "draft";

export interface FormDefinition {
  id: string;
  websiteId: string;
  name: string;
  type: "contact" | "quote" | "appointment" | "newsletter" | "feedback" | "custom";
  status: FormStatus;
  fields: FormField[];
  settings: FormSettings;
  submissionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = "new" | "read" | "replied" | "archived";

export interface FormSubmissionNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  websiteId: string;
  formName: string;
  data: Record<string, unknown>;
  status: SubmissionStatus;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  notes: FormSubmissionNote[];
}

export interface FormTemplate {
  id: string;
  name: string;
  type: FormDefinition["type"];
  description: string;
  category: string;
  iconName: string;
  fields: FormField[];
  defaultSettings: FormSettings;
}
