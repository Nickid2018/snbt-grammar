import * as gen from './snbt.gen';
import * as base from './snbt.base';

export type ParseError = gen.ParseError;
export type SyntaxError = gen.SyntaxError;
export type IntegerValue = base.IntegerValue;
export type FloatValue = base.FloatValue;
export type IntegerList = base.IntegerList;
export type SNBTValue = base.SNBTValue;
export const parse = gen.parse;
export const createInteger = base.createInteger;
export const createFloat = base.createFloat;
