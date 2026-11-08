// The language dropdown in the header (accessible listbox, works with mouse, touch and keyboard).

import { settings } from "./settings.js";
import { getLanguage, setLanguage } from "./translator.js?v=0dce298e";

export function setupLanguagePicker() {
  const picker = document.querySelector("[data-language-picker]");
  if (!picker) return;

  const button = picker.querySelector("[data-language-button]");
  const list = picker.querySelector("[data-language-list]");
  const label = picker.querySelector("[data-language-current]");

  list.replaceChildren(...settings.languages.map((language) => {
    const option = document.createElement("li");
    option.className = "language-picker__option";
    option.id = `language-option-${language.code}`;
    option.setAttribute("role", "option");
    option.dataset.code = language.code;
    option.lang = language.code;
    option.textContent = language.label;
    if (language.direction) option.dir = language.direction;
    return option;
  }));

  const options = () => [...list.children];
  let active = 0;

  function refresh() {
    const code = getLanguage();
    label.textContent = settings.languages.find((language) => language.code === code).short;
    options().forEach((option) => option.setAttribute("aria-selected", String(option.dataset.code === code)));
  }

  function highlight(index) {
    const all = options();
    active = (index + all.length) % all.length;
    all.forEach((option, position) => option.classList.toggle("is-active", position === active));
    list.setAttribute("aria-activedescendant", all[active].id);
    all[active].scrollIntoView({ block: "nearest" });
  }

  function open() {
    list.hidden = false;
    button.setAttribute("aria-expanded", "true");
    highlight(options().findIndex((option) => option.dataset.code === getLanguage()));
    list.focus();
  }

  function close({ returnFocus = true } = {}) {
    list.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus();
  }

  async function choose(option) {
    close();
    await setLanguage(option.dataset.code);
    refresh();
  }

  button.addEventListener("click", () => (list.hidden ? open() : close()));

  list.addEventListener("click", (event) => {
    const option = event.target.closest("[role=option]");
    if (option) choose(option);
  });

  list.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); highlight(active + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); highlight(active - 1); }
    else if (event.key === "Home") { event.preventDefault(); highlight(0); }
    else if (event.key === "End") { event.preventDefault(); highlight(options().length - 1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(options()[active]); }
    else if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "Tab") { close({ returnFocus: false }); }
  });

  document.addEventListener("click", (event) => {
    if (!list.hidden && !picker.contains(event.target)) close({ returnFocus: false });
  });

  document.addEventListener("languagechange", refresh);
  refresh();
}
