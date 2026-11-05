import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { sanitizeFooterHref } from "./footer-url";

export interface FooterContactListProps {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  className?: string;
  showHeading?: boolean;
  heading?: string;
}

function phoneHref(phone: string): string | null {
  const compact = phone.replace(/[^+\d]/g, "");
  if (!compact || compact.replace(/\D/g, "").length < 7) return null;
  return `tel:${compact}`;
}

export const FooterContactList: React.FC<FooterContactListProps> = ({
  phone,
  email,
  address,
  hours,
  className = "",
  showHeading = false,
  heading = "Contact",
}) => {
  const safeEmail = email?.trim() ?? "";
  const safeEmailHref = safeEmail
    ? sanitizeFooterHref(`mailto:${safeEmail}`)
    : null;
  const safePhoneHref = phone ? phoneHref(phone) : null;

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      {showHeading && (
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-footer-fg,#F4FBF7)]">
          {heading}
        </h2>
      )}
      <address className="mt-3 not-italic space-y-3 text-sm leading-6 text-[var(--color-footer-muted,#C9E3D7)]">
        {phone && (
          <span className="flex min-w-0 items-start gap-2.5">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-footer-cta-bg,#12A875)]" aria-hidden="true" />
            {safePhoneHref ? (
              <a
                href={safePhoneHref}
                className="min-w-0 break-words text-[var(--color-footer-link,#BDE8CF)] hover:text-[var(--color-footer-link-hover,#FFFFFF)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
              >
                {phone}
              </a>
            ) : (
              <span className="min-w-0 break-words">{phone}</span>
            )}
          </span>
        )}

        {safeEmail && (
          <span className="flex min-w-0 items-start gap-2.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-footer-cta-bg,#12A875)]" aria-hidden="true" />
            {safeEmailHref ? (
              <a
                href={safeEmailHref}
                className="min-w-0 break-all text-[var(--color-footer-link,#BDE8CF)] hover:text-[var(--color-footer-link-hover,#FFFFFF)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
              >
                {safeEmail}
              </a>
            ) : (
              <span className="min-w-0 break-all">{safeEmail}</span>
            )}
          </span>
        )}

        {address && (
          <span className="flex min-w-0 items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-footer-cta-bg,#12A875)]" aria-hidden="true" />
            <span className="min-w-0 whitespace-pre-line break-words">{address}</span>
          </span>
        )}
      </address>
      {hours ? (
        <p className="mt-3 whitespace-pre-line text-xs leading-6 text-[var(--color-footer-muted,#C9E3D7)] border-l-2 border-[var(--color-footer-border,rgba(255,255,255,0.18))] pl-3">
          {hours}
        </p>
      ) : null}
    </div>
  );
};
