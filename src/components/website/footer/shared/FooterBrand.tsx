import React, { useState } from "react";
import { sanitizeFooterImageUrl } from "./footer-url";

export interface FooterBrandProps {
  brandName: string;
  logoUrl?: string;
  description?: string;
  className?: string;
  showDescription?: boolean;
}

export const FooterBrand: React.FC<FooterBrandProps> = ({
  brandName,
  logoUrl,
  description,
  className = "",
  showDescription = true,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const safeLogoUrl = sanitizeFooterImageUrl(logoUrl);
  const shouldShowImage = Boolean(safeLogoUrl) && !imageFailed;
  const brandInitial = brandName.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className={`min-w-0 space-y-3 ${className}`.trim()}>
      <a
        href="/"
        className="inline-flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-footer-cta-bg,#12A875)]"
        aria-label={`${brandName} home`}
      >
        {shouldShowImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeLogoUrl as string}
            alt={`${brandName} logo`}
            className="h-10 sm:h-12 w-auto max-w-[180px] object-contain rounded-sm"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span
            className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-footer-cta-bg,#12A875)] text-lg sm:text-xl font-extrabold text-[var(--color-footer-cta-text,#063B2E)]"
            aria-hidden="true"
          >
            {brandInitial}
          </span>
        )}
        <span className="min-w-0 truncate text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-[var(--color-footer-fg,#F4FBF7)]">
          {brandName}
        </span>
      </a>

      {showDescription && description ? (
        <p className="max-w-md text-sm leading-6 text-[var(--color-footer-muted,#C9E3D7)]">
          {description}
        </p>
      ) : null}
    </div>
  );
};
