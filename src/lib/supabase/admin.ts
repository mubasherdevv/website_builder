import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Creates a privileged admin client with the service role key.
 * Strictly forbidden from browser execution.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Security Violation: Attempted to initialize admin Supabase client in the browser.");
  }

  if (adminClientInstance) return adminClientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin client.");
  }

  adminClientInstance = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClientInstance;
}

