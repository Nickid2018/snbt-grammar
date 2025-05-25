import pkg from 'peggy';
import fs from 'node:fs';

const source = fs.readFileSync('./src/snbt-parser.pegjs').toString();
let parser = pkg.generate(source, {
  output: 'source',
  format: 'es',
  cache: true,
});
parser = `// AUTO GENERATED FILE by snbt.pegjs - DO NOT EDIT
import { base } from './snbt-parser.base';
${parser}
`;
parser = parser.replaceAll(
  'function error(message, location)',
  'function error(message, location?)',
);
parser = parser.replaceAll(
  'function peg$computeLocation(startPos, endPos, offset)',
  'function peg$computeLocation(startPos, endPos, offset?)',
);
parser = parser.replaceAll(
  'function peg$SyntaxError(message, expected, found, location)',
  'function peg$SyntaxError(message, expected, found, location): void',
);
fs.writeFileSync('./src/snbt-parser.gen.ts', parser);
