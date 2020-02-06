'use strict';

// Babel macros should work
module.exports = {
  "src/index.js": `
    import env from 'penv.macro';

    const person = "Joe";
    const greeting = env({
      test: "HI",
      production: "Salutations"
    })
    console.log(greeting + ", " + person + "!");
  `
};