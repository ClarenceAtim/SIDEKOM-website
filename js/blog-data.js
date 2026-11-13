// Blog posts: loading and formatting. This is the ONLY file that knows where posts come from.
// 1. Sanity (the admin panel), when js/settings.js has a projectId and Sanity has at least one published article.
// 2. Otherwise data/blog-posts.json (sample articles), so the blog is never empty or broken.
// Both give the same shape: { slug, date: "YYYY-MM-DD", category, image, translations: { fr: { title, excerpt, content }, ... } }.

import { settings } from "./settings.js";
import { sanityEnabled, sanityImage, sanityQuery } from "./sanity.js?v=8d60b6a2";

const FALLBACK_SOURCE = "/data/blog-posts.json";

// Published articles whose publication date has come (a future date = scheduled)
const POSTS_QUERY = `*[_type == "post" && defined(slug.current) && defined(title.fr) && publishedAt <= now()]
  | order(publishedAt desc) { "slug": slug.current, publishedAt, category, coverImage, title, excerpt, body }`;

export const categories = ["community-management", "communication", "events", "digital-marketing"];
const languageCodes = settings.languages.map((language) => language.code);

let request = null;

// All posts, newest first.
export function loadPosts() {
  if (!request) {
    request = loadFromSanity()
      .catch((error) => { console.warn("Blog: using the sample articles.", error.message); return []; })
      .then((posts) => (posts.length ? posts : loadFromFile()))
      .then((posts) => posts.filter((post) => post.slug && post.translations && /^\d{4}-\d{2}-\d{2}$/.test(post.date)).sort((a, b) => b.date.localeCompare(a.date)))
      .catch((error) => { request = null; throw error; });
  }
  return request;
}

async function loadFromSanity() {
  if (!sanityEnabled) return [];
  const documents = await sanityQuery(POSTS_QUERY);
  return Array.isArray(documents) ? documents.map(fromSanity) : [];
}

async function loadFromFile() {
  const response = await fetch(FALLBACK_SOURCE);
  if (!response.ok) throw new Error(`Blog posts not found (${response.status})`);
  return response.json();
}

// Sanity article -> site shape. A language only gets an entry when one of its fields is written.
function fromSanity(document) {
  const translations = {};
  for (const code of languageCodes) {
    const title = document.title?.[code];
    const excerpt = document.excerpt?.[code];
    const body = document.body?.[code];
    if (!title && !excerpt && !(Array.isArray(body) && body.length)) continue;
    translations[code] = { title: title || "", excerpt: excerpt || "", content: richTextToBlocks(body) };
  }
  const cover = sanityImage(document.coverImage, { width: 1200, height: 675 });
  return {
    slug: document.slug,
    date: String(document.publishedAt || "").slice(0, 10),
    category: document.category,
    // Article page size, plus a smaller size for the cards
    image: cover && { ...cover, card: sanityImage(document.coverImage, { width: 640, height: 360 }) },
    translations,
  };
}

// Sanity rich text -> the site's content blocks (see js/blog-article.js):
// paragraph / heading (level 2|3) / quote: { spans: [{ text, bold, italic, href }] }
// list: { ordered, items: [spans, ...] }      image: { src, srcset, width, height, alt }
export function richTextToBlocks(body) {
  if (!Array.isArray(body)) return [];
  const blocks = [];
  for (const item of body) {
    if (item._type === "image") {
      const image = sanityImage(item, { width: 760 });
      if (image) blocks.push({ type: "image", ...image });
      continue;
    }
    if (item._type !== "block") continue;
    const spans = toSpans(item);
    if (item.listItem) {
      const ordered = item.listItem === "number";
      const last = blocks[blocks.length - 1];
      if (last && last.type === "list" && last.ordered === ordered) last.items.push(spans);
      else blocks.push({ type: "list", ordered, items: [spans] });
    } else if (item.style === "h2" || item.style === "h3") {
      blocks.push({ type: "heading", level: item.style === "h3" ? 3 : 2, spans });
    } else if (item.style === "blockquote") {
      blocks.push({ type: "quote", spans });
    } else if (spans.some((span) => span.text.trim())) {
      blocks.push({ type: "paragraph", spans });
    }
  }
  return blocks;
}

function toSpans(block) {
  const links = Object.fromEntries((block.markDefs || []).filter((mark) => mark._type === "link").map((mark) => [mark._key, mark.href]));
  return (block.children || []).map((child) => {
    const marks = child.marks || [];
    const link = marks.find((mark) => links[mark]);
    return { text: String(child.text || ""), bold: marks.includes("strong"), italic: marks.includes("em"), href: link ? links[link] : "" };
  });
}

export async function findPost(slug) {
  return (await loadPosts()).find((post) => post.slug === slug) || null;
}

// The post in the visitor's language. Each part (title, summary, text) that is not written in that
// language is shown in French; `languages` says which language each part is in, and isFallback is
// true when at least one part is in French on a non-French page (the page then shows a short note).
export function localize(post, language) {
  const own = post.translations[language] || {};
  const french = post.translations[settings.defaultLanguage] || {};
  const filled = (value) => (Array.isArray(value) ? value.length > 0 : Boolean(value));
  const pick = (field, empty) => (filled(own[field]) ? [own[field], language] : [french[field] || empty, settings.defaultLanguage]);
  const [title, titleLanguage] = pick("title", "");
  const [excerpt, excerptLanguage] = pick("excerpt", "");
  const [content, contentLanguage] = pick("content", []);
  const languages = { title: titleLanguage, excerpt: excerptLanguage, content: contentLanguage };
  const image = typeof post.image === "string" ? (post.image ? { src: post.image, alt: "" } : null) : post.image || null;
  return {
    slug: post.slug,
    date: post.date,
    category: post.category,
    image,
    title,
    excerpt,
    content: Array.isArray(content) ? content : [],
    page: language,
    language: contentLanguage, // language of the article text
    languages,
    isFallback: Object.values(languages).some((code) => code !== language),
  };
}

export function formatDate(date, language) {
  const locale = language === "ar" ? "ar-u-nu-latn" : language;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function postUrl(slug) {
  return `/article.html?slug=${encodeURIComponent(slug)}`;
}
