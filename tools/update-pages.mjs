// Run with:  node tools/update-pages.mjs
// 1. Copies the shared blocks (head, icons, header, footer) from /partials into every page.
// 2. Writes the French text from languages/fr.json into the pages (good for Google and first display).
// 3. Updates the version (?v=...) after CSS, JS, language and image addresses. Browsers keep these files
//    for a year (see vercel.json); a new version makes them download the changed files.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { siteVersion, versionPattern } from "./version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const french = JSON.parse(readFileSync(join(root, "languages", "fr.json"), "utf8"));
const read = (path) => readFileSync(join(root, path), "utf8").trim();

const version = siteVersion(root);
const stamp = (text) => text.replace(versionPattern, `$1?v=${version}`);

function stampFile(path) {
  const before = readFileSync(path, "utf8");
  const after = stamp(before);
  if (after !== before) writeFileSync(path, after);
}
for (const file of readdirSync(join(root, "js")).filter((name) => name.endsWith(".js"))) stampFile(join(root, "js", file));
for (const file of readdirSync(join(root, "partials")).filter((name) => name.endsWith(".html"))) stampFile(join(root, "partials", file));

const partials = {
  head: read("partials/head-common.html"),
  icons: read("partials/icon-sprite.html"),
  header: read("partials/header.html"),
  footer: read("partials/footer.html"),
};

const lookup = (key) => key.split(".").reduce((node, part) => (node ? node[part] : undefined), french);
const escapeAttr = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const escapeText = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const missing = [];

function need(key) {
  const value = lookup(key);
  if (value === undefined) missing.push(key);
  return value;
}

function injectPartials(html) {
  for (const [name, content] of Object.entries(partials)) {
    const pattern = new RegExp(`(<!-- shared:${name} -->)[\\s\\S]*?(<!-- /shared:${name} -->)`);
    html = html.replace(pattern, `$1\n${content}\n$2`);
  }
  return html;
}

function fillFrench(html) {
  // Lists: <ul data-i18n-list="key">…</ul>
  html = html.replace(/(<(ul|ol)\b[^>]*\sdata-i18n-list="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g, (_, open, tag, key, close) => {
    const items = need(key);
    if (!Array.isArray(items)) return open + close;
    return `${open}${items.map((item) => `<li>${escapeText(item)}</li>`).join("")}${close}`;
  });
  // Raw HTML text: data-i18n-html
  html = html.replace(/(<(\w+)\b[^>]*\sdata-i18n-html="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g, (_, open, tag, key, close) => `${open}${need(key) ?? ""}${close}`);
  // Plain text: data-i18n
  html = html.replace(/(<(\w+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g, (_, open, tag, key, close) => `${open}${escapeText(need(key) ?? "")}${close}`);
  // Attributes: data-i18n-content (meta) and data-i18n-aria (aria-label)
  html = html.replace(/<[^>]*\sdata-i18n-(content|aria)="([^"]+)"[^>]*>/g, (tag, kind, key) => {
    const attribute = kind === "content" ? "content" : "aria-label";
    const value = escapeAttr(need(key) ?? "");
    return tag.includes(` ${attribute}="`) ? tag.replace(new RegExp(` ${attribute}="[^"]*"`), ` ${attribute}="${value}"`) : tag.replace(/\s*\/?>$/, ` ${attribute}="${value}">`);
  });
  return html;
}

const pages = readdirSync(root).filter((file) => file.endsWith(".html"));
for (const page of pages) {
  const path = join(root, page);
  const before = readFileSync(path, "utf8");
  const after = stamp(fillFrench(injectPartials(before)));
  if (after !== before) writeFileSync(path, after);
  console.log(`updated ${page}`);
}
console.log(`version ${version}`);

if (missing.length) {
  console.error("\nMissing French keys:\n  " + [...new Set(missing)].join("\n  "));
  process.exitCode = 1;
}
