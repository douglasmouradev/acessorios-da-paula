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

const cinemaSpacer = document.getElementById("scroll-cinema-spacer");
const cinemaPanels = document.querySelectorAll(".cinema-panel");
const cinemaTitle = document.getElementById("cinema-title");
const cinemaDesc = document.getElementById("cinema-desc");
const cinemaStep = document.getElementById("cinema-step");
const cinemaBarFill = document.getElementById("cinema-bar-fill");

const lookbookPin = document.getElementById("lookbook-pin");
const lookbookTrack = document.getElementById("lookbook-track");

const dressLayer = document.querySelector('[data-scroll-layer="dress"]');
const jacketLayer = document.querySelector('[data-scroll-layer="jacket"]');
const bagLayer = document.querySelector('[data-scroll-layer="bag"]');
const necklaceLayer = document.querySelector('[data-scroll-layer="necklace"]');

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cinemaCopy = [
  {
    title: "Vestidos que vestem o momento",
    desc: "Midi, longo e festa — cada modelo entra em cena conforme você rola, com profundidade e movimento suave.",
    step: "01",
  },
  {
    title: "Conjuntos prontos para sair",
    desc: "Looks completos deslizam para frente no eixo 3D. A tela fica fixa; o scroll dirige a transição.",
    step: "02",
  },
  {
    title: "Acessórios que fecham o visual",
    desc: "Bolsas e semijoias em destaque. Painéis anteriores recuam no espaço — efeito de passarela digital.",
    step: "03",
  },
];

