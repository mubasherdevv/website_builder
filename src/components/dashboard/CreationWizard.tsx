"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listTemplates } from "@/templates/services/template-clone.service";
import { listThemePresets } from "@/themes/presets";
import {
  runBusinessAnalysis,
  ServiceSuggestion,
  LocationSuggestion,
  BlogTitleSuggestion,
  PageKeywordCluster,
} from "@/lib/ai/business-analysis-adapter";
import { BasicBusinessInfo, LocationStrategy } from "@/types/creation-wizard";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  BookOpen,
  Layers,
  Palette,
  ShieldCheck,
  Rocket,
  ChevronDown,
  Languages,
  Tag,
  Link2,
  Flag,
  KeyRound,
  FileText,
  Info,
  Cpu,
  ExternalLink,
} from "lucide-react";

export const CreationWizard: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiProviders, setAiProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  // Fetch configured AI providers
  useEffect(() => {
    fetch("/api/ai-providers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.providers) {
          setAiProviders(data.providers);
          const def = data.providers.find((p: any) => p.default_model && p.enabled);
          const first = data.providers.find((p: any) => p.enabled);
          if (def) setSelectedProviderId(def.id);
          else if (first) setSelectedProviderId(first.id);
        }
      })
      .catch(() => {});
  }, []);

  // Step 1: Basic Business Info
  const [basicInfo, setBasicInfo] = useState<BasicBusinessInfo>({
    projectName: "My Business Website",
    language: "English",
    businessName: "Lone Star Roofing Pro",
    niche: "Roofing & Exterior Contractor",
    websiteUrl: "",
    country: "United States",
    city: "Austin",
    state: "Texas",
    phone: "(512) 555-0144",
    email: "contact@lonestarroofing.com",
    address: "1024 Main St, Austin, TX",
    secondaryKeyword: "roof repair Austin",
  });

  // Step 2: Services
  const [services, setServices] = useState<ServiceSuggestion[]>([
    { id: "srv_1", name: "Residential Roof Replacement", isAiSuggested: false },
    { id: "srv_2", name: "Emergency Storm Damage Repair", isAiSuggested: false },
    { id: "srv_3", name: "Commercial Flat Roofing", isAiSuggested: false },
    { id: "srv_4", name: "Roof Inspection & Maintenance", isAiSuggested: false },
  ]);
  const [newServiceInput, setNewServiceInput] = useState<string>("");

  // Step 3: Locations
  const [locationStrategy, setLocationStrategy] = useState<LocationStrategy>("neighborhoods");
  const [locations, setLocations] = useState<LocationSuggestion[]>([
    { id: "loc_1", name: "Downtown Austin", strategy: "neighborhoods", isAiSuggested: false },
    { id: "loc_2", name: "South Congress", strategy: "neighborhoods", isAiSuggested: false },
    { id: "loc_3", name: "Round Rock", strategy: "nearby_cities", isAiSuggested: false },
  ]);
  const [newLocationInput, setNewLocationInput] = useState<string>("");

  // Step 4: Blog Titles
  const [blogTitles, setBlogTitles] = useState<BlogTitleSuggestion[]>([
    {
      id: "blog_1",
      title: "How Much Does a New Roof Cost in Austin? (2026 Price Guide)",
      intent: "informational",
    },
    {
      id: "blog_2",
      title: "Signs Your Roof Needs Immediate Inspection After a Hailstorm",
      intent: "commercial",
    },
  ]);
  const [newBlogInput, setNewBlogInput] = useState<string>("");

  // Step 5: Keyword Research
  const [keywordClusters, setKeywordClusters] = useState<PageKeywordCluster[]>([
    {
      pageType: "homepage",
      pageName: "Homepage",
      pageSlug: "/",
      primaryKeyword: "Roofing Contractor Austin",
      secondaryKeywords: ["Austin roofer", "best roof repair Austin", "licensed roofing company"],
      longTailKeywords: [
        "emergency roof leak repair Austin TX",
        "residential roof replacement contractors near me",
      ],
      faqKeywords: [
        "How much does roof replacement cost in Austin?",
        "Do you work with homeowner insurance claims?",
      ],
      intent: "Local Commercial",
    },
    {
      pageType: "service",
      pageName: "Residential Roof Replacement",
      pageSlug: "/services/residential-roof-replacement",
      primaryKeyword: "residential roof replacement Austin",
      secondaryKeywords: ["shingle roof replacement", "metal roof installation Austin"],
      longTailKeywords: ["best residential roofing warranty in Austin TX"],
      faqKeywords: ["How long does a full roof replacement take?"],
      intent: "Transactional",
    },
    {
      pageType: "location",
      pageName: "Downtown Austin",
      pageSlug: "/locations/downtown-austin",
      primaryKeyword: "Downtown Austin Roofing Services",
      secondaryKeywords: ["Downtown Austin roofers", "roof repairs downtown"],
      longTailKeywords: ["fast dispatch roofer downtown Austin"],
      faqKeywords: ["Do you offer same-day estimates in Downtown Austin?"],
      intent: "Local Navigational",
    },
  ]);
  const [selectedClusterIndex, setSelectedClusterIndex] = useState<number>(0);

  // Step 6: Design & Branding
  const templates = listTemplates();
  const themes = listThemePresets();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || "template-local-service"
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    themes[0]?.id || "theme-emerald-forest"
  );
  const [brandPrimaryColor, setBrandPrimaryColor] = useState<string>("#087A55");
  const [brandSecondaryColor, setBrandSecondaryColor] = useState<string>("#063B2E");

  // Load from session storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("securesite_wizard_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.basicInfo) setBasicInfo(parsed.basicInfo);
        if (parsed.services) setServices(parsed.services);
        if (parsed.locations) setLocations(parsed.locations);
        if (parsed.blogTitles) setBlogTitles(parsed.blogTitles);
        if (parsed.keywordClusters) setKeywordClusters(parsed.keywordClusters);
        if (parsed.selectedTemplateId) setSelectedTemplateId(parsed.selectedTemplateId);
        if (parsed.selectedThemeId) setSelectedThemeId(parsed.selectedThemeId);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "securesite_wizard_draft",
        JSON.stringify({
          basicInfo,
          services,
          locations,
          locationStrategy,
          blogTitles,
          keywordClusters,
          selectedTemplateId,
          selectedThemeId,
          brandPrimaryColor,
          brandSecondaryColor,
        })
      );
    } catch {
      // Ignore
    }
  }, [
    basicInfo,
    services,
    locations,
    locationStrategy,
    blogTitles,
    keywordClusters,
    selectedTemplateId,
    selectedThemeId,
    brandPrimaryColor,
    brandSecondaryColor,
  ]);

  // AI trigger
  const triggerAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiStatusMessage(null);
    try {
      const result = await runBusinessAnalysis(basicInfo, locationStrategy, {
        providerId: selectedProviderId || undefined,
      });
      if (result.services && result.services.length > 0) setServices(result.services);
      if (result.locations && result.locations.length > 0) setLocations(result.locations);
      if (result.blogTitles && result.blogTitles.length > 0) setBlogTitles(result.blogTitles);
      if (result.keywordClusters && result.keywordClusters.length > 0) {
        setKeywordClusters(result.keywordClusters);
      }
      if (result.providerUsed && result.providerUsed !== "heuristic_offline") {
        setAiStatusMessage(`Generated suggestions using ${result.providerUsed} (${result.modelUsed || "configured model"})`);
      }
    } catch (err) {
      console.warn("AI analysis completed via offline fallback:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Helper additions
  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    const split = newServiceInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newItems: ServiceSuggestion[] = split.map((name, i) => ({
      id: `srv_custom_${Date.now()}_${i}`,
      name,
      isAiSuggested: false,
    }));
    setServices((prev) => [...prev, ...newItems]);
    setNewServiceInput("");
  };

  const handleAddLocation = () => {
    if (!newLocationInput.trim()) return;
    const split = newLocationInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newItems: LocationSuggestion[] = split.map((name, i) => ({
      id: `loc_custom_${Date.now()}_${i}`,
      name,
      strategy: locationStrategy,
      isAiSuggested: false,
    }));
    setLocations((prev) => [...prev, ...newItems]);
    setNewLocationInput("");
  };

  const handleAddBlogTitle = () => {
    if (!newBlogInput.trim()) return;
    const split = newBlogInput
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const newItems: BlogTitleSuggestion[] = split.map((title, i) => ({
      id: `blog_custom_${Date.now()}_${i}`,
      title,
      intent: "informational",
    }));
    setBlogTitles((prev) => [...prev, ...newItems]);
    setNewBlogInput("");
  };

  const activeCluster = keywordClusters[selectedClusterIndex] || keywordClusters[0];

  const updateActiveCluster = (updates: Partial<PageKeywordCluster>) => {
    setKeywordClusters((prev) =>
      prev.map((c, i) => (i === selectedClusterIndex ? { ...c, ...updates } : c))
    );
  };

  // Final generation submission
  const handleFinalGenerate = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        basicInfo,
        services,
        locationStrategy,
        locations,
        blogTitles,
        keywordClusters,
        selectedTemplateId,
        selectedThemeId,
        brandPrimaryColor,
        brandSecondaryColor,
      };

      const res = await fetch("/api/websites/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create website");
      const json = await res.json();
      sessionStorage.removeItem("securesite_wizard_draft");
      if (json.websiteId) {
        router.push(`/websites/${json.websiteId}/overview`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("Failed to create website. Please review your settings and try again.");
    }
  };

  // Stepper definition
  const stepperSteps = [
    {
      num: 1,
      title: "Basic Info",
      desc: "Business details & location",
      icon: Building2,
    },
    {
      num: 2,
      title: "Services",
      desc: "List your business services",
      icon: Layers,
    },
    {
      num: 3,
      title: "Locations",
      desc: "Service areas & nearby cities",
      icon: MapPin,
    },
    {
      num: 4,
      title: "Blog Titles",
      desc: "Content ideas for your blog",
      icon: BookOpen,
    },
    {
      num: 5,
      title: "Keyword Research",
      desc: "SEO keywords & page targeting",
      icon: KeyRound,
    },
    {
      num: 6,
      title: "Design & Branding",
      desc: "Select template & brand style",
      icon: Palette,
    },
    {
      num: 7,
      title: "Review",
      desc: "Check your information",
      icon: ShieldCheck,
    },
    {
      num: 8,
      title: "Generate",
      desc: "Create website & pages",
      icon: Rocket,
    },
  ];

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col lg:flex-row bg-[#F4F6F8]">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-full lg:w-[280px] xl:w-[300px] h-full overflow-y-auto bg-white border-r border-[#E2E8F0] p-4 lg:p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#087A55] flex items-center justify-center text-white shadow-xs shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#0F172A] tracking-tight">
                SecureSite Studio
              </div>
              <div className="text-[10px] text-[#64748B]">Website Builder Platform</div>
            </div>
          </div>

          {/* Section Heading */}
          <div className="mt-5 mb-4">
            <h2 className="text-xs font-bold text-[#0F172A]">Create Website</h2>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              Complete the steps to set up your business website.
            </p>
          </div>

          {/* Vertical Stepper */}
          <div className="relative space-y-1 sm:space-y-1.5">
            {/* Vertical Connector Line */}
            <div className="absolute left-[15px] top-3.5 bottom-3.5 w-[2px] bg-[#E2E8F0] -z-0" />

            {stepperSteps.map((s) => {
              const isCurrent = step === s.num;
              const isCompleted = step > s.num;
              const StepIcon = s.icon;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num <= step) setStep(s.num);
                  }}
                  disabled={s.num > step}
                  className={`relative z-10 w-full text-left flex items-center gap-2.5 p-1.5 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-[#E8F8F0] border border-[#A7F3D0]/70 shadow-2xs"
                      : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-[#087A55] text-white shadow-xs"
                        : isCompleted
                        ? "bg-[#087A55] text-white"
                        : "bg-white border border-[#CBD5E1] text-[#64748B]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                  </div>

                  {/* Step Icon Badge */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-[#D1FAE5] text-[#087A55]"
                        : isCompleted
                        ? "text-[#087A55]"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    <StepIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-bold truncate leading-tight ${
                        isCurrent
                          ? "text-[#063B2E]"
                          : isCompleted
                          ? "text-[#1E293B]"
                          : "text-[#475569]"
                      }`}
                    >
                      {s.title}
                    </div>
                    <div
                      className={`text-[10px] truncate leading-tight ${
                        isCurrent ? "text-[#087A55]" : "text-[#94A3B8]"
                      }`}
                    >
                      {s.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Sidebar Graphic */}
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] hidden lg:block">
          <div className="relative rounded-xl bg-gradient-to-br from-[#E8F8F0] to-[#F0FDF4] p-2.5 border border-[#D1FAE5] overflow-hidden flex items-center justify-center">
            <div className="w-36 h-16 relative flex items-center justify-center">
              <div className="w-28 h-14 bg-white rounded-lg border border-[#A7F3D0] shadow-2xs p-1 flex flex-col justify-between">
                <div className="flex items-center gap-1 pb-0.5 border-b border-[#E2E8F0]">
                  <span className="w-1 h-1 rounded-full bg-[#10B981]" />
                  <span className="w-1 h-1 rounded-full bg-[#34D399]" />
                  <span className="w-1 h-1 rounded-full bg-[#6EE7B7]" />
                </div>
                <div className="space-y-0.5">
                  <div className="w-12 h-1 bg-[#E2E8F0] rounded" />
                  <div className="w-16 h-1 bg-[#F1F5F9] rounded" />
                </div>
                <div className="w-6 h-1.5 bg-[#D1FAE5] rounded" />
              </div>
              <div className="absolute top-0 right-1 transform rotate-12">
                <Rocket className="w-5 h-5 text-[#087A55]" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT MAIN AREA ================= */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-5 lg:p-6 flex flex-col justify-between w-full max-w-6xl mx-auto">
        {/* Top Header Row with 3D Template Cards Visual */}
        <div className="flex items-center justify-between gap-4 pb-2 shrink-0">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] mb-1">
              Step {step} of 8
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
              Create Your Business Website
            </h1>
            <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 max-w-xl">
              Follow a simple workflow to set up your business, services, locations, and SEO keyword plan.
            </p>
          </div>

          {/* Floating Angled 3D Template Cards Visual */}
          <div className="hidden sm:flex items-center justify-end relative w-40 h-14 shrink-0">
            <div className="absolute right-8 top-1 w-20 h-12 bg-white rounded border border-[#E2E8F0] shadow-2xs transform -rotate-12 overflow-hidden opacity-60">
              <div className="h-2 bg-[#CBD5E1]" />
            </div>
            <div className="absolute right-4 top-0.5 w-24 h-13 bg-white rounded border border-[#A7F3D0] shadow-xs transform -rotate-6 overflow-hidden">
              <div className="h-2.5 bg-[#087A55]" />
            </div>
            <div className="absolute right-0 top-0 w-28 h-14 bg-white rounded border border-[#087A55]/30 shadow-md transform rotate-3 overflow-hidden">
              <div className="h-3 bg-[#063B2E] flex items-center justify-between px-1.5 text-[7px] text-white font-bold">
                <span>SecureSite</span>
                <span className="w-1 h-1 rounded-full bg-[#10B981]" />
              </div>
              <div className="p-1 space-y-0.5 bg-[#F8FAFC]">
                <div className="w-10 h-1 bg-[#087A55] rounded" />
                <div className="w-14 h-0.5 bg-[#CBD5E1] rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAIN CARD CONTAINER ================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto mt-2 mb-1">
          {/* STEP 1: BASIC BUSINESS INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Basic Business Information
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      Tell us about your business. You can enter details manually or use AI to analyze.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 self-start sm:self-auto">
                  {aiProviders.length > 0 ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] text-[#334155]">
                      <Cpu className="w-3.5 h-3.5 text-[#087A55]" />
                      <select
                        value={selectedProviderId}
                        onChange={(e) => setSelectedProviderId(e.target.value)}
                        className="bg-transparent border-0 text-[11px] font-semibold text-[#0F172A] focus:outline-none cursor-pointer"
                      >
                        {aiProviders.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.provider_name} ({p.selected_model})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/ai-providers"
                      className="text-[11px] text-[#087A55] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Configure AI Provider →</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={triggerAiAnalysis}
                    disabled={isAiLoading || !basicInfo.niche}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#087A55] border border-[#087A55] hover:bg-[#E8F8F0] transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                    <span>{isAiLoading ? "Analyzing..." : "Analyze Business with AI"}</span>
                  </button>
                </div>
              </div>

              {aiStatusMessage && (
                <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[11px] text-[#166534] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#087A55]" />
                    <span>{aiStatusMessage}</span>
                  </div>
                  <button onClick={() => setAiStatusMessage(null)} className="text-[#166534] hover:text-black">✕</button>
                </div>
              )}

              {/* Form 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {/* Project / Website Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Project / Website Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Layers className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.projectName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, projectName: e.target.value })}
                      placeholder="My Business Website"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Website Language */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Website Language <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Languages className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <select
                      value={basicInfo.language}
                      onChange={(e) => setBasicInfo({ ...basicInfo, language: e.target.value })}
                      className="w-full pl-2 pr-7 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium appearance-none cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Business / Company Name */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Business / Company Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Building2 className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.businessName}
                      onChange={(e) => setBasicInfo({ ...basicInfo, businessName: e.target.value })}
                      placeholder="Lone Star Roofing Pro"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Business Niche / Category */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Business Niche / Category <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Tag className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.niche}
                      onChange={(e) => setBasicInfo({ ...basicInfo, niche: e.target.value })}
                      placeholder="Roofing & Exterior Contractor"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Website URL (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Website URL (Optional)
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Link2 className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.websiteUrl || ""}
                      onChange={(e) => setBasicInfo({ ...basicInfo, websiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Secondary Keyword (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Secondary Keyword (Optional)
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Search className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.secondaryKeyword || ""}
                      onChange={(e) => setBasicInfo({ ...basicInfo, secondaryKeyword: e.target.value })}
                      placeholder="roof repair Austin"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Country <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Globe className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <select
                      value={basicInfo.country}
                      onChange={(e) => setBasicInfo({ ...basicInfo, country: e.target.value })}
                      className="w-full pl-2 pr-7 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium appearance-none cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    City <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.city}
                      onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                      placeholder="Austin"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* State / Region (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    State / Region (Optional)
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Flag className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <select
                      value={basicInfo.state || "Texas"}
                      onChange={(e) => setBasicInfo({ ...basicInfo, state: e.target.value })}
                      className="w-full pl-2 pr-7 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium appearance-none cursor-pointer"
                    >
                      <option value="Texas">Texas</option>
                      <option value="California">California</option>
                      <option value="New York">New York</option>
                      <option value="Florida">Florida</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Business Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Business Phone <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Phone className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      placeholder="(512) 555-0144"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Business Email */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Business Email <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <Mail className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                      placeholder="contact@lonestarroofing.com"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>

                {/* Business Address (Optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Business Address (Optional)
                  </label>
                  <div className="relative rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] transition-all flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={basicInfo.address || ""}
                      onChange={(e) => setBasicInfo({ ...basicInfo, address: e.target.value })}
                      placeholder="1024 Main St, Austin, TX"
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Business Services
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      List your services. Each approved service will generate a dedicated page.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerAiAnalysis}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#087A55] border border-[#087A55] hover:bg-[#E8F8F0] transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                  <span>Suggest Services with AI</span>
                </button>
              </div>

              {/* Add Service Input */}
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1">
                  Add New Services (comma-separated)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] flex items-center">
                    <Layers className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={(e) => setNewServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                      placeholder="e.g. Shingle Replacement, Gutter Installation, Tile Repair..."
                      className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-4 py-1.5 rounded-lg bg-[#063B2E] text-white hover:bg-[#087A55] text-xs font-bold transition-colors shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Approved Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Approved Services ({services.length})</span>
                  <span className="text-[#087A55] font-semibold">Click ✕ to remove</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A]"
                    >
                      <span>{service.name}</span>
                      {service.isAiSuggested && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-[#E8F8F0] text-[#087A55] font-medium">
                          AI
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setServices(services.filter((s) => s.id !== service.id))}
                        className="text-[#94A3B8] hover:text-[#EF4444] transition-colors ml-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATIONS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Service Areas & Nearby Cities
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      Target local communities. Dedicated local landing pages will be created.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerAiAnalysis}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#087A55] border border-[#087A55] hover:bg-[#E8F8F0] transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                  <span>Suggest Locations with AI</span>
                </button>
              </div>

              {/* Strategy Cards */}
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1.5">
                  Location Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "neighborhoods", label: "Neighborhoods", desc: "Local city districts" },
                    { id: "nearby_cities", label: "Nearby Cities", desc: "Metropolitan suburbs" },
                    { id: "custom_areas", label: "Custom Service Areas", desc: "Specific ZIP codes" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setLocationStrategy(st.id as LocationStrategy)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        locationStrategy === st.id
                          ? "border-[#087A55] bg-[#E8F8F0]/40 ring-1 ring-[#087A55]"
                          : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#0F172A]">{st.label}</div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Location Input */}
              <div className="flex gap-2">
                <div className="relative flex-1 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] focus-within:border-[#087A55] flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-[#087A55] ml-3 shrink-0" />
                  <input
                    type="text"
                    value={newLocationInput}
                    onChange={(e) => setNewLocationInput(e.target.value)}
                    placeholder="Enter locations separated by commas (e.g. Downtown, Westlake, Cedar Park)..."
                    className="w-full pl-2 pr-2.5 py-1.5 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-4 py-1.5 rounded-lg bg-[#063B2E] text-white hover:bg-[#087A55] text-xs font-bold transition-colors shadow-xs"
                >
                  Add
                </button>
              </div>

              {/* Location Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>Approved Locations ({locations.length})</span>
                  <span className="text-[#087A55] font-semibold">Click ✕ to remove</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <div
                      key={loc.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A]"
                    >
                      <MapPin className="w-3 h-3 text-[#087A55]" />
                      <span>{loc.name}</span>
                      <button
                        type="button"
                        onClick={() => setLocations(locations.filter((l) => l.id !== loc.id))}
                        className="text-[#94A3B8] hover:text-[#EF4444] transition-colors ml-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BLOG TITLES */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Content Ideas for Your Blog
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      Topic ideas for search authority. Saved as draft posts in your Blog CMS.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="px-2.5 py-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
                  >
                    Skip Blogs
                  </button>
                  <button
                    type="button"
                    onClick={triggerAiAnalysis}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#087A55] border border-[#087A55] hover:bg-[#E8F8F0] transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                    <span>Suggest with AI</span>
                  </button>
                </div>
              </div>

              {/* Add Blog Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#334155]">
                  Add Custom Blog Titles (one per line)
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newBlogInput}
                    onChange={(e) => setNewBlogInput(e.target.value)}
                    placeholder="e.g. 5 Warning Signs Your Roof Needs Replacement..."
                    className="flex-1 p-2 text-xs rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#087A55]"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlogTitle}
                    className="px-4 py-1.5 rounded-lg bg-[#063B2E] text-white hover:bg-[#087A55] text-xs font-bold transition-colors self-end shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Blog Title Cards */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-[#64748B]">Approved Blog Titles ({blogTitles.length})</div>
                {blogTitles.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#087A55]" />
                      <span>{blog.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E2E8F0] text-[#475569] font-medium capitalize">
                        {blog.intent}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlogTitles(blogTitles.filter((b) => b.id !== blog.id))}
                      className="text-[#94A3B8] hover:text-[#EF4444]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: KEYWORD RESEARCH */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      SEO Keywords & Page Targeting
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      Organize keywords by page. Review, edit, and assign queries.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerAiAnalysis}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#087A55] border border-[#087A55] hover:bg-[#E8F8F0] transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                  <span>Regenerate Keywords</span>
                </button>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-[11px] text-[#166534]">
                <Info className="w-3.5 h-3.5 text-[#087A55] shrink-0 mt-0.5" />
                <span>
                  <strong>Planning Notice:</strong> Keyword suggestions model local search intent. External Google volume & CPC integration will arrive in a future update.
                </span>
              </div>

              {/* 2-Column Keyword Interface */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#334155] uppercase">Pages</div>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {keywordClusters.map((cl, idx) => (
                      <button
                        key={cl.pageSlug || idx}
                        type="button"
                        onClick={() => setSelectedClusterIndex(idx)}
                        className={`w-full text-left p-2 rounded-lg border transition-all ${
                          selectedClusterIndex === idx
                            ? "border-[#087A55] bg-[#E8F8F0]/40 ring-1 ring-[#087A55]"
                            : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]"
                        }`}
                      >
                        <div className="text-xs font-bold text-[#0F172A] truncate">
                          {cl.pageName}
                        </div>
                        <div className="text-[10px] text-[#64748B] flex justify-between mt-0.5">
                          <span className="capitalize">{cl.pageType}</span>
                          <span className="text-[#087A55] font-semibold">{cl.intent}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-8 space-y-2.5 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  {activeCluster && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-[#334155] mb-1">
                          Primary Target Keyword *
                        </label>
                        <div className="relative rounded-lg border border-[#E2E8F0] bg-white flex items-center">
                          <KeyRound className="w-3.5 h-3.5 text-[#087A55] ml-2.5 shrink-0" />
                          <input
                            type="text"
                            value={activeCluster.primaryKeyword}
                            onChange={(e) => updateActiveCluster({ primaryKeyword: e.target.value })}
                            className="w-full pl-2 pr-2.5 py-1 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A] font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#334155] mb-1">
                          Secondary Keywords
                        </label>
                        <div className="relative rounded-lg border border-[#E2E8F0] bg-white flex items-center">
                          <Search className="w-3.5 h-3.5 text-[#087A55] ml-2.5 shrink-0" />
                          <input
                            type="text"
                            value={activeCluster.secondaryKeywords.join(", ")}
                            onChange={(e) =>
                              updateActiveCluster({
                                secondaryKeywords: e.target.value
                                  .split(",")
                                  .map((k) => k.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full pl-2 pr-2.5 py-1 text-xs bg-transparent border-0 focus:outline-none text-[#0F172A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#334155] mb-1">
                          FAQ Questions
                        </label>
                        <textarea
                          rows={2}
                          value={activeCluster.faqKeywords.join("\n")}
                          onChange={(e) =>
                            updateActiveCluster({
                              faqKeywords: e.target.value
                                .split("\n")
                                .map((k) => k.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full p-2 text-xs rounded-lg border border-[#E2E8F0] bg-white focus:outline-none focus:border-[#087A55]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DESIGN & BRANDING */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Select Template & Brand Style
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      Select your foundation template. It will be cloned independently into your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplateId === tpl.id
                        ? "border-[#087A55] bg-[#E8F8F0]/30 ring-1 ring-[#087A55]/30 shadow-2xs"
                        : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#0F172A]">{tpl.name}</span>
                      {selectedTemplateId === tpl.id && (
                        <Check className="w-3.5 h-3.5 text-[#087A55]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#64748B] line-clamp-2">{tpl.description}</p>
                    <div className="mt-2 text-[9px] text-[#087A55] font-semibold">
                      {tpl.pages.length} Pages Included
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#F1F5F9]">
                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E2E8F0] p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={brandPrimaryColor}
                      onChange={(e) => setBrandPrimaryColor(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#334155] mb-1">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[#E2E8F0] p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A]">
                      Check Your Information
                    </h2>
                    <p className="text-[11px] text-[#64748B]">
                      Verify your business profile, service pages, locations, and SEO planning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">Business Profile</span>
                    <button onClick={() => setStep(1)} className="text-[10px] text-[#087A55] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-[#64748B] text-[11px] space-y-0.5">
                    <div><span className="font-semibold text-[#334155]">Name:</span> {basicInfo.businessName}</div>
                    <div><span className="font-semibold text-[#334155]">Niche:</span> {basicInfo.niche}</div>
                    <div><span className="font-semibold text-[#334155]">Location:</span> {basicInfo.city}, {basicInfo.country}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">Template & Style</span>
                    <button onClick={() => setStep(6)} className="text-[10px] text-[#087A55] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-[#64748B] text-[11px] space-y-0.5">
                    <div>
                      <span className="font-semibold text-[#334155]">Template:</span>{" "}
                      {templates.find((t) => t.id === selectedTemplateId)?.name || selectedTemplateId}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#334155]">Palette:</span>
                      <span className="w-3 h-3 rounded-full inline-block border border-black/10" style={{ backgroundColor: brandPrimaryColor }} />
                      <span className="w-3 h-3 rounded-full inline-block border border-black/10" style={{ backgroundColor: brandSecondaryColor }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">Services & Locations</span>
                    <button onClick={() => setStep(2)} className="text-[10px] text-[#087A55] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-[#64748B] text-[11px] space-y-0.5">
                    <div>
                      <span className="font-semibold text-[#334155]">Services:</span> {services.length} approved
                    </div>
                    <div>
                      <span className="font-semibold text-[#334155]">Locations:</span> {locations.length} approved
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A]">SEO & Blog Plan</span>
                    <button onClick={() => setStep(5)} className="text-[10px] text-[#087A55] hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="text-[#64748B] text-[11px] space-y-0.5">
                    <div><span className="font-semibold text-[#334155]">Keyword Mappings:</span> {keywordClusters.length} pages</div>
                    <div><span className="font-semibold text-[#334155]">Blog Drafts:</span> {blogTitles.length} planned</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: GENERATE */}
          {step === 8 && (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F8F0] text-[#087A55] flex items-center justify-center mx-auto mb-1 shadow-2xs">
                <Rocket className="w-7 h-7 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A]">Create Your Website and Pages</h2>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                We will clone your template, create draft service and location pages, attach SEO keywords, and initialize your blog drafts.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinalGenerate}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#063B2E] text-white hover:bg-[#087A55] transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Website...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Website</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= CARD FOOTER ACTION BAR ================= */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F1F5F9] shrink-0">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            {step < 8 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(8, s + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-[#063B2E] text-white hover:bg-[#087A55] transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};
