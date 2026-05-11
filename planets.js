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

  const planetModels = {
    Mercury: 'Planet Models/Mercury.glb',
    Venus: 'Planet Models/Venus.glb',
    Earth: 'Planet Models/Earth.glb',
    Mars: 'Planet Models/Mars.glb',
    Jupiter: 'Planet Models/Jupiter.glb',
    Saturn: 'Planet Models/Saturn.glb',
    Uranus: 'Planet Models/Uranus.glb',
    Neptune: 'Planet Models/Neptune.glb',
  };

  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = typeof THREE.GLTFLoader !== 'undefined' ? new THREE.GLTFLoader() : null;
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
    renderer.outputEncoding = THREE.sRGBEncoding;

    const lightPreset = planetName === 'Saturn'
      ? { ambient: 0.35, hemi: 0.22, directional: 0.5 }
      : { ambient: 0.55, hemi: 0.35, directional: 0.65 };

    const ambientLight = new THREE.AmbientLight(0xffffff, lightPreset.ambient);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf3f7ff, 0x101826, lightPreset.hemi);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xf7fbff, lightPreset.directional);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const geometry = new THREE.SphereGeometry(1, 128, 128);
    let sphere = null;
    let model = null;
    let animationId = null;

    const modelPath = planetModels[planetName];
    const texturePath = planetTextures[planetName];

    const startAnimation = () => {
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        if (model) {
          model.rotation.y += 0.0045;
        }
        if (sphere) {
          sphere.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
      };
      animate();
    };

    const loadTextureSphere = () => {
      if (!texturePath) {
        return;
      }

      textureLoader.load(
        texturePath,
        (texture) => {
          texture.encoding = THREE.sRGBEncoding;
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.95,
            metalness: 0,
          });
          sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);
          startAnimation();
        },
        undefined,
        (error) => {
          console.error('Failed to load texture:', texturePath, error);
        }
      );
    };

    if (modelPath && gltfLoader) {
      gltfLoader.load(
        encodeURI(modelPath),
        (gltf) => {
          model = gltf.scene;

          const bounds = new THREE.Box3().setFromObject(model);
          const size = bounds.getSize(new THREE.Vector3());
          const maxAxis = Math.max(size.x, size.y, size.z) || 1;
          const scale = 1 / maxAxis;
          model.scale.setScalar(scale);

          bounds.setFromObject(model);
          const center = bounds.getCenter(new THREE.Vector3());
          model.position.sub(center);

          scene.add(model);
          startAnimation();
        },
        undefined,
        (error) => {
          console.error('Failed to load model:', modelPath, error);
          loadTextureSphere();
        }
      );
    } else {
      loadTextureSphere();
    }

    planetStates[planetName] = {
      scene,
      camera,
      renderer,
      canvas,
      animationId,
      sphere,
      model,
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
