// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Product page: color selector
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Product page: size selector
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Product page: quantity
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');
const qtyValue = document.getElementById('qty-value');
if (qtyMinus && qtyPlus && qtyValue) {
  qtyMinus.addEventListener('click', () => {
    let v = parseInt(qtyValue.textContent);
    if (v > 1) qtyValue.textContent = v - 1;
  });
  qtyPlus.addEventListener('click', () => {
    let v = parseInt(qtyValue.textContent);
    if (v < 10) qtyValue.textContent = v + 1;
  });
}

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .process-step, .risk-card, .value-card, .ship-card, .spec-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.4s, transform 0.4s';
  observer.observe(el);
});

/* ===== Liquid button ripple ===== */
function initLiquidButtons() {
  const buttons = document.querySelectorAll(
    'button, .primary-button, .secondary-button, .nav-button'
  );

  buttons.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');

      const size = Math.max(rect.width, rect.height);
      ripple.className = 'liquid-ripple';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      button.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 750);
    });
  });
}

/* ===== Draggable technology chips with edge bounce ===== */
function initDraggableChips() {
  const stage = document.querySelector('#techStage');
  if (!stage) return;

  const chips = stage.querySelectorAll('.draggable-chip');

  chips.forEach((chip) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let chipStartLeft = 0;
    let chipStartTop = 0;

    chip.addEventListener('pointerdown', (event) => {
      isDragging = true;
      chip.setPointerCapture(event.pointerId);

      const stageRect = stage.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();

      startX = event.clientX;
      startY = event.clientY;
      chipStartLeft = chipRect.left - stageRect.left;
      chipStartTop = chipRect.top - stageRect.top;

      chip.style.left = `${chipStartLeft}px`;
      chip.style.top = `${chipStartTop}px`;
      chip.style.right = 'auto';
      chip.style.bottom = 'auto';

      chip.classList.add('dragging');
    });

    chip.addEventListener('pointermove', (event) => {
      if (!isDragging) return;

      const stageRect = stage.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();

      let nextLeft = chipStartLeft + event.clientX - startX;
      let nextTop = chipStartTop + event.clientY - startY;

      const maxLeft = stageRect.width - chipRect.width;
      const maxTop = stageRect.height - chipRect.height;

      const clampedLeft = Math.min(Math.max(nextLeft, 0), maxLeft);
      const clampedTop = Math.min(Math.max(nextTop, 0), maxTop);

      const hitX = nextLeft !== clampedLeft;
      const hitY = nextTop !== clampedTop;

      chip.style.left = `${clampedLeft}px`;
      chip.style.top = `${clampedTop}px`;

      if (hitX || hitY) {
        triggerEdgeFeedback(stage, chip, hitX, hitY, nextLeft, clampedLeft, nextTop, clampedTop);
      }
    });

    chip.addEventListener('pointerup', () => {
      isDragging = false;
      chip.classList.remove('dragging');
    });

    chip.addEventListener('pointercancel', () => {
      isDragging = false;
      chip.classList.remove('dragging');
    });
  });
}

function triggerEdgeFeedback(stage, chip, hitX, hitY, nextLeft, clampedLeft, nextTop, clampedTop) {
  const bounceX = hitX ? (nextLeft < clampedLeft ? '8px' : '-8px') : '0px';
  const bounceY = hitY ? (nextTop < clampedTop ? '8px' : '-8px') : '0px';

  chip.style.setProperty('--bounce-x', bounceX);
  chip.style.setProperty('--bounce-y', bounceY);

  chip.classList.remove('hit-edge');
  void chip.offsetWidth;
  chip.classList.add('hit-edge');

  stage.classList.add('edge-glow');

  window.clearTimeout(stage._edgeGlowTimer);
  stage._edgeGlowTimer = window.setTimeout(() => {
    stage.classList.remove('edge-glow');
  }, 220);
}

/* ===== Liquid cursor and touch trail ===== */
function initLiquidTrail() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const cursor = document.createElement('div');
  cursor.className = 'liquid-cursor';
  document.body.appendChild(cursor);

  let lastBlobTime = 0;
  let lastX = 0;
  let lastY = 0;
  let rafId = null;

  function moveCursor(x, y) {
    lastX = x;
    lastY = y;

    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      cursor.style.left = `${lastX}px`;
      cursor.style.top = `${lastY}px`;
      cursor.style.opacity = '1';
      rafId = null;
    });
  }

  function createTrailBlob(x, y, strength) {
    strength = strength || 1;
    const now = performance.now();

    if (now - lastBlobTime < 38) return;
    lastBlobTime = now;

    const blob = document.createElement('div');
    blob.className = 'trail-blob';

    const size = 48 + Math.random() * 56 * strength;
    const offsetX = (Math.random() - 0.5) * 18;
    const offsetY = (Math.random() - 0.5) * 18;

    blob.style.setProperty('--x', `${x + offsetX}px`);
    blob.style.setProperty('--y', `${y + offsetY}px`);
    blob.style.setProperty('--size', `${size}px`);

    document.body.appendChild(blob);

    window.setTimeout(() => {
      blob.remove();
    }, 900);
  }

  window.addEventListener('pointermove', (event) => {
    moveCursor(event.clientX, event.clientY);
    createTrailBlob(event.clientX, event.clientY, event.pointerType === 'touch' ? 1.15 : 1);
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    cursor.style.opacity = '0';
  });

  window.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    createTrailBlob(touch.clientX, touch.clientY, 1.25);
  }, { passive: true });

  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    if (window.innerWidth > 760) return;
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      createTrailBlob(window.innerWidth * 0.5, window.innerHeight * 0.62, 0.7);
    }, 40);
  }, { passive: true });
}

/* ===== Init all interactions ===== */
document.addEventListener('DOMContentLoaded', () => {
  initLiquidButtons();
  initDraggableChips();
  initLiquidTrail();
});
