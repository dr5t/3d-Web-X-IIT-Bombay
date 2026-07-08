/* =============================================
   TECHFEST 2025 — IIT Bombay
   Main JavaScript — Three.js + GSAP
   ============================================= */

'use strict';

// ---- GSAP Plugin Registration ----
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// =============================================
// LOADER
// =============================================
const loaderEl = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');

const loadingMessages = [
  'INITIALIZING UNIVERSE...',
  'LOADING DIMENSIONS...',
  'CALIBRATING PHYSICS...',
  'RENDERING COSMOS...',
  'WELCOME TO TECHFEST 2025',
];

let progress = 0;
let msgIdx = 0;

const loaderInterval = setInterval(() => {
  progress += Math.random() * 18 + 4;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loaderInterval);
    loaderText.textContent = 'WELCOME TO TECHFEST 2025';
    setTimeout(() => {
      loaderEl.classList.add('hidden');
      document.body.style.overflow = 'auto';
      // Kick off hero entrance animations after loader hides
      playHeroEntrance();
    }, 600);
  } else {
    const mIdx = Math.floor((progress / 100) * loadingMessages.length);
    if (mIdx !== msgIdx && mIdx < loadingMessages.length) {
      msgIdx = mIdx;
      loaderText.textContent = loadingMessages[msgIdx];
    }
  }
  loaderBar.style.width = progress + '%';
}, 80);

// Prevent scroll during loading
document.body.style.overflow = 'hidden';

// =============================================
// CUSTOM CURSOR
// =============================================
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

// Smooth trail
function animateCursor() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top = trailY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// =============================================
// NAVIGATION
// =============================================
const nav = document.getElementById('main-nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);

  // Highlight active nav link
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.id;
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : 'auto';
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = 'auto';
  });
});

// =============================================
// THREE.JS UTILITIES
// =============================================
function createRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, alpha ? 0 : 1);
  return renderer;
}

function resizeRenderer(renderer, camera, canvas) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (renderer.domElement.width !== w || renderer.domElement.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

// =============================================
// SCENE 1: HERO — Particle Field + Floating Rings
// =============================================
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 60;
  const renderer = createRenderer(canvas);

  // Stars / Particle field
  const starGeo = new THREE.BufferGeometry();
  const starCount = 4000;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    sizes[i] = Math.random() * 2 + 0.5;

    // Cyan/Purple gradient across stars
    const t = Math.random();
    colors[i * 3] = 0 + t * 0.3;       // R
    colors[i * 3 + 1] = 0.8 - t * 0.5; // G
    colors[i * 3 + 2] = 1.0;            // B
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMat = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Floating wireframe torus rings
  const rings = [];
  const torusColors = [0x00d4ff, 0x7b2fff, 0xff2d78, 0x0066ff];

  for (let i = 0; i < 5; i++) {
    const geo = new THREE.TorusGeometry(8 + i * 5, 0.08, 8, 80);
    const mat = new THREE.MeshBasicMaterial({
      color: torusColors[i % torusColors.length],
      transparent: true,
      opacity: 0.3 - i * 0.04,
      wireframe: false,
    });
    const torus = new THREE.Mesh(geo, mat);
    torus.rotation.x = Math.random() * Math.PI;
    torus.rotation.y = Math.random() * Math.PI;
    torus.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    torus.userData.speed = (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
    torus.userData.axis = Math.random() > 0.5 ? 'x' : 'y';
    scene.add(torus);
    rings.push(torus);
  }

  // Central icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(6, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(20, 0, -10);
  scene.add(ico);

  // Mouse parallax
  let targetRotX = 0, targetRotY = 0;
  window.addEventListener('mousemove', (e) => {
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.3;
    targetRotX = (e.clientY / window.innerHeight - 0.5) * -0.2;
  }, { passive: true });

  let frameId;
  function animate(time) {
    frameId = requestAnimationFrame(animate);

    // Smooth mouse follow
    scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;
    scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;

    // Spin rings
    rings.forEach(ring => {
      if (ring.userData.axis === 'x') ring.rotation.x += ring.userData.speed;
      else ring.rotation.y += ring.userData.speed;
      ring.rotation.z += ring.userData.speed * 0.3;
    });

    // Rotate stars slowly
    stars.rotation.y += 0.0003;

    // Bounce ico
    ico.rotation.x += 0.003;
    ico.rotation.y += 0.005;
    ico.position.y = Math.sin(time * 0.001) * 3;

    resizeRenderer(renderer, camera, canvas);
    renderer.render(scene, camera);
  }
  animate(0);

  // Scroll-driven: fade out hero canvas
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      stars.material.opacity = 0.8 * (1 - p);
      camera.position.z = 60 + p * 30;
    }
  });

  return () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
}

