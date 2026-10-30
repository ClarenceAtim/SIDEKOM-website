# SIDEKOM website

Multilingual (FR, EN, ES, PT, AR) multi-page site. Plain HTML, CSS and JavaScript: no build step, nothing to install.

## View the site on your computer
To view the site locally run npm start and open http://localhost:3000

(`npm start` needs Node.js, nothing else to install. Stop it with Ctrl+C. If it says port 3000 is in use, close the other window that is already running the site.)

Other ways that also work:
- VS Code "Live Server" extension: right-click `index.html` > Open with Live Server.
- `npx serve .` (its settings are in `serve.json`, which keeps `?slug=` and `?pack=` in the address).

Double-clicking an HTML file does not work: the site needs a local server.

## Where things are
- `index.html`, `services.html`, `events.html`, `packs.html`, `blog.html`, `article.html`, `about.html`, `contact.html`, `404.html`: the pages
- `data/blog-posts.json`: the blog articles (see "How to add a blog article")
- `languages/`: ALL the text, one file per language (`fr.json`, `en.json`...). Edit text and prices here.
- `partials/`: header, footer, shared head and icons (written once, copied into each page)
- `css/`: one file per area (header, hero, packs...). Colors are in `css/theme.css`.
- `js/settings.js`: email, phone, WhatsApp, booking link (Cal.com), form service, social links, language list
- `images/`: logo and favicons. The logos are saved at twice their size on screen (`.webp`, with a `.png` copy for old browsers). If you change a logo, export it about 400 px wide (header) and 440 px wide (white footer logo), not larger.
- `tools/`: the update, check and local server scripts
- `studio/`: the admin panel (Sanity Studio), see "Administration (Sanity)"
- `docs/guide-administration.md`: how to use the admin panel, in French, for the team

## After changing text, shared parts, CSS, JavaScript or images
Run `node tools/update-pages.mjs` (copies partials and French text into the pages, and updates the `?v=...` number after CSS/JS/image addresses), then
`node tools/check-translations.mjs` to confirm every language has the same keys and the `?v=` numbers are current.

Why the `?v=` number matters: visitors' browsers keep CSS, JavaScript, language files and images for a year (that makes the site fast). A new number tells them to download the changed file. `js/settings.js`, `data/blog-posts.json` and blog pictures are always re-checked, so changes to those show without this step.
When you replace a blog picture, give the new file a new name.

## Administration (Sanity)
The team writes articles, events and testimonials in the admin panel **SIDEKOM - Administration** (Sanity Studio, free plan). The panel is hosted by Sanity on `https://<name>.sanity.studio`, not on Vercel. The website reads published content directly from Sanity in the visitor's browser, so a new article appears on the site within about a minute, with no redeploy. A guide in French for the team: `docs/guide-administration.md`.

- **Where things are:** the panel's code is in `studio/` (its own `package.json`, never deployed to Vercel, see `.vercelignore`). The content models are in `studio/schemaTypes/`, the left menu is in `studio/structure.js`.
- **Project settings:** the project ID and dataset are public values (not secrets). They are written twice and must match: `studio/project.js` (for the panel) and `sanity` in `js/settings.js` (for the website). No token or password is used anywhere.
- **Run the panel on your computer:** `cd studio`, `npm install` (first time only), then `npm run dev` and open http://localhost:3333.
- **Put the panel online (after changing `studio/`):** `cd studio` then `npx sanity deploy`. The address is set by `studioHost` in `studio/sanity.cli.js`.
- **Invite someone:** `cd studio` then `npx sanity users invite their@email.com --role editor`, or on https://www.sanity.io/manage: choose the project, then Members, then Invite members, with the role Editor.
- **Allow a new website address (CORS):** the site can only read Sanity from addresses on the list. Add one with `cd studio` then `npx sanity cors add https://www.your-domain.com --no-credentials`, or on https://www.sanity.io/manage: the project, then API, then CORS origins, then Add CORS origin (leave "Allow credentials" unticked). Add the real domain when the site goes live.
- **What the site shows:** the published articles whose publication date has come (a future date schedules the article). If Sanity has no article, or cannot be reached, the blog shows the sample articles from `data/blog-posts.json`, so it is never empty. Testimonials (home page) and events (events page) only appear when there are some in Sanity.
- **Go back to the JSON file only:** in `js/settings.js`, set `projectId: ""` in `sanity`. The blog then reads `data/blog-posts.json` (see below), and the testimonials and events sections stay hidden.

## How to add a blog article without the admin panel
These articles are only used when the admin panel is not connected or has no article (see "Administration (Sanity)").
All articles are in one file: `data/blog-posts.json`. You do not need to touch any page.

1. Open `data/blog-posts.json` in VS Code.
2. Copy a whole existing article, from its opening `{` to its closing `},` and paste it at the top of the list (just after the first `[`).
3. Change these lines in your copy:
   - `"slug"`: the article's address, in lower case with dashes, e.g. `"reussir-son-salon-professionnel"`. It must be different from every other article. The article will open at `/article.html?slug=reussir-son-salon-professionnel`.
   - `"date"`: the publication date as year-month-day, e.g. `"2026-11-15"`. The newest articles are shown first.
   - `"category"`: one of `"community-management"`, `"communication"`, `"events"`, `"digital-marketing"`.
   - `"image"` (optional): put a picture (landscape, about 1200 x 675 px) in the `images/blog/` folder and write its path, e.g. `"/images/blog/salon.jpg"`. Leave `""` for no picture.
   - Remove the line `"sample": true,` (it only marks the three example articles, so you can find and replace them).
4. In `"translations"`, write the text for each language (`fr`, `en`, `es`, `pt`, `ar`): a `title`, a short `excerpt` (shown on the cards) and the `content`. The content is a list of blocks:
   - `{ "type": "paragraph", "text": "..." }` for a paragraph
   - `{ "type": "heading", "text": "..." }` for a sub-title
   - `{ "type": "list", "items": ["...", "..."] }` for a bullet list
   French is required. If you leave out a language, visitors in that language see the French text with a short note.
5. Save, then run `node tools/check-translations.mjs`: it tells you if a comma, a date or a category is wrong.

Tip: a missing or extra comma is the most common mistake. VS Code underlines it in red.

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
