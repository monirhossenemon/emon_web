/* GhostByte Portfolio - lightweight vanilla JS */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loading screen ---------- */
  function initLoader() {
    const loader = $('#loader');
    const hide = () => loader.classList.add('done');
    window.addEventListener('load', () => setTimeout(hide, reduceMotion ? 0 : 1000));
    setTimeout(hide, 3000); // safety fallback
  }

  /* ---------- Missing image fallback ---------- */
  function initImageFallback() {
    $$('img').forEach(img => {
      const mark = () => img.classList.add('broken');
      img.addEventListener('error', mark);
      if (img.complete && img.naturalWidth === 0) mark();
    });
  }

  /* ---------- Typing animation (hero) ---------- */
  function initTyping() {
    const el = $('#typed');
    const words = ['Developer', 'Python Learner', 'Web Creator', 'AI & Automation Explorer'];
    if (reduceMotion) { el.textContent = words.join(' • '); return; }
    let w = 0, c = 0, deleting = false;
    (function tick() {
      const word = words[w];
      c += deleting ? -1 : 1;
      el.textContent = word.slice(0, c);
      let delay = deleting ? 40 : 90;
      if (!deleting && c === word.length) { deleting = true; delay = 1400; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Navbar: glass on scroll, hamburger, active link ---------- */
  function initNav() {
    const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
    const links = $$('a', menu);

    const closeMenu = () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    links.forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) closeMenu();
    });

    // Active link follows the section in view
    const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const setActive = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = sections[0];
      sections.forEach(s => { if (s.offsetTop <= y) current = s; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
    };

    // Single throttled scroll handler (nav style, active link, back-to-top)
    const toTop = $('#toTop');
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
        toTop.classList.toggle('show', window.scrollY > 500);
        setActive();
        ticking = false;
      });
    }, { passive: true });
    nav.classList.toggle('scrolled', window.scrollY > 20);
    setActive();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Smooth scrolling for anchor links ---------- */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(i => i.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    items.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 80 + 'ms'; // small stagger
      io.observe(el);
    });
  }

  /* ---------- Terminal typing (starts when visible) ---------- */
  function initTerminal() {
    const out = $('#terminal');
    const lines = [
      '> system.init()',
      '> learning_python...',
      '> building_projects...',
      '> exploring_ai...',
      '> testing_new_ideas...',
      '> status: ONLINE'
    ];
    const cursor = '<span class="cur">█</span>';
    if (reduceMotion) { out.innerHTML = lines.join('\n') + '\n' + cursor; return; }

    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      let l = 0, c = 0, text = '';
      (function type() {
        if (l >= lines.length) { out.innerHTML = text + cursor; return; }
        const line = lines[l];
        c++;
        out.innerHTML = text + line.slice(0, c) + cursor;
        if (c >= line.length) { text += line + '\n'; l++; c = 0; setTimeout(type, 450); }
        else setTimeout(type, 45);
      })();
    };
    out.innerHTML = cursor;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e, o) => {
        if (e[0].isIntersecting) { run(); o.disconnect(); }
      }, { threshold: 0.3 }).observe(out);
    } else run();
  }

  /* ---------- Floating particles (canvas, low count) ---------- */
  function initParticles() {
    if (reduceMotion) return;
    const canvas = $('#particles');
    const ctx = canvas.getContext('2d');
    let w, h, dpr, parts = [], running = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap for performance
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      const count = window.innerWidth < 600 ? 28 : 55;
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.5 + 0.6) * dpr,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (-Math.random() * 0.35 - 0.1) * dpr,
        a: Math.random() * 0.5 + 0.2
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    (function draw() {
      if (running) {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy;
          if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
          if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
          ctx.beginPath();
          ctx.fillStyle = 'rgba(0,240,200,' + p.a + ')';
          ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    })();

    // Pause when tab is hidden to save battery
    document.addEventListener('visibilitychange', () => { running = !document.hidden; });
  }

  /* ---------- Cursor-following glow (mouse devices only) ---------- */
  function initCursorGlow() {
    if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    const glow = $('#cursorGlow');
    let x = 0, y = 0, queued = false;
    window.addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      glow.style.opacity = 1;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        glow.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        queued = false;
      });
    }, { passive: true });
    document.addEventListener('mouseleave', () => { glow.style.opacity = 0; });
  }

  /* ---------- Project card tilt hover (mouse only) ---------- */
  function initCardEffects() {
    if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    $$('.project').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'translateY(-6px) perspective(800px) rotateX(' + (-py * 4) + 'deg) rotateY(' + (px * 4) + 'deg)';
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Init ---------- */
  initLoader();
  document.addEventListener('DOMContentLoaded', () => {
    initImageFallback();
    initTyping();
    initNav();
    initSmoothScroll();
    initReveal();
    initTerminal();
    initParticles();
    initCursorGlow();
    initCardEffects();
  });
})();