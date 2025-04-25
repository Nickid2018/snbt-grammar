export class IntegerValue {
  value: bigint;
  signed: boolean;
  type: 'byte' | 'short' | 'int' | 'long' | null;

  private resolved: boolean = false;

  constructor(
    value: bigint,
    signed: boolean,
    type: 'byte' | 'short' | 'int' | 'long' | null
  ) {
    this.value = value;
    this.signed = signed;
    this.type = type;
  }

  _resolve(
    outType?: 'byte' | 'short' | 'int' | 'long',
    error?: base.ParsingError
  ): IntegerValue {
    if (this.resolved) return this;
    const resolveType = this.type ?? outType ?? 'int';
    const type = base.getBitsForInteger(resolveType as base.IntegerTypeSuffix);
    if (this.signed) {
      if (
        this.value > (1n << (type - 1n)) - 1n ||
        this.value < -(1n << (type - 1n))
      ) {
        error?.('Value out of range.');
        return this;
      }
    } else {
      if (this.value > (1n << type) - 1n || this.value < 0n) {
        error?.('Value out of range.');
        return this;
      }
    }
    this.value = BigInt.asIntN(Number(type), this.value);
    this.resolved = true;
    return this;
  }
}

export class FloatValue {
  value: number;
  type: 'float' | 'double';
}

export class IntegerList {
  values: bigint[];
  type: 'byte' | 'short' | 'int' | 'long';
}

export function createInteger(
  num: bigint | number,
  signed?: boolean,
  type?: 'byte' | 'short' | 'int' | 'long'
): IntegerValue {
  return new IntegerValue(BigInt(num), signed ?? true, type ?? null)._resolve();
}

export function createFloat(
  num: number,
  type?: 'float' | 'double'
): FloatValue {
  if (type === 'float') {
    const f32Array = new Float32Array(new ArrayBuffer(4));
    f32Array[0] = num;
    num = f32Array[0];
  }
  return {
    value: num,
    type: type ?? 'double',
  };
}

export type SNBTValue =
  | IntegerValue
  | FloatValue
  | IntegerList
  | string
  | boolean
  | { [p: string]: SNBTValue }
  | Array<SNBTValue>;

export namespace base {
  export type ParsingError = (s: string) => void;

  export enum IntegerTypeSuffix {
    BYTE = 'byte',
    SHORT = 'short',
    INTEGER = 'int',
    LONG = 'long',
  }

  export enum FloatTypeSuffix {
    FLOAT = 'float',
    DOUBLE = 'double',
  }

  export enum SignedPrefix {
    SIGNED = 'signed',
    UNSIGNED = 'unsigned',
  }

  export enum Sign {
    PLUS = '+',
    MINUS = '-',
  }

  export enum Base {
    HEX = 16,
    DEC = 10,
    BIN = 2,
  }

  export interface IntegerLiteral {
    sign: Sign | string;
    suffix: {
      signed: SignedPrefix | null;
      type: IntegerTypeSuffix | null;
    };
    base: number;
    value: string;
  }

  export interface FloatLiteral {
    sign: Sign | string;
    integer: string;
    frac: string;
    exp?: {
      sign: Sign | string;
      value: string;
    };
    suf: FloatTypeSuffix | null;
  }

  export function getBitsForInteger(suffix: IntegerTypeSuffix) {
    switch (suffix) {
      case IntegerTypeSuffix.BYTE:
        return 8n;
      case IntegerTypeSuffix.SHORT:
        return 16n;
      case IntegerTypeSuffix.INTEGER:
        return 32n;
      case IntegerTypeSuffix.LONG:
        return 64n;
    }
  }

  export namespace BuiltinOperation {
    const registry = new Map<
      string,
      (error: ParsingError, ...args: SNBTValue[]) => SNBTValue
    >();

    export function register(
      name: string,
      fn: (error: ParsingError, ...args: SNBTValue[]) => SNBTValue,
      length: number
    ) {
      registry.set(`${length}-${name}`, fn);
    }

    export function get(name: string, length: number) {
      return registry.get(`${length}-${name}`);
    }

    register(
      'bool',
      (error: ParsingError, val: SNBTValue) => {
        if (typeof val === 'boolean') return val;
        if (val instanceof IntegerValue) {
          return val.value !== 0n;
        }
        if (val instanceof FloatValue) {
          return val.value !== 0;
        }
        error('Expect number or boolean');
      },
      1
    );

    register(
      'uuid',
      (error: ParsingError, uuid: SNBTValue) => {
        if (typeof uuid !== 'string') {
          error('Expect string uuid');
          return ''; // will not return
        }
        if (uuid.length > 36) error('Expect string uuid');
        const split = uuid.split('-');
        if (split.length !== 5) error('Expect string uuid');
        const uuidNum =
          ((BigInt(`0x${split[0]}`) & 0xffffffffn) << 96n) |
          ((BigInt(`0x${split[1]}`) & 0xffffn) << 80n) |
          ((BigInt(`0x${split[2]}`) & 0xffffn) << 64n) |
          ((BigInt(`0x${split[3]}`) & 0xffffn) << 48n) |
          (BigInt(`0x${split[4]}`) & 0xffffffffffffn);
        return {
          values: [
            BigInt.asIntN(32, uuidNum >> 96n),
            BigInt.asIntN(32, uuidNum >> 64n),
            BigInt.asIntN(32, uuidNum >> 32n),
            BigInt.asIntN(32, uuidNum),
          ],
          type: 'int',
        };
      },
      1
    );
  }

