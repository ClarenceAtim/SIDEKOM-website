// Entry point: runs on every page.

import { pickInitialLanguage, setLanguage } from "./translator.js";
import { setupLanguagePicker } from "./language-picker.js";
import { setupMobileMenu } from "./mobile-menu.js";
import { setupScrollEffects } from "./scroll-effects.js";
import { setupSiteLinks } from "./site-links.js";
import { setupContactForm } from "./contact-form.js";

async function start() {
  await setLanguage(pickInitialLanguage(), { remember: false });
  setupLanguagePicker();
  setupMobileMenu();
  setupScrollEffects();
  setupSiteLinks();
  setupContactForm();
}

start();
