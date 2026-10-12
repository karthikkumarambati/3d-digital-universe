import * as THREE from 'three';

const canvas = document.querySelector('#universeCanvas');
const bootScreen = document.querySelector('#bootScreen');
const bootProgress = document.querySelector('#bootProgress');
const bootPercent = document.querySelector('#bootPercent');
const motionButton = document.querySelector('#motionToggle');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scene, camera, renderer, core, coreGlow, starField, grid, ringGroup;
let animationEnabled = !prefersReducedMotion;
let targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
let scrollProgress = 0;
let activeWorld = 0;
const clock = new THREE.Clock();
const worldColors = [0x4dfcff, 0xa66bff, 0xff4fd8];
const worldMessages = [
  'Neon Genesis online. The core is stable. Begin your exploration.',
  'Void Bloom detected. Signal strength is fluctuating beyond known space.',
  'Chrome Dusk reached. Gravity is low. New pathways have appeared.'
];

function initThree() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070711, 0.018);
  camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 150);
  camera.position.set(0, 0.2, 10);

  renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: innerWidth > 700, powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.35 : 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const ambient = new THREE.AmbientLight(0x8790ff, 1.1);
  scene.add(ambient);
  const keyLight = new THREE.PointLight(0x4dfcff, 30, 35);
  keyLight.position.set(4, 2, 6);
  scene.add(keyLight);
  const purpleLight = new THREE.PointLight(0x7b3cff, 38, 28);
  purpleLight.position.set(-5, -2, -3);
  scene.add(purpleLight);

  createStars();
  createCore();
  createGrid();
  createDistantObjects();
  animate();
}

function createStars() {
  const count = innerWidth < 650 ? 850 : 1700;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color(0x4dfcff), new THREE.Color(0xb19aff), new THREE.Color(0xffffff)];
  for (let i = 0; i < count; i++) {
    const radius = 12 + Math.random() * 65;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) - 15;
    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: innerWidth < 650 ? 0.065 : 0.075, vertexColors: true,
    transparent: true, opacity: 0.85, sizeAttenuation: true, depthWrite: false
  });
  starField = new THREE.Points(geometry, material);
  scene.add(starField);
}

function createCore() {
  ringGroup = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1.65, 5);
  const material = new THREE.MeshStandardMaterial({
    color: 0x101d43, metalness: 0.75, roughness: 0.28,
    emissive: 0x062b43, emissiveIntensity: 0.8, flatShading: false
  });
  core = new THREE.Mesh(geometry, material);
  ringGroup.add(core);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.69, 2),
    new THREE.MeshBasicMaterial({ color: 0x4dfcff, wireframe: true, transparent: true, opacity: 0.22 })
  );
  ringGroup.add(wire);

  const glowMaterial = new THREE.SpriteMaterial({
    map: makeGlowTexture(), color: 0x4dfcff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.45
  });
  coreGlow = new THREE.Sprite(glowMaterial);
  coreGlow.scale.set(6.8, 6.8, 1);
  ringGroup.add(coreGlow);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x4dfcff, transparent: true, opacity: 0.48, side: THREE.DoubleSide });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.009, 8, 180), ringMaterial);
  ring1.rotation.x = 1.08;
  ringGroup.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.006, 8, 180), new THREE.MeshBasicMaterial({ color: 0xa66bff, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
  ring2.rotation.set(0.3, 0.7, 0.5);
  ringGroup.add(ring2);

  const orbitGeometry = new THREE.BufferGeometry();
  const orbitPoints = [];
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    orbitPoints.push(Math.cos(a) * 3.2, Math.sin(a) * 0.85, Math.sin(a) * 1.5);
  }
  orbitGeometry.setFromPoints(orbitPoints.map(p => new THREE.Vector3(...p)));
  const orbit = new THREE.LineLoop(orbitGeometry, new THREE.LineBasicMaterial({ color: 0x4dfcff, transparent: true, opacity: 0.22 }));
  orbit.rotation.y = -0.4;
  ringGroup.add(orbit);
  ringGroup.position.set(2.5, 0.05, -1.7);
  scene.add(ringGroup);
}

function makeGlowTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - size / 2) / (size / 2);
      const dy = (y - size / 2) / (size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const alpha = Math.max(0, Math.pow(1 - distance, 3)) * 255;
      const i = (y * size + x) * 4;
      data[i] = 80; data[i + 1] = 220; data[i + 2] = 255; data[i + 3] = alpha;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

function createGrid() {
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0x4dfcff, transparent: true, opacity: 0.12 });
  const points = [];
  const width = 45, divisions = 40, step = width / divisions;
  for (let i = 0; i <= divisions; i++) {
    const p = -width / 2 + i * step;
    points.push(new THREE.Vector3(p, -7, -12), new THREE.Vector3(p, -7, -52));
    points.push(new THREE.Vector3(-width / 2, -7, -12 + i * step), new THREE.Vector3(width / 2, -7, -12 + i * step));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  grid = new THREE.LineSegments(geo, gridMaterial);
  scene.add(grid);
}

function createDistantObjects() {
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(0.6, 1);
  for (let i = 0; i < 11; i++) {
    const material = new THREE.MeshStandardMaterial({
      color: i % 2 ? 0x24174b : 0x10354b, metalness: 0.6, roughness: 0.48,
      emissive: i % 2 ? 0x30115a : 0x06344a, emissiveIntensity: 0.7, wireframe: i % 3 === 0
    });
    const mesh = new THREE.Mesh(geometry, material);
    const angle = (i / 11) * Math.PI * 2;
    const radius = 6 + Math.random() * 5;
    mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 8, -5 - Math.random() * 17);
    const scale = 0.35 + Math.random() * 1.5;
    mesh.scale.setScalar(scale);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    mesh.userData.spin = (Math.random() - 0.5) * 0.004;
    group.add(mesh);
  }
  scene.add(group);
  scene.userData.distantGroup = group;
}

function updateWorld(index) {
  activeWorld = index;
  const color = new THREE.Color(worldColors[index]);
  if (core?.material) {
    core.material.emissive.set(color);
    core.material.color.copy(color).multiplyScalar(0.25);
  }
  if (coreGlow) coreGlow.material.color.copy(color);
  if (ringGroup) {
    ringGroup.children.forEach(child => {
      if (child.material?.color && child !== core) {
        // Preserve the purple secondary ring while shifting the primary world accents.
        if (child.material.color.getHex() !== 0xa66bff) child.material.color.copy(color);
      }
    });
  }
  document.querySelectorAll('.world-card').forEach((card, i) => {
    card.classList.toggle('active', i === index);
    card.setAttribute('aria-pressed', String(i === index));
  });
  document.querySelector('#signalText').textContent = worldMessages[index];
  if (window.gsap && ringGroup) {
    gsap.to(ringGroup.rotation, { y: ringGroup.rotation.y + Math.PI * 0.5, duration: 1.1, ease: 'power2.inOut' });
    gsap.fromTo(core.scale, { x: 0.92, y: 0.92, z: 0.92 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  }
}

function animate() {
  if (!renderer) return;
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  if (animationEnabled) {
    pointerX += (targetX - pointerX) * 0.025;
    pointerY += (targetY - pointerY) * 0.025;
    if (ringGroup) {
      ringGroup.rotation.y += 0.0018;
      ringGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.08 + pointerY * 0.12;
      ringGroup.position.y = Math.sin(elapsed * 0.5) * 0.13 + scrollProgress * 0.3;
      ringGroup.position.x = 2.5 - pointerX * 0.45;
      core.rotation.y += 0.0015;
      core.rotation.x += 0.0007;
      coreGlow.material.opacity = 0.34 + Math.sin(elapsed * 1.5) * 0.08;
    }
    if (starField) starField.rotation.y = elapsed * 0.003;
    if (grid) grid.position.z = (elapsed * 0.5) % 1;
    const distant = scene.userData.distantGroup;
    if (distant) distant.children.forEach(mesh => { mesh.rotation.y += mesh.userData.spin; mesh.rotation.x += mesh.userData.spin * 0.4; });
    camera.position.x += ((pointerX * 0.45) - camera.position.x) * 0.018;
    camera.position.y += ((-pointerY * 0.25 + scrollProgress * 0.6) - camera.position.y) * 0.018;
    camera.position.z += ((10 - scrollProgress * 1.2) - camera.position.z) * 0.02;
    camera.lookAt(0, 0, -2);
  }
  renderer.render(scene, camera);
}

function resize() {
  if (!camera || !renderer) return;
  camera.aspect = innerWidth / innerHeight;
  camera.fov = innerWidth < 650 ? 62 : 55;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.8));
  renderer.setSize(innerWidth, innerHeight);
}

