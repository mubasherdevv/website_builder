import React from "react";
import Link from "next/link";
import { CreationWizard } from "@/components/dashboard/CreationWizard";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NewWebsitePage() {
  return (
    <main className="min-h-screen bg-surface-background py-10">
      <div className="max-w-4xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-btn border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Create New Website
            </h1>
            <p className="text-xs text-text-secondary">
              Set up your website details and pick a foundation design.
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-soft text-brand border border-brand/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Independent Template Copying</span>
        </div>
      </div>

      <CreationWizard />
    </main>
  );
}

