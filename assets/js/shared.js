/* ============================================
   STYLISHANDHEALTHY — SHARED SCRIPTS
   ============================================ */

// Cursor — only on non-touch devices
(function() {
  const cdot = document.getElementById('cdot');
  if (!cdot) return;
  // Skip cursor setup on touch devices — avoids pointless mousemove listeners
  if (window.matchMedia('(hover: none)').matches) {
    cdot.style.display = 'none';
    return;
  }
  document.addEventListener('mousemove', e => {
    cdot.style.left = e.clientX + 'px';
    cdot.style.top  = e.clientY + 'px';
  }, { passive: true });
  document.querySelectorAll('a, button, input, textarea, select, .sc, .cat, .bc, .tc, .subc, .ap, .skc, .feat-pill, .inside-card, .spread, .post-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
  });
})();

// Reveal on scroll — single observer, batch selectors
(function() {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv').forEach(el => ro.observe(el));
})();

// Mobile hamburger nav
(function() {
  const nav = document.querySelector('nav');
  const ul  = nav && nav.querySelector('ul');
  if (!nav || !ul) return;
  if (nav.querySelector('.nav-burger')) return;

  const burger = document.createElement('button');
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = `<span></span><span></span><span></span>`;
  nav.appendChild(burger);

  if (!document.getElementById('burger-styles')) {
    const style = document.createElement('style');
    style.id = 'burger-styles';
    style.textContent = `
      .nav-burger {
        display: none;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        width: 36px;
        height: 36px;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        z-index: 201;
      }
      .nav-burger span {
        display: block;
        width: 100%;
        height: 2px;
        background: var(--green-dk);
        border-radius: 2px;
        transition: transform 0.28s var(--ease), opacity 0.2s;
      }
      .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      .nav-burger.open span:nth-child(2) { opacity: 0; }
      .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
      @media (max-width: 860px) {
        .nav-burger { display: flex; }
        nav ul {
          display: flex !important;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(247,241,232,.98);
          align-items: center;
          justify-content: center;
          gap: 28px;
          z-index: 199;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-8px);
          transition: opacity 0.3s var(--ease), transform 0.3s var(--ease);
        }
        nav ul.open {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        nav ul li a {
          font-size: 1.15rem !important;
          letter-spacing: .06em !important;
        }
        .npill {
          font-size: .95rem !important;
          padding: 12px 30px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  burger.addEventListener('click', () => {
    const isOpen = ul.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  ul.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ul.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
})();

// Newsletter form handler
const MC_NEWSLETTER_URL = 'https://wordpress.us11.list-manage.com/subscribe/post?u=e33059783dca94dc78ba9c2cf&id=640e1de445&f_id=00c58ce0f0';
const MC_HONEYPOT_NAME  = 'b_e33059783dca94dc78ba9c2cf_640e1de445';

function handleNwSub(e) {
  e.preventDefault();
  const form = e.target;
  const emailInput = form.querySelector('input[type="email"]');
  const btn = form.querySelector('button');
  if (!emailInput || !btn) return;

  const email = emailInput.value.trim();
  if (!email) return;

  const orig = btn.textContent;
  btn.textContent = 'Joining...';
  btn.disabled = true;

  const body = new URLSearchParams();
  body.set('EMAIL', email);
  body.set(MC_HONEYPOT_NAME, '');

  fetch(MC_NEWSLETTER_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: body,
  })
    .then(() => {
      btn.textContent = "You're in!";
      btn.style.background = 'var(--green-lt)';
      form.reset();
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.disabled = false;
      }, 3500);
    })
    .catch(() => {
      btn.textContent = 'Try again';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = orig; }, 2500);
    });
}

// Contact form mail handler
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

// Active nav link
(function() {
  const segments = window.location.pathname.replace(/\/$/, '').split('/');
  const slug = segments[segments.length - 1] || '';

  document.querySelectorAll('nav ul li a').forEach(a => {
    const href = a.getAttribute('href');
    const hSlug = href.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '');
    if (slug === '' && (hSlug === '' || hSlug === 'index')) {
      a.classList.add('active');
    } else if (slug && slug === hSlug) {
      a.classList.add('active');
    }
  });
})();
