'use strict';

/* ============================================================
   GSAP PLUGIN REGISTRATION
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   LENIS SMOOTH SCROLL
   ============================================================ */
const lenis = new Lenis({
  duration: 1.35,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothTouch: false,
});
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cDot  = document.getElementById('c-dot');
const cRing = document.getElementById('c-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  gsap.to(cDot, { x: mx, y: my, duration: .08, overwrite: true });
});

(function ringLoop() {
  rx += (mx - rx) * .11;
  ry += (my - ry) * .11;
  gsap.set(cRing, { x: rx, y: ry });
  requestAnimationFrame(ringLoop);
})();

document.querySelectorAll('a, button, .prod-card, .testi-card, .btn-primary, .btn-lg, .nav-cta').forEach(el => {
  el.addEventListener('mouseenter', () => cRing.classList.add('hover'));
  el.addEventListener('mouseleave', () => cRing.classList.remove('hover'));
});

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * .28;
    const dy = (e.clientY - r.top  - r.height / 2) * .28;
    gsap.to(btn, { x: dx, y: dy, duration: .35, ease: 'power3.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.5)' });
  });
});

/* ============================================================
   THREE.JS HERO PARTICLES
   ============================================================ */
(function initThree() {
  const canvas   = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvas.style.width = '';
  canvas.style.height = '';

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const COUNT = 200;
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);
  const vel   = [];

  const palette = [
    new THREE.Color('#aac2b4'),
    new THREE.Color('#5a82a1'),
    new THREE.Color('#b4c4ce'),
    new THREE.Color('#809db2'),
    new THREE.Color('#af729e'),
    new THREE.Color('#c9d9d2'),
  ];

  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random() - .5) * 16;
    pos[i*3+1] = (Math.random() - .5) * 11;
    pos[i*3+2] = (Math.random() - .5) * 5;
    const c    = palette[Math.floor(Math.random() * palette.length)];
    col[i*3]   = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    vel.push({
      x: (Math.random() - .5) * .0028,
      y:  Math.random()       * .0055 + .0008,
      z: (Math.random() - .5) * .0012,
    });
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: .075, vertexColors: true, transparent: true,
    opacity: .55, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(geo, mat));

  let tmx = 0, tmy = 0;
  document.addEventListener('mousemove', e => {
    tmx = (e.clientX / window.innerWidth  - .5) * 2;
    tmy = (e.clientY / window.innerHeight - .5) * 2;
  });

  (function animate() {
    requestAnimationFrame(animate);
    const p = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i*3]   += vel[i].x;
      p[i*3+1] += vel[i].y;
      p[i*3+2] += vel[i].z;
      if (p[i*3+1] >  6)   p[i*3+1] = -6;
      if (p[i*3]   >  8.5) p[i*3]   = -8.5;
      if (p[i*3]   < -8.5) p[i*3]   =  8.5;
    }
    geo.attributes.position.needsUpdate = true;
    camera.position.x += (tmx * .28 - camera.position.x) * .018;
    camera.position.y += (-tmy * .18 - camera.position.y) * .018;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.style.width = '';
    canvas.style.height = '';
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }, { passive: true });
})();

/* ============================================================
   PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  const pl   = document.getElementById('preloader');
  const logo = pl.querySelector('.pl-logo');
  const tag  = pl.querySelector('.pl-tagline span');
  const bw   = pl.querySelector('.pl-bar-wrap');
  const bar  = document.getElementById('pl-bar');

  gsap.timeline({
    onComplete() {
      gsap.to(pl, {
        yPercent: -100, duration: 1, ease: 'power3.inOut',
        onComplete() { pl.style.display = 'none'; playHero(); }
      });
    }
  })
  .to(logo, { opacity: 1, scale: 1, duration: .8, ease: 'back.out(1.6)' })
  .to(tag,  { y: 0,       duration: .55, ease: 'power3.out' }, '-=.25')
  .to(bw,   { opacity: 1, duration: .3  }, '-=.1')
  .to(bar,  { width: '100%', duration: .9, ease: 'power2.inOut' })
  .to({},   { duration: .25 });
}, { passive: true });

/* ============================================================
   HERO ENTRANCE
   ============================================================ */
