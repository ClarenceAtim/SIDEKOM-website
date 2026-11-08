// Packs page: /packs.html?pack=growth shows only that pack. Without ?pack= (or with an unknown value)
// all packs are compared; on small screens css/packs.css turns them into short cards.

import { translate } from "./translator.js?v=0dce298e";

export function setupPackDetails() {
  const list = document.querySelector("[data-pack-list]");
  if (!list) return;

  const wanted = new URLSearchParams(location.search).get("pack");
  const selected = list.querySelector(`[data-pack="${CSS.escape(wanted || "")}"]`);
  if (!wanted || !selected) return;

  list.classList.add("is-single");
  list.querySelectorAll("[data-pack]").forEach((pack) => { pack.hidden = pack !== selected; });
  selected.classList.add("is-visible"); // no need to wait for the scroll animation
  document.querySelectorAll("[data-pack-back]").forEach((link) => { link.hidden = false; });

  // Tab title: "Pack Growth | SIDEKOM", kept in the current language.
  const setTitle = () => { document.title = `${translate(`packs.${wanted}.name`)} | SIDEKOM`; };
  setTitle();
  document.addEventListener("languagechange", setTitle);
}
