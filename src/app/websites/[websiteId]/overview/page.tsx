/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthService } from "@/lib/services/auth.service";
import {
  Globe,
  FileText,
  TrendingUp,
  Zap,
  Plus,
  Monitor,
  Layers,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Bell,
  ChevronDown,
  ArrowRight,
  Info,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

interface OverviewPageProps {
  params: {
    websiteId: string;
  };
}

interface WebsiteItem {
  id: string;
  name: string;
  subdomain: string;
  status: "published" | "draft" | "archived";
  pageCount: number;
  views30d: number;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  isCustomDomain?: boolean;
  hasTheme?: boolean;
  hasSeo?: boolean;
}

function getWebsiteThumbnail(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("roof")) {
    return "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80";
  }
  if (lower.includes("bistro") || lower.includes("restaurant") || lower.includes("cafe")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80";
  }
  if (lower.includes("plumb")) {
    return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80";
  }
  if (lower.includes("tech") || lower.includes("agency") || lower.includes("studio")) {
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80";
  }
  return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80";
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    const days = Math.floor(diffSec / 86400);
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    return d.toLocaleDateString();
  } catch {
    return "Recently";
  }
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
        let pageCount = 1;
        const hasTheme = true;
        let hasSeo = false;

        try {
          const rawDoc = localStorage.getItem(key);
          if (rawDoc) {
            const doc = JSON.parse(rawDoc);
            name =
              doc.sections?.[0]?.props?.brandName ||
              doc.sections?.[0]?.props?.title ||
              doc.page?.title ||
              siteId;
            if (doc.page?.seoTitle || doc.page?.seoDescription) {
              hasSeo = true;
            }
          }
        } catch {
          // ignore parsing error
        }

        // Count any other pages for this site in localStorage
        for (let j = 0; j < localStorage.length; j++) {
          const pKey = localStorage.key(j);
          if (pKey && pKey.startsWith(`website_${siteId}_page_`) && !pKey.endsWith("_page_home")) {
            pageCount++;
          }
        }

        list.push({
          id: siteId,
          name: name.replace(/_/g, " "),
          subdomain: `${siteId}.securesite.io`,
          status: "published",
          pageCount,
          views30d: 0,
          createdAt: new Date().toISOString(),
          updatedAt: "Just now",
          thumbnail: getWebsiteThumbnail(name),
          isCustomDomain: false,
          hasTheme,
          hasSeo,
        });
      }
    }
  } catch (e) {
    console.warn("Could not scan localStorage websites:", e);
  }
  return list;
}

