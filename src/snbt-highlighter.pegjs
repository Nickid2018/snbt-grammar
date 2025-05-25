{{
  function push(tokens, loc, type) {
    tokens.push({ start: loc.start.offset, end: loc.end.offset, type });
  }
}}

literal "literal"
  = &startNumber (float / integer)   { return tokens; }
  / &quote       quotedStringLiteral { return tokens; }
  / &map         mapLiteral          { return tokens; }
  / &list        listLiteral         { return tokens; }
  / unquotedStringOrBuiltin          { return tokens; }

_ "whitespace" = [ \t\n\f\r\u00A0\u2007\u202F\u000B\u001C-\u001F]* // Java Character.isWhitespace

// Integer Literal
sign "sign" = "+" / "-"
noSignSuffix = [bB] / [sS] / [iI] / [lL]
startNumber = [.0-9-+]

intSuffix "integer_suffix"
  = [uU] _ noSignSuffix? { push(tokens, location(), 'numberSuffix'); }
  / [sS] _ noSignSuffix? { push(tokens, location(), 'numberSuffix'); }
  / noSignSuffix         { push(tokens, location(), 'numberSuffix'); }

binNumChar "binary_numeral_char"  = [01_]
decNumChar "decimal_numeral_char" = [0-9_]
hexNumChar "hex_numeral_char"     = [0-9a-fA-F_]

binNum "binary_numeral"  = binNumChar+
decNum "decimal_numeral" = decNumChar+
hexNum "hex_numeral"     = hexNumChar+

numSeq "number_sequence" = ("0" _ ([xX] _ hexNum / [bB] _ binNum)) / decNum
integer "integer_literal" = (sign? _ numSeq { push(tokens, location(), 'number'); }) _ intSuffix?

// Floating Point Literal
floatSuffix
  = [fF] { push(tokens, location(), 'numberSuffix'); }
  / [dD] { push(tokens, location(), 'numberSuffix'); }
floatExpPart "float_exponent_part" = [eE] _ sign? _ decNum
floatWholePart "float_whole_part" = decNum
floatFracPart "float_fraction_part" = decNum
float "float_literal"
  = (sign? _ floatWholePart _ "." _ floatFracPart? _ floatExpPart? { push(tokens, location(), 'number'); }) _ floatSuffix?
  / (sign? _                  "." _ floatFracPart  _ floatExpPart? { push(tokens, location(), 'number'); }) _ floatSuffix?
  / (sign? _ floatWholePart                        _ floatExpPart  { push(tokens, location(), 'number'); }) _ floatSuffix?
  / (sign? _ floatWholePart                        _ floatExpPart? { push(tokens, location(), 'number'); }) _ floatSuffix

// String Literal
quote = ['"]
hexLiteral "hexadecimal_literal" = [0-9A-Fa-f]
stringHex2 "string_hex_2" = hexLiteral|2|
stringHex4 "string_hex_4" = hexLiteral|4|
stringHex8 "string_hex_8" = hexLiteral|8|
unicodeName "unicode_name" = [-a-zA-Z0-9 ]+
stringEscapeSeq "string_escape_sequence"
  = [bstnfr\\'"]
  / "x" stringHex2
  / "u" stringHex4
  / "U" stringHex8
  / "N" "{" unicodeName "}"
stringPlainContents "string_plain_contents" = [^"'\\]+
stringContents "string_contents" = stringPlainContents / "\\" stringEscapeSeq { push(tokens, location(), 'escape'); }

singleQuotedStringChunk    "single_quoted_string_chunk"    = stringContents / "\""
singleQuotedStringContents "single_quoted_string_contents" = singleQuotedStringChunk|..|
doubleQuotedStringChunk    "double_quoted_string_chunk"    = stringContents / "'"
doubleQuotedStringContents "double_quoted_string_contents" = doubleQuotedStringChunk|..|
quotedStringLiteral "quoted_string_literal"
  = "\"" (doubleQuotedStringContents { push(tokens, location(), 'string'); }) "\""
  / "'"  (singleQuotedStringContents { push(tokens, location(), 'string'); }) "'"

unquotedString "unquoted_string" = [0-9A-Za-z_.+-]+
arguments "arguments" = literal|1.., _ "," _| _ ","?
unquotedStringOrBuiltin "unquoted_string_or_builtin"
  = (unquotedString { push(tokens, location(), 'operation'); }) _ "(" _ arguments? _ ")"
  /  unquotedString { push(tokens, location(), 'string');    }

// Map
map = [{]
mapKey "map_key"
  = "\"" (doubleQuotedStringContents { push(tokens, location(), 'key'); }) "\""
  / "'"  (singleQuotedStringContents { push(tokens, location(), 'key'); }) "'"
  /       unquotedString             { push(tokens, location(), 'key'); }
mapEntry "map_entry" = mapKey _ ":" _ literal
mapEntries "map_entries" = mapEntry|1.., _ "," _| _ ","?
mapLiteral "map_literal" = "{" _ mapEntries? _ "}"

// List
list = [[]
listEntries "list_entries" = literal|1.., _ "," _| _ ","?
arrayPrefix "array_prefix" = [BLI] { push(tokens, location(), 'arrayType'); }
intArrayEntries "int_array_entries" = integer|1.., _ "," _| _ ","?
listLiteral "list_literal" = "[" _ ( arrayPrefix _ ";" _ intArrayEntries / listEntries)? _ "]"
