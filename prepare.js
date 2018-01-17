const readFileSync = require('fs').readFileSync;
const writeFileSync = require('fs').writeFileSync;
const unlinkSync = require('fs').unlinkSync;
const babel = require('babel-core');
const lsrSync = require('lsr').lsrSync;

const pkg = require(__dirname +
  '/packages/' +
  process.argv[2] +
  '/package.json');
lsrSync(__dirname + '/packages/' + process.argv[2] + '/lib').forEach(entry => {
  if (entry.isFile() && /\.jsx?$/.test(entry.path)) {
    const isPublic = /\@public\b/.test(readFileSync(entry.fullPath, 'utf8'));
    writeFileSync(
      entry.fullPath.replace(/\.jsx$/, '.js'),
      babel.transformFileSync(entry.fullPath, {
        babelrc: false,
        presets: [require.resolve('@moped/babel-preset/browser')],
      }).code,
    );
    if (/\.jsx$/.test(entry.fullPath)) {
      unlinkSync(entry.fullPath);
    }
    if (isPublic) {
      writeFileSync(
        __dirname +
          '/packages/' +
          process.argv[2] +
          '/' +
          entry.path.substr(2).replace(/\.jsx$/, '.js'),
        "// @autogenerated\n\nmodule.exports = require('./lib/" +
          entry.path.substr(2).replace(/\.jsx?$/, '') +
          "');",
      );
      writeFileSync(
        __dirname +
          '/packages/' +
          process.argv[2] +
          '/' +
          entry.path.substr(2).replace(/\.jsx?$/, '.d.ts'),
        "// @autogenerated\n\nexport * from './lib/" +
          entry.path.substr(2).replace(/\.jsx?$/, '') +
          "';",
      );
    }
  }
});