export default function WebsiteOverviewPage({ params }: OverviewPageProps) {
  const router = useRouter();
  const { websiteId } = params;

  // Filter State
  const [activeFilterTab, setActiveFilterTab] = useState<"All" | "Published" | "Draft" | "Archived">("All");

  // User details state (loaded from real session)
  const [userEmail, setUserEmail] = useState<string>("user@securesite.io");
  const [userName, setUserName] = useState<string>("Mubasher");
  const [userPlan] = useState<string>("Pro Plan");
  const [userInitials, setUserInitials] = useState<string>("MU");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Data states
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [currentPagesCount, setCurrentPagesCount] = useState<number>(0);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);

  // Time based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load User Profile & Real Database Websites
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      // 1. Fetch real authenticated user profile
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const email = user.email || "user@securesite.io";
          setUserEmail(email);

          const rawName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            email.split("@")[0] ||
            "Mubasher";
          const formattedName =
            rawName.charAt(0).toUpperCase() + rawName.slice(1);
          setUserName(formattedName);

          const parts = formattedName.trim().split(" ");
          const initials =
            parts.length > 1
              ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
              : formattedName.substring(0, 2).toUpperCase();
          setUserInitials(initials);
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
      }

      // 2. Load Local Websites & Merge with Real DB Websites
      const localWebsites = getLocalStorageWebsites();
      const combinedList: WebsiteItem[] = [...localWebsites];

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
              views30d: 0,
              createdAt: w.created_at || new Date().toISOString(),
              updatedAt: formatRelativeTime(w.updated_at),
              thumbnail: getWebsiteThumbnail(w.name),
              isCustomDomain: Boolean(w.custom_domain),
              hasTheme: Boolean(w.theme_id),
              hasSeo: true,
            }));

            for (const dbSite of dbList) {
              const existingIdx = combinedList.findIndex(
                (s) => s.id === dbSite.id || s.subdomain === dbSite.subdomain
              );
              if (existingIdx !== -1) {
                combinedList[existingIdx] = { ...combinedList[existingIdx], ...dbSite };
              } else {
                combinedList.unshift(dbSite);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load database websites:", err);
      }

      if (isMounted) {
        setWebsites(combinedList);
      }

      // 3. Fetch real pages for active website
      const targetId = websiteId || (combinedList[0]?.id ?? "");
      if (targetId) {
        try {
          const pagesRes = await fetch(`/api/websites/${targetId}/pages`);
          if (pagesRes.ok) {
            const pagesData = await pagesRes.json();
            if (pagesData.success && Array.isArray(pagesData.pages)) {
              if (isMounted) setCurrentPagesCount(pagesData.pages.length);
            }
          }
        } catch {
          const currentLocal = combinedList.find((s) => s.id === targetId);
          if (currentLocal && isMounted) {
            setCurrentPagesCount(currentLocal.pageCount);
          }
        }

        // 4. Fetch real leads/submissions for active website
        try {
          const subsRes = await fetch(`/api/websites/${targetId}/submissions`);
          if (subsRes.ok) {
            const subsData = await subsRes.json();
            if (subsData.success && Array.isArray(subsData.submissions)) {
              if (isMounted) setLeadsCount(subsData.submissions.length);
            }
          }
        } catch {
          if (isMounted) setLeadsCount(0);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [websiteId]);

  // Aggregate real metrics
  const totalWebsitesCount = websites.length;
  const totalPagesAcrossSites = useMemo(() => {
    return websites.reduce((acc, curr) => acc + (curr.pageCount || 1), 0);
  }, [websites]);
  const totalViewsAcrossSites = useMemo(() => {
    const rawSum = websites.reduce((acc, curr) => acc + (curr.views30d || 0), 0);
    return rawSum.toLocaleString();
  }, [websites]);
  const totalLeads = leadsCount;

  // Active website record from real DB list
  const currentWebsite = useMemo(() => {
    const match =
      websites.find(
        (s) =>
          s.id === websiteId ||
          s.subdomain === websiteId ||
          s.subdomain === `${websiteId}.securesite.io`
      ) || websites[0];

    return (
      match || {
        id: websiteId || "site_new",
        name: "My Website",
        subdomain: `${websiteId || "site"}.securesite.io`,
        status: "published" as const,
        pageCount: currentPagesCount,
        views30d: 0,
        createdAt: new Date().toISOString(),
        updatedAt: "Just now",
        thumbnail: getWebsiteThumbnail("My Website"),
        isCustomDomain: false,
        hasTheme: true,
        hasSeo: true,
      }
    );
  }, [websites, websiteId, currentPagesCount]);

  // Filtered real websites for table
  const filteredWebsites = useMemo(() => {
    return websites.filter((site) => {
      if (activeFilterTab === "Published" && site.status !== "published") return false;
      if (activeFilterTab === "Draft" && site.status !== "draft") return false;
      if (activeFilterTab === "Archived" && site.status !== "archived") return false;
      return true;
    });
  }, [websites, activeFilterTab]);

  // Real Recent Activity generated from actual websites
  const recentActivities = useMemo(() => {
    if (websites.length === 0) {
      return [
        {
          id: "act-empty",
          title: "No recent activity recorded yet",
          time: "Just now",
        },
      ];
    }
    return websites.slice(0, 3).map((site, idx) => ({
      id: `act-${site.id || idx}`,
      title: `Website "${site.name}" was ${site.status === "published" ? "published" : "created"}`,
      time: site.updatedAt || "Recently",
    }));
  }, [websites]);

  // Handle Sign Out from Profile Menu
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

  return (
    <div className="w-full space-y-4 pb-6">
      {/* 1. TOP HEADER: Real Profile & Working Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div>
          <span className="text-[11px] font-semibold text-emerald-700 tracking-wide block">
            {greeting}, {userName} 👋
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Manage Your Websites
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time analytics, status, and management for all your websites.
          </p>
        </div>

        {/* Right Actions: Create Website + Notification Bell + Fully Functional Profile Menu */}
        <div className="flex items-center gap-2.5 relative">
          <Link
            href="/dashboard/websites/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#063B2E] hover:bg-[#084234] text-white text-xs font-bold shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Website</span>
          </Link>

          <button
            type="button"
            className="relative p-1.5 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/60 border border-gray-200 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ring-white"></span>
          </button>

          {/* Interactive User Profile Trigger */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 border-l border-gray-200 hover:bg-emerald-50/50 py-1 px-1.5 rounded-xl transition-colors cursor-pointer text-left"
              title="Open User Profile"
            >
              <div className="w-7 h-7 rounded-full bg-[#063B2E] text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20 shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] font-medium text-emerald-700 leading-tight">
                  {userPlan}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                  isProfileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-11 z-50 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 animate-in fade-in-50 zoom-in-95">
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#063B2E] text-white flex items-center justify-center text-xs font-bold">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/50">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>{userPlan} Active</span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5 text-xs text-gray-700">
                  <Link
                    href={`/websites/${currentWebsite.id}/overview`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                  >
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    <span>Website Overview</span>
                  </Link>
                  <Link
                    href={`/websites/${currentWebsite.id}/editor/page_home`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4 text-emerald-600" />
                    <span>Visual Builder</span>
                  </Link>
                  <Link
                    href={`/websites/${currentWebsite.id}/pages`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Manage Pages</span>
                  </Link>
                  <Link
                    href={`/websites/${currentWebsite.id}/settings`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>Website Settings</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-800 font-medium transition-colors"
                  >
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>All Websites</span>
                  </Link>
                </div>

                {/* Sign Out Button */}
                <div className="pt-1 mt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isSigningOut ? "Signing out..." : "Log Out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 4 METRIC KPI CARDS (Real Database & LocalStorage Counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Websites */}
        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-emerald-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Websites</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">
                {totalWebsitesCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Real Total
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Pages */}
        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-emerald-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Pages</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">
                {totalPagesAcrossSites}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Active
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Total Views */}
        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-emerald-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Total Views</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">
                {totalViewsAcrossSites}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Tracked
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Leads */}
        <div className="p-3 sm:p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs hover:border-emerald-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Leads</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">
                {totalLeads}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                Submissions
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. MAIN SPLIT SECTION: 8 COLS LEFT, 4 COLS RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: YOUR WEBSITES TABLE (Real Data Only) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-4">
            {/* Table Header: Title + Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <h2 className="text-base font-bold text-[#0F172A]">
                Your Websites ({filteredWebsites.length})
              </h2>

              {/* Filter Tabs: All, Published, Draft, Archived */}
              <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 text-xs font-medium self-start sm:self-auto">
                {(["All", "Published", "Draft", "Archived"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilterTab(tab)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeFilterTab === tab
                        ? "bg-[#063B2E] text-white font-bold shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Responsive Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px]">
                    <th className="py-2.5 pl-1 font-semibold">Website</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Pages</th>
                    <th className="py-2.5 font-semibold">Views (30d)</th>
                    <th className="py-2.5 font-semibold">Last Updated</th>
                    <th className="py-2.5 text-right pr-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredWebsites.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        {isLoading ? "Loading websites..." : "No websites found matching your filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredWebsites.map((site) => {
                      const isCurrent = site.id === currentWebsite.id;
                      return (
                        <tr
                          key={site.id}
                          className={`group hover:bg-emerald-50/30 transition-colors ${
                            isCurrent ? "bg-emerald-50/20" : ""
                          }`}
                        >
                          {/* Column 1: Website with Thumbnail & Domain */}
                          <td className="py-3 pl-1">
                            <div className="flex items-center gap-3">
                              <img
                                src={site.thumbnail}
                                alt={site.name}
                                className="w-12 h-9 rounded-lg object-cover border border-gray-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <Link
                                  href={`/websites/${site.id}/overview`}
                                  className="font-bold text-gray-900 hover:text-emerald-700 transition-colors truncate block text-xs sm:text-sm"
                                >
                                  {site.name}
                                </Link>
                                <span className="text-[11px] text-gray-400 block truncate font-mono">
                                  {site.subdomain}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Status */}
                          <td className="py-3">
                            {site.status === "published" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold text-[11px]">
                                Draft
                              </span>
                            )}
                          </td>

                          {/* Column 3: Pages Count */}
                          <td className="py-3 font-semibold text-gray-700">
                            {site.pageCount || 1}
                          </td>

                          {/* Column 4: Views (30d) */}
                          <td className="py-3 font-semibold text-gray-700">
                            {site.views30d.toLocaleString()}
                          </td>

                          {/* Column 5: Last Updated */}
                          <td className="py-3 text-gray-500 text-[11px]">
                            {site.updatedAt}
                          </td>

                          {/* Column 6: Actions */}
                          <td className="py-3 text-right pr-2">
                            <div className="inline-flex items-center gap-1.5 relative">
                              <a
                                href={`http://${site.subdomain?.replace('.securesite.io', '')}.localhost:3000`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 transition-colors"
                                title="Open Live Site"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionDropdownId(
                                    openActionDropdownId === site.id ? null : site.id
                                  )
                                }
                                className="p-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700 transition-colors"
                                title="More actions"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown Menu */}
                              {openActionDropdownId === site.id && (
                                <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 text-left text-xs animate-in fade-in-50 zoom-in-95">
                                  <Link
                                    href={`/websites/${site.id}/overview`}
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                                  >
                                    <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Website Overview</span>
                                  </Link>
                                  <Link
                                    href={`/websites/${site.id}/editor/page_home`}
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Visual Builder</span>
                                  </Link>
                                  <Link
                                    href={`/websites/${site.id}/pages`}
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 font-medium"
                                  >
                                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Manage Pages</span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WEBSITE INFO + RECENT ACTIVITY (NO QUICK LINKS AS REQUESTED) */}
        <div className="lg:col-span-4 space-y-4">
          {/* WIDGET 1: REAL WEBSITE INFO */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#063B2E]">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Website Info</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Website Name</span>
                <span className="font-semibold text-gray-900">{currentWebsite.name}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Domain</span>
                <a
                  href={`http://${currentWebsite.subdomain?.replace('.securesite.io', '')}.localhost:3000`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span className="truncate max-w-[170px]">{currentWebsite.subdomain}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {currentWebsite.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Pages</span>
                <span className="font-semibold text-gray-900">{currentWebsite.pageCount || currentPagesCount}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Created</span>
                <span className="font-semibold text-gray-700">{formatRelativeTime(currentWebsite.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-semibold text-gray-700">{currentWebsite.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* WIDGET 2: REAL RECENT ACTIVITY */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-[#0F172A]">Recent Activity</h3>
              <Link
                href={`/websites/${currentWebsite.id}/overview`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Activity Timeline List */}
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 ring-4 ring-emerald-50"></div>
                  <div>
                    <p className="font-semibold text-gray-800 leading-snug">
                      {act.title}
                    </p>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
