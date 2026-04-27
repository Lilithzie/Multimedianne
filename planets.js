function initPlanets() {
  if (typeof THREE === 'undefined') {
    requestAnimationFrame(initPlanets);
    return;
  }

  const planetTextures = {
    Mercury: 'Planet Textures/2k_mercury.jpg',
    Venus: 'Planet Textures/2k_venus_surface.jpg',
    Earth: 'Planet Textures/2k_earth_daymap.jpg',
    Mars: 'Planet Textures/2k_mars.jpg',
    Jupiter: 'Planet Textures/2k_jupiter.jpg',
    Saturn: 'Planet Textures/2k_saturn.jpg',
    Uranus: 'Planet Textures/2k_uranus.jpg',
    Neptune: 'Planet Textures/2k_neptune.jpg',
  };

  const textureLoader = new THREE.TextureLoader();
  const planetStates = {};

  const orbitRenders = document.querySelectorAll('.orbit-render[data-render]');

  orbitRenders.forEach((container) => {
    const planetName = container.getAttribute('data-render');
    const canvas = container.querySelector('canvas');

    if (!canvas) return;

    const width = container.offsetWidth || 220;
    const height = container.offsetHeight || 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 1.5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const geometry = new THREE.SphereGeometry(1, 128, 128);
    let sphere = null;
    let animationId = null;

    const texturePath = planetTextures[planetName];
    textureLoader.load(
      texturePath,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        const material = new THREE.MeshPhongMaterial({
          map: texture,
          shininess: 5,
        });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (sphere) {
            sphere.rotation.y += 0.005;
          }
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error('Failed to load texture:', texturePath, error);
      }
    );

    planetStates[planetName] = {
      scene,
      camera,
      renderer,
      canvas,
      animationId,
      sphere,
    };
  });

  const handleResize = () => {
    orbitRenders.forEach((container) => {
      const planetName = container.getAttribute('data-render');
      const state = planetStates[planetName];

      if (!state) return;

      const width = container.offsetWidth || 220;
      const height = container.offsetHeight || 220;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      state.canvas.width = width * dpr;
      state.canvas.height = height * dpr;
      state.canvas.style.width = width + 'px';
      state.canvas.style.height = height + 'px';

      state.renderer.setPixelRatio(dpr);
      state.renderer.setSize(width, height, false);

      state.camera.aspect = width / height;
      state.camera.updateProjectionMatrix();
    });
  };

  window.addEventListener('resize', handleResize);

  window.addEventListener('beforeunload', () => {
    Object.values(planetStates).forEach((state) => {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
      state.renderer.dispose();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlanets);
} else {
  initPlanets();
}
