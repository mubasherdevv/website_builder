/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Phone,
  Mail,
  MapPin,
  Search,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { AnyComponentDefinition } from "@/builder/registry/types";
import { getComponentDefinition } from "@/builder/registry";

export interface HeaderVariantOption {
  id: string;
  name: string;
  badge: string;
  bestFor: string;
  description: string;
  preview: React.ReactNode;
}

export interface HeaderVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeComponentId?: string;
  onApplyVariant: (componentDef: AnyComponentDefinition, mode: "replace" | "insert") => void;
  hasExistingHeader: boolean;
}

export const HeaderVariantsModal: React.FC<HeaderVariantsModalProps> = ({
  isOpen,
  onClose,
  activeComponentId = "header.simple.v1",
  onApplyVariant,
  hasExistingHeader,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(activeComponentId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeComponentId) {
      setSelectedId(activeComponentId);
    }
  }, [activeComponentId]);

  if (!isOpen || !mounted) return null;

  const variants: HeaderVariantOption[] = [
    {
      id: "header.simple.v1",
      name: "Variant 1: Classic Business Header",
      badge: "Clean • Professional • Most Common",
      bestFor: "Service businesses, agencies, corporate websites",
      description: "Logo on the left, navigation menu in the center, contact phone & primary CTA button on the right.",
      preview: (
        <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm select-none">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#087A55] flex items-center justify-center font-extrabold text-white text-sm">
                N
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">Site Nexa</span>
            </div>

            {/* Nav */}
            <div className="hidden sm:flex items-center gap-5 text-xs font-medium text-slate-600">
              <span className="text-[#087A55] font-bold border-b-2 border-[#087A55] pb-0.5">Home</span>
              <span className="hover:text-slate-900">Services ▾</span>
              <span className="hover:text-slate-900">About</span>
              <span className="hover:text-slate-900">Blog</span>
              <span className="hover:text-slate-900">Contact</span>
            </div>

            {/* Phone + CTA */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[#087A55]">
                  <Phone className="w-3 h-3" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-[#087A55] text-white text-xs font-semibold flex items-center gap-1 shadow-xs">
                <span>Get a Quote</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "header.topbar.v1",
      name: "Variant 2: Top Bar + Header",
      badge: "Informative • Business Focused • Great for Local Businesses",
      bestFor: "Contractors, medical clinics, home services, local businesses",
      description: "Two horizontal tiers: Top utility bar (email, phone, location, social links) and clean main header with search & CTA.",
      preview: (
        <div className="w-full rounded-xl border border-slate-200 overflow-hidden shadow-sm select-none">
          {/* Top Bar */}
          <div className="bg-[#063B2E] text-emerald-100 px-4 py-1.5 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 opacity-80" /> info@sitenexa.com</span>
              <span className="flex items-center gap-1.5 font-semibold"><Phone className="w-3 h-3 opacity-80" /> +1 (555) 123-4567</span>
              <span className="hidden sm:flex items-center gap-1.5 opacity-80"><MapPin className="w-3 h-3 opacity-80" /> New York, USA</span>
            </div>
            <div className="flex items-center gap-3 opacity-80 text-[10px]">
              <span>Facebook</span>
              <span>•</span>
              <span>Instagram</span>
              <span>•</span>
              <span>LinkedIn</span>
            </div>
          </div>

          {/* Main Bar */}
          <div className="bg-white p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#087A55] flex items-center justify-center font-extrabold text-white text-sm">
                N
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">Site Nexa</span>
            </div>

            <div className="hidden sm:flex items-center gap-5 text-xs font-medium text-slate-600">
              <span className="text-[#087A55] font-bold">Home</span>
              <span>Services ▾</span>
              <span>Projects</span>
              <span>Blog</span>
              <span>Contact</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="p-1.5 text-slate-500 rounded-full hover:bg-slate-100">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div className="px-3.5 py-1.5 rounded-lg bg-[#087A55] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <Calendar className="w-3 h-3" />
                <span>Request a Call</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "header.transparent.v1",
      name: "Variant 3: Modern Transparent / Hero Header",
      badge: "Modern • Stylish • Floating Pill Design",
      bestFor: "Landing pages, modern SaaS, creative agencies, boutique studios",
      description: "Floating frosted glass capsule navbar with brand logo on the left, pill navigation menu in the center, and black CTA button with diagonal arrow on the right.",
      preview: (
        <div className="w-full rounded-2xl overflow-hidden shadow-xs select-none relative bg-gradient-to-r from-amber-50/60 via-slate-100 to-emerald-50/70 p-3 sm:p-4 border border-slate-200/60">
          <div className="max-w-4xl mx-auto rounded-full px-3.5 sm:px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/80 shadow-md flex items-center justify-between gap-3">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                S
              </div>
              <span className="font-extrabold text-slate-950 text-xs tracking-tight">shadcnspace.</span>
            </div>

            {/* Center: Inner Capsule Navigation */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/60 border border-white/80 shadow-2xs text-[11px]">
              <span className="bg-white text-slate-950 font-bold px-2.5 py-0.5 rounded-full shadow-xs">Home</span>
              <span className="text-slate-600 px-2 py-0.5">About us</span>
              <span className="text-slate-600 px-2 py-0.5">Services ▾</span>
              <span className="text-slate-600 px-2 py-0.5">Team</span>
              <span className="text-slate-600 px-2 py-0.5">Pricing</span>
            </div>

            {/* Right: Pill Button with Arrow */}
            <div className="px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm shrink-0">
              <span>Let&apos;s Collaborate</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleSelectVariant = (variantId: string) => {
    setSelectedId(variantId);
    const def = getComponentDefinition(variantId);
    if (def) {
      onApplyVariant(def, hasExistingHeader ? "replace" : "insert");
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden z-[99999] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#087A55] flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Header Templates & Variants
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a ready-made responsive header variant for your website
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
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
                onClick={() => setSelectedId(v.id)}
                className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer bg-white ${
                  isCurrentlySelected
                    ? "border-[#087A55] shadow-md ring-2 ring-[#087A55]/30"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {/* Variant Header Info & Apply Button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">{v.name}</h4>
                      {isCurrentlySelected && (
                        <span className="text-[11px] font-bold text-[#087A55] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active Choice</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#087A55] font-semibold mt-0.5 inline-block">{v.badge}</span>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">{v.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVariant(v.id);
                    }}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shrink-0 shadow-xs cursor-pointer ${
                      isCurrentlySelected
                        ? "bg-[#087A55] text-white hover:bg-[#066747]"
                        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-[#087A55] hover:border-[#087A55]"
                    }`}
                  >
                    {hasExistingHeader ? "Apply to Page" : "Insert Header"}
                  </button>
                </div>

                {/* Visual Preview Box */}
                <div className="my-3 rounded-xl overflow-hidden border border-slate-100">{v.preview}</div>

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
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500 text-xs">
            {hasExistingHeader
              ? "Selecting a variant will seamlessly update your existing header without losing your navigation menu."
              : "Header will be inserted at the top of your page."}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 font-semibold text-xs rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
