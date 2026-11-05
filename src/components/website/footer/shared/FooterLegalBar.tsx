import React from "react";
import { FooterLink } from "./footer.types";
import { sanitizeFooterHref } from "./footer-url";

export interface FooterLegalBarProps {
  copyright: string;
  links?: FooterLink[];
  className?: string;
  align?: "left" | "center";
}

export const FooterLegalBar: React.FC<FooterLegalBarProps> = ({
  copyright,
  links = [],
  className = "",
  align = "left",
}) => {
  const safeLinks = links
    .map((link) => ({ ...link, href: sanitizeFooterHref(link.href) ?? "" }))
    .filter((link) => link.href && link.label.trim());

  const justifyClass =
    align === "center" ? "justify-center text-center" : "justify-between md:justify-between";

  return (
    <div
      className={`border-t border-[var(--color-footer-border,rgba(255,255,255,0.18))] pt-4 sm:pt-5 flex flex-col sm:flex-row items-center ${justifyClass} gap-3 sm:gap-6 text-center sm:text-left ${className}`.trim()}
    >
      <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--color-footer-muted,#C9E3D7)] max-w-2xl">
        {copyright}
      </p>

      {safeLinks.length > 0 && (
        <nav aria-label="Footer legal links" className="shrink-0">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {safeLinks.map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <a
                  href={link.href}
                  className="text-xs sm:text-[13px] font-medium text-[var(--color-footer-link,#BDE8CF)] underline-offset-4 transition-colors hover:text-[var(--color-footer-link-hover,#FFFFFF)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};
