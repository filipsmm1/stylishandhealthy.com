(function () {
  'use strict';

  const articleCatalog = [
    { title: 'Acne Treatment Guide: What Works for Major Acne Types', url: '/blog/acne-treatment-guide', image: '/assets/images/acne-treatment-guide-banner.webp', category: 'Skincare Science' },
    { title: 'Anua PDRN Hyaluronic Acid Capsule Serum Review', url: '/blog/anua-pdrn-hyaluronic-acid-capsule-serum-review', image: '/assets/images/anua_pdrn_serum_review_banner.png', category: 'Skincare Reviews' },
    { title: 'Are Glute Activation Exercises Overrated for Women?', url: '/blog/are-glute-activation-exercises-overrated', image: '/assets/images/glute_activation_banner.png', category: 'Wellness' },
    { title: 'Azelaic Acid for Dark Spots and Acne: Does It Actually Work?', url: '/blog/azelaic-acid-for-dark-spots', image: '/assets/images/azelaic-acid-dark-spots-banner.webp', category: 'Skincare Science' },
    { title: 'Beauty of Joseon Relief Sun Ingredients: Full INCI + UV Filters', url: '/blog/beauty-of-joseon-relief-sun', image: '/assets/images/blogcardbeautyof.png', category: 'Skincare Science' },
    { title: 'Beef Tallow for Skin: Does It Actually Work?', url: '/blog/beef-tallow-skin-health', image: '/assets/images/beef_tallow_skin_banner.png', category: 'Skincare Science' },
    { title: '7 Best Moisturizers for Oily, Acne-Prone Skin (2026)', url: '/blog/best-moisturizers-oily-acne-prone-skin', image: '/assets/images/moisturizers_oily_acne_banner.png', category: 'Skincare Science' },
    { title: 'Biodance Bio-Collagen Mask Review: Claims, Ingredients & Verdict', url: '/blog/biodance-bio-collagen-real-deep-mask-review', image: '/assets/images/biodance_bio_collagen_mask_banner.png', category: 'Skincare Claims Reviews' },
    { title: 'Can Hair Products Cause Forehead Acne? Causes + Fixes', url: '/blog/can-hair-products-cause-forehead-acne', image: '/assets/images/hair-products-forehead-acne-banner.webp', category: 'Skincare Science' },
    { title: 'Does Cyperus Rotundus Oil Reduce Hair Growth? Human Evidence & Safety', url: '/blog/cyperus-rotundus-oil-hair-removal', image: '/assets/images/cyperus_rotundus_oil_hair_removal_banner.png', category: 'Hair Science' },
    { title: 'Damaged Skin Barrier? 9 Signs You Overdid Your Skincare Routine', url: '/blog/damaged-skin-barrier', image: '/assets/images/damaged_skin_barrier_banner.png', category: 'Skincare Science' },
    { title: 'Do Ice Rollers and Cryo Sticks Work? Benefits and Risks', url: '/blog/do-ice-rollers-cryo-sticks-work', image: '/assets/images/cooling_skincare_banner.png', category: 'Skincare Science' },
    { title: 'Do LED Face Masks Actually Work? Red-Light Therapy Explained', url: '/blog/do-led-face-masks-work', image: '/assets/images/led_face_mask_banner.png', category: 'Skincare Science' },
    { title: 'Do Neck Creams Work Better Than Regular Moisturizer?', url: '/blog/do-neck-creams-work-better-than-moisturizer', image: '/assets/images/neck-cream-vs-moisturizer-banner.webp', category: 'Skincare Science' },
    { title: 'Qure Shower Filter Review: Acne, Eczema & Hair', url: '/blog/do-shower-filters-help-acne-eczema-hair-qure-review', image: '/assets/images/qure_shower_filter_review_banner.png', category: 'Skin and Hair Science' },
    { title: 'Do You Need Sunscreen at UV Index 0, 1 or 2?', url: '/blog/do-you-need-sunscreen-uv-index-0-1-2', image: '/assets/images/do-you-need-sunscreen-low-uv-banner.webp', category: 'Sun Care' },
    { title: 'Does Topical PDRN Actually Work? Serum vs Injections', url: '/blog/does-topical-pdrn-work-serum-vs-injections', image: '/assets/images/topical-pdrn-serum-vs-injections-banner.webp', category: 'Skincare Science' },
    { title: 'Eqqual Berry Vitamin Illuminating Serum Review: Ingredients & Verdict', url: '/blog/eqqual-berry-serum', image: '/assets/images/eqqual_banner.png', category: 'Skincare Science' },
    { title: 'Fibermaxxing: Benefits, Side Effects and How Much Fiber You Need', url: '/blog/fibermaxxing-benefits-side-effects', image: '/assets/images/fibermaxxing_banner.png', category: 'Nutrition Science' },
    { title: 'Fungal Acne vs Closed Comedones: How to Tell the Difference', url: '/blog/fungal-acne-vs-closed-comedones', image: '/assets/images/fungal-acne-vs-closed-comedones-difference-guide-hero.webp', category: 'Skincare Science' },
    { title: 'Garnier Vitamin C Sorbet Cream Review & Ingredients', url: '/blog/garnier-vitamin-c-sorbet-cream', image: '/assets/images/garniervitcbanner.png', category: 'Skincare Reviews' },
    { title: 'How to Fade Post-Acne Dark Spots Without Damaging Your Skin', url: '/blog/how-to-fade-post-acne-dark-spots', image: '/assets/images/post-acne-dark-spots-banner.webp', category: 'Skincare Science' },
    { title: 'Hypochlorous Acid Face Spray: Does It Actually Work?', url: '/blog/hypochlorous-acid-face-spray', image: '/assets/images/hocl_face_spray_banner.png', category: 'Skincare Science' },
    { title: 'What Is Stylishandhealthy? Science-Backed Beauty & Skincare Explained', url: '/blog/introduction', image: '/assets/images/youtube_banner.png', category: 'From the Blog' },
    { title: 'Medicube PDRN Pink Peptide Serum Review: Evidence & Ingredients', url: '/blog/medicube-pdrn-pink-peptide-serum-review', image: '/assets/images/medicube_pdrn_pink_peptide_serum_review_banner.png', category: 'Skincare Reviews' },
    { title: 'Oily but Dehydrated Skin: Causes, Signs and What to Use', url: '/blog/oily-but-dehydrated-skin', image: '/assets/images/oily_dehydrated_skin_banner.png', category: 'Skin Science' },
    { title: 'PIH vs PIE vs Acne Scars: Brown, Red, Pitted or Raised?', url: '/blog/pih-vs-pie-vs-acne-scars', image: '/assets/images/pih-vs-pie-acne-scars-banner.webp', category: 'Skincare Science' },
    { title: 'Can You Use Reedle Shot With Retinol, Vitamin C or Acids?', url: '/blog/reedle-shot-with-retinol-acids-vitamin-c', image: '/assets/images/reedle-shot-layering-guide-banner.webp', category: 'Skincare Science' },
    { title: 'The Truth About Salicylic Acid 2%', url: '/blog/salicylic-acid-2', image: '/assets/images/youtube_banner.png', category: 'Skincare Science' },
    { title: 'Salicylic Acid vs Benzoyl Peroxide: Which Is Better for Your Acne?', url: '/blog/salicylic-acid-vs-benzoyl-peroxide', image: '/assets/images/salicylic-acid-vs-benzoyl-peroxide-banner.webp', category: 'Skincare Science' },
    { title: 'Is My Skin Barrier Damaged, or Do I Just Have Acne?', url: '/blog/skin-barrier-damaged-or-acne', image: '/assets/images/skin_barrier_vs_acne_banner.png', category: 'Skincare Science' },
    { title: 'Slow Hair Growth? What Hair Growth Oils Actually Do', url: '/blog/slow-growth-hair-growth-oil', image: '/assets/images/slow_growth_hair_oil_banner.png', category: 'Hair Science' },
    { title: 'The Evidence-Based SPF Guide for Face and Body', url: '/blog/spf-guide', image: '/assets/images/spf_guide_banner.png', category: 'Skincare Science' },
    { title: 'Sunscreen or Bug Spray First? Correct Order + Wait Time', url: '/blog/sunscreen-or-bug-spray-first', image: '/assets/images/sunscreen-bug-spray-first-banner.webp', category: 'Sun Safety' },
    { title: 'Is The Ordinary Glycolic Acid 7% Strong? Review & Safe Use', url: '/blog/the-ordinary-glycolic-acid-7-review', image: '/assets/images/glycolic_acid_7_banner.png', category: 'Skincare Science' },
    { title: 'What Does Cruelty-Free Mean? Labels, Laws & Animal Testing', url: '/blog/what-cruelty-free-means', image: '/assets/images/cruelty_free_label_banner.png', category: 'Beauty Ethics' },
    { title: 'Can You Tan at UV Index 1-5? What Each Level Means', url: '/blog/what-uv-index-can-you-tan-in', image: '/assets/images/uv-index-tanning-guide-16x9.webp', category: 'Skincare Science' },
    { title: 'Why Your Acne Keeps Returning in the Same Spot', url: '/blog/why-acne-keeps-returning-same-spot', image: '/assets/images/active_acne_vs_residual_mark.png', category: 'Skin Science' },
    { title: 'Why Does My Moisturizer Burn? 7 Causes + What to Do', url: '/blog/why-does-my-moisturizer-burn', image: '/assets/images/moisturizer_burn_banner.png', category: 'Skincare Science' },
    { title: 'Why Does My Sunscreen Pill? 8 Reasons + How to Stop It', url: '/blog/why-does-my-sunscreen-pill', image: '/assets/images/sunscreen-pilling-causes-guide-banner.webp', category: 'Skincare Science' },
    { title: 'Why Does Sunscreen Burn My Eyes? 7 Causes + How to Stop It', url: '/blog/why-does-sunscreen-burn-my-eyes', image: '/assets/images/why-sunscreen-burns-eyes-banner.webp', category: 'Skincare Science' },
    { title: "10 Women's Fitness Myths Debunked by Science", url: '/blog/womens-fitness-myths', image: '/assets/images/fitnessmythsbanner.png', category: 'Wellness' }
  ];

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

  const normalizeArticlePath = (value) => {
    const path = new URL(value, window.location.origin).pathname;
    return path.replace(/\.html$/i, '').replace(/\/$/, '');
  };

  const randomIndex = (length) => {
    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % length;
    }
    return Math.floor(Math.random() * length);
  };

  const recommendations = articleCatalog
    .filter((item) => normalizeArticlePath(item.url) !== normalizeArticlePath(window.location.href));

  for (let index = recommendations.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [recommendations[index], recommendations[swapIndex]] = [recommendations[swapIndex], recommendations[index]];
  }

  const recommendationSection = document.createElement('section');
  recommendationSection.className = 'article-recommendations';
  recommendationSection.setAttribute('aria-labelledby', 'continue-reading-title');

  const kicker = document.createElement('p');
  kicker.className = 'article-recommendations-kicker';
  kicker.textContent = 'More from Stylish & Healthy';

  const recommendationTitle = document.createElement('h2');
  recommendationTitle.id = 'continue-reading-title';
  recommendationTitle.textContent = 'Continue reading';

  const recommendationIntro = document.createElement('p');
  recommendationIntro.className = 'article-recommendations-intro';
  recommendationIntro.textContent = 'Three fresh picks, chosen at random for your next read.';

  const recommendationGrid = document.createElement('div');
  recommendationGrid.className = 'article-recommendations-grid';

  recommendations.slice(0, 3).forEach((item) => {
    const card = document.createElement('a');
    card.className = 'article-recommendation-card';
    card.href = item.url;

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 1200;
    image.height = 675;

    const copy = document.createElement('span');
    copy.className = 'article-recommendation-copy';

    const category = document.createElement('span');
    category.className = 'article-recommendation-category';
    category.textContent = item.category;

    const title = document.createElement('span');
    title.className = 'article-recommendation-title';
    title.textContent = item.title;

    const callToAction = document.createElement('span');
    callToAction.className = 'article-recommendation-cta';
    callToAction.textContent = 'Read article';

    copy.append(category, title, callToAction);
    card.append(image, copy);
    recommendationGrid.append(card);
  });

  recommendationSection.append(kicker, recommendationTitle, recommendationIntro, recommendationGrid);
  article.append(recommendationSection);
})();
