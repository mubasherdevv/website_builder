/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { createClient } from "@/lib/supabase/client";
import {
  Layers,
  Home,
  PlusCircle,
  Sparkles,
  Globe,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  Crown,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  Rocket,
  FileText,
  HardDrive,
  Plus,
  Zap,
  Activity,
  LogOut,
  Edit3,
  X,
  Cpu,
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

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("user@securesite.io");
  const [userName, setUserName] = useState<string>("Studio Member");
  const [userInitials, setUserInitials] = useState<string>("SM");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeWebsiteId, setActiveWebsiteId] = useState<string>("");
  const [isWebsitesModalOpen, setIsWebsitesModalOpen] = useState(false);
  const [websiteModalSearch, setWebsiteModalSearch] = useState("");
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);

  useEffect(() => {
    async function loadWebsites() {
      // 1. Instantly load local creations from browser memory
      const localList = getLocalStorageWebsites();
      const combined: WebsiteItem[] = [...localList];

      // 2. Fetch from Supabase backend
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

            // Merge with local list avoiding duplicates
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
      } else {
        setActiveWebsiteId("");
      }
    }

    loadWebsites();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("current_website_id");
      if (saved) {
        setActiveWebsiteId(saved);
      }
    } catch {
      // fallback
    }
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

  const filteredModalWebsites = websites.filter(
    (s) =>
      s.name.toLowerCase().includes(websiteModalSearch.toLowerCase()) ||
      s.subdomain.toLowerCase().includes(websiteModalSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(websiteModalSearch.toLowerCase())
  );

  const recentActivities = [
    {
      text: 'Website "Austin Elite Plumbing Pros" was updated',
      time: "10 mins ago",
    },
    {
      text: 'New page "Services" was created',
      time: "2 hours ago",
    },
    {
      text: 'Website "Bella Vita Italian Bistro" was created',
      time: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F9F6] flex">
      {/* 1. Left Dark Emerald Sidebar (Matches Image 1 exactly) */}
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold bg-[#DDF3E8] text-[#063B2E] transition-colors shadow-2xs"
                >
                  <Home className="w-4 h-4 text-[#063B2E]" />
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
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Cpu className="w-4 h-4 text-emerald-300" />
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
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-200/90 hover:text-white hover:bg-rose-500/20 transition-colors text-left"
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
            <p className="text-[11px] text-[#93C0A9] leading-tight">3 of 10 websites used</p>
            <div className="w-full bg-[#114634] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[30%] rounded-full transition-all duration-500" />
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white px-6 sm:px-8 flex items-center justify-end sticky top-0 z-20">
          {/* User & Notification Controls */}
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

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/websites/site-austin/settings"
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

        {/* Dashboard Body Content */}
        <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Good morning, {userName.split(" ")[0]}! 👋</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                Welcome to SecureSite Studio
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Build, manage, and grow your business websites from one place.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/dashboard/ai-providers"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800 text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-all"
              >
                <Cpu className="w-4 h-4 text-[#087A55]" />
                <span>AI Providers</span>
              </Link>
              <Link
                href="/dashboard/websites/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A55] hover:bg-[#066747] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Website</span>
              </Link>
            </div>
          </div>

          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] text-emerald-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Total Websites</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{websites.length}</p>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <span>{websites.length > 0 ? "Live from database" : "0 created"}</span>
                </p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] text-emerald-600 flex items-center justify-center shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Published Websites</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {websites.filter((s) => s.status === "published").length}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {websites.length > 0
                    ? `${Math.round(
                        (websites.filter((s) => s.status === "published").length / websites.length) * 100
                      )}% of total`
                    : "0%"}
                </p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] text-emerald-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {websites.reduce((acc, s) => acc + (s.pageCount || 1), 0)}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <span>Across all sites</span>
                </p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] text-emerald-600 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {websites.length > 0 ? "1.2 MB" : "0 MB"}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                  <span>of 5.0 GB</span>
                  <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[1%]" />
                  </div>
                  <span>{websites.length > 0 ? "0.02%" : "0%"}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Bottom Section: Latest Website (Left) & Recent Activity (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Latest Website (Left, col-span-8) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-emerald-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Latest Website</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWebsitesModalOpen(true)}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Websites ({websites.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {websites.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center justify-center shadow-2xs">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <Layers className="w-6 h-6 stroke-1" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">No websites created yet</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4 leading-relaxed">
                    You don&apos;t have any websites in your database yet. Create your first website with our visual builder.
                  </p>
                  <Link
                    href="/dashboard/websites/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#087A55] hover:bg-[#066747] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Website</span>
                  </Link>
                </div>
              ) : websites[0] ? (
                (() => {
                  const site = websites[0];
                  return (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row justify-between">
                      <div className="sm:w-56 relative aspect-[16/10] sm:aspect-auto overflow-hidden bg-gray-100 shrink-0">
                        <img
                          src={site.thumbnail}
                          alt={site.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${
                            site.status === "published" ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                        >
                          {site.status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Active Project
                            </span>
                            <span className="text-[11px] text-gray-400">🕒 {site.updatedAt}</span>
                          </div>
                          <Link
                            href={`/websites/${site.id}/overview`}
                            onClick={() => {
                              try {
                                localStorage.setItem("current_website_id", site.id);
                              } catch {}
                            }}
                            className="font-bold text-sm text-gray-900 hover:text-emerald-700 transition-colors block"
                          >
                            {site.name}
                          </Link>
                          <p className="text-xs text-gray-500 font-mono">{site.subdomain}</p>
                          <p className="text-xs text-gray-500">📄 {site.pageCount} Pages published and configured</p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-2.5">
                          <Link
                            href={`/websites/${site.id}/editor/home`}
                            onClick={() => {
                              try {
                                localStorage.setItem("current_website_id", site.id);
                              } catch {}
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#087A55] hover:bg-[#066747] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Open Visual Editor</span>
                          </Link>
                          <Link
                            href={`/websites/${site.id}/overview`}
                            onClick={() => {
                              try {
                                localStorage.setItem("current_website_id", site.id);
                              } catch {}
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <span>Manage Site</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>

            {/* Recent Activity (Right, col-span-4) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
                </div>
                <Link href="/dashboard" className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-2xs">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs relative">
                    {/* Connecting line */}
                    {idx < recentActivities.length - 1 && (
                      <div className="absolute left-[7px] top-3.5 bottom-[-16px] w-0.5 bg-gray-100" />
                    )}
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium leading-snug">{act.text}</p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* All Websites Selector Modal */}
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
    </div>
  );
}