// =============================================
// SCENE 2: ABOUT — Rotating DNA Helix
// =============================================
function initAboutScene() {
  const canvas = document.getElementById('about-cube-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 20);
  const renderer = createRenderer(canvas);

  const group = new THREE.Group();
  scene.add(group);

  // Build DNA double helix
  const helixPoints1 = [];
  const helixPoints2 = [];
  const numPoints = 80;
  const helixRadius = 4;
  const helixHeight = 16;

  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 4;
    const y = (i / numPoints) * helixHeight - helixHeight / 2;
    helixPoints1.push(new THREE.Vector3(Math.cos(t) * helixRadius, y, Math.sin(t) * helixRadius));
    helixPoints2.push(new THREE.Vector3(Math.cos(t + Math.PI) * helixRadius, y, Math.sin(t + Math.PI) * helixRadius));
  }

  const curve1 = new THREE.CatmullRomCurve3(helixPoints1);
  const curve2 = new THREE.CatmullRomCurve3(helixPoints2);

  const tubeGeo1 = new THREE.TubeGeometry(curve1, 200, 0.12, 8, false);
  const tubeGeo2 = new THREE.TubeGeometry(curve2, 200, 0.12, 8, false);

  const mat1 = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.8 });
  const mat2 = new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.8 });

  group.add(new THREE.Mesh(tubeGeo1, mat1));
  group.add(new THREE.Mesh(tubeGeo2, mat2));

  // Base pairs (rungs)
  for (let i = 0; i < numPoints; i += 4) {
    const p1 = helixPoints1[i];
    const p2 = helixPoints2[i];
    if (!p1 || !p2) continue;

    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const rungGeo = new THREE.CylinderGeometry(0.06, 0.06, len, 6);
    const rungMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
    const rung = new THREE.Mesh(rungGeo, rungMat);
    rung.position.copy(mid);
    rung.lookAt(p2);
    rung.rotateX(Math.PI / 2);
    group.add(rung);

    // Node spheres at helix points
    const sphereGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({ color: i % 8 === 0 ? 0xff2d78 : 0xffd700 });
    const s1 = new THREE.Mesh(sphereGeo, sphereMat);
    s1.position.copy(p1);
    group.add(s1);
  }

  // Mouse interaction for cube
  let isHovering = false;
  canvas.addEventListener('mouseenter', () => { isHovering = true; });
  canvas.addEventListener('mouseleave', () => { isHovering = false; });

  let frameId;
  let time = 0;
  function animate() {
    frameId = requestAnimationFrame(animate);
    time += 0.01;
    group.rotation.y += isHovering ? 0.025 : 0.008;
    group.position.y = Math.sin(time * 0.5) * 0.5;

    resizeRenderer(renderer, camera, canvas);
    renderer.render(scene, camera);
  }
  animate();

  return () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
}

