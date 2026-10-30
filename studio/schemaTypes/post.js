// Article du blog
import { defineField, defineType } from "sanity";
import { FALLBACK_NOTE, localized, today } from "./languages.js";
import { richText } from "./richText.js";

export const categories = [
  { title: "Community management", value: "community-management" },
  { title: "Communication", value: "communication" },
  { title: "Événements", value: "events" },
  { title: "Marketing digital", value: "digital-marketing" },
];

// "Les 5 erreurs à éviter !" -> "les-5-erreurs-a-eviter"
export function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

export const post = defineType({
  name: "post",
  title: "Article",
  type: "document",
  fields: [
    localized({
      name: "title",
      title: "Titre",
      description: `Le titre de l'article. Restez sous 70 caractères. ${FALLBACK_NOTE}`,
    }),
    defineField({
      name: "slug",
      title: "Adresse de la page",
      description: "Créée à partir du titre français : cliquez sur « Générer ». Ne la changez plus après la publication (les liens partagés ne marcheraient plus).",
      type: "slug",
      options: { source: "title.fr", maxLength: 80, slugify },
      validation: (rule) =>
        rule.required().error("Cliquez sur « Générer » pour créer l'adresse.").custom((slug) =>
          !slug?.current || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current) ? true : "Seulement des lettres minuscules sans accent, des chiffres et des tirets."),
    }),
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      description: "L'article apparaît sur le site à partir de cette date. Choisissez une date future pour le programmer.",
      type: "date",
      initialValue: today,
      options: { dateFormat: "DD/MM/YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Catégorie",
      description: "Le thème de l'article. Il sert au filtre de la page Blog.",
      type: "string",
      options: { list: categories, layout: "radio" },
      validation: (rule) => rule.required().error("Choisissez une catégorie."),
    }),
    defineField({
      name: "coverImage",
      title: "Photo de couverture (facultatif)",
      description: "Une photo en format paysage, idéalement 1200 x 675 pixels. Sans photo, le site affiche un bandeau bleu.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Description de la photo",
          description: "Décrivez en une phrase ce que montre la photo.",
          validation: (rule) =>
            rule.custom((alt, context) => (context.parent?.asset && !alt ? "Ajoutez une description de la photo." : true)),
        }),
      ],
    }),
    localized({
      name: "excerpt",
      title: "Résumé",
      description: `Deux phrases maximum, affichées sur les cartes du blog et dans Google (220 caractères maximum). ${FALLBACK_NOTE}`,
      type: "text",
      rows: 3,
      maxLength: 220,
    }),
    localized({
      name: "body",
      title: "Texte de l'article",
      description: `Écrivez l'article. Utilisez « Titre de partie » pour découper le texte. ${FALLBACK_NOTE}`,
      type: "array",
      of: richText,
    }),
  ],
  orderings: [
    { title: "Date de publication (récents d'abord)", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title.fr", date: "publishedAt", category: "category", media: "coverImage" },
    prepare({ title, date, category, media }) {
      const label = categories.find((item) => item.value === category)?.title;
      const day = date ? new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : "Sans date";
      return { title: title || "Article sans titre", subtitle: [day, label].filter(Boolean).join(" · "), media };
    },
  },
});