function playHero() {
  gsap.timeline()
    .to('.hero-eyebrow span', { y: 0, duration: .7,  ease: 'power3.out' })
    .to('.hero-title .lni',   { y: 0, duration: .95, stagger: .11, ease: 'power4.out' }, '-=.35')
    .to('.hero-sub',   { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.45')
    .to('.hero-ctas',  { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, '-=.35')
    .to('.hero-scroll',{ opacity: 1,       duration: .5                      }, '-=.1' );
}

/* ============================================================
   NAV SCROLL STATE
   ============================================================ */
ScrollTrigger.create({
  start: 'top -88px',
  onEnter:     () => document.getElementById('nav').classList.add('scrolled'),
  onLeaveBack: () => document.getElementById('nav').classList.remove('scrolled'),
});

/* ============================================================
   GENERIC REVEAL HELPER
   ============================================================ */
function revealOn(selector, vars = {}) {
  gsap.utils.toArray(selector).forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, x: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 87%' },
      ...vars
    });
  });
}

revealOn('.s-eye');
revealOn('.s-title');
revealOn('.sol-big');

/* ============================================================
   TRUST BAR – COUNTER ANIMATION
   ============================================================ */
ScrollTrigger.create({
  trigger: '.trust-bar', start: 'top 82%', once: true,
  onEnter() {
    document.querySelectorAll('.trust-item').forEach((item, i) => {
      gsap.to(item, { opacity: 1, y: 0, duration: .65, delay: i * .1 });
      const num    = item.querySelector('.trust-num');
      const target = parseInt(num.dataset.count);
      const suffix = num.dataset.suffix || '';
      gsap.to({ val: 0 }, {
        val: target, duration: 1.6, delay: i * .1 + .3, ease: 'power2.out',
        onUpdate() { num.textContent = Math.round(this.targets()[0].val) + suffix; },
        onComplete() { num.textContent = target + suffix; },
      });
    });
  }
});

/* ============================================================
   PAIN ITEMS
   ============================================================ */
document.querySelectorAll('.pain-item').forEach((el, i) => {
  gsap.to(el, {
    opacity: 1, y: 0, duration: .7, ease: 'power3.out', delay: i * .14,
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});

/* ============================================================
   PRODUCT CARDS
   ============================================================ */
document.querySelectorAll('.prod-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: .85, ease: 'power3.out', delay: i * .18,
    scrollTrigger: { trigger: '#products', start: 'top 72%' }
  });
});

/* ============================================================
   STEPS
   ============================================================ */
document.querySelectorAll('.step').forEach((step, i) => {
  gsap.to(step, {
    opacity: 1, y: 0, duration: .75, ease: 'power3.out', delay: i * .15,
    scrollTrigger: { trigger: '#how', start: 'top 72%' }
  });
});

/* ============================================================
   ABOUT
   ============================================================ */
gsap.to('.about-quote', {
  opacity: 1, y: 0, duration: .9, ease: 'power3.out',
  scrollTrigger: { trigger: '.about-quote', start: 'top 82%' }
});
gsap.to('.about-txt', {
  opacity: 1, y: 0, duration: .75, ease: 'power3.out',
  scrollTrigger: { trigger: '.about-txt', start: 'top 86%' }
});
gsap.to('.about-sig', {
  opacity: 1, duration: .7,
  scrollTrigger: { trigger: '.about-sig', start: 'top 90%' }
});
gsap.to('.about-phone', {
  opacity: 1, y: 0, duration: .7,
  scrollTrigger: { trigger: '.about-phone', start: 'top 92%' }
});

/* ============================================================
   TESTIMONIALS
   ============================================================ */
document.querySelectorAll('.testi-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: i * .14,
    scrollTrigger: { trigger: '#testimonials', start: 'top 72%' }
  });
});

/* ============================================================
   CTA SECTION
   ============================================================ */
['.cta-title','.cta-sub','.cta-contact-btns','.cta-note','.cta-form-wrap'].forEach((sel, i) => {
  gsap.to(sel, {
    opacity: 1, y: 0, duration: .8, ease: 'power3.out', delay: i * .12,
    scrollTrigger: { trigger: '#cta', start: 'top 78%' }
  });
});

/* ============================================================
   PARALLAX – PAIN IMAGE
   ============================================================ */
gsap.to('#px-pain', {
  yPercent: -14, ease: 'none',
  scrollTrigger: {
    trigger: '#pain', start: 'top bottom', end: 'bottom top', scrub: true,
  }
});

/* ============================================================
   PARALLAX – ABOUT IMAGE
   ============================================================ */
gsap.to('#px-about', {
  yPercent: -11, ease: 'none',
  scrollTrigger: {
    trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true,
  }
});

