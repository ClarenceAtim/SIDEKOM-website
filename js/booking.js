// Contact page: shows the booking calendar (#booking) once bookingUrl is set in js/settings.js.

import { settings } from "./settings.js";

// Cal.com only draws its calendar inside a frame when the address asks for the "embed" version.
function embedAddress(link) {
  const url = new URL(link);
  url.searchParams.set("embed", "true");
  url.searchParams.set("layout", "month_view");
  return url.href;
}

export function setupBooking() {
  const section = document.querySelector("[data-booking]");
  if (!section || !settings.bookingUrl) return;

  const frame = section.querySelector("[data-booking-frame]");
  frame.src = embedAddress(settings.bookingUrl);
  section.querySelector("[data-booking-link]").href = settings.bookingUrl;
  section.hidden = false;

  // The calendar tells the page how tall it is, so the frame grows to show it all (no scrolling inside the frame).
  const origin = new URL(settings.bookingUrl).origin;
  window.addEventListener("message", (event) => {
    if (event.origin !== origin || event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || data.originator !== "CAL" || data.type !== "__dimensionChanged") return;
    const height = Number(data.data && data.data.iframeHeight);
    if (height >= 300 && height <= 3000) frame.style.height = `${Math.ceil(height)}px`;
  });

  // The section was hidden when the browser tried to jump to #booking, so jump again now.
  if (location.hash === "#booking") section.scrollIntoView();
}
