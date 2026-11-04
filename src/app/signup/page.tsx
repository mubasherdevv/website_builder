"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check, X } from "lucide-react";
import { AuthLayout, GoogleIcon } from "@/components/auth/AuthLayout";
import { AuthService } from "@/lib/services/auth.service";
import { toast } from "@/components/ui/Toast";

interface PasswordStrength {
  score: number;
  label: string;
  colorClass: string;
  barColor: string;
  hasLength: boolean;
  hasMixedCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function calculatePasswordStrength(pass: string): PasswordStrength {
  const hasLength = pass.length >= 8;
  const hasMixedCase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  if (!pass) {
    return {
      score: 0,
      label: "",
      colorClass: "text-gray-400",
      barColor: "bg-gray-200",
      hasLength: false,
      hasMixedCase: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  let score = 0;
  if (hasLength) score += 1;
  if (hasMixedCase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  if (score <= 1) {
    return {
      score: 1,
      label: "Weak",
      colorClass: "text-rose-500",
      barColor: "bg-rose-500",
      hasLength,
      hasMixedCase,
      hasNumber,
      hasSpecial,
    };
  }

  if (score <= 3) {
    return {
      score: score === 2 ? 2 : 3,
      label: "Medium",
      colorClass: "text-amber-500",
      barColor: "bg-amber-500",
      hasLength,
      hasMixedCase,
      hasNumber,
      hasSpecial,
    };
  }

  return {
    score: 4,
    label: "Strong",
    colorClass: "text-emerald-600",
    barColor: "bg-emerald-600",
    hasLength,
    hasMixedCase,
    hasNumber,
    hasSpecial,
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms of Service to create an account.");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.signUp(email, password, fullName);
      toast.success("Account created successfully! Check your inbox for confirmation.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await AuthService.signInWithGoogle();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to initiate Google Sign-up.";
      setErrorMessage(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      quote="Empowering creators and businesses to launch with speed and security."
      quoteAuthor="SecureSite Studio"
    >
      <div className="text-center mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Create your account
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 font-medium">
          Start building high-performance websites today.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-3 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-in fade-in"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-bold text-gray-700 mb-0.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              className="w-full pl-10 pr-3.5 py-1.5 sm:py-2 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-gray-700 mb-0.5"
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
              className="w-full pl-10 pr-3.5 py-1.5 sm:py-2 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password (Full Width) */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-gray-700"
            >
              Password
            </label>
            {password && (
              <span
                className={`text-[10px] font-bold ${strength.colorClass} transition-colors`}
              >
                {strength.label}
              </span>
            )}
          </div>
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
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-1.5 sm:py-2 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border border-gray-200 rounded-xl focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15 outline-none transition-all placeholder:text-gray-400"
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

          {/* Animated Strength Indicator Bar with 4 Segments */}
          {password && (
            <div className="mt-1.5 space-y-1 animate-in fade-in duration-200">
              <div className="grid grid-cols-4 gap-1.5 h-1 rounded-full overflow-hidden bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    strength.score >= 1 ? strength.barColor : "bg-transparent"
                  }`}
                />
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    strength.score >= 2 ? strength.barColor : "bg-transparent"
                  }`}
                />
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    strength.score >= 3 ? strength.barColor : "bg-transparent"
                  }`}
                />
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    strength.score >= 4 ? strength.barColor : "bg-transparent"
                  }`}
                />
              </div>

              {/* Micro criteria checklist pills */}
              <div className="flex items-center justify-between gap-1 text-[9px] text-gray-500 pt-0.5">
                <span
                  className={`flex items-center gap-0.5 transition-colors ${
                    strength.hasLength ? "text-emerald-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  {strength.hasLength ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5 opacity-50" />}
                  8+ chars
                </span>
                <span
                  className={`flex items-center gap-0.5 transition-colors ${
                    strength.hasMixedCase ? "text-emerald-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  {strength.hasMixedCase ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5 opacity-50" />}
                  Aa (upper/lower)
                </span>
                <span
                  className={`flex items-center gap-0.5 transition-colors ${
                    strength.hasNumber ? "text-emerald-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  {strength.hasNumber ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5 opacity-50" />}
                  123 (num)
                </span>
                <span
                  className={`flex items-center gap-0.5 transition-colors ${
                    strength.hasSpecial ? "text-emerald-600 font-semibold" : "text-gray-400"
                  }`}
                >
                  {strength.hasSpecial ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5 opacity-50" />}
                  #$& (sym)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password (Placed directly underneath Password) */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-gray-700"
            >
              Confirm Password
            </label>
            {confirmPassword && (
              <span
                className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                  confirmPassword === password
                    ? "text-emerald-600"
                    : "text-rose-500"
                }`}
              >
                {confirmPassword === password ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 text-rose-500" />
                    <span>Passwords do not match</span>
                  </>
                )}
              </span>
            )}
          </div>
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
              placeholder="Confirm your password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-10 py-1.5 sm:py-2 bg-gray-50/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-gray-900 border rounded-xl outline-none transition-all placeholder:text-gray-400 ${
                confirmPassword
                  ? confirmPassword === password
                    ? "border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    : "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
                  : "border-gray-200 focus:border-[#0B6A47] focus:ring-2 focus:ring-[#0B6A47]/15"
              }`}
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

        {/* Terms & Privacy checkbox */}
        <div className="pt-0.5">
          <label className="flex items-start gap-1.5 cursor-pointer select-none text-[11px] text-gray-600 leading-tight">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-[#0B6A47] focus:ring-[#0B6A47] mt-0.5 cursor-pointer shrink-0"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-[#0B6A47] hover:underline font-semibold">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#0B6A47] hover:underline font-semibold">
                Privacy
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-1 py-2.5 px-4 bg-[#0B6A47] hover:bg-[#085237] disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white px-3 text-gray-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>Continue with Google</span>
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center mt-3.5 text-xs text-gray-600 font-medium">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#0B6A47] hover:text-[#085237] font-bold transition-colors ml-1"
        >
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
