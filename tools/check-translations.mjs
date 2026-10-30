// Run with:  node tools/check-translations.mjs
// Checks that every language file has exactly the same keys as French (and the same number of list items),
// that every text key used by the pages and scripts exists, that data/blog-posts.json is valid,
// and that the pages carry the current file version (?v=...).

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { siteVersion, versionPattern } from "./version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const load = (code) => JSON.parse(readFileSync(join(root, "languages", `${code}.json`), "utf8"));

function flatten(value, prefix = "", out = {}) {
  if (Array.isArray(value)) out[prefix] = `list:${value.length}`;
  else if (value && typeof value === "object") Object.entries(value).forEach(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k, out));
  else out[prefix] = "text";
  return out;
}

const reference = flatten(load("fr"));
let problems = 0;

for (const code of ["en", "es", "pt", "ar"]) {
  const other = flatten(load(code));
  for (const key of Object.keys(reference)) {
    if (!(key in other)) { console.log(`${code}: missing ${key}`); problems++; }
    else if (other[key] !== reference[key]) { console.log(`${code}: ${key} is ${other[key]}, expected ${reference[key]}`); problems++; }
  }
  for (const key of Object.keys(other)) {
    if (!(key in reference)) { console.log(`${code}: extra ${key}`); problems++; }
  }
}

// Every text key used in the pages (data-i18n...) and in the scripts (translate("...")) must exist in French.
const french = load("fr");
const has = (key) => key.split(".").reduce((node, part) => (node ? node[part] : undefined), french) !== undefined;
const sources = [
  ...readdirSync(root).filter((file) => file.endsWith(".html")),
  ...readdirSync(join(root, "js")).filter((file) => file.endsWith(".js")).map((file) => `js/${file}`),
];
for (const file of sources) {
  const text = readFileSync(join(root, file), "utf8");
  const keys = [...text.matchAll(/data-i18n(?:-html|-list|-aria|-content)?="([^"]+)"/g), ...text.matchAll(/translate\("([^"]+)"\)/g)].map((match) => match[1]);
  for (const key of new Set(keys)) {
    if (!has(key)) { console.log(`${file}: uses ${key}, missing in fr.json`); problems++; }
  }
}

// Blog posts (data/blog-posts.json): required fields, known category, French version present.
// A missing translation in another language is only a note: the site then shows the French text.
const categories = Object.keys(french.blog.categories);
const posts = JSON.parse(readFileSync(join(root, "data", "blog-posts.json"), "utf8"));
const slugs = new Set();
posts.forEach((post, index) => {
  const name = post.slug || `post #${index + 1}`;
  const fail = (message) => { console.log(`blog ${name}: ${message}`); problems++; };
  if (!/^[a-z0-9-]+$/.test(post.slug || "")) fail("slug must use only a-z, 0-9 and dashes");
  if (slugs.has(post.slug)) fail("slug is used twice");
  slugs.add(post.slug);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date || "")) fail("date must look like 2026-01-31");
  if (!categories.includes(post.category)) fail(`category must be one of: ${categories.join(", ")}`);
  if (post.image && !existsSync(join(root, post.image))) fail(`image not found: ${post.image}`);
  for (const code of ["fr", "en", "es", "pt", "ar"]) {
    const text = post.translations && post.translations[code];
    if (!text) { if (code === "fr") fail("French version is required"); else console.log(`blog ${name}: no ${code} version (French will be shown)`); continue; }
    if (!text.title || !text.excerpt || !Array.isArray(text.content)) fail(`${code} needs title, excerpt and content`);
    else text.content.forEach((block) => {
      const ok = (["paragraph", "heading", "quote"].includes(block.type) && block.text) || (block.type === "list" && Array.isArray(block.items));
      if (!ok) fail(`${code} has an unknown content block: ${JSON.stringify(block).slice(0, 60)}`);
    });
  }
});

// Every ?v= in the pages, partials and scripts must be the current version, or visitors keep old CSS/JS.
const version = siteVersion(root);
for (const file of [...sources, ...readdirSync(join(root, "partials")).map((file) => `partials/${file}`)]) {
  const text = readFileSync(join(root, file), "utf8");
  const stale = [...text.matchAll(versionPattern)].filter((match) => match[0] !== `${match[1]}?v=${version}`);
  if (stale.length) { console.log(`${file}: old version (${stale[0][0]}), run node tools/update-pages.mjs`); problems++; }
}

console.log(problems ? `\n${problems} problem(s) found.` : `All languages match French. ${posts.length} blog post(s) checked. Version ${version} is up to date.`);
process.exitCode = problems ? 1 : 0;