// =============================================
// SCENE 3: EVENTS — Floating Particles
// =============================================
function initEventsScene() {
  const canvas = document.getElementById('events-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 50;
  const renderer = createRenderer(canvas);

  // Floating geometric shapes
  const shapes = [];
  const geometries = [
    new THREE.OctahedronGeometry(1.5, 0),
    new THREE.TetrahedronGeometry(1.5, 0),
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.BoxGeometry(2, 2, 2),
  ];

  for (let i = 0; i < 25; i++) {
    const geo = geometries[Math.floor(Math.random() * geometries.length)];
    const mat = new THREE.MeshBasicMaterial({
      color: [0x00d4ff, 0x7b2fff, 0xff2d78, 0x0066ff][Math.floor(Math.random() * 4)],
      wireframe: true,
      transparent: true,
      opacity: Math.random() * 0.3 + 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 60
    );
    mesh.userData.rotSpeed = {
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.015,
    };
    mesh.userData.floatSpeed = Math.random() * 0.5 + 0.5;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    scene.add(mesh);
    shapes.push(mesh);
  }

  let frameId;
  let time = 0;
  function animate() {
    frameId = requestAnimationFrame(animate);
    time += 0.005;
    shapes.forEach(s => {
      s.rotation.x += s.userData.rotSpeed.x;
      s.rotation.y += s.userData.rotSpeed.y;
      s.position.y += Math.sin(time * s.userData.floatSpeed + s.userData.floatOffset) * 0.02;
    });
    resizeRenderer(renderer, camera, canvas);
    renderer.render(scene, camera);
  }
  animate();

  ScrollTrigger.create({
    trigger: '#events',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      shapes.forEach((s, i) => {
        s.rotation.z = self.progress * Math.PI * (i % 2 === 0 ? 1 : -1) * 0.3;
      });
    }
  });

  return () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
}

// =============================================
// SCENE 4: GLOBE — Interactive 3D Earth
// =============================================
function initGlobeScene() {
  const canvas = document.getElementById('globe-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(30, 10, 30);
  camera.lookAt(0, 0, 0);
  const renderer = createRenderer(canvas);

  // Globe sphere
  const globeGeo = new THREE.SphereGeometry(14, 64, 64);

  // Create canvas texture for the globe
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 1024;
  texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');

  // Background
  ctx.fillStyle = '#020408';
  ctx.fillRect(0, 0, 1024, 512);

  // Draw grid lines (latitude/longitude)
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
  ctx.lineWidth = 1;

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = (lat + 90) / 180 * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Longitude lines
  for (let lon = 0; lon <= 360; lon += 20) {
    const x = lon / 360 * 1024;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Plot glowing dots at major tech hubs
  const techCities = [
    { name: 'Mumbai', lat: 18.96, lon: 72.82 },
    { name: 'New York', lat: 40.71, lon: -74.00 },
    { name: 'London', lat: 51.51, lon: -0.13 },
    { name: 'Tokyo', lat: 35.68, lon: 139.69 },
    { name: 'Berlin', lat: 52.52, lon: 13.41 },
    { name: 'Beijing', lat: 39.90, lon: 116.41 },
    { name: 'Sydney', lat: -33.87, lon: 151.21 },
    { name: 'Sao Paulo', lat: -23.55, lon: -46.63 },
    { name: 'Toronto', lat: 43.65, lon: -79.38 },
    { name: 'Dubai', lat: 25.20, lon: 55.27 },
    { name: 'Singapore', lat: 1.35, lon: 103.82 },
    { name: 'Seoul', lat: 37.57, lon: 126.98 },
    { name: 'Paris', lat: 48.85, lon: 2.35 },
    { name: 'Moscow', lat: 55.75, lon: 37.62 },
    { name: 'Cairo', lat: 30.04, lon: 31.24 },
    { name: 'Lagos', lat: 6.52, lon: 3.38 },
    { name: 'Mexico City', lat: 19.43, lon: -99.13 },
    { name: 'Jakarta', lat: -6.21, lon: 106.85 },
  ];

  techCities.forEach(city => {
    const x = (city.lon + 180) / 360 * 1024;
    const y = (90 - city.lat) / 180 * 512;

    // Glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 10);
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.9)');
    grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(texCanvas);

  const globeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.9,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Outer glow shell
  const glowGeo = new THREE.SphereGeometry(15, 64, 64);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.04,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(glowGeo, glowMat));

  // Atmosphere ring
  const atmGeo = new THREE.SphereGeometry(14.8, 64, 64);
  const atmMat = new THREE.MeshBasicMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  // Orbit rings around globe
  const orbitData = [
    { radius: 17, opacity: 0.2, rotX: 0.3, rotY: 0 },
    { radius: 19, opacity: 0.12, rotX: 1.2, rotY: 0.5 },
    { radius: 22, opacity: 0.08, rotX: 0.8, rotY: 1.0 },
  ];

  orbitData.forEach(od => {
    const og = new THREE.TorusGeometry(od.radius, 0.06, 8, 120);
    const om = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: od.opacity,
    });
    const o = new THREE.Mesh(og, om);
    o.rotation.x = od.rotX;
    o.rotation.y = od.rotY;
    scene.add(o);
  });

  // Stars background
  const bgStarGeo = new THREE.BufferGeometry();
  const bgStarCount = 2000;
  const bgPositions = new Float32Array(bgStarCount * 3);
  for (let i = 0; i < bgStarCount; i++) {
    bgPositions[i * 3] = (Math.random() - 0.5) * 800;
    bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 800;
    bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 400 - 100;
  }
  bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
  const bgStarMat = new THREE.PointsMaterial({ color: 0x888888, size: 0.6, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(bgStarGeo, bgStarMat));

  // Drag interaction
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let velocity = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
    velocity = { x: 0, y: 0 };
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    velocity.x = dx * 0.005;
    velocity.y = dy * 0.005;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  canvas.style.cursor = 'grab';

  let frameId;
  function animate() {
    frameId = requestAnimationFrame(animate);

    if (isDragging) {
      globe.rotation.y += velocity.x;
      globe.rotation.x += velocity.y;
    } else {
      globe.rotation.y += 0.003;
      velocity.x *= 0.95;
      velocity.y *= 0.95;
      globe.rotation.y += velocity.x;
      globe.rotation.x += velocity.y;
    }

    resizeRenderer(renderer, camera, canvas);
    renderer.render(scene, camera);
  }
  animate();

  // Scroll-driven tilt
  ScrollTrigger.create({
    trigger: '#globe-section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      camera.position.y = 10 + self.progress * 10;
      camera.lookAt(0, 0, 0);
    }
  });

  return () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
}

// =============================================
// SCENE 5: SPEAKERS — Abstract Wave
// =============================================
function initSpeakersScene() {
  const canvas = document.getElementById('speakers-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 20, 60);
  camera.lookAt(0, 0, 0);
  const renderer = createRenderer(canvas);

  // Grid plane with wave effect
  const gridSize = 40;
  const spacing = 3;
  const points = [];
  const gridGeo = new THREE.BufferGeometry();
  const posArray = new Float32Array(gridSize * gridSize * 3);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const idx = (i * gridSize + j) * 3;
      posArray[idx] = (i - gridSize / 2) * spacing;
      posArray[idx + 1] = 0;
      posArray[idx + 2] = (j - gridSize / 2) * spacing;
    }
  }

  gridGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const gridMat = new THREE.PointsMaterial({
    color: 0x00d4ff,
    size: 0.4,
    transparent: true,
    opacity: 0.5,
  });

  const gridPoints = new THREE.Points(gridGeo, gridMat);
  gridPoints.position.y = -10;
  scene.add(gridPoints);

  // Floating orbs
  const orbs = [];
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.SphereGeometry(1.5 + Math.random() * 2, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: [0x00d4ff, 0x7b2fff, 0xff2d78][Math.floor(Math.random() * 3)],
      transparent: true,
      opacity: 0.15 + Math.random() * 0.1,
      wireframe: Math.random() > 0.5,
    });
    const orb = new THREE.Mesh(geo, mat);
    orb.position.set(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 30 + 5,
      (Math.random() - 0.5) * 30
    );
    orb.userData.phase = Math.random() * Math.PI * 2;
    orb.userData.speed = Math.random() * 0.3 + 0.2;
    scene.add(orb);
    orbs.push(orb);
  }

  let frameId;
  let time = 0;
  const posAttr = gridGeo.attributes.position;

  function animate() {
    frameId = requestAnimationFrame(animate);
    time += 0.015;

    // Wave the grid
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j;
        const x = posAttr.getX(idx);
        const z = posAttr.getZ(idx);
        const wave = Math.sin(x * 0.15 + time) * Math.cos(z * 0.15 + time * 0.7) * 3;
        posAttr.setY(idx, wave);
      }
    }
    posAttr.needsUpdate = true;

    // Float orbs
    orbs.forEach(o => {
      o.position.y = Math.sin(time * o.userData.speed + o.userData.phase) * 8;
      o.rotation.y += 0.005;
    });

    resizeRenderer(renderer, camera, canvas);
    renderer.render(scene, camera);
  }
  animate();

  return () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
}

