import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import {
  footerLinkSchema,
  footerSocialLinksFields,
  optionalFooterUrlSchema,
} from "./shared/footer.types";
import { FooterBrand } from "./shared/FooterBrand";
import { FooterContactList } from "./shared/FooterContactList";
import { FooterLinkGroup } from "./shared/FooterLinkGroup";
import { FooterLegalBar } from "./shared/FooterLegalBar";
import { FooterSocialLinks } from "./shared/FooterSocialLinks";

export const FooterColumnsPropsSchema = z.object({
  brandName: z.string().trim().min(1).max(80).default("Acme Business"),
  logoUrl: optionalFooterUrlSchema.optional(),
  description: z
    .string()
    .trim()
    .min(1)
    .max(280)
    .default("Thoughtful work, clear communication, and practical solutions for growing teams and local businesses."),
  servicesHeading: z.string().trim().min(1).max(80).default("Services"),
  servicesLinks: z
    .array(footerLinkSchema)
    .max(10)
    .default([
      { label: "Our Services", href: "/services" },
      { label: "Pricing", href: "/pricing" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Request an Estimate", href: "/contact" },
    ]),
  companyHeading: z.string().trim().min(1).max(80).default("Company"),
  companyLinks: z
    .array(footerLinkSchema)
    .max(10)
    .default([
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ]),
  contactHeading: z.string().trim().min(1).max(80).default("Contact"),
  phone: z.string().trim().max(60).default("+1 (555) 123-4567"),
  email: z.string().trim().email().max(254).default("hello@acme.test"),
  address: z.string().trim().max(300).default("100 Main Street, Springfield"),
  hours: z.string().trim().max(400).default("Monday–Friday: 9:00 AM–6:00 PM\nSaturday: 10:00 AM–2:00 PM"),
  copyright: z.string().trim().min(1).max(180).default("© 2026 Acme Business. All rights reserved."),
  legalLinks: z
    .array(footerLinkSchema)
    .max(6)
    .default([
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ]),
  ...footerSocialLinksFields,
});

export type FooterColumnsProps = z.infer<typeof FooterColumnsPropsSchema>;

export const FooterColumns: React.FC<FooterColumnsProps> = ({
  brandName,
  logoUrl,
  description,
  servicesHeading,
  servicesLinks = [],
  companyHeading,
  companyLinks = [],
  contactHeading,
  phone,
  email,
  address,
  hours,
  copyright,
  legalLinks = [],
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  youtubeUrl,
}) => {
  return (
    <footer
      className="w-full border-t border-[var(--color-footer-border,rgba(255,255,255,0.18))] bg-[var(--color-footer-bg,#063B2E)] text-[var(--color-footer-fg,#F4FBF7)]"
      aria-labelledby="footer-columns-brand"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="sm:col-span-2 lg:col-span-3">
            <span id="footer-columns-brand" className="sr-only">
              {brandName} footer
            </span>
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
            id="services"
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
            hours={hours}
            showHeading
            heading={contactHeading}
            className="sm:col-span-2 lg:col-span-5 lg:border-l lg:border-[var(--color-footer-border,rgba(255,255,255,0.18))] lg:pl-8"
          />
        </div>

        <FooterLegalBar copyright={copyright} links={legalLinks} className="mt-8 sm:mt-10" />
      </div>
    </footer>
  );
};

export const footerColumnsDefinition: ComponentDefinition<FooterColumnsProps> = {
  id: "footer.columns.v1",
  name: "Multi-Column SEO Footer",
  category: "footer",
  version: 1,
  schema: FooterColumnsPropsSchema,
  defaults: FooterColumnsPropsSchema.parse({}),
  component: FooterColumns,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "logoUrl", label: "Logo URL (optional)", type: "image" },
      { propName: "description", label: "Short Description", type: "textarea" },
      { propName: "servicesHeading", label: "Services Column Heading", type: "text" },
      { propName: "servicesLinks", label: "Services Links", type: "list" },
      { propName: "companyHeading", label: "Company Column Heading", type: "text" },
      { propName: "companyLinks", label: "Company Links", type: "list" },
      { propName: "contactHeading", label: "Contact Column Heading", type: "text" },
      { propName: "phone", label: "Phone Number", type: "text" },
      { propName: "email", label: "Email Address", type: "text" },
      { propName: "address", label: "Address / Service Area", type: "textarea" },
      { propName: "hours", label: "Opening Hours", type: "textarea" },
      { propName: "facebookUrl", label: "Facebook URL", type: "text" },
      { propName: "instagramUrl", label: "Instagram URL", type: "text" },
      { propName: "linkedinUrl", label: "LinkedIn URL", type: "text" },
      { propName: "youtubeUrl", label: "YouTube URL", type: "text" },
      { propName: "legalLinks", label: "Legal / Bottom Links", type: "list" },
      { propName: "copyright", label: "Copyright Notice", type: "text" },
    ],
  },
};
