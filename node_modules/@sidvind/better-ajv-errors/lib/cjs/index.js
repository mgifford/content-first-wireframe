var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/leven/index.js
var require_leven = __commonJS({
  "node_modules/leven/index.js"(exports, module2) {
    "use strict";
    var array = [];
    var charCodeCache = [];
    var leven2 = (left, right) => {
      if (left === right) {
        return 0;
      }
      const swap = left;
      if (left.length > right.length) {
        left = right;
        right = swap;
      }
      let leftLength = left.length;
      let rightLength = right.length;
      while (leftLength > 0 && left.charCodeAt(~-leftLength) === right.charCodeAt(~-rightLength)) {
        leftLength--;
        rightLength--;
      }
      let start = 0;
      while (start < leftLength && left.charCodeAt(start) === right.charCodeAt(start)) {
        start++;
      }
      leftLength -= start;
      rightLength -= start;
      if (leftLength === 0) {
        return rightLength;
      }
      let bCharCode;
      let result;
      let temp;
      let temp2;
      let i = 0;
      let j = 0;
      while (i < leftLength) {
        charCodeCache[i] = left.charCodeAt(start + i);
        array[i] = ++i;
      }
      while (j < rightLength) {
        bCharCode = right.charCodeAt(start + j);
        temp = j++;
        result = j;
        for (i = 0; i < leftLength; i++) {
          temp2 = bCharCode === charCodeCache[i] ? temp : temp + 1;
          temp = array[i];
          result = array[i] = temp > result ? temp2 > result ? result + 1 : temp2 : temp2 > temp ? temp + 1 : temp2;
        }
      }
      return result;
    };
    module2.exports = leven2;
    module2.exports.default = leven2;
  }
});

// node_modules/jsonpointer/jsonpointer.js
var require_jsonpointer = __commonJS({
  "node_modules/jsonpointer/jsonpointer.js"(exports) {
    var hasExcape = /~/;
    var escapeMatcher = /~[01]/g;
    function escapeReplacer(m) {
      switch (m) {
        case "~1":
          return "/";
        case "~0":
          return "~";
      }
      throw new Error("Invalid tilde escape: " + m);
    }
    function untilde(str) {
      if (!hasExcape.test(str))
        return str;
      return str.replace(escapeMatcher, escapeReplacer);
    }
    function setter(obj, pointer2, value) {
      var part;
      var hasNextPart;
      for (var p = 1, len = pointer2.length; p < len; ) {
        if (pointer2[p] === "constructor" || pointer2[p] === "prototype" || pointer2[p] === "__proto__")
          return obj;
        part = untilde(pointer2[p++]);
        hasNextPart = len > p;
        if (typeof obj[part] === "undefined") {
          if (Array.isArray(obj) && part === "-") {
            part = obj.length;
          }
          if (hasNextPart) {
            if (pointer2[p] !== "" && pointer2[p] < Infinity || pointer2[p] === "-")
              obj[part] = [];
            else
              obj[part] = {};
          }
        }
        if (!hasNextPart)
          break;
        obj = obj[part];
      }
      var oldValue = obj[part];
      if (value === void 0)
        delete obj[part];
      else
        obj[part] = value;
      return oldValue;
    }
    function compilePointer(pointer2) {
      if (typeof pointer2 === "string") {
        pointer2 = pointer2.split("/");
        if (pointer2[0] === "")
          return pointer2;
        throw new Error("Invalid JSON pointer.");
      } else if (Array.isArray(pointer2)) {
        for (const part of pointer2) {
          if (typeof part !== "string" && typeof part !== "number") {
            throw new Error("Invalid JSON pointer. Must be of type string or number.");
          }
        }
        return pointer2;
      }
      throw new Error("Invalid JSON pointer.");
    }
    function get(obj, pointer2) {
      if (typeof obj !== "object")
        throw new Error("Invalid input object.");
      pointer2 = compilePointer(pointer2);
      var len = pointer2.length;
      if (len === 1)
        return obj;
      for (var p = 1; p < len; ) {
        obj = obj[untilde(pointer2[p++])];
        if (len === p)
          return obj;
        if (typeof obj !== "object" || obj === null)
          return void 0;
      }
    }
    function set(obj, pointer2, value) {
      if (typeof obj !== "object")
        throw new Error("Invalid input object.");
      pointer2 = compilePointer(pointer2);
      if (pointer2.length === 0)
        throw new Error("Invalid JSON pointer for set.");
      return setter(obj, pointer2, value);
    }
    function compile(pointer2) {
      var compiled = compilePointer(pointer2);
      return {
        get: function(object) {
          return get(object, compiled);
        },
        set: function(object, value) {
          return set(object, compiled, value);
        }
      };
    }
    exports.get = get;
    exports.set = set;
    exports.compile = compile;
  }
});

