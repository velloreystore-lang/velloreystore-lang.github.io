// index.js
import * as sb from './supabase-helpers.js';
import { supabase } from './supabase-helpers.js'; // used for onAuthStateChange

document.addEventListener('DOMContentLoaded', async () => {
  // ---------- DOM REFS ----------
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links'); 
  const signupForm = document.querySelector('#signupForm');
  const loginForm = document.querySelector('#loginForm');
  const signupFooter = document.querySelector('#signupFooter');
  const signupBtn = document.getElementById('signupBtn');
  const loginBtn = document.getElementById('loginBtn');
  const profileDisplay = document.getElementById('profileName') || document.getElementById('usernameDisplay');
  const profileAvatar = document.getElementById('profileAvatar') || document.getElementById('profileImg');
  const magicBtn = document.getElementById('magicBtn');     // add to your HTML
  const otpBtn = document.getElementById('otpBtn');         // add to your HTML

  // ---------- NAV TOGGLE ----------
  menuToggle?.addEventListener('click', () => navLinks.classList.toggle('active'));

  // Get redirect page from URL query (default to homepage)
const urlParams = new URLSearchParams(window.location.search);
const redirectTo = urlParams.get('redirect') || 'index.html';

// ---------- SIGNUP ----------
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (signupFooter) signupFooter.textContent = 'Processing...';

  const username = (e.target.username?.value || '').trim();
  const email = (e.target.email?.value || '').trim();
  const password = (e.target.password?.value || '').trim();

  if (!username || !email || !password) {
    if (signupFooter) signupFooter.textContent = '⚠ Please fill all fields.';
    return;
  }

  const res = await sb.signUp(email, password, username);
  if (res.error) {
    const msg = (res.error.message || '').toLowerCase();
    if (signupFooter) {
      if (msg.includes('duplicate') && msg.includes('email')) {
        signupFooter.textContent = '⚠ Email already in use.';
      } else {
        signupFooter.textContent = '⚠ ' + (res.error.message || 'Signup error');
      }
    }
    return;
  }

  if (signupFooter) signupFooter.textContent = '✅ Signup successful! Please confirm your email (check inbox).';
  if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

  // Redirect to check-email page with redirect param preserved
  setTimeout(() => {
    window.location.href = `check-email.html?redirect=${encodeURIComponent(redirectTo)}`;
  }, 1200);
});

// ---------- LOGIN ----------
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = (e.target.email?.value || '').trim();
  const password = (e.target.password?.value || '').trim();
  if (!email || !password) return alert('Enter email & password');

  const res = await sb.login(email, password);
  if (res.error) return alert(res.error.message || 'Login failed');

  // Successful login: redirect back to the previous page
  window.location.href = redirectTo;
});

// ---------- Magic Link / OTP Buttons ----------
magicBtn?.addEventListener('click', async () => {
  const emailInput = document.querySelector('#email') || document.querySelector('#magic-email');
  const email = emailInput?.value?.trim();
  if (!email) return alert('Enter your email for magic link');

  const { error } = await sb.sendMagicLink(email);
  if (error) alert(error.message || 'Error sending magic link');
  else alert('Magic link sent! Check your email.');
});

