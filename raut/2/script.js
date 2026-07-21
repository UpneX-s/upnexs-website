// === Nav scroll behavior ===
const nav = document.getElementById('site-nav');
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

toggle?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
});

// Close mobile menu on link click
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

// === Scroll reveal ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// === Contact form ===
function handleSubmit(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const subject = `[Raut] ${data.topic || 'General'} inquiry from ${data.name}`;
  const body = `Name: ${data.name}\nCompany: ${data.company || 'N/A'}\nEmail: ${data.email}\n\n${data.message || ''}`;
  window.location.href = `mailto:Hello@raut.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Expose to global for inline onsubmit
window.handleSubmit = handleSubmit;
