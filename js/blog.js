// Blog cards: the list on blog.html (with category filter) and "Latest articles" on the home page.

import { getLanguage, translate } from "./translator.js?v=4454694f";
import { categories, formatDate, loadPosts, localize, postUrl } from "./blog-data.js?v=4454694f";
import { whenNear } from "./scroll-effects.js?v=4454694f";

const categoryIcons = {
  "community-management": "users",
  communication: "megaphone",
  events: "calendar",
  "digital-marketing": "monitor",
};

// Small helper: el("p", { class: "x" }, "text" or [children])
export function el(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null && value !== false) element.setAttribute(name, value);
  }
  element.append(...[].concat(children));
  return element;
}

export function icon(name, extraClass = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", `icon ${extraClass}`.trim());
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#icon-${name}`);
  svg.append(use);
  return svg;
}

// Category and date line, shared with the article page.
export function postMeta(post, language) {
  return el("p", { class: "post-meta" }, [
    el("span", { class: "post-meta__category" }, translate(`blog.categories.${post.category}`) || post.category),
    el("time", { datetime: post.date }, formatDate(post.date, language)),
  ]);
}

// Text written in another language than the page (French fallback) gets its own lang and direction.
// part: "title", "excerpt" or "content" (each can fall back on its own).
export function textLanguage(post, part = "title") {
  const code = post.languages ? post.languages[part] : post.page;
  return code && code !== post.page ? { lang: code, dir: "ltr" } : {};
}

function postCard(post, language, headingTag) {
  const url = postUrl(post.slug);
  const image = post.image && (post.image.card || post.image);
  const visual = image
    ? el("img", { src: image.src, srcset: image.srcset, alt: "", loading: "lazy", decoding: "async", width: "640", height: "360" })
    : el("span", { class: "post-card__placeholder" }, icon(categoryIcons[post.category] || "sparkle", "icon--large"));

  return el("article", { class: "post-card" }, [
    el("a", { class: "post-card__visual", href: url, tabindex: "-1", "aria-hidden": "true" }, visual),
    el("div", { class: "post-card__body" }, [
      postMeta(post, language),
      el(headingTag, { class: "post-card__title", ...textLanguage(post, "title") }, el("a", { href: url }, post.title)),
      el("p", { class: "post-card__excerpt", ...textLanguage(post, "excerpt") }, post.excerpt),
      post.isFallback ? el("p", { class: "post-note" }, translate("blog.fallbackNote")) : "",
      el("a", { class: "text-link", href: url, "aria-label": `${translate("blog.readMore")}: ${post.title}` }, [
        el("span", {}, translate("blog.readMore")),
        icon("arrow", "icon--small icon-flip"),
      ]),
    ]),
  ]);
}

function setupBlogList() {
  const list = document.querySelector("[data-blog-list]");
  if (!list) return;

  const empty = document.querySelector("[data-blog-empty]");
  const buttons = [...document.querySelectorAll("[data-blog-filter]")];
  const asked = new URLSearchParams(location.search).get("category");
  let current = categories.includes(asked) ? asked : "";
  let posts = [];

  function render() {
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.blogFilter === current)));
    const language = getLanguage();
    const shown = posts.filter((post) => !current || post.category === current);
    list.replaceChildren(...shown.map((post) => postCard(localize(post, language), language, "h2")));
    empty.textContent = translate("blog.empty");
    empty.hidden = shown.length > 0;
  }

  buttons.forEach((button) => button.addEventListener("click", () => {
    current = button.dataset.blogFilter;
    const url = new URL(location.href);
    if (current) url.searchParams.set("category", current); else url.searchParams.delete("category");
    history.replaceState(null, "", url);
    render();
  }));

  loadPosts()
    .then((all) => {
      posts = all;
      render();
      document.addEventListener("languagechange", render);
    })
    .catch((error) => {
      console.error(error);
      empty.textContent = translate("blog.error");
      empty.hidden = false;
    });
}

function setupLatestPosts() {
  const section = document.querySelector("[data-latest-posts]");
  if (!section) return;
  const list = section.querySelector("[data-latest-list]");
  // Only download the posts when the visitor scrolls near the bottom of the page
  whenNear(section, () => showLatest(section, list));
}

function showLatest(section, list) {
  loadPosts()
    .then((all) => {
      const latest = all.slice(0, 3);
      if (!latest.length) return;
      const render = () => {
        const language = getLanguage();
        list.replaceChildren(...latest.map((post) => postCard(localize(post, language), language, "h3")));
      };
      render();
      section.hidden = false;
      document.addEventListener("languagechange", render);
    })
    .catch((error) => console.error(error)); // the section simply stays hidden
}

export function setupBlog() {
  setupBlogList();
  setupLatestPosts();
}
