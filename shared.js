/* ============================================
   STYLISHANDHEALTHY — SHARED SCRIPTS
   ============================================ */

// Cursor
(function() {
  const cdot = document.getElementById('cdot');
  if (!cdot) return;
  document.addEventListener('mousemove', e => {
    cdot.style.left = e.clientX + 'px';
    cdot.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, input, textarea, select, .sc, .cat, .bc, .tc, .subc, .ap, .skc, .feat-pill, .inside-card, .spread, .post-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
  });
})();

// Reveal on scroll
(function() {
  const ro = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
  }), { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv, .sec > *, .page-hero > *, .bc, .sc, .skc, .subc, .tc, .post-card, .ci-card, .value-card, .mst, .ast, .inside-card, .spread').forEach(el => ro.observe(el));
})();

// Newsletter form handler (shared)
function handleNwSub(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.textContent = "You're in";
  btn.style.background = 'var(--green-lt)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; e.target.reset(); }, 3000);
}

// Contact form mail handler for static hosting
function handleContactMail(e) {
  e.preventDefault();
  const form = e.target;
  const name = encodeURIComponent(form.querySelector('[name="name"]').value.trim());
  const email = encodeURIComponent(form.querySelector('[name="email"]').value.trim());
  const subject = encodeURIComponent(form.querySelector('[name="subject"]').value);
  const message = encodeURIComponent(form.querySelector('[name="message"]').value.trim());
  const body = `Name: ${name}%0AEmail: ${email}%0ASubject: ${subject}%0A%0A${message}`;
  window.location.href = `mailto:contact@stylishandhealthy.com?subject=${subject}&body=${body}`;
}

// Active nav link — works with clean URL slugs (/blog, /about, etc.)
(function() {
  const segments = window.location.pathname.replace(/\/$/, '').split('/');
  const slug = segments[segments.length - 1] || '';  // '' = homepage

  document.querySelectorAll('nav ul li a').forEach(a => {
    const href = a.getAttribute('href');
    // Normalise href: strip leading slash and trailing slash
    const hSlug = href.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '');
    // Homepage match
    if (slug === '' && (hSlug === '' || hSlug === 'index')) {
      a.classList.add('active');
    } else if (slug && slug === hSlug) {
      a.classList.add('active');
    }
  });
})();
