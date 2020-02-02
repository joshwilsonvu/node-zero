'use strict';

const path = require('path');

// Babel macros should work
module.exports = {
  [path.join(process.cwd(), 'src', 'server.js')]: `
    import sayHello from "./say-hello"
    sayHello();
  `,
  [path.join(process.cwd(), 'src', 'say-hello.js')]: `
    function sayHello() {
      console.log("Hello World");
    }
    export default sayHello;
  `,
};