'use strict';

const fs = require("fs");
const webpack = require("webpack");
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const forkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const webpackConfigure = require('../webpack.config');

module.exports = function(entry, options = {}) {
  const paths = require('../paths')(entry);
  const useTypescript = fs.existsSync(paths.appTsConfig);
  const useYarn = fs.existsSync(paths.appYarnLock);

  let config = webpackConfigure({ env: 'development', entry, paths, useTypescript })
  if (options.webpackConfigOverrides) {
    // merge overrides at your own risk
    config = require("webpack-merge")(config, options.webpackConfigOverrides);
  }

  let compiler = createCompiler({ config, useYarn, useTypescript });

  console.log(chalk.cyan('Starting the server, watching for changes...'));
  const watching = compiler.watch();
  return watching; // .close() to stop
}


function createCompiler({
    config,
    useYarn,
    useTypescript,
  }) {
    const isInteractive = process.stdout.isTTY;
    const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';

    // "Compiler" is a low-level interface to Webpack.
    // It lets us listen to some events and provide our own custom messages.
    let compiler;
    try {
      compiler = webpack(config);
    } catch (err) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      console.log(err.message || err);
      console.log();
      process.exit(1);
    }

    // "invalid" event fires when you have changed a file, and Webpack is
    // recompiling a bundle. WebpackDevServer takes care to pause serving the
    // bundle, so if you refresh, it'll wait instead of serving the old one.
    // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
    compiler.hooks.invalid.tap('invalid', () => {
      if (isInteractive) {
        clearConsole();
      }
      console.log('Compiling...');
    });

    let isFirstCompile = true;
    let tsMessagesPromise;
    let tsMessagesResolver;

    if (useTypescript) {
      compiler.hooks.beforeCompile.tap('beforeCompile', () => {
        tsMessagesPromise = new Promise(resolve => {
          tsMessagesResolver = msgs => resolve(msgs);
        });
      });

      forkTsCheckerWebpackPlugin
        .getCompilerHooks(compiler)
        .receive.tap('afterTypeScriptCheck', (diagnostics, lints) => {
          const allMsgs = [...diagnostics, ...lints];
          const format = message =>
            `${message.file}\n${typescriptFormatter(message, true)}`;

          tsMessagesResolver({
            errors: allMsgs.filter(msg => msg.severity === 'error').map(format),
            warnings: allMsgs
              .filter(msg => msg.severity === 'warning')
              .map(format),
          });
        });
    }

    // "done" event fires when Webpack has finished recompiling the bundle.
    // Whether or not you have warnings or errors, you will get this event.
    compiler.hooks.done.tap('done', async stats => {
      if (isInteractive) {
        clearConsole();
      }

      // We have switched off the default Webpack output in WebpackDevServer
      // options so we are going to "massage" the warnings and errors and present
      // them in a readable focused way.
      // We only construct the warnings and errors for speed:
      // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
      const statsData = stats.toJson({
        all: false,
        warnings: true,
        errors: true,
      });

      if (useTypescript && statsData.errors.length === 0) {
        const delayedMsg = setTimeout(() => {
          console.log(
            chalk.yellow(
              'Files successfully emitted, waiting for typecheck results...'
            )
          );
        }, 100);

        const messages = await tsMessagesPromise;
        clearTimeout(delayedMsg);
        if (tscCompileOnError) {
          statsData.warnings.push(...messages.errors);
        } else {
          statsData.errors.push(...messages.errors);
        }
        statsData.warnings.push(...messages.warnings);

        // Push errors and warnings into compilation result
        // to show them after page refresh triggered by user.
        if (tscCompileOnError) {
          stats.compilation.warnings.push(...messages.errors);
        } else {
          stats.compilation.errors.push(...messages.errors);
        }
        stats.compilation.warnings.push(...messages.warnings);

        if (isInteractive) {
          clearConsole();
        }
      }

      const messages = formatWebpackMessages(statsData);
      const isSuccessful = !messages.errors.length && !messages.warnings.length;
      if (isSuccessful) {
        console.log(chalk.green('Compiled successfully!'));
      }
      if (isSuccessful && (isInteractive || isFirstCompile)) {
        printInstructions(useYarn);
      }
      isFirstCompile = false;

      // If errors exist, only show errors.
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        console.log(chalk.red('Failed to compile.\n'));
        console.log(messages.errors.join('\n\n'));
        return;
      }

      // Show warnings if no errors were found.
      if (messages.warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(messages.warnings.join('\n\n'));

        // Teach some ESLint tricks.
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
      }
    });

    return compiler;
  }

  function printInstructions() {
    console.log();
    console.log(`Your app is now running.`);
    console.log();
    console.log('Note that the development build is not optimized.');
    console.log(
      `To create a production build, use ${chalk.cyan(`zero build`)}.`
    );
    console.log();
  }