// =============================================
// SCENE 6: CONTACT — Neural Network
// =============================================
function initContactScene() {
  const canvas = document.getElementById('contact-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
  camera.position.z = 80;
  const renderer = createRenderer(canvas);

  const nodes = [];
  const nodeCount = 60;

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const geo = new THREE.SphereGeometry(0.5, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: [0x00d4ff, 0x7b2fff, 0xff2d78, 0x0066ff][Math.floor(Math.random() * 4)],
      transparent: true,
      opacity: Math.random() * 0.6 + 0.2,
    });
    const node = new THREE.Mesh(geo, mat);
    node.position.set(
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 40
    );
    node.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      0
    );
    scene.add(node);
    nodes.push(node);
  }

  // Lines connecting close nodes
  const linesMesh = [];

  function updateLines() {
    linesMesh.forEach(l => scene.remove(l));
    linesMesh.length = 0;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < 25) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone()
          ]);
          const mat = new THREE.LineBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: (1 - dist / 25) * 0.2,
          });
          const line = new THREE.Line(geo, mat);
          scene.add(line);
          linesMesh.push(line);
        }
      }
    }
  }

  let frameId;
  let frameCount = 0;

  function animate() {
    frameId = requestAnimationFrame(animate);
    frameCount++;

    nodes.forEach(node => {
      node.position.add(node.userData.velocity);

      // Bounce off boundaries
      if (Math.abs(node.position.x) > 60) node.userData.velocity.x *= -1;
      if (Math.abs(node.position.y) > 40) node.userData.velocity.y *= -1;
    });

    if (frameCount % 3 === 0) updateLines();

    resizeRenderer(renderer, camera, canvas);
    renderer.render(scene, camera);
  }
  updateLines();
  animate();

  return () => {
    cancelAnimationFrame(frameId);
    renderer.dispose();
  };
}

