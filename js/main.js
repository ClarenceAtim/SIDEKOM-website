// Entry point: runs on every page.
// Code used everywhere is imported here; code for one page only is loaded when that page needs it.

import { pickInitialLanguage, setLanguage } from "./translator.js?v=4454694f";
import { setupLanguagePicker } from "./language-picker.js?v=4454694f";
import { setupMobileMenu } from "./mobile-menu.js?v=4454694f";
import { setupScrollEffects } from "./scroll-effects.js?v=4454694f";
import { setupSiteLinks } from "./site-links.js?v=4454694f";
import { settings } from "./settings.js";

// [element that needs the code, how to load it, function to run]
const pageModules = [
  // Testimonials (home) and events list (events page) exist only once the admin panel is connected
  ...(settings.sanity && settings.sanity.projectId
    ? [["[data-testimonials], [data-events-list]", () => import("./highlights.js?v=4454694f"), "setupHighlights"]]
    : []),
  ["[data-contact-form]", () => import("./contact-form.js?v=4454694f"), "setupContactForm"],
  ["[data-booking]", () => import("./booking.js?v=4454694f"), "setupBooking"],
  ["[data-pack-list]", () => import("./pack-details.js?v=4454694f"), "setupPackDetails"],
  ["[data-blog-list], [data-latest-posts]", () => import("./blog.js?v=4454694f"), "setupBlog"],
  ["[data-article]", () => import("./blog-article.js?v=4454694f"), "setupArticle"],
];

async function start() {
  // Start downloading this page's extra code while the language loads
  const needed = pageModules
    .filter(([selector]) => document.querySelector(selector))
    .map(([, load, name]) => load().then((module) => module[name], (error) => () => console.error(error)));

  await setLanguage(pickInitialLanguage(), { remember: false });
  setupLanguagePicker();
  setupMobileMenu();
  setupScrollEffects();
  setupSiteLinks();

  for (const setup of needed) (await setup)();
}

start();
