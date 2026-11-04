import { createClient } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export class AuthService {
  /**
   * Sign in with Email and Password
   */
  static async signInWithPassword(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign up with Email, Password and Full Name metadata
   */
  static async signUp(email: string, password: string, fullName: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Initiate Google OAuth redirect flow
   */
  static async signInWithGoogle(redirectTo?: string) {
    const supabase = createClient();
    const callbackUrl =
      redirectTo || `${window.location.origin}/api/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string) {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update user password (from reset password flow)
   */
  static async updateUserPassword(newPassword: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
}

