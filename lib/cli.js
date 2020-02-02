'use strict';

const zero = require('./index');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const args = process.argv.slice(2);
(async () => {
  let { type, result } = zero.cli(...args);
  if (result instanceof Promise) {
    result = await result;
  }
  switch (type) {
    case 'pack':
      break;
    case 'test':
      break;
    case 'build':
      // result is { warnings, errors }
      return process.exit(result instanceof Error || result.errors.length > 0);
    case 'start':
      // result is webpack Watching instance
      ['SIGINT', 'SIGTERM'].forEach(sig => {
        process.on(sig, () => {
          result.close();
          process.exit();
        });
      });
      break;
    }
})();