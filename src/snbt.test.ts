import { createFloat, createInteger, parse } from './snbt';

describe('test snbt parser', () => {
  it('should success', () => {
    expect(parse('01')).toStrictEqual(createInteger(1));
    expect(parse('0x18')).toStrictEqual(createInteger(0x18n, false));
    expect(parse('0b11')).toStrictEqual(createInteger(0b11n, false));
    expect(parse('-0b11s')).toStrictEqual(createInteger(-0b11n));
    expect(parse('0.11')).toStrictEqual(createFloat(0.11));
    expect(parse('0.11111111111111')).toStrictEqual(createFloat(0.11111111111111));
    expect(parse('0.11111111111111f')).toStrictEqual(createFloat(0.11111111111111, 'float'));
    expect(parse('-.11111111111111f')).toStrictEqual(createFloat(-.11111111111111, 'float'));
    expect(parse('.88e19')).toStrictEqual(createFloat(.88e19));
  });
  test.failing('should fail', () => {
    parse('-0x11');
  });
});
