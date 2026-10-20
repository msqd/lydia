import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The vitest part is the config docs/integration.md gives consumers. No `ssr.noExternal`: dependencies stay
// external and load through Node ESM, as they do in a consumer's tests and server.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { dedupe: ["react", "react-dom"] },
  test: { environment: "jsdom" },
});
