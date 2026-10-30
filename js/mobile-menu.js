// Hamburger menu for small screens.

import { translate } from "./translator.js?v=4454694f";

export function setupMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) return;


  function setOpen(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-label", translate(isOpen ? "a11y.menuClose" : "a11y.menuOpen") || "Menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1061px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
