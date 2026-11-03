// Loads a language file and writes it into every element marked with a data-i18n attribute.

import { settings } from "./settings.js";

const cache = {};
let current = settings.defaultLanguage;
let dictionary = null;

export function getLanguage() {
  return current;
}

export function pickInitialLanguage() {
  const codes = settings.languages.map((language) => language.code);
  const asked = new URLSearchParams(location.search).get("lang");
  let saved = null;
  try { saved = localStorage.getItem(settings.storageKey); } catch (error) { /* ignore */ }
  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return [asked, saved, browser].find((code) => codes.includes(code)) || settings.defaultLanguage;
}

async function loadDictionary(code) {
  if (!cache[code]) {
    const response = await fetch(`/languages/${code}.json?v=7f3a9c2e`);
    if (!response.ok) throw new Error(`Missing language file: ${code}`);
    cache[code] = await response.json();
  }
  return cache[code];
}

export function translate(key) {
  return key.split(".").reduce((node, part) => (node ? node[part] : undefined), dictionary);
}

function formatPrices(code) {
  const formatter = new Intl.NumberFormat(code === "ar" ? "ar-u-nu-latn" : code);
  document.querySelectorAll("[data-price]").forEach((element) => {
    element.textContent = formatter.format(Number(element.dataset.price));
  });
}

function applyToPage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = translate(element.dataset.i18n);
    if (typeof value === "string") element.textContent = value;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const value = translate(element.dataset.i18nHtml);
    if (typeof value === "string") element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-list]").forEach((element) => {
    const items = translate(element.dataset.i18nList);
    if (!Array.isArray(items)) return;
    element.replaceChildren(...items.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const value = translate(element.dataset.i18nAria);
    if (typeof value === "string") element.setAttribute("aria-label", value);
  });
  document.querySelectorAll("[data-i18n-content]").forEach((element) => {
    const value = translate(element.dataset.i18nContent);
    if (typeof value === "string") element.setAttribute("content", value);
  });
}

export async function setLanguage(code, { remember = true } = {}) {
  if (!settings.languages.some((language) => language.code === code)) code = settings.defaultLanguage;
  const root = document.documentElement;
  try {
    dictionary = await loadDictionary(code);
  } catch (error) {
    console.error(error);
    root.classList.remove("is-translating");
    return current;
  }
  current = code;
  const info = settings.languages.find((language) => language.code === code);
  root.lang = code;
  root.dir = info.direction || "ltr";
  applyToPage();
  formatPrices(code);
  if (remember) {
    try { localStorage.setItem(settings.storageKey, code); } catch (error) { /* ignore */ }
  }
  root.classList.remove("is-translating");
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { code } }));
  return code;
}
