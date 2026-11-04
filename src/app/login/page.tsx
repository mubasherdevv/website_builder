"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { AuthLayout, GoogleIcon } from "@/components/auth/AuthLayout";
import { AuthService } from "@/lib/services/auth.service";
import { toast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.signInWithPassword(email, password);
      toast.success("Welcome back! Signed in successfully.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await AuthService.signInWithGoogle();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to initiate Google Sign-in.";
      setErrorMessage(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      quote="Great websites begin with a simple idea. Build yours with confidence."
      quoteAuthor="SecureSite Studio"
    >
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Log in to your account
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 font-medium">
          Access your websites, builder, and dashboard.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-gray-700 mb-1"
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
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-gray-700 mb-1"
          >
            Password
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
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
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

        {/* Options Row: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none text-gray-600 font-medium text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-[#0B6A47] focus:ring-[#0B6A47] cursor-pointer"
            />
            <span>Keep me signed in</span>
          </label>

          <Link
            href="/forgot-password"
            className="text-[#0B6A47] hover:text-[#085237] font-semibold transition-colors text-[11px] sm:text-xs"
          >
            Forgot password?
          </Link>
        </div>

        {/* Log In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-1.5 py-2.5 sm:py-3 px-4 bg-[#0B6A47] hover:bg-[#085237] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-3 sm:my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-[10px] sm:text-[11px] uppercase tracking-wider">
            <span className="bg-white px-3 text-gray-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2 sm:py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>Continue with Google</span>
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center mt-5 sm:mt-6 text-xs text-gray-600 font-medium">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#0B6A47] hover:text-[#085237] font-bold transition-colors ml-1"
        >
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
