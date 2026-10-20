import type { Preview } from "@storybook/react-vite";
import "../src/main.css";
import "../src/Components/Formatter/prism.css"; // Import PrismJS styles
import { knownViolations } from "./a11y-known";

const preview: Preview = {
  parameters: {
    // A violation fails the story. The ones stories already had are listed in
    // `a11y-known.ts`, by story and rule, and switched off below for that story
    // alone: a rule off here would be off for every story.
    a11y: { test: "error" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    backgrounds: {
      options: {
        light: {
          name: "light",
          value: "#ffffff",
        },

        dark: {
          name: "dark",
          value: "#1f2937", // Gray-800
        },

        primary: {
          name: "primary",
          value: "#0c4a6e", // Primary-900
        },

        secondary: {
          name: "secondary",
          value: "#312e81", // Secondary-900
        }
      }
    },
  },

  // Applied before the story renders, which is when the a11y addon reads its
  // parameters: the known rules go off for this story and no other.
  beforeEach: ({ parameters, title, name }) => {
    const rules = knownViolations[title]?.[name];
    if (rules) {
      parameters.a11y = {
        ...parameters.a11y,
        options: { rules: Object.fromEntries(rules.map((rule) => [rule, { enabled: false }])) },
      };
    }
  },

  initialGlobals: {
    backgrounds: {
      value: "light"
    }
  }
};

export default preview;
