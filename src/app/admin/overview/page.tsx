"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  Database,
  ShieldCheck,
  Activity,
  Server,
  Zap,
} from "lucide-react";

export default function AdminOverviewPage() {
  const systemMetrics = [
    { label: "Total Registered Users", value: "1,248", change: "+14% this month", icon: Users, color: "text-blue-400" },
    { label: "Total Active Websites", value: "3,892", change: "+8% this month", icon: Globe, color: "text-emerald-400" },
    { label: "Published Revisions", value: "14,520", change: "Atomic Swaps OK", icon: Database, color: "text-accent" },
    { label: "Security & RLS Checks", value: "100%", change: "Zero breaches", icon: ShieldCheck, color: "text-green-400" },
  ];

  const recentActivity = [
    { id: "1", type: "publish", text: "Austin Elite Plumbing Pros published revision #12", time: "3 mins ago" },
    { id: "2", type: "user", text: "New enterprise tenant registered: Apex Holdings LLC", time: "12 mins ago" },
    { id: "3", type: "domain", text: "Custom SSL domain provisioned: austineliteplumbing.com", time: "45 mins ago" },
    { id: "4", type: "ai", text: "AI Generator created new 6-section proposal for Roofing niche", time: "1 hour ago" },
    { id: "5", type: "rollback", text: "Tenant rolled back Bella Vita Bistro to revision #3", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Control Plane</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global multi-tenant platform health, tenant isolation logs, and database metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Operational
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{metric.label}</span>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <p className="text-xs text-slate-500">{metric.change}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Logs */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Live Platform Audit Log
            </h2>
            <span className="text-xs text-slate-500">Real-time Supabase Event Stream</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {recentActivity.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand mt-1.5" />
                  <p className="text-xs text-slate-300 font-mono">{log.text}</p>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure & Security Box */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-emerald-400" />
              Infrastructure Status
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">PostgreSQL (Supabase)</span>
                <span className="text-emerald-400 font-semibold">Healthy (14ms)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Wildcard Subdomain Edge</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Schema.org Cache Layer</span>
                <span className="text-emerald-400 font-semibold">Optimized</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Tenant RLS Isolation</span>
                <span className="text-emerald-400 font-semibold">100% Enforced</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/admin/websites"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white font-semibold text-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              Manage All Multi-Tenant Sites
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

