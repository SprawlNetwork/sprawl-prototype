/*eslint-env node*/

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const isDevServer =
  path.basename(require.main.filename) === "webpack-dev-server.js";

console.log(isDevServer)

module.exports = {
  entry: {
    app: "./index.js"
  },
  devtool: "eval-source-map",
  devServer: {
    contentBase: "./dist"
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new webpack.DefinePlugin({
      ENABLE_REDUX_LOGS: isDevServer
    }),
    new HtmlWebpackPlugin({
      title: "Sprawl",
      template: "./index.ejs"
    })
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
