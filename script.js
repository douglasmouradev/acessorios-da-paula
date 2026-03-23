const progress = document.getElementById("scroll-progress");
const topbar = document.getElementById("topbar");
const sections = document.querySelectorAll(".section-reveal");
const glow = document.getElementById("cursor-glow");
const backTop = document.getElementById("back-top");
const styleLab = document.getElementById("style-lab");
const lookMeterFill = document.getElementById("look-meter-fill");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const dressLayer = document.querySelector('[data-scroll-layer="dress"]');
const jacketLayer = document.querySelector('[data-scroll-layer="jacket"]');
const bagLayer = document.querySelector('[data-scroll-layer="bag"]');
const necklaceLayer = document.querySelector('[data-scroll-layer="necklace"]');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mix(start, end, progressValue) {
  return start + (end - start) * progressValue;
}

function updateStyleLabByScroll() {
  if (!styleLab || !lookMeterFill) {
    return;
  }

  const rect = styleLab.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  const rawProgress = (viewport - rect.top) / (viewport + rect.height * 0.45);
  const progressValue = clamp(rawProgress, 0, 1);

  lookMeterFill.style.width = `${Math.round(progressValue * 100)}%`;

  dressLayer.style.opacity = clamp(progressValue * 2.2, 0, 1);
  dressLayer.style.transform = `translateX(-50%) translateY(${mix(36, 0, clamp(progressValue * 1.9, 0, 1))}px)`;

  jacketLayer.style.opacity = clamp((progressValue - 0.22) * 2.1, 0, 1);
  jacketLayer.style.transform = `translateX(-50%) translateY(${mix(-24, 0, clamp((progressValue - 0.22) * 1.9, 0, 1))}px)`;

  bagLayer.style.opacity = clamp((progressValue - 0.5) * 2.5, 0, 1);
  bagLayer.style.transform = `translateX(${mix(-6, 26, clamp((progressValue - 0.5) * 2.2, 0, 1))}px) rotate(${mix(-18, 8, clamp((progressValue - 0.5) * 2.2, 0, 1))}deg)`;

  const necklaceBase = 35;
  necklaceLayer.style.opacity = clamp((progressValue - 0.72) * 3.5, 0, 1);
  necklaceLayer.style.transform = `translateX(-50%) rotate(${mix(necklaceBase + 22, necklaceBase, clamp((progressValue - 0.72) * 3.2, 0, 1))}deg)`;
}

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  progress.style.width = `${scrolled}%`;
  topbar.classList.toggle("scrolled", scrollTop > 20);
  backTop.classList.toggle("visible", scrollTop > 420);
  updateStyleLabByScroll();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

sections.forEach((section) => observer.observe(section));

window.addEventListener("scroll", updateScrollUI);
window.addEventListener("load", updateScrollUI);
window.addEventListener("resize", updateScrollUI);

window.addEventListener("mousemove", (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

backTop.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

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