// =============================================
// GSAP SCROLL ANIMATIONS
// =============================================
function initScrollAnimations() {

  // Hero entrance animation (called after loader)
  window.playHeroEntrance = function() {
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-title', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
      .to('.hero-sub', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.5')
      .to('.hero-desc', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .to('.hero-btns', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3');

    // Counter animation
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      gsap.to({ val: 0 }, {
        val: target,
        duration: 2.5,
        delay: 1.5,
        ease: 'power2.out',
        onUpdate: function() {
          const v = Math.round(this.targets()[0].val);
          counter.textContent = v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v;
        }
      });
    });
  };

  // About section
  ScrollTrigger.create({
    trigger: '.about-container',
    start: 'top 80%',
    onEnter: () => {
      gsap.timeline()
        .from('.section-tag', { opacity: 0, y: 20, duration: 0.5 }, 0)
        .from('.about-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, 0.1)
        .from('.about-body', { opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power2.out' }, 0.3)
        .from('.pillar', { opacity: 0, x: -30, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, 0.5)
        .from('.about-3d-wrapper', { opacity: 0, scale: 0.8, duration: 1, ease: 'back.out(1.2)' }, 0.2);
    },
    once: true
  });

  // Timeline items
  ScrollTrigger.create({
    trigger: '.timeline',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.timeline-item', {
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.7,
        ease: 'power3.out'
      });
    },
    once: true
  });

  // Events
  ScrollTrigger.create({
    trigger: '.events-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.event-card', {
        opacity: 0,
        y: 50,
        scale: 0.95,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    },
    once: true
  });

  // Globe text
  ScrollTrigger.create({
    trigger: '.globe-overlay',
    start: 'top 80%',
    onEnter: () => {
      gsap.timeline()
        .from('.globe-text .section-tag', { opacity: 0, y: 20, duration: 0.5 })
        .from('.globe-text .section-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.2')
        .from('.globe-text p', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.country-badge', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.2');
    },
    once: true
  });

  // Speakers
  ScrollTrigger.create({
    trigger: '.speakers-container',
    start: 'top 80%',
    onEnter: () => {
      gsap.timeline()
        .from('.speakers-container .section-tag', { opacity: 0, y: 20, duration: 0.5 })
        .from('.speakers-container .section-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.2')
        .from('.speaker-card', { opacity: 0, x: 60, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, '-=0.4');
    },
    once: true
  });

  // Contact
  ScrollTrigger.create({
    trigger: '.contact-content',
    start: 'top 80%',
    onEnter: () => {
      gsap.timeline()
        .from('.contact-content .section-tag', { opacity: 0, y: 20, duration: 0.5 })
        .from('.contact-title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' }, '-=0.2')
        .from('.contact-sub', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
        .from('.form-group', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.3')
        .from('.info-card', { opacity: 0, x: 30, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, '-=0.5');
    },
    once: true
  });

  // Parallax on hero title
  gsap.to('.hero-title', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
    }
  });

  gsap.to('.hero-eyebrow, .hero-sub, .hero-desc', {
    yPercent: 20,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '60% top',
      scrub: 0.3,
    }
  });
}

// =============================================
// SPEAKERS CAROUSEL
// =============================================
function initSpeakersCarousel() {
  const track = document.getElementById('speakers-track');
  const prevBtn = document.getElementById('spk-prev');
  const nextBtn = document.getElementById('spk-next');
  const dotsContainer = document.getElementById('spk-dots');
  const cards = track.querySelectorAll('.speaker-card');
  let current = 0;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'spk-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Speaker ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('.spk-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, cards.length - 1));
    const card = cards[current];
    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft - 24,
      behavior: 'smooth'
    });
    updateDots();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto advance
  let autoPlay = setInterval(() => goTo((current + 1) % cards.length), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goTo((current + 1) % cards.length), 5000);
  });
}

