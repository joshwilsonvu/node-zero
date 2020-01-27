'use strict';

const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const resolve = require("resolve");
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const StartServerPlugin = require("start-server-webpack-plugin");
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')

module.exports = ({ pack, paths, dev, prod, useTypescript }) => {

  return {
    entry: paths.appEntry,
    mode: prod ? "production" : dev && "development",
    bail: prod,
    target: "node",
    externals: [ nodeExternals() ],
    output: {
      path: paths.appBuild,
      filename: "server.js",
      futureEmitAssets: true,
      libraryTarget: pack ? "commonjs2" : undefined,
    },
    module: {
      // update these to match state of the art server side rules
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        // First, run the linter before Babel processes the JS.
        {
          test: /\.(js|mjs|jsx|ts|tsx)$/,
          resolve: {
            symlinks: false
          },
          // Loaders are executed in reverse order: eslint, then babel
          use: [
            {
              loader: "babel-loader",
              options: {
                babelrc: false,
                configFile: false,
                presets: [
                  [require('@babel/preset-env').default, { targets: { node: 'current' }, exclude: ['transform-typeof-symbol'] }],
                  useTypescript && [require('@babel/preset-typescript').default]
                ].filter(Boolean),
                plugins: [
                  // Experimental macros support
                  require('babel-plugin-macros'),
                  // Turn on legacy decorators for TypeScript files
                  useTypescript && [require('@babel/plugin-proposal-decorators').default, false],
                  // class { handleClick = () => { } }
                  [require('@babel/plugin-proposal-class-properties').default, { loose: true }],
                  // Adds Numeric Separators
                  require('@babel/plugin-proposal-numeric-separator').default,
                  // Object rest and spread
                  [require('@babel/plugin-proposal-object-rest-spread').default, { useBuiltIns: true }],
                  // Adds syntax support for import()
                  require('@babel/plugin-syntax-dynamic-import').default,
                  // Adds syntax support for optional chaining (.?)
                  require('@babel/plugin-proposal-optional-chaining').default,
                  // Adds syntax support for default value using ?? operator
                  require('@babel/plugin-proposal-nullish-coalescing-operator').default,
                  // Transform dynamic import to require
                  require('babel-plugin-dynamic-import-node'),
                ],
                overrides:[
                  !useTypescript && {
                    exclude: /\.tsx?$/,
                    plugins: [require('@babel/plugin-transform-flow-strip-types').default],
                  },
                  useTypescript && {
                    test: /\.tsx?$/,
                    plugins: [
                      [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
                    ],
                  },
                ].filter(Boolean),
                cacheDirectory: true,
                cacheCompression: false,
                compact: false
              }
            },
            {
              loader: "eslint-loader",
              options: {
                cache: true,
                formatter: require.resolve('react-dev-utils/eslintFormatter'),
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: __dirname,
                baseConfig: require("./eslint"),
                useEslintrc: false
              }
            },
          ],
          include: paths.appSrc,
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      dev && new StartServerPlugin(paths.appEntry),
      dev && new webpack.NamedModulesPlugin(),
      dev && new webpack.HotModuleReplacementPlugin(),
      dev && new CaseSensitivePathsPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env": { BUILD_TARGET: JSON.stringify("server") },
      }),
      // disable code splitting
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      PnpWebpackPlugin,
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      useTypescript && new ForkTsCheckerWebpackPlugin({
        typescript: resolve.sync('typescript', {
          basedir: paths.appNodeModules,
        }),
        async: dev,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        resolveModuleNameModule: process.versions.pnp
          ? `${__dirname}pnpTs.js`
          : undefined,
        resolveTypeReferenceDirectiveModule: process.versions.pnp
          ? `${__dirname}/pnpTs.js`
          : undefined,
        tsconfig: paths.appTsConfig,
        reportFiles: [
          '**',
          '!**/__tests__/**',
          '!**/?(*.)(spec|test).*',
          '!**/src/setupProxy.*',
          '!**/src/setupTests.*',
        ],
        silent: true,

      })
    ].filter(Boolean),
    resolveLoader: {
      plugins: [
        PnpWebpackPlugin.moduleLoader(module)
      ]
    },
    resolve: {
      extensions: paths.moduleFileExtensions
        .filter(ext => useTypescript || !ext.includes('ts'))
        .map(ext => `.${ext}`)
    },
    watch: dev,
    watchOptions: {
      poll: 2000,
      aggregateTimeout: 600,
      ignored: /node_modules/
    }
  };
}