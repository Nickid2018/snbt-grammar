
// AUTO GENERATED FILE by snbt.pegjs - DO NOT EDIT
import { base } from './snbt.base';

namespace runtime {
  export interface Location {
    line: number;
    column: number;
    offset: number;
  }
  export interface LocationRange {
    source?: string | GrammarLocation;
    start: Location;
    end: Location;
  }
  export interface Range {
    source?: string | GrammarLocation;
    start: number;
    end: number;
  }
  export class GrammarLocation {
    source: string | GrammarLocation;
    start: Location;
    constructor(source: string | GrammarLocation, start: Location) {
      this.source = source;
      this.start = start;
    }
    toString(): string {
      return String(this.source);
    }
    offset(loc: Location): Location {
      return {
        line: loc.line + this.start.line - 1,
        column:
          loc.line === 1 ? loc.column + this.start.column - 1 : loc.column,
        offset: loc.offset + this.start.offset,
      };
    }
    static offsetStart(range: LocationRange): Location {
      if (range.source instanceof GrammarLocation) {
        return range.source.offset(range.start);
      }
      return range.start;
    }
    static offsetEnd(range: LocationRange): Location {
      if (range.source instanceof GrammarLocation) {
        return range.source.offset(range.end);
      }
      return range.end;
    }
  }
  export function padEnd(str: string, targetLength: number, padString: string) {
    padString = padString || " ";
    if (str.length > targetLength) {
      return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
  }
  export interface SourceText {
    source: any;
    text: string;
  }
  export interface Expectation {
    type: "literal" | "class" | "any" | "end" | "pattern" | "other";
    value: string;
  }
  export class ParseFailure { }
  export class ParseOptions {
    currentPosition?: number;
    silentFails?: number;
    maxFailExpected?: Expectation[];
    grammarSource?: string | GrammarLocation;
    library?: boolean;
    startRule?: string;
    [index: string]: unknown;
  }
  export type Result<T> = Failure | Success<T>;
  export interface Failure {
    success: false;
    remainder: string;
    failedExpectations: FailedExpectation[];
  }
  export interface Success<T> {
    success: true;
    value: T;
    remainder: string;
    failedExpectations: FailedExpectation[];
  }
  export interface FailedExpectation {
    expectation: Expectation;
    remainder: string;
  }
  export function isFailure(r: Result<unknown>): r is Failure {
    return !r.success;
  }
  function getLine(input: string, offset: number) {
    let line = 1;
    for (let i = 0; i < offset; i++) {
      if (input[i] === "\r") {
        if (input[i + 1] === "\n") {
          i++;
        }
        line++;
      } else if (input[i] === "\n") {
        line++;
      }
    }
    return line;
  }
  function getColumn(input: string, offset: number) {
    let column = 1;
    for (let i = offset; i > 0; i--) {
      if (["\n", "\r"].includes(input[i - 1])) {
        break;
      }
      column++;
    }
    return column;
  }
  export function getLocation(
    source: string | GrammarLocation | undefined,
    input: string,
    start: string,
    remainder: string,
  ): runtime.LocationRange {
    return {
      source,
      start: {
        offset: input.length - start.length,
        line: getLine(input, input.length - start.length),
        column: getColumn(input, input.length - start.length),
      },
      end: {
        offset: input.length - remainder.length,
        line: getLine(input, input.length - remainder.length),
        column: getColumn(input, input.length - remainder.length),
      },
    };
  }
  export function getRange(
    source: string | GrammarLocation | undefined,
    input: string,
    start: string,
    remainder: string,
  ) {
    return {
      source,
      start: input.length - start.length,
      end: input.length - remainder.length,
    };
  }
  export function getText(start: string, remainder: string) {
    return start.slice(0, remainder.length > 0 ? -remainder.length : undefined);
  }
}
export class ParseError extends Error {
  rawMessage: string;
  location: runtime.LocationRange;
  constructor(
    message: string,
    location: runtime.LocationRange,
    name: string = "parse error",
  ) {
    super(ParseError.#formatMessage(message, location));
    this.name = name;
    this.rawMessage = message;
    this.location = location;
  }
  static #formatMessage(message: string, location: runtime.LocationRange) {
    const source =
      location.source !== undefined ? String(location.source) : "<input>";
    return (
      `${source}:${location.start.line}:${location.start.column}: ` + message
    );
  }
}
export class SyntaxError extends ParseError {
  expected: runtime.Expectation[];
  found: string | null;
  constructor(
    expected: runtime.Expectation[],
    found: string,
    location: runtime.LocationRange,
    name: string = "syntax error",
  ) {
    super(SyntaxError.#formatMessage(expected, found), location, name);
    this.expected = expected;
    this.found = found;
  }
  static #formatMessage(
    expected: runtime.Expectation[],
    found: string,
  ): string {
    function encode(s: string): string {
      const entropyToken = "(fvo47fu3AwHrHsLEMNa7uUXYUF4rQgdm)";
      return (
        "'" +
        s
          .replaceAll("\\", entropyToken)
          .replaceAll("\x07", "\\a")
          .replaceAll("\b", "\\b")
          .replaceAll("\f", "\\f")
          .replaceAll("\n", "\\n")
          .replaceAll("\r", "\\r")
          .replaceAll("\t", "\\t")
          .replaceAll("\v", "\\v")
          .replaceAll("'", "\\'")
          .replaceAll(entropyToken, "\\\\") +
        "'"
      );
    }
    function describeExpected(expected: runtime.Expectation[]): string {
      const descriptions = [
        ...new Set(
          expected.map((e) => {
            if (e.type === "literal") {
              return encode(e.value);
            }
            return e.value;
          }),
        ),
      ];
      descriptions.sort();
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return `${descriptions[0]} or ${descriptions[1]}`;
        default:
          return (
            descriptions.slice(0, -1).join(", ") +
            ", or " +
            descriptions[descriptions.length - 1]
          );
      }
    }
    function describeFound(found: string): string {
      return found.length === 1 ? found : "end of input";
    }
    return (
      "found " +
      describeFound(found) +
      " but expecting " +
      describeExpected(expected)
    );
  }
}
const item27: runtime.Expectation = {
  type: "class",
  value: "/^[+\\-]/g"
}
const item28: runtime.Expectation = {
  type: "other",
  value: "sign"
}
const item33: runtime.Expectation = {
  type: "class",
  value: "/^[ \\t\\n\\f\\r\\xA0\\u2007\\u202F\\v\\x1C-\\x1F]/g"
}
const item34: runtime.Expectation = {
  type: "other",
  value: "whitespace"
}
const item54: runtime.Expectation = {
  type: "other",
  value: "decimal_numeral_char"
}
const item56: runtime.Expectation = {
  type: "other",
  value: "decimal_numeral"
}
const item57: runtime.Expectation = {
  type: "other",
  value: "float_whole_part"
}
const item59: runtime.Expectation = {
  type: "literal",
  value: "."
}
const item64: runtime.Expectation = {
  type: "other",
  value: "float_fraction_part"
}
const item72: runtime.Expectation = {
  type: "class",
  value: "/^[eE]/g"
}
const item78: runtime.Expectation = {
  type: "other",
  value: "float_exponent_part"
}
const item83: runtime.Expectation = {
  type: "class",
  value: "/^[DFdf]/g"
}
const item112: runtime.Expectation = {
  type: "other",
  value: "float_sequence"
}
const item115: runtime.Expectation = {
  type: "other",
  value: "float_literal"
}
const item129: runtime.Expectation = {
  type: "literal",
  value: "0"
}
const item135: runtime.Expectation = {
  type: "class",
  value: "/^[xX]/g"
}
const item147: runtime.Expectation = {
  type: "other",
  value: "hex_numeral_char"
}
const item149: runtime.Expectation = {
  type: "other",
  value: "hex_numeral"
}
const item155: runtime.Expectation = {
  type: "class",
  value: "/^[bB]/g"
}
const item167: runtime.Expectation = {
  type: "other",
  value: "binary_numeral_char"
}
const item169: runtime.Expectation = {
  type: "other",
  value: "binary_numeral"
}
const item177: runtime.Expectation = {
  type: "other",
  value: "number_sequence"
}
const item186: runtime.Expectation = {
  type: "class",
  value: "/^[uU]/g"
}
const item192: runtime.Expectation = {
  type: "class",
  value: "/^[BILSbils]/g"
}
const item198: runtime.Expectation = {
  type: "class",
  value: "/^[sS]/g"
}
const item207: runtime.Expectation = {
  type: "other",
  value: "integer_suffix"
}
const item210: runtime.Expectation = {
  type: "other",
  value: "integer_literal"
}
const item226: runtime.Expectation = {
  type: "literal",
  value: "\""
}
const item243: runtime.Expectation = {
  type: "other",
  value: "string_plain_contents"
}
const item247: runtime.Expectation = {
  type: "literal",
  value: "\\"
}
const item254: runtime.Expectation = {
  type: "literal",
  value: "b"
}
const item258: runtime.Expectation = {
  type: "literal",
  value: "s"
}
const item262: runtime.Expectation = {
  type: "literal",
  value: "t"
}
const item266: runtime.Expectation = {
  type: "literal",
  value: "n"
}
const item270: runtime.Expectation = {
  type: "literal",
  value: "f"
}
const item274: runtime.Expectation = {
  type: "literal",
  value: "r"
}
const item281: runtime.Expectation = {
  type: "literal",
  value: "'"
}
const item289: runtime.Expectation = {
  type: "literal",
  value: "x"
}
const item300: runtime.Expectation = {
  type: "other",
  value: "string_hex_2"
}
const item306: runtime.Expectation = {
  type: "literal",
  value: "u"
}
const item312: runtime.Expectation = {
  type: "other",
  value: "string_hex_4"
}
const item317: runtime.Expectation = {
  type: "literal",
  value: "U"
}
const item323: runtime.Expectation = {
  type: "other",
  value: "string_hex_8"
}
const item328: runtime.Expectation = {
  type: "literal",
  value: "N"
}
const item330: runtime.Expectation = {
  type: "literal",
  value: "{"
}
const item338: runtime.Expectation = {
  type: "other",
  value: "unicode_name"
}
const item340: runtime.Expectation = {
  type: "literal",
  value: "}"
}
const item342: runtime.Expectation = {
  type: "other",
  value: "string_escape_sequence"
}
const item345: runtime.Expectation = {
  type: "other",
  value: "string_contents"
}
const item347: runtime.Expectation = {
  type: "other",
  value: "double_quoted_string_chunk"
}
const item348: runtime.Expectation = {
  type: "other",
  value: "double_quoted_string_contents"
}
const item363: runtime.Expectation = {
  type: "other",
  value: "single_quoted_string_chunk"
}
const item364: runtime.Expectation = {
  type: "other",
  value: "single_quoted_string_contents"
}
const item368: runtime.Expectation = {
  type: "other",
  value: "quoted_string_literal"
}
const item405: runtime.Expectation = {
  type: "other",
  value: "unquoted_string"
}
const item406: runtime.Expectation = {
  type: "other",
  value: "map_key"
}
const item408: runtime.Expectation = {
  type: "literal",
  value: ":"
}
const item412: runtime.Expectation = {
  type: "other",
  value: "map_entry"
}
const item415: runtime.Expectation = {
  type: "literal",
  value: ","
}
const item421: runtime.Expectation = {
  type: "other",
  value: "map_entries"
}
const item425: runtime.Expectation = {
  type: "other",
  value: "map_literal"
}
const item440: runtime.Expectation = {
  type: "literal",
  value: "["
}
const item449: runtime.Expectation = {
  type: "class",
  value: "/^[BLI]/g"
}
const item450: runtime.Expectation = {
  type: "other",
  value: "array_prefix"
}
const item452: runtime.Expectation = {
  type: "literal",
  value: ";"
}
const item466: runtime.Expectation = {
  type: "other",
  value: "int_array_entries"
}
const item481: runtime.Expectation = {
  type: "other",
  value: "list_entries"
}
const item483: runtime.Expectation = {
  type: "literal",
  value: "]"
}
const item486: runtime.Expectation = {
  type: "other",
  value: "list_literal"
}
const item500: runtime.Expectation = {
  type: "literal",
  value: "("
}
const item516: runtime.Expectation = {
  type: "other",
  value: "arguments"
}
const item518: runtime.Expectation = {
  type: "literal",
  value: ")"
}
const item523: runtime.Expectation = {
  type: "other",
  value: "unquoted_string_or_builtin"
}
const item524: runtime.Expectation = {
  type: "other",
  value: "literal"
}
const item526: runtime.Expectation = {
  type: "other",
  value: "snbt"
}
const item527: runtime.Expectation = {
  type: "end",
  value: "end of input"
}
export function parse(input: string, options: runtime.ParseOptions = new runtime.ParseOptions()): any {
  const parse$source = options.grammarSource;
  const result = item1(input);
  if (result.success === true) {
    return result.value;
  } else {
    let remainder = input;
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (const e of result.failedExpectations) {
      if (e.remainder.length < remainder.length) {
        remainder = e.remainder;
        failedExpectations = [];
      }
      if (e.remainder.length === remainder.length) {
        failedExpectations.push(e);
      }
    }
    throw new SyntaxError(
      failedExpectations.map(e => e.expectation),
      remainder.slice(0, 1),
      runtime.getLocation(
        parse$source,
        input,
        remainder,
        remainder
      )
    );
  }
  function item55(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: string
  ) {
    return base.checkNum(num, error);
  }
  function item77(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    sign: string | null, dec
  ): { sign: any; value: any; } {
    return { sign: sign || base.Sign.PLUS, value: dec };
  }
  function item85(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    integer, frac, exp: { sign: any; value: any; } | null, suf: string | null
  ): { integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } {
    return { integer, frac, exp, suf: base.convertToFloatTypeSuffix(suf) };
  }
  function item95(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    frac, exp: { sign: any; value: any; } | null, suf: string | null
  ): { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } {
    return { integer: '0', frac, exp, suf: base.convertToFloatTypeSuffix(suf) };
  }
  function item103(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    integer, exp: { sign: any; value: any; }, suf: string | null
  ): { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; } {
    return { integer, frac: '0', exp, suf: base.convertToFloatTypeSuffix(suf) };
  }
  function item111(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    integer, exp: { sign: any; value: any; } | null, suf: string
  ): { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; } {
    return { integer, frac: '0', exp, suf: base.convertToFloatTypeSuffix(suf) };
  }
  function item114(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    sign: string | null, float: { integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }
  ) {
    return base.convertFloat({ sign: sign || base.Sign.PLUS, ...float }, error);
  }
  function item148(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: string
  ) {
    return base.checkNum(num, error);
  }
  function item151(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    hex
  ): { base: any; value: any; } {
    return { base: base.Base.HEX, value: hex };
  }
  function item168(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: string
  ) {
    return base.checkNum(num, error);
  }
  function item171(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    bin
  ): { base: any; value: any; } {
    return { base: base.Base.BIN, value: bin };
  }
  function item173(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: { base: any; value: any; }
  ): { base: any; value: any; } {
    return num;
  }
  function item176(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    dec
  ): { base: any; value: any; } {
    if (dec.startsWith('0') && dec.length !== 1) {
      error('Leading zeros are not allowed');
    }
    return { base: base.Base.DEC, value: dec };
  }
  function item194(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    suf: string
  ): { signed: any; type: any; } {
    return { signed: base.SignedPrefix.UNSIGNED, type: base.convertToIntTypeSuffix(suf) };
  }
  function item202(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    suf: string
  ): { signed: any; type: any; } {
    return { signed: base.SignedPrefix.SIGNED, type: base.convertToIntTypeSuffix(suf) };
  }
  function item206(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    suf: string
  ): { signed: any; type: any; } {
    return { signed: null, type: base.convertToIntTypeSuffix(suf) };
  }
  function item209(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    sign: string | null, num: { base: any; value: any; }, suf: { signed: any; type: any; } | null
  ) {
    return base.convertNum({ sign: sign || base.Sign.PLUS, suffix: suf, ...num }, error);
  }
  function item212(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num
  ) {
    return num;
  }
  function item255(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\b';
  }
  function item259(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return ' ';
  }
  function item263(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\t';
  }
  function item267(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\n';
  }
  function item271(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\f';
  }
  function item275(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\r';
  }
  function item278(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\\';
  }
  function item282(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '\'';
  }
  function item285(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ): string {
    return '"';
  }
  function item302(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    s: string
  ) {
    return base.convertHexString(s, error);
  }
  function item313(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    s: string
  ) {
    return base.convertHexString(s, error);
  }
  function item324(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    s: string
  ) {
    return base.convertHexString(s, error);
  }
  function item341(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    s: string
  ) {
    return base.convertUnicodeNameString(s, error);
  }
  function item344(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    e
  ) {
    return e;
  }
  function item351(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    s: (string | any | "'")[]
  ): string {
    return s.join('');
  }
  function item367(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    s: (string | any | "\"")[]
  ): string {
    return s.join('');
  }
  function item370(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    str: string
  ): string {
    return str;
  }
  function item411(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    key: string, value: any | string | { [x: string]: any; } | any | any
  ): { [x: string]: any; } {
    return { [key]: value };
  }
  function item420(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    m: ({ [x: string]: any; })[]
  ): { [x: string]: any; }[] {
    return m;
  }
  function item424(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    entries: { [x: string]: any; }[] | null
  ): { [x: string]: any; } {
    return entries?.reduce((acc, cur) => ({ ...acc, ...cur }), {}) ?? {};
  }
  function item427(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    map: { [x: string]: any; }
  ): { [x: string]: any; } {
    return map;
  }
  function item465(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    i
  ) {
    return i;
  }
  function item468(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    pre: string, entries
  ) {
    return base.convertIntList(pre, entries, error);
  }
  function item480(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    l: (any | string | { [x: string]: any; } | any | any)[]
  ): any[] {
    return l;
  }
  function item485(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    val
  ) {
    return val;
  }
  function item488(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    lst
  ) {
    return lst;
  }
  function item515(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    l: (any | string | { [x: string]: any; } | any | any)[]
  ): any[] {
    return l;
  }
  function item520(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    args: (any | string | { [x: string]: any; } | any | any)[] | any[]
  ): any[] {
    return args;
  }
  function item522(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    str: string, argv: any[] | null
  ) {
    return base.convertUnquotedOrBuiltin(str, argv, error);
  }
  function item525(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    l
  ) {
    return base.postFixSNBTValue(l);
  }
  function item1(text: string): runtime.Success<any> | runtime.Failure {
    const result = item4(text);
    if (result.success === true) {
      if (result.remainder.length === 0) {
        return result;
      } else {
        return {
          success: false,
          remainder: result.remainder,
          failedExpectations: [{
            expectation: item527,
            remainder: result.remainder,
          }],
        };
      }
      ;
    } else {
      return result;
    }
  }
  function item4(text: string): runtime.Success<any> | runtime.Failure {
    const result = item5(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item526,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item5(text: string): runtime.Success<any> | runtime.Failure {
    const result = item8(text);
    if (result.success === true) {
      return {
        success: true,
        value: item525(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item8(text: string): runtime.Success<any | string | { [x: string]: any; } | any | any> | runtime.Failure {
    const result = item9(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item524,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item9(text: string): runtime.Success<any | string | { [x: string]: any; } | any | any> | runtime.Failure {
    const choices = [item10, item213, item371, item428, item490];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item10(text: string): runtime.Success<any> | runtime.Failure {
    const result = item11(text);
    if (result.success === true) {
      return {
        success: true,
        value: item212(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item11(text: string): runtime.Success<[any | any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?![^+.0-9\-])/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item17(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item17(text: string): runtime.Success<any | any> | runtime.Failure {
    const choices = [item19, item117];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item19(text: string): runtime.Success<any> | runtime.Failure {
    const result = item20(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item115,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item20(text: string): runtime.Success<any> | runtime.Failure {
    const result = item21(text);
    if (result.success === true) {
      return {
        success: true,
        value: item114(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item21(text: string): runtime.Success<[string | null, { integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item23(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item37(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item23(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item25(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item25(text: string): runtime.Success<string> | runtime.Failure {
    const result = item26(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item28,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item26(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[+\-]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item27,
          remainder: text,
        }],
      };
    }
  }
  function item30(text: string): runtime.Success<(string)[]> | runtime.Failure {
    const result = item31(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item34,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item31(text: string): runtime.Success<(string)[]> | runtime.Failure {
    const values: Array<string> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item32(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  function item32(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item33,
          remainder: text,
        }],
      };
    }
  }
  function item37(text: string): runtime.Success<{ integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item38(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item112,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item38(text: string): runtime.Success<{ integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const choices = [item39, item86, item96, item104];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item39(text: string): runtime.Success<{ integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item40(text);
    if (result.success === true) {
      return {
        success: true,
        value: item85(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1], result.value[2], result.value[3]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item40(text: string): runtime.Success<[any, any | null, { sign: any; value: any; } | null, string | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item43(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^\./g);
    failedExpectations.push({
      expectation: item59,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item61(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    const result5 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result5?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result5[0].length);
    }
    const result6 = item66(remainder);
    failedExpectations.push(...result6.failedExpectations);
    if (result6.success === false) {
      return {
        success: false,
        remainder: result6.remainder,
        failedExpectations,
      }
    } else {
      remainder = result6.remainder;
    }
    const result7 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result7?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result7[0].length);
    }
    const result8 = item80(remainder);
    failedExpectations.push(...result8.failedExpectations);
    if (result8.success === false) {
      return {
        success: false,
        remainder: result8.remainder,
        failedExpectations,
      }
    } else {
      remainder = result8.remainder;
    }
    return {
      success: true,
      value: [result0.value, result4.value, result6.value, result8.value],
      remainder,
      failedExpectations,
    }
  }
  function item43(text: string): runtime.Success<any> | runtime.Failure {
    const result = item45(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item57,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item45(text: string): runtime.Success<any> | runtime.Failure {
    const result = item46(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item56,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item46(text: string): runtime.Success<any> | runtime.Failure {
    const result = item48(text);
    if (result.success === true) {
      return {
        success: true,
        value: item55(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item48(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9_])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item54,
          remainder: text,
        }],
      }
    }
  }
  function item61(text: string): runtime.Success<any | null> | runtime.Failure {
    const result = item63(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item63(text: string): runtime.Success<any> | runtime.Failure {
    const result = item45(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item64,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item66(text: string): runtime.Success<{ sign: any; value: any; } | null> | runtime.Failure {
    const result = item68(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item68(text: string): runtime.Success<{ sign: any; value: any; }> | runtime.Failure {
    const result = item69(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item78,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item69(text: string): runtime.Success<{ sign: any; value: any; }> | runtime.Failure {
    const result = item70(text);
    if (result.success === true) {
      return {
        success: true,
        value: item77(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item70(text: string): runtime.Success<[string | null, any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[eE]/g);
    failedExpectations.push({
      expectation: item72,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item74(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item45(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result2.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item74(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item25(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item80(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item82(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item82(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[DFdf]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item83,
          remainder: text,
        }],
      };
    }
  }
  function item86(text: string): runtime.Success<{ integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item87(text);
    if (result.success === true) {
      return {
        success: true,
        value: item95(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1], result.value[2]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item87(text: string): runtime.Success<[any, { sign: any; value: any; } | null, string | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\./g);
    failedExpectations.push({
      expectation: item59,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item63(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item91(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    const result5 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result5?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result5[0].length);
    }
    const result6 = item93(remainder);
    failedExpectations.push(...result6.failedExpectations);
    if (result6.success === false) {
      return {
        success: false,
        remainder: result6.remainder,
        failedExpectations,
      }
    } else {
      remainder = result6.remainder;
    }
    return {
      success: true,
      value: [result2.value, result4.value, result6.value],
      remainder,
      failedExpectations,
    }
  }
  function item91(text: string): runtime.Success<{ sign: any; value: any; } | null> | runtime.Failure {
    const result = item68(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item93(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item82(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item96(text: string): runtime.Success<{ integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item97(text);
    if (result.success === true) {
      return {
        success: true,
        value: item103(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1], result.value[2]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item97(text: string): runtime.Success<[any, { sign: any; value: any; }, string | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item43(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item68(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item101(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item101(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item82(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item104(text: string): runtime.Success<{ integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item105(text);
    if (result.success === true) {
      return {
        success: true,
        value: item111(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1], result.value[2]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item105(text: string): runtime.Success<[any, { sign: any; value: any; } | null, string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item43(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item108(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item82(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item108(text: string): runtime.Success<{ sign: any; value: any; } | null> | runtime.Failure {
    const result = item68(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item117(text: string): runtime.Success<any> | runtime.Failure {
    const result = item118(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item210,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item118(text: string): runtime.Success<any> | runtime.Failure {
    const result = item119(text);
    if (result.success === true) {
      return {
        success: true,
        value: item209(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1], result.value[2]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item119(text: string): runtime.Success<[string | null, { base: any; value: any; }, { signed: any; type: any; } | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item121(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item124(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item179(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item121(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item25(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item124(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item125(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item177,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item125(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const choices = [item126, item174];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item126(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item127(text);
    if (result.success === true) {
      return {
        success: true,
        value: item173(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item127(text: string): runtime.Success<[{ base: any; value: any; }]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^0/g);
    failedExpectations.push({
      expectation: item129,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item131(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item131(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const choices = [item132, item152];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item132(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item133(text);
    if (result.success === true) {
      return {
        success: true,
        value: item151(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item133(text: string): runtime.Success<[any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[xX]/g);
    failedExpectations.push({
      expectation: item135,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item138(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item138(text: string): runtime.Success<any> | runtime.Failure {
    const result = item139(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item149,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item139(text: string): runtime.Success<any> | runtime.Failure {
    const result = item141(text);
    if (result.success === true) {
      return {
        success: true,
        value: item148(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item141(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9a-fA-F_])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item147,
          remainder: text,
        }],
      }
    }
  }
  function item152(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item153(text);
    if (result.success === true) {
      return {
        success: true,
        value: item171(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item153(text: string): runtime.Success<[any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[bB]/g);
    failedExpectations.push({
      expectation: item155,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item158(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item158(text: string): runtime.Success<any> | runtime.Failure {
    const result = item159(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item169,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item159(text: string): runtime.Success<any> | runtime.Failure {
    const result = item161(text);
    if (result.success === true) {
      return {
        success: true,
        value: item168(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item161(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([01_])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item167,
          remainder: text,
        }],
      }
    }
  }
  function item174(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item45(text);
    if (result.success === true) {
      return {
        success: true,
        value: item176(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item179(text: string): runtime.Success<{ signed: any; type: any; } | null> | runtime.Failure {
    const result = item181(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item181(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item182(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item207,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item182(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const choices = [item183, item195, item203];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item183(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item184(text);
    if (result.success === true) {
      return {
        success: true,
        value: item194(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item184(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[uU]/g);
    failedExpectations.push({
      expectation: item186,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item188(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item188(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([BILSbils])?/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item192,
          remainder: text,
        }],
      }
    }
  }
  function item195(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item196(text);
    if (result.success === true) {
      return {
        success: true,
        value: item202(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item196(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[sS]/g);
    failedExpectations.push({
      expectation: item198,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item200(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item200(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([BILSbils])?/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item192,
          remainder: text,
        }],
      }
    }
  }
  function item203(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item205(text);
    if (result.success === true) {
      return {
        success: true,
        value: item206(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item205(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^[BILSbils]/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item192,
          remainder: text,
        }],
      }
    }
  }
  function item213(text: string): runtime.Success<string> | runtime.Failure {
    const result = item214(text);
    if (result.success === true) {
      return {
        success: true,
        value: item370(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item214(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?![^'"])/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item221(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item221(text: string): runtime.Success<string> | runtime.Failure {
    const result = item222(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item368,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item222(text: string): runtime.Success<string> | runtime.Failure {
    const choices = [item223, item352];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item223(text: string): runtime.Success<string> | runtime.Failure {
    const result = item224(text);
    if (result.success === true) {
      return {
        success: true,
        value: item351(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item224(text: string): runtime.Success<[(string | any | "'")[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^"/g);
    failedExpectations.push({
      expectation: item226,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item229(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^"/g);
    failedExpectations.push({
      expectation: item226,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item229(text: string): runtime.Success<(string | any | "'")[]> | runtime.Failure {
    const result = item230(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item348,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item230(text: string): runtime.Success<(string | any | "'")[]> | runtime.Failure {
    const values: Array<string | any | "'"> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item232(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  function item232(text: string): runtime.Success<string | any | "'"> | runtime.Failure {
    const result = item233(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item347,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item233(text: string): runtime.Success<string | any | "'"> | runtime.Failure {
    const choices = [item235, item346];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item235(text: string): runtime.Success<string | any> | runtime.Failure {
    const result = item236(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item345,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item236(text: string): runtime.Success<string | any> | runtime.Failure {
    const choices = [item237, item244];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item237(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([^"'\\])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item243,
          remainder: text,
        }],
      }
    }
  }
  function item244(text: string): runtime.Success<any> | runtime.Failure {
    const result = item245(text);
    if (result.success === true) {
      return {
        success: true,
        value: item344(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item245(text: string): runtime.Success<[string | any | any | any | any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\\/g);
    failedExpectations.push({
      expectation: item247,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item250(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item250(text: string): runtime.Success<string | any | any | any | any> | runtime.Failure {
    const result = item251(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item342,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item251(text: string): runtime.Success<string | any | any | any | any> | runtime.Failure {
    const choices = [item252, item256, item260, item264, item268, item272, item276, item279, item283, item286, item303, item314, item325];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item252(text: string): runtime.Success<string> | runtime.Failure {
    const result = item253(text);
    if (result.success === true) {
      return {
        success: true,
        value: item255(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item253(text: string): runtime.Success<"b"> | runtime.Failure {
    if (text.startsWith("b")) {
      return {
        success: true,
        value: "b",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item254,
          remainder: text,
        }],
      };
    }
  }
  function item256(text: string): runtime.Success<string> | runtime.Failure {
    const result = item257(text);
    if (result.success === true) {
      return {
        success: true,
        value: item259(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item257(text: string): runtime.Success<"s"> | runtime.Failure {
    if (text.startsWith("s")) {
      return {
        success: true,
        value: "s",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item258,
          remainder: text,
        }],
      };
    }
  }
  function item260(text: string): runtime.Success<string> | runtime.Failure {
    const result = item261(text);
    if (result.success === true) {
      return {
        success: true,
        value: item263(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item261(text: string): runtime.Success<"t"> | runtime.Failure {
    if (text.startsWith("t")) {
      return {
        success: true,
        value: "t",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item262,
          remainder: text,
        }],
      };
    }
  }
  function item264(text: string): runtime.Success<string> | runtime.Failure {
    const result = item265(text);
    if (result.success === true) {
      return {
        success: true,
        value: item267(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item265(text: string): runtime.Success<"n"> | runtime.Failure {
    if (text.startsWith("n")) {
      return {
        success: true,
        value: "n",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item266,
          remainder: text,
        }],
      };
    }
  }
  function item268(text: string): runtime.Success<string> | runtime.Failure {
    const result = item269(text);
    if (result.success === true) {
      return {
        success: true,
        value: item271(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item269(text: string): runtime.Success<"f"> | runtime.Failure {
    if (text.startsWith("f")) {
      return {
        success: true,
        value: "f",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item270,
          remainder: text,
        }],
      };
    }
  }
  function item272(text: string): runtime.Success<string> | runtime.Failure {
    const result = item273(text);
    if (result.success === true) {
      return {
        success: true,
        value: item275(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item273(text: string): runtime.Success<"r"> | runtime.Failure {
    if (text.startsWith("r")) {
      return {
        success: true,
        value: "r",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item274,
          remainder: text,
        }],
      };
    }
  }
  function item276(text: string): runtime.Success<string> | runtime.Failure {
    const result = item277(text);
    if (result.success === true) {
      return {
        success: true,
        value: item278(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item277(text: string): runtime.Success<"\\"> | runtime.Failure {
    if (text.startsWith("\\")) {
      return {
        success: true,
        value: "\\",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item247,
          remainder: text,
        }],
      };
    }
  }
  function item279(text: string): runtime.Success<string> | runtime.Failure {
    const result = item280(text);
    if (result.success === true) {
      return {
        success: true,
        value: item282(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item280(text: string): runtime.Success<"'"> | runtime.Failure {
    if (text.startsWith("'")) {
      return {
        success: true,
        value: "'",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item281,
          remainder: text,
        }],
      };
    }
  }
  function item283(text: string): runtime.Success<string> | runtime.Failure {
    const result = item284(text);
    if (result.success === true) {
      return {
        success: true,
        value: item285(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item284(text: string): runtime.Success<"\""> | runtime.Failure {
    if (text.startsWith("\"")) {
      return {
        success: true,
        value: "\"",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item226,
          remainder: text,
        }],
      };
    }
  }
  function item286(text: string): runtime.Success<any> | runtime.Failure {
    const result = item287(text);
    if (result.success === true) {
      return {
        success: true,
        value: item302(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item287(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^x/g);
    failedExpectations.push({
      expectation: item289,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item291(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item291(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9A-Fa-f]){0,2}/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item300,
          remainder: text,
        }],
      }
    }
  }
  function item303(text: string): runtime.Success<any> | runtime.Failure {
    const result = item304(text);
    if (result.success === true) {
      return {
        success: true,
        value: item313(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item304(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^u/g);
    failedExpectations.push({
      expectation: item306,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item308(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item308(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9A-Fa-f]){0,4}/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item312,
          remainder: text,
        }],
      }
    }
  }
  function item314(text: string): runtime.Success<any> | runtime.Failure {
    const result = item315(text);
    if (result.success === true) {
      return {
        success: true,
        value: item324(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item315(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^U/g);
    failedExpectations.push({
      expectation: item317,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item319(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item319(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9A-Fa-f]){0,8}/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item323,
          remainder: text,
        }],
      }
    }
  }
  function item325(text: string): runtime.Success<any> | runtime.Failure {
    const result = item326(text);
    if (result.success === true) {
      return {
        success: true,
        value: item341(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item326(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^N/g);
    failedExpectations.push({
      expectation: item328,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^\{/g);
    failedExpectations.push({
      expectation: item330,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item332(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^\}/g);
    failedExpectations.push({
      expectation: item340,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item332(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([\-a-zA-Z0-9 ])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item338,
          remainder: text,
        }],
      }
    }
  }
  function item346(text: string): runtime.Success<"'"> | runtime.Failure {
    if (text.startsWith("'")) {
      return {
        success: true,
        value: "'",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item281,
          remainder: text,
        }],
      };
    }
  }
  function item352(text: string): runtime.Success<string> | runtime.Failure {
    const result = item353(text);
    if (result.success === true) {
      return {
        success: true,
        value: item367(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item353(text: string): runtime.Success<[(string | any | "\"")[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^'/g);
    failedExpectations.push({
      expectation: item281,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item357(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = remainder.match(/^'/g);
    failedExpectations.push({
      expectation: item281,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item357(text: string): runtime.Success<(string | any | "\"")[]> | runtime.Failure {
    const result = item358(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item364,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item358(text: string): runtime.Success<(string | any | "\"")[]> | runtime.Failure {
    const values: Array<string | any | "\""> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      result = item360(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  function item360(text: string): runtime.Success<string | any | "\""> | runtime.Failure {
    const result = item361(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item363,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item361(text: string): runtime.Success<string | any | "\""> | runtime.Failure {
    const choices = [item235, item362];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item362(text: string): runtime.Success<"\""> | runtime.Failure {
    if (text.startsWith("\"")) {
      return {
        success: true,
        value: "\"",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item226,
          remainder: text,
        }],
      };
    }
  }
  function item371(text: string): runtime.Success<{ [x: string]: any; }> | runtime.Failure {
    const result = item372(text);
    if (result.success === true) {
      return {
        success: true,
        value: item427(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item372(text: string): runtime.Success<[{ [x: string]: any; }]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?![^{])/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item379(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item379(text: string): runtime.Success<{ [x: string]: any; }> | runtime.Failure {
    const result = item380(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item425,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item380(text: string): runtime.Success<{ [x: string]: any; }> | runtime.Failure {
    const result = item381(text);
    if (result.success === true) {
      return {
        success: true,
        value: item424(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item381(text: string): runtime.Success<[{ [x: string]: any; }[] | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\{/g);
    failedExpectations.push({
      expectation: item330,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item384(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^\}/g);
    failedExpectations.push({
      expectation: item340,
      remainder: remainder,
    });
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item384(text: string): runtime.Success<{ [x: string]: any; }[] | null> | runtime.Failure {
    const result = item386(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item386(text: string): runtime.Success<{ [x: string]: any; }[]> | runtime.Failure {
    const result = item387(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item421,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item387(text: string): runtime.Success<{ [x: string]: any; }[]> | runtime.Failure {
    const result = item388(text);
    if (result.success === true) {
      return {
        success: true,
        value: item420(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item388(text: string): runtime.Success<[({ [x: string]: any; })[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item390(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^(,)?/g);
    failedExpectations.push({
      expectation: item415,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item390(text: string): runtime.Success<({ [x: string]: any; })[]> | runtime.Failure {
    const values: Array<{ [x: string]: any; }> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item413(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item392(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (values.length < 1 && result.success === false /* technically redundant */) {
      return { success: false, remainder: result.remainder, failedExpectations };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  function item392(text: string): runtime.Success<{ [x: string]: any; }> | runtime.Failure {
    const result = item393(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item412,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item393(text: string): runtime.Success<{ [x: string]: any; }> | runtime.Failure {
    const result = item394(text);
    if (result.success === true) {
      return {
        success: true,
        value: item411(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item394(text: string): runtime.Success<[string, any | string | { [x: string]: any; } | any | any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item397(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^:/g);
    failedExpectations.push({
      expectation: item408,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item8(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result0.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item397(text: string): runtime.Success<string> | runtime.Failure {
    const result = item398(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item406,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item398(text: string): runtime.Success<string> | runtime.Failure {
    const choices = [item221, item399];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item399(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9A-Za-z_.+\-])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item405,
          remainder: text,
        }],
      }
    }
  }
  function item413(text: string): runtime.Success<[(string)[], ",", (string)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item30(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = item414(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = item30(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value, result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item414(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item415,
          remainder: text,
        }],
      };
    }
  }
  function item428(text: string): runtime.Success<any> | runtime.Failure {
    const result = item429(text);
    if (result.success === true) {
      return {
        success: true,
        value: item488(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item429(text: string): runtime.Success<[any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?![^[])/g);
    failedExpectations.push();
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = item436(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    return {
      success: true,
      value: [result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item436(text: string): runtime.Success<any> | runtime.Failure {
    const result = item437(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item486,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item437(text: string): runtime.Success<any> | runtime.Failure {
    const result = item438(text);
    if (result.success === true) {
      return {
        success: true,
        value: item485(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item438(text: string): runtime.Success<[any | any[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\[/g);
    failedExpectations.push({
      expectation: item440,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item442(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^\]/g);
    failedExpectations.push({
      expectation: item483,
      remainder: remainder,
    });
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item442(text: string): runtime.Success<any | any[]> | runtime.Failure {
    const choices = [item443, item470];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item443(text: string): runtime.Success<any> | runtime.Failure {
    const result = item444(text);
    if (result.success === true) {
      return {
        success: true,
        value: item468(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item444(text: string): runtime.Success<[string, any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item447(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^;/g);
    failedExpectations.push({
      expectation: item452,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = item455(remainder);
    failedExpectations.push(...result4.failedExpectations);
    if (result4.success === false) {
      return {
        success: false,
        remainder: result4.remainder,
        failedExpectations,
      }
    } else {
      remainder = result4.remainder;
    }
    return {
      success: true,
      value: [result0.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item447(text: string): runtime.Success<string> | runtime.Failure {
    const result = item448(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item450,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item448(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[BLI]/g.test(text)) {
      return {
        success: true,
        value: text.slice(0, 1),
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item449,
          remainder: text,
        }],
      };
    }
  }
  function item455(text: string): runtime.Success<any> | runtime.Failure {
    const result = item456(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item466,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item456(text: string): runtime.Success<any> | runtime.Failure {
    const result = item457(text);
    if (result.success === true) {
      return {
        success: true,
        value: item465(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item457(text: string): runtime.Success<[(any)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item459(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^(,)?/g);
    failedExpectations.push({
      expectation: item415,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item459(text: string): runtime.Success<(any)[]> | runtime.Failure {
    const values: Array<any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item460(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item117(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (values.length < 1 && result.success === false /* technically redundant */) {
      return { success: false, remainder: result.remainder, failedExpectations };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  function item460(text: string): runtime.Success<[(string)[], ",", (string)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item30(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = item461(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = item30(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value, result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item461(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item415,
          remainder: text,
        }],
      };
    }
  }
  function item470(text: string): runtime.Success<any[]> | runtime.Failure {
    const result = item471(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item481,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item471(text: string): runtime.Success<any[]> | runtime.Failure {
    const result = item472(text);
    if (result.success === true) {
      return {
        success: true,
        value: item480(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item472(text: string): runtime.Success<[(any | string | { [x: string]: any; } | any | any)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item474(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^(,)?/g);
    failedExpectations.push({
      expectation: item415,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item474(text: string): runtime.Success<(any | string | { [x: string]: any; } | any | any)[]> | runtime.Failure {
    const values: Array<any | string | { [x: string]: any; } | any | any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item475(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item8(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (values.length < 1 && result.success === false /* technically redundant */) {
      return { success: false, remainder: result.remainder, failedExpectations };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  function item475(text: string): runtime.Success<[(string)[], ",", (string)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item30(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = item476(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = item30(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value, result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item476(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item415,
          remainder: text,
        }],
      };
    }
  }
  function item490(text: string): runtime.Success<any> | runtime.Failure {
    const result = item491(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item523,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item491(text: string): runtime.Success<any> | runtime.Failure {
    const result = item492(text);
    if (result.success === true) {
      return {
        success: true,
        value: item522(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0], result.value[1]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item492(text: string): runtime.Success<[string, any[] | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item494(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item496(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item494(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9A-Za-z_.+\-])+/g);
    if (matches?.length === 1) {
      return {
        success: true,
        value: matches[0],
        remainder: text.slice(matches[0].length),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item405,
          remainder: text,
        }],
      }
    }
  }
  function item496(text: string): runtime.Success<any[] | null> | runtime.Failure {
    const result = item497(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: true,
        value: null,
        remainder: text,
        failedExpectations: result.failedExpectations,
      };
    }
  }
  function item497(text: string): runtime.Success<any[]> | runtime.Failure {
    const result = item498(text);
    if (result.success === true) {
      return {
        success: true,
        value: item520(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item498(text: string): runtime.Success<[(any | string | { [x: string]: any; } | any | any)[] | any[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\(/g);
    failedExpectations.push({
      expectation: item500,
      remainder: remainder,
    });
    if (result0?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result0[0].length);
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = item503(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    const result3 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result3?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result3[0].length);
    }
    const result4 = remainder.match(/^\)/g);
    failedExpectations.push({
      expectation: item518,
      remainder: remainder,
    });
    if (result4?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result4[0].length);
    }
    return {
      success: true,
      value: [result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item503(text: string): runtime.Success<(any | string | { [x: string]: any; } | any | any)[] | any[]> | runtime.Failure {
    const result = item504(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item516,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item504(text: string): runtime.Success<(any | string | { [x: string]: any; } | any | any)[] | any[]> | runtime.Failure {
    const choices = [item505, item508];
    let failedExpectations: runtime.FailedExpectation[] = [];
    for (let func = choices.shift(); func !== undefined; func = choices.shift()) {
      const result = func(text);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === true) {
        return {
          success: true,
          value: result.value,
          remainder: result.remainder,
          failedExpectations,
        }
      }
    }
    return {
      success: false,
      remainder: text,
      failedExpectations,
    };
  }
  function item505(text: string): runtime.Success<(any | string | { [x: string]: any; } | any | any)[]> | runtime.Failure {
    const values: Array<any | string | { [x: string]: any; } | any | any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item506(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item8(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    return { success: true, value: values, remainder, failedExpectations };
  }
  function item506(text: string): runtime.Success<[(string)[], ",", (string)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item30(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = item507(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = item30(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value, result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item507(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item415,
          remainder: text,
        }],
      };
    }
  }
  function item508(text: string): runtime.Success<any[]> | runtime.Failure {
    const result = item509(text);
    if (result.success === true) {
      return {
        success: true,
        value: item515(
          () => runtime.getLocation(parse$source, input, text, result.remainder),
          () => runtime.getRange(parse$source, input, text, result.remainder),
          () => runtime.getText(text, result.remainder),
          () => (input.length - text.length),
          (
            message: string,
            location = runtime.getLocation(parse$source, input, text, result.remainder),
            name?: string,
          ) => {
            throw new ParseError(message, location, name)
          },
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item509(text: string): runtime.Success<[(any | string | { [x: string]: any; } | any | any)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item511(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item34,
      remainder: remainder,
    });
    if (result1?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result1[0].length);
    }
    const result2 = remainder.match(/^,/g);
    failedExpectations.push({
      expectation: item415,
      remainder: remainder,
    });
    if (result2?.length !== 1) {
      return {
        success: false,
        remainder,
        failedExpectations,
      }
    } else {
      remainder = remainder.slice(result2[0].length);
    }
    return {
      success: true,
      value: [result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item511(text: string): runtime.Success<(any | string | { [x: string]: any; } | any | any)[]> | runtime.Failure {
    const values: Array<any | string | { [x: string]: any; } | any | any> = [];
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    let result;
    do {
      let r = remainder;
      if (values.length > 0) {
        result = item512(r);
        if (result.success === false) {
          break;
        }
        r = result.remainder;
      }
      result = item8(r);
      failedExpectations.push(...result.failedExpectations);
      if (result.success === false) {
        break;
      }
      remainder = result.remainder;
      values.push(result.value);
    } while (true);
    if (values.length < 1 && result.success === false /* technically redundant */) {
      return { success: false, remainder: result.remainder, failedExpectations };
    } else {
      return { success: true, value: values, remainder, failedExpectations };
    }
  }
  function item512(text: string): runtime.Success<[(string)[], ",", (string)[]]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item30(remainder);
    failedExpectations.push(...result0.failedExpectations);
    if (result0.success === false) {
      return {
        success: false,
        remainder: result0.remainder,
        failedExpectations,
      }
    } else {
      remainder = result0.remainder;
    }
    const result1 = item513(remainder);
    failedExpectations.push(...result1.failedExpectations);
    if (result1.success === false) {
      return {
        success: false,
        remainder: result1.remainder,
        failedExpectations,
      }
    } else {
      remainder = result1.remainder;
    }
    const result2 = item30(remainder);
    failedExpectations.push(...result2.failedExpectations);
    if (result2.success === false) {
      return {
        success: false,
        remainder: result2.remainder,
        failedExpectations,
      }
    } else {
      remainder = result2.remainder;
    }
    return {
      success: true,
      value: [result0.value, result1.value, result0.value],
      remainder,
      failedExpectations,
    }
  }
  function item513(text: string): runtime.Success<","> | runtime.Failure {
    if (text.startsWith(",")) {
      return {
        success: true,
        value: ",",
        remainder: text.slice(1),
        failedExpectations: [],
      };
    } else {
      return {
        success: false,
        remainder: text,
        failedExpectations: [{
          expectation: item415,
          remainder: text,
        }],
      };
    }
  }
}

