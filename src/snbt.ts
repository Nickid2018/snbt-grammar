import * as snbt from './snbt.gen';
import * as highlight from './snbt-highlighter.gen';
import * as base from './snbt.base';

export type HighlightToken = {
  start: number;
  end: number;
  type:
    | 'number'
    | 'numberSuffix'
    | 'string'
    | 'key'
    | 'operation'
    | 'arrayType';
};
export type IntegerValue = base.IntegerValue;
export type FloatValue = base.FloatValue;
export type IntegerList = base.IntegerList;
export type SNBTValue = base.SNBTValue;
export const createInteger = base.createInteger;
export const createFloat = base.createFloat;

export const parse: (
  input: Parameters<typeof snbt.parse>[0],
  options?: Parameters<typeof snbt.parse>[1]
) => SNBTValue = snbt.parse;

export const highlights: (
  input: Parameters<typeof highlight.parse>[0],
  options?: Parameters<typeof highlight.parse>[1]
) => HighlightToken[] = (input, options) => {
  const tokens = highlight.parse(input, options) as HighlightToken[];
  const occupiedRange = [] as [number, number][];
  return tokens
    .reverse()
    .filter(token => {
      if (
        occupiedRange.some(
          range => token.start <= range[1] - 1 && range[0] <= token.end - 1
        )
      ) {
        return false;
      }
      occupiedRange.push([token.start, token.end]);
      return true;
    })
    .reverse();
};
