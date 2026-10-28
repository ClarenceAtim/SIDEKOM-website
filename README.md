# SIDEKOM website

Multilingual (FR, EN, ES, PT, AR) multi-page site. Plain HTML, CSS and JavaScript: no build step, nothing to install.

## Open it in VS Code
1. Unzip, then File > Open Folder.
2. Install the "Live Server" extension, right-click `index.html` > Open with Live Server.
   (Double-clicking the file will not work: the site needs a local server.)

## Where things are
- `index.html`, `services.html`, `events.html`, `packs.html`, `about.html`, `contact.html`, `404.html`: the pages
- `languages/`: ALL the text, one file per language (`fr.json`, `en.json`...). Edit text and prices here.
- `partials/`: header, footer, shared head and icons (written once, copied into each page)
- `css/`: one file per area (header, hero, packs...). Colors are in `css/theme.css`.
- `js/settings.js`: email, WhatsApp, booking link, form service, language list
- `images/`: logo and favicons

## After changing text or shared parts
Run `node tools/update-pages.mjs` (copies partials and French text into the pages), then
`node tools/check-translations.mjs` to confirm every language has the same keys.

## Connect the contact form (free)
Create a form on formspree.io and paste its URL in `formEndpoint` in `js/settings.js`.
Without it, the form opens the visitor's email app (needs `email` filled in).

## Deploy on Vercel
Push to GitHub, import in Vercel, Framework Preset "Other", no build command, no output directory.
Before launch: replace `https://votre-domaine.com` in `partials/head-common.html` and `robots.txt`, then run the update command.

## Adding a backend later
Create an `api/` folder (e.g. `api/contact.js`); Vercel deploys it automatically. Then set `formEndpoint: "/api/contact"`.
Suggested free database the team can manage: Airtable or Google Sheets.

## Add a language
Copy `languages/en.json` to `languages/xx.json`, translate it, add it to `js/settings.js` and to the list in `partials/head-common.html`.
