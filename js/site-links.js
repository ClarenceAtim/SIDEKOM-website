// Shows e-mail, phone, WhatsApp and booking links only when they are filled in js/settings.js.

import { settings } from "./settings.js";

// "+237655111495" becomes "+237 655 111 495" (country code, then groups of three digits).
export function formatPhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits.slice(0, 3)} ${digits.slice(3).replace(/(\d{3})(?=\d)/g, "$1 ")}`;
}

export function setupSiteLinks() {
  const targets = {
    email: settings.email && `mailto:${settings.email}`,
    phone: settings.phone && `tel:+${settings.phone.replace(/\D/g, "")}`,
    whatsapp: settings.whatsappNumber && `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`,
  };

  document.querySelectorAll("[data-link]").forEach((link) => {
    const href = targets[link.dataset.link];
    if (!href) return;
    link.href = href;
    if (href.startsWith("http")) { link.target = "_blank"; link.rel = "noopener"; }
    if (link.hasAttribute("data-show-value")) link.textContent = settings.email;
    link.hidden = false;
  });

  document.querySelectorAll("[data-phone-number]").forEach((el) => { el.textContent = formatPhone(settings.phone); });

  // "Book an appointment" buttons: they lead to the calendar on the contact page (#booking),
  // so they only appear once bookingUrl is set.
  document.querySelectorAll("[data-booking-cta]").forEach((link) => { link.hidden = !settings.bookingUrl; });

  document.querySelectorAll("[data-social]").forEach((link) => {
    const href = settings.social && settings.social[link.dataset.social];
    if (!href) return;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
  });

  document.querySelectorAll("[data-current-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}
