import pkg from 'peggy';
import * as tsPlugin from 'peggy-ts';
import fs from 'node:fs';

const source = fs.readFileSync('./src/snbt.pegjs').toString();
let parser = pkg.generate(source, {
  output: 'source',
  typescript: true,
  plugins: [tsPlugin],
  cache: true,
});
parser = `
// AUTO GENERATED FILE by snbt.pegjs - DO NOT EDIT
import { base } from './snbt.base';

${parser}
`;
fs.writeFileSync('./src/snbt.gen.ts', parser);
