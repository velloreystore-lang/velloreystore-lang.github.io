/* =========================
   Navbar Toggle
========================= */
const menuToggle = document.getElementById('menu-toggle');
const navUl = document.querySelector('nav ul');

menuToggle.addEventListener('click', () => {
  navUl.classList.toggle('active');
});

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
   Basic UI Interactions
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


document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.toggle-password');
  const pwdInput = document.getElementById('password');

  toggleBtn.addEventListener('click', () => {
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });
});


