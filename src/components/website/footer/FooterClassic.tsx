import React from "react";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { ComponentDefinition } from "@/builder/registry/types";
import {
  footerLinkSchema,
  footerSocialLinksFields,
  optionalFooterUrlSchema,
  safeFooterHrefSchema,
} from "./shared/footer.types";
import { sanitizeFooterHref } from "./shared/footer-url";
import { FooterBrand } from "./shared/FooterBrand";
import { FooterContactList } from "./shared/FooterContactList";
import { FooterLinkGroup } from "./shared/FooterLinkGroup";
import { FooterLegalBar } from "./shared/FooterLegalBar";
import { FooterSocialLinks } from "./shared/FooterSocialLinks";

export const FooterClassicPropsSchema = z.object({
  brandName: z.string().trim().min(1).max(80).default("Acme Business"),
  logoUrl: optionalFooterUrlSchema.optional(),
  description: z
    .string()
    .trim()
    .min(1)
    .max(280)
    .default("Dedicated to delivering reliable work and a straightforward experience from first call to final handoff."),
  phone: z.string().trim().max(60).default("+1 (555) 123-4567"),
  email: z.string().trim().email().max(254).default("hello@acme.test"),
  address: z.string().trim().max(300).default("100 Main Street, Springfield"),
  ctaLabel: z.string().trim().min(1).max(60).default("Get a Free Quote"),
  ctaHref: safeFooterHrefSchema.default("#contact"),
  showCta: z.boolean().default(true),
  showSocial: z.boolean().default(true),
  quickLinks: z
    .array(footerLinkSchema)
    .max(10)
    .default([
      { label: "Services", href: "/services" },
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ]),
  legalLinks: z
    .array(footerLinkSchema)
    .max(6)
    .default([
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ]),
  copyright: z.string().trim().min(1).max(180).default("© 2026 Acme Business. All rights reserved."),
  ...footerSocialLinksFields,
});

export type FooterClassicProps = z.infer<typeof FooterClassicPropsSchema>;

export const FooterClassic: React.FC<FooterClassicProps> = ({
  brandName,
  logoUrl,
  description,
  phone,
  email,
  address,
  ctaLabel,
  ctaHref,
  showCta = true,
  showSocial = true,
  quickLinks = [],
  legalLinks = [],
  copyright,
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  youtubeUrl,
}) => {
  const safeCtaHref = sanitizeFooterHref(ctaHref);

  return (
    <footer
      className="w-full border-t border-[var(--color-footer-border,rgba(255,255,255,0.18))] bg-[var(--color-footer-bg,#063B2E)] text-[var(--color-footer-fg,#F4FBF7)]"
      aria-labelledby="footer-classic-brand"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="lg:col-span-4">
            <span id="footer-classic-brand" className="sr-only">
              {brandName} footer
            </span>
            <FooterBrand
              brandName={brandName}
              logoUrl={logoUrl}
              description={description}
            />
            {showSocial && (
              <FooterSocialLinks
                facebookUrl={facebookUrl}
                instagramUrl={instagramUrl}
                linkedinUrl={linkedinUrl}
                youtubeUrl={youtubeUrl}
                className="mt-5"
              />
            )}
          </div>

          <FooterContactList
            phone={phone}
            email={email}
            address={address}
            showHeading
            heading="Get in touch"
            className="lg:col-span-3"
          />

          <FooterLinkGroup
            id="quick"
            title="Explore"
            links={quickLinks}
            className="lg:col-span-2"
          />

          {showCta && (
            <div className="lg:col-span-3 lg:justify-self-end">
              <div className="rounded-2xl border border-[var(--color-footer-border,rgba(255,255,255,0.18))] bg-white/[0.05] p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-extrabold leading-snug text-[var(--color-footer-fg,#F4FBF7)]">
                  Ready to get started?
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-footer-muted,#C9E3D7)]">
                  Tell us what you need and we will help you choose the right next step.
                </p>
                {safeCtaHref && (
                  <a
                    href={safeCtaHref}
                    className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-footer-cta-bg,#12A875)] px-5 py-2.5 text-sm font-bold text-[var(--color-footer-cta-text,#063B2E)] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <FooterLegalBar copyright={copyright} links={legalLinks} className="mt-8 sm:mt-10" />
      </div>
    </footer>
  );
};

export const footerClassicDefinition: ComponentDefinition<FooterClassicProps> = {
  id: "footer.classic.v1",
  name: "Classic Business Footer",
  category: "footer",
  version: 1,
  schema: FooterClassicPropsSchema,
  defaults: FooterClassicPropsSchema.parse({}),
  component: FooterClassic,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "logoUrl", label: "Logo URL (optional)", type: "image" },
      { propName: "description", label: "Short Description", type: "textarea" },
      { propName: "phone", label: "Phone Number", type: "text" },
      { propName: "email", label: "Email Address", type: "text" },
      { propName: "address", label: "Address / Service Area", type: "textarea" },
      { propName: "ctaLabel", label: "CTA Button Label", type: "text" },
      { propName: "ctaHref", label: "CTA Button Link", type: "text" },
      { propName: "showCta", label: "Show CTA Panel", type: "switch" },
      { propName: "showSocial", label: "Show Social Icons", type: "switch" },
      { propName: "quickLinks", label: "Quick Links", type: "list" },
      { propName: "facebookUrl", label: "Facebook URL", type: "text" },
      { propName: "instagramUrl", label: "Instagram URL", type: "text" },
      { propName: "linkedinUrl", label: "LinkedIn URL", type: "text" },
      { propName: "youtubeUrl", label: "YouTube URL", type: "text" },
      { propName: "legalLinks", label: "Legal / Bottom Links", type: "list" },
      { propName: "copyright", label: "Copyright Notice", type: "text" },
    ],
  },
};
