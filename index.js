// =========================
// Main JS: Forms, Navbar, UI
// =========================
import * as sb from './supabase-helpers.js';
import confetti from 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';

document.addEventListener('DOMContentLoaded', () => {

  // -------------------
  // Navbar Toggle (mobile)
  // -------------------
  const menuToggle = document.getElementById('menu-toggle');
  const navUl = document.querySelector('nav ul');
  if (menuToggle && navUl) {
    menuToggle.addEventListener('click', () => navUl.classList.toggle('active'));
  }

  // -------------------
  // Signup Form
  // -------------------
  const signupForm = document.querySelector('#signupForm');
  const signupFooter = document.querySelector('#signupFooter');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      signupFooter.textContent = 'Processing...';

      const email = e.target.email.value.trim();
      const password = e.target.password.value;
      const confirm = e.target.confirm.value;
      const username = e.target.name.value.trim();

      if (password !== confirm) {
        signupFooter.textContent = '⚠ Passwords do not match';
        return;
      }

      try {
        const { error } = await sb.signUp(email, password, username);
        if (error) {
          if (error.message.includes('users_email_key')) signupFooter.textContent = '⚠ Email already in use';
          else if (error.message.includes('users_username_key')) signupFooter.textContent = '⚠ Username unavailable';
          else signupFooter.textContent = '⚠ ' + error.message;
          return;
        }

        signupFooter.innerHTML = '✅ Signup successful! 🎉';
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        setTimeout(() => window.location.href = 'index.html', 2000);

      } catch (err) {
        signupFooter.textContent = '⚠ ' + err.message;
      }
    });
  }

  // -------------------
  // Login Form
  // -------------------
  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = e.target.email.value.trim();
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

  // -------------------
  // Write Article Form
  // -------------------
  const writeForm = document.querySelector('#submitArticleForm');
  if (writeForm) {
    writeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = writeForm.querySelector('#title').value.trim();
      const content = writeForm.querySelector('#content').value.trim();
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
  // Password Toggle
  // -------------------
  const toggleBtn = document.querySelector('.toggle-password');
  const pwdInput = document.getElementById('password');
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    });
  }

  // -------------------
  // Card hover effect
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
  // Smooth scroll
  // -------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
