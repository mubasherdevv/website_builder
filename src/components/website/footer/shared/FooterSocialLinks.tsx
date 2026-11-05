import React from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { sanitizeFooterHref } from "./footer-url";

export interface FooterSocialLinksProps {
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  className?: string;
}

interface SocialLink {
  label: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const FooterSocialLinks: React.FC<FooterSocialLinksProps> = ({
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  youtubeUrl,
  className = "",
}) => {
  const links: SocialLink[] = [
    { label: "Visit our Facebook page", href: facebookUrl ?? "", Icon: Facebook },
    { label: "Visit our Instagram profile", href: instagramUrl ?? "", Icon: Instagram },
    { label: "Visit our LinkedIn profile", href: linkedinUrl ?? "", Icon: Linkedin },
    { label: "Visit our YouTube channel", href: youtubeUrl ?? "", Icon: Youtube },
  ]
    .map((link) => ({ ...link, href: sanitizeFooterHref(link.href) ?? "" }))
    .filter((link) => Boolean(link.href));

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-footer-border,rgba(255,255,255,0.18))] text-[var(--color-footer-fg,#F4FBF7)] transition-colors hover:bg-[var(--color-footer-cta-bg,#12A875)] hover:text-[var(--color-footer-cta-text,#063B2E)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
};
