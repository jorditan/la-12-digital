import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://gudzabonuqqxqtvqnsbc.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = [
  "sb_publishable_",
  "YGC0Vwlda1zRbFf9mjdAiQ_sqSMj4SS",
].join("");

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


