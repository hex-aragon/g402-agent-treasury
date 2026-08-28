import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import vinext from "vinext";
import { sites } from "./build/sites-vite-plugin";
import hostingConfig from "./.openai/hosting.json";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID = "00000000-0000-4000-8000-000000000000";

export default defineConfig({
  plugins: [
    vinext(),
    sites(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      inspectorPort: false,
      config: {
        main: "./worker/sites-entry.ts",
        compatibility_flags: ["nodejs_compat"],
        d1_databases: hostingConfig.d1
          ? [{ binding: hostingConfig.d1, database_name: "g402-scan", database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID }]
          : [],
      },
    }),
  ],
});
