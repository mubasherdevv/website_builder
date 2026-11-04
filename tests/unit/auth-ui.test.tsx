import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";
import ForgotPasswordPage from "@/app/forgot-password/page";
import ResetPasswordPage from "@/app/reset-password/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Phase 2.1: Authentication UI", () => {
  describe("Login Page (/login)", () => {
    it("renders split-screen layout with quote and login form", () => {
      render(<LoginPage />);

      expect(screen.getByText("Great websites begin with a simple idea. Build yours with confidence.")).toBeDefined();
      expect(screen.getByText("Log in to your account")).toBeDefined();
      expect(screen.getByPlaceholderText("Enter your email")).toBeDefined();
      expect(screen.getByPlaceholderText("Enter your password")).toBeDefined();
      expect(screen.getByText("Keep me signed in")).toBeDefined();
      expect(screen.getByText("Forgot password?")).toBeDefined();
      expect(screen.getByText("Log In")).toBeDefined();
      expect(screen.getByText("Continue with Google")).toBeDefined();
      expect(screen.getByText("Create an account")).toBeDefined();
    });

    it("toggles password visibility", () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;
      expect(passwordInput.type).toBe("password");

      const toggleBtn = screen.getByLabelText("Show password");
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe("text");

      const hideBtn = screen.getByLabelText("Hide password");
      fireEvent.click(hideBtn);
      expect(passwordInput.type).toBe("password");
    });
  });

  describe("Signup Page (/signup)", () => {
    it("renders registration form with all required fields", () => {
      render(<SignupPage />);

      expect(screen.getByText("Create your account")).toBeDefined();
      expect(screen.getByPlaceholderText("Enter your full name")).toBeDefined();
      expect(screen.getByPlaceholderText("Enter your email")).toBeDefined();
      expect(screen.getByPlaceholderText("Create a strong password")).toBeDefined();
      expect(screen.getByPlaceholderText("Confirm your password")).toBeDefined();
      expect(screen.getByText("Create Account")).toBeDefined();
      expect(screen.getByText("Already have an account?")).toBeDefined();
    });
  });

  describe("Forgot Password Page (/forgot-password)", () => {
    it("renders reset password request form", () => {
      render(<ForgotPasswordPage />);

      expect(screen.getByText("Reset your password")).toBeDefined();
      expect(screen.getByPlaceholderText("Enter your registered email")).toBeDefined();
      expect(screen.getByText("Send Reset Link")).toBeDefined();
      expect(screen.getByText("Back to Log In")).toBeDefined();
    });
  });

  describe("Reset Password Page (/reset-password)", () => {
    it("renders new password setting form", () => {
      render(<ResetPasswordPage />);

      expect(screen.getByText("Set new password")).toBeDefined();
      expect(screen.getByPlaceholderText("Enter at least 8 characters")).toBeDefined();
      expect(screen.getByPlaceholderText("Confirm your new password")).toBeDefined();
      expect(screen.getByText("Update Password")).toBeDefined();
      expect(screen.getByText("Back to Log In")).toBeDefined();
    });
  });
});