const smooth = {
  cinema: 0,
  lookbook: 0,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mix(start, end, t) {
  return start + (end - start) * t;
}

function lerp(current, target, amount) {
  return current + (target - current) * amount;
}

function getScrollProgress(element, startRatio = 0.88, endRatio = 0.12) {
  const rect = element.getBoundingClientRect();
  const vh = window.innerHeight;
  const start = vh * startRatio;
  const end = vh * endRatio;
  return clamp((start - rect.top) / (start - end + element.offsetHeight * 0.35), 0, 1);
}

function getPinnedProgress(spacer) {
  const rect = spacer.getBoundingClientRect();
  const scrollable = spacer.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  const traveled = clamp(-rect.top, 0, scrollable);
  return traveled / scrollable;
}

function updateScrollCinema() {
  if (!cinemaSpacer || prefersReducedMotion || !cinemaPanels.length) return;

  const target = getPinnedProgress(cinemaSpacer);
  smooth.cinema = lerp(smooth.cinema, target, 0.12);
  const p = smooth.cinema;
  const panelCount = cinemaPanels.length;
  const activeIndex = clamp(Math.floor(p * panelCount * 0.999), 0, panelCount - 1);
  const copy = cinemaCopy[activeIndex];

  if (cinemaTitle) cinemaTitle.textContent = copy.title;
  if (cinemaDesc) cinemaDesc.textContent = copy.desc;
  if (cinemaStep) cinemaStep.textContent = copy.step;
  if (cinemaBarFill) cinemaBarFill.style.transform = `scaleX(${p})`;

  cinemaPanels.forEach((panel, i) => {
    const offset = p * (panelCount - 1) - i;
    const abs = Math.abs(offset);
    const rotateY = offset * -48;
    const rotateX = abs * 8;
    const translateZ = 80 - abs * 200;
    const translateX = offset * 130;
    const scale = mix(1, 0.82, clamp(abs, 0, 1));
    const opacity = mix(1, 0.35, clamp(abs * 0.85, 0, 1));
    const blur = abs > 0.35 ? `blur(${abs * 3}px)` : "none";

    panel.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;
    panel.style.opacity = opacity;
    panel.style.filter = blur;
    panel.style.zIndex = String(100 - Math.round(abs * 10));
  });
}

function updateLookbookScroll() {
  if (!lookbookPin || !lookbookTrack || prefersReducedMotion) return;

  const p = getScrollProgress(lookbookPin, 0.92, 0.08);
  smooth.lookbook = lerp(smooth.lookbook, p, 0.1);

  const trackWidth = lookbookTrack.scrollWidth - lookbookPin.clientWidth;
  const offset = trackWidth > 0 ? -trackWidth * smooth.lookbook : 0;

  lookbookTrack.style.transform = `translateX(${offset}px)`;

  lookbookTrack.querySelectorAll(".look-card").forEach((card, i) => {
    const cardOffset = (i / 2 - smooth.lookbook) * 0.5;
    const cardRotate = cardOffset * 6;
    card.style.transform = `rotateY(${cardRotate}deg)`;
  });
}

function updateScroll3D() {
  if (prefersReducedMotion) return;

  sceneBlocks.forEach((block) => {
    if (block.classList.contains("scene-block--static")) {
      block.style.transform = "none";
      return;
    }

    const depth = parseFloat(block.dataset.depth || "0.3");
    const p = getScrollProgress(block);
    const enter = clamp(p * 1.15, 0, 1);
    const rotateX = mix(10, 0, enter);
    const translateZ = mix(-60, 0, enter);
    const translateY = mix(28, 0, enter);
    const scale = mix(0.97, 1, enter);

    block.style.transform = `rotateX(${rotateX * depth}deg) translateZ(${translateZ * depth}px) translateY(${translateY * (1 - depth * 0.5)}px) scale(${scale})`;
  });

  cards3d.forEach((card) => {
    if (card.closest(".scroll-cinema-sticky, .lookbook, .contact-block")) return;

    const p = getScrollProgress(card);
    const tilt = card.dataset.tilt === "medium" ? 10 : 6;
    const rotateY = mix(-tilt, tilt, p);
    const rotateX = mix(8, -3, p);
    const scale = mix(0.9, 1, clamp(p * 1.25, 0, 1));

    if (p > 0.1 && p < 0.92) card.classList.add("is-visible");

    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale}) translateZ(${mix(-40, 50, p)}px)`;
  });

  if (modelStage && styleLab) {
    const labProgress = getScrollProgress(styleLab);
    const stageTilt = mix(-16, 10, labProgress);
    modelStage.style.transform = `rotateY(${stageTilt}deg) rotateX(${mix(6, -3, labProgress)}deg) scale(${mix(0.96, 1.02, labProgress)})`;
  }
}

function updateStyleLabByScroll() {
  if (!styleLab || !lookMeterFill) return;

  const progressValue = getScrollProgress(styleLab);
  const pct = Math.round(progressValue * 100);

  lookMeterFill.style.width = `${pct}%`;
  if (lookMeterText) lookMeterText.textContent = `${pct}%`;

  styleSteps.forEach((step, i) => {
    const threshold = (i + 1) / 3;
    step.classList.toggle("active", progressValue >= threshold - 0.15);
  });

  if (!dressLayer || !jacketLayer || !bagLayer || !necklaceLayer) return;

  dressLayer.style.opacity = clamp(progressValue * 2.5, 0, 1);
  dressLayer.style.transform = `translateX(-50%) translateZ(${mix(-60, 40, clamp(progressValue * 2, 0, 1))}px) translateY(${mix(50, 0, clamp(progressValue * 2, 0, 1))}px) rotateY(${mix(20, 0, clamp(progressValue * 2, 0, 1))}deg)`;

  jacketLayer.style.opacity = clamp((progressValue - 0.2) * 2.2, 0, 1);
  jacketLayer.style.transform = `translateX(-50%) translateZ(${mix(-40, 55, clamp((progressValue - 0.2) * 2, 0, 1))}px) translateY(${mix(-28, 0, clamp((progressValue - 0.2) * 2, 0, 1))}px) rotateY(${mix(-15, 0, clamp((progressValue - 0.2) * 2, 0, 1))}deg)`;

  bagLayer.style.opacity = clamp((progressValue - 0.45) * 2.5, 0, 1);
  bagLayer.style.transform = `translateX(${mix(-60, 50, clamp((progressValue - 0.45) * 2.2, 0, 1))}px) translateZ(${mix(-30, 70, clamp((progressValue - 0.45) * 2.2, 0, 1))}px) rotate(${mix(-24, 8, clamp((progressValue - 0.45) * 2.2, 0, 1))}deg)`;

  const necklaceBase = 35;
  necklaceLayer.style.opacity = clamp((progressValue - 0.68) * 3.2, 0, 1);
  necklaceLayer.style.transform = `translateX(-50%) translateZ(${mix(-15, 35, clamp((progressValue - 0.68) * 3, 0, 1))}px) rotate(${mix(necklaceBase + 20, necklaceBase, clamp((progressValue - 0.68) * 3, 0, 1))}deg)`;
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

  updateScrollCinema();
  updateLookbookScroll();
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

function animationLoop() {
  if (!prefersReducedMotion) {
    updateScrollCinema();
    updateLookbookScroll();
  }
  requestAnimationFrame(animationLoop);
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateScrollUI);
window.addEventListener("load", updateScrollUI);

if (!prefersReducedMotion) {
  requestAnimationFrame(animationLoop);
}

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
    heroVisual.style.transform = `rotateX(${y * -6}deg) rotateY(${x * 8}deg) scale(1.02) translateZ(30px)`;
  });

  heroVisual.addEventListener("mouseleave", () => {
    heroVisual.style.transform = "";
  });
}
