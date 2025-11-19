/* =========================
   Navbar Toggle
========================= */
const menuToggle = document.getElementById('menu-toggle');
const navUl = document.querySelector('nav ul');

if (menuToggle && navUl) {
  menuToggle.addEventListener('click', () => {
    navUl.classList.toggle('active');
  });
}

/* =========================
   Smooth Scroll for anchor links
========================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* =========================
   Basic UI Interactions (Cards)
========================= */
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)';
    card.style.transform = 'translateY(-5px)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.boxShadow = '0 0 10px rgba(0,0,0,0.25)';
    card.style.transform = 'translateY(0)';
  });
});

/* =========================
   Toggle Password Visibility
========================= */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.toggle-password');
  const pwdInput = document.getElementById('password');

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    });
  }
});

/* =========================
   Supabase Auth & Article Forms
========================= */
import * as sb from './supabase-helpers.js';

// SIGNUP FORM
const signupForm = document.querySelector('#signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const username = e.target.username.value;
    const { error } = await sb.signUp(email, password, username);
    if (error) alert(error.message);
    else alert('Signup successful!');
  });
}

// LOGIN FORM
const loginForm = document.querySelector('#loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { error } = await sb.login(email, password);
    if (error) alert(error.message);
    else alert('Logged in!');
  });
}

// WRITE ARTICLE FORM
const writeForm = document.querySelector('#submitArticleForm');
if (writeForm) {
  writeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const content = e.target.content.value;
    const cover_image = e.target.coverImage?.value || '';
    const { error } = await sb.submitPendingArticle({ title, content, cover_image });
    if (error) alert(error.message);
    else alert('Article submitted for review!');
  });
}
