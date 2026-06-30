// ============================================================
// SHOWPAY 2.0 — COMPONENT: SLIDER
// Loads slider_images from Supabase, renders, auto-slides
// ============================================================
import supabase from '../config/supabase.js';
import { TABLES } from '../config/constants.js';

let slides = [];
let current = 0;
let timer = null;

const wrapper = document.getElementById('slider-wrapper');
const dotsEl  = document.getElementById('slider-dots');

export async function initSlider() {
  const { data, error } = await supabase
    .from(TABLES.SLIDER_IMAGES)
    .select('*')
    .eq('is_enabled', true)
    .order('display_order', { ascending: true });

  if (error || !data?.length) return;
  slides = data;
  renderSlider();
  startAutoSlide();
}

function renderSlider() {
  wrapper.innerHTML = '';
  dotsEl.innerHTML = '';

  slides.forEach((slide, i) => {
    // Slide
    const div = document.createElement('div');
    div.className = 'slide';
    div.innerHTML = `<img src="${slide.image_url}" alt="${slide.title}" loading="lazy" />`;
    if (slide.link_url && slide.link_url !== '#') {
      div.style.cursor = 'pointer';
      div.addEventListener('click', () => window.open(slide.link_url, '_blank'));
    }
    wrapper.appendChild(div);

    // Dot
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  goTo(0);
}

function goTo(index) {
  current = index;
  wrapper.style.transform = `translateX(-${current * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

function startAutoSlide() {
  clearInterval(timer);
  timer = setInterval(() => {
    const next = (current + 1) % slides.length;
    goTo(next);
  }, 3500);
}

/** Call this when realtime updates slider data */
export function refreshSlider() {
  initSlider();
}
