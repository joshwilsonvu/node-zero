'use strict';

const path = require('path');

// Babel macros should work
module.exports = {
  [path.join('src', 'server.js')]: `
    import sayHello from "./say-hello"
    sayHello();
  `,
  [path.join('src', 'say-hello.js')]: `
    function sayHello() {
      console.log("Hello World");
    }
    export default sayHello;
  `,
};