// Reads published content from Sanity (the admin panel) through its public, read-only CDN.
// No password or key here: only published content of a public dataset can be read this way.

import { settings } from "./settings.js";
import { getLanguage } from "./translator.js?v=8d60b6a2";

const config = settings.sanity || {};
const TIMEOUT = 8000; // after 8 seconds without an answer, the site falls back to its own content

export const sanityEnabled =
  /^[a-z0-9]+$/.test(config.projectId || "") && /^[a-z0-9_-]+$/.test(config.dataset || "") && /^\d{4}-\d{2}-\d{2}$/.test(config.apiVersion || "");

const cache = new Map();

// One request per query and per page visit: switching language reuses the answer.
export function sanityQuery(query) {
  if (!sanityEnabled) return Promise.reject(new Error("Sanity is not set up in js/settings.js"));
  if (!cache.has(query)) {
    const url = `https://${config.projectId}.apicdn.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`
      + `?query=${encodeURIComponent(query)}&perspective=published`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    const request = fetch(url, { credentials: "omit", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Sanity answered ${response.status}`);
        return response.json();
      })
      .then((answer) => answer.result)
      .catch((error) => { cache.delete(query); throw error; })
      .finally(() => clearTimeout(timer));
    cache.set(query, request);
  }
  return cache.get(query);
}

// Sanity image -> CDN address at the asked width, in the best format for the browser.
// The image reference looks like "image-<id>-<width>x<height>-<format>".
export function sanityImage(image, { width = 800, height } = {}) {
  const ref = image && image.asset && image.asset._ref;
  const match = /^image-([A-Za-z0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/.exec(ref || "");
  if (!match || !sanityEnabled) return null;
  const [, id, w, h, format] = match;
  const base = `https://cdn.sanity.io/images/${config.projectId}/${config.dataset}/${id}-${w}x${h}.${format}`;
  const size = (scale) => {
    const params = new URLSearchParams({ w: String(width * scale), auto: "format", fit: height ? "crop" : "max" });
    if (height) params.set("h", String(height * scale));
    return `${base}?${params}`;
  };
  return {
    src: size(1),
    srcset: `${size(1)} 1x, ${size(2)} 2x`,
    width: width,
    height: height || Math.round((width * Number(h)) / Number(w)),
    alt: typeof image.alt === "string" ? image.alt : "",
  };
}

// A field written in several languages ({ fr, en, ... }): the visitor's language, or French when empty.
// Returns { text, language } so the page can mark French text shown on an English page.
export function pickLanguage(field, language = getLanguage()) {
  const has = (value) => (Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim() !== "");
  if (field && has(field[language])) return { text: field[language], language };
  const fallback = settings.defaultLanguage;
  return { text: field && has(field[fallback]) ? field[fallback] : "", language: fallback };
}