otpBtn?.addEventListener('click', async () => {
  const emailInput = document.querySelector('#email') || document.querySelector('#otp-email');
  const email = emailInput?.value?.trim();
  if (!email) return alert('Enter your email for OTP');

  const { error } = await sb.sendOTP(email);
  if (error) alert(error.message || 'Error sending OTP');
  else alert('OTP sent! Check your email.');
});


  // ---------- PROFILE UI ----------
  async function loadUserProfile() {
    const current = await sb.getCurrentUser();
    if (!current?.user) {
      hideUserProfile();
      return;
    }

    // prefer username from metadata, else fallback to email
    const username = current.profile?.username || current.user?.user_metadata?.full_name || current.user?.email || 'User';
    if (profileDisplay) profileDisplay.textContent = username;

    const avatarUrl = current.profile?.avatar_url || current.user?.user_metadata?.avatar_url;
    if (avatarUrl && profileAvatar) {
      profileAvatar.src = avatarUrl;
      profileAvatar.style.display = 'inline-block';
    } else if (profileAvatar) {
      profileAvatar.style.display = 'none';
    }

    // hide login/signup buttons in nav
    signupBtn?.style.setProperty('display', 'none');
    loginBtn?.style.setProperty('display', 'none');

    // ensure we have a profiles row (optional - will not fail if table missing)
    if (current.user?.id) {
      await sb.ensureProfile(current.user.id, username, avatarUrl || null);
    }
  }

  function hideUserProfile() {
    signupBtn?.style.setProperty('display', 'inline-block');
    loginBtn?.style.setProperty('display', 'inline-block');
    if (profileDisplay) profileDisplay.textContent = '';
    if (profileAvatar) profileAvatar.style.display = 'none';
  }

  // run once on load to set UI correctly (if session exists)
  await loadUserProfile();

  // ---------- WRITE ARTICLE (your existing code kept) ----------
  const writeForm = document.getElementById("submitArticleForm");
  if (writeForm) {
    const title = document.getElementById("title");
    const cover = document.getElementById("cover");
    const content = document.getElementById("content");
    const titleError = document.getElementById("titleError");
    const coverError = document.getElementById("coverError");
    const contentError = document.getElementById("contentError");
    const wordCount = document.getElementById("wordCount");
    const grammarFeedback = document.getElementById("grammarFeedback");

    function clearErrors() {
      titleError && (titleError.textContent = "");
      coverError && (coverError.textContent = "");
      contentError && (contentError.textContent = "");
      grammarFeedback && (grammarFeedback.innerHTML = "");
    }

    content?.addEventListener("input", () => {
      const words = content.value.trim().split(/\s+/).filter(Boolean).length;
      wordCount && (wordCount.textContent = words);

      const wordSuccess = document.getElementById("wordSuccess");
      const counterBox = document.querySelector(".word-counter");
      if (words >= 2000) {
        counterBox?.classList.add("complete");
        wordSuccess && (wordSuccess.style.display = "block", wordSuccess.textContent = "✔ Word requirement met!");
      } else {
        counterBox?.classList.remove("complete");
        wordSuccess && (wordSuccess.style.display = "none");
      }

      const typoWords = ["teh", "adn", "recieve", "definately"];
      grammarFeedback && (grammarFeedback.innerHTML = content.value
        .split(/\s+/)
        .map(w => typoWords.includes(w.toLowerCase()) ? `<span class="highlight-word">${w}</span>` : w)
        .join(" "));
    });

    writeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      if (!title.value.trim()) { titleError.textContent = "Title is required."; return; }
      const words = content.value.trim().split(/\s+/).filter(Boolean).length;
      if (words < 2000) { contentError.textContent = "Article must be at least 2000 words."; return; }

      const res = await sb.submitPendingArticle({
        title: title.value,
        content: content.value,
        coverFile: cover.files[0] || null
      });

      if (res.error) {
        contentError.style.color = "red";
        contentError.textContent = res.error.message || "Error submitting article";
        return;
      }

      contentError.style.color = "lightgreen";
      contentError.textContent = "Article submitted for review!";
      writeForm.reset();
      wordCount && (wordCount.textContent = 0);
      grammarFeedback && (grammarFeedback.innerHTML = "");
    });
  }

  // ---------- UI Helpers (kept) ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', ev => {
    ev.preventDefault();
    const tgt = document.querySelector(a.getAttribute('href'));
    tgt?.scrollIntoView({ behavior: 'smooth' });
  }));

  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || document.getElementById('password');
      if (input) input.type = input.type === 'password' ? 'text' : 'password';
    });
  });

  const userProfile = document.getElementById('userProfile');
  const profileDropdown = document.getElementById('profileDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  userProfile?.addEventListener('click', e => { e.stopPropagation(); profileDropdown?.classList.toggle('show'); });
  logoutBtn?.addEventListener('click', async e => { e.stopPropagation(); await sb.logout(); window.location.href = 'index.html'; });
  document.addEventListener('click', () => profileDropdown?.classList.remove('show'));

  // ---------- Listen to auth changes (auto-load profile on verify / magic link / signin) ----------
  supabase.auth.onAuthStateChange(async (event, session) => {
    // events: SIGNED_IN, SIGNED_OUT, USER_UPDATED, PASSWORD_RECOVERY, etc.
    if (session && session.user) {
      // load profile UI right away
      await loadUserProfile();
    } else {
      hideUserProfile();
    }
  });
});
