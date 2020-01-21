'use strict';

const path = require("path");
const fs = require("fs");
const { fs: memfs } = require("memfs");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const StartServerPlugin = require("start-server-webpack-plugin");



/**
 * zero - a script for cleanly using the latest JS/TS on the server with zero configuration.
 *        Comes with webpack hot module replacement and sane linting built in.
 * 
 * $ zero [start]
 * zero()
 *   Starts zero in watch mode, entering at ${cwd}/src/server.
 * 
 * $ zero build
 * zero({ env: "production" })
 *   Runs a production mode build to ${cwd}/build/server.js.
 * 
 * $ zero package
 * zero({ package: true })
 *   Runs a production mode package build to package.json[main].
 */
async function zero({
  env = process.env.NODE_ENV || "development",
  cwd = fs.realpathSync(process.cwd()),
  package, // falsy | true | "umd" | "var" 
  webpackConfigOverrides // custom config merged in as an escape hatch
}) {
  if (typeof entry !== "string") throw new Error(`Multi-part entries not supported: ${JSON.stringify(entry)}.`);
  if (package) {
    env = process.env.NODE_ENV = "production"; // force production mode when building a library
  }
  let DEV = env === "development";
  let PROD = env === "production";
  let PACK = Boolean(package);

  let paths = {
    appSrc: path.join(cwd, "src"),
    appBuild: path.join(cwd, "build"),
    appEntry: path.join(cwd, "src", "server.js"),
    appPackageJson: path.join(cwd, "package.json")
  }

  
  let webpackConfig = {
    entry: paths.appEntry,
    mode: PROD ? "production" : DEV && "development",
    bail: PROD,
    target: "node",
    externals: [ nodeExternals() ],
    output: {
      path: appBuild,
      filename: "server.js"
    },
    module: {
      // update these to match state of the art server side rules
      rules: [
        {
          enforce: "pre",
          test: /\.(js|jsx)$/,
          use: "eslint-loader",
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          use: "babel-loader",
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      ...(DEV && [
        new StartServerPlugin(serverPath),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
      ]),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env": { BUILD_TARGET: JSON.stringify("server") },
      }),
    ],
    
    hot: DEV,
    watch: DEV,
    watchOptions: {
      poll: 2000,
      aggregateTimeout: 600,
      ignored: /node_modules/
    }
  };
  if (webpackConfigOverrides) {
    // merge overrides at your own risk
    webpackConfig = require("webpack-merge")(webpackConfig, webpackConfigOverrides);
  }
  
  let compiler = webpack(webpackConfig);
  if (DEV) {
    compiler.outputFileSystem = memfs;
  }
  compiler.watch
}

// run zero() if this module is run directly
const MAIN = require.main === module;
if (MAIN) {
  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on('unhandledRejection', err => {
    throw err;
  });
  zero();
} else {
  module.exports = zero;
}