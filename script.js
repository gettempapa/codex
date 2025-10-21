const counterEl = document.querySelector('#counter');
const thermometerEl = document.querySelector('#thermometer');
const fillEl = document.querySelector('#thermometerFill');
const bulbEl = document.querySelector('#thermometerBulb');
const temperatureEl = document.querySelector('#temperatureValue');

const MAX_COUNT = 50000;
const COLOR_START = { h: 205, s: 86, l: 58 }; // chilly blue
const COLOR_END = { h: 5, s: 88, l: 52 }; // molten red

let ticking = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function hslToCss({ h, s, l }) {
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

function mixColor(t) {
  return {
    h: lerp(COLOR_START.h, COLOR_END.h, t),
    s: lerp(COLOR_START.s, COLOR_END.s, t),
    l: lerp(COLOR_START.l, COLOR_END.l, t),
  };
}

function adjustLightness(color, delta) {
  return { ...color, l: clamp(color.l + delta, 0, 100) };
}

function updateVisuals(progress) {
  const eased = progress ** 1.15;
  const count = Math.round(eased * MAX_COUNT);
  const percent = Math.round(progress * 100);

  counterEl.textContent = count.toLocaleString('en-US');
  temperatureEl.textContent = `${percent}%`;

  thermometerEl.style.setProperty('--fill-progress', eased.toString());

  const color = mixColor(progress);
  const lightColor = adjustLightness(color, 18);
  const glowColor = adjustLightness(color, -12);

  const colorCss = hslToCss(color);
  const lightCss = hslToCss(lightColor);
  const glowCss = hslToCss(glowColor);

  thermometerEl.style.setProperty('--fill-color', colorCss);
  thermometerEl.style.setProperty('--fill-color-light', lightCss);

  fillEl.style.boxShadow = `0 0 30px ${colorCss}`;
  bulbEl.style.background = colorCss;
  bulbEl.style.boxShadow = `inset 0 -10px 30px rgba(15, 23, 42, 0.4), 0 18px 45px ${glowCss}`;
}

function calculateProgress() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) {
    return 0;
  }
  const progress = window.scrollY / scrollable;
  return clamp(progress, 0, 1);
}

function handleScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const progress = calculateProgress();
      updateVisuals(progress);
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);

document.addEventListener('DOMContentLoaded', () => {
  updateVisuals(calculateProgress());
});
