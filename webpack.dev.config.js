// Copyright 2025 The Casibase Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {spawn} = require("child_process");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const defaultInclude = path.resolve(__dirname, "src");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"},
        ],
        include: defaultInclude,
      },
      {
        test: /\.jsx?$/,
        use: [{loader: "babel-loader"}],
        include: defaultInclude,
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        use: [{loader: "file-loader?name=img/[name]__[hash:base64:5].[ext]"}],
        include: defaultInclude,
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [{loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]"}],
        include: defaultInclude,
      },
    ],
  },
  target: "electron-renderer",
  plugins: [
    new HtmlWebpackPlugin({title: "Casibase Helper"}),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
    }),
    // copy i18n language file
    new CopyWebpackPlugin({
      patterns: [
        {from: "src/locales", to: "locales"},
      ],
    }),
  ],
  devtool: "cheap-source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    stats: {
      colors: true,
      chunks: false,
      children: false,
    },
    before() {
      spawn(
        "electron",
        ["."],
        {shell: true, env: process.env, stdio: "inherit"}
      )
        .on("close", () => process.exit(0))
        .on("error", spawnError => {
          // Log error in a way that doesn't use console.error in production
          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.error(spawnError);
          }
        });
    },
  },
};
