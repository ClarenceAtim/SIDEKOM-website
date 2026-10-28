// Small visual touches: header shadow on scroll, fade-in of sections, current page in the menu.

export function setupScrollEffects() {
  const header = document.querySelector("[data-site-header]");
  if (header) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  } else {
    items.forEach((item) => item.classList.add("is-visible"));
  }

  const path = location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  const pages = { "/": "home", "/services": "services", "/events": "events", "/packs": "packs", "/about": "about", "/contact": "contact" };
  const current = pages[path.length > 1 ? path.replace(/\/$/, "") : path];
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === current) link.setAttribute("aria-current", "page");
  });
}
