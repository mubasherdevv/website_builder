/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  FileText,
  Edit3,
  Menu as MenuIcon,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  Search,
  Globe,
  Settings,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: {
    websiteId: string;
  };
}

export default function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const isEditor = pathname.includes("/editor/");
  const isNavigation = pathname.includes("/navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Visual builder requires full viewport without workspace sidebars
  if (isEditor) {
    return <>{children}</>;
  }

  const { websiteId } = params;

  // Format website name from id (e.g. site-austin -> Austin Plumbing)
  const websiteName =
    websiteId === "site-austin" || websiteId.includes("austin")
      ? "Austin Plumbing"
      : websiteId
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  const managementNav = [
    { label: "Overview", href: `/websites/${websiteId}/overview`, icon: Layers },
    { label: "Pages", href: `/websites/${websiteId}/pages`, icon: FileText },
    { label: "Visual Builder", href: `/websites/${websiteId}/editor/page_home`, icon: Edit3 },
    { label: "Navigation Menus", href: `/websites/${websiteId}/navigation`, icon: MenuIcon },
    { label: "Blog CMS", href: `/websites/${websiteId}/blog`, icon: BookOpen },
    { label: "Media Library", href: `/websites/${websiteId}/media`, icon: ImageIcon },
    { label: "Form Submissions", href: `/websites/${websiteId}/forms`, icon: MessageSquare },
    { label: "SEO Management", href: `/websites/${websiteId}/seo`, icon: Search },
  ];

  const configNav = [
    { label: "Domain Settings", href: `/websites/${websiteId}/domains`, icon: Globe },
    { label: "Website Settings", href: `/websites/${websiteId}/settings`, icon: Settings },
  ];

  return (
    <div className="h-screen bg-[#F5F9F6] flex font-sans antialiased text-[#1E293B] overflow-hidden">
      {/* Dark Emerald Sidebar (#063B2E) with Smooth Collapse / Expand Animation */}
      <aside
        className={`bg-[#063B2E] text-[#A7F3D0] flex flex-col shrink-0 h-screen border-r border-[#094D3C] hidden lg:flex transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`p-4 border-b border-[#094D3C] flex items-center ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0"
            title="SecureSite Studio"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 text-emerald-400 shrink-0">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <h1 className="text-white text-sm font-bold tracking-tight truncate">
                  SecureSite Studio
                </h1>
                <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-semibold truncate">
                  Website Builder Platform
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Active Website Switcher Card */}
        <div className="px-2.5 pt-3 pb-2">
          <div
            className={`p-2 rounded-xl bg-[#084234] border border-[#0C5241] flex items-center ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            } cursor-pointer hover:border-emerald-500/50 transition-all`}
            title={websiteName}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=80&q=80"
                alt={websiteName}
                className="w-8 h-8 rounded-lg object-cover border border-emerald-500/30 shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-white leading-tight truncate">
                    {websiteName}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    <span className="text-[10px] font-medium text-emerald-300">Published</span>
                  </div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <ChevronDown className="w-4 h-4 text-emerald-400/70 shrink-0" />
            )}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-emerald-900">
          {/* WEBSITE MANAGEMENT */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold tracking-wider text-emerald-400/60 uppercase mb-2 px-2.5 truncate">
                Website Management
              </p>
            )}
            <nav className="space-y-1">
              {managementNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.label === "Overview" && pathname.endsWith("/overview"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      isActive
                        ? "bg-[#DDF3E8] text-[#063B2E] font-bold shadow-sm"
                        : "text-emerald-100/75 hover:bg-[#052F25] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#087A55]" : "text-emerald-300/80"
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* CONFIGURATION */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-bold tracking-wider text-emerald-400/60 uppercase mb-2 px-2.5 truncate">
                Configuration
              </p>
            )}
            <nav className="space-y-1">
              {configNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      sidebarCollapsed ? "justify-center px-0" : ""
                    } ${
                      isActive
                        ? "bg-[#DDF3E8] text-[#063B2E] font-bold shadow-sm"
                        : "text-emerald-100/75 hover:bg-[#052F25] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#087A55]" : "text-emerald-300/80"
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Back to All Websites */}
          <div className="pt-2 border-t border-[#094D3C]">
            <Link
              href="/dashboard"
              title={sidebarCollapsed ? "Back to All Websites" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-200/80 hover:text-white hover:bg-[#052F25] rounded-lg transition-colors ${
                sidebarCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Back to All Websites</span>}
            </Link>
          </div>
        </div>

        {/* Sidebar Collapse Toggle at bottom */}
        <div className="p-3 border-t border-[#094D3C]">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs text-emerald-300 hover:text-white hover:bg-[#052F25] border border-emerald-500/20 transition-all cursor-pointer"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#063B2E] p-4 text-emerald-100 border-b border-[#094D3C] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#094D3C]">
              <span className="text-xs font-bold text-white">{websiteName}</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-emerald-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>
            <nav className="grid grid-cols-2 gap-2 text-xs">
              {managementNav.concat(configNav).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1.5 rounded-md bg-[#084234] text-emerald-200 hover:bg-[#0C5241] flex items-center gap-2"
                >
                  <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Workspace Page Content - Full Width & Responsive */}
        <main
          className={`flex-1 w-full min-w-0 ${
            isNavigation
              ? "overflow-hidden flex flex-col h-screen"
              : "overflow-y-auto p-3 sm:p-4 lg:p-5"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
