import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates or reuses a single browser Supabase client.
 * Safe for client-side components using the anonymous public key.
 */
export function createClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  clientInstance = createBrowserClient<Database>(url, anonKey);
  return clientInstance;
}

