import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Default browser client instance
 */
export const supabase = typeof window !== "undefined"
  ? createBrowserClient()
  : createAdminClient();

/**
 * Privileged server admin client instance
 */
export const supabaseAdmin = createAdminClient();
