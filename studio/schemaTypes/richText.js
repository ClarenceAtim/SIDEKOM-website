// The article text editor: titles, paragraphs, bold, italic, links, lists, quotes and photos.
import { defineArrayMember, defineField } from "sanity";

export const richText = [
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Paragraphe", value: "normal" },
      { title: "Titre de partie (H2)", value: "h2" },
      { title: "Sous-titre (H3)", value: "h3" },
      { title: "Citation", value: "blockquote" },
    ],
    lists: [
      { title: "Liste à puces", value: "bullet" },
      { title: "Liste numérotée", value: "number" },
    ],
    marks: {
      decorators: [
        { title: "Gras", value: "strong" },
        { title: "Italique", value: "em" },
      ],
      annotations: [
        defineField({
          name: "link",
          type: "object",
          title: "Lien",
          fields: [
            defineField({
              name: "href",
              type: "url",
              title: "Adresse du lien",
              description: "Collez l'adresse complète, par exemple https://www.exemple.com",
              validation: (rule) => rule.required().uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
            }),
          ],
        }),
      ],
    },
  }),
  defineArrayMember({
    type: "image",
    title: "Photo",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Description de la photo",
        description: "Décrivez en une phrase ce que montre la photo (lu aux personnes malvoyantes et par Google).",
        validation: (rule) => rule.required().error("Ajoutez une description de la photo."),
      }),
    ],
  }),
];
