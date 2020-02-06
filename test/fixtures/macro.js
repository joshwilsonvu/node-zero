'use strict';

// Babel macros should work
module.exports = {
  "src/index.js": `
    import env from 'penv.macro';
    import inspect from 'inspect.macro';

    const foo = {
      hello: person => {
        const greeting = env({
          development: "HI",
          production: "Salutations"
        })
        inspect(greeting + ", " + person + "!");
      }
    }

    export default foo;`
};