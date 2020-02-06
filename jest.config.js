'use strict';
module.exports = {
  "testEnvironment": "node",
  "collectCoverage": false,
  "collectCoverageFrom": [
    "lib/**/*.js",
    "!**/node_modules/**"
  ],
  "testRegex": "(\\.|/)(test|spec)\\.[jt]sx?$"
}