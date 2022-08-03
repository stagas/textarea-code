/**
 * @license Apache-2.0
 *
 * Copyright (c) 2021 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var main$a = typeof Object.defineProperty === 'function' ? Object.defineProperty : null
var define_property = main$a
function hasDefinePropertySupport() {
  try {
    define_property({}, 'x', {})
    return true
  } catch (err) {
    return false
  }
}
var has_define_property_support = hasDefinePropertySupport
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var defineProperty = Object.defineProperty
var builtin = defineProperty
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var objectProtoype = Object.prototype
var toStr$1 = objectProtoype.toString
var defineGetter = objectProtoype.__defineGetter__
var defineSetter = objectProtoype.__defineSetter__
var lookupGetter = objectProtoype.__lookupGetter__
var lookupSetter = objectProtoype.__lookupSetter__
function defineProperty$1(obj, prop, descriptor) {
  var prototype
  var hasValue
  var hasGet
  var hasSet
  if (typeof obj !== 'object' || obj === null || toStr$1.call(obj) === '[object Array]') {
    throw new TypeError('invalid argument. First argument must be an object. Value: `' + obj + '`.')
  }
  if (typeof descriptor !== 'object' || descriptor === null || toStr$1.call(descriptor) === '[object Array]') {
    throw new TypeError('invalid argument. Property descriptor must be an object. Value: `' + descriptor + '`.')
  }
  hasValue = 'value' in descriptor
  if (hasValue) {
    if (lookupGetter.call(obj, prop) || lookupSetter.call(obj, prop)) {
      prototype = obj.__proto__
      obj.__proto__ = objectProtoype
      delete obj[prop]
      obj[prop] = descriptor.value
      obj.__proto__ = prototype
    } else {
      obj[prop] = descriptor.value
    }
  }
  hasGet = 'get' in descriptor
  hasSet = 'set' in descriptor
  if (hasValue && (hasGet || hasSet)) {
    throw new Error(
      'invalid argument. Cannot specify one or more accessors and a value or writable attribute in the property descriptor.'
    )
  }
  if (hasGet && defineGetter) {
    defineGetter.call(obj, prop, descriptor.get)
  }
  if (hasSet && defineSetter) {
    defineSetter.call(obj, prop, descriptor.set)
  }
  return obj
}
var polyfill$1 = defineProperty$1
var defineProperty$2
if (has_define_property_support()) {
  defineProperty$2 = builtin
} else {
  defineProperty$2 = polyfill$1
}
var lib$b = defineProperty$2

function setNonEnumerableReadOnly(obj, prop, value) {
  lib$b(obj, prop, {
    configurable: false,
    enumerable: false,
    writable: false,
    value,
  })
}
var main$9 = setNonEnumerableReadOnly
var lib$a = main$9

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function hasSymbolSupport() {
  return typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol'
}
var main$8 = hasSymbolSupport
var lib$9 = main$8

var FLG$2 = lib$9()
function hasToStringTagSupport$1() {
  return FLG$2 && typeof Symbol.toStringTag === 'symbol'
}
var main$7 = hasToStringTagSupport$1
var lib$8 = main$7

var FLG$1 = lib$9()
function hasToStringTagSupport() {
  return FLG$1 && typeof Symbol.toStringTag === 'symbol'
}
var main$6 = hasToStringTagSupport
var lib$7 = main$6

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var has = Object.prototype.hasOwnProperty
function hasOwnProp(value, property) {
  if (value === void 0 || value === null) {
    return false
  }
  return has.call(value, property)
}
var main$5 = hasOwnProp
var lib$6 = main$5

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var toStr = Object.prototype.toString
var tostring = toStr
function nativeClass(v) {
  return tostring.call(v)
}
var native_class = nativeClass
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var toStrTag = typeof Symbol === 'function' ? Symbol.toStringTag : ''
var tostringtag = toStrTag
function nativeClass$1(v) {
  var isOwn
  var tag
  var out
  if (v === null || v === void 0) {
    return tostring.call(v)
  }
  tag = v[tostringtag]
  isOwn = lib$6(v, tostringtag)
  try {
    v[tostringtag] = void 0
  } catch (err) {
    return tostring.call(v)
  }
  out = tostring.call(v)
  if (isOwn) {
    v[tostringtag] = tag
  } else {
    delete v[tostringtag]
  }
  return out
}
var polyfill = nativeClass$1
var nativeClass$2
if (lib$7()) {
  nativeClass$2 = polyfill
} else {
  nativeClass$2 = native_class
}
var lib$5 = nativeClass$2

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function isString$3(value) {
  return typeof value === 'string'
}
var primitive = isString$3
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2018 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var valueOf = String.prototype.valueOf
var valueof = valueOf
function test(value) {
  try {
    valueof.call(value)
    return true
  } catch (err) {
    return false
  }
}
var try2valueof = test
var FLG = lib$8()
function isString$1$1(value) {
  if (typeof value === 'object') {
    if (value instanceof String) {
      return true
    }
    if (FLG) {
      return try2valueof(value)
    }
    return lib$5(value) === '[object String]'
  }
  return false
}
var object = isString$1$1
function isString$2$1(value) {
  return primitive(value) || object(value)
}
var main$4 = isString$2$1
lib$a(main$4, 'isPrimitive', primitive)
lib$a(main$4, 'isObject', object)
var lib$4 = main$4

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2022 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function isNumber(value) {
  return typeof value === 'number'
}
var is_number = isNumber
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2022 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function startsWithMinus(str) {
  return str[0] === '-'
}
function zeros(n) {
  var out = ''
  var i
  for (i = 0; i < n; i++) {
    out += '0'
  }
  return out
}
function zeroPad(str, width, right) {
  var negative = false
  var pad = width - str.length
  if (pad < 0) {
    return str
  }
  if (startsWithMinus(str)) {
    negative = true
    str = str.substr(1)
  }
  str = right ? str + zeros(pad) : zeros(pad) + str
  if (negative) {
    str = '-' + str
  }
  return str
}
var zero_pad = zeroPad
var lowercase = String.prototype.toLowerCase
var uppercase = String.prototype.toUpperCase
function formatInteger(token) {
  var base
  var out
  var i
  switch (token.specifier) {
    case 'b':
      base = 2
      break
    case 'o':
      base = 8
      break
    case 'x':
    case 'X':
      base = 16
      break
    case 'd':
    case 'i':
    case 'u':
    default:
      base = 10
      break
  }

  out = token.arg
  i = parseInt(out, 10)
  if (!isFinite(i)) {
    if (!is_number(out)) {
      throw new Error('invalid integer. Value: ' + out)
    }
    i = 0
  }
  if (i < 0 && (token.specifier === 'u' || base !== 10)) {
    i = 4294967295 + i + 1
  }
  if (i < 0) {
    out = (-i).toString(base)
    if (token.precision) {
      out = zero_pad(out, token.precision, token.padRight)
    }
    out = '-' + out
  } else {
    out = i.toString(base)
    if (!i && !token.precision) {
      out = ''
    } else if (token.precision) {
      out = zero_pad(out, token.precision, token.padRight)
    }
    if (token.sign) {
      out = token.sign + out
    }
  }
  if (base === 16) {
    if (token.alternate) {
      out = '0x' + out
    }
    out = token.specifier === uppercase.call(token.specifier) ? uppercase.call(out) : lowercase.call(out)
  }
  if (base === 8) {
    if (token.alternate && out.charAt(0) !== '0') {
      out = '0' + out
    }
  }
  return out
}
var format_integer = formatInteger
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2022 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function isString$2(value) {
  return typeof value === 'string'
}
var is_string$1 = isString$2
var abs = Math.abs
var lowercase$1 = String.prototype.toLowerCase
var uppercase$1 = String.prototype.toUpperCase
var replace = String.prototype.replace
var RE_EXP_POS_DIGITS = /e\+(\d)$/
var RE_EXP_NEG_DIGITS = /e-(\d)$/
var RE_ONLY_DIGITS = /^(\d+)$/
var RE_DIGITS_BEFORE_EXP = /^(\d+)e/
var RE_TRAILING_PERIOD_ZERO = /\.0$/
var RE_PERIOD_ZERO_EXP = /\.0*e/
var RE_ZERO_BEFORE_EXP = /(\..*[^0])0*e/
function formatDouble(token) {
  var digits
  var out
  var f = parseFloat(token.arg)
  if (!isFinite(f)) {
    if (!is_number(token.arg)) {
      throw new Error('invalid floating-point number. Value: ' + out)
    }
    f = token.arg
  }
  switch (token.specifier) {
    case 'e':
    case 'E':
      out = f.toExponential(token.precision)
      break
    case 'f':
    case 'F':
      out = f.toFixed(token.precision)
      break
    case 'g':
    case 'G':
      if (abs(f) < 1e-4) {
        digits = token.precision
        if (digits > 0) {
          digits -= 1
        }
        out = f.toExponential(digits)
      } else {
        out = f.toPrecision(token.precision)
      }
      if (!token.alternate) {
        out = replace.call(out, RE_ZERO_BEFORE_EXP, '$1e')
        out = replace.call(out, RE_PERIOD_ZERO_EXP, 'e')
        out = replace.call(out, RE_TRAILING_PERIOD_ZERO, '')
      }
      break
    default:
      throw new Error('invalid double notation. Value: ' + token.specifier)
  }

  out = replace.call(out, RE_EXP_POS_DIGITS, 'e+0$1')
  out = replace.call(out, RE_EXP_NEG_DIGITS, 'e-0$1')
  if (token.alternate) {
    out = replace.call(out, RE_ONLY_DIGITS, '$1.')
    out = replace.call(out, RE_DIGITS_BEFORE_EXP, '$1.e')
  }
  if (f >= 0 && token.sign) {
    out = token.sign + out
  }
  out = token.specifier === uppercase$1.call(token.specifier) ? uppercase$1.call(out) : lowercase$1.call(out)
  return out
}
var format_double = formatDouble
/**
 * @license Apache-2.0
 *
 * Copyright (c) 2022 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function spaces(n) {
  var out = ''
  var i
  for (i = 0; i < n; i++) {
    out += ' '
  }
  return out
}
function spacePad(str, width, right) {
  var pad = width - str.length
  if (pad < 0) {
    return str
  }
  str = right ? str + spaces(pad) : spaces(pad) + str
  return str
}
var space_pad = spacePad
var fromCharCode = String.fromCharCode
var isnan = isNaN
var isArray = Array.isArray
function initialize(token) {
  var out = {}
  out.specifier = token.specifier
  out.precision = token.precision === void 0 ? 1 : token.precision
  out.width = token.width
  out.flags = token.flags || ''
  out.mapping = token.mapping
  return out
}
function formatInterpolate(tokens) {
  var hasPeriod
  var flags
  var token
  var flag
  var num
  var out
  var pos
  var i
  var j
  if (!isArray(tokens)) {
    throw new TypeError('invalid argument. First argument must be an array. Value: `' + tokens + '`.')
  }
  out = ''
  pos = 1
  for (i = 0; i < tokens.length; i++) {
    token = tokens[i]
    if (is_string$1(token)) {
      out += token
    } else {
      hasPeriod = token.precision !== void 0
      token = initialize(token)
      if (!token.specifier) {
        throw new TypeError(
          'invalid argument. Token is missing `specifier` property. Index: `' + i + '`. Value: `' + token + '`.'
        )
      }
      if (token.mapping) {
        pos = token.mapping
      }
      flags = token.flags
      for (j = 0; j < flags.length; j++) {
        flag = flags.charAt(j)
        switch (flag) {
          case ' ':
            token.sign = ' '
            break
          case '+':
            token.sign = '+'
            break
          case '-':
            token.padRight = true
            token.padZeros = false
            break
          case '0':
            token.padZeros = flags.indexOf('-') < 0
            break
          case '#':
            token.alternate = true
            break
          default:
            throw new Error('invalid flag: ' + flag)
        }
      }
      if (token.width === '*') {
        token.width = parseInt(arguments[pos], 10)
        pos += 1
        if (isnan(token.width)) {
          throw new TypeError(
            'the argument for * width at position ' + pos + ' is not a number. Value: `' + token.width + '`.'
          )
        }
        if (token.width < 0) {
          token.padRight = true
          token.width = -token.width
        }
      }
      if (hasPeriod) {
        if (token.precision === '*') {
          token.precision = parseInt(arguments[pos], 10)
          pos += 1
          if (isnan(token.precision)) {
            throw new TypeError(
              'the argument for * precision at position ' + pos + ' is not a number. Value: `' + token.precision + '`.'
            )
          }
          if (token.precision < 0) {
            token.precision = 1
            hasPeriod = false
          }
        }
      }
      token.arg = arguments[pos]
      switch (token.specifier) {
        case 'b':
        case 'o':
        case 'x':
        case 'X':
        case 'd':
        case 'i':
        case 'u':
          if (hasPeriod) {
            token.padZeros = false
          }
          token.arg = format_integer(token)
          break
        case 's':
          token.maxWidth = hasPeriod ? token.precision : -1
          break
        case 'c':
          if (!isnan(token.arg)) {
            num = parseInt(token.arg, 10)
            if (num < 0 || num > 127) {
              throw new Error('invalid character code. Value: ' + token.arg)
            }
            token.arg = isnan(num) ? String(token.arg) : fromCharCode(num)
          }
          break
        case 'e':
        case 'E':
        case 'f':
        case 'F':
        case 'g':
        case 'G':
          if (!hasPeriod) {
            token.precision = 6
          }
          token.arg = format_double(token)
          break
        default:
          throw new Error('invalid specifier: ' + token.specifier)
      }

      if (token.maxWidth >= 0 && token.arg.length > token.maxWidth) {
        token.arg = token.arg.substring(0, token.maxWidth)
      }
      if (token.padZeros) {
        token.arg = zero_pad(token.arg, token.width || token.precision, token.padRight)
      } else if (token.width) {
        token.arg = space_pad(token.arg, token.width, token.padRight)
      }
      out += token.arg || ''
      pos += 1
    }
  }
  return out
}
var main$3 = formatInterpolate
var lib$3 = main$3

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2022 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var RE = /%(?:([1-9]\d*)\$)?([0 +\-#]*)(\*|\d+)?(?:(\.)(\*|\d+)?)?[hlL]?([%A-Za-z])/g
function parse(match) {
  var token = {
    mapping: match[1] ? parseInt(match[1], 10) : void 0,
    flags: match[2],
    width: match[3],
    precision: match[5],
    specifier: match[6],
  }

  if (match[4] === '.' && match[5] === void 0) {
    token.precision = '1'
  }
  return token
}
function formatTokenize(str) {
  var content
  var tokens
  var match
  var prev
  tokens = []
  prev = 0
  match = RE.exec(str)
  while (match) {
    content = str.slice(prev, RE.lastIndex - match[0].length)
    if (content.length) {
      tokens.push(content)
    }
    tokens.push(parse(match))
    prev = RE.lastIndex
    match = RE.exec(str)
  }
  content = str.slice(prev)
  if (content.length) {
    tokens.push(content)
  }
  return tokens
}
var main$2 = formatTokenize
var lib$2 = main$2

/**
 * @license Apache-2.0
 *
 * Copyright (c) 2022 The Stdlib Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function isString$1(value) {
  return typeof value === 'string'
}
var is_string = isString$1
function format(str) {
  var tokens
  var args
  var i
  if (!is_string(str)) {
    throw new TypeError(format('invalid argument. First argument must be a string. Value: `%s`.', str))
  }
  tokens = lib$2(str)
  args = new Array(arguments.length)
  args[0] = tokens
  for (i = 1; i < args.length; i++) {
    args[i] = arguments[i]
  }
  return lib$3.apply(null, args)
}
var main$1 = format
var lib$1 = main$1

var isString = lib$4.isPrimitive
var RE_CHARS = /[-/\\^$*+?.()|[\]{}]/g
function rescape(str) {
  var len
  var s
  var i
  if (!isString(str)) {
    throw new TypeError(lib$1('invalid argument. Must provide a regular expression string. Value: `%s`.', str))
  }
  if (str[0] === '/') {
    len = str.length
    for (i = len - 1; i >= 0; i--) {
      if (str[i] === '/') {
        break
      }
    }
  }
  if (i === void 0 || i <= 0) {
    return str.replace(RE_CHARS, '\\$&')
  }
  s = str.substring(1, i)
  s = s.replace(RE_CHARS, '\\$&')
  str = str[0] + s + str.substring(i)
  return str
}
var main = rescape
var lib = main

export { lib as default }
