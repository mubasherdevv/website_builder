"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { listTemplates, cloneTemplateForWebsite } from "@/templates/services/template-clone.service";
import { listThemePresets } from "@/themes/presets";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
} from "lucide-react";

export const CreationWizard: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [websiteName, setWebsiteName] = useState("Lone Star Roofing Pro");
  const [category, setCategory] = useState("Contractor & Construction");
  const [selectedTemplateId, setSelectedTemplateId] = useState("template-local-plumber");
  const [phone, setPhone] = useState("(512) 555-0144");
  const [email, setEmail] = useState("info@lonestarroofing.com");
  const [address, setAddress] = useState("1024 Main St, Austin, TX");
  const [subdomain, setSubdomain] = useState("lonestar-roofing");
  const [selectedThemeId, setSelectedThemeId] = useState("theme-emerald-forest");

  const templates = listTemplates();
  const themes = listThemePresets();

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    const chosenTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
    
    // Perform independent template cloning
    const { clonedPages } = cloneTemplateForWebsite(chosenTemplate, {
      businessName: websiteName,
      phone,
      email,
      address,
    });

    // Save cloned draft to local storage as mock session persistence
    const newSiteId = `site_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(`website_${newSiteId}_page_home`, JSON.stringify(clonedPages[0]));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/websites/${newSiteId}/editor/page_home`);
    }, 700);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Stepper Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          {["Basic Info", "Template", "Contact", "Branding", "Review"].map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-status-success text-white"
                      : isCurrent
                      ? "bg-brand text-white shadow-md ring-4 ring-brand-soft"
                      : "bg-surface border border-border text-text-muted"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className="text-[11px] font-medium text-text-secondary mt-1 hidden sm:block">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-brand h-full transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Container Card */}
      <div className="bg-surface rounded-card border border-border p-8 shadow-sm">
        {/* Step 1: Website Name & Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-text-primary">Website Name & Business Category</h2>
              <p className="text-xs text-text-secondary">
                Tell us the primary name of your company and your business category.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Website Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g. Austin Pro Roofing"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Business Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                >
                  <option value="Contractor & Construction">Contractor & Construction</option>
                  <option value="Plumbing & HVAC">Plumbing & HVAC</option>
                  <option value="Digital Agency & Marketing">Digital Agency & Marketing</option>
                  <option value="Restaurant & Hospitality">Restaurant & Hospitality</option>
                  <option value="Healthcare & Dental">Healthcare & Dental</option>
                  <option value="Legal & Professional">Legal & Professional</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Template */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-text-primary">Choose a Foundation Template</h2>
              <p className="text-xs text-text-secondary">
                Pick a high-converting layout. You can customize every section, color, and word later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-btn border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-brand bg-brand-soft/40 shadow-sm ring-2 ring-brand"
                        : "border-border bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="h-28 rounded-md bg-surface-subtle overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tpl.thumbnailUrl}
                          alt={tpl.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-bold text-xs text-text-primary">{tpl.name}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-border/50">
                      <span className="font-mono uppercase">{tpl.category}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Business Details & Contact Info */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-text-primary">Business Contact & Subdomain</h2>
              <p className="text-xs text-text-secondary">
                These will be automatically injected into your website&apos;s header, hero, contact form, and footer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Public Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Public Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@business.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Physical Office Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Commerce St, Suite 100"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Platform Subdomain *
                </label>
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 text-text-muted absolute left-3" />
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full pl-9 pr-36 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                  <span className="absolute right-3 text-xs font-mono text-text-muted">
                    .securesite.io
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Brand Styling & Colors */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-text-primary">Theme & Brand Palette</h2>
              <p className="text-xs text-text-secondary">
                Select your default visual theme tokens. You can modify any token in the visual editor anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themes.map((th) => {
                const isSelected = selectedThemeId === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSelectedThemeId(th.id)}
                    className={`p-4 rounded-btn border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-brand bg-brand-soft/40 ring-2 ring-brand"
                        : "border-border bg-surface hover:bg-surface-subtle"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-5 h-5 rounded-full border shadow-sm"
                          style={{ backgroundColor: th.colors.primary }}
                        />
                        <div
                          className="w-5 h-5 rounded-full border shadow-sm"
                          style={{ backgroundColor: th.colors.textPrimary }}
                        />
                        <div
                          className="w-5 h-5 rounded-full border shadow-sm"
                          style={{ backgroundColor: th.colors.appBackground }}
                        />
                      </div>
                      <h4 className="font-bold text-xs text-text-primary">{th.name}</h4>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Font: {th.typography.fontFamily} · Radius: {th.radius.card}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                      <span>Preview</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Review & Confirm */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-text-primary">Review & Generate Website</h2>
              <p className="text-xs text-text-secondary">
                Review your selections before we generate your independent website draft.
              </p>
            </div>

            <div className="bg-surface-subtle rounded-btn p-4 border border-border space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Website Name:</span>
                <span className="font-bold text-text-primary">{websiteName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Category:</span>
                <span className="font-medium text-text-primary">{category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Subdomain:</span>
                <span className="font-mono text-brand font-medium">{subdomain}.securesite.io</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-muted">Contact Info:</span>
                <span className="font-medium text-text-primary">{phone} · {email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Template Foundation:</span>
                <span className="font-medium text-text-primary">{selectedTemplateId}</span>
              </div>
            </div>

            <div className="p-3 bg-brand-soft/50 rounded-btn border border-brand/20 flex items-center gap-2 text-xs text-brand font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                Your website will be created as an independent draft. Template updates will never alter your content.
              </span>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-btn border border-border bg-surface hover:bg-surface-subtle text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-btn bg-brand hover:bg-brand-hover text-white transition-colors shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-btn bg-brand hover:bg-brand-hover text-white transition-colors shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Generating Website..." : "Create & Open Visual Editor"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

