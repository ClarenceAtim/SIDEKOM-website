// Helpers for fields written in the five languages of the website.
// French is always shown and required; the other languages are grouped in a box that opens on click.
import { defineField } from "sanity";

export const languages = [
  { id: "fr", title: "Français" },
  { id: "en", title: "Anglais (English)" },
  { id: "es", title: "Espagnol (Español)" },
  { id: "pt", title: "Portugais (Português)" },
  { id: "ar", title: "Arabe (العربية)" },
];

export const FALLBACK_NOTE = "Les langues vides s'affichent en français.";

// localized({ name, title, description, type: "string" | "text" | "array", of, maxLength, rows, frRequired })
export function localized({ name, title, description, type = "string", of, maxLength, rows, frRequired = true }) {
  return defineField({
    name,
    title,
    description,
    type: "object",
    fieldsets: [
      { name: "translations", title: "Autres langues (facultatif)", options: { collapsible: true, collapsed: true } },
    ],
    fields: languages.map((language) =>
      defineField({
        name: language.id,
        title: language.id === "fr" && frRequired ? `${language.title} (obligatoire)` : language.title,
        type,
        ...(of ? { of } : {}),
        ...(rows ? { rows } : {}),
        fieldset: language.id === "fr" ? undefined : "translations",
        validation: (rule) => {
          let result = rule;
          if (language.id === "fr" && frRequired) result = result.required().error("Le texte en français est obligatoire.");
          if (maxLength) result = result.max(maxLength).error(`${maxLength} caractères maximum.`);
          return result;
        },
      }),
    ),
  });
}

// Today's date as YYYY-MM-DD (default value for date fields)
export const today = () => new Date().toISOString().slice(0, 10);
