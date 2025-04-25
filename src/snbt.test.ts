import { createFloat, createInteger, parse } from './snbt';

describe('test snbt parser', () => {
  it('should success', () => {
    expect(parse('01')).toStrictEqual(createInteger(1));
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
    expect(parse('{a:"bb",   b   :   22}')).toStrictEqual({
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
  });
  test.failing('should fail A', () => parse('-0x11'));
  test.failing('should fail B', () => parse('[L;20, 0x111111111111111111]'));
});
