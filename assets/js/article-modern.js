(function () {
  'use strict';

  const article = document.querySelector('.article-card');
  if (!article || !document.body.classList.contains('article-page')) return;

  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.prepend(progress);

  const progressFill = progress.firstElementChild;
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.setAttribute('title', 'Back to top');
  backToTop.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 14 6-6 6 6"/></svg>';
  document.body.append(backToTop);

  let ticking = false;
  const updateReadingUi = () => {
    const start = article.offsetTop;
    const distance = Math.max(article.offsetHeight - window.innerHeight, 1);
    const value = Math.min(Math.max((window.scrollY - start) / distance, 0), 1);
    progressFill.style.transform = 'scaleX(' + value + ')';
    backToTop.classList.toggle('is-visible', window.scrollY > 700);
    ticking = false;
  };

  const requestReadingUiUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateReadingUi);
  };

  window.addEventListener('scroll', requestReadingUiUpdate, { passive: true });
  window.addEventListener('resize', requestReadingUiUpdate);
  backToTop.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  updateReadingUi();

  const tocLinks = Array.from(document.querySelectorAll('.toc-box a[href^="#"]'));
  const tocTargets = tocLinks
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && tocTargets.length) {
    const linkForTarget = new Map(
      tocLinks.map((link) => [link.getAttribute('href').slice(1), link])
    );
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => link.classList.remove('is-active'));
      const active = linkForTarget.get(visible.target.id);
      if (active) active.classList.add('is-active');
    }, { rootMargin: '-16% 0px -68% 0px', threshold: 0 });
    tocTargets.forEach((target) => observer.observe(target));
  }

  document.querySelectorAll('.comparison-table').forEach((table) => {
    const labels = Array.from(table.querySelectorAll('thead th'))
      .map((heading) => heading.textContent.trim());
    if (!labels.length) return;
    table.querySelectorAll('tbody tr').forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (cell.querySelector('.mobile-cell-label')) return;
        const label = document.createElement('span');
        label.className = 'mobile-cell-label';
        label.setAttribute('aria-hidden', 'true');
        label.textContent = labels[index] || 'Detail';
        cell.prepend(label);
      });
    });
  });

  const faqItems = Array.from(document.querySelectorAll('.faq-section details'));
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
