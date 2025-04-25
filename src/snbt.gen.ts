
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
const item24: runtime.Expectation = {
  type: "class",
  value: "/^[+\\-]/g"
}
const item25: runtime.Expectation = {
  type: "other",
  value: "sign"
}
const item44: runtime.Expectation = {
  type: "other",
  value: "whitespace"
}
const item52: runtime.Expectation = {
  type: "other",
  value: "decimal_numeral_char"
}
const item55: runtime.Expectation = {
  type: "other",
  value: "decimal_numeral"
}
const item56: runtime.Expectation = {
  type: "other",
  value: "float_whole_part"
}
const item58: runtime.Expectation = {
  type: "literal",
  value: "."
}
const item63: runtime.Expectation = {
  type: "other",
  value: "float_fraction_part"
}
const item71: runtime.Expectation = {
  type: "class",
  value: "/^[eE]/g"
}
const item77: runtime.Expectation = {
  type: "other",
  value: "float_exponent_part"
}
const item84: runtime.Expectation = {
  type: "class",
  value: "/^[fF]/g"
}
const item87: runtime.Expectation = {
  type: "class",
  value: "/^[dD]/g"
}
const item89: runtime.Expectation = {
  type: "other",
  value: "float_type_suffix"
}
const item118: runtime.Expectation = {
  type: "other",
  value: "float_sequence"
}
const item121: runtime.Expectation = {
  type: "other",
  value: "float_literal"
}
const item135: runtime.Expectation = {
  type: "literal",
  value: "0"
}
const item141: runtime.Expectation = {
  type: "class",
  value: "/^[xX]/g"
}
const item154: runtime.Expectation = {
  type: "other",
  value: "hex_numeral_char"
}
const item156: runtime.Expectation = {
  type: "other",
  value: "hex_numeral"
}
const item162: runtime.Expectation = {
  type: "class",
  value: "/^[bB]/g"
}
const item175: runtime.Expectation = {
  type: "other",
  value: "binary_numeral_char"
}
const item177: runtime.Expectation = {
  type: "other",
  value: "binary_numeral"
}
const item185: runtime.Expectation = {
  type: "other",
  value: "number_sequence"
}
const item194: runtime.Expectation = {
  type: "class",
  value: "/^[uU]/g"
}
const item201: runtime.Expectation = {
  type: "class",
  value: "/^[BISbis]/g"
}
const item204: runtime.Expectation = {
  type: "class",
  value: "/^[lL]/g"
}
const item206: runtime.Expectation = {
  type: "other",
  value: "non_sign_suffix"
}
const item212: runtime.Expectation = {
  type: "class",
  value: "/^[sS]/g"
}
const item219: runtime.Expectation = {
  type: "other",
  value: "integer_suffix"
}
const item222: runtime.Expectation = {
  type: "other",
  value: "integer_literal"
}
const item225: runtime.Expectation = {
  type: "other",
  value: "literal"
}
const item226: runtime.Expectation = {
  type: "other",
  value: "snbt"
}
const item227: runtime.Expectation = {
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
  function item54(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: string
  ) {
    return base.checkNum(num, error);
  }
  function item76(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    sign: string | null, dec
  ): { sign: any; value: any; } {
    return { sign: sign || base.Sign.PLUS, value: dec };
  }
  function item88(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ) {
    return base.convertToTypeSuffix(text());
  }
  function item91(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    integer, frac, exp: { sign: any; value: any; } | null, suf
  ): { integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } {
    return { integer, frac, exp, suf };
  }
  function item101(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    frac, exp: { sign: any; value: any; } | null, suf
  ): { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } {
    return { integer: '0', frac, exp, suf };
  }
  function item109(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    integer, exp: { sign: any; value: any; }, suf
  ): { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; } {
    return { integer, frac: '0', exp, suf };
  }
  function item117(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    integer, exp: { sign: any; value: any; } | null, suf
  ): { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; } {
    return { integer, frac: '0', exp, suf };
  }
  function item120(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    sign: string | null, float: { integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }
  ) {
    return base.convertFloat({ sign: sign || base.Sign.PLUS, ...float }, error);
  }
  function item155(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: string
  ) {
    return base.checkNum(num, error);
  }
  function item158(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    hex
  ): { base: any; value: any; } {
    return { base: base.Base.HEX, value: hex };
  }
  function item176(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: string
  ) {
    return base.checkNum(num, error);
  }
  function item179(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    bin
  ): { base: any; value: any; } {
    return { base: base.Base.BIN, value: bin };
  }
  function item181(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num: { base: any; value: any; }
  ): { base: any; value: any; } {
    return num;
  }
  function item184(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    dec
  ): { base: any; value: any; } {
    if (dec.startsWith('0') && dec.length === 1) {
      error('Leading zeros are not allowed');
    }
    return { base: base.Base.DEC, value: dec };
  }
  function item205(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
  ) {
    return base.convertToTypeSuffix(text());
  }
  function item208(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    suf
  ): { signed: any; type: any; } {
    return { signed: base.SignedPrefix.UNSIGNED, type: suf };
  }
  function item215(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    suf
  ): { signed: any; type: any; } {
    return { signed: base.SignedPrefix.SIGNED, type: suf };
  }
  function item218(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    suf
  ): { signed: any; type: any; } {
    return { signed: null, type: suf };
  }
  function item221(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    sign: string | null, num: { base: any; value: any; }, suf: { signed: any; type: any; } | null
  ) {
    return base.convertNum({ sign: sign || base.Sign.PLUS, suffix: suf, ...num }, error);
  }
  function item224(
    location: () => runtime.LocationRange,
    range: () => runtime.Range,
    text: () => string,
    offset: () => number,
    error: (s: string, l?: runtime.LocationRange) => void,
    num
  ) {
    return num;
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
            expectation: item227,
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
    const result = item6(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item226,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item6(text: string): runtime.Success<any> | runtime.Failure {
    const result = item7(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item225,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item7(text: string): runtime.Success<any> | runtime.Failure {
    const result = item8(text);
    if (result.success === true) {
      return {
        success: true,
        value: item224(
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
  function item8(text: string): runtime.Success<[any | any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^(?![^+-.0-9])/g);
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
    const result1 = item14(remainder);
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
  function item14(text: string): runtime.Success<any | any> | runtime.Failure {
    const choices = [item16, item123];
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
  function item16(text: string): runtime.Success<any> | runtime.Failure {
    const result = item17(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item121,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item17(text: string): runtime.Success<any> | runtime.Failure {
    const result = item18(text);
    if (result.success === true) {
      return {
        success: true,
        value: item120(
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
  function item18(text: string): runtime.Success<[string | null, { integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item20(remainder);
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
    const result1 = item28(remainder);
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
      value: [result0.value, result1.value],
      remainder,
      failedExpectations,
    }
  }
  function item20(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item22(text);
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
  function item22(text: string): runtime.Success<string> | runtime.Failure {
    const result = item23(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item25,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item23(text: string): runtime.Success<string> | runtime.Failure {
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
          expectation: item24,
          remainder: text,
        }],
      };
    }
  }
  function item28(text: string): runtime.Success<{ integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item29(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item118,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item29(text: string): runtime.Success<{ integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; } | { integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const choices = [item30, item92, item102, item110];
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
  function item30(text: string): runtime.Success<{ integer: any; frac: any; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item31(text);
    if (result.success === true) {
      return {
        success: true,
        value: item91(
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
  function item31(text: string): runtime.Success<[any, any | null, { sign: any; value: any; } | null, string | any | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item34(remainder);
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
    const result1 = remainder.match(/^\./g);
    failedExpectations.push({
      expectation: item58,
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
    const result2 = item60(remainder);
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
    const result3 = item65(remainder);
    failedExpectations.push(...result3.failedExpectations);
    if (result3.success === false) {
      return {
        success: false,
        remainder: result3.remainder,
        failedExpectations,
      }
    } else {
      remainder = result3.remainder;
    }
    const result4 = item79(remainder);
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
      value: [result0.value, result2.value, result3.value, result4.value],
      remainder,
      failedExpectations,
    }
  }
  function item34(text: string): runtime.Success<any> | runtime.Failure {
    const result = item36(text);
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
  function item36(text: string): runtime.Success<any> | runtime.Failure {
    const result = item37(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item55,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item37(text: string): runtime.Success<any> | runtime.Failure {
    const result = item38(text);
    if (result.success === true) {
      return {
        success: true,
        value: item54(
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
  function item38(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item44,
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
    const result1 = item46(remainder);
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
  function item46(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9\-])+/g);
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
          expectation: item52,
          remainder: text,
        }],
      }
    }
  }
  function item60(text: string): runtime.Success<any | null> | runtime.Failure {
    const result = item62(text);
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
  function item62(text: string): runtime.Success<any> | runtime.Failure {
    const result = item36(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item63,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item65(text: string): runtime.Success<{ sign: any; value: any; } | null> | runtime.Failure {
    const result = item67(text);
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
  function item67(text: string): runtime.Success<{ sign: any; value: any; }> | runtime.Failure {
    const result = item68(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item77,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item68(text: string): runtime.Success<{ sign: any; value: any; }> | runtime.Failure {
    const result = item69(text);
    if (result.success === true) {
      return {
        success: true,
        value: item76(
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
  function item69(text: string): runtime.Success<[string | null, any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[eE]/g);
    failedExpectations.push({
      expectation: item71,
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
    const result1 = item73(remainder);
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
    const result2 = item36(remainder);
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
      value: [result1.value, result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item73(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item22(text);
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
  function item79(text: string): runtime.Success<string | any | null> | runtime.Failure {
    const result = item81(text);
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
  function item81(text: string): runtime.Success<string | any> | runtime.Failure {
    const result = item82(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item89,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item82(text: string): runtime.Success<string | any> | runtime.Failure {
    const choices = [item83, item85];
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
  function item83(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[fF]/g.test(text)) {
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
          expectation: item84,
          remainder: text,
        }],
      };
    }
  }
  function item85(text: string): runtime.Success<any> | runtime.Failure {
    const result = item86(text);
    if (result.success === true) {
      return {
        success: true,
        value: item88(
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
  function item86(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[dD]/g.test(text)) {
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
          expectation: item87,
          remainder: text,
        }],
      };
    }
  }
  function item92(text: string): runtime.Success<{ integer: string; frac: any; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item93(text);
    if (result.success === true) {
      return {
        success: true,
        value: item101(
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
  function item93(text: string): runtime.Success<[any, { sign: any; value: any; } | null, string | any | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^\./g);
    failedExpectations.push({
      expectation: item58,
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
    const result1 = item62(remainder);
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
    const result2 = item97(remainder);
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
    const result3 = item99(remainder);
    failedExpectations.push(...result3.failedExpectations);
    if (result3.success === false) {
      return {
        success: false,
        remainder: result3.remainder,
        failedExpectations,
      }
    } else {
      remainder = result3.remainder;
    }
    return {
      success: true,
      value: [result1.value, result2.value, result3.value],
      remainder,
      failedExpectations,
    }
  }
  function item97(text: string): runtime.Success<{ sign: any; value: any; } | null> | runtime.Failure {
    const result = item67(text);
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
  function item99(text: string): runtime.Success<string | any | null> | runtime.Failure {
    const result = item81(text);
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
  function item102(text: string): runtime.Success<{ integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item103(text);
    if (result.success === true) {
      return {
        success: true,
        value: item109(
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
  function item103(text: string): runtime.Success<[any, { sign: any; value: any; }, string | any | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item34(remainder);
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
    const result1 = item67(remainder);
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
    const result2 = item107(remainder);
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
      value: [result0.value, result1.value, result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item107(text: string): runtime.Success<string | any | null> | runtime.Failure {
    const result = item81(text);
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
  function item110(text: string): runtime.Success<{ integer: any; frac: string; exp: { sign: any; value: any; }; suf: any; }> | runtime.Failure {
    const result = item111(text);
    if (result.success === true) {
      return {
        success: true,
        value: item117(
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
  function item111(text: string): runtime.Success<[any, { sign: any; value: any; } | null, string | any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item34(remainder);
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
    const result1 = item114(remainder);
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
    const result2 = item81(remainder);
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
      value: [result0.value, result1.value, result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item114(text: string): runtime.Success<{ sign: any; value: any; } | null> | runtime.Failure {
    const result = item67(text);
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
  function item123(text: string): runtime.Success<any> | runtime.Failure {
    const result = item124(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item222,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item124(text: string): runtime.Success<any> | runtime.Failure {
    const result = item125(text);
    if (result.success === true) {
      return {
        success: true,
        value: item221(
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
  function item125(text: string): runtime.Success<[string | null, { base: any; value: any; }, { signed: any; type: any; } | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = item127(remainder);
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
    const result1 = item130(remainder);
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
    const result2 = item187(remainder);
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
      value: [result0.value, result1.value, result2.value],
      remainder,
      failedExpectations,
    }
  }
  function item127(text: string): runtime.Success<string | null> | runtime.Failure {
    const result = item22(text);
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
  function item130(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item131(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item185,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item131(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const choices = [item132, item182];
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
        value: item181(
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
  function item133(text: string): runtime.Success<[{ base: any; value: any; }]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^0/g);
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
    const result1 = item137(remainder);
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
  function item137(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const choices = [item138, item159];
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
  function item138(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item139(text);
    if (result.success === true) {
      return {
        success: true,
        value: item158(
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
  function item139(text: string): runtime.Success<[any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[xX]/g);
    failedExpectations.push({
      expectation: item141,
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
    const result1 = item144(remainder);
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
  function item144(text: string): runtime.Success<any> | runtime.Failure {
    const result = item145(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item156,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item145(text: string): runtime.Success<any> | runtime.Failure {
    const result = item146(text);
    if (result.success === true) {
      return {
        success: true,
        value: item155(
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
  function item146(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item44,
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
    const result1 = item148(remainder);
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
  function item148(text: string): runtime.Success<string> | runtime.Failure {
    const matches = text.match(/^([0-9a-fA-F\-])+/g);
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
          expectation: item154,
          remainder: text,
        }],
      }
    }
  }
  function item159(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item160(text);
    if (result.success === true) {
      return {
        success: true,
        value: item179(
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
  function item160(text: string): runtime.Success<[any]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[bB]/g);
    failedExpectations.push({
      expectation: item162,
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
    const result1 = item165(remainder);
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
  function item165(text: string): runtime.Success<any> | runtime.Failure {
    const result = item166(text);
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
  function item166(text: string): runtime.Success<any> | runtime.Failure {
    const result = item167(text);
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
          result.value[0]
        ),
        remainder: result.remainder,
        failedExpectations: [],
      };
    } else {
      return result;
    }
  }
  function item167(text: string): runtime.Success<[string]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^([ \t\n\f\r\xA0\u2007\u202F\v\x1C-\x1F])*/g);
    failedExpectations.push({
      expectation: item44,
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
    const result1 = item169(remainder);
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
  function item169(text: string): runtime.Success<string> | runtime.Failure {
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
          expectation: item175,
          remainder: text,
        }],
      }
    }
  }
  function item182(text: string): runtime.Success<{ base: any; value: any; }> | runtime.Failure {
    const result = item36(text);
    if (result.success === true) {
      return {
        success: true,
        value: item184(
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
  function item187(text: string): runtime.Success<{ signed: any; type: any; } | null> | runtime.Failure {
    const result = item189(text);
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
  function item189(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item190(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item219,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item190(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const choices = [item191, item209, item216];
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
  function item191(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item192(text);
    if (result.success === true) {
      return {
        success: true,
        value: item208(
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
  function item192(text: string): runtime.Success<[string | any | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[uU]/g);
    failedExpectations.push({
      expectation: item194,
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
    const result1 = item196(remainder);
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
  function item196(text: string): runtime.Success<string | any | null> | runtime.Failure {
    const result = item198(text);
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
  function item198(text: string): runtime.Success<string | any> | runtime.Failure {
    const result = item199(text);
    if (result.success === true) {
      return result;
    } else {
      return {
        success: false,
        remainder: result.remainder,
        failedExpectations: [{
          expectation: item206,
          remainder: result.remainder,
        }],
      };
    }
  }
  function item199(text: string): runtime.Success<string | any> | runtime.Failure {
    const choices = [item200, item202];
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
  function item200(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[BISbis]/g.test(text)) {
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
          expectation: item201,
          remainder: text,
        }],
      };
    }
  }
  function item202(text: string): runtime.Success<any> | runtime.Failure {
    const result = item203(text);
    if (result.success === true) {
      return {
        success: true,
        value: item205(
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
  function item203(text: string): runtime.Success<string> | runtime.Failure {
    if (/^[lL]/g.test(text)) {
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
          expectation: item204,
          remainder: text,
        }],
      };
    }
  }
  function item209(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item210(text);
    if (result.success === true) {
      return {
        success: true,
        value: item215(
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
  function item210(text: string): runtime.Success<[string | any | null]> | runtime.Failure {
    const failedExpectations: runtime.FailedExpectation[] = [];
    let remainder = text;
    const result0 = remainder.match(/^[sS]/g);
    failedExpectations.push({
      expectation: item212,
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
    const result1 = item214(remainder);
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
  function item214(text: string): runtime.Success<string | any | null> | runtime.Failure {
    const result = item198(text);
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
  function item216(text: string): runtime.Success<{ signed: any; type: any; }> | runtime.Failure {
    const result = item198(text);
    if (result.success === true) {
      return {
        success: true,
        value: item218(
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
}

