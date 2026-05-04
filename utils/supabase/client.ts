import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables are missing!");
    return null; // Don't call createBrowserClient if vars are missing
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
};
