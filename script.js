const header = document.querySelector('.site-header');
const nav = document.querySelector('.main-nav');
const navToggle = document.querySelector('.nav-toggle');

if (header) {
  const updateHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

if (nav && navToggle) {
  const setMenuState = (isOpen) => {
    nav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
    setMenuState(isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
  });
}

const revealTargets = document.querySelectorAll(
  '.panel, .feature-card, .timeline-item, .video-card, .video-frame, .hero-dream, .hero-orbit'
);

if (revealTargets.length) {
  revealTargets.forEach((element) => {
    element.classList.remove('reveal', 'is-visible');
    element.style.transitionDelay = '';
  });
}

const hashLinks = document.querySelectorAll('a[href^="#"]');

hashLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.body.classList.add('is-entering');

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.remove('is-entering');
    });
  });

  const pageLinks = document.querySelectorAll('a[href]');

  pageLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || link.hasAttribute('download') || link.target === '_blank') {
        return;
      }

      const destination = new URL(link.href, window.location.href);

      if (destination.origin !== window.location.origin) {
        return;
      }

      if (destination.pathname === window.location.pathname && destination.search === window.location.search) {
        return;
      }

      event.preventDefault();
      document.body.classList.add('is-leaving');

      window.setTimeout(() => {
        window.location.href = destination.href;
      }, 180);
    });
  });
}

const orbitCalculator = document.getElementById('orbit-calculator');

if (orbitCalculator) {
  const EARTH_DAYS_PER_YEAR = 365.25;
  const earthYearsInput = orbitCalculator.querySelector('#earth-years');
  const orbitCarousel = orbitCalculator.querySelector('#orbit-carousel');
  const orbitSlides = orbitCalculator.querySelectorAll('.orbit-slide[data-orbit-name]');

  const detailType = orbitCalculator.querySelector('[data-orbit-detail="type"]');
  const detailName = orbitCalculator.querySelector('[data-orbit-detail="name"]');
  const detailAge = orbitCalculator.querySelector('[data-orbit-detail="age"]');
  const detailRevolutions = orbitCalculator.querySelector('[data-orbit-detail="revolutions"]');
  const detailPeriod = orbitCalculator.querySelector('[data-orbit-detail="period"]');
  const detailDistance = orbitCalculator.querySelector('[data-orbit-detail="distance"]');
  const detailDescription = orbitCalculator.querySelector('[data-orbit-detail="description"]');

  const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  const integerFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

  const clampFiniteNumber = (value, fallback) => (Number.isFinite(value) ? value : fallback);
  const getEarthYears = () => clampFiniteNumber(parseFloat(earthYearsInput?.value ?? ''), 0);

  const formatPlanetYears = (value) => `${numberFormatter.format(value)} years`;
  const formatRevolutions = (value) => numberFormatter.format(value);
  const formatEarthDays = (value) => `${integerFormatter.format(value)} Earth days`;
  const formatDistance = (value) => `${numberFormatter.format(value)} million km`;

  let activeSlide = orbitSlides[0] ?? null;

  const updateDetailsFromSlide = (slide) => {
    if (!slide) {
      return;
    }

    const earthYears = getEarthYears();
    const earthDays = earthYears * EARTH_DAYS_PER_YEAR;
    const bodyName = slide.getAttribute('data-orbit-name') ?? '';
    const bodyType = slide.getAttribute('data-orbit-type') ?? '';
    const periodDays = clampFiniteNumber(parseFloat(slide.getAttribute('data-period-days') ?? ''), 0);
    const distance = clampFiniteNumber(parseFloat(slide.getAttribute('data-distance-million-km') ?? ''), 0);
    const description = slide.getAttribute('data-description') ?? '';

    const revolutions = periodDays > 0 ? earthDays / periodDays : 0;

    if (detailType) {
      detailType.textContent = bodyType || 'Planet';
    }
    if (detailName) {
      detailName.textContent = bodyName;
    }
    if (detailAge) {
      detailAge.textContent = formatPlanetYears(revolutions);
    }
    if (detailRevolutions) {
      detailRevolutions.textContent = formatRevolutions(revolutions);
    }
    if (detailPeriod) {
      detailPeriod.textContent = periodDays > 0 ? formatEarthDays(periodDays) : '—';
    }
    if (detailDistance) {
      detailDistance.textContent = distance > 0 ? formatDistance(distance) : '—';
    }
    if (detailDescription) {
      detailDescription.textContent = description || '—';
    }
  };

  const setActiveSlide = (slide) => {
    activeSlide = slide;
    orbitSlides.forEach((candidate) => candidate.classList.toggle('is-active', candidate === slide));
    updateDetailsFromSlide(slide);
  };

  if (orbitSlides.length) {
    setActiveSlide(activeSlide);
  }

  if (earthYearsInput) {
    earthYearsInput.addEventListener('input', () => updateDetailsFromSlide(activeSlide));
    earthYearsInput.addEventListener('change', () => updateDetailsFromSlide(activeSlide));
  }

  if (orbitCarousel && orbitSlides.length) {
    const centerSlide = (slide, behavior = 'smooth') => {
      const carouselRect = orbitCarousel.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();

      const currentLeft = orbitCarousel.scrollLeft;
      const slideOffsetLeft = slideRect.left - carouselRect.left;
      const target =
        currentLeft +
        slideOffsetLeft -
        (carouselRect.width / 2 - slideRect.width / 2);

      const maxScrollLeft = Math.max(0, orbitCarousel.scrollWidth - orbitCarousel.clientWidth);
      const clamped = Math.max(0, Math.min(target, maxScrollLeft));

      orbitCarousel.scrollTo({ left: clamped, behavior });
    };

    orbitSlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        setActiveSlide(slide);
        centerSlide(slide, 'smooth');
      });
    });

    // Start at the beginning of the carousel (Mercury is first).
    orbitCarousel.scrollLeft = 0;
  }
}

