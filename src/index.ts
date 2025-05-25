import * as highlight from './snbt-highlighter.gen';
import { SNBTValue } from './snbt-parser.base';
import * as parser from './snbt-parser.gen';

export {
  IntegerValue,
  FloatValue,
  IntegerList,
  SNBTValue,
  createInteger,
  createFloat,
} from './snbt-parser.base';

export type HighlightToken = {
  start: number;
  end: number;
  type:
    | 'number'
    | 'numberSuffix'
    | 'string'
    | 'key'
    | 'operation'
    | 'arrayType'
    | 'escape';
};

export const parse: (
  input: string,
  options?: Record<string, any>,
) => SNBTValue = parser.parse;

export const highlights: (
  input: string,
  options?: Record<string, any>,
) => HighlightToken[] = (input, options) => {
  const tokens = highlight.parse(input, options) as HighlightToken[];
  const occupiedRange = [] as [number, number][];
  return [
    ...tokens
      .filter(t => t.type !== 'escape')
      .filter(t => t.start !== t.end)
      .reverse()
      .filter(token => {
        if (
          occupiedRange.some(
            range => token.start <= range[1] - 1 && range[0] <= token.end - 1,
          )
        ) {
          return false;
        }
        occupiedRange.push([token.start, token.end]);
        return true;
      })
      .reverse(),
    ...tokens.filter(t => t.type === 'escape'),
  ];
};
