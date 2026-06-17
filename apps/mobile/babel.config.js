module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@api": "./src/services",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@i18n": "./src/i18n",
            "@screens": "./src/screens",
            "@theme": "./src/theme",
            "@types": "./src/types",
            "@utils": "./src/utils",
          },
        },
      ],
    ],
  };
};
