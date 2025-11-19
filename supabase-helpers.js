/* =========================
   supabase-helpers.js
========================= */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://lrspllpqnfzqvakkkjuq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ogypx7tElz8TASaJVZ2R5w_XxXZ81VZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -------------------
// Auth Functions
// -------------------

// SIGNUP with email/password
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { data, error };

  const user = data.user;
  if (!user) return { data, error: { message: 'User not found after signup' } };

  // Insert username into users table
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ id: user.id, username, email, role: 'user' }]);
  
  if (insertError) return { data, error: insertError };
  return { data, error: null };
}

// LOGIN with email/password
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// LOGIN / SIGNUP with Google
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/index.html',
    }
  });
  return { error };
}

// LOGOUT
export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// GET CURRENT USER (including Google profile)
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return null;

  // Fetch user profile from 'users' table
  const { data: profileData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  return { ...data.user, profile: profileData || {} };
}

// -------------------
// Article Functions
// -------------------

export async function submitPendingArticle({ title, content, cover_image }) {
  const userData = await getCurrentUser();
  if (!userData) return { error: { message: 'Not logged in' } };

  const payload = {
    author_id: userData.id,
    title,
    content,
    cover_image,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('pending_articles').insert([payload]);
  return { data, error };
}
