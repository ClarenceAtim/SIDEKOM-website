// Article page: /article.html?slug=<slug> shows one blog post in the visitor's language.

import { getLanguage, translate } from "./translator.js?v=8d60b6a2";
import { findPost, localize } from "./blog-data.js?v=8d60b6a2";
import { el, postMeta, textLanguage } from "./blog.js?v=8d60b6a2";

function setMeta(selector, value) {
  const tag = document.querySelector(selector);
  if (tag) tag.setAttribute("content", value);
}

// Only web, e-mail and phone links are kept; anything else (e.g. "javascript:") becomes plain text.
function safeLink(href) {
  try {
    const url = new URL(String(href || ""), location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

// Text of a block: a plain string (sample articles) or a list of pieces with bold / italic / link.
// Everything is built with createElement and text nodes: content is never read as HTML.
function inline(content) {
  if (!Array.isArray(content)) return [document.createTextNode(String(content || ""))];
  return content.map((span) => {
    let node = document.createTextNode(span.text || "");
    if (span.italic) node = el("em", {}, node);
    if (span.bold) node = el("strong", {}, node);
    const url = span.href ? safeLink(span.href) : null;
    if (url) {
      const external = /^https?:$/.test(url.protocol) && url.origin !== location.origin;
      node = el("a", { href: url.href, target: external ? "_blank" : null, rel: external ? "noopener noreferrer" : null }, node);
    }
    return node;
  });
}

function contentBlock(block) {
  const text = block.spans || block.text;
  if (block.type === "heading") return el(block.level === 3 ? "h3" : "h2", {}, inline(text));
  if (block.type === "list") return el(block.ordered ? "ol" : "ul", {}, (block.items || []).map((item) => el("li", {}, inline(item))));
  if (block.type === "quote") return el("blockquote", {}, el("p", {}, inline(text)));
  if (block.type === "image") {
    if (!block.src) return "";
    return el("figure", { class: "article__figure" }, el("img", {
      src: block.src, srcset: block.srcset, alt: block.alt || "", width: block.width, height: block.height, loading: "lazy", decoding: "async",
    }));
  }
  return el("p", {}, inline(text));
}

export function setupArticle() {
  const article = document.querySelector("[data-article]");
  if (!article) return;

  const missing = document.querySelector("[data-article-missing]");
  const slug = new URLSearchParams(location.search).get("slug") || "";
  let post = null;

  function showMissing() {
    article.hidden = true;
    missing.hidden = false;
    document.title = `${translate("blog.notFoundTitle")} | SIDEKOM`;
  }

  function render() {
    if (!post) { showMissing(); return; }
    const language = getLanguage();
    const text = localize(post, language);

    const meta = postMeta(text, language);
    meta.dataset.articleMeta = "";
    article.querySelector("[data-article-meta]").replaceWith(meta);

    const title = article.querySelector("[data-article-title]");
    title.textContent = text.title;
    const body = article.querySelector("[data-article-content]");
    body.replaceChildren(...text.content.map(contentBlock));
    for (const [target, part] of [[title, "title"], [body, "content"]]) {
      target.removeAttribute("lang");
      target.removeAttribute("dir");
      Object.entries(textLanguage(text, part)).forEach(([name, value]) => target.setAttribute(name, value));
    }

    const note = article.querySelector("[data-article-note]");
    note.textContent = translate("blog.fallbackNote");
    note.hidden = !text.isFallback;

    const figure = article.querySelector("[data-article-image]");
    figure.hidden = !text.image;
    if (text.image) {
      const img = figure.querySelector("img");
      img.src = text.image.src;
      if (text.image.srcset) img.srcset = text.image.srcset; else img.removeAttribute("srcset");
      img.alt = text.image.alt || "";
    }

    document.title = `${text.title} | SIDEKOM`;
    setMeta('meta[name="description"]', text.excerpt);
    setMeta('meta[property="og:title"]', text.title);
    setMeta('meta[property="og:description"]', text.excerpt);
    article.hidden = false;
  }

  findPost(slug)
    .then((found) => { post = found; })
    .catch((error) => console.error(error))
    .finally(() => {
      render();
      document.addEventListener("languagechange", render);
    });
}
