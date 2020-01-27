'use strict';

const path = require('path');
const cwd = process.cwd();

module.exports = entry => ({
  cwd: cwd,
  appSrc: path.join(cwd, "src"),
  appBuild: path.join(cwd, "build"),
  appEntry: path.join(cwd, entry),
  appPackageJson: path.join(cwd, "package.json"),
  appYarnLock: path.join(cwd, 'yarn.lock'),
  appTsConfig: path.join(cwd, 'tsconfig.json'),
  appNodeModules: path.join(cwd, 'node_modules'),
  moduleFileExtensions: ['mjs', 'js', 'ts', 'tsx', 'json', 'jsx']
});