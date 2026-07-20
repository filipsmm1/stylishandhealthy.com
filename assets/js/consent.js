/* Google Analytics consent and cookie controls. */
(function () {
  'use strict';

  const measurementId = 'G-3NFYWF4Z4F';
  const storageKey = 'stylishandhealthy-cookie-consent';
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function readChoice() {
    try {
      const choice = window.localStorage.getItem(storageKey);
      return choice === 'accepted' || choice === 'rejected' ? choice : null;
    } catch (error) {
      return null;
    }
  }

  function rememberChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch (error) {
      // The banner still works when storage is unavailable.
    }
  }

  function removeAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      const name = cookie.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + window.location.hostname + '; SameSite=Lax';
      }
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }

  function updateConsent(choice) {
    const accepted = choice === 'accepted';
    window.gtag('consent', 'update', {
      analytics_storage: accepted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    if (accepted) loadAnalytics();
    else removeAnalyticsCookies();
  }

  function buildControls() {
    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="cookie-banner__content">' +
        '<div class="cookie-banner__copy">' +
          '<h2 id="cookie-title">Your privacy choices</h2>' +
          '<p>We use optional analytics cookies to understand how people use this website. You can accept or reject them. <a href="/privacy">Privacy policy</a></p>' +
        '</div>' +
        '<div class="cookie-banner__actions">' +
          '<button class="cookie-choice" type="button" data-cookie-choice="rejected">Reject</button>' +
          '<button class="cookie-choice" type="button" data-cookie-choice="accepted">Accept</button>' +
        '</div>' +
      '</div>';

    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'cookie-settings';
    settings.textContent = 'Cookie settings';
    settings.hidden = true;

    function showBanner() {
      banner.hidden = false;
      settings.hidden = true;
      const firstButton = banner.querySelector('[data-cookie-choice]');
      if (firstButton) firstButton.focus({ preventScroll: true });
    }

    function saveChoice(choice) {
      rememberChoice(choice);
      updateConsent(choice);
      banner.hidden = true;
      settings.hidden = false;
      settings.focus({ preventScroll: true });
    }

    banner.addEventListener('click', function (event) {
      const button = event.target.closest('[data-cookie-choice]');
      if (button) saveChoice(button.getAttribute('data-cookie-choice'));
    });
    settings.addEventListener('click', showBanner);

    document.body.appendChild(banner);
    document.body.appendChild(settings);

    if (readChoice()) settings.hidden = false;
    else showBanner();
  }

  const savedChoice = readChoice();
  if (savedChoice) updateConsent(savedChoice);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildControls, { once: true });
  } else {
    buildControls();
  }
}());
