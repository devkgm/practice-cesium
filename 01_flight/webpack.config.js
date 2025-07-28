const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumBaseUrl = path.resolve(__dirname, "dist/static/Cesium");
const dotenv = require("dotenv");
const webpack = require("webpack");
module.exports = () => {
  const env = dotenv.config({ path: "./.env" }).parsed;
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});
  return {
    entry: "./src/index.js",
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
    module: {
      rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: "./index.html" }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(cesiumSource, "Workers"),
            to: `${cesiumBaseUrl}/Workers`,
          },
          {
            from: path.join(cesiumSource, "ThirdParty"),
            to: `${cesiumBaseUrl}/ThirdParty`,
          },
          {
            from: path.join(cesiumSource, "Assets"),
            to: `${cesiumBaseUrl}/Assets`,
          },
          {
            from: path.join(cesiumSource, "Widgets"),
            to: `${cesiumBaseUrl}/Widgets`,
          },
        ],
      }),
      new webpack.DefinePlugin(envKeys),
    ],
    devServer: {
      static: {
        directory: path.resolve(__dirname, "dist"),
      },

      port: 8080,
    },
  };
};
