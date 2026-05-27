function initPlanets() {
  const planetVideos = {
    Mercury: 'Planet Renders/Mercury.mp4',
    Venus: 'Planet Renders/Venus.mp4',
    Earth: 'Planet Renders/Earth.mp4',
    Mars: 'Planet Renders/Mars.mp4',
    Jupiter: 'Planet Renders/Jupiter.mp4',
    Saturn: 'Planet Renders/Saturn.mp4',
    Uranus: 'Planet Renders/Uranus.mp4',
    Neptune: 'Planet Renders/Neptune.mp4',
  };

  const orbitRenders = document.querySelectorAll('.orbit-render[data-render]');

  orbitRenders.forEach((container) => {
    const planetName = container.getAttribute('data-render');
    const videoPath = planetVideos[planetName];

    if (!videoPath) return;

    // clear any existing children (canvas, placeholders)
    container.innerHTML = '';

    const video = document.createElement('video');
    video.src = videoPath;
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.controls = false;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';

    // disable Picture-in-Picture and related native UI, then insert
    try {
      video.disablePictureInPicture = true;
    } catch (e) {}
    try {
      video.webkitDisablePictureInPicture = true;
    } catch (e) {}
    if ('controlsList' in video) {
      try { video.controlsList = 'nodownload noremoteplayback'; } catch (e) {}
    }

    container.appendChild(video);

    // ensure autoplay on supported browsers and prevent native context menu
    video.addEventListener('canplay', () => {
      video.play().catch(() => {});
    }, { once: true });

    // defensive: try to prevent or immediately exit Picture-in-Picture if activated
    video.addEventListener('enterpictureinpicture', (e) => {
      try {
        if (document.exitPictureInPicture) document.exitPictureInPicture().catch(() => {});
      } catch (err) {}
      try { e.preventDefault && e.preventDefault(); } catch (err) {}
    });

    video.addEventListener('error', () => console.error('Video failed to load:', videoPath));
    video.addEventListener('contextmenu', (e) => e.preventDefault());
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPlanets();
    initYouTubeAutoplay();
  });
} else {
  initPlanets();
  initYouTubeAutoplay();
}

function initYouTubeAutoplay() {
  const iframes = Array.from(document.querySelectorAll('iframe'))
    .filter(f => f.src && (f.src.indexOf('youtube.com/embed') !== -1 || f.src.indexOf('youtube-nocookie.com/embed') !== -1));

  if (!iframes.length) return;

  iframes.forEach((iframe) => {
    // store original src
    if (!iframe.dataset.origSrc) iframe.dataset.origSrc = iframe.src;
    // ensure iframe allows autoplay and related features
    try {
      const allow = (iframe.getAttribute('allow') || '').trim();
      const needed = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      if (!allow || !allow.includes('autoplay')) {
        iframe.setAttribute('allow', (allow ? allow + '; ' : '') + needed);
      }
    } catch (e) {}
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const f = entry.target;
      const orig = f.dataset.origSrc || f.src;
      try {
        const url = new URL(orig, window.location.href);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          url.searchParams.set('autoplay', '1');
          url.searchParams.set('mute', '1');
          f.src = url.toString();
        } else {
          url.searchParams.delete('autoplay');
          url.searchParams.delete('mute');
          f.src = url.toString();
        }
      } catch (err) {
        // fallback: append query string
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (orig.indexOf('?') === -1) f.src = orig + '?autoplay=1&mute=1';
          else f.src = orig + '&autoplay=1&mute=1';
        } else {
          f.src = orig;
        }
      }
    });
  }, { threshold: [0.5] });

  iframes.forEach((f) => observer.observe(f));
}
