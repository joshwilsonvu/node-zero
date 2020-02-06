'use strict';


const path = require('path');

// const fs = require('fs');
const fse = require('fs-extra');
const stripAnsi = require('strip-ansi');
const zero = require('../lib/index');

describe('fixtures', () => {
  let procDir;
  let logs, logSpy, exitSpy;
  beforeAll(async () => {
    procDir = process.cwd();
    // set up a test/rootXXXXXX directory for the test to run in
    const root = path.resolve(__dirname, 'root');
    await fse.mkdirp(root);
    process.chdir(root);
    // mock console.log and process.exit
    logSpy = jest.spyOn(global.console, 'log').mockImplementation((...args) => {
      const line = args.map(stripAnsi).map(s => s.trim()).join(' ');
      line && logs.push(line);
    });
    exitSpy = jest.spyOn(global.process, 'exit').mockImplementation(code => {
      throw new Error(`Called process.exit(${code})`);
    });
  });

  beforeEach(async () => {
    logs = [];
    logSpy.mockClear();
    exitSpy.mockClear();
  })

  afterEach(async () => {
    // leave test directory
    process.chdir(procDir);
  });

  afterAll(async () => {
    // remove all test directories
    await fse.remove(root);
    // unmock
    logSpy.mockRestore();
    exitSpy.mockRestore();
  })

  test('basic program builds', async () => {
    await populate({
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
    });
    // Run the build
    const { warnings, errors } = await zero.build(path.join('src', 'server.js'));

    expect(warnings).toEqual([]);
    expect(errors).toEqual([]);
    expect(await fse.pathExists(path.resolve('build', 'server.js'))).toBeTruthy();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(logs).toMatchSnapshot();
  });

  test('typescript builds', async () => {
    await populate({
      [path.join('src', 'server.ts')]: `
        import sayHello from "./say-hello"

        sayHello(person);
      `,
      [path.join('src', 'say-hello.ts')]: `
        interface Person {
          name: string
        }
        function sayHello(greetee: Greetee) {
          console.log("Hello " + greetee.name);
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
    });
    // Run the build
    const { warnings, errors } = await zero.build(path.join('src', 'server.ts'));
    expect(warnings).toEqual([]);
    expect(errors).toEqual([]);
    expect(await fse.pathExists(path.resolve('build', 'server.js'))).toBeTruthy();
    expect(exitSpy).not.toHaveBeenCalled();
    expect(logs).toMatchSnapshot();
  });
});

async function populate(files) {
  return await Promise.all(Object.keys(files).map(file =>
    fse.outputFile(file, files[file], 'utf8')
  ));
}
