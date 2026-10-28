// Site settings. This is the only file you need to edit to connect the site to the outside world.

export const settings = {
  // Languages offered in the dropdown. The first one is the default.
  // To add a language: create languages/xx.json, add it here AND in the list inside partials/head-common.html.
  languages: [
    { code: "fr", label: "Français", short: "FR" },
    { code: "en", label: "English", short: "EN" },
    { code: "es", label: "Español", short: "ES" },
    { code: "pt", label: "Português", short: "PT" },
    { code: "ar", label: "العربية", short: "AR", direction: "rtl" },
  ],
  defaultLanguage: "fr",
  storageKey: "sidekom-language",

  // Contact form.
  // 1. Free option: create a form on https://formspree.io and paste its URL, e.g. "https://formspree.io/f/abcdwxyz"
  // 2. Later: use your own endpoint, e.g. "/api/contact" (sent as JSON).
  // While this stays empty, the form opens the visitor's email app instead (see `email` below).
  formEndpoint: "",

  // Contact details. Anything left empty is simply hidden on the site.
  email: "",              // e.g. "contact@sidekom.com"
  whatsappNumber: "",     // digits only, with country code, e.g. "237600000000"
  bookingUrl: "",         // e.g. a Calendly or Google Calendar booking page
};