// =============================================
// CONTACT FORM
// =============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate async
    setTimeout(() => {
      gsap.to(form, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => {
          form.style.display = 'none';
          success.classList.add('visible');
          gsap.from(success, { opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(1.5)' });
        }
      });
    }, 1200);
  });
}

// =============================================
// SMOOTH ANCHOR SCROLL
// =============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 70 },
          duration: 1,
          ease: 'power3.inOut',
        });
      }
    });
  });
}

// =============================================
// EVENT CARD HOVER — Magnetic effect
// =============================================
function initCardMagnetics() {
  document.querySelectorAll('.event-card, .speaker-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(card, {
        rotateX: -y * 0.02,
        rotateY: x * 0.02,
        transformPerspective: 1000,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  });
}

// =============================================
// SCROLL PROGRESS BAR
// =============================================
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, #00d4ff, #7b2fff);
    z-index: 10001; transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(0,212,255,0.6);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = scrolled + '%';
  }, { passive: true });
}

// =============================================
// INIT EVERYTHING
// =============================================
function init() {
  initScrollAnimations();
  initSpeakersCarousel();
  initContactForm();
  initSmoothScroll();
  initCardMagnetics();
  initScrollProgress();

  // Init Three.js scenes (order matters for performance)
  initHeroScene();
  initAboutScene();
  initEventsScene();
  initGlobeScene();
  initSpeakersScene();
  initContactScene();
}

// Start after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
