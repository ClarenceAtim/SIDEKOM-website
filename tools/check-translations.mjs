// Run with:  node tools/check-translations.mjs
// Checks that every language file has exactly the same keys as French (and the same number of list items).

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

console.log(problems ? `\n${problems} problem(s) found.` : "All languages match French.");
process.exitCode = problems ? 1 : 0;
