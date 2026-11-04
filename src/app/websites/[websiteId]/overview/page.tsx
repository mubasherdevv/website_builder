/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  FileText,
  Mail,
  HardDrive,
  Calendar,
  ChevronDown,
  ExternalLink,
  Edit3,
  Palette,
  Eye,
  ChevronRight,
  Info,
  Clock,
  Zap,
  ArrowRight,
} from "lucide-react";

interface OverviewPageProps {
  params: {
    websiteId: string;
  };
}

export default function WebsiteOverviewPage({ params }: OverviewPageProps) {
  const { websiteId } = params;
  const timeRange = "Last 30 Days";

  const websiteName =
    websiteId === "site-austin" || websiteId.includes("austin")
      ? "Austin Plumbing"
      : websiteId
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

  const domain = `${websiteId === "site-austin" ? "austin-plumbing" : websiteId}.securesite.io`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1EAE4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#063B2E] tracking-tight">
            Website Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time analytics, quick actions, and status for{" "}
            <span className="font-semibold text-[#063B2E]">{websiteName}</span>.
          </p>
        </div>

        {/* Right: Date Range Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E1EAE4] text-xs font-semibold text-gray-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Site Active</span>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards with Wave Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Visits */}
        <div className="p-4 bg-white rounded-2xl border border-[#E1EAE4] shadow-xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-500">Total Visits</span>
            </div>
            {/* Wave sparkline */}
            <div className="w-20 h-8">
              <svg viewBox="0 0 80 30" className="w-full h-full stroke-[#12A875] fill-none" strokeWidth="2">
                <path d="M 0,22 Q 20,28 35,16 T 60,18 T 80,8" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#063B2E]">12.5K</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              ↑ 12%
            </span>
          </div>
        </div>

        {/* Card 2: Total Pages */}
        <div className="p-4 bg-white rounded-2xl border border-[#E1EAE4] shadow-xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-500">Total Pages</span>
            </div>
            <div className="w-20 h-8">
              <svg viewBox="0 0 80 30" className="w-full h-full stroke-[#12A875] fill-none" strokeWidth="2">
                <path d="M 0,20 Q 25,10 45,22 T 80,10" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#063B2E]">8</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              ↑ 1 new
            </span>
          </div>
        </div>

        {/* Card 3: Form Submissions */}
        <div className="p-4 bg-white rounded-2xl border border-[#E1EAE4] shadow-xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-500">Form Submissions</span>
            </div>
            <div className="w-20 h-8">
              <svg viewBox="0 0 80 30" className="w-full h-full stroke-[#12A875] fill-none" strokeWidth="2">
                <path d="M 0,25 Q 20,26 40,14 T 70,16 T 80,6" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#063B2E]">248</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              ↑ 18%
            </span>
          </div>
        </div>

        {/* Card 4: Storage Used */}
        <div className="p-4 bg-white rounded-2xl border border-[#E1EAE4] shadow-xs relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-gray-500">Storage Used</span>
            </div>
            <div className="w-20 h-8">
              <svg viewBox="0 0 80 30" className="w-full h-full stroke-[#12A875] fill-none" strokeWidth="2">
                <path d="M 0,18 Q 30,24 50,14 T 80,12" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#063B2E]">52 MB</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              ↑ 4%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Quick Actions & Website Info Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl border border-[#E1EAE4] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#063B2E]">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Quick Actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={`/websites/${websiteId}/editor/page_home`}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Edit Website</h4>
                  <p className="text-[11px] text-gray-500">Open visual builder</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-colors" />
            </Link>

            <Link
              href={`/websites/${websiteId}/pages`}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Manage Pages</h4>
                  <p className="text-[11px] text-gray-500">Add or edit pages</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-colors" />
            </Link>

            <Link
              href={`/websites/${websiteId}/theme`}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">Update Theme</h4>
                  <p className="text-[11px] text-gray-500">Change design & style</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-colors" />
            </Link>

            <a
              href={`http://${websiteId}.localhost:3000`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">View Live Site</h4>
                  <p className="text-[11px] text-gray-500">Open in new tab</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-colors" />
            </a>
          </div>
        </div>

        {/* Website Info Card */}
        <div className="bg-white rounded-2xl border border-[#E1EAE4] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#063B2E]">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Website Info</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Website Name</span>
              <span className="font-semibold text-gray-900">{websiteName}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Domain</span>
              <a
                href={`http://${websiteId}.localhost:3000`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span className="truncate max-w-[180px]">{domain}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Published
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Created</span>
              <span className="font-semibold text-gray-700">Jan 20, 2025</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-500">Last Updated</span>
              <span className="font-semibold text-gray-700">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Upgrade Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Recent Activity Timeline (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E1EAE4] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-[#063B2E]">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Recent Activity</span>
              </div>
              <Link
                href={`/websites/${websiteId}/overview`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="font-medium text-gray-800">
                    Page <span className="font-bold text-gray-900">&quot;Services&quot;</span> updated
                  </p>
                </div>
                <span className="text-gray-400 font-medium text-[11px] shrink-0 ml-2">2 hours ago</span>
              </div>

              <div className="flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="font-medium text-gray-800">
                    Theme changed to <span className="font-bold text-gray-900">Modern Green</span>
                  </p>
                </div>
                <span className="text-gray-400 font-medium text-[11px] shrink-0 ml-2">1 day ago</span>
              </div>

              <div className="flex items-start justify-between text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="font-medium text-gray-800">
                    New blog post published: <span className="font-bold text-gray-900">Plumbing Tips</span>
                  </p>
                </div>
                <span className="text-gray-400 font-medium text-[11px] shrink-0 ml-2">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Upgrade Your Plan Banner (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#DDF3E8] via-[#DDF3E8] to-[#EDF4EF] border border-emerald-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#063B2E]">Upgrade Your Plan</h3>
            <p className="text-xs text-emerald-900/80 leading-relaxed max-w-xs">
              Unlock more features and grow your business.
            </p>
            <div className="pt-2">
              <Link
                href="/billing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#087A55] text-white text-xs font-bold hover:bg-[#066747] transition-colors shadow-sm"
              >
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Rocket Graphic */}
          <div className="w-24 h-24 shrink-0 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-emerald-300/30 rounded-full blur-xl"></div>
            <div className="relative text-emerald-700">
              <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                <ellipse cx="25" cy="75" rx="18" ry="10" fill="white" fillOpacity="0.8" />
                <ellipse cx="75" cy="80" rx="16" ry="8" fill="white" fillOpacity="0.8" />
                <ellipse cx="50" cy="85" rx="28" ry="12" fill="white" fillOpacity="0.9" />
                <circle cx="50" cy="70" r="8" fill="#A7F3D0" />
                <circle cx="44" cy="62" r="5" fill="#6EE7B7" />
                <circle cx="56" cy="63" r="5" fill="#6EE7B7" />
                <path
                  d="M50 15 C42 28 38 48 38 58 L62 58 C62 48 58 28 50 15 Z"
                  fill="#087A55"
                />
                <path
                  d="M50 15 C46 22 44 30 44 32 L56 32 C56 30 54 22 50 15 Z"
                  fill="#10B981"
                />
                <circle cx="50" cy="38" r="5" fill="#A7F3D0" stroke="#044E37" strokeWidth="2" />
                <path d="M38 48 L28 62 L38 58 Z" fill="#10B981" />
                <path d="M62 48 L72 62 L62 58 Z" fill="#10B981" />
                <path d="M46 58 Q50 72 50 72 Q50 72 54 58 Z" fill="#F59E0B" />
                <path d="M48 58 Q50 67 50 67 Q50 67 52 58 Z" fill="#FBBF24" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
