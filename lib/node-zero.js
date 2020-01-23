#!/usr/bin/env node
'use strict';

const path = require("path");
const fs = require("fs");
const webpackConfig = require('./webpack.config');
const createCompiler = require('./cra-compiler');


/**
 * zero - a script for cleanly using the latest JS/TS on the server with zero configuration.
 *        Comes with webpack hot module replacement and sane linting built in.
 * 
 * $ zero [entry]
 * $ zero start [entry]
 * zero()
 *   Starts zero in watch mode, entering at [entry] or ${cwd}/src/server.
 * 
 * $ zero build [entry]
 * zero({ env: "production" })
 *   Runs a production mode build to ${cwd}/build/zero.js.
 * 
 * $ zero package
 * zero({ package: true })
 *   Runs a production mode package build to package.json[main].
 */
function zero({
  entry,
  env,
  pack, // true for a library instead of an application
  webpackConfigOverrides, // custom config merged in as an escape hatch
} = {}) {
  entry = entry || 'src/server';
  if (typeof entry !== "string") throw new Error(`Multi-part entries not supported: ${JSON.stringify(entry)}.`);

  pack = Boolean(pack);
  if (pack) {
    env = "production"; // force production mode when building a library
  }
  if (env) {
    process.env.NODE_ENV = env;
  } else {
    env = process.env.NODE_ENV || "development";
  }
  webpackConfigOverrides = webpackConfigOverrides || {};

  const cwd = process.cwd();
  const paths = {
    appSrc: path.join(cwd, "src"),
    appBuild: path.join(cwd, "build"),
    appEntry: path.join(cwd, entry),
    appPackageJson: path.join(cwd, "package.json"),
    appNodeModules: path.join(cwd, 'node_modules'),
    moduleFileExtensions: ['mjs', 'js', 'ts', 'tsx', 'json', 'jsx']
  };

  const dev = env === "development";
  const prod = env === "production";
  const useTypescript = fs.existsSync(paths.appTsConfig);
  const useYarn = fs.existsSync(paths.appYarnLock);

  let config = webpackConfig({ entry, env, pack, paths, dev, prod, useTypescript, useYarn })
  if (webpackConfigOverrides) {
    // merge overrides at your own risk
    config = require("webpack-merge")(config, webpackConfigOverrides);
  }
  
  let compiler = createCompiler({
    config,
    useYarn,
    useTypescript
  });

  if (dev) {
    throw new Error("TODO: watch/run and stop on ^C.");
    compiler.watch();
  }
}







// run zero() if this module is run directly
if (require.main === module) {
  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on('unhandledRejection', err => {
    throw err;
  });
  const args = process.argv.slice(2);
  switch(args[0]) {
    case 'build':
      zero({
        entry: args[1] || undefined,
        env: 'development',
      })
      break;
    case 'package':
      zero({
        entry: args[1] || undefined,
        package: true
      })
      break;
    case 'start':
    default:
      break;
  }
  zero();
} else {
  module.exports = zero;
}
