import type { StorybookViteConfig } from "@storybook/builder-vite";
import path from "path";
import { aliases } from "../vite.config";

const config: StorybookViteConfig = {
  staticDirs: ['../public'],
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-dark-mode"
  ],
  core: {
    builder: "@storybook/builder-vite",
  },
  framework: '@storybook/react',
  async viteFinal(config) {
    config.root = path.resolve(__dirname, "../src");

    config.publicDir = path.resolve(__dirname, "../public");

    config.resolve = {
      ...config.resolve,
      alias: aliases,
    };

    return config;
  },
};

export default config;
