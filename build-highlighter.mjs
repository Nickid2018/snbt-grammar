import pkg from 'peggy';
import fs from 'node:fs';

const source = fs.readFileSync('./src/snbt-highlighter.pegjs').toString();
let parser = pkg.generate(source, {
  format: 'es',
  output: 'source',
});
parser = parser.replaceAll(
  'function error(message, location)',
  'function error(message, location?)'
);
parser = parser.replaceAll(
  'function peg$computeLocation(startPos, endPos, offset)',
  'function peg$computeLocation(startPos, endPos, offset?)'
);
parser = parser.replaceAll(
  'function peg$SyntaxError(message, expected, found, location)',
  'function peg$SyntaxError(message, expected, found, location): void'
);
parser = parser.replaceAll(
  'options = options !== undefined ? options : {};',
  'options = options !== undefined ? options : {}; const tokens = [];'
);
fs.writeFileSync('./src/snbt-highlighter.gen.ts', parser);
