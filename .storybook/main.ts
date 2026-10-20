import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    {
      // MDX v3 parses CommonMark, which has no tables. Without remark-gfm every `| a | b |` row
      // in a documentation page renders as literal pipes run together in one paragraph.
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    // axe over every story; the `storybook` vitest project fails a story on a violation.
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  devServer: {
    open: false,
  },
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss());
    // Use ESM versions for browser compatibility
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "echarts-for-react/lib/core": "echarts-for-react/esm/core",
      "fast-deep-equal": "fast-deep-equal/es6",
    };
    return config;
  },
};
export default config;
