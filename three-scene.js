/**
 * three-scene.js
 * Legal Clinic — Cinematic 3D Background
 * Three.js r128 (local) | GSAP 3 + ScrollTrigger (local)
 */
document.addEventListener('DOMContentLoaded', function () {

  'use strict';

  /* ─── Guard ─────────────────────────────────────────────── */
  if (typeof THREE === 'undefined') {
    console.warn('[three-scene] THREE not loaded');
    return;
  }

  /* ─── GSAP globals ──────────────────────────────────────── */
  const _gsap = window.gsap;
  const _ST   = window.ScrollTrigger;
  if (_gsap && _ST) _gsap.registerPlugin(_ST);

  /* ═══════════════════════════════════════════════════════════
     1. CONSTANTS
  ═══════════════════════════════════════════════════════════ */
  const N         = 2400;
  const LERP_SLOW = 0.022;
  const LERP_MID  = 0.048;
  const LERP_FAST = 0.09;

  const COL = {
    goldDark   : 0xd4af37,    /* bright gold — glows on dark bg */
    goldLight  : 0x2C1C06,    /* very dark amber — sharp contrast on warm white */
    bgDark     : 0x04040a,
    bgLight    : 0xF2EFE9,
    planeDark  : 0x0d0d1a,
    planeLight : 0xC8BFA8,    /* warm taupe — visible on light bg */
    accentLight: 0x1A2A4A,   /* deep navy — used for wireframe in light mode */
  };

  /* Detect initial theme */
  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
  function getGold() { return isDarkTheme() ? COL.goldDark : COL.goldLight; }
  function getBg()   { return isDarkTheme() ? COL.bgDark   : COL.bgLight; }

  /* ═══════════════════════════════════════════════════════════
     2. RENDERER + SCENE + CAMERA
  ═══════════════════════════════════════════════════════════ */
  const canvas = document.getElementById('three-canvas');
  if (!canvas) { console.warn('[three-scene] #three-canvas not found'); return; }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha    : false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding     = THREE.sRGBEncoding;  /* r128 API */
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(getBg());

  /* Theme-aware opacity/emissive targets */
  var TARGET_PARTICLE_OPACITY   = isDarkTheme() ? 0.82 : 0.92;
  var TARGET_EMISSIVE_INTENSITY = isDarkTheme() ? 0.65 : 0.02;
  var TARGET_SPHERE_OPACITY     = isDarkTheme() ? 0.22 : 0.50;

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  /* ═══════════════════════════════════════════════════════════
     3. LIGHTING
  ═══════════════════════════════════════════════════════════ */
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  const blueFill = new THREE.DirectionalLight(0x2244bb, 0.55);
  blueFill.position.set(-4, 2, 3);
  scene.add(blueFill);

  const goldRim = new THREE.DirectionalLight(COL.gold, 0.50);
  goldRim.position.set(4, -1, -2);
  scene.add(goldRim);

  const topKey = new THREE.DirectionalLight(0xffffff, 0.55);
  topKey.position.set(0, 8, 5);
  scene.add(topKey);

  /* ═══════════════════════════════════════════════════════════
     4. GLASS SPHERE  (Hero)
  ═══════════════════════════════════════════════════════════ */
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  /* Glass sphere — r128 compatible */
  const glassMat = new THREE.MeshPhysicalMaterial({
    color       : new THREE.Color(getGold()),
    metalness   : 0.0,
    roughness   : 0.05,
    transparent : true,
    opacity     : TARGET_SPHERE_OPACITY,
    side        : THREE.DoubleSide,
    reflectivity: 1.0,
  });
  const glassSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 64, 64),
    glassMat
  );
  sphereGroup.add(glassSphere);

  const innerCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    new THREE.MeshBasicMaterial({
      color      : new THREE.Color(getGold()),
      transparent: true,
      opacity    : isDarkTheme() ? 0.20 : 0.55,
    })
  );
  sphereGroup.add(innerCore);
  var innerCoreMat = innerCore.material;

  /* ═══════════════════════════════════════════════════════════
     5. GEODESIC WIREFRAME  (Mission)
  ═══════════════════════════════════════════════════════════ */
  const wireframeMat = new THREE.MeshStandardMaterial({
    color            : new THREE.Color(isDarkTheme() ? getGold() : COL.accentLight),
    wireframe        : true,
    emissive         : new THREE.Color(isDarkTheme() ? getGold() : COL.accentLight),
    emissiveIntensity: isDarkTheme() ? 0.06 : 0.01,
    transparent      : true,
    opacity          : 0.0,
  });
  const wireframeMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.15, 3),
    wireframeMat
  );
  scene.add(wireframeMesh);

  /* ═══════════════════════════════════════════════════════════
     6. FLUID PLANE  (Pricing / CTA)
  ═══════════════════════════════════════════════════════════ */
  const planeGeo = new THREE.PlaneGeometry(22, 7, 80, 24);
  planeGeo.rotateX(-Math.PI / 2);
  const planeBasePos = Float32Array.from(planeGeo.attributes.position.array);

  const planeMat = new THREE.MeshStandardMaterial({
    color      : new THREE.Color(isDarkTheme() ? COL.planeDark : COL.planeLight),
    metalness  : 0.88,
    roughness  : 0.12,
    transparent: true,
    opacity    : 0.0,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  planeMesh.position.y = -3.5;
  scene.add(planeMesh);

  /* ═══════════════════════════════════════════════════════════
     7. PARTICLE INSTANCEDMESH
  ═══════════════════════════════════════════════════════════ */
  const particleMat = new THREE.MeshStandardMaterial({
    color            : new THREE.Color(getGold()),
    emissive         : new THREE.Color(getGold()),
    emissiveIntensity: TARGET_EMISSIVE_INTENSITY,
    roughness        : 0.2,
    metalness        : 0.9,
    transparent      : true,
    opacity          : 0.0,
  });
  const particleMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.016, 5, 5),
    particleMat,
    N
  );
  particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(particleMesh);

  /* Init all matrices to identity */
  {
    const ma = particleMesh.instanceMatrix.array;
    for (let i = 0; i < N; i++) {
      const b = i * 16;
      ma[b]=1; ma[b+1]=0; ma[b+2]=0;  ma[b+3]=0;
      ma[b+4]=0; ma[b+5]=1; ma[b+6]=0; ma[b+7]=0;
      ma[b+8]=0; ma[b+9]=0; ma[b+10]=1;ma[b+11]=0;
      ma[b+12]=0;ma[b+13]=0;ma[b+14]=0;ma[b+15]=1;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     8. PARTICLE CLOUDS
  ═══════════════════════════════════════════════════════════ */
  const currentPos = new Float32Array(N * 3);
  const targetPos  = new Float32Array(N * 3);
  let   lerpSpeed  = LERP_SLOW;

  function rndInSphere(r) {
    const u = Math.random(), v = Math.random();
    const theta = Math.PI * 2 * u;
    const phi   = Math.acos(2 * v - 1);
    const rad   = r * Math.cbrt(Math.random());
    return [
      rad * Math.sin(phi) * Math.cos(theta),
      rad * Math.sin(phi) * Math.sin(theta),
      rad * Math.cos(phi),
    ];
  }
  function rndOnSphere(r) {
    const u = Math.random(), v = Math.random();
    const theta = Math.PI * 2 * u;
    const phi   = Math.acos(2 * v - 1);
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ];
  }

  /* ── A: Sphere interior ── */
  var cloudSphere = (function () {
    var a = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var p = rndInSphere(1.7);
      a[i*3]=p[0]; a[i*3+1]=p[1]; a[i*3+2]=p[2];
    }
    return a;
  }());

  /* ── B: Icosahedron surface ── */
  var cloudIco = (function () {
    var geo = new THREE.IcosahedronGeometry(2.05, 3);
    var pos = geo.attributes.position;
    var a   = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var idx = Math.floor(Math.random() * pos.count);
      a[i*3]   = pos.getX(idx) + (Math.random()-.5)*.09;
      a[i*3+1] = pos.getY(idx) + (Math.random()-.5)*.09;
      a[i*3+2] = pos.getZ(idx) + (Math.random()-.5)*.09;
    }
    geo.dispose();
    return a;
  }());

  /* ── C: Shatter burst ── */
  var cloudShatter = (function () {
    var a = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var p = rndOnSphere(4.5 + Math.random() * 3.5);
      a[i*3]=p[0]; a[i*3+1]=p[1]; a[i*3+2]=p[2];
    }
    return a;
  }());

  /* ── D: Orbital swarm ── */
  var cloudSwarm = (function () {
    var a = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var p = rndOnSphere(2.4 + Math.random() * 1.8);
      a[i*3]=p[0]; a[i*3+1]=p[1]*.55; a[i*3+2]=p[2];
    }
    return a;
  }());

  /* ── E: DNA double helix ── */
  var cloudHelix = (function () {
    var a    = new Float32Array(N * 3);
    var half = N >> 1;
    var turns = 5, h = 4.2, r = 0.68;
    for (var i = 0; i < half; i++) {
      var t  = (i / half) * Math.PI * 2 * turns;
      var yi = (i / half) * h - h / 2;
      a[i*3]   = r * Math.cos(t) + (Math.random()-.5)*.04;
      a[i*3+1] = yi              + (Math.random()-.5)*.04;
      a[i*3+2] = r * Math.sin(t) + (Math.random()-.5)*.04;
    }
    for (var i = 0; i < half; i++) {
      var t  = (i / half) * Math.PI * 2 * turns + Math.PI;
      var yi = (i / half) * h - h / 2;
      var b  = (half + i) * 3;
      a[b]   = r * Math.cos(t) + (Math.random()-.5)*.04;
      a[b+1] = yi              + (Math.random()-.5)*.04;
      a[b+2] = r * Math.sin(t) + (Math.random()-.5)*.04;
    }
    return a;
  }());

  /* ── F: Stethoscope ── */
  var cloudStethoscope = (function () {
    var a = new Float32Array(N * 3);
    var ptr = 0;
    var jit = function () { return (Math.random()-.5)*.04; };
    var fill = function (x,y,z) {
      if (ptr < N*3-2) { a[ptr++]=x; a[ptr++]=y; a[ptr++]=z; }
    };
    var headN = Math.floor(N * .22);
    for (var i = 0; i < headN; i++) {
      var t = (i / headN) * Math.PI * 2;
      var rr = .5 + (Math.random()-.5)*.04;
      fill(rr*Math.cos(t)+jit(), -1.6+jit(), rr*Math.sin(t)*.12+jit());
    }
    var tubeN = Math.floor(N * .44);
    for (var i = 0; i < tubeN; i++) {
      var t = i / tubeN;
      var arcX = Math.sin(t * Math.PI) * .85 * (i < tubeN/2 ? -1 : 1);
      fill(arcX+jit(), -1.5 + t*3.5+jit(), jit());
    }
    var earHalf = Math.floor((N - ptr/3) / 2);
    for (var i = 0; i < earHalf && ptr < N*3-2; i++) {
      var t = i / earHalf;
      fill(-0.85 - t*.45+jit(), 2.0+t*.45+jit(), jit());
    }
    for (var i = 0; i < earHalf && ptr < N*3-2; i++) {
      var t = i / earHalf;
      fill( 0.85 + t*.45+jit(), 2.0+t*.45+jit(), jit());
    }
    while (ptr < N*3) { a[ptr++] = (Math.random()-.5)*.1; }
    return a;
  }());

  /* ── G: Settling plane ── */
  var cloudPlane = (function () {
    var a = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      a[i*3]   = (Math.random()-.5) * 20;
      a[i*3+1] = -3.5 + (Math.random()-.5)*.15;
      a[i*3+2] = (Math.random()-.5) * 7;
    }
    return a;
  }());

  /* ═══════════════════════════════════════════════════════════
     9. STATE MACHINE
  ═══════════════════════════════════════════════════════════ */
  var currentState = 'hero';
  var shatterTimer = null;

  function setTarget(cloud, speed) {
    targetPos.set(cloud);
    if (speed !== undefined) lerpSpeed = speed;
  }

  /* Kill all in-flight tweens before any transition to prevent race conditions */
  function killAllTweens() {
    if (!_gsap) return;
    _gsap.killTweensOf(sphereGroup.scale);
    _gsap.killTweensOf(glassMat);
    _gsap.killTweensOf(innerCoreMat);
    _gsap.killTweensOf(wireframeMat);
    _gsap.killTweensOf(planeMat);
    _gsap.killTweensOf(particleMat);
    _gsap.killTweensOf(camera.position);
  }

  function transitionTo(state) {
    if (currentState === state) return;

    /* Always cancel the shatter timer and kill in-flight tweens first */
    if (shatterTimer) { clearTimeout(shatterTimer); shatterTimer = null; }
    killAllTweens();

    currentState = state;

    /* Resolve particle opacity for the current theme */
    var pOpacity = TARGET_PARTICLE_OPACITY;

    switch (state) {

      case 'hero':
        setTarget(cloudSphere, LERP_SLOW);
        /* Make sphere visible and reset scale BEFORE animating
           so there is never a frame where it stays invisible */
        sphereGroup.visible = true;
        sphereGroup.scale.set(
          sphereGroup.scale.x || 0.001,
          sphereGroup.scale.y || 0.001,
          sphereGroup.scale.z || 0.001
        );
        _gsap.to(sphereGroup.scale, { x:1, y:1, z:1, duration:1.4, ease:'back.out(1.7)' });
        _gsap.to(wireframeMat,     { opacity:0,   duration:.6 });
        _gsap.to(planeMat,         { opacity:0,   duration:.6 });
        _gsap.to(particleMat,      { opacity: pOpacity, emissiveIntensity: TARGET_EMISSIVE_INTENSITY, duration:1.0 });
        _gsap.to(camera.position,  { z:5.5, y:0, duration:1.6, ease:'power2.inOut' });
        break;

      case 'mission':
        setTarget(cloudIco, LERP_SLOW);
        /* Scale sphere down; only hide it after the tween completes.
           We capture currentState in a closure so if state changes
           before completion we don't hide a sphere that should be showing. */
        (function (capturedState) {
          _gsap.to(sphereGroup.scale, {
            x:0, y:0, z:0, duration:.85, ease:'power2.in',
            onComplete: function () {
              /* Only hide if we are still in this state */
              if (currentState === capturedState) {
                sphereGroup.visible = false;
              }
            }
          });
        }('mission'));
        _gsap.to(wireframeMat,    { opacity:.65, duration:1.4 });
        _gsap.to(planeMat,        { opacity:0,   duration:.6 });
        _gsap.to(particleMat,     { opacity: pOpacity * 0.88, emissiveIntensity: TARGET_EMISSIVE_INTENSITY * 0.85, duration:1 });
        _gsap.to(camera.position, { z:7,   y:0,   duration:2, ease:'power2.inOut' });
        break;

      case 'services-shatter':
        setTarget(cloudShatter, LERP_FAST);
        _gsap.to(particleMat, { opacity: pOpacity * 0.55, emissiveIntensity: TARGET_EMISSIVE_INTENSITY * 0.5, duration:.35 });
        _gsap.to(wireframeMat, { opacity:0, duration:.5 });
        /* Capture state so timer doesn't fire after a quick scroll-back */
        (function (capturedState) {
          shatterTimer = setTimeout(function () {
            if (currentState === capturedState) transitionTo('services');
          }, 650);
        }('services-shatter'));
        break;

      case 'services':
        setTarget(cloudSwarm, LERP_MID);
        _gsap.to(particleMat,     { opacity: pOpacity * 0.95, emissiveIntensity: TARGET_EMISSIVE_INTENSITY * 0.92, duration:1.1 });
        _gsap.to(planeMat,        { opacity:0,  duration:.6 });
        _gsap.to(camera.position, { z:6,  y:0,  duration:1.5, ease:'power2.inOut' });
        break;

      case 'pricing':
        setTarget(cloudPlane, LERP_SLOW);
        _gsap.to(particleMat,     { opacity: pOpacity * 0.47, emissiveIntensity: TARGET_EMISSIVE_INTENSITY * 0.34, duration:1.6 });
        _gsap.to(planeMat,        { opacity:.88, duration:2.2, ease:'power2.out' });
        _gsap.to(camera.position, { z:8,  y:1.8, duration:2.2, ease:'power2.inOut' });
        break;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     10. SCROLL TRIGGERS
  ═══════════════════════════════════════════════════════════ */
  if (_gsap && _ST) {
    _ST.create({
      trigger    : '#about',
      start      : 'top 68%',
      onEnter    : function () { transitionTo('mission'); },
      onLeaveBack: function () { transitionTo('hero'); },
    });
    _ST.create({
      trigger    : '#services',
      start      : 'top 68%',
      onEnter    : function () { transitionTo('services-shatter'); },
      onLeaveBack: function () { transitionTo('mission'); },
    });
    _ST.create({
      trigger    : '#pricing',
      start      : 'top 68%',
      onEnter    : function () { transitionTo('pricing'); },
      onLeaveBack: function () { transitionTo('services'); },
    });
  }

  /* ═══════════════════════════════════════════════════════════
     11. MOUSE + HOVER INTERACTIONS
  ═══════════════════════════════════════════════════════════ */
  var mouse     = { ndcX: 0, ndcY: 0 };
  var sphereRot = { tx: 0, ty: 0 };
  var ripple    = { x: 0, z: 0, t: -999 };
  var swarmResetTimer = null;

  window.addEventListener('mousemove', function (e) {
    mouse.ndcX = (e.clientX / innerWidth  - .5) * 2;
    mouse.ndcY = -(e.clientY / innerHeight - .5) * 2;

    if (currentState === 'pricing') {
      ripple.x = mouse.ndcX * 10;
      ripple.z = -mouse.ndcY * 3;
      ripple.t = clock.getElapsedTime();
    }
  });

  /* Mission hover glow */
  var missionEl = document.getElementById('about');
  if (missionEl && _gsap) {
    missionEl.addEventListener('mouseenter', function () {
      _gsap.to(wireframeMat, { emissiveIntensity:.65, duration:.5 });
    });
    missionEl.addEventListener('mouseleave', function () {
      _gsap.to(wireframeMat, { emissiveIntensity:.06, duration:.6 });
    });
  }

  /* Services — particle morphing */
  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (currentState !== 'services') return;
      clearTimeout(swarmResetTimer);
      var svc = card.dataset.service;
      if      (svc === 'negligence') setTarget(cloudStethoscope, LERP_MID);
      else if (svc === 'forensic')   setTarget(cloudHelix,       LERP_MID);
    });
    card.addEventListener('mouseleave', function () {
      if (currentState !== 'services') return;
      swarmResetTimer = setTimeout(function () { setTarget(cloudSwarm, LERP_SLOW); }, 320);
    });
  });

  /* ═══════════════════════════════════════════════════════════
     12. FLUID PLANE VERTEX ANIMATION
  ═══════════════════════════════════════════════════════════ */
  function animatePlane(t) {
    var pa  = planeGeo.attributes.position.array;
    var age = t - ripple.t;
    for (var i = 0, n = pa.length / 3; i < n; i++) {
      var bx = planeBasePos[i*3];
      var bz = planeBasePos[i*3+2];
      var y  = Math.sin(bx*.42 + t*.75) * Math.sin(bz*.6 + t*.55) * .14
             + Math.sin(bx*.72 - t*.48) * .055;
      if (age < 4.5) {
        var dx = bx - ripple.x, dz = bz - ripple.z;
        var d2 = dx*dx + dz*dz;
        y += Math.exp(-age*1.4) * Math.exp(-d2/7)
           * Math.sin(Math.sqrt(d2)*2.6 - t*6) * .38;
      }
      pa[i*3+1] = planeBasePos[i*3+1] + y;
    }
    planeGeo.attributes.position.needsUpdate = true;
    planeGeo.computeVertexNormals();
  }

  /* ═══════════════════════════════════════════════════════════
     13. RENDER LOOP
  ═══════════════════════════════════════════════════════════ */
  var clock  = new THREE.Clock();
  var paused = false;

  function tick() {
    requestAnimationFrame(tick);
    if (paused) return;

    var t = clock.getElapsedTime();

    /* Hero sphere: ambient rotation + mouse parallax */
    if (currentState === 'hero') {
      glassSphere.rotation.y = t * .08;
      glassSphere.rotation.x = t * .03;
      innerCore.rotation.y   = -t * .12;
      sphereRot.tx += (mouse.ndcY * .16 - sphereRot.tx) * .045;
      sphereRot.ty += (mouse.ndcX * .16 - sphereRot.ty) * .045;
      sphereGroup.rotation.x = sphereRot.tx;
      sphereGroup.rotation.y = sphereRot.ty;
    }

    /* Wireframe slow drift */
    if (wireframeMat.opacity > .01) {
      wireframeMesh.rotation.y = t * .04;
      wireframeMesh.rotation.x = t * .015;
    }

    /* Swarm orbital rotation */
    if (currentState === 'services') {
      particleMesh.rotation.y = t * .055;
    } else {
      particleMesh.rotation.y = 0;
    }

    /* Fluid plane */
    if (planeMat.opacity > .01) animatePlane(t);

    /* Lerp particles → target + write matrices */
    var ma = particleMesh.instanceMatrix.array;
    for (var i = 0; i < N; i++) {
      var i3 = i * 3, b = i * 16;
      currentPos[i3]   += (targetPos[i3]   - currentPos[i3])   * lerpSpeed;
      currentPos[i3+1] += (targetPos[i3+1] - currentPos[i3+1]) * lerpSpeed;
      currentPos[i3+2] += (targetPos[i3+2] - currentPos[i3+2]) * lerpSpeed;
      ma[b+12] = currentPos[i3];
      ma[b+13] = currentPos[i3+1];
      ma[b+14] = currentPos[i3+2];
    }
    particleMesh.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }

  /* ═══════════════════════════════════════════════════════════
     14. PAUSE / RESUME
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
    if (!paused) clock.start();
  });

  /* ═══════════════════════════════════════════════════════════
     15. RESIZE
  ═══════════════════════════════════════════════════════════ */
  window.addEventListener('resize', function () {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    if (_gsap && _ST) _ST.refresh();
  });

  /* ═══════════════════════════════════════════════════════════
     16. INIT
  ═══════════════════════════════════════════════════════════ */
  currentPos.set(cloudSphere);
  targetPos.set(cloudSphere);

  /* Write initial matrices */
  (function () {
    var ma = particleMesh.instanceMatrix.array;
    for (var i = 0; i < N; i++) {
      var b = i * 16, i3 = i * 3;
      ma[b+12] = currentPos[i3];
      ma[b+13] = currentPos[i3+1];
      ma[b+14] = currentPos[i3+2];
    }
    particleMesh.instanceMatrix.needsUpdate = true;
  }());

  /* Fade particles in */
  TARGET_PARTICLE_OPACITY   = isDarkTheme() ? 0.82 : 0.92;
  TARGET_EMISSIVE_INTENSITY = isDarkTheme() ? 0.65 : 0.02;
  TARGET_SPHERE_OPACITY     = isDarkTheme() ? 0.22 : 0.50;
  if (_gsap) {
    _gsap.to(particleMat, { opacity: TARGET_PARTICLE_OPACITY, duration:2.2, delay:.5, ease:'power2.out' });
  } else {
    particleMat.opacity = TARGET_PARTICLE_OPACITY;
  }

  /* ═══════════════════════════════════════════════════════════
     17. THEME CHANGE HANDLER
  ═══════════════════════════════════════════════════════════ */
  window.addEventListener('themechange', function (e) {
    var dark  = (e.detail === 'dark');
    var gold  = dark ? COL.goldDark   : COL.goldLight;
    var wire  = dark ? COL.goldDark   : COL.accentLight;  /* navy wireframe in light */
    var bg    = dark ? COL.bgDark     : COL.bgLight;
    var plane = dark ? COL.planeDark  : COL.planeLight;
    TARGET_PARTICLE_OPACITY   = dark ? 0.82 : 0.92;
    TARGET_EMISSIVE_INTENSITY = dark ? 0.65 : 0.02;
    TARGET_SPHERE_OPACITY     = dark ? 0.22 : 0.50;

    /* Scene background — animate via tween object */
    var bgCol    = { r: scene.background.r, g: scene.background.g, b: scene.background.b };
    var targetBg = new THREE.Color(bg);
    if (_gsap) {
      _gsap.to(bgCol, {
        r: targetBg.r, g: targetBg.g, b: targetBg.b,
        duration: 0.8, ease: 'power2.inOut',
        onUpdate: function () { scene.background.setRGB(bgCol.r, bgCol.g, bgCol.b); }
      });
    } else {
      scene.background.set(bg);
    }

    /* Sphere — colour + opacity */
    glassMat.color.set(gold);
    innerCoreMat.color.set(gold);
    if (_gsap) {
      _gsap.to(glassMat,     { opacity: TARGET_SPHERE_OPACITY, duration: 0.8 });
      _gsap.to(innerCoreMat, { opacity: dark ? 0.20 : 0.55,   duration: 0.8 });
    } else {
      glassMat.opacity     = TARGET_SPHERE_OPACITY;
      innerCoreMat.opacity = dark ? 0.20 : 0.55;
    }

    /* Wireframe — navy in light, gold in dark */
    wireframeMat.color.set(wire);
    wireframeMat.emissive.set(wire);
    wireframeMat.emissiveIntensity = dark ? 0.06 : 0.01;

    /* Particles */
    particleMat.color.set(gold);
    particleMat.emissive.set(gold);
    planeMat.color.set(plane);

    /* Emissive intensity + opacity (tweened) */
    if (_gsap) {
      _gsap.to(particleMat, {
        emissiveIntensity: TARGET_EMISSIVE_INTENSITY,
        opacity:           TARGET_PARTICLE_OPACITY,
        duration: 0.8
      });
    } else {
      particleMat.emissiveIntensity = TARGET_EMISSIVE_INTENSITY;
      particleMat.opacity           = TARGET_PARTICLE_OPACITY;
    }

    /* Ambient light — brighter in light mode to reduce harsh shadows */
    scene.children.forEach(function(child) {
      if (child.isAmbientLight) {
        child.intensity = dark ? 0.12 : 0.45;
      }
    });
  });

  tick();

}); // end DOMContentLoaded
