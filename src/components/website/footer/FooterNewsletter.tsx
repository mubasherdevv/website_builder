"use client";

import React, { FormEvent, useId, useState } from "react";
import { z } from "zod";
import { Loader2, Mail, Send } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import {
  footerLinkSchema,
  footerSocialLinksFields,
  optionalFetchEndpointSchema,
  optionalFooterUrlSchema,
} from "./shared/footer.types";
import { isSafeFetchEndpoint } from "./shared/footer-url";
import { FooterBrand } from "./shared/FooterBrand";
import { FooterContactList } from "./shared/FooterContactList";
import { FooterLinkGroup } from "./shared/FooterLinkGroup";
import { FooterLegalBar } from "./shared/FooterLegalBar";
import { FooterSocialLinks } from "./shared/FooterSocialLinks";

export const FooterNewsletterPropsSchema = z.object({
  brandName: z.string().trim().min(1).max(80).default("Acme Business"),
  logoUrl: optionalFooterUrlSchema.optional(),
  description: z
    .string()
    .trim()
    .min(1)
    .max(280)
    .default("Useful ideas, project inspiration and practical business guidance—delivered occasionally."),
  newsletterHeading: z.string().trim().min(1).max(120).default("Get practical updates in your inbox"),
  newsletterDescription: z
    .string()
    .trim()
    .max(240)
    .default("One thoughtful email when there is something genuinely useful to share. No spam."),
  emailPlaceholder: z.string().trim().max(80).default("you@example.com"),
  buttonLabel: z.string().trim().min(1).max(40).default("Subscribe"),
  consentText: z
    .string()
    .trim()
    .max(220)
    .default("By subscribing, you agree to receive occasional updates. You can unsubscribe at any time."),
  newsletterEndpoint: optionalFetchEndpointSchema,
  successMessage: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .default("Thanks—you’re subscribed."),
  servicesHeading: z.string().trim().min(1).max(80).default("Explore"),
  servicesLinks: z
    .array(footerLinkSchema)
    .max(10)
    .default([
      { label: "Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ]),
  companyHeading: z.string().trim().min(1).max(80).default("Company"),
  companyLinks: z
    .array(footerLinkSchema)
    .max(10)
    .default([
      { label: "About", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy", href: "/privacy" },
    ]),
  phone: z.string().trim().max(60).default("+1 (555) 123-4567"),
  email: z.string().trim().email().max(254).default("hello@acme.test"),
  address: z.string().trim().max(300).default("100 Main Street, Springfield"),
  copyright: z.string().trim().min(1).max(180).default("© 2026 Acme Business. All rights reserved."),
  legalLinks: z
    .array(footerLinkSchema)
    .max(6)
    .default([
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ]),
  ...footerSocialLinksFields,
});

export type FooterNewsletterProps = z.infer<typeof FooterNewsletterPropsSchema>;

type NewsletterStatus =
  | { type: "idle" }
  | { type: "invalid"; message: string }
  | { type: "unavailable"; message: string }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const FooterNewsletter: React.FC<FooterNewsletterProps> = ({
  brandName,
  logoUrl,
  description,
  newsletterHeading,
  newsletterDescription,
  emailPlaceholder,
  buttonLabel,
  consentText,
  newsletterEndpoint,
  successMessage,
  servicesHeading,
  servicesLinks = [],
  companyHeading,
  companyLinks = [],
  phone,
  email,
  address,
  copyright,
  legalLinks = [],
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  youtubeUrl,
}) => {
  const [emailValue, setEmailValue] = useState("");
  const [status, setStatus] = useState<NewsletterStatus>({ type: "idle" });
  const emailInputId = useId();
  const statusId = useId();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = emailValue.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setStatus({ type: "invalid", message: "Enter a valid email address." });
      return;
    }

    if (!isSafeFetchEndpoint(newsletterEndpoint)) {
      setStatus({
        type: "unavailable",
        message: "Newsletter signup is not connected yet. Add a secure newsletter endpoint in the footer settings.",
      });
      return;
    }

    setStatus({ type: "submitting" });

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(newsletterEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
        credentials: "omit",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Newsletter request failed with status ${response.status}`);
      }

      setEmailValue("");
      setStatus({ type: "success", message: successMessage });
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      setStatus({
        type: "error",
        message: aborted
          ? "The request timed out. Please try again."
          : "We could not save your subscription. Please try again shortly.",
      });
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const isSubmitting = status.type === "submitting";
  const statusTone =
    status.type === "success"
      ? "text-[var(--color-success-soft,#DDF3E8)]"
      : status.type === "idle" || status.type === "submitting"
        ? "text-[var(--color-footer-muted,#C9E3D7)]"
        : "text-[#FFD9D9]";

  return (
    <footer
      className="w-full border-t border-[var(--color-footer-border,rgba(255,255,255,0.18))] bg-[var(--color-footer-bg,#063B2E)] text-[var(--color-footer-fg,#F4FBF7)]"
      aria-labelledby="footer-newsletter-newsletter"
    >
      <div className="border-b border-[var(--color-footer-border,rgba(255,255,255,0.18))]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="lg:col-span-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-footer-cta-bg,#12A875)]">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Newsletter</span>
            </p>
            <h2
              id="footer-newsletter-newsletter"
              className="mt-2 text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-footer-fg,#F4FBF7)]"
            >
              {newsletterHeading}
            </h2>
            {newsletterDescription && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-footer-muted,#C9E3D7)]">
                {newsletterDescription}
              </p>
            )}
          </div>

          <form className="lg:col-span-7" onSubmit={handleSubmit} noValidate>
            <label htmlFor={emailInputId} className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                id={emailInputId}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={emailValue}
                onChange={(event) => {
                  setEmailValue(event.target.value);
                  if (status.type !== "idle" && status.type !== "submitting") {
                    setStatus({ type: "idle" });
                  }
                }}
                placeholder={emailPlaceholder}
                aria-describedby={statusId}
                disabled={isSubmitting}
                className="min-h-12 w-full min-w-0 flex-1 rounded-xl border border-[var(--color-footer-border,rgba(255,255,255,0.18))] bg-white/[0.07] px-4 text-base text-[var(--color-footer-fg,#F4FBF7)] placeholder:text-[var(--color-footer-muted,#C9E3D7)] focus:border-[var(--color-footer-cta-bg,#12A875)] focus:outline-none focus:ring-2 focus:ring-[var(--color-footer-cta-bg,#12A875)] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-footer-cta-bg,#12A875)] px-5 py-3 text-sm font-extrabold text-[var(--color-footer-cta-text,#063B2E)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isSubmitting ? "Sending…" : buttonLabel}</span>
              </button>
            </div>
            {consentText && (
              <p className="mt-2 text-[11px] leading-5 text-[var(--color-footer-muted,#C9E3D7)]">
                {consentText}
              </p>
            )}
            <p id={statusId} className={`mt-2 min-h-5 text-xs font-medium ${statusTone}`} aria-live="polite">
              {status.type !== "idle" && "message" in status ? status.message : ""}
            </p>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="sm:col-span-2 lg:col-span-4">
            <FooterBrand
              brandName={brandName}
              logoUrl={logoUrl}
              description={description}
            />
            <FooterSocialLinks
              facebookUrl={facebookUrl}
              instagramUrl={instagramUrl}
              linkedinUrl={linkedinUrl}
              youtubeUrl={youtubeUrl}
              className="mt-5"
            />
          </div>

          <FooterLinkGroup
            id="explore"
            title={servicesHeading}
            links={servicesLinks}
            className="lg:col-span-2"
          />

          <FooterLinkGroup
            id="company"
            title={companyHeading}
            links={companyLinks}
            className="lg:col-span-2"
          />

          <FooterContactList
            phone={phone}
            email={email}
            address={address}
            showHeading
            heading="Contact"
            className="sm:col-span-2 lg:col-span-4 lg:border-l lg:border-[var(--color-footer-border,rgba(255,255,255,0.18))] lg:pl-8"
          />
        </div>

        <FooterLegalBar copyright={copyright} links={legalLinks} className="mt-8 sm:mt-10" />
      </div>
    </footer>
  );
};

export const footerNewsletterDefinition: ComponentDefinition<FooterNewsletterProps> = {
  id: "footer.newsletter.v1",
  name: "Modern Newsletter Footer",
  category: "footer",
  version: 1,
  schema: FooterNewsletterPropsSchema,
  defaults: FooterNewsletterPropsSchema.parse({}),
  component: FooterNewsletter,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "logoUrl", label: "Logo URL (optional)", type: "image" },
      { propName: "description", label: "Brand Description", type: "textarea" },
      { propName: "newsletterHeading", label: "Newsletter Heading", type: "text" },
      { propName: "newsletterDescription", label: "Newsletter Supporting Text", type: "textarea" },
      { propName: "emailPlaceholder", label: "Email Placeholder", type: "text" },
      { propName: "buttonLabel", label: "Subscribe Button Label", type: "text" },
      { propName: "consentText", label: "Consent / Privacy Note", type: "textarea" },
      { propName: "newsletterEndpoint", label: "Newsletter Endpoint URL", type: "text", description: "Optional. Leave empty until a real email subscription backend is connected." },
      { propName: "successMessage", label: "Success Message", type: "text" },
      { propName: "servicesHeading", label: "Explore Column Heading", type: "text" },
      { propName: "servicesLinks", label: "Explore Links", type: "list" },
      { propName: "companyHeading", label: "Company Column Heading", type: "text" },
      { propName: "companyLinks", label: "Company Links", type: "list" },
      { propName: "phone", label: "Phone Number", type: "text" },
      { propName: "email", label: "Email Address", type: "text" },
      { propName: "address", label: "Address / Service Area", type: "textarea" },
      { propName: "facebookUrl", label: "Facebook URL", type: "text" },
      { propName: "instagramUrl", label: "Instagram URL", type: "text" },
      { propName: "linkedinUrl", label: "LinkedIn URL", type: "text" },
      { propName: "youtubeUrl", label: "YouTube URL", type: "text" },
      { propName: "legalLinks", label: "Legal / Bottom Links", type: "list" },
      { propName: "copyright", label: "Copyright Notice", type: "text" },
    ],
  },
};
