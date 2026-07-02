/* ============================================================
   MULTIMEDIA & AUTHORING — SCRIPT.JS
   Handles: page transitions, dark mode, background music,
            scroll reveals, nav toggle, header scroll
   ============================================================ */

(() => {
  'use strict';

  /* ── Custom Cursor ──────────────────────────────────────── */
  const cursor = document.getElementById('customCursor');
  if (cursor) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;

    document.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
    });

    (function animCursor() {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate(${cx - 50}%, ${cy - 50}%)`;
      requestAnimationFrame(animCursor);
    })();

    // hover state
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('a, button, [role="button"], .orbit-slide, .hero-bubble');
      document.body.classList.toggle('cursor-hover', !!el);
    });
  }

  /* ── Theme (Dark / Light) ──────────────────────────────── */
  const THEME_KEY = 'ma-theme';
  const html = document.documentElement;

  function getTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme, btn) {
    document.body.classList.toggle('dark', theme === 'dark');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem(THEME_KEY, theme);
  }

  // Set theme immediately to prevent flash
  const initialTheme = getTheme();
  document.body.classList.toggle('dark', initialTheme === 'dark');

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    applyTheme(initialTheme, themeBtn);
    themeBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(next, themeBtn);
    });
  }

  /* ── Background Music ───────────────────────────────────── */
  /* Place your custom track at:  music/background-music.mp3
     It will loop infinitely until the speaker icon is pressed. */
  const MUSIC_KEY   = 'ma-music-enabled';
  const VOLUME_FADE = 0.35;
  const MUSIC_SRC   = 'music/background-music.mp3'; // ← put your custom mp3 here

  let audio = null;
  let musicEnabled = localStorage.getItem(MUSIC_KEY) === 'true';
  let musicErrored = false;

  const musicToggle = document.getElementById('music-toggle');
  const musicBar    = document.getElementById('music-bar');
  const musicBarLabel = document.getElementById('music-bar-label');

  function initAudio() {
    if (audio) return;
    audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';

    audio.addEventListener('error', () => {
      // File not found / failed to load — keep the button visible so the
      // user can still see the control once the mp3 is added, just stop
      // trying to play and let them know via title/label.
      musicErrored = true;
      if (musicToggle) {
        musicToggle.setAttribute('title', 'Add music/background-music.mp3 to enable music');
      }
      setMusicUI(false);
    });
  }

  function fadeIn(a, target = VOLUME_FADE, duration = 1200) {
    const start = performance.now();
    const from  = a.volume;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      a.volume = from + (target - from) * t;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function fadeOut(a, duration = 900) {
    return new Promise(resolve => {
      const start = performance.now();
      const from  = a.volume;
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        a.volume = from * (1 - t);
        if (t < 1) requestAnimationFrame(step);
        else { a.pause(); a.volume = 0; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  function setMusicUI(playing) {
    if (musicToggle) {
      musicToggle.classList.toggle('playing', playing);
      musicToggle.setAttribute('aria-label', playing ? 'Turn off background music' : 'Play background music');
    }
    if (musicBar) {
      musicBar.classList.toggle('playing', playing);
      musicBar.classList.toggle('visible', playing);
      if (musicBarLabel) musicBarLabel.textContent = playing ? 'Now playing' : 'Music paused';
    }
  }

  async function startMusic() {
    initAudio();
    if (musicErrored) return; // mp3 missing — nothing to play yet
    try {
      audio.volume = 0;
      await audio.play();
      fadeIn(audio);
      musicEnabled = true;
      localStorage.setItem(MUSIC_KEY, 'true');
      setMusicUI(true);
    } catch (e) {
      // autoplay blocked — needs a user gesture; button stays as "off"
      musicEnabled = false;
      setMusicUI(false);
    }
  }

  async function stopMusic() {
    musicEnabled = false;
    localStorage.setItem(MUSIC_KEY, 'false');
    setMusicUI(false);
    if (!audio) return;
    await fadeOut(audio);
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      const isPlaying = audio && !audio.paused;
      if (isPlaying) stopMusic();
      else startMusic();
    });
  }

  // Resume music on load if it was enabled on a previous page (infinite
  // loop across navigation). If the browser blocks autoplay before any
  // gesture, fall back to starting on the first click anywhere.
  if (musicEnabled) {
    startMusic().then(() => {
      if (!musicEnabled) {
        const resume = () => { startMusic(); document.removeEventListener('click', resume); };
        document.addEventListener('click', resume, { once: true });
      }
    });
  }

  /* ── Page Transitions ───────────────────────────────────── */
  function navigateTo(href) {
    document.body.classList.add('is-leaving');

    // If music is playing, just let it continue — it will continue on next page
    setTimeout(() => { window.location.href = href; }, 320);
  }

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only intercept same-origin, same-folder .html links
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
    if (!href.endsWith('.html') && !href.endsWith('/') && href !== '') return;

    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(href);
    });
  });

  // On page load, animate in
  document.body.classList.add('is-entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('is-entering');
    });
  });

  /* ── Nav Toggle (mobile) ────────────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav   = document.getElementById('primary-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('is-open', !expanded);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
      }
    });
  }

  /* ── Nav Dropdown ("Projects") ──────────────────────────── */
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    const menu    = dropdown.querySelector('.nav-dropdown-menu');
    if (!trigger || !menu) return;

    function openDropdown() {
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closeDropdown() {
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    // Click toggles (works for touch + desktop)
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.contains('is-open') ? closeDropdown() : openDropdown();
    });

    // Keyboard: Escape closes
    dropdown.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeDropdown(); trigger.focus(); }
    });

    // Close when clicking elsewhere
    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target)) closeDropdown();
    });
  });

  /* ── Sticky Header shadow on scroll ─────────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    const io = new IntersectionObserver(
      ([e]) => header.classList.toggle('scrolled', !e.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' }
    );
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    io.observe(sentinel);
  }

  /* ── Scroll Reveal ──────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.panel, .feature-card, .timeline-item, .video-card');

  revealEls.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Lightbox (clickable step images → full view) ───────── */
  /* Any element with [data-lightbox] opens its image (own src, or
     data-full-src for a higher-res version) in a centered overlay
     that never overlaps page content behind it. */
  (function setupLightbox() {
    let overlay = document.getElementById('lightbox-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Close image">&times;</button>
        <img class="lightbox-img" alt="">
      `;
      document.body.appendChild(overlay);
    }
    const imgEl   = overlay.querySelector('.lightbox-img');
    const closeEl = overlay.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
      imgEl.src = src;
      imgEl.alt = alt || '';
      overlay.classList.add('is-open');
      document.body.classList.add('lightbox-locked');
    }
    function closeLightbox() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('lightbox-locked');
      setTimeout(() => { imgEl.src = ''; }, 250);
    }

    document.querySelectorAll('[data-lightbox]').forEach(el => {
      el.addEventListener('click', () => {
        const full = el.getAttribute('data-full-src') || el.currentSrc || el.src;
        openLightbox(full, el.alt);
      });
      el.style.cursor = 'zoom-in';
    });

    closeEl.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
    });
  })();

  /* ── Script Cards (copy / download, no visible textarea) ─── */
  /* Small clickable cards: [data-script-card] wraps a hidden
     <textarea data-script-source>, a [data-copy-script] button,
     and a [data-download-script] button. */
  document.querySelectorAll('[data-script-card]').forEach(card => {
    const scriptEl  = card.querySelector('[data-script-source]');
    const copyBtn   = card.querySelector('[data-copy-script]');
    const dlBtn     = card.querySelector('[data-download-script]');
    const statusEl  = card.querySelector('[data-script-status]');
    const filename  = card.getAttribute('data-script-filename') || 'script.py';

    function flashStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.add('is-visible');
      setTimeout(() => statusEl.classList.remove('is-visible'), 1800);
    }

    if (copyBtn && scriptEl) {
      copyBtn.addEventListener('click', async e => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(scriptEl.value);
          flashStatus('Copied!');
        } catch {
          scriptEl.removeAttribute('hidden');
          scriptEl.select();
          document.execCommand('copy');
          scriptEl.setAttribute('hidden', '');
          flashStatus('Copied!');
        }
      });
    }

    if (dlBtn && scriptEl) {
      dlBtn.addEventListener('click', e => {
        e.stopPropagation();
        const blob = new Blob([scriptEl.value], { type: 'text/plain' });
        const a = Object.assign(document.createElement('a'), {
          href: URL.createObjectURL(blob),
          download: filename
        });
        a.click(); URL.revokeObjectURL(a.href);
        flashStatus('Downloaded!');
      });
    }
  });

  /* ── Weekly carousel ────────────────────────────────────── */
  const carousel  = document.getElementById('weekly-carousel');
  if (carousel) {
    const track    = carousel.querySelector('.weekly-track');
    const cards    = carousel.querySelectorAll('.weekly-card');
    const prevBtn  = document.querySelector('[data-weekly-nav="prev"]');
    const nextBtn  = document.querySelector('[data-weekly-nav="next"]');
    let current = 0;

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, cards.length - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Keyboard
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });
  }

  /* ── Script copy / download (supports multiple blocks) ──── */
  /* Each block: a container with [data-script-block] wrapping
     a <textarea data-script-source>, a [data-copy-script] button,
     a [data-download-script] button, and a [data-script-status]. */
  document.querySelectorAll('[data-script-block]').forEach(block => {
    const scriptEl = block.querySelector('[data-script-source]');
    const copyBtn  = block.querySelector('[data-copy-script]');
    const dlBtn    = block.querySelector('[data-download-script]');
    const statusEl = block.querySelector('[data-script-status]');
    const filename = block.getAttribute('data-script-filename') || 'script.py';

    function showStatus(msg) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.add('is-visible');
      setTimeout(() => statusEl.classList.remove('is-visible'), 2400);
    }

    if (copyBtn && scriptEl) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(scriptEl.value);
          showStatus('Copied!');
        } catch {
          scriptEl.select();
          document.execCommand('copy');
          showStatus('Copied!');
        }
      });
    }

    if (dlBtn && scriptEl) {
      dlBtn.addEventListener('click', () => {
        const blob = new Blob([scriptEl.value], { type: 'text/plain' });
        const a = Object.assign(document.createElement('a'), {
          href: URL.createObjectURL(blob),
          download: filename
        });
        a.click(); URL.revokeObjectURL(a.href);
        showStatus('Downloaded!');
      });
    }
  });

  /* Legacy single-block fallback (in case an older markup pattern
     with fixed #copy-script / #download-script IDs is still present) */
  const legacyCopyBtn  = document.getElementById('copy-script');
  const legacyDlBtn    = document.getElementById('download-script');
  const legacyScriptEl = document.getElementById('script-snippet');
  const legacyStatusEl = document.getElementById('copy-status');

  function legacyShowStatus(msg) {
    if (!legacyStatusEl) return;
    legacyStatusEl.textContent = msg;
    legacyStatusEl.classList.add('is-visible');
    setTimeout(() => legacyStatusEl.classList.remove('is-visible'), 2400);
  }

  if (legacyCopyBtn && legacyScriptEl && !legacyCopyBtn.closest('[data-script-block]')) {
    legacyCopyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(legacyScriptEl.value);
        legacyShowStatus('Copied!');
      } catch {
        legacyScriptEl.select();
        document.execCommand('copy');
        legacyShowStatus('Copied!');
      }
    });
  }

  if (legacyDlBtn && legacyScriptEl && !legacyDlBtn.closest('[data-script-block]')) {
    legacyDlBtn.addEventListener('click', () => {
      const blob = new Blob([legacyScriptEl.value], { type: 'text/plain' });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: 'solar_system_blender.py'
      });
      a.click(); URL.revokeObjectURL(a.href);
      legacyShowStatus('Downloaded!');
    });
  }

  /* ── Orbit calculator ───────────────────────────────────── */
  const yearInput = document.getElementById('earth-years');
  const orbitSlides = document.querySelectorAll('.orbit-slide');

  function get(attr) { return document.querySelector(`[data-orbit-detail="${attr}"]`); }

  let activeSlide = orbitSlides[0] || null;

  function updateOrbitDetail(slide) {
    if (!slide || !yearInput) return;
    activeSlide = slide;
    orbitSlides.forEach(s => s.classList.remove('is-active'));
    slide.classList.add('is-active');

    const name   = slide.dataset.orbitName    || '—';
    const type   = slide.dataset.orbitType    || 'Planet';
    const period = parseFloat(slide.dataset.periodDays) || 365;
    const dist   = slide.dataset.distanceMillionKm || '—';
    const desc   = slide.dataset.description  || '';
    const years  = parseFloat(yearInput.value) || 1;

    const earthDays = years * 365.25;
    const revs      = (earthDays / period).toFixed(2);
    const ageDays   = earthDays.toFixed(0);

    if (get('name'))        get('name').textContent        = name;
    if (get('type'))        get('type').textContent        = type;
    if (get('revolutions')) get('revolutions').textContent = `${revs} orbits`;
    if (get('period'))      get('period').textContent      = `${period} Earth days`;
    if (get('distance'))    get('distance').textContent    = `${dist} million km`;
    if (get('age'))         get('age').textContent         = `${Number(ageDays).toLocaleString()} days`;
    if (get('description')) get('description').textContent = desc;
  }

  orbitSlides.forEach(slide => {
    slide.addEventListener('click', () => updateOrbitDetail(slide));
  });

  if (yearInput) {
    yearInput.addEventListener('input', () => updateOrbitDetail(activeSlide));
  }

  if (orbitSlides.length > 0) updateOrbitDetail(orbitSlides[0]);

})();