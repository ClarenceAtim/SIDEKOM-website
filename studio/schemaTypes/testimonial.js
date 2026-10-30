// Témoignage d'un client (shown on the home page of the website)
import { defineField, defineType } from "sanity";
import { FALLBACK_NOTE, localized } from "./languages.js";

export const testimonial = defineType({
  name: "testimonial",
  title: "Témoignage",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nom de la personne",
      description: "Prénom et nom, par exemple « Marie Ngono ».",
      type: "string",
      validation: (rule) => rule.required().error("Indiquez le nom de la personne."),
    }),
    defineField({ name: "role", title: "Poste", description: "Par exemple « Directrice marketing ».", type: "string" }),
    defineField({ name: "company", title: "Entreprise", description: "Le nom de son entreprise.", type: "string" }),
    localized({
      name: "quote",
      title: "Témoignage",
      description: `Ce que la personne dit de SIDEKOM, en quelques phrases (400 caractères maximum). ${FALLBACK_NOTE}`,
      type: "text",
      rows: 4,
      maxLength: 400,
    }),
    defineField({
      name: "photo",
      title: "Photo (facultatif)",
      description: "Une photo du visage, de préférence carrée. Demandez l'accord de la personne.",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", role: "role", company: "company", media: "photo" },
    prepare({ title, role, company, media }) {
      return { title: title || "Sans nom", subtitle: [role, company].filter(Boolean).join(", "), media };
    },
  },
});
