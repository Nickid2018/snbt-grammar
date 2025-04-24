{{
  // Functions
  function checkNum(num) {
    if (num.startsWith("_") || num.endsWith("_")) throw SyntaxError("Underscore is not allowed");
    return num;
  }
}}

start "snbt" = integer

// Number constants
sign      "sign"
  = "+" / "-"
intSuffix "integer_suffix"
  = [uU](
      unsigned_byte:[bB]
    / unsigned_short:[sS]
    / unsigned_int:[iI]
    / unsigned_long:[lL]
    )
  / [sS](
      signed_byte:[bB]
    / signed_short:[sS]
    / signed_int:[iI]
    / signed_long:[lL]
    )
  / nonsign_byte:[bB]
  / nonsign_short:[bB]
  / nonsign_int:[bB]
  / nonsign_long:[bB]

binNumChar "binary_numeral_char"  = [01_]
decNumChar "decimal_numeral_char" = [0-9-]
hexNumChar "hex_numeral_char"     = [0-9a-fA-F-]

binNum "binary_numeral"  = __ num:$(binNumChar+) { return checkNum(num); }
decNum "decimal_numeral" = __ num:$(decNumChar+) { return checkNum(num); }
hexNum "hex_numeral"     = __ num:$(hexNumChar+) { return checkNum(num); }

integer "integer_literal" = sign:sign? ((zero:"0" ([xX] hex:hexNum / [bB] bin:binNum)) / dec:decNum) suf:intSuffix? {
  const positive = sign !== '-';
  if (num.decNum) {
    if(num.decNum.startsWith('0')) throw SyntaxError("Leading zero is not allowed");
  }
}

// Basic Characters
__ "whitespace" = [ \t\n\f\r\u00A0\u2007\u202F\u000B\u001C-\u001F]* // Java Character.isWhitespace
_ "underscore" = "_"
plainStrChar "plain_string_chunk_char" = [^"'\\]
