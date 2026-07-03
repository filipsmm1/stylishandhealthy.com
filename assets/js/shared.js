/* ============================================
   STYLISHANDHEALTHY — SHARED SCRIPTS
   ============================================ */

'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavQuery = window.matchMedia('(max-width: 860px)');

// Custom cursor removed so the native browser cursor stays visible everywhere.
(function initCursor() {
  const cdot = document.getElementById('cdot');
  if (cdot) cdot.hidden = true;
})();

// Reveal content safely. Reduced-motion users see everything immediately.
(function initReveal() {
  const items = document.querySelectorAll('.rv');
  if (!items.length) return;

  if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(item => observer.observe(item));
})();

// Compact mobile navigation that never changes the page scroll position.
(function initMobileNavigation() {
  const nav = document.querySelector('nav');
  const menu = nav?.querySelector('ul');
  if (!nav || !menu) return;

  nav.setAttribute('aria-label', nav.getAttribute('aria-label') || 'Primary navigation');
  if (!menu.id) menu.id = 'primary-navigation';

  let burger = nav.querySelector('.nav-burger');
  if (!burger) {
    burger = document.createElement('button');
    burger.type = 'button';
    burger.className = 'nav-burger';
    burger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(burger);
  }

  burger.setAttribute('aria-controls', menu.id);
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');

  const isOpen = () => menu.classList.contains('open');

  const positionMenu = () => {
    if (!mobileNavQuery.matches) return;
    const rect = burger.getBoundingClientRect();
    const edge = Math.max(10, Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-menu-edge')) || 12);
    const top = Math.max(edge, Math.round(rect.bottom + 10));
    const right = Math.max(edge, Math.round(window.innerWidth - rect.right));
    menu.style.setProperty('--mobile-menu-top', `${top}px`);
    menu.style.setProperty('--mobile-menu-right', `${right}px`);
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!isOpen()) return;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    if (mobileNavQuery.matches) menu.setAttribute('aria-hidden', 'true');
    else menu.removeAttribute('aria-hidden');
    if (restoreFocus) burger.focus({ preventScroll: true });
  };

  const openMenu = () => {
    positionMenu();
    menu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    menu.setAttribute('aria-hidden', 'false');
  };

  if (mobileNavQuery.matches) menu.setAttribute('aria-hidden', 'true');
  else menu.removeAttribute('aria-hidden');

  burger.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  menu.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('pointerdown', event => {
    if (!isOpen()) return;
    if (!nav.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });

  window.addEventListener('resize', () => {
    if (isOpen()) positionMenu();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (isOpen()) positionMenu();
  }, { passive: true });

  const handleViewportChange = event => {
    closeMenu();
    if (event.matches) menu.setAttribute('aria-hidden', 'true');
    else menu.removeAttribute('aria-hidden');
  };

  if (typeof mobileNavQuery.addEventListener === 'function') {
    mobileNavQuery.addEventListener('change', handleViewportChange);
  } else if (typeof mobileNavQuery.addListener === 'function') {
    mobileNavQuery.addListener(handleViewportChange);
  }
})();

// Keep filter-button state available to assistive technology.
(function initFilterAccessibility() {
  document.querySelectorAll('.shop-tabs, .blog-filters, .ing-tabs').forEach(group => {
    group.setAttribute('role', 'group');
    const label = group.classList.contains('shop-tabs') ? 'Filter shop products' :
      group.classList.contains('blog-filters') ? 'Filter blog posts' : 'Filter skincare recommendations';
    group.setAttribute('aria-label', label);

    const buttons = Array.from(group.querySelectorAll('button'));
    const sync = () => buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('on')));
    });
    sync();
    buttons.forEach(button => button.addEventListener('click', () => queueMicrotask(sync)));
  });
})();

// Newsletter form handler.
const MC_NEWSLETTER_URL = 'https://wordpress.us11.list-manage.com/subscribe/post?u=e33059783dca94dc78ba9c2cf&id=640e1de445&f_id=00c58ce0f0';
const MC_HONEYPOT_NAME = 'b_e33059783dca94dc78ba9c2cf_640e1de445';

function setFormMessage(form, message, isError = false) {
  let status = form.querySelector('.form-live-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-live-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = `margin-top:10px;font-size:.82rem;color:${isError ? 'var(--pink-mid)' : 'inherit'};`;
    form.insertAdjacentElement('afterend', status);
  }
  status.style.color = isError ? 'var(--pink-mid)' : '';
  status.textContent = message;
}

function handleNwSub(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const emailInput = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"], button');
  if (!emailInput || !button) return;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const email = emailInput.value.trim();
  const originalText = button.textContent;
  button.textContent = 'Joining…';
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');

  const body = new URLSearchParams();
  body.set('EMAIL', email);
  body.set(MC_HONEYPOT_NAME, '');

  fetch(MC_NEWSLETTER_URL, { method: 'POST', mode: 'no-cors', body })
    .then(() => {
      button.textContent = "You're in!";
      button.style.background = 'var(--green-lt)';
      setFormMessage(form, 'Subscription submitted successfully.');
      form.reset();
    })
    .catch(() => {
      button.textContent = 'Try again';
      setFormMessage(form, 'Something went wrong. Please try again.', true);
    })
    .finally(() => {
      form.removeAttribute('aria-busy');
      window.setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.disabled = false;
      }, 3500);
    });
}

// Contact form mail handler retained for pages that use it.
function handleContactMail(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const name = form.querySelector('[name="name"]')?.value.trim() || '';
  const email = form.querySelector('[name="email"]')?.value.trim() || '';
  const subject = form.querySelector('[name="subject"]')?.value || 'Website enquiry';
  const message = form.querySelector('[name="message"]')?.value.trim() || '';
  const body = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
  window.location.href = `mailto:contact@stylishandhealthy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Active navigation link.
(function setActiveNavigationLink() {
  const path = window.location.pathname.replace(/\/$/, '');
  const slug = path.split('/').pop()?.replace(/\.html$/, '') || '';

  document.querySelectorAll('nav ul li a').forEach(anchor => {
    const href = anchor.getAttribute('href') || '';
    const hrefSlug = href.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '');
    const active = (!slug && (!hrefSlug || hrefSlug === 'index')) || (slug && slug === hrefSlug);
    anchor.classList.toggle('active', active);
    if (active) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  });
})();
