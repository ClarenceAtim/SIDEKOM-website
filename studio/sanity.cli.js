// Settings for the `sanity` command line (npm run dev, npx sanity deploy, ...).
import { defineCliConfig } from "sanity/cli";
import { projectId, dataset } from "./project.js";

export default defineCliConfig({
  api: { projectId, dataset },
  server: { port: 3333 },
  // The address of the online panel: https://sidekom.sanity.studio
  studioHost: "sidekom",
  // Identifies the online panel so `npx sanity deploy` updates it without asking (not a secret)
  deployment: { appId: "e151lm7vbfupkc05wwz1o3kw" },
});