const scriptCard = document.getElementById('script-card');

if (scriptCard) {
  const textarea = scriptCard.querySelector('#script-snippet');
  const copyButton = scriptCard.querySelector('#copy-script');
  const downloadButton = scriptCard.querySelector('#download-script');
  let copyStatusTimeout = null;
  const originalCopyLabel = copyButton?.textContent ?? 'Copy';

  const getText = () => (textarea && 'value' in textarea ? String(textarea.value ?? '') : '');

  const copyToClipboard = async (text) => {
    if (!text) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // no-op
      }
    }
  };

  const downloadTextFile = (filename, text) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const setCopyButtonLabel = (message) => {
    if (!copyButton) {
      return;
    }

    copyButton.textContent = message;
    copyButton.classList.add('is-copied');

    if (copyStatusTimeout) {
      window.clearTimeout(copyStatusTimeout);
    }

    copyStatusTimeout = window.setTimeout(() => {
      copyButton.textContent = originalCopyLabel;
      copyButton.classList.remove('is-copied');
    }, 1600);
  };

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      setCopyButtonLabel('Copied!');
      copyToClipboard(getText()).catch(() => {
        setCopyButtonLabel('Copy failed');
      });
    });
  }

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      downloadTextFile('project-script.txt', getText());
    });
  }
}

const weeklyCarousel = document.getElementById('weekly-carousel');

if (weeklyCarousel) {
  const track = weeklyCarousel.querySelector('.weekly-track');
  const cards = weeklyCarousel.querySelectorAll('.weekly-card');
  const prevButton = document.querySelector('[data-weekly-nav="prev"]');
  const nextButton = document.querySelector('[data-weekly-nav="next"]');

  let activeIndex = 0;

  const clampIndex = (value) => Math.max(0, Math.min(value, cards.length - 1));

  const updateButtons = () => {
    if (prevButton) {
      prevButton.disabled = activeIndex <= 0;
      prevButton.setAttribute('aria-disabled', String(activeIndex <= 0));
    }
    if (nextButton) {
      nextButton.disabled = activeIndex >= cards.length - 1;
      nextButton.setAttribute('aria-disabled', String(activeIndex >= cards.length - 1));
    }
  };

  const scrollToIndex = (index) => {
    activeIndex = clampIndex(index);
    const card = cards[activeIndex];
    if (!card) {
      return;
    }

    if (track) {
      track.style.transform = `translateX(-${card.offsetLeft}px)`;
    }
    updateButtons();
  };

  if (prevButton) {
    prevButton.addEventListener('click', () => scrollToIndex(activeIndex - 1));
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => scrollToIndex(activeIndex + 1));
  }

  if (track && cards.length) {
    scrollToIndex(0);
    window.addEventListener('resize', () => scrollToIndex(activeIndex), { passive: true });
  }
}
