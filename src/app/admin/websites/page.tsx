"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function AdminWebsitesPage() {
  const [search, setSearch] = useState("");

  const allWebsites = [
    {
      id: "site-austin",
      workspace: "Austin Pro Services",
      name: "Austin Elite Plumbing Pros",
      subdomain: "austin-plumbing",
      customDomain: "austineliteplumbing.com",
      status: "published",
      pagesCount: 5,
      createdAt: "2026-10-12",
      ownerEmail: "admin@austinplumbing.com",
    },
    {
      id: "site-nexa",
      workspace: "Nexa Digital Agency",
      name: "Nexa Creative Digital",
      subdomain: "nexa-agency",
      customDomain: null,
      status: "published",
      pagesCount: 4,
      createdAt: "2026-10-20",
      ownerEmail: "owner@nexacreative.io",
    },
    {
      id: "site-bistro",
      workspace: "Bella Vita Dining",
      name: "Bella Vita Italian Bistro",
      subdomain: "bella-vita",
      customDomain: null,
      status: "draft",
      pagesCount: 3,
      createdAt: "2026-10-28",
      ownerEmail: "mario@bellavita.com",
    },
    {
      id: "site-vanguard",
      workspace: "Vanguard Roofing Group",
      name: "Vanguard Roofing & Solar",
      subdomain: "vanguard-roofing",
      customDomain: "vanguardroof.com",
      status: "published",
      pagesCount: 6,
      createdAt: "2026-11-01",
      ownerEmail: "contact@vanguardroof.com",
    },
  ];

  const filtered = allWebsites.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">All Tenant Websites</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global governance over every deployed website, custom domain, and tenant workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search website, domain, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* Websites Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Website & Workspace</th>
                <th className="px-5 py-3">Subdomain / Domain</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Pages</th>
                <th className="px-5 py-3">Tenant Owner</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((site) => (
                <tr key={site.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white text-sm">{site.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{site.workspace}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px]">
                    <div>{site.subdomain}.securesite.io</div>
                    {site.customDomain && (
                      <div className="text-accent flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" /> {site.customDomain}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {site.status === "published" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">{site.pagesCount}</td>
                  <td className="px-5 py-4 text-slate-400">{site.ownerEmail}</td>
                  <td className="px-5 py-4 text-slate-500">{site.createdAt}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/site/${site.subdomain}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Visit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

