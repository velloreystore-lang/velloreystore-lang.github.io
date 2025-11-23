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

// SIGNUP
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { data, error };

  const user = data.user;
  if (!user) return { data, error: { message: 'User not found after signup' } };

  // Insert into users table immediately
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ id: user.id, username, email, role: 'user' }]);

  if (insertError) return { data, error: insertError };
  return { data, error: null };
}

// LOGIN
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// GOOGLE SIGN-IN
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  return { data, error };
}

// LOGOUT
export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// GET CURRENT USER
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// -------------------
// Article Functions
// -------------------

export async function submitPendingArticle({ title, content, cover_image }) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { error: { message: 'Not logged in' } };

  const payload = {
    author_id: user.id,
    title,
    content,
    cover_image,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('pending_articles').insert([payload]);
  return { data, error };
}
