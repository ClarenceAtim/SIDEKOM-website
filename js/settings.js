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
  // Submissions POST as JSON to the Vercel serverless function in /api/contact.js,
  // which emails them to CONTACT_TO_EMAIL via Resend (free tier).
  // Needs RESEND_API_KEY set in Vercel env vars — see .env.example.
  // Free alternative: create a form on https://formspree.io and paste its URL, e.g. "https://formspree.io/f/abcdwxyz"
  // While this stays empty, the form opens the visitor's email app instead (see `email` below).
  formEndpoint: "/api/contact",

  // Contact details. Anything left empty is simply hidden on the site.
  email: "Contact@sidekom.com",      // shown in footer + contact page; receives form submissions
  phone: "+237655111495",          // with "+" and country code; shown on the site as +237 655 111 495
  whatsappNumber: "237655111495",  // digits only, with country code, no "+"

  // Online appointments (video call). While this stays empty, every "Book an appointment" button is hidden.
  // Paste your Cal.com link here, for example https://cal.com/your-name/appel-video-sidekom
  bookingUrl: "https://cal.com/sidekom/appel-video-sidekom",

  // Admin panel (Sanity): the site reads published articles, events and testimonials from here.
  // These values are public, not passwords. With projectId empty, the blog uses data/blog-posts.json.
  // Keep projectId and dataset identical to studio/project.js.
  sanity: { projectId: "l6wnod0y", dataset: "production", apiVersion: "2025-01-01" },

  // Social media pages (public addresses). Leave a line empty to hide that icon.
  social: {
    facebook: "https://www.facebook.com/profile.php?id=100076294870835",
    linkedin: "https://www.linkedin.com/company/145301602/",
    x: "https://x.com/sidekomdigital",
  },
};