function initInteractions() {
  window.addEventListener('pointermove', event => {
    targetX = (event.clientX / innerWidth) * 2 - 1;
    targetY = (event.clientY / innerHeight) * 2 - 1;
    const coords = document.querySelector('#cursorCoordinates');
    coords.textContent = `X ${String(Math.round(event.clientX)).padStart(3, '0')} / Y ${String(Math.round(event.clientY)).padStart(3, '0')}`;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollProgress = Math.min(1, window.scrollY / maxScroll);
    updateActiveNav();
  }, { passive: true });
  window.addEventListener('resize', resize);
  document.querySelectorAll('.world-card').forEach(card => {
    card.addEventListener('click', () => updateWorld(Number(card.dataset.world)));
  });
  document.querySelector('#focusPlanet').addEventListener('click', () => {
    document.querySelector('#experience').scrollIntoView({ behavior: animationEnabled ? 'smooth' : 'auto' });
    if (window.gsap && animationEnabled) gsap.to(camera.position, { z: 7, duration: 1.2, yoyo: true, repeat: 1, ease: 'power2.inOut' });
  });
  const toggle = document.querySelector('#menuToggle');
  const nav = document.querySelector('#mainNav');
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  motionButton.addEventListener('click', () => {
    animationEnabled = !animationEnabled;
    document.body.classList.toggle('reduce-motion', !animationEnabled);
    motionButton.classList.toggle('is-off', !animationEnabled);
    motionButton.querySelector('b').textContent = animationEnabled ? 'MOTION ON' : 'MOTION OFF';
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
}

function updateActiveNav() {
  const sections = [...document.querySelectorAll('main section[id]')];
  let current = 'home';
  for (const section of sections) {
    if (section.getBoundingClientRect().top < innerHeight * 0.42) current = section.id;
  }
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}

function initGsap() {
  if (!window.gsap || prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-copy > *', { opacity: 0, y: 22, duration: 0.8, stagger: 0.11, ease: 'power3.out', delay: 0.1 });
  gsap.from('.hero-orbit-label', { opacity: 0, x: 20, duration: 1, delay: 0.7 });
  gsap.utils.toArray('.feature-card, .world-card, .signal-panel, .about-copy, .about-visual').forEach((el, index) => {
    gsap.from(el, {
      opacity: 0, y: 28, duration: 0.75, delay: (index % 3) * 0.05, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  gsap.to('.hero-grid', { opacity: 0.25, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

function boot() {
  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(100, progress + 8 + Math.random() * 16);
    bootProgress.style.width = `${progress}%`;
    bootPercent.textContent = String(Math.round(progress)).padStart(2, '0');
    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        bootScreen.classList.add('is-hidden');
        document.body.classList.remove('loading');
      }, 250);
    }
  }, 65);
}

document.body.classList.add('loading');
try {
  initThree();
  initInteractions();
  initGsap();
  boot();
} catch (error) {
  console.error('Digital Universe initialization failed:', error);
  bootScreen.classList.add('is-hidden');
  document.body.classList.remove('loading');
}
