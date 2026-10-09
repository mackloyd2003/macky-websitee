/* ========== SMOOTH SCROLL ========== */
let targetScroll = window.scrollY;
let currentScroll = window.scrollY;
let isScrolling = false;

function smoothScrollLoop() {
  const diff = targetScroll - currentScroll;
  currentScroll += diff * 0.08; // lower = smoother / slower

  if (Math.abs(diff) > 0.5) {
    window.scrollTo(0, currentScroll);
    requestAnimationFrame(smoothScrollLoop);
    isScrolling = true;
  } else {
    window.scrollTo(0, targetScroll);
    isScrolling = false;
  }
}

// Intercept wheel / trackpad
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  targetScroll += e.deltaY;
  // Clamp
  const max = document.documentElement.scrollHeight - window.innerHeight;
  targetScroll = Math.max(0, Math.min(targetScroll, max));
  if (!isScrolling) requestAnimationFrame(smoothScrollLoop);
}, { passive: false });

// Smooth anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      targetScroll = target.getBoundingClientRect().top + window.scrollY - 80;
      if (!isScrolling) requestAnimationFrame(smoothScrollLoop);
    }
  });
});

// Keep target in sync on resize / manual scroll (e.g. scrollbar drag)
window.addEventListener('scroll', () => {
  if (!isScrolling) {
    targetScroll = window.scrollY;
    currentScroll = window.scrollY;
  }
});

/* ========== NAV SCROLL EFFECT ========== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ========== SCROLL REVEAL ========== */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => observer.observe(el));

/* ========== 3D TILT ON CARDS ========== */
document.querySelectorAll('.service-card, .project-card, .price-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    card.style.transform = `translateY(-6px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ========== CUSTOM CURSOR ========== */
const cursorDot = document.getElementById('cursorDot');

document.addEventListener('mousemove', (e) => {
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top = e.clientY + 'px';
});

// Hover state on interactive elements
const hoverTargets = document.querySelectorAll('a, button, .skill, .service-card, .project-card, .price-card, .contact-link, input, textarea');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorDot.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursorDot.classList.remove('hover');
  });
});

/* ========== PIXELATE CURSOR BACKGROUND ========== */
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
let pixels = [];
let lastX = 0, lastY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Spawn pixels when mouse moves
document.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Only spawn if mouse moved enough
  if (dist > 4) {
    const count = Math.min(Math.floor(dist / 6), 6);
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 5 + 2; // 2–7px squares
      const offsetX = (Math.random() - 0.5) * 24;
      const offsetY = (Math.random() - 0.5) * 24;
      pixels.push({
        x: e.clientX + offsetX,
        y: e.clientY + offsetY,
        size: size,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2 - 0.3,
        // Blue tones
        color: Math.random() > 0.3
          ? `rgba(59, 130, 246, ${0.5 + Math.random() * 0.5})`
          : `rgba(96, 165, 250, ${0.4 + Math.random() * 0.5})`
      });
    }
    lastX = e.clientX;
    lastY = e.clientY;
  }
});

function drawPixels() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = pixels.length - 1; i >= 0; i--) {
    const p = pixels[i];
    p.life -= p.decay;
    p.x += p.vx;
    p.y += p.vy;
    p.size *= 0.985;

    if (p.life <= 0 || p.size < 0.5) {
      pixels.splice(i, 1);
      continue;
    }

    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    // Draw as sharp square (pixel look)
    const s = Math.max(1, Math.round(p.size));
    ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(drawPixels);
}
drawPixels();
