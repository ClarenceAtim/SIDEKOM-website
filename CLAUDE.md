# SIDEKOM website: conventions

- **No build step.** Plain HTML, CSS and ES-module JavaScript. Do not add dependencies, frameworks, bundlers or a build step. Keep human-readable file names.
- **All visible text lives in `languages/*.json`** (`fr` is the source; `en`, `es`, `pt`, `ar` must have the identical key structure). Pages reference text with `data-i18n`, `data-i18n-html`, `data-i18n-list`, `data-i18n-aria`, `data-i18n-content`. Any new text goes into ALL FIVE files. Arabic is right-to-left: use logical CSS properties (`inset-inline-start`, `margin-inline`, ...) and check `css/rtl.css`.
- **Shared blocks** (head, icon sprite, header, footer) live in `partials/` and are copied into every page between `<!-- shared:name -->` markers.
- **After changing text, partials, CSS, JS, language files or images, run:**
  1. `node tools/update-pages.mjs` (copies partials + writes French text into the HTML + stamps `?v=<hash>` on CSS/JS/JSON/image addresses and on JS imports)
  2. `node tools/check-translations.mjs` (all languages must match French; fails if a `?v=` is stale)
- **Caching:** `vercel.json` caches `/css`, `/js`, `/languages`, `/images` for a year (`immutable`), so every reference to those files must carry `?v=` (new imports too: `from "./x.js?v=1"`, the tool fixes the number). Exceptions, never versioned and always revalidated: `js/settings.js` (import it as `"./settings.js"`), `data/`, `images/blog/`.
- **Page-specific JS** is loaded on demand from `js/main.js` (`pageModules`), only when the page has the matching element. Shared modules are `modulepreload`ed in `partials/head-common.html`.
- **Local server:** `npm start` = `node tools/serve.mjs` on http://localhost:3000 (no dependencies, serves pages with and without `.html`, never redirects so query strings survive). Links use `/page.html?...`; never rely on a clean-URL redirect keeping the query string.
- **Settings** (email, WhatsApp, phone, booking link, form endpoint, social links, languages) live only in `js/settings.js`. `js/site-links.js` shows/hides links from these values.
- **Blog posts** come from Sanity (admin panel) when `settings.sanity.projectId` is set and Sanity has published posts, otherwise from `data/blog-posts.json` (samples). Only `js/blog-data.js` knows where posts come from; `js/sanity.js` is the shared read-only client (public CDN API, no token), `js/highlights.js` fills the optional testimonials (home) and events (events.html) sections.
- **Sanity content is untrusted:** build DOM with `createElement`/`textContent` (the `el()` helper), never `innerHTML`; links only http(s)/mailto/tel, external ones with `rel="noopener noreferrer"`.
- **Admin panel** = `studio/` (Sanity Studio, own `package.json`, excluded from Vercel by `.vercelignore`; `studio/node_modules` and `dist` are git-ignored). Its interface text is French. Project ID/dataset must match in `studio/project.js` and `js/settings.js`. Never put a token or password in the repo.
- **Design:** keep the navy and gold style, the existing buttons (`.button--primary`, `--outline`, `--navy`), cards, spacing and `.reveal` scroll animations.
- **Git:** never commit or push without the owner's explicit approval. Show a summary of changed files and wait for review.
