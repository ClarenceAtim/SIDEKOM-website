// Membre de l'équipe (stored for a future team section; not shown on the website yet)
import { defineField, defineType } from "sanity";
import { localized } from "./languages.js";

export const teamMember = defineType({
  name: "teamMember",
  title: "Membre de l'équipe",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nom",
      description: "Prénom et nom.",
      type: "string",
      validation: (rule) => rule.required().error("Indiquez le nom."),
    }),
    localized({ name: "role", title: "Poste", description: "Par exemple « Community manager ». Les langues vides s'affichent en français." }),
    defineField({
      name: "photo",
      title: "Photo",
      description: "Une photo du visage, de préférence carrée.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Ordre d'affichage",
      description: "1 s'affiche en premier, puis 2, 3...",
      type: "number",
      initialValue: 1,
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [{ title: "Ordre d'affichage", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", role: "role.fr", order: "order", media: "photo" },
    prepare({ title, role, order, media }) {
      return { title: title || "Sans nom", subtitle: [order != null ? `#${order}` : "", role].filter(Boolean).join(" · "), media };
    },
  },
});
