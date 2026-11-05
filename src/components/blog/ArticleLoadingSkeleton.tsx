import React from "react";

export const ArticleLoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="relative w-full min-h-[300px] sm:min-h-[360px] bg-[#062B21] flex flex-col justify-center items-center py-16 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center space-y-4">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 rounded bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-white/20" />
            <div className="h-4 w-16 rounded bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-white/20" />
            <div className="h-4 w-28 rounded bg-white/20" />
          </div>

          {/* Eyebrow badge */}
          <div className="h-6 w-32 rounded-full bg-white/20" />

          {/* Large Title */}
          <div className="h-9 sm:h-12 w-4/5 rounded-lg bg-white/25" />
          <div className="h-9 sm:h-12 w-3/5 rounded-lg bg-white/25" />

          {/* Subtitle */}
          <div className="h-4 sm:h-5 w-2/3 rounded bg-white/20 mt-2" />
        </div>
      </div>

      {/* Main Content Body Skeleton */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Author bar skeleton */}
        <div className="flex items-center justify-between py-4 border-b border-[#E1EAE4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/10" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-black/10" />
              <div className="h-2.5 w-16 rounded bg-black/10" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-20 rounded bg-black/10" />
            <div className="h-3.5 w-16 rounded bg-black/10" />
          </div>
        </div>

        {/* Featured image skeleton */}
        <div className="w-full h-64 sm:h-96 rounded-2xl bg-black/10" />

        {/* Article text paragraphs skeleton */}
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E1EAE4] space-y-4">
          <div className="h-4 w-full rounded bg-black/10" />
          <div className="h-4 w-11/12 rounded bg-black/10" />
          <div className="h-4 w-4/5 rounded bg-black/10" />
          <div className="h-4 w-full rounded bg-black/10 pt-4" />
          <div className="h-4 w-10/12 rounded bg-black/10" />
          <div className="h-4 w-9/12 rounded bg-black/10" />
          <div className="h-4 w-3/4 rounded bg-black/10" />
        </div>
      </main>
    </div>
  );
};