// src/index.js
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// node_modules/@humanwhocodes/momoa/dist/momoa.js
var LBRACKET = "[";
var RBRACKET = "]";
var LBRACE = "{";
var RBRACE = "}";
var COLON = ":";
var COMMA = ",";
var TRUE = "true";
var FALSE = "false";
var NULL = "null";
var QUOTE$1 = '"';
var expectedKeywords = /* @__PURE__ */ new Map([
  ["t", TRUE],
  ["f", FALSE],
  ["n", NULL]
]);
var escapeToChar = /* @__PURE__ */ new Map([
  [QUOTE$1, QUOTE$1],
  ["\\", "\\"],
  ["/", "/"],
  ["b", "\b"],
  ["n", "\n"],
  ["f", "\f"],
  ["r", "\r"],
  ["t", "	"]
]);
var knownTokenTypes = /* @__PURE__ */ new Map([
  [LBRACKET, "LBracket"],
  [RBRACKET, "RBracket"],
  [LBRACE, "LBrace"],
  [RBRACE, "RBrace"],
  [COLON, "Colon"],
  [COMMA, "Comma"],
  [TRUE, "Boolean"],
  [FALSE, "Boolean"],
  [NULL, "Null"]
]);
var ErrorWithLocation = class extends Error {
  /**
   * Creates a new instance.
   * @param {string} message The error message to report. 
   * @param {Location} loc The location information for the error.
   */
  constructor(message, { line, column, offset }) {
    super(`${message} (${line}:${column})`);
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
};
var UnexpectedChar = class extends ErrorWithLocation {
  /**
   * Creates a new instance.
   * @param {string} unexpected The character that was found.
   * @param {Location} loc The location information for the found character.
   */
  constructor(unexpected, loc) {
    super(`Unexpected character '${unexpected}' found.`, loc);
  }
};
var UnexpectedToken = class extends ErrorWithLocation {
  /**
   * Creates a new instance.
   * @param {Token} token The token that was found. 
   */
  constructor(token) {
    super(`Unexpected token ${token.type} found.`, token.loc.start);
  }
};
var UnexpectedEOF = class extends ErrorWithLocation {
  /**
   * Creates a new instance.
   * @param {Location} loc The location information for the found character.
   */
  constructor(loc) {
    super("Unexpected end of input found.", loc);
  }
};
var QUOTE = '"';
var SLASH = "/";
var STAR = "*";
var DEFAULT_OPTIONS$1 = {
  mode: "json",
  ranges: false
};
function isWhitespace(c) {
  return /[\s\n]/.test(c);
}
function isDigit(c) {
  return c >= "0" && c <= "9";
}
function isHexDigit(c) {
  return isDigit(c) || /[a-f]/i.test(c);
}
function isPositiveDigit(c) {
  return c >= "1" && c <= "9";
}
function isKeywordStart(c) {
  return /[tfn]/.test(c);
}
function isNumberStart(c) {
  return isDigit(c) || c === "." || c === "-";
}
function tokenize(text, options) {
  options = Object.freeze({
    ...DEFAULT_OPTIONS$1,
    ...options
  });
  let offset = -1;
  let line = 1;
  let column = 0;
  let newLine = false;
  const tokens = [];
  function createToken(tokenType, value, startLoc, endLoc) {
    const endOffset = startLoc.offset + value.length;
    let range = options.ranges ? {
      range: [startLoc.offset, endOffset]
    } : void 0;
    return {
      type: tokenType,
      loc: {
        start: startLoc,
        end: endLoc || {
          line: startLoc.line,
          column: startLoc.column + value.length,
          offset: endOffset
        }
      },
      ...range
    };
  }
  function next() {
    let c2 = text.charAt(++offset);
    if (newLine) {
      line++;
      column = 1;
      newLine = false;
    } else {
      column++;
    }
    if (c2 === "\r") {
      newLine = true;
      if (text.charAt(offset + 1) === "\n") {
        offset++;
      }
    } else if (c2 === "\n") {
      newLine = true;
    }
    return c2;
  }
  function locate() {
    return {
      line,
      column,
      offset
    };
  }
  function readKeyword(c2) {
    let value = expectedKeywords.get(c2);
    if (text.slice(offset, offset + value.length) === value) {
      offset += value.length - 1;
      column += value.length - 1;
      return { value, c: next() };
    }
    for (let j = 1; j < value.length; j++) {
      if (value[j] !== text.charAt(offset + j)) {
        unexpected(next());
      }
    }
  }
  function readString(c2) {
    let value = c2;
    c2 = next();
    while (c2 && c2 !== QUOTE) {
      if (c2 === "\\") {
        value += c2;
        c2 = next();
        if (escapeToChar.has(c2)) {
          value += c2;
        } else if (c2 === "u") {
          value += c2;
          for (let i = 0; i < 4; i++) {
            c2 = next();
            if (isHexDigit(c2)) {
              value += c2;
            } else {
              unexpected(c2);
            }
          }
        } else {
          unexpected(c2);
        }
      } else {
        value += c2;
      }
      c2 = next();
    }
    if (!c2) {
      unexpectedEOF();
    }
    value += c2;
    return { value, c: next() };
  }
  function readNumber(c2) {
    let value = "";
    if (c2 === "-") {
      value += c2;
      c2 = next();
      if (!isDigit(c2)) {
        unexpected(c2);
      }
    }
    if (c2 === "0") {
      value += c2;
      c2 = next();
      if (isDigit(c2)) {
        unexpected(c2);
      }
    } else {
      if (!isPositiveDigit(c2)) {
        unexpected(c2);
      }
      do {
        value += c2;
        c2 = next();
      } while (isDigit(c2));
    }
    if (c2 === ".") {
      do {
        value += c2;
        c2 = next();
      } while (isDigit(c2));
    }
    if (c2 === "e" || c2 === "E") {
      value += c2;
      c2 = next();
      if (c2 === "+" || c2 === "-") {
        value += c2;
        c2 = next();
      }
      if (!c2) {
        unexpectedEOF();
      }
      if (!isDigit(c2)) {
        unexpected(c2);
      }
      while (isDigit(c2)) {
        value += c2;
        c2 = next();
      }
    }
    return { value, c: c2 };
  }
  function readComment(c2) {
    let value = c2;
    c2 = next();
    if (c2 === "/") {
      do {
        value += c2;
        c2 = next();
      } while (c2 && c2 !== "\r" && c2 !== "\n");
      return { value, c: c2 };
    }
    if (c2 === STAR) {
      while (c2) {
        value += c2;
        c2 = next();
        if (c2 === STAR) {
          value += c2;
          c2 = next();
          if (c2 === SLASH) {
            value += c2;
            c2 = next();
            return { value, c: c2 };
          }
        }
      }
      unexpectedEOF();
    }
    unexpected(c2);
  }
  function unexpected(c2) {
    throw new UnexpectedChar(c2, locate());
  }
  function unexpectedEOF() {
    throw new UnexpectedEOF(locate());
  }
  let c = next();
  while (offset < text.length) {
    while (isWhitespace(c)) {
      c = next();
    }
    if (!c) {
      break;
    }
    const start = locate();
    if (knownTokenTypes.has(c)) {
      tokens.push(createToken(knownTokenTypes.get(c), c, start));
      c = next();
    } else if (isKeywordStart(c)) {
      const result = readKeyword(c);
      let value = result.value;
      c = result.c;
      tokens.push(createToken(knownTokenTypes.get(value), value, start));
    } else if (isNumberStart(c)) {
      const result = readNumber(c);
      let value = result.value;
      c = result.c;
      tokens.push(createToken("Number", value, start));
    } else if (c === QUOTE) {
      const result = readString(c);
      let value = result.value;
      c = result.c;
      tokens.push(createToken("String", value, start));
    } else if (c === SLASH && options.mode === "jsonc") {
      const result = readComment(c);
      let value = result.value;
      c = result.c;
      tokens.push(createToken(value.startsWith("//") ? "LineComment" : "BlockComment", value, start, locate()));
    } else {
      unexpected(c);
    }
  }
  return tokens;
}
var types = {
  /**
   * Creates a document node.
   * @param {ValueNode} body The body of the document.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {DocumentNode} The document node.
   */
  document(body, parts = {}) {
    return {
      type: "Document",
      body,
      ...parts
    };
  },
  /**
   * Creates a string node.
   * @param {string} value The value for the string.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {StringNode} The string node.
   */
  string(value, parts = {}) {
    return {
      type: "String",
      value,
      ...parts
    };
  },
  /**
   * Creates a number node.
   * @param {number} value The value for the number.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {NumberNode} The number node.
   */
  number(value, parts = {}) {
    return {
      type: "Number",
      value,
      ...parts
    };
  },
  /**
   * Creates a boolean node.
   * @param {boolean} value The value for the boolean.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {BooleanNode} The boolean node.
   */
  boolean(value, parts = {}) {
    return {
      type: "Boolean",
      value,
      ...parts
    };
  },
  /**
   * Creates a null node.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {NullNode} The null node.
   */
  null(parts = {}) {
    return {
      type: "Null",
      ...parts
    };
  },
  /**
   * Creates an array node.
   * @param {Array<ElementNode>} elements The elements to add.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {ArrayNode} The array node.
   */
  array(elements, parts = {}) {
    return {
      type: "Array",
      elements,
      ...parts
    };
  },
  /**
   * Creates an element node.
   * @param {ValueNode} value The value for the element.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {ElementNode} The element node.
   */
  element(value, parts = {}) {
    return {
      type: "Element",
      value,
      ...parts
    };
  },
  /**
   * Creates an object node.
   * @param {Array<MemberNode>} members The members to add.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {ObjectNode} The object node.
   */
  object(members, parts = {}) {
    return {
      type: "Object",
      members,
      ...parts
    };
  },
  /**
   * Creates a member node.
   * @param {StringNode} name The name for the member.
   * @param {ValueNode} value The value for the member.
   * @param {NodeParts} parts Additional properties for the node. 
   * @returns {MemberNode} The member node.
   */
  member(name, value, parts = {}) {
    return {
      type: "Member",
      name,
      value,
      ...parts
    };
  }
};
var DEFAULT_OPTIONS = {
  mode: "json",
  ranges: false,
  tokens: false
};
function getStringValue(value, token) {
  let result = "";
  let escapeIndex = value.indexOf("\\");
  let lastIndex = 0;
  while (escapeIndex >= 0) {
    result += value.slice(lastIndex, escapeIndex);
    const escapeChar = value.charAt(escapeIndex + 1);
    if (escapeToChar.has(escapeChar)) {
      result += escapeToChar.get(escapeChar);
      lastIndex = escapeIndex + 2;
    } else if (escapeChar === "u") {
      const hexCode = value.slice(escapeIndex + 2, escapeIndex + 6);
      if (hexCode.length < 4 || /[^0-9a-f]/i.test(hexCode)) {
        throw new ErrorWithLocation(
          `Invalid unicode escape \\u${hexCode}.`,
          {
            line: token.loc.start.line,
            column: token.loc.start.column + escapeIndex,
            offset: token.loc.start.offset + escapeIndex
          }
        );
      }
      result += String.fromCharCode(parseInt(hexCode, 16));
      lastIndex = escapeIndex + 6;
    } else {
      throw new ErrorWithLocation(
        `Invalid escape \\${escapeChar}.`,
        {
          line: token.loc.start.line,
          column: token.loc.start.column + escapeIndex,
          offset: token.loc.start.offset + escapeIndex
        }
      );
    }
    escapeIndex = value.indexOf("\\", lastIndex);
  }
  result += value.slice(lastIndex);
  return result;
}
function getLiteralValue(value, token) {
  switch (token.type) {
    case "Boolean":
      return value === "true";
    case "Number":
      return Number(value);
    case "String":
      return getStringValue(value.slice(1, -1), token);
    default:
      throw new TypeError(`Unknown token type "${token.type}.`);
  }
}
function parse(text, options) {
  options = Object.freeze({
    ...DEFAULT_OPTIONS,
    ...options
  });
  const tokens = tokenize(text, {
    mode: options.mode,
    ranges: options.ranges
  });
  let tokenIndex = 0;
  function nextNoComments() {
    return tokens[tokenIndex++];
  }
  function nextSkipComments() {
    const nextToken = tokens[tokenIndex++];
    if (nextToken && nextToken.type.endsWith("Comment")) {
      return nextSkipComments();
    }
    return nextToken;
  }
  const next = options.mode === "jsonc" ? nextSkipComments : nextNoComments;
  function assertTokenType(token, type) {
    if (!token || token.type !== type) {
      throw new UnexpectedToken(token);
    }
  }
  function createRange(start, end) {
    return options.ranges ? {
      range: [start.offset, end.offset]
    } : void 0;
  }
  function createLiteralNode(token) {
    const range = createRange(token.loc.start, token.loc.end);
    const value = getLiteralValue(
      text.slice(token.loc.start.offset, token.loc.end.offset),
      token
    );
    const loc = {
      start: {
        ...token.loc.start
      },
      end: {
        ...token.loc.end
      }
    };
    const parts = { loc, ...range };
    switch (token.type) {
      case "String":
        return types.string(
          /** @type {string} */
          value,
          parts
        );
      case "Number":
        return types.number(
          /** @type {number} */
          value,
          parts
        );
      case "Boolean":
        return types.boolean(
          /** @type {boolean} */
          value,
          parts
        );
      default:
        throw new TypeError(`Unknown token type ${token.type}.`);
    }
  }
  function createNullNode(token) {
    const range = createRange(token.loc.start, token.loc.end);
    return types.null({
      loc: {
        start: {
          ...token.loc.start
        },
        end: {
          ...token.loc.end
        }
      },
      ...range
    });
  }
  function parseProperty(token) {
    assertTokenType(token, "String");
    const name = createLiteralNode(token);
    token = next();
    assertTokenType(token, "Colon");
    const value = parseValue();
    const range = createRange(name.loc.start, value.loc.end);
    return types.member(
      /** @type {StringNode} */
      name,
      value,
      {
        loc: {
          start: {
            ...name.loc.start
          },
          end: {
            ...value.loc.end
          }
        },
        ...range
      }
    );
  }
  function parseObject(firstToken) {
    assertTokenType(firstToken, "LBrace");
    const members = [];
    let token = next();
    if (token && token.type !== "RBrace") {
      do {
        members.push(parseProperty(token));
        token = next();
        if (token.type === "Comma") {
          token = next();
        } else {
          break;
        }
      } while (token);
    }
    assertTokenType(token, "RBrace");
    const range = createRange(firstToken.loc.start, token.loc.end);
    return types.object(members, {
      loc: {
        start: {
          ...firstToken.loc.start
        },
        end: {
          ...token.loc.end
        }
      },
      ...range
    });
  }
  function parseArray(firstToken) {
    assertTokenType(firstToken, "LBracket");
    const elements = [];
    let token = next();
    if (token && token.type !== "RBracket") {
      do {
        const value = parseValue(token);
        elements.push(types.element(
          value,
          { loc: value.loc }
        ));
        token = next();
        if (token.type === "Comma") {
          token = next();
        } else {
          break;
        }
      } while (token);
    }
    assertTokenType(token, "RBracket");
    const range = createRange(firstToken.loc.start, token.loc.end);
    return types.array(elements, {
      loc: {
        start: {
          ...firstToken.loc.start
        },
        end: {
          ...token.loc.end
        }
      },
      ...range
    });
  }
  function parseValue(token) {
    token = token || next();
    switch (token.type) {
      case "String":
      case "Boolean":
      case "Number":
        return createLiteralNode(token);
      case "Null":
        return createNullNode(token);
      case "LBrace":
        return parseObject(token);
      case "LBracket":
        return parseArray(token);
      default:
        throw new UnexpectedToken(token);
    }
  }
  const docBody = parseValue();
  const unexpectedToken = next();
  if (unexpectedToken) {
    throw new UnexpectedToken(unexpectedToken);
  }
  const docParts = {
    loc: {
      start: {
        line: 1,
        column: 1,
        offset: 0
      },
      end: {
        ...docBody.loc.end
      }
    }
  };
  if (options.tokens) {
    docParts.tokens = tokens;
  }
  if (options.ranges) {
    docParts.range = [
      docParts.loc.start.offset,
      docParts.loc.end.offset
    ];
  }
  return types.document(docBody, docParts);
}

// src/utils.js
var eq = (x) => (y) => x === y;
var not = (fn) => (x) => !fn(x);
var getValues = (o) => Object.values(o);
var notUndefined = (x) => x !== void 0;
var isXError = (x) => (error) => error.keyword === x;
var isRequiredError = isXError("required");
var isAnyOfError = isXError("anyOf");
var isEnumError = isXError("enum");
var getErrors = (node) => node && node.errors ? node.errors.map(
  (e) => e.keyword === "errorMessage" ? { ...e.params.errors[0], message: e.message } : e
) : [];
var getChildren = (node) => node && getValues(node.children) || [];
var getSiblings = (parent) => (node) => getChildren(parent).filter(not(eq(node)));
var concatAll = (xs) => (ys) => ys.reduce((zs, z) => zs.concat(z), xs);

// src/validation-errors/required.js
var import_chalk = __toESM(require("chalk"));

// src/validation-errors/base.js
var import_code_frame = require("@babel/code-frame");

// src/json/utils.js
var getPointers = (dataPath) => {
  return dataPath.split("/").slice(1).map((pointer2) => pointer2.split("~1").join("/").split("~0").join("~"));
};

// src/json/get-meta-from-path.js
function getMetaFromPath(jsonAst, dataPath, includeIdentifierLocation) {
  const pointers = getPointers(dataPath);
  const lastPointerIndex = pointers.length - 1;
  return pointers.reduce((obj, pointer2, idx) => {
    switch (obj.type) {
      case "Object": {
        const filtered = obj.members.filter(
          (child) => child.name.value === pointer2
        );
        if (filtered.length !== 1) {
          throw new Error(`Couldn't find property ${pointer2} of ${dataPath}`);
        }
        const { name, value } = filtered[0];
        return includeIdentifierLocation && idx === lastPointerIndex ? name : value;
      }
      case "Array":
        return obj.elements[pointer2].value;
      default:
        console.log(obj);
    }
  }, jsonAst.body);
}

// src/json/get-decorated-data-path.js
function getDecoratedDataPath(jsonAst, dataPath) {
  let decoratedPath = "";
  getPointers(dataPath).reduce((obj, pointer2) => {
    switch (obj.type) {
      case "Element":
        obj = obj.value;
      case "Object": {
        decoratedPath += `/${pointer2}`;
        const filtered = obj.members.filter(
          (child) => child.name.value === pointer2
        );
        if (filtered.length !== 1) {
          throw new Error(`Couldn't find property ${pointer2} of ${dataPath}`);
        }
        return filtered[0].value;
      }
      case "Array": {
        decoratedPath += `/${pointer2}${getTypeName(obj.elements[pointer2])}`;
        return obj.elements[pointer2];
      }
      default:
        console.log(obj);
    }
  }, jsonAst.body);
  return decoratedPath;
}
function getTypeName(obj) {
  if (!obj || !obj.elements) {
    return "";
  }
  const type = obj.elements.filter(
    (child) => child && child.name && child.name.value === "type"
  );
  if (!type.length) {
    return "";
  }
  return type[0].value && `:${type[0].value.value}` || "";
}

// src/validation-errors/base.js
var BaseValidationError = class {
  constructor(options = { isIdentifierLocation: false }, { data, schema, jsonAst, jsonRaw }) {
    this.options = options;
    this.data = data;
    this.schema = schema;
    this.jsonAst = jsonAst;
    this.jsonRaw = jsonRaw;
  }
  getLocation(dataPath = this.instancePath) {
    const { isIdentifierLocation, isSkipEndLocation } = this.options;
    const { loc } = getMetaFromPath(
      this.jsonAst,
      dataPath,
      isIdentifierLocation
    );
    return {
      start: loc.start,
      end: isSkipEndLocation ? void 0 : loc.end
    };
  }
  getDecoratedPath(dataPath = this.instancePath) {
    const decoratedPath = getDecoratedDataPath(this.jsonAst, dataPath);
    return decoratedPath;
  }
  getCodeFrame(message, dataPath = this.instancePath) {
    return (0, import_code_frame.codeFrameColumns)(this.jsonRaw, this.getLocation(dataPath), {
      highlightCode: true,
      message
    });
  }
  /**
   * @return {string}
   */
  get instancePath() {
    return typeof this.options.instancePath !== "undefined" ? this.options.instancePath : this.options.dataPath;
  }
  print() {
    throw new Error(
      `Implement the 'print' method inside ${this.constructor.name}!`
    );
  }
  getError() {
    throw new Error(
      `Implement the 'getError' method inside ${this.constructor.name}!`
    );
  }
};

// src/validation-errors/required.js
var RequiredValidationError = class extends BaseValidationError {
  getLocation(dataPath = this.instancePath) {
    const { start } = super.getLocation(dataPath);
    return { start };
  }
  print() {
    const { message, params } = this.options;
    const output = [import_chalk.default`{red {bold REQUIRED} ${message}}\n`];
    return output.concat(
      this.getCodeFrame(
        import_chalk.default`☹️  {magentaBright ${params.missingProperty}} is missing here!`
      )
    );
  }
  getError() {
    const { message } = this.options;
    return {
      ...this.getLocation(),
      error: `${this.getDecoratedPath()} ${message}`,
      path: this.instancePath
    };
  }
};

// src/validation-errors/additional-prop.js
var import_chalk2 = __toESM(require("chalk"));
var AdditionalPropValidationError = class extends BaseValidationError {
  constructor(...args) {
    super(...args);
    this.options.isIdentifierLocation = true;
  }
  print() {
    const { message, params } = this.options;
    const output = [import_chalk2.default`{red {bold ADDTIONAL PROPERTY} ${message}}\n`];
    return output.concat(
      this.getCodeFrame(
        import_chalk2.default`😲  {magentaBright ${params.additionalProperty}} is not expected to be here!`,
        `${this.instancePath}/${params.additionalProperty}`
      )
    );
  }
  getError() {
    const { params } = this.options;
    return {
      ...this.getLocation(`${this.instancePath}/${params.additionalProperty}`),
      error: `${this.getDecoratedPath()} Property ${params.additionalProperty} is not expected to be here`,
      path: this.instancePath
    };
  }
};

// src/validation-errors/enum.js
var import_chalk3 = __toESM(require("chalk"));
var import_leven = __toESM(require_leven());
var import_jsonpointer = __toESM(require_jsonpointer());
var EnumValidationError = class extends BaseValidationError {
  print() {
    const {
      message,
      params: { allowedValues }
    } = this.options;
    const bestMatch = this.findBestMatch();
    const output = [
      import_chalk3.default`{red {bold ENUM} ${message}}`,
      import_chalk3.default`{red (${allowedValues.join(", ")})}\n`
    ];
    return output.concat(
      this.getCodeFrame(
        bestMatch !== null ? import_chalk3.default`👈🏽  Did you mean {magentaBright ${bestMatch}} here?` : import_chalk3.default`👈🏽  Unexpected value, should be equal to one of the allowed values`
      )
    );
  }
  getError() {
    const { message, params } = this.options;
    const bestMatch = this.findBestMatch();
    const allowedValues = params.allowedValues.join(", ");
    const output = {
      ...this.getLocation(),
      error: `${this.getDecoratedPath()} ${message}: ${allowedValues}`,
      path: this.instancePath
    };
    if (bestMatch !== null) {
      output.suggestion = `Did you mean ${bestMatch}?`;
    }
    return output;
  }
  findBestMatch() {
    const {
      params: { allowedValues }
    } = this.options;
    const currentValue = this.instancePath === "" ? this.data : import_jsonpointer.default.get(this.data, this.instancePath);
    if (!currentValue) {
      return null;
    }
    const bestMatch = allowedValues.map((value) => ({
      value,
      weight: (0, import_leven.default)(value, currentValue.toString())
    })).sort(
      (x, y) => x.weight > y.weight ? 1 : x.weight < y.weight ? -1 : 0
    )[0];
    return allowedValues.length === 1 || bestMatch.weight < bestMatch.value.length ? bestMatch.value : null;
  }
};

// src/validation-errors/default.js
var import_chalk4 = __toESM(require("chalk"));
var DefaultValidationError = class extends BaseValidationError {
  print() {
    const { keyword, message } = this.options;
    const output = [import_chalk4.default`{red {bold ${keyword.toUpperCase()}} ${message}}\n`];
    return output.concat(
      this.getCodeFrame(import_chalk4.default`👈🏽  {magentaBright ${keyword}} ${message}`)
    );
  }
  getError() {
    const { keyword, message } = this.options;
    return {
      ...this.getLocation(),
      error: `${this.getDecoratedPath()}: ${keyword} ${message}`,
      path: this.instancePath
    };
  }
};

// src/helpers.js
var JSON_POINTERS_REGEX = /\/[\w_-]+(\/\d+)?/g;
function makeTree(ajvErrors = []) {
  const root = { children: {} };
  ajvErrors.forEach((ajvError) => {
    const instancePath = typeof ajvError.instancePath !== "undefined" ? ajvError.instancePath : ajvError.dataPath;
    const paths = instancePath === "" ? [""] : instancePath.match(JSON_POINTERS_REGEX);
    paths && paths.reduce((obj, path, i) => {
      obj.children[path] = obj.children[path] || { children: {}, errors: [] };
      if (i === paths.length - 1) {
        obj.children[path].errors.push(ajvError);
      }
      return obj.children[path];
    }, root);
  });
  return root;
}
function filterRedundantErrors(root, parent, key) {
  getErrors(root).forEach((error) => {
    if (isRequiredError(error)) {
      root.errors = [error];
      root.children = {};
    }
  });
  if (getErrors(root).some(isAnyOfError)) {
    if (Object.keys(root.children).length > 0) {
      delete root.errors;
    }
  }
  if (root.errors && root.errors.length && getErrors(root).every(isEnumError)) {
    if (getSiblings(parent)(root).filter(notUndefined).some(getErrors)) {
      delete parent.children[key];
    }
  }
  Object.entries(root.children).forEach(
    ([key2, child]) => filterRedundantErrors(child, root, key2)
  );
}
function createErrorInstances(root, options) {
  const errors = getErrors(root);
  if (errors.length && errors.every(isEnumError)) {
    const uniqueValues = new Set(
      concatAll([])(errors.map((e) => e.params.allowedValues))
    );
    const allowedValues = [...uniqueValues];
    const error = errors[0];
    return [
      new EnumValidationError(
        {
          ...error,
          params: { allowedValues }
        },
        options
      )
    ];
  } else {
    return concatAll(
      errors.reduce((ret, error) => {
        switch (error.keyword) {
          case "additionalProperties":
            return ret.concat(
              new AdditionalPropValidationError(error, options)
            );
          case "enum":
            return ret.concat(new EnumValidationError(error, options));
          case "required":
            return ret.concat(new RequiredValidationError(error, options));
          default:
            return ret.concat(new DefaultValidationError(error, options));
        }
      }, [])
    )(getChildren(root).map((child) => createErrorInstances(child, options)));
  }
}
var helpers_default = (ajvErrors, options) => {
  const tree = makeTree(ajvErrors || []);
  filterRedundantErrors(tree);
  return createErrorInstances(tree, options);
};

// src/index.js
var src_default = (schema, data, errors, options = {}) => {
  const { format = "cli", indent = null, json = null } = options;
  const jsonRaw = json || JSON.stringify(data, null, indent);
  const jsonAst = parse(jsonRaw);
  const customErrorToText = (error) => error.print().join("\n");
  const customErrorToStructure = (error) => error.getError();
  const customErrors = helpers_default(errors, {
    data,
    schema,
    jsonAst,
    jsonRaw
  });
  if (format === "cli") {
    return customErrors.map(customErrorToText).join("\n\n");
  } else {
    return customErrors.map(customErrorToStructure);
  }
};
//# sourceMappingURL=index.js.map
