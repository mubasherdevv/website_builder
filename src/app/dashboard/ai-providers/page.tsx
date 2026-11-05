"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { createClient } from "@/lib/supabase/client";
import {
  Cpu,
  Plus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Globe,
  Home,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  Crown,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  X,
  Zap,
  PlusCircle,
} from "lucide-react";

interface WebsiteItem {
  id: string;
  name: string;
  subdomain: string;
  status: "published" | "draft";
  pageCount: number;
  updatedAt: string;
  thumbnail: string;
}

function getLocalStorageWebsites(): WebsiteItem[] {
  if (typeof window === "undefined") return [];
  const list: WebsiteItem[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("website_") && key.endsWith("_page_home")) {
        const siteId = key.replace("website_", "").replace("_page_home", "");
        let name = siteId;
        try {
          const rawDoc = localStorage.getItem(key);
          if (rawDoc) {
            const doc = JSON.parse(rawDoc);
            name =
              doc.sections?.[0]?.props?.brandName ||
              doc.sections?.[0]?.props?.title ||
              doc.page?.title ||
              siteId;
          }
        } catch {
          // ignore parse error
        }
        list.push({
          id: siteId,
          name: name.replace(/_/g, " "),
          subdomain: `${siteId}.securesite.io`,
          status: "published",
          pageCount: 1,
          updatedAt: "Just now",
          thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
        });
      }
    }
  } catch (e) {
    console.warn("Could not scan localStorage websites:", e);
  }
  return list;
}

interface AIProvider {
  id: string;
  provider_type: "openai" | "openrouter" | "gemini" | "custom";
  provider_name: string;
  masked_api_key: string;
  base_url: string | null;
  selected_model: string;
  default_model: boolean;
  enabled: boolean;
  connection_status: "untested" | "connected" | "failed";
  last_tested_at: string | null;
  last_error: string | null;
}

interface DiscoveredModel {
  id: string;
  name: string;
  description?: string;
}

