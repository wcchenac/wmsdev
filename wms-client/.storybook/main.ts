import type { StorybookConfig } from "@storybook/react-webpack5";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    {
      name: "@storybook/preset-create-react-app",
      options: {},
    },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  staticDirs: ["../public"],
  typescript: {
    check: false,
    reactDocgen: "react-docgen",
  },
  docs: {
    autodocs: false,
  },
  async webpackFinal(config) {
    config.resolve = config.resolve ?? {};
    const extensions = config.resolve.extensions ?? [];
    config.resolve.extensions = Array.from(
      new Set([".tsx", ".ts", ...extensions])
    );

    config.module = config.module ?? { rules: [] };
    config.module.rules = config.module.rules ?? [];
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      (warning: { message?: string }) =>
        /Failed to parse source map/.test(warning.message || "") &&
        /react-double-scrollbar/.test(warning.message || ""),
    ];

    return config;
  },
};

export default config;
