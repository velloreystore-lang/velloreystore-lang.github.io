/* =========================
   Main JS: Auth, Articles & UI
========================= */
import * as sb from './supabase-helpers.js';

document.addEventListener('DOMContentLoaded', () => {

  // -------------------
  // SIGNUP FORM
  // -------------------
  const signupForm = document.querySelector('#signupForm');
  const signupFooter = document.querySelector('#signupFooter');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      signupFooter.textContent = 'Processing...';

      const email = e.target.email.value;
      const password = e.target.password.value;
      const username = e.target.name.value;

      try {
        const { error } = await sb.signUp(email, password, username);
        if (error) {
          if (error.message.includes('users_email_key')) signupFooter.textContent = '⚠ Email already in use.';
          else if (error.message.includes('users_username_key')) signupFooter.textContent = '⚠ Username unavailable.';
          else signupFooter.textContent = '⚠ ' + error.message;
          return;
        }

        signupFooter.innerHTML = '✅ Signup successful! 🎉';
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);

      } catch (err) {
        signupFooter.textContent = '⚠ ' + err.message;
      }
    });
  }

  // -------------------
  // LOGIN FORM
  // -------------------
  const loginForm = document.querySelector('#loginForm');
  const googleLoginBtn = document.querySelector('#googleLogin'); // optional Google button

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      const { error } = await sb.signInWithGoogle();
      if (error) alert('Google login failed: ' + error.message);
      // On success, user is redirected by Supabase OAuth
    });
  }

  // -------------------
  // DISPLAY PROFILE INFO (if logged in)
  // -------------------
  const profileDisplay = document.querySelector('#profileName'); // optional element
  const profileAvatar = document.querySelector('#profileAvatar'); // optional avatar

  async function showProfile() {
    const user = await sb.getCurrentUser();
    if (!user) return;
    if (profileDisplay) profileDisplay.textContent = user.user_metadata?.full_name || user.profile?.username || 'User';
    if (profileAvatar && (user.user_metadata?.avatar_url || user.profile?.avatar_url)) {
      profileAvatar.src = user.user_metadata?.avatar_url || user.profile?.avatar_url;
      profileAvatar.style.display = 'inline-block';
    }
  }

  showProfile();

  // -------------------
  // WRITE ARTICLE FORM
  // -------------------
  const writeForm = document.querySelector('#submitArticleForm');
  if (writeForm) {
    writeForm.addEventListener('submit', async (e) => {
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
  }

  // -------------------
  // Navbar Toggle
  // -------------------
  const menuToggle = document.getElementById('menu-toggle');
  const navUl = document.querySelector('nav ul');
  if (menuToggle && navUl) {
    menuToggle.addEventListener('click', () => {
      navUl.classList.toggle('active');
    });
  }

  // -------------------
  // Smooth Scroll
  // -------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // -------------------
  // Card Hover Effects
  // -------------------
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
      card.style.transform = 'translateY(-5px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '0 0 10px rgba(0,0,0,0.25)';
      card.style.transform = 'translateY(0)';
    });
  });

  // -------------------
  // Toggle Password Visibility
  // -------------------
  const toggleBtn = document.querySelector('.toggle-password');
  const pwdInput = document.getElementById('password');
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    });
  }

});
