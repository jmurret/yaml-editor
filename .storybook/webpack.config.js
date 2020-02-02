module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve("awesome-typescript-loader")
  });
  config.module.rules.push({
    test: /node_modules[\\|/](jsonc-parser|vscode-languageserver-types)/,
    use: { loader: "umd-compat-loader" }
  });
  config.resolve.extensions.push(".ts", ".tsx");
  config.output.globalObject = "this";
  config.node = {
    fs: "empty"
  };
  return config;
};
