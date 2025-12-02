import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://lrspllpqnfzqvakkkjuq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ogypx7tElz8TASaJVZ2R5w_XxXZ81VZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------------------------------------------
   SIGNUP — only uses auth.users, no custom table
---------------------------------------------------- */
export async function signUp(email, password, username) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } // store username in user_metadata
      }
    });

    if (error) return { data: null, error };

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   LOGIN — standard email/password
---------------------------------------------------- */
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data: data ?? null, error: error ?? null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/* ---------------------------------------------------
   GOOGLE LOGIN — OAuth flow
---------------------------------------------------- */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/index.html' }
    });
    return { data: data ?? null, error: error ?? null };
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
   GET CURRENT USER — reads auth.users metadata
---------------------------------------------------- */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    const user = data?.user;
    if (!user) return null;

    const profile = {
      username: user.user_metadata?.username || user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null
    };

    return { user, profile };
  } catch {
    return null;
  }
}

/* ---------------------------------------------------
   UPLOAD COVER IMAGE
---------------------------------------------------- */
export async function uploadCoverImage(file, userId) {
  if (!file) return { url: null, error: null };
  try {
    const filePath = `${userId}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('articles').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      metadata: { user_id: userId }
    });
    if (error) return { url: null, error };

    const { data: urlData } = supabase.storage.from('articles').getPublicUrl(filePath);
    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err };
  }
}

/* ---------------------------------------------------
   SUBMIT ARTICLE — author_id uses auth.users
---------------------------------------------------- */
export async function submitPendingArticle({ title, content, coverFile }) {
  try {
    const current = await getCurrentUser();
    if (!current?.user) return { data: null, error: { message: 'You must be logged in.' } };

    const userId = current.user.id;

    if (!title?.trim()) return { data: null, error: { message: 'Title is required.' } };
    if (!content?.trim()) return { data: null, error: { message: 'Content is required.' } };

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 2000) return { data: null, error: { message: 'Article must be at least 2000 words.' } };

    let coverUrl = null;
    if (coverFile) {
      const { url } = await uploadCoverImage(coverFile, userId);
      if (url) coverUrl = url;
    }

    const payload = {
      title,
      content,
      cover_image: coverUrl,
      author_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('pending_articles').insert([payload]);
    if (error) return { data: null, error };

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
