document.addEventListener('DOMContentLoaded', function() {

  // Sticky nav
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
    if (window.scrollY > 40) nav.classList.add('scrolled');
  }

  // Mobile nav
  var hamburger = document.querySelector('.nav__hamburger');
  var overlay = document.querySelector('.nav__overlay');
  var closeBtn = document.querySelector('.nav__overlay-close');
  if (hamburger && overlay) {
    hamburger.addEventListener('click', function() { overlay.classList.add('open'); });
    if (closeBtn) closeBtn.addEventListener('click', function() { overlay.classList.remove('open'); });
    var overlayLinks = overlay.querySelectorAll('.nav__overlay-link');
    for (var i = 0; i < overlayLinks.length; i++) {
      overlayLinks[i].addEventListener('click', function() { overlay.classList.remove('open'); });
    }
  }

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && window.IntersectionObserver) {
    var revealObs = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('visible');
          revealObs.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.08 });
    for (var i = 0; i < reveals.length; i++) {
      revealObs.observe(reveals[i]);
    }
  } else {
    for (var i = 0; i < reveals.length; i++) {
      reveals[i].classList.add('visible');
    }
  }

  // Gold lines
  var lines = document.querySelectorAll('.gold-line, .manifesto__line-top, .manifesto__line-bottom');
  if (lines.length && window.IntersectionObserver) {
    var lineObs = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('animate');
          lineObs.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.5 });
    for (var i = 0; i < lines.length; i++) {
      lineObs.observe(lines[i]);
    }
  }

  // Mailchimp newsletter form
  var mcForm = document.getElementById('mc-embedded-subscribe-form');
  if (mcForm) {
    mcForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var emailInput = mcForm.querySelector('input[name="EMAIL"]');
      var responseEl = document.getElementById('mc-form-response');
      var btn = mcForm.querySelector('button[type="submit"]');
      var btnSpan = btn ? btn.querySelector('span') : null;

      if (!emailInput || !emailInput.value.trim()) {
        if (responseEl) { responseEl.textContent = 'Please enter your email address.'; responseEl.style.color = '#D4A090'; }
        return;
      }

      if (btn) btn.disabled = true;
      if (btnSpan) btnSpan.textContent = 'JOINING...';

      var action = mcForm.action.replace('/post?', '/post-json?') + '&c=mcCallback';
      var params = new URLSearchParams(new FormData(mcForm)).toString();
      var script = document.createElement('script');
      script.src = action + '&' + params;

      var timer = setTimeout(function() {
        script.remove();
        if (btn) btn.disabled = false;
        if (btnSpan) btnSpan.textContent = 'JOIN →';
        if (responseEl) { responseEl.textContent = 'Request timed out. Please try again.'; responseEl.style.color = '#D4A090'; }
      }, 8000);

      window.mcCallback = function(data) {
        clearTimeout(timer);
        script.remove();
        delete window.mcCallback;
        if (btn) btn.disabled = false;
        if (btnSpan) btnSpan.textContent = 'JOIN →';
        if (data.result === 'success') {
          if (responseEl) { responseEl.textContent = 'You are in. Welcome to the ritual.'; responseEl.style.color = '#C9A263'; }
          if (emailInput) emailInput.value = '';
        } else {
          var msg = data.msg ? data.msg.replace(/<[^>]*>/g, '') : 'Something went wrong. Please try again.';
          if (msg.indexOf('already subscribed') > -1) msg = 'You are already subscribed.';
          if (responseEl) { responseEl.textContent = msg; responseEl.style.color = '#D4A090'; }
        }
      };

      document.head.appendChild(script);
    });
  }

});
