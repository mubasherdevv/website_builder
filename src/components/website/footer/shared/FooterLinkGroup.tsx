import React from "react";
import { FooterLink } from "./footer.types";
import { sanitizeFooterHref } from "./footer-url";

export interface FooterLinkGroupProps {
  id: string;
  title: string;
  links: FooterLink[];
  className?: string;
}

export const FooterLinkGroup: React.FC<FooterLinkGroupProps> = ({
  id,
  title,
  links,
  className = "",
}) => {
  const safeLinks = links
    .map((link) => ({ ...link, href: sanitizeFooterHref(link.href) ?? "" }))
    .filter((link) => link.href && link.label.trim())
    .slice(0, 10);

  if (safeLinks.length === 0) return null;

  const headingId = `footer-link-group-${id}`;

  return (
    <nav aria-labelledby={headingId} className={`min-w-0 ${className}`.trim()}>
      <h2
        id={headingId}
        className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-footer-fg,#F4FBF7)]"
      >
        {title}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {safeLinks.map((link, index) => (
          <li key={`${link.href}-${index}`}>
            <a
              href={link.href}
              className="inline-flex min-h-6 max-w-full items-center text-sm leading-6 text-[var(--color-footer-link,#BDE8CF)] underline-offset-4 transition-colors hover:text-[var(--color-footer-link-hover,#FFFFFF)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)] break-words"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
