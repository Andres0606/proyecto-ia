import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client or throw a more descriptive error that doesn't crash the build if possible
    // For now, we'll just check existence to avoid the ! operator crash
    console.warn("Supabase environment variables are missing!");
  }

  return createBrowserClient(
    supabaseUrl || "",
    supabaseKey || ""
  );
};
