'use strict';


const path = require('path');

// const fs = require('fs');
const fse = require('fs-extra');
const stripAnsi = require('strip-ansi');
const execa = require('execa');
const zero = require('../lib/index');

let procDir;
let logs, logSpy, exitSpy;
beforeAll(async () => {
  procDir = process.cwd();
  // set up a test/root directory for the test to run in
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
  // remove all files and directories under root
  const root = path.resolve(__dirname, 'root');
  const files = await fse.readdir(root);
  await Promise.all(files.map(f => path.resolve(root, f)).map(f => fse.remove(f)));
});

afterAll(async () => {
  // unmock
  logSpy.mockRestore();
  exitSpy.mockRestore();
  // return to original cwd and delete root directory
  process.chdir(procDir);
  const root = path.resolve(__dirname, 'root');
  await fse.remove(root);
})

test.each([
  ['basic ES6 modules', require('./fixtures/modules')],
  ['basic TypeScript', require('./fixtures/typescript')],
  ['babel macros', require('./fixtures/macro')],
])('%s should build without warnings', async (_, fixture) => {
  await populate(fixture);
  // Run the build using the first file in the fixture as the entry point
  const { warnings, errors } = await zero.build(Object.keys(fixture)[0]);

  expect(warnings).toEqual([]);
  expect(errors).toEqual([]);
  expect(await fse.pathExists(path.resolve('build', 'server.js'))).toBeTruthy();
  expect(exitSpy).not.toHaveBeenCalled();
  expect(logs).toMatchSnapshot();
  const {stdout} = await execa.node([path.resolve('build', 'server.js')]);
  expect(stdout).toMatchSnapshot();
}, 20000);


async function populate(files) {
  return await Promise.all(Object.keys(files).map(file =>
    fse.outputFile(file, files[file], 'utf8')
  ));
}
