#!/usr/bin/env node
'use strict';

const path = require("path");
const assert = require('assert');
const doStart = require('./scripts/start');
const doBuild = require('./scripts/build');
const doTest = require('./scripts/test');
const doPack = require('./scripts/pack');

const defaultEntry = path.join('src', 'server.js');

/**
 * zero - a script for cleanly using the latest JS/TS on the server with zero configuration.
 *        Comes with webpack hot module replacement and sane linting built in.
 *

 * $ zero build [entry]
 * zero({ env: "production" })
 *   Runs a production mode build to ${cwd}/build/zero.js.
 *
 * $ zero package
 * zero({ package: true })
 *   Runs a production mode package build to package.json[main].
 */

 /**
  * zero()
  * zero.start()
  *
  * Starts zero in watch mode, entering at [entry] or ${cwd}/src/server.
  *
  *
  * @param {object} webpackConfigOverrides
  */
const zero = {
  start(entry = defaultEntry, options = {}) {
    validateEntry(entry);
    validateOptions(options);
    return doStart(entry, options);
  },

  /**
   * Runs test with jest.
   */
  test(entry = defaultEntry, options = {}) {
    validateEntry(entry);
    validateOptions(options);
    process.env.NODE_ENV = 'test';
    return doTest(entry, options);
  },

/**
 * Runs a production mode build to ${cwd}/build/zero.js.
 */
  build(entry = defaultEntry, options = {}) {
    validateEntry(entry);
    validateOptions(options);
    return doBuild(entry, options);
  },

/**
 * Runs a production mode package build to package.json[main].
 */
  pack(entry = defaultEntry, options = {}) {
    validateEntry(entry);
    validateOptions(options);
    return doPack(entry, options);
  },

  /**
   * Parses command line arguments and runs the appropriate command
   * @param  {...string} args command line arguments
   */
  cli(...args) {
    switch (args[0]) {
      case 'pack':
      case 'package':
      case 'p':
        return { type: 'pack', result: zero.pack(args[1] || undefined) };
      case 'test':
      case 't':
        return { type: 'test', result: zero.test(args[1] || undefined) };
      case 'build':
      case 'b':
        return { type: 'build', result: zero.build(args[1] || undefined) }
      case 'start':
      case 's':
        return { type: 'start', result: zero.start(args[1] || undefined) };
      default:
        // start by default
        return { type: 'start', result: zero.start(args[0] || undefined) };
    }
  }
};

function validateEntry(entry) {
  if (typeof entry !== "string") {
    throw new Error(`Multi-part entries not supported: ${JSON.stringify(entry)}.`);
  }
  const relative = path.relative(process.cwd(), entry);
  if (!relative || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error(`Entry point ${JSON.stringify(entry)} must be within project root ${JSON.stringify(process.cwd())}.`)
  }
}

function validateOptions({ fs, webpackConfigOverrides }) {
  if (webpackConfigOverrides) {
    assert(typeof webpackConfigOverrides !== 'object', 'Webpack config overrides should be an object.');
  }
  if (fs) {
    assert(typeof fs === 'object');
  }
}

module.exports = zero;