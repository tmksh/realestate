const body = document.body;
const toggle = document.querySelector("[data-nav-toggle]");
const links = [...document.querySelectorAll("nav a[href^='#']")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setNavOpen = (open) => {
  body.classList.toggle("nav-open", open);
  toggle?.setAttribute("aria-expanded", open ? "true" : "false");
};

toggle?.addEventListener("click", () => {
  setNavOpen(!body.classList.contains("nav-open"));
});

document.querySelector("[data-nav-close]")?.addEventListener("click", () => {
  setNavOpen(false);
});

links.forEach((link) => {
  link.addEventListener("click", () => setNavOpen(false));
});

const observe = () => {
  const y = window.scrollY + (window.matchMedia("(max-width: 860px)").matches ? 80 : 96);
  let current = sections[0];
  for (const section of sections) {
    if (section.offsetTop <= y) current = section;
  }
  if (!current) return;
  links.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
};

window.addEventListener("scroll", observe, { passive: true });
observe();