export default function AIProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);

  // User & Websites state for sidebar parity with /dashboard
  const [userEmail, setUserEmail] = useState<string>("user@securesite.io");
  const [userName, setUserName] = useState<string>("Studio Member");
  const [userInitials, setUserInitials] = useState<string>("SM");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeWebsiteId, setActiveWebsiteId] = useState<string>("");
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false);
  const [websiteModalSearch, setWebsiteModalSearch] = useState("");
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);

  // Form State
  const [formType, setFormType] = useState<"openai" | "openrouter" | "gemini" | "custom">("openai");
  const [formName, setFormName] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formModel, setFormModel] = useState("gpt-4o-mini");
  const [formDefault, setFormDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Model discovery state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredModels, setDiscoveredModels] = useState<DiscoveredModel[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchProviders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/ai-providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.error("Failed to load AI providers:", e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    async function loadWebsites() {
      const localList = getLocalStorageWebsites();
      const combined: WebsiteItem[] = [...localList];
      try {
        const res = await fetch("/api/websites");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.websites)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbList: WebsiteItem[] = json.websites.map((w: any) => ({
              id: w.subdomain?.startsWith("site_") ? w.subdomain : w.id,
              name: w.name,
              subdomain: w.subdomain?.includes(".") ? w.subdomain : `${w.subdomain || w.id}.securesite.io`,
              status: (w.status === "published" ? "published" : "draft") as "published" | "draft",
              pageCount: 1,
              updatedAt: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "Just now",
              thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
            }));

            for (const dbSite of dbList) {
              const existingIdx = combined.findIndex(
                (s) => s.id === dbSite.id || s.subdomain === dbSite.subdomain
              );
              if (existingIdx !== -1) {
                combined[existingIdx] = { ...combined[existingIdx], ...dbSite };
              } else {
                combined.unshift(dbSite);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Could not load database websites:", e);
      }

      setWebsites(combined);
      if (combined.length > 0) {
        const saved = localStorage.getItem("current_website_id");
        if (saved && combined.some((s) => s.id === saved)) {
          setActiveWebsiteId(saved);
        } else {
          setActiveWebsiteId(combined[0].id);
        }
      }
    }
    loadWebsites();
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || "user@securesite.io";
          const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0];
          setUserEmail(email);
          setUserName(name);

          const parts = name.trim().split(" ");
          const initials = parts.length > 1
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : name.substring(0, 2).toUpperCase();
          setUserInitials(initials);
        }
      } catch (e) {
        console.warn("Could not load current user session:", e);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await AuthService.signOut();
      router.push("/login");
    } catch (e) {
      console.error("Sign out error:", e);
      window.location.href = "/login";
    } finally {
      setIsSigningOut(false);
    }
  };

  const openAddModal = () => {
    setEditingProviderId(null);
    setFormType("openai");
    setFormName("OpenAI Official");
    setFormApiKey("");
    setFormBaseUrl("");
    setFormModel("gpt-4o-mini");
    setFormDefault(providers.length === 0);
    setDiscoveredModels([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: AIProvider) => {
    setEditingProviderId(p.id);
    setFormType(p.provider_type);
    setFormName(p.provider_name);
    setFormApiKey("");
    setFormBaseUrl(p.base_url || "");
    setFormModel(p.selected_model);
    setFormDefault(p.default_model);
    setDiscoveredModels([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDiscoverModels = async () => {
    if (!formApiKey.trim()) {
      setFormError("Please enter an API Key first to discover models");
      return;
    }

    setIsDiscovering(true);
    setFormError(null);
    try {
      const res = await fetch("/api/ai-providers/discover-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_type: formType,
          api_key: formApiKey,
          base_url: formBaseUrl,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setFormError(data.error || "Failed to discover models");
      } else {
        setDiscoveredModels(data.models || []);
        if (data.models?.[0]?.id && !formModel) {
          setFormModel(data.models[0].id);
        }
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error discovering models");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);

    try {
      if (editingProviderId) {
        const payload: Record<string, unknown> = {
          provider_name: formName,
          selected_model: formModel,
          base_url: formBaseUrl,
          default_model: formDefault,
        };
        if (formApiKey.trim()) {
          payload.api_key = formApiKey.trim();
        }

        const res = await fetch(`/api/ai-providers/${editingProviderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to update provider");
      } else {
        const res = await fetch("/api/ai-providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider_type: formType,
            provider_name: formName,
            api_key: formApiKey,
            base_url: formBaseUrl,
            selected_model: formModel,
            default_model: formDefault,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to create provider");
      }

      setIsModalOpen(false);
      await fetchProviders(true);
      setToast({
        type: "success",
        title: editingProviderId ? "Provider Updated" : "Provider Added",
        message: "AI provider configuration and credentials saved securely.",
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/ai-providers/${id}/test`, {
        method: "POST",
      });
      const data = await res.json();
      await fetchProviders(true); // Silent update preserves the cards in UI

      if (data.success) {
        setToast({
          type: "success",
          title: "Connection Successful",
          message: `Connection verified! Latency: ${data.latencyMs ?? 0}ms.${
            data.modelsFound ? ` Models available: ${data.modelsFound}.` : ""
          }`,
        });
      } else {
        setToast({
          type: "error",
          title: "Connection Failed",
          message: data.error || "Could not connect to provider with supplied credentials.",
        });
      }
    } catch (e) {
      setToast({
        type: "error",
        title: "Test Error",
        message: e instanceof Error ? e.message : "Failed to test provider connection.",
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm("Are you sure you want to remove this AI provider?")) return;
    try {
      await fetch(`/api/ai-providers/${id}`, { method: "DELETE" });
      await fetchProviders(true);
      setToast({
        type: "success",
        title: "Provider Deleted",
        message: "AI provider configuration was removed successfully.",
      });
    } catch {
      setToast({
        type: "error",
        title: "Delete Error",
        message: "Failed to delete provider.",
      });
    }
  };

  const handleToggleDefault = async (p: AIProvider) => {
    try {
      await fetch(`/api/ai-providers/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_model: !p.default_model }),
      });
      await fetchProviders(true);
      setToast({
        type: "success",
        title: !p.default_model ? "Default Set" : "Default Removed",
        message: `${p.provider_name} is ${!p.default_model ? "now" : "no longer"} the default provider.`,
      });
    } catch {
      setToast({
        type: "error",
        title: "Update Error",
        message: "Failed to update default provider.",
      });
    }
  };

  const filteredModalWebsites = websites.filter(
    (s) =>
      s.name.toLowerCase().includes(websiteModalSearch.toLowerCase()) ||
      s.subdomain.toLowerCase().includes(websiteModalSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(websiteModalSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F9F6] flex font-sans antialiased text-[#1E293B]">
      {/* 1. Left Dark Emerald Sidebar (Identical to /dashboard) */}
      <aside className="w-64 bg-[#063B2E] text-white flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto select-none border-r border-[#094D3C] z-30">
        <div className="p-4 space-y-6">
          {/* Logo Branding */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 pt-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-[15px] tracking-tight leading-tight">SecureSite Studio</span>
              <span className="text-[11px] text-[#82B29A] font-medium leading-tight">Website Builder Platform</span>
            </div>
          </Link>

          {/* Nav Groups */}
          <nav className="space-y-5">
            {/* Group 1: WORKSPACE */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-[#82B29A] uppercase tracking-wider">WORKSPACE</p>
              <div className="space-y-0.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home className="w-4 h-4 text-emerald-300" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsWebsitesModalOpen(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>My Websites</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 font-mono">
                    {websites.length}
                  </span>
                </button>
                <Link
                  href="/dashboard/websites/new"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Website</span>
                </Link>
                <Link
                  href="/dashboard/ai-builder"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>AI Website Builder</span>
                </Link>
              </div>
            </div>

            {/* Group 2: ACCOUNT */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-[#82B29A] uppercase tracking-wider">ACCOUNT</p>
              <div className="space-y-0.5">
                <Link
                  href={`/websites/${activeWebsiteId}/domains`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Domains</span>
                </Link>
                <Link
                  href="/dashboard/ai-providers"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold bg-[#DDF3E8] text-[#063B2E] transition-colors shadow-2xs"
                >
                  <Cpu className="w-4 h-4 text-[#063B2E]" />
                  <span>AI Providers</span>
                </Link>
                <Link
                  href="/admin/overview"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Billing & Plan</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Team Members</span>
                </Link>
                <Link
                  href={`/websites/${activeWebsiteId}/settings`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </Link>
                <a
                  href="mailto:support@securesite.io"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </a>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-200/90 hover:text-white hover:bg-rose-500/20 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-300" />
                  <span>{isSigningOut ? "Signing out..." : "Log Out"}</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Bottom Pro Plan Card in Sidebar */}
        <div className="p-4 pt-0">
          <div className="p-3.5 bg-[#084234] border border-[#0C5241] rounded-xl space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Crown className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pro Plan</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300/70" />
            </div>
            <p className="text-[11px] text-[#93C0A9] leading-tight">
              {websites.length} of 10 websites used
            </p>
            <div className="w-full bg-[#114634] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, (websites.length / 10) * 100))}%` }}
              />
            </div>
            <Link
              href="/admin/overview"
              className="w-full py-1.5 px-3 bg-[#DDF3E8] hover:bg-white text-[#063B2E] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-3 h-3 text-[#063B2E]" />
              <span>Upgrade Plan</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-3 fade-in duration-200">
            <div
              className={`p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-[#063B2E] text-white border-emerald-500/40"
                  : "bg-[#7F1D1D] text-white border-red-500/40"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-200"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-300" />
                )}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-xs font-bold leading-tight tracking-wide text-white">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-white/90 mt-0.5 leading-snug break-words">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        {/* Top Header (Identical to /dashboard) */}
        <header className="h-16 bg-white px-6 sm:px-8 flex items-center justify-end sticky top-0 z-20 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            </button>

            <div className="relative pl-2 border-l border-gray-200">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#063B2E] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-[140px]">{userName}</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[140px]">{userEmail}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href={`/websites/${activeWebsiteId}/settings`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>Account Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isSigningOut ? "Signing out..." : "Log Out"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* AI Providers Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#087A55] mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Provider Management</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              AI Providers & Models
            </h1>
            <p className="text-xs text-[#64748B] mt-1 max-w-xl">
              Configure OpenAI, OpenRouter, Google Gemini, or Custom endpoints securely. Credentials are encrypted server-side with AES-256-GCM.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#063B2E] text-white hover:bg-[#087A55] transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Provider</span>
          </button>
        </div>

        {/* Informational Product Notice */}
        <div className="my-6 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-[#087A55] shrink-0 mt-0.5" />
          <div className="text-xs text-[#334155] leading-relaxed">
            <span className="font-bold text-[#0F172A]">Non-AI Builder Confirmation: </span>
            SecureSite Studio is strictly <strong>NOT</strong> an AI website builder. Connected models are used solely as optional analysis assistants for business profiling, service recommendations, and SEO keyword research in the website creation wizard.
          </div>
        </div>

        {/* Providers List Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#334155]">
            <span>Configured Providers ({providers.length})</span>
            <span className="text-[#087A55]">Encrypted with AES-256-GCM</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#087A55]" />
              <span>Loading AI providers...</span>
            </div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] space-y-3">
              <Cpu className="w-8 h-8 mx-auto text-[#94A3B8]" />
              <div className="text-sm font-bold text-[#0F172A]">No AI Providers Configured</div>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Add an OpenAI, OpenRouter, Google Gemini, or Custom API key to enable AI-powered business profiling and keyword research.
              </p>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#063B2E] text-white hover:bg-[#087A55] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Configure First Provider</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#087A55] flex items-center justify-center font-bold text-sm">
                        {p.provider_type === "openai" ? "AI" : p.provider_type === "openrouter" ? "OR" : p.provider_type === "gemini" ? "G" : "C"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0F172A]">{p.provider_name}</span>
                          {p.default_model && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E8F8F0] text-[#087A55] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#64748B] capitalize">{p.provider_type} Provider</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.connection_status === "connected" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#166534]">
                          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                          <span>Connected</span>
                        </span>
                      ) : p.connection_status === "failed" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEE2E2] text-[#991B1B]">
                          <XCircle className="w-3 h-3 text-[#DC2626]" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#64748B]">
                          <Clock className="w-3 h-3" />
                          <span>Untested</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="space-y-1.5 text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-xl border border-[#F1F5F9]">
                    <div className="flex justify-between">
                      <span className="text-[#334155] font-medium">Selected Model:</span>
                      <span className="font-mono text-[#0F172A] font-semibold">{p.selected_model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#334155] font-medium">API Credential:</span>
                      <span className="font-mono text-[#64748B]">{p.masked_api_key}</span>
                    </div>
                    {p.base_url && (
                      <div className="flex justify-between truncate">
                        <span className="text-[#334155] font-medium">Base URL:</span>
                        <span className="font-mono text-[#64748B] truncate max-w-[200px]">{p.base_url}</span>
                      </div>
                    )}
                    {p.last_tested_at && (
                      <div className="flex justify-between text-[11px] pt-1 border-t border-[#E2E8F0]/50">
                        <span>Last Tested:</span>
                        <span>{new Date(p.last_tested_at).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>

                  {p.last_error && (
                    <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FEE2E2] text-[11px] text-[#991B1B] flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="truncate">{p.last_error}</span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestConnection(p.id)}
                        disabled={testingId === p.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] hover:border-gray-300 transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testingId === p.id ? "animate-spin text-[#087A55]" : ""}`} />
                        <span>{testingId === p.id ? "Testing..." : "Test"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleDefault(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          p.default_model
                            ? "bg-[#E8F8F0] text-[#087A55]"
                            : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        {p.default_model ? "Default" : "Set Default"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                        title="Edit Provider"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProvider(p.id)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2]/40 transition-colors"
                        title="Delete Provider"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      </div>

      {/* Websites Selector Modal (Identical to /dashboard) */}
      {isWebsitesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F5F9F6] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#DDF3E8] text-emerald-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">My Websites</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select a website to jump directly into its overview and management dashboard.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWebsitesModalOpen(false);
                  setWebsiteModalSearch("");
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 bg-white shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={websiteModalSearch}
                  onChange={(e) => setWebsiteModalSearch(e.target.value)}
                  placeholder="Search websites by name or domain..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Websites List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {websites.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Layers className="w-10 h-10 mx-auto mb-2 opacity-40 stroke-1 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-700">No websites created yet</p>
                  <p className="text-[11px] text-gray-400 mt-1 mb-4">
                    Your database has 0 websites right now. Click below to create one.
                  </p>
                  <Link
                    href="/dashboard/websites/new"
                    onClick={() => setIsWebsitesModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#087A55] hover:bg-[#066747] text-white text-xs font-semibold rounded-lg shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Website</span>
                  </Link>
                </div>
              ) : filteredModalWebsites.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40 stroke-1 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-700">No websites match your search</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Try searching with a different term.</p>
                </div>
              ) : (
                filteredModalWebsites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem("current_website_id", site.id);
                      } catch {}
                      setIsWebsitesModalOpen(false);
                      router.push(`/websites/${site.id}/overview`);
                    }}
                    className="w-full group flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all text-left cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={site.thumbnail}
                          alt={site.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                            {site.name}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                              site.status === "published"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {site.status === "published" ? "Live" : "Draft"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono truncate">{site.subdomain}</p>
                        <p className="text-[10px] text-gray-400">📄 {site.pageCount} Pages • 🕒 {site.updatedAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500 font-medium">
                {websites.length} total {websites.length === 1 ? "website" : "websites"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsWebsitesModalOpen(false);
                    setWebsiteModalSearch("");
                  }}
                  className="px-3 py-1.5 border border-gray-200 text-xs text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Link
                  href="/dashboard/websites/new"
                  onClick={() => setIsWebsitesModalOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#087A55] hover:bg-[#066747] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Website</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add / Edit Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F8F0] text-[#087A55] flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {editingProviderId ? "Edit AI Provider" : "Add AI Provider"}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Encrypted using AES-256-GCM. Never exposed to browser.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#991B1B] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProvider} className="space-y-4 text-xs">
              {/* Provider Type */}
              {!editingProviderId && (
                <div>
                  <label className="block font-bold text-[#334155] mb-1">Provider Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const t = e.target.value as "openai" | "openrouter" | "gemini" | "custom";
                      setFormType(t);
                      if (t === "openai") {
                        setFormName("OpenAI Official");
                        setFormModel("gpt-4o-mini");
                      } else if (t === "openrouter") {
                        setFormName("OpenRouter");
                        setFormModel("openai/gpt-4o-mini");
                      } else if (t === "gemini") {
                        setFormName("Google Gemini");
                        setFormModel("gemini-1.5-flash");
                      } else {
                        setFormName("Custom LLM");
                        setFormModel("");
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-medium text-[#0F172A]"
                  >
                    <option value="openai">OpenAI (Official)</option>
                    <option value="openrouter">OpenRouter (Multi-model)</option>
                    <option value="gemini">Google Gemini (Official)</option>
                    <option value="custom">Custom OpenAI-Compatible API</option>
                  </select>
                </div>
              )}

              {/* Provider Name */}
              <div>
                <label className="block font-bold text-[#334155] mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Production OpenAI"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A]"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block font-bold text-[#334155] mb-1">
                  API Key {editingProviderId ? "(Leave empty to keep existing)" : "*"}
                </label>
                <input
                  type="password"
                  required={!editingProviderId}
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  placeholder={editingProviderId ? "••••••••••••••••" : "Paste your API key..."}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono text-[#0F172A]"
                />
              </div>

              {/* Base URL (for custom or openrouter override) */}
              {(formType === "custom" || formType === "openai") && (
                <div>
                  <label className="block font-bold text-[#334155] mb-1">
                    Base URL {formType === "custom" ? "(Required)" : "(Optional)"}
                  </label>
                  <input
                    type="url"
                    required={formType === "custom"}
                    value={formBaseUrl}
                    onChange={(e) => setFormBaseUrl(e.target.value)}
                    placeholder="https://api.together.xyz/v1"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono text-[#0F172A]"
                  />
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    SSRF protection active: Localhost and private CIDRs are blocked.
                  </p>
                </div>
              )}

              {/* Model Discovery / Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#334155]">Selected Model *</label>
                  <button
                    type="button"
                    onClick={handleDiscoverModels}
                    disabled={isDiscovering}
                    className="text-[11px] text-[#087A55] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isDiscovering ? "animate-spin" : ""}`} />
                    <span>Fetch Models</span>
                  </button>
                </div>

                {discoveredModels.length > 0 ? (
                  <select
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono text-[#0F172A]"
                  >
                    {discoveredModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. gpt-4o-mini, gemini-1.5-flash"
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white font-mono text-[#0F172A]"
                  />
                )}
              </div>

              {/* Default Model Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultModel"
                  checked={formDefault}
                  onChange={(e) => setFormDefault(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#087A55] focus:ring-[#087A55]"
                />
                <label htmlFor="defaultModel" className="text-xs font-semibold text-[#334155]">
                  Set as account default provider
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#063B2E] text-white hover:bg-[#087A55] transition-colors shadow-xs"
                >
                  {isSaving ? "Saving..." : "Save Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
