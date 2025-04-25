export interface IntegerValue {
  value: bigint;
  signed: boolean;
  type: 'byte' | 'short' | 'int' | 'long';
}

export interface FloatValue {
  value: number;
  type: 'float' | 'double';
}

export function createInteger(
  num: bigint | number,
  signed?: boolean,
  type?: 'byte' | 'short' | 'int' | 'long'
): IntegerValue {
  return {
    value: BigInt(num),
    signed: signed ?? true,
    type: type ?? 'int',
  };
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

export namespace base {
  type SyntaxError = (s: string) => void;

  export enum TypeSuffix {
    BYTE = 8,
    SHORT = 16,
    INTEGER = 32,
    LONG = 64,

    FLOAT = 'f',
    DOUBLE = 'd',
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
      type: TypeSuffix | null;
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
    suf: TypeSuffix | null;
  }

  export function convertToTypeSuffix(suffix: string) {
    switch (suffix) {
      case 'b':
      case 'B':
        return TypeSuffix.BYTE;
      case 's':
      case 'S':
        return TypeSuffix.SHORT;
      case 'i':
      case 'I':
        return TypeSuffix.INTEGER;
      case 'l':
      case 'L':
        return TypeSuffix.LONG;
      case 'f':
      case 'F':
        return TypeSuffix.FLOAT;
      case 'd':
      case 'D':
        return TypeSuffix.DOUBLE;
    }
    return null;
  }

  export function checkNum(num: string, error: SyntaxError): string {
    if (num.startsWith('_') || num.endsWith('_'))
      error('Underscore is not allowed');
    return num;
  }

  function cleanNumber(num: string) {
    const needUnderscoreRemoval = num.includes('_');
    if (needUnderscoreRemoval) num = num.replace(/_/g, '');
    return num;
  }

  function toIntName(suf: TypeSuffix) {
    switch (suf) {
      case TypeSuffix.BYTE:
        return 'byte';
      case TypeSuffix.SHORT:
        return 'short';
      case TypeSuffix.INTEGER:
        return 'int';
      case TypeSuffix.LONG:
        return 'long';
    }
  }

  function toFloatName(suf: TypeSuffix) {
    switch (suf) {
      case TypeSuffix.FLOAT:
      case TypeSuffix.FLOAT.toUpperCase():
        return 'float';
      case TypeSuffix.DOUBLE:
      case TypeSuffix.DOUBLE.toUpperCase():
        return 'double';
    }
  }

  export function convertNum(
    num: IntegerLiteral,
    error: SyntaxError
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
    const suf = num.suffix?.type ? num.suffix.type : TypeSuffix.INTEGER;
    const type = BigInt(suf);
    let integer = BigInt(converted);
    if (signed) {
      if (num.sign === Sign.MINUS) integer = -integer;
      if (integer > (1n << (type - 1n)) - 1n || integer < -(1n << (type - 1n)))
        error('Value out of range.');
      return {
        value: BigInt.asIntN(Number(type), integer),
        signed,
        type: toIntName(suf),
      };
    } else {
      if (integer > (1n << type) - 1n || integer < 0n)
        error('Value out of range.');
      return {
        value: BigInt.asUintN(Number(type), integer),
        signed,
        type: toIntName(suf),
      };
    }
  }

  export function convertFloat(
    num: FloatLiteral,
    error: SyntaxError
  ): FloatValue {
    num.integer = cleanNumber(num.integer);
    num.frac = cleanNumber(num.frac);
    if (num.exp) num.exp.value = cleanNumber(num.exp.value);
    const converted = `${num.sign}${num.integer}.${num.frac}${num.exp ? `e${num.exp.sign}${num.exp.value}` : ''}`;
    let float = parseFloat(converted);
    if (!isFinite(float)) error('Infinity not allowed');
    const suf = num.suf ? num.suf : TypeSuffix.DOUBLE;
    return createFloat(float, toFloatName(suf));
  }
}
