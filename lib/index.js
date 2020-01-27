#!/usr/bin/env node
'use strict';

const path = require("path");
const assert = require('assert');
const doStart = require('./start');
const doBuild = require('./build');
const doTest = require('./test');
const doPack = require('./pack');

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
module.exports = {
  start(entry = 'src/server', options = {}) {
    validateEntry(entry);
    validateOptions(options);
    return doStart(entry, options);
  },

  /**
   * Runs test with jest.
   */
  test(entry = 'src/server', options = {}) {
    validateEntry(entry);
    validateOptions(options);
    process.env.NODE_ENV = 'test';
  },

/**
 * Runs a production mode build to ${cwd}/build/zero.js.
 */
  build(entry = 'src/server', options = {}) {
    validateEntry(entry);
    validateOptions(options);
    doBuild(entry, options);
  },

/**
 * Runs a production mode package build to package.json[main].
 */
  pack(entry = 'src/server', options = {}) {
    validateEntry(entry);
    validateOptions(options);
    require('./pack')(entry, options);
  },
};

function validateEntry(entry) {
  entry = entry || 'src/server';
  if (typeof entry !== "string") { 
    throw new Error(`Multi-part entries not supported: ${JSON.stringify(entry)}.`);
  }
  const relative = path.relative(process.cwd(), entry);
  if (!relative || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
    throw new Error(`Entry point ${JSON.stringify(entry)} must be within project root ${JSON.stringify(cwd)}.`)
  }
  return entry;
}

validateOptions({ fs, webpackConfigOverrides }) {
  if (webpackConfigOverrides) {
    assert(typeof webpackConfigOverrides !== 'object', 'Webpack config overrides should be an object.');
  }
}