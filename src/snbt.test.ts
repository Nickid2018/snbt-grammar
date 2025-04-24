import { generate } from 'peggy';
import * as fs from 'node:fs';

const source = fs.readFileSync('./src/snbt.pegjs').toString()

describe('test snbt parser', () => {
  it('should success', () => {
    const parser = generate(source);
    expect(parser.parse(' 01')).toBe({ test: 'a' });
  });
});
