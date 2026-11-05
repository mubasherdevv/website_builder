import React from "react";
import { z } from "zod";
import { ComponentDefinition } from "@/builder/registry/types";
import { sanitizeFooterHref } from "./shared/footer-url";

export const FooterSimplePropsSchema = z.object({
  brandName: z.string().default("Acme Business"),
  description: z
    .string()
    .default("Dedicated to delivering superior local craftsmanship and client satisfaction."),
  copyright: z.string().default("© 2026 Acme Business. All rights reserved."),
  links: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
      })
    )
    .default([
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "#contact" },
    ]),
});

export type FooterSimpleProps = z.infer<typeof FooterSimplePropsSchema>;

export const FooterSimple: React.FC<FooterSimpleProps> = ({
  brandName,
  description,
  copyright,
  links = [],
}) => {
  const safeLinks = links
    .map((link) => ({ ...link, href: sanitizeFooterHref(link.href) ?? "" }))
    .filter((link) => link.href && link.label.trim());

  return (
    <footer
      className="w-full border-t py-8 sm:py-12 px-4 sm:px-6 transition-colors bg-[var(--color-footer-bg,#063B2E)] text-[var(--color-footer-fg,#F4FBF7)]"
      style={{
        borderColor: "var(--color-footer-border, rgba(255,255,255,0.18))",
      }}
      aria-label="Website footer"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 text-center md:text-left">
        {/* Brand Information */}
        <div className="space-y-1.5 max-w-sm w-full md:w-auto">
          <p
            className="font-bold text-base sm:text-lg tracking-tight"
            style={{ color: "var(--color-footer-fg, #F4FBF7)" }}
          >
            {brandName}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-footer-muted, #C9E3D7)" }}
          >
            {description}
          </p>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-0"
          style={{ borderColor: "var(--color-footer-border, rgba(255,255,255,0.18))" }}
        >
          {safeLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-md px-2 py-2 text-xs font-semibold text-[var(--color-footer-link,#BDE8CF)] transition-colors hover:text-[var(--color-footer-link-hover,#FFFFFF)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Copyright notice */}
        <p
          className="text-xs w-full md:w-auto md:text-right pt-1 md:pt-0"
          style={{ color: "var(--color-footer-muted, #C9E3D7)" }}
        >
          {copyright}
        </p>
      </div>
    </footer>
  );
};

export const footerSimpleDefinition: ComponentDefinition<FooterSimpleProps> = {
  id: "footer.simple.v1",
  name: "Simple Footer",
  category: "footer",
  version: 1,
  schema: FooterSimplePropsSchema,
  defaults: FooterSimplePropsSchema.parse({}),
  component: FooterSimple,
  editor: {
    controls: [
      { propName: "brandName", label: "Business Name", type: "text" },
      { propName: "description", label: "Short Description", type: "textarea" },
      { propName: "copyright", label: "Copyright Notice", type: "text" },
    ],
  },
};
