import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import "@testing-library/jest-dom/vitest";
import * as previewAnnotations from "./preview";

// Apply Storybook's project annotations (from preview.ts), and the a11y addon's:
// without its annotations here, the addon is listed in `main.ts` and axe never
// runs in the story tests, which then pass whatever a story draws.
setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);
