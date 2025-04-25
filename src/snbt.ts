import * as gen from './snbt.gen';
import * as base from './snbt.base';

export const parse = gen.parse;
export type ParseError = gen.ParseError;
export type SyntaxError = gen.SyntaxError;
export type IntegerValue = base.IntegerValue;
export type FloatValue = base.FloatValue;
export const createInteger = base.createInteger;
export const createFloat = base.createFloat;
