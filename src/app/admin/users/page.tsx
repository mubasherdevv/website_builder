"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  Building,
} from "lucide-react";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const users = [
    {
      id: "u-1",
      name: "Marcus Vance",
      email: "admin@austinplumbing.com",
      role: "owner",
      workspace: "Austin Pro Services",
      websitesCount: 2,
      plan: "Agency Pro ($150/yr)",
      status: "active",
      joinedAt: "2026-09-15",
    },
    {
      id: "u-2",
      name: "Sophia Chen",
      email: "owner@nexacreative.io",
      role: "owner",
      workspace: "Nexa Digital Agency",
      websitesCount: 3,
      plan: "Agency Pro ($150/yr)",
      status: "active",
      joinedAt: "2026-10-01",
    },
    {
      id: "u-3",
      name: "Mario Rossi",
      email: "mario@bellavita.com",
      role: "owner",
      workspace: "Bella Vita Dining",
      websitesCount: 1,
      plan: "Basic ($15/mo)",
      status: "active",
      joinedAt: "2026-10-25",
    },
    {
      id: "u-4",
      name: "Dave Miller",
      email: "tech@vanguardroof.com",
      role: "editor",
      workspace: "Vanguard Roofing Group",
      websitesCount: 1,
      plan: "Basic ($15/mo)",
      status: "active",
      joinedAt: "2026-11-01",
    },
  ];

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.workspace.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">User Accounts & Tenancy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit user roles, workspace allocations, and active subscription tiers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, workspace..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Workspace</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Plan Tier</th>
                <th className="px-5 py-3">Websites</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white text-sm">{user.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {user.workspace}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand/20 text-emerald-300 border border-brand/30 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-emerald-400">
                    {user.plan}
                  </td>
                  <td className="px-5 py-4 font-semibold">{user.websitesCount}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{user.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

