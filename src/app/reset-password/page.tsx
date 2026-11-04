"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthService } from "@/lib/services/auth.service";
import { toast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || !confirmPassword) {
      setErrorMessage("Please complete both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.updateUserPassword(password);
      setIsSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update password.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      quote="Security at every step. Protecting your workspace and creative assets."
      quoteAuthor="SecureSite Studio"
    >
      <div className="text-center mb-7">
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Set new password
        </h1>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">
          Create a strong new password for your account.
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center py-4 space-y-4 animate-in fade-in">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#0B6A47] border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">Password Updated</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Your password has been successfully reset. You can now log in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#0B6A47] hover:bg-[#085237] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Proceed to Log In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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

          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-gray-700 mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter at least 8 characters"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-gray-700 mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                autoComplete="new-password"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#0B6A47] hover:bg-[#085237] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Update Password</span>
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
