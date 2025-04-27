import { createFloat, createInteger, parse, highlights } from './';

describe('test snbt parser', () => {
  it('should success', () => {
    expect(parse('0')).toStrictEqual(createInteger(0));
    expect(parse('0x18')).toStrictEqual(createInteger(0x18n, false));
    expect(parse('0  b11')).toStrictEqual(createInteger(0b11n, false));
    expect(parse('- 0b 11s')).toStrictEqual(createInteger(-0b11n));
    expect(parse('0.11')).toStrictEqual(createFloat(0.11));
    expect(parse('0. 11111111111111')).toStrictEqual(
      createFloat(0.11111111111111)
    );
    expect(parse('0.11111111111111   f')).toStrictEqual(
      createFloat(0.11111111111111, 'float')
    );
    expect(parse('- .   11111111111111f')).toStrictEqual(
      createFloat(-0.11111111111111, 'float')
    );
    expect(parse('.88e19')).toStrictEqual(createFloat(0.88e19));
    expect(parse("'hello\"'")).toStrictEqual('hello"');
    expect(parse('"hel\\rl\\to"')).toStrictEqual('hel\rl\to');
    expect(parse('"hel\\u0027l\\x22o"')).toStrictEqual('hel\u0027l\x22o');
    expect(parse('{a:bb,   b   :   22}')).toStrictEqual({
      a: 'bb',
      b: createInteger(22),
    });
    expect(parse('{a: "c", a: 2ub}')).toStrictEqual({
      a: createInteger(2, false, 'byte'),
    });
    expect(parse('[B;20, 0x11]')).toStrictEqual({
      type: 'byte',
      values: [20n, 0x11n],
    });
    expect(parse('[L;20, 0x111111111111111111]')).toStrictEqual({
      type: 'long',
      values: [20n, 0x111111111111111111n],
    });
    expect(parse('[ {  }, {  } ]')).toStrictEqual([{}, {}]);
    expect(parse('tt')).toStrictEqual('tt');
    expect(parse('[uuid("0-0-0-0-0",)]')).toStrictEqual([
      { type: 'int', values: [0n, 0n, 0n, 0n] },
    ]);
  });
  it('should success B', () => {
    expect(highlights('0')).toStrictEqual([
      { start: 0, end: 1, type: 'number' },
    ]);
    expect(highlights('0x18')).toStrictEqual([
      { start: 0, end: 4, type: 'number' },
    ]);
    expect(highlights('0  b11')).toStrictEqual([
      { start: 0, end: 6, type: 'number' },
    ]);
    expect(highlights('- 0b 11s')).toStrictEqual([
      { start: 0, end: 7, type: 'number' },
      { start: 7, end: 8, type: 'numberSuffix' },
    ]);
    expect(highlights('0.11')).toStrictEqual([
      { start: 0, end: 4, type: 'number' },
    ]);
    expect(highlights('0. 11111111111111')).toStrictEqual([
      { start: 0, end: 17, type: 'number' },
    ]);
    expect(highlights('0.11111111111111   f')).toStrictEqual([
      { start: 0, end: 19, type: 'number' },
      { start: 19, end: 20, type: 'numberSuffix' },
    ]);
    expect(highlights('- .   11111111111111f')).toStrictEqual([
      { start: 0, end: 20, type: 'number' },
      { start: 20, end: 21, type: 'numberSuffix' },
    ]);
    expect(highlights('.88e19')).toStrictEqual([
      { start: 0, end: 6, type: 'number' },
    ]);
    expect(highlights("'hello\"'")).toStrictEqual([
      { start: 1, end: 7, type: 'string' },
    ]);
    expect(highlights('"hel\\rl\\to"')).toStrictEqual([
      { start: 1, end: 10, type: 'string' },
    ]);
    expect(highlights('"hel\\u0027l\\x22o"')).toStrictEqual([
      { start: 1, end: 16, type: 'string' },
    ]);
    expect(highlights('{a:bb,   b   :   22}')).toStrictEqual([
      { start: 1, end: 2, type: 'key' },
      { start: 3, end: 5, type: 'string' },
      { start: 9, end: 10, type: 'key' },
      { start: 17, end: 19, type: 'number' },
    ]);
    expect(highlights('{a: "c", a: 2ub}')).toStrictEqual([
      { start: 1, end: 2, type: 'key' },
      { start: 5, end: 6, type: 'string' },
      { start: 9, end: 10, type: 'key' },
      { start: 12, end: 13, type: 'number' },
      { start: 13, end: 15, type: 'numberSuffix' },
    ]);
    expect(highlights('[B;20, 0x11]')).toStrictEqual([
      { start: 1, end: 2, type: 'arrayType' },
      { start: 3, end: 5, type: 'number' },
      { start: 7, end: 11, type: 'number' },
    ]);
    expect(highlights('[L;20, 0x111111111111111111]')).toStrictEqual([
      { start: 1, end: 2, type: 'arrayType' },
      { start: 3, end: 5, type: 'number' },
      { start: 7, end: 27, type: 'number' },
    ]);
    expect(highlights('[ {  }, {  } ]')).toStrictEqual([]);
    expect(highlights('tt')).toStrictEqual([
      { start: 0, end: 2, type: 'string' },
    ]);
    expect(highlights('[uuid("0-0-0-0-0",)]')).toStrictEqual([
      { start: 1, end: 5, type: 'operation' },
      { start: 7, end: 16, type: 'string' },
    ]);
  });
  test.failing('should fail A', () => parse('-0x11'));
  test.failing('should fail B', () => parse('[L;20, 0x111111111111111111]'));
  test.failing('should fail C', () => parse('01'));
});
