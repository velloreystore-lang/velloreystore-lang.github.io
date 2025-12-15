// supabase-helpers.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const SUPABASE_URL = 'https://lrspllpqnfzqvakkkjuq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ogypx7tElz8TASaJVZ2R5w_XxXZ81VZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
/* ---------------------------------------------------
    SIGN UP/LOGIN
---------------------------------------------------- */
// Detect local vs production
const isLocal =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

export const REDIRECT_URL = isLocal
  ? "http://127.0.0.1:5500/index.html"
  : "https://vellorey.com/index.html";

/**
 * OAuth login with redirect-back support
 */
export async function signInWithProvider(provider) {
  const previousPage =
    window.location.pathname + window.location.search;

  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: REDIRECT_URL,
      state: JSON.stringify({ from: previousPage })
    }
  });
}

/* ---------------------------------------------------
   LOGOUT
---------------------------------------------------- */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error ?? null };
  } catch (err) {
    return { error: err };
  }
}

/* ---------------------------------------------------
   GET CURRENT USER (convenience)
   - returns { user, profile } where profile is pulled from user_metadata
---------------------------------------------------- */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    const user = data?.user;
    if (!user) return null;

    const profile = {
      username: user.user_metadata?.username || user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      email: user.email
    };

    return { user, profile };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------
   ensureProfile()
   - optional: creates/updates a row in 'profiles' table for your app to query
   - If you don't have profiles table, this will safely return null/error.
---------------------------------------------------- */
export async function ensureProfile(userId, username, avatar_url = null) {
  try {
    // attempt upsert into profiles table (create if not exists)
    const payload = {
      id: userId,
      username,
      avatar_url,
      updated_at: new Date().toISOString()
    };
    // using upsert ensures we don't duplicate
    const { data, error } = await supabase.from('profiles').upsert(payload, { returning: 'minimal' }); 
    if (error) return { data: null, error };
    return { data: data ?? null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
