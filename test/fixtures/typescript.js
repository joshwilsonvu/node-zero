'use strict';

const path = require('path');

// TypeScript should work
module.exports = {
  [path.join('src', 'server.ts')]: `
    import sayHello from "./say-hello"

    const person = { name: "Joe" };
    sayHello(person);
  `,
  [path.join('src', 'say-hello.ts')]: `
    interface Person {
      name: string
    }
    function sayHello(person: Person) {
      console.log("Hello " + person.name);
    }
    export default sayHello;
  `,
  'tsconfig.json': `
  {
    "compilerOptions": {
      "lib": [
        "dom",
        "dom.iterable",
        "esnext"
      ],
      "allowJs": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "strict": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "noEmit": true
    },
    "include": ["src/*.ts"]
  }
`,
}