/* ============================================================
   WATER RIPPLE – SOLUTION SECTION
   ============================================================ */
(function initWaterRipple() {
  const canvas = document.getElementById('sol-water');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const ripples = [];
  const colors  = [
    'rgba(90,130,161,',
    'rgba(170,194,180,',
    'rgba(128,157,178,',
    'rgba(90,130,161,',
  ];

  function spawn() {
    const pad = 60;
    ripples.push({
      x:     pad + Math.random() * (canvas.width  - pad * 2),
      y:     pad + Math.random() * (canvas.height - pad * 2),
      r:     0,
      maxR:  70 + Math.random() * 90,
      alpha: 0.22 + Math.random() * .12,
      speed: 0.55 + Math.random() * .6,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  for (let i = 0; i < 5; i++) spawn();
  setInterval(spawn, 700);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = rp.color + rp.alpha.toFixed(3) + ')';
      ctx.lineWidth   = 1.4;
      ctx.stroke();
      if (rp.r < 20) {
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r * .4, 0, Math.PI * 2);
        ctx.fillStyle = rp.color + (rp.alpha * .15).toFixed(3) + ')';
        ctx.fill();
      }
      rp.r     += rp.speed;
      rp.alpha -= rp.alpha / (rp.maxR / rp.speed);
      if (rp.r >= rp.maxR) ripples.splice(i, 1);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ============================================================
   CONTACT FORM – AJAX SUBMISSION (Brevo)
   ============================================================ */
(function initContactForm() {
  const form    = document.querySelector('.cta-form');
  const success = document.getElementById('cf-success');
  const error   = document.getElementById('cf-error');
  if (!form) return;

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    error.style.display = 'none';

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';

    const d = Object.fromEntries(new FormData(form));

    const html = `
<div style="font-family:Arial,sans-serif;max-width:580px;color:#1c2b25;">
  <h2 style="color:#2c4158;border-bottom:2px solid #aac2b4;padding-bottom:10px;margin-bottom:20px;">
    Neue Anfrage – dein frosch HYLA
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:15px;">
    <tr><td style="padding:7px 0;color:#5a6b62;width:150px;">Name</td>
        <td style="padding:7px 0;"><strong>${esc(d.vorname)} ${esc(d.nachname)}</strong></td></tr>
    <tr><td style="padding:7px 0;color:#5a6b62;">E-Mail</td>
        <td style="padding:7px 0;">${esc(d.email)}</td></tr>
    <tr><td style="padding:7px 0;color:#5a6b62;">Telefon</td>
        <td style="padding:7px 0;">${esc(d.telefon)}</td></tr>
    <tr><td style="padding:7px 0;color:#5a6b62;">Wohnort</td>
        <td style="padding:7px 0;">${esc(d.wohnort)}</td></tr>
    <tr><td style="padding:7px 0;color:#5a6b62;">Anliegen</td>
        <td style="padding:7px 0;">${esc(d.anliegen || '–')}</td></tr>
    <tr><td style="padding:7px 0;color:#5a6b62;">Kontaktweg</td>
        <td style="padding:7px 0;">${esc(d.kontaktweg || '–')}</td></tr>
    ${d.nachricht ? `<tr><td style="padding:7px 0;color:#5a6b62;vertical-align:top;">Nachricht</td>
        <td style="padding:7px 0;">${esc(d.nachricht).replace(/\n/g,'<br>')}</td></tr>` : ''}
  </table>
</div>`;

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': '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',
        },
        body: JSON.stringify({
          sender:    { name: 'dein frosch Website', email: 'office@deinfrosch.at' },
          to:        [{ email: 'vici.hyla@gmail.com', name: 'Victoria Petermaier' }],
          replyTo:   { email: d.email, name: `${d.vorname} ${d.nachname}` },
          subject:   `Neue Anfrage: ${d.anliegen || 'Kontakt'} – ${d.vorname} ${d.nachname}`,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || json.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      error.textContent = `Fehler: ${err.message}`;
      error.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Anfrage absenden';
    }
  });
})();

/* ============================================================
   BACK TO TOP
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  lenis.on('scroll', ({ scroll }) => {
    btn.classList.toggle('visible', scroll > 400);
  });
  btn.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.2 }));
  btn.addEventListener('mouseenter', () => cRing.classList.add('hover'));
  btn.addEventListener('mouseleave', () => cRing.classList.remove('hover'));
})();
