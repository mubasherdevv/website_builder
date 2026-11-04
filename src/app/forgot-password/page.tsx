"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthService } from "@/lib/services/auth.service";
import { toast } from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("Please provide your email address.");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.sendPasswordResetEmail(email);
      setIsSubmitted(true);
      toast.success("Password reset instructions dispatched to your email.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      quote="Restoring peace of mind with enterprise-grade security and authentication."
      quoteAuthor="SecureSite Studio"
    >
      <div className="text-center mb-7">
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Reset your password
        </h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">
          Enter your email and we&apos;ll send you a recovery link.
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#0B6A47] border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">Check your inbox</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              We&apos;ve sent recovery instructions to{" "}
              <span className="font-semibold text-gray-700">{email}</span>. Please click the link inside to set a new password.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6A47] hover:text-[#085237] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Log In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-gray-700 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                autoComplete="email"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#0B6A47] hover:bg-[#085237] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B6A47] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Log In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
