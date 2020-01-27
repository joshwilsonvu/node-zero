'use strict';

const zero = require('./index');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const args = process.argv.slice(2);
switch (args[0]) {
  case 'build':
  case 'b':
    zero.build(args[1] || undefined)
    break;
  case 'pack':
  case 'package':
  case 'p':
    zero.pack(args[1] || undefined);
    break;

  case 'start':
  case 's':
    zero.start(args[1] || undefined);
    break;
  default:
    // start by default
    zero.start(args[0] || undefined);
    break;
}