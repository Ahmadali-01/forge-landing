/* ============================================================
   Forge — main.js
   Mobile nav, sticky header, scroll spy, reveal animations,
   dynamic year, contact form validation.
   ============================================================ */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 1. Mobile navigation ---------- */
  const navToggle = $('#nav-toggle');
  const navMenu   = $('#nav-menu');
  const MOBILE_BP = 760;

  function openNav() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
  }
  function closeNav() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
  }
  function toggleNav() {
    navMenu.classList.contains('is-open') ? closeNav() : openNav();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', toggleNav);

    $$('.nav__link, .nav__cta', navMenu).forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= MOBILE_BP) closeNav();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth > MOBILE_BP) return;
      if (!navMenu.classList.contains('is-open')) return;
      if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > MOBILE_BP) closeNav();
      }, 150);
    });
  }

  /* ---------- 2. Sticky header shadow ---------- */
  const header = $('#site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 3. Scroll spy ---------- */
  const navLinks = $$('.nav__link');
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      return id && id.startsWith('#') ? document.getElementById(id.slice(1)) : null;
    })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveLink(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- 4. Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- 5. Dynamic year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 6. Contact form validation ---------- */
  const form = $('#contact-form');
  if (!form) return;

  const submitBtn = $('#submit-btn');
  const statusEl  = $('#form-status');
  const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  const rules = {
    name(value) {
      const v = value.trim();
      if (!v) return 'Please enter your name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (v.length > 80) return 'Name must be under 80 characters.';
      return '';
    },
    email(value) {
      const v = value.trim();
      if (!v) return 'Please enter your email address.';
      if (!EMAIL_RE.test(v)) return 'Please enter a valid email address.';
      return '';
    },
    message(value) {
      const v = value.trim();
      if (!v) return 'Please tell us a little about your project.';
      if (v.length < 10) return 'Message must be at least 10 characters.';
      if (v.length > 1200) return 'Message must be under 1200 characters.';
      return '';
    }
  };

  function setFieldState(input, errorText) {
    const field   = input.closest('.field');
    const errorEl = field ? $('.field__error', field) : null;
    if (errorEl) errorEl.textContent = errorText;
    if (field) {
      field.classList.toggle('is-invalid', Boolean(errorText));
      field.classList.toggle('is-valid', !errorText && input.value.trim() !== '');
    }
    input.setAttribute('aria-invalid', errorText ? 'true' : 'false');
  }

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;
    const error = rule(input.value);
    setFieldState(input, error);
    return !error;
  }

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field && field.classList.contains('is-invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let firstInvalid = null;
    let allValid = true;

    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      if (!validateField(input)) {
        allValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!allValid) {
      statusEl.textContent = 'Please fix the highlighted fields and try again.';
      statusEl.className = 'form__status is-error';
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const labelEl = $('.btn__label', submitBtn);
    const originalLabel = labelEl ? labelEl.textContent : 'Send message';

    submitBtn.disabled = true;
    if (labelEl) labelEl.textContent = 'Sending…';
    statusEl.textContent = '';
    statusEl.className = 'form__status';

    // Simulated async submit — replace with real fetch() to your endpoint.
    setTimeout(() => {
      submitBtn.disabled = false;
      if (labelEl) labelEl.textContent = originalLabel;

      statusEl.textContent =
        'Thanks! Your message is on its way — we usually reply within one business day.';
      statusEl.className = 'form__status is-success';

      form.reset();
      $$('.field', form).forEach((field) => {
        field.classList.remove('is-valid', 'is-invalid');
      });
    }, 1200);
  });
})();