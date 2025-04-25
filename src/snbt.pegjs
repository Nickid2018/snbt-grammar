start "snbt" = l:literal { return base.postFixSNBTValue(l); }

_ "whitespace" = [ \t\n\f\r\u00A0\u2007\u202F\u000B\u001C-\u001F]* // Java Character.isWhitespace

// Integer Literal
sign "sign" = "+" / "-"
noSignSuffix = [bB] / [sS] / [iI] / [lL]
notStartNumber = [^+.0-9-]

intSuffix "integer_suffix"
  = [uU] _ suf:$noSignSuffix? { return { signed: base.SignedPrefix.UNSIGNED, type: base.convertToIntTypeSuffix(suf) }; }
  / [sS] _ suf:$noSignSuffix? { return { signed: base.SignedPrefix.SIGNED,   type: base.convertToIntTypeSuffix(suf) }; }
  / suf:$noSignSuffix         { return { signed: null,                       type: base.convertToIntTypeSuffix(suf) }; }

binNumChar "binary_numeral_char"  = [01_]
decNumChar "decimal_numeral_char" = [0-9_]
hexNumChar "hex_numeral_char"     = [0-9a-fA-F_]

binNum "binary_numeral"  = num:$(binNumChar+) { return base.checkNum(num, error); }
decNum "decimal_numeral" = num:$(decNumChar+) { return base.checkNum(num, error); }
hexNum "hex_numeral"     = num:$(hexNumChar+) { return base.checkNum(num, error); }

numSeq "number_sequence"
  = ("0" _ num:(
        [xX] _ hex:hexNum { return { base: base.Base.HEX, value: hex }; }
      / [bB] _ bin:binNum { return { base: base.Base.BIN, value: bin }; }
    ) { return num; } )
  / dec:decNum {
    if (dec.startsWith('0') && dec.length !== 1) {
      error('Leading zeros are not allowed');
    }
    return { base: base.Base.DEC, value: dec };
  }
integer "integer_literal" = sign:sign? _ num:numSeq _ suf:intSuffix? {
  return base.convertNum({ sign: sign || base.Sign.PLUS, suffix: suf, ...num }, error);
}

// Floating Point Literal
floatSuffix = [fF] / [dD]
floatExpPart "float_exponent_part" = [eE] _ sign:sign? _ dec:decNum {
  return { sign: sign || base.Sign.PLUS, value: dec };
}
floatWholePart "float_whole_part" = decNum
floatFracPart "float_fraction_part" = decNum
floatSeq "float_sequence"
  = integer:floatWholePart _ "." _ frac:floatFracPart? _ exp:floatExpPart? _ suf:floatSuffix? { return { integer, frac, exp, suf: base.convertToFloatTypeSuffix(suf) }; }
  / "." _ frac:floatFracPart _ exp:floatExpPart? _ suf:floatSuffix? { return { integer: '0', frac, exp, suf: base.convertToFloatTypeSuffix(suf) }; }
  / integer:floatWholePart _ exp:floatExpPart _ suf:floatSuffix? { return { integer, frac: '0', exp, suf: base.convertToFloatTypeSuffix(suf) }; }
  / integer:floatWholePart _ exp:floatExpPart? _ suf:floatSuffix { return { integer, frac: '0', exp, suf: base.convertToFloatTypeSuffix(suf) }; }
float "float_literal" = sign:sign? _ float:floatSeq {
  return base.convertFloat({ sign: sign || base.Sign.PLUS, ...float }, error);
}

// String Literal
notQuote = [^'"]
hexLiteral "hexadecimal_literal" = [0-9A-Fa-f]
stringHex2 "string_hex_2" = hexLiteral|2|
stringHex4 "string_hex_4" = hexLiteral|4|
stringHex8 "string_hex_8" = hexLiteral|8|
unicodeName "unicode_name" = [-a-zA-Z0-9 ]+
stringEscapeSeq "string_escape_sequence"
  = "b"  { return '\b'; }
  / "s"  { return  ' '; }
  / "t"  { return '\t'; }
  / "n"  { return '\n'; }
  / "f"  { return '\f'; }
  / "r"  { return '\r'; }
  / "\\" { return '\\'; }
  / "'"  { return '\''; }
  / "\"" { return  '"'; }
  / "x" s:$stringHex2 { return base.convertHexString(s, error); }
  / "u" s:$stringHex4 { return base.convertHexString(s, error); }
  / "U" s:$stringHex8 { return base.convertHexString(s, error); }
  / "N" "{" s:$unicodeName "}" { return base.convertUnicodeNameString(s, error); }
stringPlainContents "string_plain_contents" = [^"'\\]+
stringContents "string_contents" = $stringPlainContents / "\\" e:stringEscapeSeq { return e; }

singleQuotedStringChunk    "single_quoted_string_chunk"    = stringContents / "\""
singleQuotedStringContents "single_quoted_string_contents" = singleQuotedStringChunk|..|
doubleQuotedStringChunk    "double_quoted_string_chunk"    = stringContents / "'"
doubleQuotedStringContents "double_quoted_string_contents" = doubleQuotedStringChunk|..|
quotedStringLiteral "quoted_string_literal"
  = "\"" s:doubleQuotedStringContents "\"" { return s.join(''); }
  / "'"  s:singleQuotedStringContents "'"  { return s.join(''); }

unquotedString "unquoted_string" = [0-9A-Za-z_.+-]+
arguments "arguments" = literal|.., _ "," _| / l:literal|1.., _ "," _| _ "," { return l; }
unquotedStringOrBuiltin "unquoted_string_or_builtin"
  = str:$unquotedString _ argv:("(" _ args:arguments _ ")" { return args; })? {
    return base.convertUnquotedOrBuiltin(str, argv, error);
  }

// Map
nonMap = [^{]
mapKey "map_key" = quotedStringLiteral / $unquotedString
mapEntry "map_entry" = key:mapKey _ ":" _ value:literal { return { [key]: value }; }
mapEntries "map_entries" = m:mapEntry|1.., _ "," _| _ ","? { return m; }
mapLiteral "map_literal" = "{" _ entries:mapEntries? _ "}" {
  return entries?.reduce((acc, cur) => ({...acc, ...cur}), {}) ?? {};
}

// List
nonList = [^[]
listEntries "list_entries" = l:literal|1.., _ "," _| _ ","? { return l; }
arrayPrefix "array_prefix" = [BLI]
intArrayEntries "int_array_entries" = i:integer|1.., _ "," _| _ ","? { return i; }
listLiteral "list_literal"
  = "[" _ val:(
      pre:arrayPrefix _ ";" _ entries:intArrayEntries { return base.convertIntList(pre, entries, error); }
    / listEntries
  ) _ "]" { return val; }

literal "literal"
  = !notStartNumber num:(float / integer)   { return num; }
  / !notQuote       str:quotedStringLiteral { return str; }
  / !nonMap         map:mapLiteral          { return map; }
  / !nonList        lst:listLiteral         { return lst; }
  / unquotedStringOrBuiltin
