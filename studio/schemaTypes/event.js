// Événement (shown on the Événements page of the website)
import { defineField, defineType } from "sanity";
import { FALLBACK_NOTE, localized, today } from "./languages.js";

export const event = defineType({
  name: "event",
  title: "Événement",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nom de l'événement",
      description: "Restez sous 70 caractères.",
      type: "string",
      validation: (rule) => rule.required().error("Donnez un nom à l'événement."),
    }),
    defineField({
      name: "date",
      title: "Date",
      description: "Le jour de l'événement. Après cette date, il passe automatiquement dans « Événements passés ».",
      type: "date",
      initialValue: today,
      options: { dateFormat: "DD/MM/YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "place",
      title: "Lieu",
      description: "La ville et la salle, par exemple « Douala, Hôtel Akwa Palace ».",
      type: "string",
    }),
    localized({
      name: "description",
      title: "Courte description",
      description: `Deux ou trois phrases sur l'événement. ${FALLBACK_NOTE}`,
      type: "text",
      rows: 3,
      maxLength: 300,
    }),
    defineField({
      name: "image",
      title: "Photo (facultatif)",
      description: "Une photo en format paysage.",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Description de la photo", description: "Décrivez en une phrase ce que montre la photo." }),
      ],
    }),
  ],
  orderings: [{ title: "Date (récents d'abord)", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", place: "place", media: "image" },
    prepare({ title, date, place, media }) {
      const status = date && date >= today() ? "À venir" : "Passé";
      const day = date ? new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : "Sans date";
      return { title: title || "Événement sans nom", subtitle: [status, day, place].filter(Boolean).join(" · "), media };
    },
  },
});
