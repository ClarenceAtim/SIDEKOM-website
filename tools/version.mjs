// The site version: a short fingerprint of every file browsers keep for a year (see vercel.json).
// tools/update-pages.mjs writes it as ?v=... after CSS, JS, language and image addresses;
// tools/check-translations.mjs checks that the pages carry the current one.
// js/settings.js is left out on purpose: it is never cached long, so a change to it shows up even
// if the update tool is not run.

import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

export const versionPattern = /(\.(?:css|js|json|png|webp|svg|ico))\?v=[\w-]+/g;
const cachedFolders = ["css", "js", "languages", "images", "images/favicons"];

export function siteVersion(root) {
  const fingerprint = createHash("sha1");
  for (const folder of cachedFolders) {
    for (const file of readdirSync(join(root, folder)).filter((name) => /\.\w+$/.test(name)).sort()) {
      if (`${folder}/${file}` === "js/settings.js") continue;
      const content = readFileSync(join(root, folder, file));
      fingerprint.update(`${folder}/${file}\n`);
      // Ignore the version strings themselves, or every update would change the version again
      fingerprint.update(/\.(css|js|json)$/.test(file) ? content.toString("utf8").replace(versionPattern, "$1") : content);
    }
  }
  return fingerprint.digest("hex").slice(0, 8);
}
