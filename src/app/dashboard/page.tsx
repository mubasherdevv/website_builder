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
  LayoutGrid,
  Box,
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
  MoreVertical,
  Activity,
  LogOut,
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

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string>("user@securesite.io");
  const [userName, setUserName] = useState<string>("Studio Member");
  const [userInitials, setUserInitials] = useState<string>("SM");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const websites: WebsiteItem[] = [
    {
      id: "site-austin",
      name: "Austin Elite Plumbing Pros",
      subdomain: "austin-plumbing.securesite.io",
      status: "published",
      pageCount: 5,
      updatedAt: "10 mins ago",
      thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "site-nexa",
      name: "Nexa Creative Digital",
      subdomain: "nexa-agency.securesite.io",
      status: "published",
      pageCount: 4,
      updatedAt: "2 hours ago",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "site-bistro",
      name: "Bella Vita Italian Bistro",
      subdomain: "bella-vita.securesite.io",
      status: "draft",
      pageCount: 3,
      updatedAt: "1 day ago",
      thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const popularTemplates = [
    {
      name: "Home Services",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80",
      href: "/dashboard/websites/new?category=services",
    },
    {
      name: "Digital Agency",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80",
      href: "/dashboard/websites/new?category=agency",
    },
    {
      name: "Restaurant",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
      href: "/dashboard/websites/new?category=restaurant",
    },
    {
      name: "Corporate",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80",
      href: "/dashboard/websites/new?category=corporate",
    },
  ];

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
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>My Websites</span>
                </Link>
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
                  href="/websites/site-austin/domains"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-emerald-100/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Domains</span>
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
                  href="/websites/site-austin/settings"
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
        <header className="h-16 bg-white border-b border-gray-100 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search websites, templates, components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 bg-[#F5F9F6] rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
              Ctrl + K
            </span>
          </div>

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
            <Link
              href="/dashboard/websites/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#087A55] hover:bg-[#066747] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Website</span>
            </Link>
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
                <p className="text-2xl font-bold text-gray-900 leading-tight">3</p>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <span>↑ +1 this month</span>
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
                <p className="text-2xl font-bold text-gray-900 leading-tight">2</p>
                <p className="text-[11px] text-gray-500 mt-0.5">66% of total</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#DDF3E8] text-emerald-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">Total Pages</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">12</p>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <span>↑ +4 this month</span>
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
                <p className="text-2xl font-bold text-gray-900 leading-tight">2.4 MB</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                  <span>of 5.0 GB</span>
                  <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[5%]" />
                  </div>
                  <span>0.05%</span>
                </div>
              </div>
            </div>
          </div>


          {/* Two-Column Middle Section: Quick Actions & Popular Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick Actions (Left) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2.5">
                <Link
                  href="/dashboard/websites/new"
                  className="p-3 bg-white rounded-xl border border-gray-200/80 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#DDF3E8] text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">Create Website</span>
                </Link>

                <Link
                  href="/dashboard/ai-builder"
                  className="p-3 bg-white rounded-xl border border-gray-200/80 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#DDF3E8] text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">Build with AI</span>
                </Link>

                <Link
                  href="/dashboard/websites/new"
                  className="p-3 bg-white rounded-xl border border-gray-200/80 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#DDF3E8] text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">Browse Templates</span>
                </Link>

                <Link
                  href="/websites/site-austin/editor/page_home"
                  className="p-3 bg-white rounded-xl border border-gray-200/80 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#DDF3E8] text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Box className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 leading-tight">Add Component</span>
                </Link>
              </div>
            </div>

            {/* Popular Templates (Right) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Popular Templates</h3>
                <Link
                  href="/dashboard/websites/new"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>View All Templates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {popularTemplates.map((t, idx) => (
                  <Link
                    key={idx}
                    href={t.href}
                    className="group block bg-white rounded-xl border border-gray-200/80 overflow-hidden hover:border-emerald-500/80 hover:shadow-xs transition-all"
                  >
                    <div className="aspect-16/10 overflow-hidden bg-gray-100">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2 text-center">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{t.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Your Websites (Left) & Recent Activity (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Your Websites (Left, col-span-8) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-emerald-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Your Websites</h3>
                </div>
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>View All Websites</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {websites.map((site) => (
                  <div
                    key={site.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview with Badge */}
                      <Link href={`/websites/${site.id}/overview`} className="block relative aspect-16/10 overflow-hidden bg-gray-100">
                        <img
                          src={site.thumbnail}
                          alt={site.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs ${
                            site.status === "published" ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                        >
                          {site.status === "published" ? "Published" : "Draft"}
                        </span>
                      </Link>

                      {/* Content */}
                      <div className="p-3.5 space-y-1">
                        <Link
                          href={`/websites/${site.id}/overview`}
                          className="font-bold text-xs sm:text-sm text-gray-900 hover:text-emerald-700 transition-colors truncate block"
                        >
                          {site.name}
                        </Link>
                        <p className="text-[11px] text-gray-500 font-mono truncate">{site.subdomain}</p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-3.5 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 bg-gray-50/50">
                      <div className="flex items-center gap-2 truncate">
                        <span>📄 {site.pageCount} Pages</span>
                        <span>•</span>
                        <span className="truncate">🕒 {site.updatedAt}</span>
                      </div>
                      <Link
                        href={`/websites/${site.id}/overview`}
                        className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                        title="Website Overview"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
