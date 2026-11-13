// Optional sections filled from the admin panel (Sanity). Each stays hidden when there is nothing to show:
// - home page: "Témoignages" ([data-testimonials])
// - events.html: "Nos événements", upcoming first, then past ([data-events-list])

import { getLanguage, translate } from "./translator.js?v=8d60b6a2";
import { pickLanguage, sanityImage, sanityQuery } from "./sanity.js?v=8d60b6a2";
import { el, icon } from "./blog.js?v=8d60b6a2";
import { formatDate } from "./blog-data.js?v=8d60b6a2";
import { whenNear } from "./scroll-effects.js?v=8d60b6a2";

const TESTIMONIALS_QUERY = `*[_type == "testimonial" && defined(name) && defined(quote.fr)]
  | order(_createdAt desc)[0...6] { _id, name, role, company, quote, photo }`;
const EVENTS_QUERY = `*[_type == "event" && defined(title) && defined(date)]
  | order(date asc) { _id, title, date, place, description, image }`;

// lang/dir for text shown in French on a page in another language
function languageOf(code) {
  return code !== getLanguage() ? { lang: code, dir: "ltr" } : {};
}

// Fills `section` once the visitor scrolls near it; re-draws when the language changes.
function fill(section, query, draw) {
  whenNear(section, () => {
    sanityQuery(query)
      .then((items) => {
        if (!Array.isArray(items) || !items.length) return;
        const render = () => draw(items);
        if (render() === false) return;
        section.hidden = false;
        document.addEventListener("languagechange", render);
      })
      .catch((error) => console.warn("Optional section left hidden:", error.message));
  });
}

function testimonialCard(item) {
  const quote = pickLanguage(item.quote);
  const photo = sanityImage(item.photo, { width: 112, height: 112 });
  const detail = [item.role, item.company].filter(Boolean).join(", ");
  return el("figure", { class: "quote-card" }, [
    el("blockquote", { class: "quote-card__text", ...languageOf(quote.language) }, el("p", {}, quote.text)),
    el("figcaption", { class: "quote-card__author" }, [
      photo
        ? el("img", { class: "quote-card__photo", src: photo.src, srcset: photo.srcset, alt: "", width: "56", height: "56", loading: "lazy", decoding: "async" })
        : el("span", { class: "quote-card__photo quote-card__photo--empty", "aria-hidden": "true" }, String(item.name || "?").trim().charAt(0)),
      el("span", {}, [el("strong", {}, item.name || ""), detail ? el("span", { class: "quote-card__detail" }, detail) : ""]),
    ]),
  ]);
}

function eventCard(item, upcoming) {
  const description = pickLanguage(item.description);
  const image = sanityImage(item.image, { width: 640, height: 360 });
  const language = getLanguage();
  return el("article", { class: "post-card event-card" }, [
    el("div", { class: "post-card__visual" }, image
      ? el("img", { src: image.src, srcset: image.srcset, alt: image.alt, width: "640", height: "360", loading: "lazy", decoding: "async" })
      : el("span", { class: "post-card__placeholder" }, icon("calendar", "icon--large"))),
    el("div", { class: "post-card__body" }, [
      el("p", { class: "post-meta" }, [
        el("span", { class: `post-meta__category${upcoming ? "" : " event-card__past"}` }, translate(upcoming ? "eventsList.upcoming" : "eventsList.past")),
        el("time", { datetime: item.date }, formatDate(item.date, language)),
      ]),
      el("h3", { class: "post-card__title" }, item.title),
      item.place ? el("p", { class: "event-card__place" }, [icon("pin", "icon--small"), el("span", {}, item.place)]) : "",
      description.text ? el("p", { class: "post-card__excerpt", ...languageOf(description.language) }, description.text) : "",
    ]),
  ]);
}

export function setupHighlights() {
  const testimonials = document.querySelector("[data-testimonials]");
  if (testimonials) {
    const list = testimonials.querySelector("[data-testimonials-list]");
    fill(testimonials, TESTIMONIALS_QUERY, (items) => list.replaceChildren(...items.map(testimonialCard)));
  }

  const events = document.querySelector("[data-events-list]");
  if (events) {
    const list = events.querySelector("[data-events-items]");
    fill(events, EVENTS_QUERY, (items) => {
      const today = new Date().toISOString().slice(0, 10);
      const valid = items.filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date || ""));
      const upcoming = valid.filter((item) => item.date >= today);
      const past = valid.filter((item) => item.date < today).reverse().slice(0, 6);
      if (!upcoming.length && !past.length) return false;
      list.replaceChildren(...upcoming.map((item) => eventCard(item, true)), ...past.map((item) => eventCard(item, false)));
    });
  }
}
