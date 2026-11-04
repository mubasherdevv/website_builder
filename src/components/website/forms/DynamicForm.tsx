"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import { FormDefinition } from "@/types/forms";
import { FormsManagerService } from "@/lib/services/forms-manager.service";

export const DynamicFormPropsSchema = z.object({
  formId: z.string().default("form_default_contact"),
  websiteId: z.string().optional(),
  titleOverride: z.string().optional(),
  descriptionOverride: z.string().optional(),
});

export type DynamicFormProps = z.infer<typeof DynamicFormPropsSchema>;

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formId = "form_default_contact",
  websiteId = "default",
  titleOverride,
  descriptionOverride,
}) => {
  const [formDef, setFormDef] = useState<FormDefinition | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = FormsManagerService.getFormById(websiteId, formId);
    if (loaded) {
      setFormDef(loaded);
    } else {
      // Fallback: load first available form
      const all = FormsManagerService.getForms(websiteId);
      if (all.length > 0) {
        setFormDef(all[0]);
      }
    }
  }, [formId, websiteId]);

  if (!formDef) {
    return (
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto p-8 rounded-2xl border border-dashed border-border text-center text-text-muted">
          Loading form configuration...
        </div>
      </section>
    );
  }

  const { fields, settings } = formDef;
  const design = settings?.design || {
    title: "Get in Touch",
    submitButtonText: "Submit",
    submitButtonAlign: "left",
    successMessage: "Thank you! Your submission has been received.",
  };

  const handleInputChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      // 1. Local Persistence
      FormsManagerService.addSubmission(websiteId, formDef.id, formData);

      // 2. Call Public Submission API endpoint
      const res = await fetch(`/api/forms/${formDef.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          websiteId,
          formName: formDef.name,
          _hp: honeypot, // Honeypot trap
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit form");
      }

      setSubmitted(true);

      // 3. Handle optional redirect URL
      if (design.redirectUrl && design.redirectUrl.startsWith("http")) {
        setTimeout(() => {
          window.location.href = design.redirectUrl!;
        }, 1500);
      }
    } catch (err: unknown) {
      console.warn("Backend API warning (using local persistence fallback):", err);
      // Still show success since local record is preserved
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const title = titleOverride || design.title;
  const description = descriptionOverride || design.description;

  return (
    <section
      id="custom-form"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 transition-colors"
      style={{ backgroundColor: "var(--color-section-bg, transparent)" }}
    >
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-10">
        {submitted ? (
          <div className="text-center py-10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-status-success-soft text-status-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary">
              Submission Received
            </h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              {design.successMessage || "Thank you! Your information has been submitted successfully."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({});
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors"
            >
              Submit another response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{
                  color: "var(--color-heading, var(--color-text-primary, #111827))",
                  fontFamily: "var(--font-heading, inherit)",
                }}
              >
                {title}
              </h2>
              {description && (
                <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Invisible Honeypot Anti-Spam field */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="_website_hp">Leave this field blank</label>
              <input
                id="_website_hp"
                type="text"
                name="_website_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg border border-status-danger/30 bg-status-danger-soft text-status-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Dynamic Fields Grid */}
            <div className="flex flex-wrap gap-4">
              {fields.map((fld) => {
                const widthClass =
                  fld.width === "1/2"
                    ? "w-full sm:w-[calc(50%-0.5rem)]"
                    : fld.width === "1/3"
                    ? "w-full sm:w-[calc(33.333%-0.7rem)]"
                    : fld.width === "2/3"
                    ? "w-full sm:w-[calc(66.666%-0.4rem)]"
                    : "w-full";

                return (
                  <div key={fld.id} className={widthClass}>
                    <label
                      htmlFor={fld.name}
                      className="block text-xs font-bold text-text-primary mb-1.5"
                    >
                      {fld.label}
                      {fld.required && <span className="text-status-danger ml-0.5">*</span>}
                    </label>

                    {fld.type === "textarea" ? (
                      <textarea
                        id={fld.name}
                        name={fld.name}
                        required={fld.required}
                        rows={4}
                        placeholder={fld.placeholder}
                        value={formData[fld.name] || ""}
                        onChange={(e) => handleInputChange(fld.name, e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    ) : fld.type === "select" ? (
                      <select
                        id={fld.name}
                        name={fld.name}
                        required={fld.required}
                        value={formData[fld.name] || ""}
                        onChange={(e) => handleInputChange(fld.name, e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                      >
                        <option value="">{fld.placeholder || "Please select..."}</option>
                        {fld.options?.map((opt, i) => (
                          <option key={i} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : fld.type === "radio" ? (
                      <div className="space-y-2 pt-1">
                        {fld.options?.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={fld.name}
                              value={opt.value}
                              checked={formData[fld.name] === opt.value}
                              onChange={(e) => handleInputChange(fld.name, e.target.value)}
                              required={fld.required}
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : fld.type === "checkbox" ? (
                      <div className="space-y-2 pt-1">
                        {fld.options && fld.options.length > 0 ? (
                          fld.options.map((opt, i) => {
                            const current = Array.isArray(formData[fld.name])
                              ? formData[fld.name]
                              : [];
                            return (
                              <label
                                key={i}
                                className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={current.includes(opt.value)}
                                  onChange={(e) => {
                                    const next = e.target.checked
                                      ? [...current, opt.value]
                                      : current.filter((v: string) => v !== opt.value);
                                    handleInputChange(fld.name, next);
                                  }}
                                />
                                <span>{opt.label}</span>
                              </label>
                            );
                          })
                        ) : (
                          <label className="flex items-center gap-2.5 text-xs text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(formData[fld.name])}
                              onChange={(e) => handleInputChange(fld.name, e.target.checked)}
                              required={fld.required}
                            />
                            <span>{fld.label}</span>
                          </label>
                        )}
                      </div>
                    ) : (
                      <input
                        id={fld.name}
                        name={fld.name}
                        type={
                          fld.type === "email"
                            ? "email"
                            : fld.type === "phone"
                            ? "tel"
                            : fld.type === "number"
                            ? "number"
                            : fld.type === "date"
                            ? "date"
                            : "text"
                        }
                        required={fld.required}
                        placeholder={fld.placeholder}
                        value={formData[fld.name] || ""}
                        onChange={(e) => handleInputChange(fld.name, e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    )}

                    {fld.helpText && (
                      <span className="block text-[10px] text-text-muted mt-1">{fld.helpText}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Action */}
            <div
              className={`pt-2 flex ${
                design.submitButtonAlign === "center"
                  ? "justify-center"
                  : design.submitButtonAlign === "right"
                  ? "justify-end"
                  : design.submitButtonAlign === "full"
                  ? "w-full"
                  : "justify-start"
              }`}
            >
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 rounded-lg text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                  design.submitButtonAlign === "full" ? "w-full" : ""
                } disabled:opacity-50`}
                style={{
                  backgroundColor: "var(--color-primary, #0B1310)",
                }}
              >
                <span>{submitting ? "Submitting..." : design.submitButtonText || "Submit"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export const dynamicFormDefinition: ComponentDefinition<DynamicFormProps> = {
  id: "form.container.v1",
  name: "Interactive Form Container",
  category: "forms",
  version: 1,
  description: "Render any custom or templated form with instant lead collection and honeypot protection.",
  schema: DynamicFormPropsSchema,
  defaults: {
    formId: "form_default_contact",
    websiteId: "default",
    titleOverride: "",
    descriptionOverride: "",
  },
  editor: {
    controls: [
      {
        propName: "formId",
        label: "Select Saved Form",
        type: "select",
        options: [
          { label: "General Contact Form", value: "form_default_contact" },
          { label: "Request a Quote", value: "form_quote" },
          { label: "Appointment Booking", value: "form_appointment" },
          { label: "Newsletter Subscription", value: "form_newsletter" },
        ],
      },
      {
        propName: "titleOverride",
        label: "Title Override (Optional)",
        type: "text",
      },
      {
        propName: "descriptionOverride",
        label: "Description Override (Optional)",
        type: "textarea",
      },
    ],
  },
  component: DynamicForm,
};

export default DynamicForm;
