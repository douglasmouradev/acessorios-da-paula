const progress = document.getElementById("scroll-progress");
const topbar = document.getElementById("topbar");
const backTop = document.getElementById("back-top");
const styleLab = document.getElementById("style-lab");
const modelStage = document.getElementById("model-stage");
const lookMeterFill = document.getElementById("look-meter-fill");
const lookMeterText = document.getElementById("look-meter-text");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const sceneBlocks = document.querySelectorAll(".scene-block");
const cards3d = document.querySelectorAll(".card-3d");
const styleSteps = document.querySelectorAll(".style-steps li");

const dressLayer = document.querySelector('[data-scroll-layer="dress"]');
const jacketLayer = document.querySelector('[data-scroll-layer="jacket"]');
const bagLayer = document.querySelector('[data-scroll-layer="bag"]');
const necklaceLayer = document.querySelector('[data-scroll-layer="necklace"]');

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mix(start, end, t) {
  return start + (end - start) * t;
}

function getSectionProgress(element) {
  const rect = element.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * 0.85;
  const end = vh * 0.15;
  return clamp((start - rect.top) / (start - end + rect.height * 0.3), 0, 1);
}

function updateScroll3D() {
  if (prefersReducedMotion) return;

  sceneBlocks.forEach((block) => {
    const depth = parseFloat(block.dataset.depth || "0.3");
    const p = getSectionProgress(block);
    const rotateX = mix(14, -6, p);
    const translateZ = mix(-80, 40, p);
    const translateY = mix(60, -20, p);
    block.style.transform = `rotateX(${rotateX * depth}deg) translateZ(${translateZ * depth}px) translateY(${translateY * (1 - depth)}px)`;
  });

  cards3d.forEach((card) => {
    const p = getSectionProgress(card);
    const tilt = card.dataset.tilt === "medium" ? 8 : 5;
    const rotateY = mix(-tilt, tilt, p);
    const rotateX = mix(6, -4, p);
    const scale = mix(0.94, 1, clamp(p * 1.2, 0, 1));

    if (p > 0.08 && p < 0.95) {
      card.classList.add("is-visible");
    }

    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale}) translateZ(${mix(-20, 30, p)}px)`;
  });

  if (modelStage && styleLab) {
    const labProgress = getSectionProgress(styleLab);
    const stageTilt = mix(-12, 8, labProgress);
    modelStage.style.transform = `rotateY(${stageTilt}deg) rotateX(${mix(4, -2, labProgress)}deg)`;
  }
}

function updateStyleLabByScroll() {
  if (!styleLab || !lookMeterFill) return;

  const progressValue = getSectionProgress(styleLab);
  const pct = Math.round(progressValue * 100);

  lookMeterFill.style.width = `${pct}%`;
  if (lookMeterText) lookMeterText.textContent = `${pct}%`;

  styleSteps.forEach((step, i) => {
    const threshold = (i + 1) / 3;
    step.classList.toggle("active", progressValue >= threshold - 0.15);
  });

  if (!dressLayer || !jacketLayer || !bagLayer || !necklaceLayer) return;

  dressLayer.style.opacity = clamp(progressValue * 2.5, 0, 1);
  dressLayer.style.transform = `translateX(-50%) translateZ(${mix(-40, 20, clamp(progressValue * 2, 0, 1))}px) translateY(${mix(40, 0, clamp(progressValue * 2, 0, 1))}px)`;

  jacketLayer.style.opacity = clamp((progressValue - 0.2) * 2.2, 0, 1);
  jacketLayer.style.transform = `translateX(-50%) translateZ(${mix(-30, 35, clamp((progressValue - 0.2) * 2, 0, 1))}px) translateY(${mix(-20, 0, clamp((progressValue - 0.2) * 2, 0, 1))}px)`;

  bagLayer.style.opacity = clamp((progressValue - 0.45) * 2.5, 0, 1);
  bagLayer.style.transform = `translateX(${mix(-50, 40, clamp((progressValue - 0.45) * 2.2, 0, 1))}px) translateZ(${mix(-20, 50, clamp((progressValue - 0.45) * 2.2, 0, 1))}px) rotate(${mix(-20, 6, clamp((progressValue - 0.45) * 2.2, 0, 1))}deg)`;

  const necklaceBase = 35;
  necklaceLayer.style.opacity = clamp((progressValue - 0.68) * 3.2, 0, 1);
  necklaceLayer.style.transform = `translateX(-50%) translateZ(${mix(-10, 25, clamp((progressValue - 0.68) * 3, 0, 1))}px) rotate(${mix(necklaceBase + 18, necklaceBase, clamp((progressValue - 0.68) * 3, 0, 1))}deg)`;
}

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progress) progress.style.width = `${scrolled}%`;
  if (topbar) topbar.classList.toggle("scrolled", scrollTop > 24);
  if (backTop) {
    const show = scrollTop > 400;
    backTop.classList.toggle("visible", show);
    backTop.hidden = !show;
  }

  updateScroll3D();
  updateStyleLabByScroll();
}

let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollUI();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateScrollUI);
window.addEventListener("load", updateScrollUI);

if (backTop) {
  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });
}

const heroVisual = document.querySelector(".hero-visual");

if (!prefersReducedMotion && heroVisual) {
  heroVisual.addEventListener("mousemove", (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroVisual.style.transform = `rotateX(${y * -5}deg) rotateY(${x * 7}deg) scale(1.02) translateZ(24px)`;
  });

  heroVisual.addEventListener("mouseleave", () => {
    heroVisual.style.transform = "";
  });
}
