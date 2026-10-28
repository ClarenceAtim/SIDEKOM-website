// Shows e-mail, WhatsApp and booking links only when they are filled in js/settings.js.

import { settings } from "./settings.js";

export function setupSiteLinks() {
  const targets = {
    email: settings.email && `mailto:${settings.email}`,
    whatsapp: settings.whatsappNumber && `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`,
    booking: settings.bookingUrl,
  };

  document.querySelectorAll("[data-link]").forEach((link) => {
    const href = targets[link.dataset.link];
    if (!href) return;
    link.href = href;
    if (href.startsWith("http")) { link.target = "_blank"; link.rel = "noopener"; }
    if (link.hasAttribute("data-show-value")) link.textContent = settings.email;
    link.hidden = false;
  });

  document.querySelectorAll("[data-current-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}
