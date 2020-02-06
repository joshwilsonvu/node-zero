'use strict';

const fs = require("fs");
const webpack = require("webpack");
const chalk = require('chalk');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const webpackConfigure = require('../webpack.config');

module.exports = async function(entry, options = {}) {
  const paths = require('../paths')(entry);
  const useTypescript = fs.existsSync(paths.appTsConfig);

  let config = webpackConfigure({ env: 'production', paths, useTypescript })
  if (options.webpackConfigOverrides) {
    // merge overrides at your own risk
    config = require("webpack-merge")(config, options.webpackConfigOverrides);
  }

  const compiler = webpack(config);
  options.patchFileSystem && options.patchFileSystem(compiler);

  const {warnings, errors} = await build(compiler);
  const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';
  if (errors.length) {
    if (tscCompileOnError) {
      console.log(chalk.yellow(
        'Compiled with the following type errors (you may want to check these before deploying your app):\n'
      ));
      console.log(errors + '\n');
      console.log();
    } else {
      console.log(chalk.red('Failed to compile.\n'));
      console.log(errors + '\n');
      console.log();
    }
  } else if (warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(warnings.join('\n\n'));
    console.log(
      '\nSearch for the ' +
        chalk.underline(chalk.yellow('keywords')) +
        ' to learn more about each warning.'
    );
    console.log(
      'To ignore, add ' +
        chalk.cyan('// eslint-disable-next-line') +
        ' to the line before.\n'
    );
  } else {
    console.log(chalk.green('Compiled successfully.\n'));
  }
  return {
    warnings,
    errors
  }
}


// Create the production build and print the deployment instructions.
async function build(compiler) {
  // We used to support resolving modules according to `NODE_PATH`.
  // This now has been deprecated in favor of jsconfig/tsconfig.json
  // This lets you use absolute paths in imports inside large monorepos:
  if (process.env.NODE_PATH) {
    console.log(
      chalk.yellow(
        'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
      )
    );
    console.log();
  }

  console.log('Creating an optimized production build...');

  const [err, stats] = await new Promise(resolve => {
    compiler.run((err, stats) => {
      resolve([err, stats]);
    });
  });
  let messages;
  if (err) {
    if (!err.message) {
      throw err;
    }
    messages = formatWebpackMessages({
      errors: [err.message],
      warnings: [],
    });
  } else {
    messages = formatWebpackMessages(
      stats.toJson({ all: false, warnings: true, errors: true })
    );
  }
  if (messages.errors.length) {
    // Only keep the first error. Others are often indicative
    // of the same problem, but confuse the reader with noise.
    if (messages.errors.length > 1) {
      messages.errors.length = 1;
    }
    return {
      errors: messages.errors,
      warnings: [],
    };
  }
  if (
    process.env.CI &&
    (typeof process.env.CI !== 'string' ||
      process.env.CI.toLowerCase() !== 'false') &&
    messages.warnings.length
  ) {
    console.log(
      chalk.yellow(
        '\nTreating warnings as errors because process.env.CI = true.\n' +
          'Most CI servers set it automatically.\n'
      )
    );
    return {
      errors: messages.warnings,
      warnings: [],
    };
  }

  return {
    errors: [],
    warnings: messages.warnings,
  };
}

