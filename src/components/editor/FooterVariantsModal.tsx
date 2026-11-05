"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  PanelBottom,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
} from "lucide-react";
import { AnyComponentDefinition } from "@/builder/registry/types";
import { getComponentDefinition } from "@/builder/registry";
import {
  FooterClassic,
  FooterClassicPropsSchema,
} from "@/components/website/footer/FooterClassic";
import {
  FooterColumns,
  FooterColumnsPropsSchema,
} from "@/components/website/footer/FooterColumns";
import {
  FooterNewsletter,
  FooterNewsletterPropsSchema,
} from "@/components/website/footer/FooterNewsletter";
import { IsolatedFrame } from "./IsolatedFrame";

export interface FooterVariantOption {
  id: string;
  name: string;
  badge: string;
  bestFor: string;
  description: string;
  preview: React.ReactNode;
  minHeight: number;
}

export interface FooterVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeComponentId?: string;
  onApplyVariant: (
    componentDef: AnyComponentDefinition,
    mode: "replace" | "insert"
  ) => void;
  hasExistingFooter: boolean;
}

type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Exclude<PreviewDevice, "desktop">, number> = {
  tablet: 768,
  mobile: 390,
};

/**
 * Footer Templates modal.
 * Unlike the header modal's static mockups, previews here are the REAL registered
 * footer components rendered with their schema defaults, inside an IsolatedFrame
 * for tablet/mobile so responsive breakpoints are evaluated authentically.
 */
export const FooterVariantsModal: React.FC<FooterVariantsModalProps> = ({
  isOpen,
  onClose,
  activeComponentId = "footer.simple.v1",
  onApplyVariant,
  hasExistingFooter,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(activeComponentId);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeComponentId) {
      setSelectedId(activeComponentId);
    }
  }, [activeComponentId]);

  // Escape-to-close + body scroll lock while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const classicProps = FooterClassicPropsSchema.parse({});
  const columnsProps = FooterColumnsPropsSchema.parse({});
  const newsletterProps = FooterNewsletterPropsSchema.parse({});

  const variants: FooterVariantOption[] = [
    {
      id: "footer.classic.v1",
      name: "Variant 1: Classic Business Footer",
      badge: "Complete • Professional • All-in-One",
      bestFor: "Service businesses, agencies, corporate websites",
      description:
        "Brand block with description, contact details, quick links, social icons and a highlighted call-to-action panel.",
      minHeight: 420,
      preview: <FooterClassic {...classicProps} />,
    },
    {
      id: "footer.columns.v1",
      name: "Variant 2: Multi-Column SEO Footer",
      badge: "SEO-Rich • Organized • Information Dense",
      bestFor: "Local businesses, contractors, multi-service companies",
      description:
        "Dedicated Service and Company link columns plus a wide contact column with opening hours—great for SEO and local business.",
      minHeight: 420,
      preview: <FooterColumns {...columnsProps} />,
    },
    {
      id: "footer.newsletter.v1",
      name: "Variant 3: Modern Newsletter Footer",
      badge: "Engagement • Lead Capture • Modern",
      bestFor: "Content sites, SaaS, studios, personal brands",
      description:
        "Email signup strip on top. The form stays honestly disconnected until a real newsletter endpoint is set in footer settings—no fake success states.",
      minHeight: 480,
      preview: <FooterNewsletter {...newsletterProps} />,
    },
  ];

  const handleSelectVariant = (variantId: string) => {
    setSelectedId(variantId);
    const def = getComponentDefinition(variantId);
    if (def) {
      onApplyVariant(def, hasExistingFooter ? "replace" : "insert");
      onClose();
    }
  };

  const deviceOptions: Array<{
    id: PreviewDevice;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "desktop", label: "Desktop", Icon: Monitor },
    { id: "tablet", label: "Tablet", Icon: Tablet },
    { id: "mobile", label: "Mobile", Icon: Smartphone },
  ];

  const renderPreview = (option: FooterVariantOption) => {
    const previewNode = <div className="w-full">{option.preview}</div>;

    if (device === "desktop") {
      return (
        <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
          {previewNode}
        </div>
      );
    }

    const width = device === "tablet" ? DEVICE_WIDTHS.tablet : DEVICE_WIDTHS.mobile;

    return (
      <div
        className="mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm"
        style={{ width, maxWidth: "100%" }}
      >
        <IsolatedFrame
          viewportWidth={width}
          title={`${option.name} preview (${width}px)`}
          minHeight={option.minHeight}
        >
          {previewNode}
        </IsolatedFrame>
      </div>
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="footer-variants-modal-title"
        aria-describedby="footer-variants-modal-description"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden z-[99999] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-100 text-[#087A55] flex items-center justify-center shadow-xs">
              <PanelBottom className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3
                id="footer-variants-modal-title"
                className="text-base font-bold text-slate-900 tracking-tight"
              >
                Footer Templates &amp; Variants
              </h3>
              <p
                id="footer-variants-modal-description"
                className="text-xs text-slate-500 mt-0.5"
              >
                Real component previews—choose a ready-made responsive footer variant
              </p>
            </div>
          </div>

          {/* Device Toggle */}
          <div
            className="hidden sm:flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 shrink-0"
            role="group"
            aria-label="Preview device width"
          >
            {deviceOptions.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                aria-pressed={device === id}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  device === id
                    ? "bg-white text-[#087A55] shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close footer templates"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Variants List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {variants.map((v) => {
            const isCurrentlySelected = selectedId === v.id;

            return (
              <div
                key={v.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all bg-white ${
                  isCurrentlySelected
                    ? "border-[#087A55] shadow-md ring-2 ring-[#087A55]/30"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {/* Variant Header Info & Apply Button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {v.name}
                      </h4>
                      {isCurrentlySelected && (
                        <span className="text-[11px] font-bold text-[#087A55] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active Choice</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#087A55] font-semibold mt-0.5 inline-block">
                      {v.badge}
                    </span>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                      {v.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectVariant(v.id)}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 shadow-xs cursor-pointer ${
                      isCurrentlySelected
                        ? "bg-[#087A55] text-white hover:bg-[#066747]"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-[#087A55] hover:border-[#087A55]"
                    }`}
                  >
                    {hasExistingFooter ? "Apply to Page" : "Insert Footer"}
                  </button>
                </div>

                {/* Real Component Preview (decorative, non-interactive) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none my-3 [&_a]:cursor-default"
                >
                  {renderPreview(v)}
                </div>

                {/* Best For Tag */}
                <div className="text-xs text-slate-500 flex items-center gap-2 pt-2.5 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Best For:</span>
                  <span>{v.bestFor}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-slate-500 text-xs flex items-center gap-1.5 min-w-0">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            {hasExistingFooter
              ? "Selecting a variant replaces your existing footer in place."
              : "Footer will be inserted at the end of your page."}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-semibold text-xs rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
