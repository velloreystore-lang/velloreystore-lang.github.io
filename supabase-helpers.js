// supabase-helpers.js
import { createClient } from '@supabase/supabase-js'

// -------------------
// Supabase Initialization
// -------------------
const SUPABASE_URL = 'https://lrspllpqnfzqvakkkjuq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_ogypx7tElz8TASaJVZ2R5w_XxXZ81VZ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// -------------------
// Auth Functions
// -------------------

// SIGNUP
export async function signUp(email, password, username = null) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) return { data, error }

  // Get the user object
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (user) {
    // Create profile row
    await supabase
      .from('profiles')
      .insert([{ id: user.id, username, role: 'user' }])
  }

  return { data, error }
}

// LOGIN
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// LOGOUT
export async function logout() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// GET CURRENT USER
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user ?? null
}

// -------------------
// User Functions
// -------------------

// SUBMIT PENDING ARTICLE
export async function submitPendingArticle({ title, slug, content, excerpt = '', attachments = null }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: 'Not logged in' } }

  const payload = {
    user_id: user.id,
    title,
    slug,
    content,
    excerpt,
    attachments
  }

  const { data, error } = await supabase
    .from('pending_articles')
    .insert([payload])
    .select()
  return { data, error }
}

// -------------------
// Admin Functions
// -------------------

// FETCH PENDING ARTICLES
export async function fetchPendingArticles() {
  const { data, error } = await supabase
    .from('pending_articles')
    .select('id, title, slug, content, user_id, created_at')
    .order('created_at', { ascending: false })
  return { data, error }
}

// APPROVE PENDING ARTICLE
export async function approvePendingArticle(pendingId) {
  const { data, error } = await supabase.rpc('approve_pending_article', { p_pending_id: pendingId })
  return { data, error }
}
