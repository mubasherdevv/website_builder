import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Globe,
  Activity,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm">SecureSite Super Admin</span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                ROOT CONTROL PLANE
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-400">
            <Link
              href="/admin/overview"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" /> Overview
            </Link>
            <Link
              href="/admin/websites"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> All Websites
            </Link>
            <Link
              href="/admin/users"
              className="px-3 py-1.5 rounded-md hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> User Accounts
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Customer App
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {children}
      </main>
    </div>
  );
}

