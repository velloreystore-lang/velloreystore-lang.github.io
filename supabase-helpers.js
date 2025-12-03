// supabase-helpers.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://lrspllpqnfzqvakkkjuq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ogypx7tElz8TASaJVZ2R5w_XxXZ81VZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------------------------------------------
   SIGNUP - requires email verification (redirect back)
   - stores username in user_metadata
   - after signup user will receive a confirmation email
---------------------------------------------------- */
export async function signUp(email, password, username) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/login.html",
        data: { username }
      }
    });

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   LOGIN — email + password
   - if Supabase returns an error mentioning email not confirmed we surface a friendly message
   - returns data or error
---------------------------------------------------- */
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // friendly message for unverified email (Supabase often returns text like "Email not confirmed")
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("email") && (msg.includes("confirm") || msg.includes("verified") || msg.includes("confirm"))) {
        return { data: null, error: { message: "Please verify your email first. Check your inbox." } };
      }
      return { data: null, error };
    }

    // if sign in returned a user but your policy still requires verified -> check user object
    // (in many setups signInWithPassword will fail if not verified; this is just a safety net)
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   SEND Magic Link (email link)
   - Uses signInWithOtp which sends a magic link by email
---------------------------------------------------- */
export async function sendMagicLink(email) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/index.html" }
    });
    return { data, error: error ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   SEND OTP (6-digit code) — same endpoint as magic link
   - Supabase will email a code if OTP is enabled
---------------------------------------------------- */
export async function sendOTP(email) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/index.html" }
    });
    return { data, error: error ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   VERIFY OTP (if you implement token entry workflow)
   - verifyOtp is available in the SDK if you use OTP codes
   - type = 'email' for email OTPs
---------------------------------------------------- */
export async function verifyOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email"
    });
    return { data, error: error ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   Google Sign-In helper (OAuth)
   - uses the SDK to start OAuth flow (better than static href)
---------------------------------------------------- */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/index.html' }
    });
    return { data, error: error ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
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
