"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIGeneratorService } from "@/lib/ai/ai-generator.service";
import { AIWebsitePrompt, AIWebsiteProposal } from "@/types/ai";
import { PageRenderer } from "@/builder/renderer/PageRenderer";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Building,
  MapPin,
  Wrench,
  Sliders,
  ExternalLink,
} from "lucide-react";

export default function AIWebsiteGeneratorPage() {
  const router = useRouter();

  // Intake Form State
  const [businessName, setBusinessName] = useState("Vanguard Roofing & Solar");
  const [niche, setNiche] = useState("Roofing Contractor");
  const [location, setLocation] = useState("Austin, TX");
  const [phone, setPhone] = useState("(512) 555-0199");
  const [services, setServices] = useState("Emergency Roof Repair, Hail Damage Inspection, Shingle Replacement");
  const [brandTone, setBrandTone] = useState<AIWebsitePrompt["brandTone"]>("professional");

  // Generator Pipeline State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [proposal, setProposal] = useState<AIWebsiteProposal | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setProposal(null);

    // Simulate multi-step generation pipeline
    setProgressStep("Researching geo-targeted keywords and intent...");
    await new Promise((r) => setTimeout(r, 600));

    setProgressStep("Drafting 1,500+ word high-converting local service copy...");
    await new Promise((r) => setTimeout(r, 600));

    setProgressStep("Assembling schema-validated sections and theme tokens...");
    await new Promise((r) => setTimeout(r, 600));

    const promptData: AIWebsitePrompt = {
      businessName,
      niche,
      location,
      phone,
      services: services.split(",").map((s) => s.trim()).filter(Boolean),
      brandTone,
    };

    try {
      const generated = await AIGeneratorService.generateWebsiteProposal(promptData);
      setProposal(generated);
      setIsGenerating(false);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handleApproveProposal = () => {
    if (!proposal) return;

    const newSiteId = `site_${Math.random().toString(36).substring(2, 9)}`;
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `website_${newSiteId}_page_home`,
        JSON.stringify(proposal.pages[0])
      );
    }

    router.push(`/websites/${newSiteId}/editor/page_home`);
  };

  return (
    <main className="min-h-screen bg-surface-background py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-btn border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand" />
                <span>AI Local Website Generator</span>
              </h1>
              <p className="text-xs text-text-secondary">
                Generate a multi-section local business website in 2 minutes with zero coding.
              </p>
            </div>
          </div>
        </div>

        {/* Generator Intake Card */}
        <div className="bg-surface rounded-card border border-border p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-text-primary">
              Business & Service Parameters
            </h2>
            <p className="text-xs text-text-secondary">
              Our AI engine generates localized SEO copy, structured JSON-LD schemas, and conversion hooks from your answers.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Business Name *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Austin Pro Roofing"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Industry / Niche *
                </label>
                <div className="relative">
                  <Wrench className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Roofing Contractor, Emergency Plumber"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Target City & State *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Direct Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(512) 555-0199"
                  className="w-full px-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-text-primary mb-1">
                  Core Services (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Emergency Leak Repair, Roof Replacement, Gutter Installation"
                  className="w-full px-3 py-2 text-sm rounded-btn border border-border bg-surface-subtle focus:outline-none focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-text-primary mb-1">
                  Brand Voice Tone
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "professional", label: "Professional & Reliable" },
                    { id: "energetic", label: "Fast & Energetic" },
                    { id: "luxury", label: "High-End & Luxury" },
                    { id: "friendly", label: "Neighborly & Friendly" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBrandTone(t.id as AIWebsitePrompt["brandTone"])}
                      className={`p-2.5 rounded-btn border text-xs font-semibold transition-all ${
                        brandTone === t.id
                          ? "border-brand bg-brand-soft text-brand ring-2 ring-brand"
                          : "border-border bg-surface text-text-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-text-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Generates Schema-compliant draft with 6 sections</span>
              </span>

              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-brand text-white font-semibold text-xs hover:bg-brand-hover transition-colors shadow-md disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{progressStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Website With AI</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Generated Proposal Full-Screen Preview Modal */}
      {isPreviewOpen && proposal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex flex-col z-50">
          {/* Top Modal Bar */}
          <div className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-status-success-soft text-status-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Proposal Ready for Review</span>
              </span>
              <span className="text-xs font-bold text-text-primary hidden sm:inline">
                {proposal.websiteName} ({proposal.subdomain}.securesite.io)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-btn border border-border text-xs font-semibold text-text-secondary hover:bg-surface-subtle"
              >
                Close / Re-prompt
              </button>

              <button
                type="button"
                onClick={handleApproveProposal}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-btn bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-colors shadow-sm"
              >
                <span>Approve & Open In Visual Builder</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Rendered Canvas */}
          <div className="flex-1 overflow-y-auto bg-surface-background">
            <PageRenderer
              document={proposal.pages[0]}
              theme={proposal.theme}
              mode="public"
            />
          </div>
        </div>
      )}
    </main>
  );
}

