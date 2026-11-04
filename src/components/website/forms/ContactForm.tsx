import React, { useState } from "react";
import { z } from "zod";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";

export const ContactFormPropsSchema = z.object({
  eyebrow: z.string().default("Get In Touch"),
  title: z.string().default("Request a Free Inspection & Quote"),
  subtitle: z
    .string()
    .default("Fill out the short form below and our team will get back to you within 15 minutes."),
  buttonLabel: z.string().default("Submit Request"),
  phone: z.string().default("(555) 234-5678"),
  email: z.string().default("info@localbusiness.com"),
  address: z.string().default("123 Main Street, Suite 400, Austin, TX"),
  successMessage: z.string().default("Thank you! Your message has been sent successfully."),
});

export type ContactFormProps = z.infer<typeof ContactFormPropsSchema>;

export const ContactForm: React.FC<ContactFormProps> = ({
  eyebrow,
  title,
  subtitle,
  buttonLabel = "Submit Request",
  phone,
  email,
  address,
  successMessage,
}) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 transition-colors"
      style={{ backgroundColor: "var(--color-section-bg, #FFFFFF)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Contact Details Column */}
          <div className="space-y-3 sm:space-y-5 text-left">
            {eyebrow && (
              <span
                className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase"
                style={{ color: "var(--color-accent, var(--color-primary, #087A55))" }}
              >
                {eyebrow}
              </span>
            )}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words leading-tight"
              style={{
                color: "var(--color-heading, var(--color-text-primary, #172B24))",
                fontFamily: "var(--font-heading, inherit)",
              }}
            >
              {title}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed font-normal">
              {subtitle}
            </p>

            <div className="space-y-3 pt-2 sm:pt-4">
              {phone && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                      color: "var(--color-icon, var(--color-primary, #087A55))",
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Direct Phone</p>
                    <a
                      href={`tel:${phone}`}
                      className="text-sm font-semibold truncate block hover:opacity-80 transition-opacity"
                      style={{ color: "var(--color-link, var(--color-text-primary))" }}
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                      color: "var(--color-icon, var(--color-primary, #087A55))",
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Email Us</p>
                    <a
                      href={`mailto:${email}`}
                      className="text-sm font-semibold truncate block hover:opacity-80 transition-opacity"
                      style={{ color: "var(--color-link, var(--color-text-primary))" }}
                    >
                      {email}
                    </a>
                  </div>
                </div>
              )}

              {address && (
                <div className="flex items-center gap-3 text-text-secondary">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--color-primary-soft, #DDF3E8)",
                      color: "var(--color-icon, var(--color-primary, #087A55))",
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Office Location</p>
                    <p className="text-sm font-semibold text-text-primary break-words">{address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Card (Full width inputs, responsive padding) */}
          <div
            className="p-4 sm:p-6 md:p-8 border shadow-sm w-full min-w-0 transition-colors"
            style={{
              backgroundColor: "var(--color-card-bg, #FFFFFF)",
              borderColor: "var(--color-border, #E1EAE4)",
              borderRadius: "var(--radius-card, 16px)",
              boxShadow: "var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))",
            }}
          >
            {submitted ? (
              <div className="p-5 sm:p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-status-success-soft text-status-success rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-base sm:text-xl font-bold text-text-primary">Request Received!</h3>
                <p className="text-xs sm:text-sm text-text-secondary">{successMessage}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-4 py-2 text-xs font-semibold hover:underline"
                  style={{ color: "var(--color-link, var(--color-primary, #087A55))" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="w-full">
                  <label className="block text-[11px] sm:text-xs font-semibold text-text-primary mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border text-xs sm:text-sm focus:outline-none transition-colors"
                    style={{
                      backgroundColor: "var(--color-input-bg, #FFFFFF)",
                      borderColor: "var(--color-input-border, #E1EAE4)",
                      color: "var(--color-input-text, #172B24)",
                      borderRadius: "var(--radius-input, 8px)",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="w-full">
                    <label className="block text-[11px] sm:text-xs font-semibold text-text-primary mb-1">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="(555) 000-0000"
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border text-xs sm:text-sm focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--color-input-bg, #FFFFFF)",
                        borderColor: "var(--color-input-border, #E1EAE4)",
                        color: "var(--color-input-text, #172B24)",
                        borderRadius: "var(--radius-input, 8px)",
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-[11px] sm:text-xs font-semibold text-text-primary mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border text-xs sm:text-sm focus:outline-none transition-colors"
                      style={{
                        backgroundColor: "var(--color-input-bg, #FFFFFF)",
                        borderColor: "var(--color-input-border, #E1EAE4)",
                        color: "var(--color-input-text, #172B24)",
                        borderRadius: "var(--radius-input, 8px)",
                      }}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-[11px] sm:text-xs font-semibold text-text-primary mb-1">
                    How can we help you? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your issue or requested service..."
                    className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 border text-xs sm:text-sm focus:outline-none resize-none transition-colors"
                    style={{
                      backgroundColor: "var(--color-input-bg, #FFFFFF)",
                      borderColor: "var(--color-input-border, #E1EAE4)",
                      color: "var(--color-input-text, #172B24)",
                      borderRadius: "var(--radius-input, 8px)",
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
                  style={{
                    backgroundColor: "var(--btn-primary-bg, var(--color-primary, #087A55))",
                    color: "var(--btn-primary-text, #FFFFFF)",
                    borderColor: "var(--btn-border, transparent)",
                    borderRadius: "var(--radius-button, 10px)",
                    borderWidth: "var(--btn-border-width, 1px)",
                    borderStyle: "solid",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--btn-hover-bg, var(--color-primary-hover, #066747))";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--btn-primary-bg, var(--color-primary, #087A55))";
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>{buttonLabel}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const contactFormDefinition: ComponentDefinition<ContactFormProps> = {
  id: "contact.form.v1",
  name: "Contact & Quote Request Form",
  category: "forms",
  version: 1,
  schema: ContactFormPropsSchema,
  defaults: ContactFormPropsSchema.parse({}),
  component: ContactForm,
  editor: {
    controls: [
      { propName: "eyebrow", label: "Eyebrow", type: "text" },
      { propName: "title", label: "Title", type: "text" },
      { propName: "subtitle", label: "Subtitle", type: "textarea" },
      { propName: "buttonLabel", label: "Submit Button Text", type: "text" },
      { propName: "phone", label: "Display Phone", type: "text" },
      { propName: "email", label: "Display Email", type: "text" },
      { propName: "address", label: "Display Address", type: "text" },
    ],
  },
};
