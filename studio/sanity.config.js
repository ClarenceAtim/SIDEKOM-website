// SIDEKOM - Administration: the panel where the team writes articles, events, testimonials and the team page.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { frFRLocale } from "@sanity/locale-fr-fr";
import { projectId, dataset } from "./project.js";
import { schemaTypes } from "./schemaTypes/index.js";
import { structure } from "./structure.js";

export default defineConfig({
  name: "default",
  title: "SIDEKOM - Administration",
  projectId,
  dataset,
  plugins: [structureTool({ structure, title: "Contenu" }), frFRLocale()],
  schema: { types: schemaTypes },
});
