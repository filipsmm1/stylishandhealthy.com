/* ============================================================
   STYLISH AND HEALTHY — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Sticky Nav ──────────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Nav Overlay ──────────────────────────────────── */
  const hamburger = document.querySelector('.nav__hamburger');
  const overlay   = document.querySelector('.nav__overlay');
  const closeBtn  = document.querySelector('.nav__overlay-close');

  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => overlay.classList.add('open'));
    closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
    // Close on link click
    overlay.querySelectorAll('.nav__overlay-link').forEach(link => {
      link.addEventListener('click', () => overlay.classList.remove('open'));
    });
  }

  /* ── Scroll Reveal ───────────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      revealObserver.observe(el);
    });
  }

  /* ── Gold Line Animation ─────────────────────────────────── */
  const goldLines = document.querySelectorAll('.gold-line, .manifesto__line-top, .manifesto__line-bottom');
  if (goldLines.length) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    goldLines.forEach(line => lineObserver.observe(line));
  }

  /* ── Duplicate Marquee for seamless loop ─────────────────── */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    const clone = marqueeTrack.cloneNode(true);
    marqueeTrack.parentElement.appendChild(clone);
  }

});
