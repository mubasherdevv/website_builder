"use client";

import React from "react";
import Link from "next/link";

export function SecureSiteLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3L26.3923 9V21L16 27L5.6077 21V9L16 3Z"
        fill="#0B6A47"
        fillOpacity="0.12"
      />
      <path
        d="M11 9.5L21 15L16 18L6 12.5L11 9.5Z"
        fill="#10B981"
      />
      <path
        d="M21 22.5L11 17L16 14L26 19.5L21 22.5Z"
        fill="#0B6A47"
      />
      <path
        d="M6 12.5V19.5L11 22.5V15.5L6 12.5Z"
        fill="#047857"
      />
      <path
        d="M26 12.5V19.5L21 16.5V9.5L26 12.5Z"
        fill="#34D399"
      />
    </svg>
  );
}

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
  quote?: string;
  quoteAuthor?: string;
}

export function AuthLayout({
  children,
  quote = "Great websites begin with a simple idea. Build yours with confidence.",
  quoteAuthor = "SecureSite Studio",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#F7FAF8] antialiased text-[#1E293B] overflow-x-hidden lg:h-screen lg:overflow-hidden">
      {/* Left Panel: Motivational Quote + Soft Abstract Green Artwork */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#EBF6F0] p-10 xl:p-16 flex-col justify-center overflow-hidden border-r border-[#D9EFE3] shrink-0 select-none">
        {/* Abstract Fluid Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60">
          <svg className="w-full h-full" viewBox="0 0 700 700" fill="none">
            <circle cx="150" cy="150" r="280" fill="#D6EFE0" fillOpacity="0.7" />
            <circle cx="580" cy="520" r="320" fill="#DCF3E6" fillOpacity="0.8" />
            <path
              d="M-50 400C120 300 250 550 450 420C650 290 700 600 750 700L-50 700Z"
              fill="#D1EBDC"
              fillOpacity="0.5"
            />
          </svg>
        </div>

        {/* Quote Content */}
        <div className="relative z-10 max-w-lg">
          {/* Green Double Quote Symbol */}
          <div className="text-[#0B6A47] mb-5 select-none" aria-hidden="true">
            <svg className="w-10 h-10 xl:w-12 xl:h-12 fill-current" viewBox="0 0 24 24">
              <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#0D2B20] tracking-tight leading-[1.25] mb-6">
            {quote}
          </h2>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#0B6A47]">
            <span className="w-6 h-0.5 bg-[#0B6A47] rounded-full" />
            <span>{quoteAuthor}</span>
          </div>
        </div>

        {/* Subtle Bottom Watermark */}
        <div className="absolute bottom-6 left-10 text-[11px] text-[#0B6A47]/60 font-medium">
          © {new Date().getFullYear()} SecureSite Studio. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Centered Auth Card Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-3.5 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto h-full max-h-screen">
        <div className="w-full max-w-[430px] my-auto bg-white rounded-2xl sm:rounded-3xl shadow-[0_10px_40px_rgba(11,106,71,0.06)] border border-gray-100/90 p-6 sm:p-8 lg:p-8 transition-all">
          {/* Logo & Platform Name */}
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <SecureSiteLogo className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A]">
                SecureSite Studio
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
