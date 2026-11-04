import React from "react";
import { z } from "zod";
import Link from "next/link";
import { ComponentDefinition } from "@/builder/registry/types";

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
  return (
    <footer
      className="w-full border-t py-8 sm:py-12 px-4 sm:px-6 transition-colors"
      style={{
        backgroundColor: "var(--color-footer-bg, #063B2E)",
        borderColor: "var(--color-divider, #E1EAE4)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8 text-center md:text-left">
        {/* Brand Information */}
        <div className="space-y-1.5 max-w-sm w-full md:w-auto">
          <p
            className="font-bold text-base sm:text-lg tracking-tight"
            style={{ color: "var(--color-heading, var(--color-text-primary))" }}
          >
            {brandName}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description}
          </p>
        </div>

        {/* Navigation Links */}
        <div
          className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-0"
          style={{ borderColor: "var(--color-divider, #E1EAE4)" }}
        >
          {links.map((link, idx) => (
            <Link
              key={idx}
              href={link.href || "#"}
              className="text-xs font-medium hover:opacity-80 transition-opacity whitespace-nowrap px-1 py-0.5"
              style={{ color: "var(--color-link, var(--color-primary, #087A55))" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright notice */}
        <p
          className="text-xs w-full md:w-auto md:text-right pt-1 md:pt-0"
          style={{ color: "var(--color-text-muted)" }}
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
