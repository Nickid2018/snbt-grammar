start "snbt" = literal

// Integer Literal
sign "sign" = "+" / "-"
noSignSuffix "non_sign_suffix" = [bB] / [sS] / [iI] / [lL] { return base.convertToTypeSuffix(text()); }
notStartNumber = [^+-.0-9]

intSuffix "integer_suffix"
  = [uU] suf:noSignSuffix? { return { signed: base.SignedPrefix.UNSIGNED, type: suf }; }
  / [sS] suf:noSignSuffix? { return { signed: base.SignedPrefix.SIGNED,   type: suf }; }
  / suf:noSignSuffix       { return { signed: null,                       type: suf }; }

binNumChar "binary_numeral_char"  = [01_]
decNumChar "decimal_numeral_char" = [0-9-]
hexNumChar "hex_numeral_char"     = [0-9a-fA-F-]

binNum "binary_numeral"  = _ num:$(binNumChar+) { return base.checkNum(num, error); }
decNum "decimal_numeral" = _ num:$(decNumChar+) { return base.checkNum(num, error); }
hexNum "hex_numeral"     = _ num:$(hexNumChar+) { return base.checkNum(num, error); }

numSeq "number_sequence"
  = ("0" num:(
        [xX] hex:hexNum { return { base: base.Base.HEX, value: hex }; }
      / [bB] bin:binNum { return { base: base.Base.BIN, value: bin }; }
    ) { return num; } )
  / dec:decNum {
    if (dec.startsWith('0') && dec.length === 1) {
      error('Leading zeros are not allowed');
    }
    return { base: base.Base.DEC, value: dec };
  }
integer "integer_literal" = sign:sign? num:numSeq suf:intSuffix? {
  return base.convertNum({ sign: sign || base.Sign.PLUS, suffix: suf, ...num }, error);
}

// Floating Point Literal
floatSuffix "float_type_suffix" = [fF] / [dD] { return base.convertToTypeSuffix(text()); }
floatExpPart "float_exponent_part" = [eE] sign:sign? dec:decNum {
  return { sign: sign || base.Sign.PLUS, value: dec };
}
floatWholePart "float_whole_part" = decNum
floatFracPart "float_fraction_part" = decNum
floatSeq "float_sequence"
  = integer:floatWholePart "." frac:floatFracPart? exp:floatExpPart? suf:floatSuffix? { return { integer, frac, exp, suf }; }
  / "." frac:floatFracPart exp:floatExpPart? suf:floatSuffix? { return { integer: '0', frac, exp, suf }; }
  / integer:floatWholePart exp:floatExpPart suf:floatSuffix? { return { integer, frac: '0', exp, suf }; }
  / integer:floatWholePart exp:floatExpPart? suf:floatSuffix { return { integer, frac: '0', exp, suf }; }
float "float_literal" = sign:sign? float:floatSeq {
  return base.convertFloat({ sign: sign || base.Sign.PLUS, ...float }, error);
}

literal "literal" = !notStartNumber num:(float / integer) { return num; }

// Basic Characters
_ "whitespace" = [ \t\n\f\r\u00A0\u2007\u202F\u000B\u001C-\u001F]* // Java Character.isWhitespace
plainStrChar "plain_string_chunk_char" = [^"'\\]