  export function convertToIntTypeSuffix(suffix: string) {
    switch (suffix) {
      case 'b':
      case 'B':
        return IntegerTypeSuffix.BYTE;
      case 's':
      case 'S':
        return IntegerTypeSuffix.SHORT;
      case 'i':
      case 'I':
        return IntegerTypeSuffix.INTEGER;
      case 'l':
      case 'L':
        return IntegerTypeSuffix.LONG;
    }
  }

  export function convertToFloatTypeSuffix(suffix: string) {
    switch (suffix) {
      case 'f':
      case 'F':
        return FloatTypeSuffix.FLOAT;
      case 'd':
      case 'D':
        return FloatTypeSuffix.DOUBLE;
    }
    return null;
  }

  export function checkNum(num: string, error: ParsingError): string {
    if (num.startsWith('_') || num.endsWith('_'))
      error('Underscore is not allowed');
    return num;
  }

  function cleanNumber(num: string) {
    const needUnderscoreRemoval = num.includes('_');
    if (needUnderscoreRemoval) num = num.replace(/_/g, '');
    return num;
  }

  export function convertNum(
    num: IntegerLiteral,
    error: ParsingError
  ): IntegerValue {
    const signedPrefix = num.suffix
      ? num.suffix.signed
      : num.base === 10
        ? SignedPrefix.SIGNED
        : SignedPrefix.UNSIGNED;
    const signed = signedPrefix === SignedPrefix.SIGNED;
    if (!signed && num.sign === Sign.MINUS)
      error('Expected non negative number');
    num.value = cleanNumber(num.value);
    const converted = `${num.base === Base.HEX ? '0x' : num.base === Base.BIN ? '0b' : ''}${num.value}`;
    let integer = BigInt(converted);
    if (signed) {
      if (num.sign === Sign.MINUS) integer = -integer;
      return new IntegerValue(integer, signed, num.suffix?.type ?? null);
    } else {
      return new IntegerValue(integer, signed, num.suffix?.type ?? null);
    }
  }

  export function convertFloat(
    num: FloatLiteral,
    error: ParsingError
  ): FloatValue {
    num.integer = cleanNumber(num.integer);
    num.frac = cleanNumber(num.frac);
    if (num.exp) num.exp.value = cleanNumber(num.exp.value);
    const converted = `${num.sign}${num.integer}.${num.frac}${num.exp ? `e${num.exp.sign}${num.exp.value}` : ''}`;
    let float = parseFloat(converted);
    if (!isFinite(float)) error('Infinity not allowed');
    const suf = num.suf ? num.suf : FloatTypeSuffix.DOUBLE;
    return createFloat(float, suf);
  }

  export function convertHexString(str: string, error: ParsingError): string {
    const hex = parseInt(str, 16);
    if (hex > 0x10ffff)
      error(
        `Invalid codepoint U+${hex.toString(16).toUpperCase().padStart(8, '0')}`
      );
    return String.fromCodePoint(hex);
  }

  export function convertUnicodeNameString(str: string, error: ParsingError) {
    return str; // TODO
  }

  export function convertUnquotedOrBuiltin(
    str: string,
    argv: SNBTValue[] | null,
    error: ParsingError
  ) {
    if (str.charAt(0).match(/[-+.0-9]/)) error('Invalid unquoted start');
    if (argv) {
      const op = BuiltinOperation.get(str, argv.length);
      if (op) {
        const result = op(error, ...argv);
        if (result) return result;
      }
      error('No such operation');
    }
    if (str.toLowerCase() === 'true') return true;
    if (str.toLowerCase() === 'false') return false;
    return str;
  }

  export function convertIntList(
    prefix: string,
    list: IntegerValue[],
    error: ParsingError
  ) {
    const type = convertToIntTypeSuffix(prefix);
    if (
      list
        .filter(l => !!l.type)
        .some(
          l =>
            getBitsForInteger(l.type as IntegerTypeSuffix) >
            getBitsForInteger(type)
        )
    )
      error('Invalid array element type');
    return {
      type: type,
      values: list.map(l => l._resolve(type).value),
    };
  }

  export function postFixSNBTValue(val: SNBTValue) {
    if (val instanceof IntegerValue) val._resolve();
    else if (Array.isArray(val)) val.map(postFixSNBTValue);
    else if (typeof val === 'object') {
      for (const key in val) {
        postFixSNBTValue(val[key]);
      }
    }
    return val;
  }
}
