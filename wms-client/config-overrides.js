const path = require("path");

// Webpack 5 treats packages with "type": "module" as fully specified.
// react-dnd 9 (pulled in by react-sortable-tree) imports extensionless paths.
function webpack(config) {
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    (warning) =>
      /Failed to parse source map/.test(warning.message || "") &&
      /react-double-scrollbar/.test(warning.message || ""),
  ];

  return config;
}

// Jest does not transform these "type": "module" packages. Point the imports
// their CJS builds use at the published CommonJS files.
function jestConfig(config) {
  config.moduleNameMapper = {
    ...(config.moduleNameMapper || {}),
    "^react-dnd$": path.join(
      "<rootDir>",
      "node_modules/react-sortable-tree/node_modules/react-dnd/dist/cjs/index.js"
    ),
    "^react-dnd-html5-backend$":
      "<rootDir>/node_modules/react-dnd-html5-backend/dist/cjs/index.js",
    "^dnd-core$": "<rootDir>/node_modules/dnd-core/dist/cjs/index.js",
  };

  return config;
}

module.exports = {
  webpack,
  jest: jestConfig,
};
