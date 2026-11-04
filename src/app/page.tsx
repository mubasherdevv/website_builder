import Link from "next/link";
import { ArrowRight, Layers, Sparkles, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-semibold tracking-wide text-brand rounded-full bg-brand-soft border border-brand/20">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Secure AI Website Builder & CMS</span>
      </div>

      <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl text-text-primary">
        One Platform, Reusable Architecture, <br />
        <span className="text-brand">Infinite Websites.</span>
      </h1>

      <p className="max-w-2xl mt-6 text-lg text-text-secondary">
        Build, customize, and manage multiple production-ready websites from a single secure codebase with versioned JSON documents, theme tokens, and an Elementor-grade visual editor.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-colors rounded-btn bg-brand hover:bg-brand-hover shadow-sm"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors bg-surface border rounded-btn border-border text-text-primary hover:bg-surface-subtle"
        >
          <Layers className="w-4 h-4" />
          <span>Browse Templates</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-20 sm:grid-cols-3 max-w-4xl w-full text-left">
        <div className="p-6 bg-surface rounded-card border border-border">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-soft text-brand mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Component Registry</h3>
          <p className="text-sm text-text-secondary">
            Stable component IDs mapped to approved React implementations. Zero arbitrary code execution.
          </p>
        </div>

        <div className="p-6 bg-surface rounded-card border border-border">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-soft text-brand mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">JSON-Based Documents</h3>
          <p className="text-sm text-text-secondary">
            Page layouts, copy, and structure stored in clean, versioned, validated JSON schemas.
          </p>
        </div>

        <div className="p-6 bg-surface rounded-card border border-border">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-status-success-soft text-status-success mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Multi-Tenant Isolation</h3>
          <p className="text-sm text-text-secondary">
            Strict RLS database boundaries, immutable draft vs published versioning, and rollback safety.
          </p>
        </div>
      </div>
    </main>
  );
}

