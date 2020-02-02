'use strict';

process.chdir('test');

const path = require('path');
const fs = require("fs");
const zero = require('../lib/index');

beforeAll(() => {
  if (!fs.existsSync('src')) {
    fs.mkdirSync('src');
  }
});

test('basic program works', async () => {
  const fixture = require('./fixtures/helloworld')
  try {
    await populate(fixture);
    const logSpy = jest.spyOn(global.console, 'log');
    const exitSpy = jest.spyOn(global.process, 'exit').mockImplementation(() => {});

    expect(fs.existsSync(path.resolve('.','src', 'server.js'))).toBeTruthy();
    expect(fs.readFileSync(path.resolve('.','src', 'server.js'), 'utf8')).toMatch(/^[ \n]*import sayHello/);
    const { warnings, errors } = await zero.build('./src/server.js', {
      //fs: fs
    });
    expect(warnings).toEqual([]);
    expect(errors || []).toEqual([]);
    expect(fs.existsSync(path.resolve('build', 'server.js'))).toBeTruthy();
    expect(exitSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    exitSpy.mockRestore();
  } finally {
    await unpopulate(fixture);
  }
});

async function populate(files) {
  return await Promise.all(Object.keys(files).map(file =>
      fs.promises.writeFile(file, files[file], 'utf8')
  ));
}

async function unpopulate(files) {
  return await Promise.all(Object.keys(files).map(file =>
    fs.promises.unlink(file)
  ));
}