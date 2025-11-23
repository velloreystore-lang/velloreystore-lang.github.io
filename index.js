/* =========================
   index.js
   Complete rewrite with:
   - Supabase login/signup
   - Google popup
   - Navbar profile with dynamic roles
   - Mobile menu toggle
   - Admin dashboard logic
   - Article submission
========================= */

import * as sb from './supabase-helpers.js';

document.addEventListener('DOMContentLoaded', async () => {

  // ====================
  // ELEMENT REFERENCES
  // ====================
  const menuToggle = document.getElementById('menu-toggle');
  const navUl = document.querySelector('#primary-nav');
  const googlePrompt = document.getElementById('googlePrompt');
  const googleBtn = document.getElementById('googleSignInBtn');
  const googleClose = document.querySelector('#googlePrompt .close-btn');

  const authButtons = document.getElementById('auth-buttons'); // container for login/signup buttons
  const profileBlock = document.getElementById('profile-block'); // container for avatar/name
  const profileToggle = document.getElementById('profile-toggle');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileName = document.getElementById('profile-name');
  const profileAvatar = document.getElementById('profile-avatar');

  const signupForm = document.querySelector('#signupForm');
  const loginForm = document.querySelector('#loginForm');
  const writeForm = document.querySelector('#submitArticleForm');

  // ====================
  // MOBILE MENU TOGGLE
  // ====================
  menuToggle?.addEventListener('click', () => {
    navUl?.classList.toggle('active');
  });

  // ====================
  // GOOGLE POPUP
  // ====================
  function showGooglePopup() {
    if (googlePrompt) {
      googlePrompt.style.display = 'flex';
      googlePrompt.setAttribute('aria-hidden', 'false');
      googleClose?.focus();
    }
  }

  function hideGooglePopup() {
    if (googlePrompt) {
      googlePrompt.style.display = 'none';
      googlePrompt.setAttribute('aria-hidden', 'true');
    }
  }

  googleClose?.addEventListener('click', hideGooglePopup);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideGooglePopup();
      if (profileDropdown.classList.contains('open')) {
        profileDropdown.classList.remove('open');
        profileToggle.setAttribute('aria-expanded', 'false');
        profileDropdown.setAttribute('aria-hidden', 'true');
      }
    }
  });

  // ====================
  // LOAD CURRENT USER
  // ====================
  async function loadUserProfile() {
    const user = await sb.getCurrentUser();
    if (user) {
      await updateProfileUI(user);
    } else {
      // Optionally show Google popup for non-logged users
      // showGooglePopup();
    }
  }
  loadUserProfile();

  // ====================
  // SIGNUP FORM HANDLER
  // ====================
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const footer = document.querySelector('#signupFooter');
    footer.textContent = 'Processing...';

    const email = e.target.email.value;
    const password = e.target.password.value;
    const username = e.target.name.value;

    try {
      const { error } = await sb.signUp(email, password, username);
      if (error) {
        if (error.message.includes('users_email_key')) footer.textContent = '⚠ Email already in use.';
        else if (error.message.includes('users_username_key')) footer.textContent = '⚠ Username unavailable.';
        else footer.textContent = '⚠ ' + error.message;
        return;
      }
      footer.textContent = '✅ Signup successful! 🎉';
      if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (err) {
      footer.textContent = '⚠ ' + err.message;
    }
  });

  // ====================
  // LOGIN FORM HANDLER
  // ====================
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { error } = await sb.login(email, password);
      if (error) throw error;
      window.location.href = 'index.html';
    } catch (err) {
      alert(err.message);
    }
  });

  // ====================
  // WRITE ARTICLE HANDLER
  // ====================
  writeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = writeForm.querySelector('#title').value;
    const content = writeForm.querySelector('#content').value;
    const cover_image = writeForm.querySelector('#cover')?.value || '';

    try {
      const { error } = await sb.submitPendingArticle({ title, content, cover_image });
      if (error) throw error;
      alert('Article submitted for review!');
      writeForm.reset();
    } catch (err) {
      alert(err.message);
    }
  });

  // ====================
  // GOOGLE SIGN-IN
  // ====================
  googleBtn?.addEventListener('click', async () => {
    try {
      await sb.signInWithGoogle(); // Supabase handles redirect
    } catch (err) {
      alert('Google Sign-in failed: ' + err.message);
    }
  });

  // ====================
  // PROFILE DROPDOWN AND ROLE-BASED LINKS
  // ====================
  async function updateProfileUI(user) {
    authButtons.style.display = 'none';
    profileBlock.style.display = 'flex';
    profileAvatar.src = user.user_metadata?.avatar_url || 'Vellorey logo.jpg';
    profileAvatar.alt = user.user_metadata?.full_name || user.email || 'Profile';
    profileName.textContent = user.user_metadata?.full_name || user.email || 'User';

    // Fetch role from profiles table
    const { data: profile } = await sb.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'user';

    // Populate profile dropdown dynamically
    profileDropdown.innerHTML = ''; // clear previous items

    if (role === 'admin' && !window.location.pathname.includes('admin.html')) {
      profileDropdown.innerHTML += `<li><a href="admin.html">Dashboard</a></li>`;
    }
    if (role === 'reviewer') {
      profileDropdown.innerHTML += `<li><a href="review.html">Review Articles</a></li>`;
    }

    // Always add logout
    profileDropdown.innerHTML += `<li><button id="logoutBtn">Logout</button></li>`;

    // Attach logout listener dynamically
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await sb.logout();
      profileBlock.style.display = 'none';
      authButtons.style.display = 'flex';
      profileAvatar.src = '';
      profileName.textContent = '';
      profileDropdown.classList.remove('open');
      profileDropdown.setAttribute('aria-hidden', 'true');
      profileToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Dropdown toggle
  profileToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    const open = profileDropdown.classList.toggle('open');
    profileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    profileDropdown.setAttribute('aria-hidden', open ? 'false' : 'true');
  });

  // Click outside closes dropdown
  document.addEventListener('click', (e) => {
    if (!profileBlock.contains(e.target) && profileDropdown.classList.contains('open')) {
      profileDropdown.classList.remove('open');
      profileToggle.setAttribute('aria-expanded', 'false');
      profileDropdown.setAttribute('aria-hidden', 'true');
    }
  });

  // ====================
  // ADMIN DASHBOARD LOGIC
  // ====================
  if (window.location.pathname.includes('admin.html')) {
    const user = await sb.getCurrentUser();
    if (!user) {
      alert('Please login first');
      window.location.href = 'login.html';
      return;
    }

    const { data: profile } = await sb.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      alert('Access denied: Admins only');
      window.location.href = 'index.html';
      return;
    }

    // Fetch stats
    const { count: totalUsers } = await sb.supabase.from('profiles').select('*', { count: 'exact' });
    const { count: totalArticles } = await sb.supabase.from('articles').select('*', { count: 'exact' });
    const { data: pendingArticles, count: pendingCount } = await sb.supabase.from('pending_articles').select('*', { count: 'exact' });

    // Fill dashboard elements
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-articles').textContent = totalArticles;
    document.getElementById('pending-articles').textContent = pendingCount;

    // Populate pending articles list
    const pendingList = document.getElementById('pending-list');
    pendingArticles.forEach(article => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.content.substring(0, 100)}...</p>
        <button class="approve-btn" data-id="${article.id}">Approve</button>
        <button class="reject-btn" data-id="${article.id}">Reject</button>
      `;
      pendingList.appendChild(card);
    });

    // Approve/Reject logic
    pendingList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('approve-btn')) {
        const id = e.target.dataset.id;
        const { data } = await sb.supabase.from('pending_articles').select('*').eq('id', id).single();
        if (data) {
          const { error } = await sb.supabase.from('articles').insert([{
            title: data.title,
            content: data.content,
            author_id: data.author_id,
            cover_image_url: data.cover_image_url,
            created_at: data.created_at
          }]);
          if (!error) {
            await sb.supabase.from('pending_articles').delete().eq('id', id);
            location.reload();
          }
        }
      }
      if (e.target.classList.contains('reject-btn')) {
        const id = e.target.dataset.id;
        await sb.supabase.from('pending_articles').delete().eq('id', id);
        location.reload();
      }
    });
  }

});
