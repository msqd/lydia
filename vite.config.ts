import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";
import { glob } from "glob";
import { readFileSync } from "node:fs";
import { extname, dirname, basename } from "node:path";

/**
 * Generates appropriate asset filenames for the component library build.
 * 
 * CSS assets:
 * - Uses predictable names without hashes for easy consumer imports
 * - Places all CSS files in 'styles/' directory for organization
 * - Special handling for main.css to maintain consistency
 * 
 * Other assets (fonts, images, etc.):
 * - Uses hashed filenames for cache busting
 * - Places in 'assets/' directory with original extension
 * 
 * @param assetInfo - Rollup asset information object
 * @returns Formatted asset filename with appropriate directory structure
 */
function generateAssetFilename(assetInfo: { name?: string }): string {
  // Handle CSS files - predictable names for consumer imports
  if (assetInfo.name?.endsWith('.css')) {
    // Special case for main stylesheet to maintain naming consistency
    if (assetInfo.name.includes('main')) {
      return 'styles/main.css';
    }
    // All other CSS files use their original name in styles directory
    return `styles/[name].css`;
  }
  
  // Handle other assets (fonts, images, etc.) - use hash for cache busting
  return "assets/[name]-[hash][extname]";
}

const packageJson = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"));

/**
 * Every runtime and peer dependency, and each of its subpaths, stays an import of the published
 * files. Matching resolved paths instead (e.g. /node_modules/) would emit build-machine absolute paths.
 */
const externalDependencies = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
].flatMap((name) => [name, new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}/`)]);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // Self-referencing: @msqd/lydia/* resolves to src/* for internal imports
      "@msqd/lydia": resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    cssCodeSplit: true, // Enable CSS code splitting for component library
    emptyOutDir: false, // Ne pas vider le répertoire dist pour préserver les fichiers .d.ts
    rollupOptions: {
      // Make sure to externalize dependencies that shouldn't be bundled
      external: externalDependencies,

      // Generates multiple entry points for each component
      input: {
        index: "./src/index.ts",
        styles: "./src/styles.css",
        ...Object.fromEntries(
          glob
            .sync("src/{Components,Elements,Pages,Models,Services,Config,Hooks}/**/*.{ts,tsx}", {
              ignore: ["**/*.stories.tsx", "**/*.test.tsx", "**/*.test.ts", "**/*.test-d.{ts,tsx}", "**/Testing.tsx"],
            })
            .map((file) => {
              const name = basename(file, extname(file));
              const dir = dirname(file).replace("src/", "");
              return [
                // This will be the output filename - generating a structure like Components/Badges/Badge.js
                `${dir}/${name}`,
                // This is the source file path
                file,
              ];
            }),
        ),
      },

      output: {
        // Preserve the directory structure in the output
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        // Use extracted function for asset filename generation
        assetFileNames: generateAssetFilename,
        // Ensure each file has its own export
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
    outDir: "dist",
  },
});
