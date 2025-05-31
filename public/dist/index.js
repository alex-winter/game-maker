/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/uuid/dist/cjs-browser/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.version = exports.validate = exports.v7 = exports.v6ToV1 = exports.v6 = exports.v5 = exports.v4 = exports.v3 = exports.v1ToV6 = exports.v1 = exports.stringify = exports.parse = exports.NIL = exports.MAX = void 0;
var max_js_1 = __webpack_require__(/*! ./max.js */ "./node_modules/uuid/dist/cjs-browser/max.js");
Object.defineProperty(exports, "MAX", ({ enumerable: true, get: function () { return max_js_1.default; } }));
var nil_js_1 = __webpack_require__(/*! ./nil.js */ "./node_modules/uuid/dist/cjs-browser/nil.js");
Object.defineProperty(exports, "NIL", ({ enumerable: true, get: function () { return nil_js_1.default; } }));
var parse_js_1 = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/cjs-browser/parse.js");
Object.defineProperty(exports, "parse", ({ enumerable: true, get: function () { return parse_js_1.default; } }));
var stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
Object.defineProperty(exports, "stringify", ({ enumerable: true, get: function () { return stringify_js_1.default; } }));
var v1_js_1 = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist/cjs-browser/v1.js");
Object.defineProperty(exports, "v1", ({ enumerable: true, get: function () { return v1_js_1.default; } }));
var v1ToV6_js_1 = __webpack_require__(/*! ./v1ToV6.js */ "./node_modules/uuid/dist/cjs-browser/v1ToV6.js");
Object.defineProperty(exports, "v1ToV6", ({ enumerable: true, get: function () { return v1ToV6_js_1.default; } }));
var v3_js_1 = __webpack_require__(/*! ./v3.js */ "./node_modules/uuid/dist/cjs-browser/v3.js");
Object.defineProperty(exports, "v3", ({ enumerable: true, get: function () { return v3_js_1.default; } }));
var v4_js_1 = __webpack_require__(/*! ./v4.js */ "./node_modules/uuid/dist/cjs-browser/v4.js");
Object.defineProperty(exports, "v4", ({ enumerable: true, get: function () { return v4_js_1.default; } }));
var v5_js_1 = __webpack_require__(/*! ./v5.js */ "./node_modules/uuid/dist/cjs-browser/v5.js");
Object.defineProperty(exports, "v5", ({ enumerable: true, get: function () { return v5_js_1.default; } }));
var v6_js_1 = __webpack_require__(/*! ./v6.js */ "./node_modules/uuid/dist/cjs-browser/v6.js");
Object.defineProperty(exports, "v6", ({ enumerable: true, get: function () { return v6_js_1.default; } }));
var v6ToV1_js_1 = __webpack_require__(/*! ./v6ToV1.js */ "./node_modules/uuid/dist/cjs-browser/v6ToV1.js");
Object.defineProperty(exports, "v6ToV1", ({ enumerable: true, get: function () { return v6ToV1_js_1.default; } }));
var v7_js_1 = __webpack_require__(/*! ./v7.js */ "./node_modules/uuid/dist/cjs-browser/v7.js");
Object.defineProperty(exports, "v7", ({ enumerable: true, get: function () { return v7_js_1.default; } }));
var validate_js_1 = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/cjs-browser/validate.js");
Object.defineProperty(exports, "validate", ({ enumerable: true, get: function () { return validate_js_1.default; } }));
var version_js_1 = __webpack_require__(/*! ./version.js */ "./node_modules/uuid/dist/cjs-browser/version.js");
Object.defineProperty(exports, "version", ({ enumerable: true, get: function () { return version_js_1.default; } }));


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/max.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/max.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = 'ffffffff-ffff-ffff-ffff-ffffffffffff';


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/md5.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/md5.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
function md5(bytes) {
    const words = uint8ToUint32(bytes);
    const md5Bytes = wordsToMd5(words, bytes.length * 8);
    return uint32ToUint8(md5Bytes);
}
function uint32ToUint8(input) {
    const bytes = new Uint8Array(input.length * 4);
    for (let i = 0; i < input.length * 4; i++) {
        bytes[i] = (input[i >> 2] >>> ((i % 4) * 8)) & 0xff;
    }
    return bytes;
}
function getOutputLength(inputLength8) {
    return (((inputLength8 + 64) >>> 9) << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
    const xpad = new Uint32Array(getOutputLength(len)).fill(0);
    xpad.set(x);
    xpad[len >> 5] |= 0x80 << len % 32;
    xpad[xpad.length - 1] = len;
    x = xpad;
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
        const olda = a;
        const oldb = b;
        const oldc = c;
        const oldd = d;
        a = md5ff(a, b, c, d, x[i], 7, -680876936);
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, x[i], 11, -358537222);
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
        a = md5ii(a, b, c, d, x[i], 6, -198630844);
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
        a = safeAdd(a, olda);
        b = safeAdd(b, oldb);
        c = safeAdd(c, oldc);
        d = safeAdd(d, oldd);
    }
    return Uint32Array.of(a, b, c, d);
}
function uint8ToUint32(input) {
    if (input.length === 0) {
        return new Uint32Array();
    }
    const output = new Uint32Array(getOutputLength(input.length * 8)).fill(0);
    for (let i = 0; i < input.length; i++) {
        output[i >> 2] |= (input[i] & 0xff) << ((i % 4) * 8);
    }
    return output;
}
function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
}
function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}
function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
exports["default"] = md5;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/native.js":
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/native.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
exports["default"] = { randomUUID };


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/nil.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/nil.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = '00000000-0000-0000-0000-000000000000';


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/parse.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/parse.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const validate_js_1 = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/cjs-browser/validate.js");
function parse(uuid) {
    if (!(0, validate_js_1.default)(uuid)) {
        throw TypeError('Invalid UUID');
    }
    let v;
    return Uint8Array.of((v = parseInt(uuid.slice(0, 8), 16)) >>> 24, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff, (v = parseInt(uuid.slice(9, 13), 16)) >>> 8, v & 0xff, (v = parseInt(uuid.slice(14, 18), 16)) >>> 8, v & 0xff, (v = parseInt(uuid.slice(19, 23), 16)) >>> 8, v & 0xff, ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff, (v / 0x100000000) & 0xff, (v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
}
exports["default"] = parse;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
    if (!getRandomValues) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
}
exports["default"] = rng;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/sha1.js":
/*!****************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/sha1.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
function f(s, x, y, z) {
    switch (s) {
        case 0:
            return (x & y) ^ (~x & z);
        case 1:
            return x ^ y ^ z;
        case 2:
            return (x & y) ^ (x & z) ^ (y & z);
        case 3:
            return x ^ y ^ z;
    }
}
function ROTL(x, n) {
    return (x << n) | (x >>> (32 - n));
}
function sha1(bytes) {
    const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
    const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
    const newBytes = new Uint8Array(bytes.length + 1);
    newBytes.set(bytes);
    newBytes[bytes.length] = 0x80;
    bytes = newBytes;
    const l = bytes.length / 4 + 2;
    const N = Math.ceil(l / 16);
    const M = new Array(N);
    for (let i = 0; i < N; ++i) {
        const arr = new Uint32Array(16);
        for (let j = 0; j < 16; ++j) {
            arr[j] =
                (bytes[i * 64 + j * 4] << 24) |
                    (bytes[i * 64 + j * 4 + 1] << 16) |
                    (bytes[i * 64 + j * 4 + 2] << 8) |
                    bytes[i * 64 + j * 4 + 3];
        }
        M[i] = arr;
    }
    M[N - 1][14] = ((bytes.length - 1) * 8) / Math.pow(2, 32);
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = ((bytes.length - 1) * 8) & 0xffffffff;
    for (let i = 0; i < N; ++i) {
        const W = new Uint32Array(80);
        for (let t = 0; t < 16; ++t) {
            W[t] = M[i][t];
        }
        for (let t = 16; t < 80; ++t) {
            W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
        }
        let a = H[0];
        let b = H[1];
        let c = H[2];
        let d = H[3];
        let e = H[4];
        for (let t = 0; t < 80; ++t) {
            const s = Math.floor(t / 20);
            const T = (ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t]) >>> 0;
            e = d;
            d = c;
            c = ROTL(b, 30) >>> 0;
            b = a;
            a = T;
        }
        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
    }
    return Uint8Array.of(H[0] >> 24, H[0] >> 16, H[0] >> 8, H[0], H[1] >> 24, H[1] >> 16, H[1] >> 8, H[1], H[2] >> 24, H[2] >> 16, H[2] >> 8, H[2], H[3] >> 24, H[3] >> 16, H[3] >> 8, H[3], H[4] >> 24, H[4] >> 16, H[4] >> 8, H[4]);
}
exports["default"] = sha1;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unsafeStringify = void 0;
const validate_js_1 = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/cjs-browser/validate.js");
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}
exports.unsafeStringify = unsafeStringify;
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!(0, validate_js_1.default)(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
exports["default"] = stringify;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v1.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v1.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateV1State = void 0;
const rng_js_1 = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/cjs-browser/rng.js");
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
const _state = {};
function v1(options, buf, offset) {
    let bytes;
    const isV6 = options?._v6 ?? false;
    if (options) {
        const optionsKeys = Object.keys(options);
        if (optionsKeys.length === 1 && optionsKeys[0] === '_v6') {
            options = undefined;
        }
    }
    if (options) {
        bytes = v1Bytes(options.random ?? options.rng?.() ?? (0, rng_js_1.default)(), options.msecs, options.nsecs, options.clockseq, options.node, buf, offset);
    }
    else {
        const now = Date.now();
        const rnds = (0, rng_js_1.default)();
        updateV1State(_state, now, rnds);
        bytes = v1Bytes(rnds, _state.msecs, _state.nsecs, isV6 ? undefined : _state.clockseq, isV6 ? undefined : _state.node, buf, offset);
    }
    return buf ?? (0, stringify_js_1.unsafeStringify)(bytes);
}
function updateV1State(state, now, rnds) {
    state.msecs ??= -Infinity;
    state.nsecs ??= 0;
    if (now === state.msecs) {
        state.nsecs++;
        if (state.nsecs >= 10000) {
            state.node = undefined;
            state.nsecs = 0;
        }
    }
    else if (now > state.msecs) {
        state.nsecs = 0;
    }
    else if (now < state.msecs) {
        state.node = undefined;
    }
    if (!state.node) {
        state.node = rnds.slice(10, 16);
        state.node[0] |= 0x01;
        state.clockseq = ((rnds[8] << 8) | rnds[9]) & 0x3fff;
    }
    state.msecs = now;
    return state;
}
exports.updateV1State = updateV1State;
function v1Bytes(rnds, msecs, nsecs, clockseq, node, buf, offset = 0) {
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    if (!buf) {
        buf = new Uint8Array(16);
        offset = 0;
    }
    else {
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
    }
    msecs ??= Date.now();
    nsecs ??= 0;
    clockseq ??= ((rnds[8] << 8) | rnds[9]) & 0x3fff;
    node ??= rnds.slice(10, 16);
    msecs += 12219292800000;
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    buf[offset++] = (tl >>> 24) & 0xff;
    buf[offset++] = (tl >>> 16) & 0xff;
    buf[offset++] = (tl >>> 8) & 0xff;
    buf[offset++] = tl & 0xff;
    const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
    buf[offset++] = (tmh >>> 8) & 0xff;
    buf[offset++] = tmh & 0xff;
    buf[offset++] = ((tmh >>> 24) & 0xf) | 0x10;
    buf[offset++] = (tmh >>> 16) & 0xff;
    buf[offset++] = (clockseq >>> 8) | 0x80;
    buf[offset++] = clockseq & 0xff;
    for (let n = 0; n < 6; ++n) {
        buf[offset++] = node[n];
    }
    return buf;
}
exports["default"] = v1;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v1ToV6.js":
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v1ToV6.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const parse_js_1 = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/cjs-browser/parse.js");
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
function v1ToV6(uuid) {
    const v1Bytes = typeof uuid === 'string' ? (0, parse_js_1.default)(uuid) : uuid;
    const v6Bytes = _v1ToV6(v1Bytes);
    return typeof uuid === 'string' ? (0, stringify_js_1.unsafeStringify)(v6Bytes) : v6Bytes;
}
exports["default"] = v1ToV6;
function _v1ToV6(v1Bytes) {
    return Uint8Array.of(((v1Bytes[6] & 0x0f) << 4) | ((v1Bytes[7] >> 4) & 0x0f), ((v1Bytes[7] & 0x0f) << 4) | ((v1Bytes[4] & 0xf0) >> 4), ((v1Bytes[4] & 0x0f) << 4) | ((v1Bytes[5] & 0xf0) >> 4), ((v1Bytes[5] & 0x0f) << 4) | ((v1Bytes[0] & 0xf0) >> 4), ((v1Bytes[0] & 0x0f) << 4) | ((v1Bytes[1] & 0xf0) >> 4), ((v1Bytes[1] & 0x0f) << 4) | ((v1Bytes[2] & 0xf0) >> 4), 0x60 | (v1Bytes[2] & 0x0f), v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
}


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v3.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v3.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.URL = exports.DNS = void 0;
const md5_js_1 = __webpack_require__(/*! ./md5.js */ "./node_modules/uuid/dist/cjs-browser/md5.js");
const v35_js_1 = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/cjs-browser/v35.js");
var v35_js_2 = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/cjs-browser/v35.js");
Object.defineProperty(exports, "DNS", ({ enumerable: true, get: function () { return v35_js_2.DNS; } }));
Object.defineProperty(exports, "URL", ({ enumerable: true, get: function () { return v35_js_2.URL; } }));
function v3(value, namespace, buf, offset) {
    return (0, v35_js_1.default)(0x30, md5_js_1.default, value, namespace, buf, offset);
}
v3.DNS = v35_js_1.DNS;
v3.URL = v35_js_1.URL;
exports["default"] = v3;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v35.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v35.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.URL = exports.DNS = exports.stringToBytes = void 0;
const parse_js_1 = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/cjs-browser/parse.js");
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; ++i) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}
exports.stringToBytes = stringToBytes;
exports.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
exports.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
function v35(version, hash, value, namespace, buf, offset) {
    const valueBytes = typeof value === 'string' ? stringToBytes(value) : value;
    const namespaceBytes = typeof namespace === 'string' ? (0, parse_js_1.default)(namespace) : namespace;
    if (typeof namespace === 'string') {
        namespace = (0, parse_js_1.default)(namespace);
    }
    if (namespace?.length !== 16) {
        throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
    }
    let bytes = new Uint8Array(16 + valueBytes.length);
    bytes.set(namespaceBytes);
    bytes.set(valueBytes, namespaceBytes.length);
    bytes = hash(bytes);
    bytes[6] = (bytes[6] & 0x0f) | version;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = bytes[i];
        }
        return buf;
    }
    return (0, stringify_js_1.unsafeStringify)(bytes);
}
exports["default"] = v35;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const native_js_1 = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist/cjs-browser/native.js");
const rng_js_1 = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/cjs-browser/rng.js");
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
function v4(options, buf, offset) {
    if (native_js_1.default.randomUUID && !buf && !options) {
        return native_js_1.default.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? (0, rng_js_1.default)();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return (0, stringify_js_1.unsafeStringify)(rnds);
}
exports["default"] = v4;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v5.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v5.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.URL = exports.DNS = void 0;
const sha1_js_1 = __webpack_require__(/*! ./sha1.js */ "./node_modules/uuid/dist/cjs-browser/sha1.js");
const v35_js_1 = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/cjs-browser/v35.js");
var v35_js_2 = __webpack_require__(/*! ./v35.js */ "./node_modules/uuid/dist/cjs-browser/v35.js");
Object.defineProperty(exports, "DNS", ({ enumerable: true, get: function () { return v35_js_2.DNS; } }));
Object.defineProperty(exports, "URL", ({ enumerable: true, get: function () { return v35_js_2.URL; } }));
function v5(value, namespace, buf, offset) {
    return (0, v35_js_1.default)(0x50, sha1_js_1.default, value, namespace, buf, offset);
}
v5.DNS = v35_js_1.DNS;
v5.URL = v35_js_1.URL;
exports["default"] = v5;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v6.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v6.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
const v1_js_1 = __webpack_require__(/*! ./v1.js */ "./node_modules/uuid/dist/cjs-browser/v1.js");
const v1ToV6_js_1 = __webpack_require__(/*! ./v1ToV6.js */ "./node_modules/uuid/dist/cjs-browser/v1ToV6.js");
function v6(options, buf, offset) {
    options ??= {};
    offset ??= 0;
    let bytes = (0, v1_js_1.default)({ ...options, _v6: true }, new Uint8Array(16));
    bytes = (0, v1ToV6_js_1.default)(bytes);
    if (buf) {
        for (let i = 0; i < 16; i++) {
            buf[offset + i] = bytes[i];
        }
        return buf;
    }
    return (0, stringify_js_1.unsafeStringify)(bytes);
}
exports["default"] = v6;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v6ToV1.js":
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v6ToV1.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const parse_js_1 = __webpack_require__(/*! ./parse.js */ "./node_modules/uuid/dist/cjs-browser/parse.js");
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
function v6ToV1(uuid) {
    const v6Bytes = typeof uuid === 'string' ? (0, parse_js_1.default)(uuid) : uuid;
    const v1Bytes = _v6ToV1(v6Bytes);
    return typeof uuid === 'string' ? (0, stringify_js_1.unsafeStringify)(v1Bytes) : v1Bytes;
}
exports["default"] = v6ToV1;
function _v6ToV1(v6Bytes) {
    return Uint8Array.of(((v6Bytes[3] & 0x0f) << 4) | ((v6Bytes[4] >> 4) & 0x0f), ((v6Bytes[4] & 0x0f) << 4) | ((v6Bytes[5] & 0xf0) >> 4), ((v6Bytes[5] & 0x0f) << 4) | (v6Bytes[6] & 0x0f), v6Bytes[7], ((v6Bytes[1] & 0x0f) << 4) | ((v6Bytes[2] & 0xf0) >> 4), ((v6Bytes[2] & 0x0f) << 4) | ((v6Bytes[3] & 0xf0) >> 4), 0x10 | ((v6Bytes[0] & 0xf0) >> 4), ((v6Bytes[0] & 0x0f) << 4) | ((v6Bytes[1] & 0xf0) >> 4), v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
}


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/v7.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/v7.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateV7State = void 0;
const rng_js_1 = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/cjs-browser/rng.js");
const stringify_js_1 = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/cjs-browser/stringify.js");
const _state = {};
function v7(options, buf, offset) {
    let bytes;
    if (options) {
        bytes = v7Bytes(options.random ?? options.rng?.() ?? (0, rng_js_1.default)(), options.msecs, options.seq, buf, offset);
    }
    else {
        const now = Date.now();
        const rnds = (0, rng_js_1.default)();
        updateV7State(_state, now, rnds);
        bytes = v7Bytes(rnds, _state.msecs, _state.seq, buf, offset);
    }
    return buf ?? (0, stringify_js_1.unsafeStringify)(bytes);
}
function updateV7State(state, now, rnds) {
    state.msecs ??= -Infinity;
    state.seq ??= 0;
    if (now > state.msecs) {
        state.seq = (rnds[6] << 23) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
        state.msecs = now;
    }
    else {
        state.seq = (state.seq + 1) | 0;
        if (state.seq === 0) {
            state.msecs++;
        }
    }
    return state;
}
exports.updateV7State = updateV7State;
function v7Bytes(rnds, msecs, seq, buf, offset = 0) {
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    if (!buf) {
        buf = new Uint8Array(16);
        offset = 0;
    }
    else {
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
    }
    msecs ??= Date.now();
    seq ??= ((rnds[6] * 0x7f) << 24) | (rnds[7] << 16) | (rnds[8] << 8) | rnds[9];
    buf[offset++] = (msecs / 0x10000000000) & 0xff;
    buf[offset++] = (msecs / 0x100000000) & 0xff;
    buf[offset++] = (msecs / 0x1000000) & 0xff;
    buf[offset++] = (msecs / 0x10000) & 0xff;
    buf[offset++] = (msecs / 0x100) & 0xff;
    buf[offset++] = msecs & 0xff;
    buf[offset++] = 0x70 | ((seq >>> 28) & 0x0f);
    buf[offset++] = (seq >>> 20) & 0xff;
    buf[offset++] = 0x80 | ((seq >>> 14) & 0x3f);
    buf[offset++] = (seq >>> 6) & 0xff;
    buf[offset++] = ((seq << 2) & 0xff) | (rnds[10] & 0x03);
    buf[offset++] = rnds[11];
    buf[offset++] = rnds[12];
    buf[offset++] = rnds[13];
    buf[offset++] = rnds[14];
    buf[offset++] = rnds[15];
    return buf;
}
exports["default"] = v7;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const regex_js_1 = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/cjs-browser/regex.js");
function validate(uuid) {
    return typeof uuid === 'string' && regex_js_1.default.test(uuid);
}
exports["default"] = validate;


/***/ }),

/***/ "./node_modules/uuid/dist/cjs-browser/version.js":
/*!*******************************************************!*\
  !*** ./node_modules/uuid/dist/cjs-browser/version.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const validate_js_1 = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/cjs-browser/validate.js");
function version(uuid) {
    if (!(0, validate_js_1.default)(uuid)) {
        throw TypeError('Invalid UUID');
    }
    return parseInt(uuid.slice(14, 15), 16);
}
exports["default"] = version;


/***/ }),

/***/ "./src/Client/Component/Canvas/Canvas.ts":
/*!***********************************************!*\
  !*** ./src/Client/Component/Canvas/Canvas.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Canvas2D = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class Canvas2D extends Component_1.Component {
    animationTimeout;
    frameFunction;
    msPerFrame = 100;
    externalListeners = {
        'window-resize': this.handleResize
    };
    css() {
        return /*css*/ `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            :host(.hide) {
                visibility: hidden;
                pointer-events: none;
            }
        `;
    }
    drawImage(image, dx, dy, dw, dh, sx, sy, sw, sh) {
        const ctx = this.getCtx();
        if (sx !== undefined &&
            sy !== undefined &&
            sw !== undefined &&
            sh !== undefined &&
            dw !== undefined &&
            dh !== undefined) {
            ctx?.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        else if (dw !== undefined && dh !== undefined) {
            ctx?.drawImage(image, dx, dy, dw, dh);
        }
        else {
            ctx?.drawImage(image, dx, dy);
        }
    }
    drawDebugRect(rect) {
        const ctx = this.getCtx();
        if (ctx) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }
    }
    startAnimation(frameFunction) {
        this.frameFunction = frameFunction;
        this.frame();
    }
    stopAnimation() {
        clearTimeout(this.animationTimeout);
    }
    isRectVisible(viewCoordinates, rect) {
        const canvas = this.getCanvas();
        if (!canvas) {
            return false;
        }
        const viewLeft = viewCoordinates.x;
        const viewTop = viewCoordinates.y;
        const viewRight = viewLeft + canvas.width;
        const viewBottom = viewTop + canvas.height;
        return !(rect.x + rect.width < viewLeft ||
            rect.x > viewRight ||
            rect.y + rect.height < viewTop ||
            rect.y > viewBottom);
    }
    async setup() {
        this.msPerFrame = 1000 / this.parameters.fps | 30;
    }
    build() {
        const canvas = Dom_1.Dom.canvas();
        canvas.width = this.offsetWidth;
        canvas.height = this.offsetHeight;
        return canvas;
    }
    afterBuild() {
        this.handleResize();
    }
    handleResize() {
        const canvas = this.getCanvas();
        if (canvas) {
            canvas.width = this.offsetWidth;
            canvas.height = this.offsetHeight;
        }
    }
    frame() {
        const ctx = this.getCtx();
        this.clear();
        if (ctx) {
            this.frameFunction(ctx);
        }
        this.animationTimeout = setTimeout(() => window.requestAnimationFrame(this.frame.bind(this)), this.msPerFrame);
    }
    clear() {
        const canvas = this.getCanvas();
        if (canvas) {
            this.getCtx()?.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    getCanvas() {
        return this.findOne('canvas');
    }
    getCtx() {
        return this.getCanvas()?.getContext('2d') ?? null;
    }
}
exports.Canvas2D = Canvas2D;


/***/ }),

/***/ "./src/Client/Component/Canvas/CanvasLayer.ts":
/*!****************************************************!*\
  !*** ./src/Client/Component/Canvas/CanvasLayer.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasLayer = void 0;
const layers_1 = __webpack_require__(/*! Client/Constants/layers */ "./src/Client/Constants/layers.ts");
const mouse_events_1 = __webpack_require__(/*! Client/Constants/mouse-events */ "./src/Client/Constants/mouse-events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const generate_image_1 = __webpack_require__(/*! Client/Service/generate-image */ "./src/Client/Service/generate-image.ts");
const PlacementImageRepository_1 = __webpack_require__(/*! Client/Service/Repository/PlacementImageRepository */ "./src/Client/Service/Repository/PlacementImageRepository.ts");
const Canvas_1 = __webpack_require__(/*! Client/Component/Canvas/Canvas */ "./src/Client/Component/Canvas/Canvas.ts");
const LoadedPlacement_1 = __webpack_require__(/*! Client/Service/Repository/LoadedPlacement */ "./src/Client/Service/Repository/LoadedPlacement.ts");
class CanvasLayer extends Component_1.Component {
    static TILE_SIZE = 16;
    static COLLISION_IMAGE = (0, generate_image_1.generateImageDataURL)(CanvasLayer.TILE_SIZE, CanvasLayer.TILE_SIZE, { r: 255, g: 0, b: 0, a: 0.3 });
    static DEFAULT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    currentImage;
    layer;
    mouseCoordinates = { x: 0, y: 0 };
    isMoving = false;
    lastMousePosition = { x: 0, y: 0 };
    viewCoordinates = { x: 0, y: 0 };
    isCollisionLayer = false;
    toolSelection = 'pencil';
    externalListeners = {
        'layer-deleted': this.handleDelete,
        'layer-update': this.handleLayerUpdate,
        'moving-in-canvas': this.handleMovement,
        'sheet-selection-made': this.handleCurrentImageChange,
        'tool-selection': this.handleToolSelection,
        'click-placement-history-row': this.handleClickPlacementHistoryRow,
        'request-focus-on-placement': this.handleRequestFocusOnPlacement,
    };
    listeners = {
        '.container:mouseleave': this.handleMouseLeave,
        '.container:mousedown': this.handleMouseDown,
        '.container:mousemove': this.handleMouseMove,
        '.container:mouseup': this.handleMouseUp,
    };
    css() {
        return /*css*/ `
            :host {
                z-index: 500;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            :host(.active) {
                pointer-events: all;
            }

            .current-image {
                position: fixed;
                pointer-events: none;
                z-index: 510;
            }
            .current-image.hide {
                display: none;
            }

       
            .container {
                width: 100%;
                height: 100%;
            }
        `;
    }
    async loadPlacement(placement) {
        const image = (await PlacementImageRepository_1.placementImageRepository.getByUuid(placement.imageUuid));
        const loadedImage = await Dom_1.Dom.image(image.src);
        LoadedPlacement_1.loadedPlacementRepository.add({
            uuid: placement.uuid,
            layerUuid: this.layer.uuid,
            image: loadedImage,
            x: placement.coordinate.x,
            y: placement.coordinate.y,
            width: loadedImage.width,
            height: loadedImage.height,
        });
    }
    async setup() {
        this.layer = this.parameters.layer;
        this.isCollisionLayer = this.layer.type === layers_1.LAYERS.typeCollision;
        this.currentImage = await Dom_1.Dom.image(this.isCollisionLayer
            ? CanvasLayer.COLLISION_IMAGE
            : CanvasLayer.DEFAULT_IMAGE);
        this.layer.placements.forEach(this.loadPlacement.bind(this));
        this.viewCoordinates.x = this.parameters.userData?.lastViewPosition?.x || 0;
        this.viewCoordinates.y = this.parameters.userData?.lastViewPosition?.y || 0;
    }
    build() {
        const container = Dom_1.Dom.div('container');
        const canvas = Dom_1.Dom.makeComponent(Canvas_1.Canvas2D, { fps: 60 });
        this.classList.toggle('active', this.layer.is_active);
        this.currentImage.classList.add('current-image');
        canvas.classList.toggle('hide', !this.layer.is_visible);
        container.append(canvas, this.currentImage);
        return container;
    }
    afterBuild() {
        this.getCanvas().startAnimation(this.frameFn.bind(this));
    }
    handleMouseUp(event) {
        if (event.button === mouse_events_1.MIDDLE_BUTTON) {
            this.isMoving = false;
        }
    }
    afterPatch() {
        this.getCanvas().startAnimation(this.frameFn.bind(this));
    }
    handleDelete(event) {
        const canvas = this.findOne('canvas-2d');
        if (this.layer.uuid === event.detail) {
            canvas.stopAnimation();
            canvas.destroy();
            this.destroy();
        }
    }
    handleMovement(event) {
        const movement = event.detail;
        this.move(movement);
    }
    move(movement) {
        const dx = movement.clientX - movement.lastMousePosition.x;
        const dy = movement.clientY - movement.lastMousePosition.y;
        this.viewCoordinates.x -= dx;
        this.viewCoordinates.y -= dy;
        this.lastMousePosition.x = movement.clientX;
        this.lastMousePosition.y = movement.clientY;
        Events_1.Events.emit('updated-view-coordinates', this.viewCoordinates);
    }
    getCanvas() {
        return this.findOne('canvas-2d');
    }
    handleLayerUpdate(event) {
        const layer = event.detail;
        const canvas = this.getCanvas();
        if (canvas && this.layer.uuid === layer.uuid) {
            Object.assign(this.layer, layer);
            canvas.stopAnimation();
            this.patch();
        }
    }
    frameFn() {
        const canvas = this.getCanvas();
        const visible = LoadedPlacement_1.loadedPlacementRepository.get()
            .filter(loadedPlacement => loadedPlacement.layerUuid === this.layer.uuid)
            .filter(loadedPlacement => {
            return canvas.isRectVisible(this.viewCoordinates, loadedPlacement);
        });
        visible.forEach(loadedPlacement => {
            canvas.drawImage(loadedPlacement.image, loadedPlacement.x - this.viewCoordinates.x, loadedPlacement.y - this.viewCoordinates.y, loadedPlacement.image.width, loadedPlacement.image.height);
        });
    }
    snap(value) {
        return Math.floor(value / CanvasLayer.TILE_SIZE) * CanvasLayer.TILE_SIZE;
    }
    handleMouseMove(event) {
        const rawX = event.clientX;
        const rawY = event.clientY;
        const worldX = this.viewCoordinates.x + rawX;
        const worldY = this.viewCoordinates.y + rawY;
        const snappedWorldX = this.snap(worldX);
        const snappedWorldY = this.snap(worldY);
        const screenX = snappedWorldX - this.viewCoordinates.x;
        const screenY = snappedWorldY - this.viewCoordinates.y;
        this.mouseCoordinates.x = snappedWorldX;
        this.mouseCoordinates.y = snappedWorldY;
        const currentImage = this.getCurrentImage();
        if (currentImage) {
            currentImage.classList.remove('hide');
            currentImage.style.left = screenX + 'px';
            currentImage.style.top = screenY + 'px';
        }
        if (this.isMoving) {
            const movement = {
                clientX: event.clientX,
                clientY: event.clientY,
                viewCoordinates: { ...this.viewCoordinates },
                lastMousePosition: { ...this.lastMousePosition },
            };
            Events_1.Events.emit('moving-in-canvas', movement);
        }
    }
    async generatePlacement() {
        if (this.getCurrentImage().src === CanvasLayer.DEFAULT_IMAGE) {
            return;
        }
        const placement = {
            uuid: crypto.randomUUID(),
            coordinate: {
                x: this.mouseCoordinates.x,
                y: this.mouseCoordinates.y,
            },
            imageUuid: (await PlacementImageRepository_1.placementImageRepository.findOrCreateBySrc(this.getCurrentImage().src)).uuid,
        };
        const lastPlacement = this.layer.placements[this.layer.placements.length - 1];
        if (JSON.stringify(lastPlacement) === JSON.stringify(placement))
            return;
        this.layer.placements.push(placement);
        this.loadPlacement(placement);
    }
    handleMouseDown(event) {
        if (event.button === mouse_events_1.LEFT_BUTTON && this.getCurrentImage()) {
            if (this.toolSelection === 'pencil') {
                this.generatePlacement();
                const mouseMove = (event) => {
                    this.generatePlacement();
                };
                const mouseUp = (event) => {
                    Events_1.Events.emit('layer-placement-made', this.layer);
                    document.removeEventListener('mouseup', mouseUp);
                    document.removeEventListener('mousemove', mouseMove);
                };
                document.addEventListener('mouseup', mouseUp);
                document.addEventListener('mousemove', mouseMove);
            }
            if (this.toolSelection === 'fill') {
                this.performFill(this.mouseCoordinates.x, this.mouseCoordinates.y);
            }
        }
        if (event.button === mouse_events_1.MIDDLE_BUTTON) {
            this.isMoving = true;
            this.lastMousePosition = { x: event.clientX, y: event.clientY };
        }
    }
    handleMouseLeave(event) {
        this.getCurrentImage().classList.add('hide');
    }
    handleCurrentImageChange(event) {
        const newImage = event.detail;
        this.getCurrentImage().src = newImage.src;
        this.currentImage = newImage;
    }
    async performFill(startX, startY) {
        const targetX = this.snap(startX);
        const targetY = this.snap(startY);
        const startTile = { x: targetX, y: targetY };
        const canvas = this.findOne('canvas-2d');
        const canvasWidth = canvas.getBoundingClientRect().width;
        const canvasHeight = canvas.getBoundingClientRect().height;
        const minX = this.snap(this.viewCoordinates.x);
        const minY = this.snap(this.viewCoordinates.y);
        const maxX = this.snap(this.viewCoordinates.x + canvasWidth);
        const maxY = this.snap(this.viewCoordinates.y + canvasHeight);
        const tileSize = CanvasLayer.TILE_SIZE;
        const isInBounds = (x, y) => {
            return x >= minX && x < maxX && y >= minY && y < maxY;
        };
        const existing = this.layer.placements.find(p => p.coordinate.x === startTile.x && p.coordinate.y === startTile.y);
        const targetImageUuid = existing?.imageUuid ?? null;
        const newImageUuid = (await PlacementImageRepository_1.placementImageRepository.findOrCreateBySrc(this.getCurrentImage().src)).uuid;
        // Optimization: avoid unnecessary reprocessing
        if (targetImageUuid === newImageUuid)
            return;
        const visited = new Set();
        const queue = [startTile];
        const filledTiles = [];
        while (queue.length > 0) {
            const { x, y } = queue.pop();
            const key = `${x},${y}`;
            if (visited.has(key) || !isInBounds(x, y))
                continue;
            visited.add(key);
            const match = this.layer.placements.find(p => p.coordinate.x === x && p.coordinate.y === y);
            const matchesTarget = targetImageUuid === null
                ? !match
                : match?.imageUuid === targetImageUuid;
            if (!matchesTarget)
                continue;
            filledTiles.push({ x, y });
            queue.push({ x: x - tileSize, y }, { x: x + tileSize, y }, { x, y: y - tileSize }, { x, y: y + tileSize });
        }
        if (filledTiles.length === 0)
            return;
        // ✅ Skip if all matched tiles already have the new image
        const allAlreadyCorrect = filledTiles.every(({ x, y }) => {
            const match = this.layer.placements.find(p => p.coordinate.x === x && p.coordinate.y === y);
            return match?.imageUuid === newImageUuid;
        });
        if (allAlreadyCorrect)
            return;
        // 🔄 Remove old placements in the filled region
        this.layer.placements = this.layer.placements.filter(p => {
            return !filledTiles.some(t => t.x === p.coordinate.x && t.y === p.coordinate.y);
        });
        const fillCanvas = Dom_1.Dom.canvas();
        const fillCtx = fillCanvas.getContext('2d');
        const offsetX = Math.min(...filledTiles.map(t => t.x));
        const offsetY = Math.min(...filledTiles.map(t => t.y));
        const widthInTiles = Math.max(...filledTiles.map(t => t.x)) - offsetX + tileSize;
        const heightInTiles = Math.max(...filledTiles.map(t => t.y)) - offsetY + tileSize;
        fillCanvas.width = widthInTiles;
        fillCanvas.height = heightInTiles;
        filledTiles.forEach(tile => {
            fillCtx.drawImage(this.getCurrentImage(), tile.x - offsetX, tile.y - offsetY, tileSize, tileSize);
        });
        const dataURL = fillCanvas.toDataURL();
        const mergedImageUuid = (await PlacementImageRepository_1.placementImageRepository.findOrCreateBySrc(dataURL)).uuid;
        const placement = {
            uuid: crypto.randomUUID(),
            coordinate: { x: offsetX, y: offsetY },
            imageUuid: mergedImageUuid,
        };
        this.layer.placements.push(placement);
        await this.loadPlacement(placement);
        Events_1.Events.emit('layer-placement-made', this.layer);
    }
    handleToolSelection(event) {
        this.toolSelection = event.detail;
    }
    getCurrentImage() {
        return this.findOne('.current-image');
    }
    handleClickPlacementHistoryRow() {
    }
    handleRequestFocusOnPlacement(event) {
        const uuid = event.detail;
        const targetPlacement = LoadedPlacement_1.loadedPlacementRepository.getByUuid(uuid);
        const canvas = this.findOne('canvas-2d');
        if (!targetPlacement || !canvas)
            return;
        const canvasRect = canvas.getBoundingClientRect();
        const targetViewX = targetPlacement.x + targetPlacement.width / 2 - canvasRect.width / 2;
        const targetViewY = targetPlacement.y + targetPlacement.height / 2 - canvasRect.height / 2;
        const startX = this.viewCoordinates.x;
        const startY = this.viewCoordinates.y;
        const deltaX = targetViewX - startX;
        const deltaY = targetViewY - startY;
        const duration = 300;
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.viewCoordinates.x = startX + deltaX * easeOut;
            this.viewCoordinates.y = startY + deltaY * easeOut;
            Events_1.Events.emit('updated-view-coordinates', { ...this.viewCoordinates });
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
}
exports.CanvasLayer = CanvasLayer;


/***/ }),

/***/ "./src/Client/Component/Canvas/CanvasTools.ts":
/*!****************************************************!*\
  !*** ./src/Client/Component/Canvas/CanvasTools.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanvasTools = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class CanvasTools extends Component_1.Component {
    currentTool = 'pencil';
    isSingleton = true;
    listeners = {
        'pencil-button:click': this.handlePencilToolClick,
        'fill-button:click': this.handleFillToolClick,
    };
    css() {
        return /*css*/ `
            :host {
                position: fixed;
                display: block;
                padding: 10px;
                border-radius: 4px;
                background-color: whitesmoke;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 800;
            }

            .container {
                display: flex;
                gap: 10px;
            }

            button {
                padding: 10px;
                flex: 1;
                border: 4px solid whitesmoke;
            }

            button.active {
                border-color: black;
            }
        `;
    }
    async setup() {
        this.currentTool = this.parameters.currentTool;
    }
    build() {
        const container = Dom_1.Dom.div('container');
        const pencilButton = Dom_1.Dom.button('', 'pencil-button');
        const pencilIcon = Dom_1.Dom.i('fa-solid', 'fa-pencil');
        pencilButton.append(pencilIcon);
        pencilButton.classList.toggle('active', this.currentTool === 'pencil');
        const fillButton = Dom_1.Dom.button('', 'fill-button');
        const fillIcon = Dom_1.Dom.i('fa-solid', 'fa-fill-drip');
        fillButton.append(fillIcon);
        fillButton.classList.toggle('active', this.currentTool === 'fill');
        container.append(pencilButton, fillButton);
        return container;
    }
    handlePencilToolClick(event) {
        Events_1.Events.emit('tool-selection', this.currentTool = 'pencil');
        this.patch();
    }
    handleFillToolClick(event) {
        Events_1.Events.emit('tool-selection', this.currentTool = 'fill');
        this.patch();
    }
}
exports.CanvasTools = CanvasTools;


/***/ }),

/***/ "./src/Client/Component/File/FileUploader/FileUploader.ts":
/*!****************************************************************!*\
  !*** ./src/Client/Component/File/FileUploader/FileUploader.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileUploader = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class FileUploader extends Component_1.Component {
    isSingleton = true;
    listeners = {
        '.uploader:dragover': this.handleDragOver,
        '.file-input:change': this.handleInputChange,
        '.upload-button:click': this.handleUploadButtonClick,
    };
    css() {
        return /*css*/ `
            :host {
                display: block;
                font-family: sans-serif;
            }

            .uploader {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                transition: background-color 0.2s;
            }

            .uploader.dragover {
                background-color: #f0f0f0;
            }

            .upload-button {
                margin-top: 10px;
                display: inline-block;
                padding: 8px 16px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            input[type="file"] {
                display: none;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div('uploader');
        container.textContent = 'Drag & drop files here';
        container.addEventListener('dragleave', this.handleDragLeave.bind(this));
        container.addEventListener('drop', this.handleDragDrop.bind(this));
        const input = Dom_1.Dom.multiFileInput('file-input');
        const button = Dom_1.Dom.button('Select Files', 'upload-button');
        const wrapper = Dom_1.Dom.div();
        wrapper.append(container, button, input);
        return wrapper;
    }
    getContainer() {
        return this.findOne('.uploader');
    }
    handleUploadButtonClick(event) {
        const input = this.findOne('.file-input');
        input.click();
    }
    handleInputChange(event) {
        const input = event.target;
        if (input.files) {
            this.handleFiles(input.files);
        }
    }
    handleDragOver(event) {
        event.preventDefault();
        this.getContainer().classList.add('dragover');
    }
    handleDragLeave(event) {
        this.getContainer().classList.remove('dragover');
    }
    handleDragDrop(event) {
        event.preventDefault();
        this.getContainer().classList.remove('dragover');
        if (event.dataTransfer?.files) {
            this.handleFiles(event.dataTransfer.files);
        }
    }
    handleFiles(files) {
        Events_1.Events.emitFilesUploadSubmitted(Array.from(files));
    }
}
exports.FileUploader = FileUploader;


/***/ }),

/***/ "./src/Client/Component/Generic/Modal/BasicModal.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Component/Generic/Modal/BasicModal.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BasicModal = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class BasicModal extends Component_1.Component {
    listeners = {
        '.backdrop:click': this.handleClickBackdrop,
    };
    externalListeners = {
        'close-modal': this.handleCloseModal,
    };
    css() {
        return /*css*/ `
            .backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }

            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
                font-family: sans-serif;
            }
        `;
    }
    build() {
        const backdrop = Dom_1.Dom.div('backdrop');
        const content = Dom_1.Dom.div('modal-content');
        const slot = Dom_1.Dom.slot();
        content.append(slot);
        backdrop.append(content);
        return backdrop;
    }
    getBackdrop() {
        return this.findOne('.backdrop');
    }
    handleCloseModal(event) {
        if (this.contains(event.detail)) {
            this.destroy();
        }
    }
    handleClickBackdrop(event) {
        if (event.target === this.getBackdrop()) {
            this.destroy();
        }
    }
}
exports.BasicModal = BasicModal;


/***/ }),

/***/ "./src/Client/Component/Generic/handleDragAndDrop.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/Generic/handleDragAndDrop.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handleDragAndDrop = void 0;
function handleDragAndDrop(element, event) {
    element.isDragging = true;
    const rect = element.getBoundingClientRect();
    element.offsetX = event.clientX - rect.left;
    element.offsetY = event.clientY - rect.top;
    const onMouseMove = (e) => {
        if (element.isDragging) {
            element.style.left = `${e.clientX - element.offsetX}px`;
            element.style.top = `${e.clientY - element.offsetY}px`;
            element.style.transform = 'none';
        }
    };
    const onMouseUp = () => {
        element.isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}
exports.handleDragAndDrop = handleDragAndDrop;


/***/ }),

/***/ "./src/Client/Component/LayerListing/LayerItem.ts":
/*!********************************************************!*\
  !*** ./src/Client/Component/LayerListing/LayerItem.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerItem = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class LayerItem extends Component_1.Component {
    layer;
    externalListeners = {
        'layer-update': this.handleLayerUpdate,
        'layer-deleted': this.handleLayerDeleted,
    };
    handleContainerClick = () => {
        Events_1.Events.emit('layer-active', this.layer);
    };
    handleVisibleButtonClick = (e) => {
        e.stopPropagation();
        Events_1.Events.emit('layer-visible-toggle', this.layer);
    };
    handleClickDelete = (e) => {
        e.stopPropagation();
        Events_1.Events.emit('layer-delete', this.layer.uuid);
    };
    css() {
        return /*css*/ `
            .container {
                display: flex;
                padding: 4px;
            }

            .container > div {
                flex: 1;
            }

            .container.collision-layer {
                background: #eb4d4b;
            }

            .options {
                display: flex;
                justify-content: end;
            }

            .active {
                background: beige;
            }
        `;
    }
    async setup() {
        this.layer = this.parameters.layer;
    }
    build() {
        const container = Dom_1.Dom.div('container');
        const name = Dom_1.Dom.div();
        const options = Dom_1.Dom.div('options');
        const visibleButton = Dom_1.Dom.button('', 'visibility-button');
        const eyeIcon = Dom_1.Dom.i('fa-solid');
        const deleteButton = Dom_1.Dom.button();
        const trashIcon = Dom_1.Dom.i('fa-solid', 'fa-trash');
        const collisionIcon = Dom_1.Dom.i('fa-solid', 'fa-road-barrier');
        if (this.layer.type === 'collision') {
            name.append(collisionIcon);
        }
        name.append(document.createTextNode(this.layer.name));
        eyeIcon.classList.add(this.layer.is_visible ? 'fa-eye' : 'fa-eye-slash');
        container.classList.toggle('active', this.layer.is_active);
        container.classList.toggle('collision-layer', this.layer.type === 'collision');
        container.addEventListener('click', this.handleContainerClick);
        visibleButton.addEventListener('click', this.handleVisibleButtonClick);
        deleteButton.addEventListener('click', this.handleClickDelete);
        deleteButton.append(trashIcon);
        visibleButton.append(eyeIcon);
        options.append(deleteButton, visibleButton);
        container.append(name, options);
        return container;
    }
    handleLayerUpdate(event) {
        const update = event.detail;
        if (update.uuid === this.layer.uuid) {
            this.layer = event.detail;
            this.patch();
        }
    }
    handleLayerDeleted(event) {
        const uuid = event.detail;
        if (this.layer.uuid === uuid) {
            this.destroy();
        }
    }
}
exports.LayerItem = LayerItem;


/***/ }),

/***/ "./src/Client/Component/LayerListing/LayerListing.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/LayerListing/LayerListing.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerListing = void 0;
const LayerItem_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerItem */ "./src/Client/Component/LayerListing/LayerItem.ts");
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const LayerRepository_1 = __webpack_require__(/*! Client/Service/Repository/LayerRepository */ "./src/Client/Service/Repository/LayerRepository.ts");
class LayerListing extends Component_1.Component {
    externalListeners = {
        'new-layer-mapped': this.handleNewLayers,
    };
    listeners = {
        '.add-new:click': this.handleClickAddNew
    };
    layers;
    async setup() {
        this.layers = await LayerRepository_1.layerRepository.getAll();
    }
    build() {
        const container = Dom_1.Dom.div();
        const listing = Dom_1.Dom.div('listing');
        const addNewLayerButton = Dom_1.Dom.button('Add New Layer', 'add-new');
        listing.append(...this.layers.map(this.buildLayer.bind(this)));
        container.append(listing, addNewLayerButton);
        return container;
    }
    handleClickAddNew() {
        Events_1.Events.emit(events_1.EVENTS.openAddNewLayer);
    }
    handleNewLayers() {
        LayerRepository_1.layerRepository.getAll().then(layers => {
            this.layers = layers;
            this.patch();
        });
    }
    buildLayer(layer) {
        return Dom_1.Dom.makeComponent(LayerItem_1.LayerItem, { layer });
    }
}
exports.LayerListing = LayerListing;


/***/ }),

/***/ "./src/Client/Component/NewLayerForm/NewLayerForm.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/NewLayerForm/NewLayerForm.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NewLayerForm = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const layers_1 = __webpack_require__(/*! Client/Constants/layers */ "./src/Client/Constants/layers.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class NewLayerForm extends Component_1.Component {
    name = '';
    type = layers_1.LAYERS.defaultType;
    listeners = {
        '.layer-name-input:keyup': this.handleNameChange,
        '.submit-button:click': this.handleSubmit,
        'select:change': this.handleSelectChange,
    };
    css() {
        return /*css*/ `
            .form-container {
                font-family: sans-serif;
                width: 100%;
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: #333;
            }

            .text-input {
                width: 100%;
                padding: 0.5rem;
                font-size: 1rem;
                border: 1px solid #ccc;
                border-radius: 4px;
                outline: none;
            }

            .text-input:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div('form-container');
        const formGroup = Dom_1.Dom.div('form-group');
        const label = Dom_1.Dom.label('Layer Name', 'form-label');
        const input = Dom_1.Dom.inputText('text-input', 'layer-name-input');
        input.placeholder = 'Enter layer name';
        const submitButton = Dom_1.Dom.button('Save', 'submit-button');
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        const layerTypeOptions = document.createElement('select');
        layers_1.LAYERS.types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.innerText = type.toUpperCase();
            layerTypeOptions.append(option);
        });
        container.append(formGroup, layerTypeOptions, submitButton);
        return container;
    }
    handleSelectChange(event) {
        const layerTypeOptions = event.target;
        this.type = layerTypeOptions.value;
    }
    handleNameChange(event) {
        const input = event.target;
        this.name = input.value;
    }
    handleSubmit() {
        Events_1.Events.emit('close-modal', this);
        Events_1.Events.emit(events_1.EVENTS.newLayerSubmit, {
            name: this.name,
            type: this.type,
        });
    }
}
exports.NewLayerForm = NewLayerForm;


/***/ }),

/***/ "./src/Client/Component/PlacementHistory/PlacementHistory.ts":
/*!*******************************************************************!*\
  !*** ./src/Client/Component/PlacementHistory/PlacementHistory.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlacementHistory = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const LoadedPlacement_1 = __webpack_require__(/*! Client/Service/Repository/LoadedPlacement */ "./src/Client/Service/Repository/LoadedPlacement.ts");
class PlacementHistory extends Component_1.Component {
    externalListeners = {
        'built-canvas-layer': this.handleBuiltCanvasLayer,
        'layer-update': this.handleLayerUpdate,
    };
    listeners = {
        '.placement-row:click': this.handleClickRow,
        '.view-btn:click': this.handleViewClick,
        '.delete-btn:click': this.handleDeleteClick,
    };
    build() {
        const container = Dom_1.Dom.div('placement-history');
        const header = Dom_1.Dom.div('placement-history-header');
        header.append(Dom_1.Dom.div('column', 'coords-col', 'header-cell').appendChild(document.createTextNode('Coordinates')), Dom_1.Dom.div('column', 'dims-col', 'header-cell').appendChild(document.createTextNode('Dimensions')), Dom_1.Dom.div('column', 'image-col', 'header-cell').appendChild(document.createTextNode('Image')), Dom_1.Dom.div('column', 'tools-col', 'header-cell').appendChild(document.createTextNode('Tools')));
        container.appendChild(header);
        LoadedPlacement_1.loadedPlacementRepository.get().forEach(placement => {
            container.append(this.buildPlacementRow(placement));
        });
        return container;
    }
    handleBuiltCanvasLayer() {
        this.patch();
    }
    handleLayerUpdate() {
        this.patch();
    }
    buildPlacementRow(placement) {
        const row = Dom_1.Dom.div('placement-row');
        row.dataset.uuid = placement.uuid;
        const coordsCol = Dom_1.Dom.div('column', 'coords-col');
        coordsCol.textContent = `(${placement.x}, ${placement.y})`;
        const dimsCol = Dom_1.Dom.div('column', 'dims-col');
        dimsCol.textContent = `${placement.width}×${placement.height}`;
        const imageCol = Dom_1.Dom.div('column', 'image-col');
        const thumbnail = placement.image.cloneNode(true);
        thumbnail.classList.add('placement-thumb');
        imageCol.appendChild(thumbnail);
        const toolsCol = Dom_1.Dom.div('column', 'tools-col');
        const viewBtn = Dom_1.Dom.button('', 'view-btn');
        const eyeIcon = Dom_1.Dom.i('fa', 'fa-eye');
        viewBtn.append(eyeIcon);
        const trashIcon = Dom_1.Dom.i('fa', 'fa-trash');
        const deleteBtn = Dom_1.Dom.button('', 'delete-btn');
        deleteBtn.append(trashIcon);
        toolsCol.append(viewBtn, deleteBtn);
        row.append(coordsCol, dimsCol, imageCol, toolsCol);
        return row;
    }
    handleClickRow(event) {
    }
    handleViewClick(event) {
        event.stopPropagation();
        const row = event.target.closest('.placement-row');
        const uuid = row?.dataset.uuid;
        Events_1.Events.emit('request-focus-on-placement', uuid);
    }
    handleDeleteClick(event) {
        event.stopPropagation();
        const row = event.target.closest('.placement-row');
        const uuid = row?.dataset.uuid;
        Events_1.Events.emit('request-placement-deletion', uuid);
    }
    css() {
        return /*css*/ `
            .placement-history {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-family: sans-serif;
                padding: 1rem;
                background: #fafafa;
                border: 1px solid #ccc;
                border-radius: 8px;
            }

            .placement-history-header,
            .placement-row {
                display: flex;
                align-items: center;
                padding: 0.5rem;
                border-bottom: 1px solid #e0e0e0;
            }

            .placement-history-header {
                font-weight: bold;
                background: #f0f0f0;
                border-radius: 4px;
            }

            .column {
                flex: 1;
                padding: 0 0.5rem;
            }

            .uuid-col {
                flex: 2;
            }

            .coords-col,
            .dims-col {
                flex: 1.5;
            }

            .image-col {
                flex: 2;
                display: flex;
                align-items: center;
            }

            .tools-col {
                flex: 1;
                display: flex;
                justify-content: flex-end;
                gap: 0.5rem;
            }

            .placement-thumb {
                max-width: 60px;
                max-height: 40px;
                object-fit: contain;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            .tools-col button {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                color: #555;
            }

            .tools-col button:hover {
                color: #000;
            }
        `;
    }
}
exports.PlacementHistory = PlacementHistory;


/***/ }),

/***/ "./src/Client/Component/SheetListing/SheetListing.ts":
/*!***********************************************************!*\
  !*** ./src/Client/Component/SheetListing/SheetListing.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileListing = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const SheetRepository_1 = __webpack_require__(/*! Client/Service/Repository/SheetRepository */ "./src/Client/Service/Repository/SheetRepository.ts");
class FileListing extends Component_1.Component {
    externalListeners = {
        'upload-files-submission': this.handleFilesUploadSubmitted
    };
    listeners = {
        '.open-sheet-button:click': this.handleOpenSheetButtonClick
    };
    css() {
        return /*css*/ `
            :host {
                display: block;
                max-height: 400px;
                overflow-y: scroll;
            }        

            .file {
                display: flex;
                padding: 10px;
            }
            .file div {
                flex: 1;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div('container');
        SheetRepository_1.sheetRepository.getAll().then(sheets => {
            container.append(...sheets.map(this.buildSheet.bind(this)));
        });
        return container;
    }
    getContainer() {
        return this.findOne('.container');
    }
    handleFilesUploadSubmitted(event) {
        const files = event.detail;
        Promise.all(files.map(this.mapToSheet.bind(this))).then(sheets => {
            this.getContainer().append(...sheets.map(this.buildSheet.bind(this)));
        });
    }
    mapToSheet(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                resolve({
                    name: file.name,
                    imageSrc: base64,
                });
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }
    buildSheet(sheet) {
        const container = Dom_1.Dom.div('file');
        const name = Dom_1.Dom.div();
        const options = Dom_1.Dom.div();
        const openButton = Dom_1.Dom.button('Open', 'open-sheet-button');
        name.innerText = sheet.name;
        openButton.dataset.sheetName = sheet.name;
        options.append(openButton);
        container.append(name, options);
        return container;
    }
    handleOpenSheetButtonClick(event) {
        const button = event.target;
        Events_1.Events.emitOpenSheet(button.dataset.sheetName);
    }
}
exports.FileListing = FileListing;


/***/ }),

/***/ "./src/Client/Component/SideMenu/SideMenu.ts":
/*!***************************************************!*\
  !*** ./src/Client/Component/SideMenu/SideMenu.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SideMenu = void 0;
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class SideMenu extends Component_1.Component {
    isSingleton = true;
    css() {
        return /*css*/ `
            :host {
                background-color: whitesmoke;
                position: fixed;
                left: 0;
                right: 0;
                height: 100vh;
                width: 200px;
                z-index: 800;
            }
        `;
    }
    build() {
        const container = Dom_1.Dom.div();
        const slot = Dom_1.Dom.slot();
        const sheetImportOption = this.buildSheetImportOption();
        container.append(slot, sheetImportOption, this.buildHistoryOption());
        return container;
    }
    buildSheetImportOption() {
        const option = Dom_1.Dom.button();
        const icon = Dom_1.Dom.i('fa-solid', 'fa-images');
        option.addEventListener('click', () => Events_1.Events.emitSheetImportOpen());
        option.append(icon);
        return option;
    }
    buildHistoryOption() {
        const option = Dom_1.Dom.button();
        const icon = Dom_1.Dom.i('fa-solid', 'fa-clock-rotate-left');
        option.addEventListener('click', () => Events_1.Events.emit('click-open-history'));
        option.append(icon);
        return option;
    }
}
exports.SideMenu = SideMenu;


/***/ }),

/***/ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts":
/*!**************************************************************************!*\
  !*** ./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SheetImporter = void 0;
const SheetListing_1 = __webpack_require__(/*! Client/Component/SheetListing/SheetListing */ "./src/Client/Component/SheetListing/SheetListing.ts");
const FileUploader_1 = __webpack_require__(/*! Client/Component/File/FileUploader/FileUploader */ "./src/Client/Component/File/FileUploader/FileUploader.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
class SheetImporter extends Component_1.Component {
    isSingleton = true;
    build() {
        const container = Dom_1.Dom.div();
        const fileListing = Dom_1.Dom.makeComponent(SheetListing_1.FileListing);
        const uploader = Dom_1.Dom.makeComponent(FileUploader_1.FileUploader);
        container.append(fileListing, uploader);
        return container;
    }
}
exports.SheetImporter = SheetImporter;


/***/ }),

/***/ "./src/Client/Component/SpriteSheets/SheetViewer/SheetViewer.ts":
/*!**********************************************************************!*\
  !*** ./src/Client/Component/SpriteSheets/SheetViewer/SheetViewer.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SheetViewer = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const mouse_events_1 = __webpack_require__(/*! Client/Constants/mouse-events */ "./src/Client/Constants/mouse-events.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const extract_image_from_canvas_area_1 = __webpack_require__(/*! Client/Service/extract-image-from-canvas-area */ "./src/Client/Service/extract-image-from-canvas-area.ts");
class SheetViewer extends Component_1.Component {
    image = null;
    canvas;
    css() {
        return /*css*/ `
            :host {
                position: relative;
                display: block;
            }

            .selector-box {
                position: absolute;
                border: 1px solid #0078D7;
                background-color: rgba(0, 120, 215, 0.2);
                pointer-events: none;
                display: none;
                z-index: 10;
            }
        `;
    }
    async setup() {
        if (this.dataset.imageSrc) {
            this.image = await Dom_1.Dom.image(this.dataset.imageSrc);
        }
    }
    build() {
        const element = Dom_1.Dom.div();
        this.canvas = Dom_1.Dom.canvas(element.offsetHeight, element.offsetWidth);
        const context = this.canvas.getContext('2d');
        const selectorBox = this.buildSelectorBox();
        if (this.image) {
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            context.drawImage(this.image, 0, 0);
        }
        element.append(this.canvas, selectorBox);
        return element;
    }
    buildSelectorBox() {
        const box = Dom_1.Dom.div('selector-box');
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        const snap = (value) => Math.round(value / 16) * 16;
        const onMouseMove = (event) => {
            if (!isDragging)
                return;
            const rect = this.getBoundingClientRect();
            const currentX = event.clientX - rect.left + this.scrollLeft;
            const currentY = event.clientY - rect.top + this.scrollTop;
            const width = snap(Math.abs(currentX - startX));
            const height = snap(Math.abs(currentY - startY));
            box.style.display = 'block';
            box.style.left = snap(Math.min(currentX, startX)) + 'px';
            box.style.top = snap(Math.min(currentY, startY)) + 'px';
            box.style.width = width + 'px';
            box.style.height = height + 'px';
        };
        const onMouseUp = async (event) => {
            if (event.button === mouse_events_1.LEFT_BUTTON) {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                const boxX = parseInt(box.style.left || '0', 10);
                const boxY = parseInt(box.style.top || '0', 10);
                const boxWidth = parseInt(box.style.width || '0', 10);
                const boxHeight = parseInt(box.style.height || '0', 10);
                Events_1.Events.emit(events_1.EVENTS.sheetSelectionMade, await (0, extract_image_from_canvas_area_1.extractImageFromCanvasArea)(this.canvas, boxX, boxY, boxWidth, boxHeight));
            }
        };
        this.addEventListener('mousedown', (event) => {
            if (event.button === mouse_events_1.LEFT_BUTTON) {
                const rect = this.getBoundingClientRect();
                isDragging = true;
                startX = event.clientX - rect.left + this.scrollLeft;
                startY = event.clientY - rect.top + this.scrollTop;
                box.style.display = 'none';
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        });
        return box;
    }
}
exports.SheetViewer = SheetViewer;


/***/ }),

/***/ "./src/Client/Component/WindowBox/WindowBox.ts":
/*!*****************************************************!*\
  !*** ./src/Client/Component/WindowBox/WindowBox.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WindowBox = void 0;
const handleDragAndDrop_1 = __webpack_require__(/*! Client/Component/Generic/handleDragAndDrop */ "./src/Client/Component/Generic/handleDragAndDrop.ts");
const Component_1 = __webpack_require__(/*! Client/Service/Component */ "./src/Client/Service/Component.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
class WindowBox extends Component_1.Component {
    isDragging = false;
    offsetX = 0;
    offsetY = 0;
    configuration;
    zIndexMoveDown() {
        this.style.zIndex = '1000';
    }
    zIndexMoveUp() {
        this.style.zIndex = '1001';
    }
    flash() {
        this.classList.add('flash');
        setTimeout(() => {
            this.classList.remove('flash');
        }, 500);
    }
    css() {
        return /*css*/ `
            :host {
                position: fixed;
                display: block;
                top: 50%;
                left: 50%;
                cursor: default;
                z-index: 1001;
                resize: both;
                overflow: hidden;
                max-height: 90vh;
                max-width: 90vw;
            }

            .window-box {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .header {
                background: #ccc;
                padding: 10px;
                cursor: move;
                user-select: none;
                display: flex;
            }

            .header > div {
                flex: 1;
            }

            .options {
                display:flex;
                justify-content: flex-end;
            }

            .close:hover {
                color: red;
                cursor: pointer;
            }

            .content {
                padding: 10px;
                background: white;
                border: 1px solid #ccc;
                width: 100%;
                height: 100%;
                overflow: scroll;
                box-sizing: border-box;
            }

            @keyframes flash {
                0% {
                  box-shadow: 0 0 0px rgba(255, 200, 0, 0.8);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 12px rgba(255, 200, 0, 0.9);
                  transform: scale(1.02);
                }
                100% {
                  box-shadow: 0 0 0px rgba(255, 200, 0, 0);
                  transform: scale(1);
                }
              }
              
              :host(.flash) {
                animation: flash 0.5s ease-in-out;
              }
        `;
    }
    async setup() {
        this.configuration = this.parameters.configuration;
    }
    build() {
        const container = Dom_1.Dom.div('window-box');
        const content = Dom_1.Dom.div('content');
        const slot = Dom_1.Dom.slot();
        container.addEventListener('mousedown', (e) => Events_1.Events.emitMouseDownOnWindowBox(this));
        content.append(slot);
        container.append(this.buildHeader(), content);
        return container;
    }
    afterBuild() {
        if (!this.configuration.rect) {
            this.configuration.rect = {
                left: this.style.left,
                top: this.style.top,
                width: this.style.width,
                height: this.style.height,
            };
        }
        (new ResizeObserver(() => {
            this.configuration.rect.width = this.style.width;
            this.configuration.rect.height = this.style.height;
            Events_1.Events.emit('window-update', this.configuration);
        })).observe(this);
    }
    buildHeader() {
        const element = Dom_1.Dom.div('header');
        const title = Dom_1.Dom.div();
        const options = Dom_1.Dom.div('options');
        const close = Dom_1.Dom.div('close');
        close.innerText = 'x';
        title.innerText = this.dataset.title || '';
        element.addEventListener('mousedown', (e) => (0, handleDragAndDrop_1.handleDragAndDrop)(this, e));
        element.addEventListener('mouseup', (e) => {
            const rect = this.getBoundingClientRect();
            this.configuration.rect.left = this.style.left;
            this.configuration.rect.top = this.style.top;
            Events_1.Events.emit('window-update', this.configuration);
        });
        close.addEventListener('click', (event) => {
            event.stopPropagation();
            Events_1.Events.emit('window-destroyed', this.dataset.title);
            this.destroy();
        }, true);
        options.append(close);
        element.append(title, options);
        return element;
    }
}
exports.WindowBox = WindowBox;


/***/ }),

/***/ "./src/Client/Constants/components.ts":
/*!********************************************!*\
  !*** ./src/Client/Constants/components.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.COMPONENT_UUIDS_CONSTRUCT_LOOKUP = exports.COMPONENT_UUID_LOOKUP = exports.COMPONENTS = void 0;
const LayerListing_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerListing */ "./src/Client/Component/LayerListing/LayerListing.ts");
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const FileUploader_1 = __webpack_require__(/*! Client/Component/File/FileUploader/FileUploader */ "./src/Client/Component/File/FileUploader/FileUploader.ts");
const SheetListing_1 = __webpack_require__(/*! Client/Component/SheetListing/SheetListing */ "./src/Client/Component/SheetListing/SheetListing.ts");
const SheetViewer_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetViewer/SheetViewer */ "./src/Client/Component/SpriteSheets/SheetViewer/SheetViewer.ts");
const SideMenu_1 = __webpack_require__(/*! Client/Component/SideMenu/SideMenu */ "./src/Client/Component/SideMenu/SideMenu.ts");
const SheetImporter_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetImporter/SheetImporter */ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts");
const BasicModal_1 = __webpack_require__(/*! Client/Component/Generic/Modal/BasicModal */ "./src/Client/Component/Generic/Modal/BasicModal.ts");
const NewLayerForm_1 = __webpack_require__(/*! Client/Component/NewLayerForm/NewLayerForm */ "./src/Client/Component/NewLayerForm/NewLayerForm.ts");
const CanvasLayer_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasLayer */ "./src/Client/Component/Canvas/CanvasLayer.ts");
const LayerItem_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerItem */ "./src/Client/Component/LayerListing/LayerItem.ts");
const Canvas_1 = __webpack_require__(/*! Client/Component/Canvas/Canvas */ "./src/Client/Component/Canvas/Canvas.ts");
const uuid_1 = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/cjs-browser/index.js");
const CanvasTools_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasTools */ "./src/Client/Component/Canvas/CanvasTools.ts");
const PlacementHistory_1 = __webpack_require__(/*! Client/Component/PlacementHistory/PlacementHistory */ "./src/Client/Component/PlacementHistory/PlacementHistory.ts");
const UUID_NAMESPACE = '6fa459ea-ee8a-3ca4-894e-db77e160355e';
exports.COMPONENTS = new Map([
    [SideMenu_1.SideMenu, 'side-menu'],
    [LayerListing_1.LayerListing, 'layer-listing'],
    [WindowBox_1.WindowBox, 'window-box'],
    [FileUploader_1.FileUploader, 'file-uploader'],
    [SheetListing_1.FileListing, 'file-listing'],
    [SheetViewer_1.SheetViewer, 'sheet-maker'],
    [SheetImporter_1.SheetImporter, 'sheet-importer'],
    [BasicModal_1.BasicModal, 'modal-basic'],
    [NewLayerForm_1.NewLayerForm, 'new-layer-form'],
    [CanvasLayer_1.CanvasLayer, 'canvas-layer'],
    [LayerItem_1.LayerItem, 'layer-item'],
    [Canvas_1.Canvas2D, 'canvas-2d'],
    [CanvasTools_1.CanvasTools, 'canvas-tools'],
    [PlacementHistory_1.PlacementHistory, 'placement-history'],
]);
exports.COMPONENT_UUID_LOOKUP = new Map(Array.from(exports.COMPONENTS).map(([component, tag]) => [
    (0, uuid_1.v5)(tag, UUID_NAMESPACE),
    component,
]));
exports.COMPONENT_UUIDS_CONSTRUCT_LOOKUP = new Map(Array.from(exports.COMPONENTS).map(([component, tag]) => [
    component,
    (0, uuid_1.v5)(tag, UUID_NAMESPACE),
]));


/***/ }),

/***/ "./src/Client/Constants/events.ts":
/*!****************************************!*\
  !*** ./src/Client/Constants/events.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EVENTS = void 0;
exports.EVENTS = {
    uploadFilesSubmission: 'upload-files-submission',
    openSheet: 'open-sheet',
    openSheetImporter: 'open-sheet-importer',
    openAddNewLayer: 'open-add-new-layer',
    mouseDownWindowBox: 'mouse-down-window-box',
    newLayerSubmit: 'new-layer-submit',
    newLayerMapped: 'new-layer-mapped',
    gotLayer: 'got-layer',
    getSheets: 'get-sheets',
    gotSheets: 'got-sheets',
    closeModal: 'close-modal',
    sheetSelectionMade: 'sheet-selection-made',
    windowResize: 'window-resize',
    layerPlacementMade: 'layer-placement-made',
};


/***/ }),

/***/ "./src/Client/Constants/layers.ts":
/*!****************************************!*\
  !*** ./src/Client/Constants/layers.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LAYERS = void 0;
const TYPE_IMAGE = 'image';
const TYPE_COLLISION = 'collision';
const TYPE_PLAYER_CONTROLLED = 'player_controlled';
exports.LAYERS = {
    defaultType: TYPE_IMAGE,
    typeImage: TYPE_IMAGE,
    typeCollision: TYPE_COLLISION,
    typePlayerControlled: TYPE_PLAYER_CONTROLLED,
    types: [
        TYPE_IMAGE,
        TYPE_COLLISION,
        TYPE_PLAYER_CONTROLLED,
    ]
};


/***/ }),

/***/ "./src/Client/Constants/mouse-events.ts":
/*!**********************************************!*\
  !*** ./src/Client/Constants/mouse-events.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MIDDLE_BUTTON = exports.LEFT_BUTTON = void 0;
exports.LEFT_BUTTON = 0;
exports.MIDDLE_BUTTON = 1;


/***/ }),

/***/ "./src/Client/Service/Component.ts":
/*!*****************************************!*\
  !*** ./src/Client/Service/Component.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Component = void 0;
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const is_json_1 = __webpack_require__(/*! Client/Service/is-json */ "./src/Client/Service/is-json.ts");
const patch_dom_1 = __webpack_require__(/*! Client/Service/patch-dom */ "./src/Client/Service/patch-dom.ts");
class Component extends HTMLElement {
    shadow;
    isSingleton = false;
    parameters = {};
    listeners = {};
    externalListeners = {};
    externalHandlers = [];
    attachedListeners = [];
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }
    async setup() { }
    afterBuild() { }
    css() {
        return '';
    }
    destroy() {
        this.shadow.host.remove();
    }
    connectedCallback() {
        Object.entries(this.dataset).forEach(([key, value]) => {
            this.parameters[key] = (0, is_json_1.isJSON)(value)
                ? JSON.parse(value)
                : value;
        });
        this.setup()
            .then(() => {
            const css = this.css().trim();
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/dist/index.css';
            this.shadow.append(link);
            if (css.length) {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(css);
                this.shadow.adoptedStyleSheets = [sheet];
            }
            this.shadow.appendChild(this.build());
        })
            .then(() => {
            this.setListeners();
            this.setExternalListeners();
            this.afterBuild();
        });
    }
    afterPatch() {
    }
    patch() {
        const firstChild = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK');
        if (firstChild.length > 1) {
            throw new Error('there should only be one root child of the shadow dom');
        }
        (0, patch_dom_1.patchDOM)(firstChild[0], this.build());
        this.setListeners();
        this.setExternalListeners();
        this.afterPatch();
    }
    setListeners() {
        this.attachedListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.attachedListeners = [];
        const listeners = this.listeners;
        if (listeners) {
            Object.entries(listeners).forEach(([key, eventFn]) => {
                const [selector, eventType] = key.split(':');
                this.findAll(selector).forEach(element => {
                    const boundHandler = eventFn.bind(this);
                    element.addEventListener(eventType, boundHandler);
                    this.attachedListeners.push({ element, type: eventType, handler: boundHandler });
                });
            });
        }
    }
    setExternalListeners() {
        this.externalHandlers.forEach(({ key, handler }) => {
            Events_1.Events.unlisten(handler, key);
        });
        this.externalHandlers = [];
        const listeners = this.externalListeners;
        if (listeners) {
            Object.entries(listeners).forEach(([key, listener]) => {
                const boundHandler = listener.bind(this);
                Events_1.Events.listen(boundHandler, key);
                this.externalHandlers.push({ key, handler: boundHandler });
            });
        }
    }
    findOne(query) {
        return this.shadow.querySelector(query);
    }
    findAll(query) {
        return Array.from(this.shadow.querySelectorAll(query));
    }
}
exports.Component = Component;


/***/ }),

/***/ "./src/Client/Service/Dom.ts":
/*!***********************************!*\
  !*** ./src/Client/Service/Dom.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Dom = void 0;
const components_1 = __webpack_require__(/*! Client/Constants/components */ "./src/Client/Constants/components.ts");
class Dom {
    constructor() {
        throw new Error('Can not construct');
    }
    static div(...classList) {
        const element = document.createElement('div');
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static label(text, ...classList) {
        const element = document.createElement('label');
        element.innerText = text;
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static inputText(...classList) {
        const element = document.createElement('input');
        element.type = 'text';
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static canvas(width = 0, height = 0) {
        const element = document.createElement('canvas');
        element.width = width;
        element.height = height;
        return element;
    }
    static button(text = '', ...classList) {
        const element = document.createElement('button');
        element.innerText = text;
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static slot() {
        return document.createElement('slot');
    }
    static multiFileInput(...classList) {
        const element = document.createElement('input');
        element.type = 'file';
        element.multiple = true;
        if (classList.length) {
            element.classList.add(...classList);
        }
        return element;
    }
    static async image(src) {
        return new Promise((resolve, reject) => {
            const image = document.createElement('img');
            image.src = src;
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('abort', () => reject());
        });
    }
    static i(...classList) {
        const element = document.createElement('i');
        element.classList.add(...classList);
        return element;
    }
    static makeComponent(component, dataset = {}) {
        const tag = this.findComponentTag(component);
        const existing = Dom.queryAllDeep(tag);
        if (existing.length) {
            const found = existing[0];
            if (found.isSingleton) {
                return found;
            }
        }
        const element = document.createElement(tag);
        Object.entries(dataset).forEach(([key, value]) => {
            if (value instanceof Object || Array.isArray(value)) {
                dataset[key] = JSON.stringify(value);
            }
        });
        Object.assign(element.dataset, dataset);
        return element;
    }
    static getAllOfComponent(component) {
        const tag = this.findComponentTag(component);
        return Array.from(Dom.queryAllDeep(tag));
    }
    static queryAllDeep(selector, root = document) {
        const result = [];
        const traverse = (node) => {
            if (node.matches(selector)) {
                result.push(node);
            }
            const shadow = node.shadowRoot;
            if (shadow) {
                traverseAll(shadow);
            }
            Array.from(node.children).forEach(child => traverse(child));
        };
        const traverseAll = (container) => {
            Array.from(container.children).forEach(child => traverse(child));
        };
        traverseAll(root);
        return result;
    }
    static findComponentTag(component) {
        const tag = components_1.COMPONENTS.get(component);
        if (!tag) {
            throw new Error(`Component not found in COMPONENTS map: ${component.name}`);
        }
        return tag;
    }
}
exports.Dom = Dom;


/***/ }),

/***/ "./src/Client/Service/Events.ts":
/*!**************************************!*\
  !*** ./src/Client/Service/Events.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Events = void 0;
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
class Events {
    constructor() {
        throw new Error('Can not construct');
    }
    static listenersMap = new Map();
    static emit(key, detail = undefined) {
        document.dispatchEvent(new CustomEvent(key, {
            detail,
            bubbles: false,
            composed: true
        }));
    }
    static listen(callback, ...keys) {
        keys.forEach(key => {
            const wrapped = callback;
            this.addListener(key, wrapped);
            if (!this.listenersMap.has(key)) {
                this.listenersMap.set(key, new Set());
            }
            this.listenersMap.get(key).add(wrapped);
        });
    }
    static addListener(key, callback) {
        document.addEventListener(key, callback);
    }
    static unlisten(callback, ...keys) {
        keys.forEach(key => {
            const wrapped = callback;
            document.removeEventListener(key, wrapped);
            this.listenersMap.get(key)?.delete(wrapped);
        });
    }
    static emitFilesUploadSubmitted(files) {
        Events.emit(events_1.EVENTS.uploadFilesSubmission, files);
    }
    static listenToFilesUploadSubmitted(callback) {
        Events.listen(event => {
            callback(event.detail);
        }, events_1.EVENTS.uploadFilesSubmission);
    }
    static emitOpenSheet(sheetName) {
        this.emit(events_1.EVENTS.openSheet, sheetName);
    }
    static listenToOpenSheet(callback) {
        Events.listen(event => {
            callback(event.detail);
        }, events_1.EVENTS.openSheet);
    }
    static emitMouseDownOnWindowBox(windowBox) {
        Events.emit(events_1.EVENTS.mouseDownWindowBox, windowBox);
    }
    static listenMouseDownOnWindowBox(callback) {
        Events.listen(event => {
            callback(event.detail);
        }, events_1.EVENTS.mouseDownWindowBox);
    }
    static emitSheetImportOpen() {
        Events.emit(events_1.EVENTS.openSheetImporter);
    }
    static listenToSheetImportOpen(callback) {
        Events.listen((event) => {
            callback();
        }, events_1.EVENTS.openSheetImporter);
    }
}
exports.Events = Events;


/***/ }),

/***/ "./src/Client/Service/FileUpload.ts":
/*!******************************************!*\
  !*** ./src/Client/Service/FileUpload.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileUpload = void 0;
class FileUpload {
    static async uploadMultiple(files) {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });
        await fetch('/upload-files', {
            method: 'POST',
            body: formData,
        });
    }
}
exports.FileUpload = FileUpload;


/***/ }),

/***/ "./src/Client/Service/Repository/LayerRepository.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Service/Repository/LayerRepository.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.layerRepository = void 0;
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class LayerRepository extends Repository_1.Repository {
    API_PATH = '/layers';
    layers;
    getLastOrder() {
        if (this.layers.length === 0) {
            return -1;
        }
        return Math.max(...this.layers.map(item => item.order));
    }
    async persist(...layers) {
        layers.forEach((layer) => {
            const lastOrder = this.getLastOrder();
            layer.order = lastOrder + 1;
            this.layers.push(layer);
        });
        await this.post(this.API_PATH, layers);
    }
    async update(layer) {
        const found = this.layers.find(l => l.uuid === layer.uuid);
        if (found) {
            Object.assign(found, layer);
        }
        await this.patch(this.API_PATH, layer);
    }
    async getAll() {
        if (!this.layers) {
            this.layers = await this.get(this.API_PATH);
        }
        return this.layers.sort((a, b) => a.order - b.order);
    }
    async remove(uuid) {
        await this.delete(this.API_PATH + '/' + uuid);
    }
    setActive(uuid) {
        for (const layer of this.layers) {
            layer.is_active = layer.uuid === uuid;
            Events_1.Events.emit('layer-update', layer);
        }
    }
    toggleVisible(uuid) {
        for (const layer of this.layers) {
            if (layer.uuid === uuid) {
                layer.is_visible = !layer.is_visible;
            }
            Events_1.Events.emit('layer-update', layer);
        }
    }
}
exports.layerRepository = new LayerRepository();


/***/ }),

/***/ "./src/Client/Service/Repository/LoadedPlacement.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Service/Repository/LoadedPlacement.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadedPlacementRepository = void 0;
class LoadedPlacementRepository {
    data = [];
    add(...loadedPlacement) {
        this.data.push(...loadedPlacement);
    }
    get() {
        return this.data;
    }
    getByUuid(uuid) {
        return this.data.find(p => p.uuid === uuid);
    }
    removeByUuid(uuid) {
        const index = this.data.findIndex(p => p.uuid === uuid);
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    }
}
exports.loadedPlacementRepository = new LoadedPlacementRepository();


/***/ }),

/***/ "./src/Client/Service/Repository/PlacementImageRepository.ts":
/*!*******************************************************************!*\
  !*** ./src/Client/Service/Repository/PlacementImageRepository.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.placementImageRepository = void 0;
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class PlacementImageRepository extends Repository_1.Repository {
    API_PATH = '/placement-images';
    dataPromise = null;
    dataCache = [];
    async persist(...placementImages) {
        await this.getAll();
        this.dataCache.push(...placementImages);
        await this.post(this.API_PATH, placementImages);
    }
    async getAll() {
        if (!this.dataPromise) {
            this.dataPromise = this.get(this.API_PATH).then(data => {
                this.dataCache = data;
                return data;
            });
        }
        return this.dataPromise;
    }
    async findOrCreateBySrc(src) {
        const all = await this.getAll();
        const found = all.find(img => img.src === src);
        if (found)
            return found;
        const placementImage = {
            uuid: crypto.randomUUID(),
            src,
        };
        await this.persist(placementImage);
        return placementImage;
    }
    async getByUuid(uuid) {
        const all = await this.getAll();
        return all.find(img => img.uuid === uuid);
    }
}
exports.placementImageRepository = new PlacementImageRepository();


/***/ }),

/***/ "./src/Client/Service/Repository/Repository.ts":
/*!*****************************************************!*\
  !*** ./src/Client/Service/Repository/Repository.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Repository = void 0;
class Repository {
    post(path, body) {
        return fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    }
    patch(path, body) {
        return fetch(path, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
    async get(path) {
        const response = await fetch(path);
        return response.json();
    }
    async delete(path) {
        return fetch(path, {
            method: 'DELETE',
        });
    }
}
exports.Repository = Repository;


/***/ }),

/***/ "./src/Client/Service/Repository/SheetRepository.ts":
/*!**********************************************************!*\
  !*** ./src/Client/Service/Repository/SheetRepository.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sheetRepository = void 0;
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class SheetRepository extends Repository_1.Repository {
    API_PATH = '/sheets';
    data;
    async getAll() {
        if (!this.data) {
            this.data = await this.get(this.API_PATH);
        }
        return this.data;
    }
    getByName(name) {
        return this.data.find(sheet => sheet.name === name);
    }
}
exports.sheetRepository = new SheetRepository();


/***/ }),

/***/ "./src/Client/Service/Repository/UserDataRepository.ts":
/*!*************************************************************!*\
  !*** ./src/Client/Service/Repository/UserDataRepository.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.userDataRepository = void 0;
const Repository_1 = __webpack_require__(/*! Client/Service/Repository/Repository */ "./src/Client/Service/Repository/Repository.ts");
class UserDataRepsitory extends Repository_1.Repository {
    API_PATH = '/user-data';
    data;
    async persist(userData) {
        this.data = userData;
        await this.patch(this.API_PATH, userData);
    }
    async getAll() {
        if (!this.data) {
            this.data = await this.get(this.API_PATH);
        }
        return this.data;
    }
}
exports.userDataRepository = new UserDataRepsitory();


/***/ }),

/***/ "./src/Client/Service/WindowBoxFactory.ts":
/*!************************************************!*\
  !*** ./src/Client/Service/WindowBoxFactory.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WindowBoxFactory = void 0;
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const singletonInstances = [];
class WindowBoxFactory {
    static make(component, title, configuration) {
        const windowBox = Dom_1.Dom.makeComponent(WindowBox_1.WindowBox, { configuration });
        if (component.isSingleton && singletonInstances.includes(component)) {
            return windowBox;
        }
        if (!windowBox.isConnected) {
            windowBox.dataset.title = title;
            if (configuration.rect) {
                windowBox.style.width = configuration.rect.width;
                windowBox.style.height = configuration.rect.height;
                windowBox.style.top = configuration.rect.top;
                windowBox.style.left = configuration.rect.left;
            }
            windowBox.append(component);
            if (component.isSingleton) {
                singletonInstances.push(component);
            }
            document.body.append(windowBox);
        }
        return windowBox;
    }
}
exports.WindowBoxFactory = WindowBoxFactory;


/***/ }),

/***/ "./src/Client/Service/extract-image-from-canvas-area.ts":
/*!**************************************************************!*\
  !*** ./src/Client/Service/extract-image-from-canvas-area.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractImageFromCanvasArea = void 0;
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
async function extractImageFromCanvasArea(sourceCanvas, x, y, width, height) {
    const tempCanvas = Dom_1.Dom.canvas(width, height);
    const ctx = tempCanvas.getContext('2d');
    const image = await Dom_1.Dom.image(sourceCanvas.toDataURL());
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return await Dom_1.Dom.image(tempCanvas.toDataURL());
}
exports.extractImageFromCanvasArea = extractImageFromCanvasArea;


/***/ }),

/***/ "./src/Client/Service/generate-image.ts":
/*!**********************************************!*\
  !*** ./src/Client/Service/generate-image.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateImageDataURL = void 0;
function generateImageDataURL(width, height, color) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('Unable to get canvas context');
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    ctx.fillRect(0, 0, width, height);
    const dataURL = canvas.toDataURL('image/png');
    return dataURL;
}
exports.generateImageDataURL = generateImageDataURL;


/***/ }),

/***/ "./src/Client/Service/is-json.ts":
/*!***************************************!*\
  !*** ./src/Client/Service/is-json.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isJSON = void 0;
function isJSON(value) {
    if (typeof value !== 'string') {
        return false;
    }
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null;
    }
    catch {
        return false;
    }
}
exports.isJSON = isJSON;


/***/ }),

/***/ "./src/Client/Service/patch-dom.ts":
/*!*****************************************!*\
  !*** ./src/Client/Service/patch-dom.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchDOM = void 0;
function patchDOM(oldNode, newNode) {
    if (!oldNode || !newNode)
        return;
    // Replace if node types or node names differ
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        if (oldNode.nodeType === Node.ELEMENT_NODE ||
            oldNode.nodeType === Node.TEXT_NODE) {
            oldNode.replaceWith(newNode.cloneNode(true));
        }
        return;
    }
    // Update text content for text nodes
    if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
        const oldText = oldNode;
        const newText = newNode;
        if (oldText.nodeValue !== newText.nodeValue) {
            oldText.nodeValue = newText.nodeValue;
        }
        return;
    }
    // If we're here, assume ELEMENT_NODEs
    if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldEl = oldNode;
        const newEl = newNode;
        // Update attributes
        const oldAttrs = oldEl.attributes;
        const newAttrs = newEl.attributes;
        // Add or update attributes
        for (let i = 0; i < newAttrs.length; i++) {
            const attr = newAttrs[i];
            if (oldEl.getAttribute(attr.name) !== attr.value) {
                oldEl.setAttribute(attr.name, attr.value);
            }
        }
        // Remove old attributes not present in new
        for (let i = 0; i < oldAttrs.length; i++) {
            const attr = oldAttrs[i];
            if (!newEl.hasAttribute(attr.name)) {
                oldEl.removeAttribute(attr.name);
            }
        }
        // Recursively patch children, skipping custom elements
        const oldChildren = Array.from(oldEl.childNodes);
        const newChildren = Array.from(newEl.childNodes);
        const max = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < max; i++) {
            const oldChild = oldChildren[i];
            const newChild = newChildren[i];
            if (!oldChild && newChild) {
                oldEl.appendChild(newChild.cloneNode(true));
            }
            else if (oldChild && !newChild) {
                oldEl.removeChild(oldChild);
            }
            else if (oldChild && newChild) {
                patchDOM(oldChild, newChild);
            }
        }
    }
}
exports.patchDOM = patchDOM;
function isCustomElement(tagName) {
    // Either tagName has a hyphen or the custom element is registered
    return tagName.includes('-') || !!customElements.get(tagName.toLowerCase());
}


/***/ }),

/***/ "./src/Client/styles.css":
/*!*******************************!*\
  !*** ./src/Client/styles.css ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/Model/Factory/LayerFactory.ts":
/*!*******************************************!*\
  !*** ./src/Model/Factory/LayerFactory.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayerFactory = void 0;
class LayerFactory {
    static make() {
        return {
            uuid: crypto.randomUUID(),
            type: 'image',
            name: '',
            created_at: new Date().toISOString(),
            is_visible: true,
            is_active: false,
            placements: [],
            order: 0
        };
    }
}
exports.LayerFactory = LayerFactory;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*****************************!*\
  !*** ./src/Client/index.ts ***!
  \*****************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! Client/styles.css */ "./src/Client/styles.css");
const components_1 = __webpack_require__(/*! Client/Constants/components */ "./src/Client/Constants/components.ts");
const Events_1 = __webpack_require__(/*! Client/Service/Events */ "./src/Client/Service/Events.ts");
const FileUpload_1 = __webpack_require__(/*! Client/Service/FileUpload */ "./src/Client/Service/FileUpload.ts");
const Dom_1 = __webpack_require__(/*! Client/Service/Dom */ "./src/Client/Service/Dom.ts");
const WindowBox_1 = __webpack_require__(/*! Client/Component/WindowBox/WindowBox */ "./src/Client/Component/WindowBox/WindowBox.ts");
const WindowBoxFactory_1 = __webpack_require__(/*! Client/Service/WindowBoxFactory */ "./src/Client/Service/WindowBoxFactory.ts");
const SheetImporter_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetImporter/SheetImporter */ "./src/Client/Component/SpriteSheets/SheetImporter/SheetImporter.ts");
const SheetViewer_1 = __webpack_require__(/*! Client/Component/SpriteSheets/SheetViewer/SheetViewer */ "./src/Client/Component/SpriteSheets/SheetViewer/SheetViewer.ts");
const events_1 = __webpack_require__(/*! Client/Constants/events */ "./src/Client/Constants/events.ts");
const BasicModal_1 = __webpack_require__(/*! Client/Component/Generic/Modal/BasicModal */ "./src/Client/Component/Generic/Modal/BasicModal.ts");
const NewLayerForm_1 = __webpack_require__(/*! Client/Component/NewLayerForm/NewLayerForm */ "./src/Client/Component/NewLayerForm/NewLayerForm.ts");
const LayerFactory_1 = __webpack_require__(/*! Model/Factory/LayerFactory */ "./src/Model/Factory/LayerFactory.ts");
const LayerRepository_1 = __webpack_require__(/*! Client/Service/Repository/LayerRepository */ "./src/Client/Service/Repository/LayerRepository.ts");
const CanvasLayer_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasLayer */ "./src/Client/Component/Canvas/CanvasLayer.ts");
const SheetRepository_1 = __webpack_require__(/*! Client/Service/Repository/SheetRepository */ "./src/Client/Service/Repository/SheetRepository.ts");
const PlacementImageRepository_1 = __webpack_require__(/*! Client/Service/Repository/PlacementImageRepository */ "./src/Client/Service/Repository/PlacementImageRepository.ts");
const CanvasTools_1 = __webpack_require__(/*! Client/Component/Canvas/CanvasTools */ "./src/Client/Component/Canvas/CanvasTools.ts");
const PlacementHistory_1 = __webpack_require__(/*! Client/Component/PlacementHistory/PlacementHistory */ "./src/Client/Component/PlacementHistory/PlacementHistory.ts");
const LoadedPlacement_1 = __webpack_require__(/*! Client/Service/Repository/LoadedPlacement */ "./src/Client/Service/Repository/LoadedPlacement.ts");
const UserDataRepository_1 = __webpack_require__(/*! Client/Service/Repository/UserDataRepository */ "./src/Client/Service/Repository/UserDataRepository.ts");
const SideMenu_1 = __webpack_require__(/*! Client/Component/SideMenu/SideMenu */ "./src/Client/Component/SideMenu/SideMenu.ts");
const LayerListing_1 = __webpack_require__(/*! Client/Component/LayerListing/LayerListing */ "./src/Client/Component/LayerListing/LayerListing.ts");
components_1.COMPONENTS.forEach((tagName, constructor) => {
    customElements.define(tagName, constructor);
});
let openSheets = [];
let windowBoxes = {};
document.addEventListener('DOMContentLoaded', async () => {
    const userData = await UserDataRepository_1.userDataRepository.getAll();
    const layers = await LayerRepository_1.layerRepository.getAll();
    const sheets = await SheetRepository_1.sheetRepository.getAll();
    const placementImages = await PlacementImageRepository_1.placementImageRepository.getAll();
    await new Promise(resolve => {
        if (layers.length === 0) {
            resolve(null);
        }
        layers.forEach((layer, layerIndex) => {
            layer.placements.forEach(async (placement, placementIndex) => {
                const placementImage = await PlacementImageRepository_1.placementImageRepository.getByUuid(placement.imageUuid);
                if (placementImage) {
                    const image = await Dom_1.Dom.image(placementImage.src);
                    LoadedPlacement_1.loadedPlacementRepository.add({
                        uuid: placement.uuid,
                        layerUuid: layer.uuid,
                        image,
                        x: placement.coordinate.x,
                        y: placement.coordinate.y,
                        width: image.width,
                        height: image.height,
                    });
                }
                if (layerIndex === layers.length - 1 && placementIndex === layer.placements.length - 1) {
                    resolve(null);
                }
            });
            if (layerIndex === layers.length - 1 && layer.placements.length === 0) {
                resolve(null);
            }
        });
    });
    Events_1.Events.listenToFilesUploadSubmitted(files => {
        FileUpload_1.FileUpload.uploadMultiple(files);
    });
    Events_1.Events.listenToOpenSheet(async (sheetName) => {
        const sheet = SheetRepository_1.sheetRepository.getByName(sheetName);
        if (openSheets.includes(sheet.name)) {
            windowBoxes[sheet.name].flash();
            return;
        }
        const sheetViewerDataset = { imageSrc: sheet.imageSrc };
        const component = Dom_1.Dom.makeComponent(SheetViewer_1.SheetViewer, sheetViewerDataset);
        openSheets.push(sheet.name);
        windowBoxes[sheet.name] = WindowBoxFactory_1.WindowBoxFactory.make(component, sheet.name, {
            uuid: components_1.COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(SheetViewer_1.SheetViewer),
            componentConfigration: { dataset: sheetViewerDataset },
            title: sheet.name,
        });
    });
    Events_1.Events.listen(event => {
        const name = event.detail;
        if (openSheets.includes(name)) {
            openSheets = openSheets.filter(item => item !== name);
        }
        if (windowBoxes[name]) {
            delete windowBoxes[name];
        }
    }, 'window-destroyed');
    Events_1.Events.listenMouseDownOnWindowBox(windowBox => {
        Dom_1.Dom.getAllOfComponent(WindowBox_1.WindowBox).forEach(box => {
            box.zIndexMoveDown();
        });
        windowBox.zIndexMoveUp();
    });
    Events_1.Events.listenToSheetImportOpen(() => {
        const component = Dom_1.Dom.makeComponent(SheetImporter_1.SheetImporter);
        WindowBoxFactory_1.WindowBoxFactory.make(component, 'Import Sheets', {
            uuid: components_1.COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(SheetImporter_1.SheetImporter),
            componentConfigration: { dataset: {} },
            title: 'Import Sheets',
        });
    });
    Events_1.Events.listen(() => {
        const modal = Dom_1.Dom.makeComponent(BasicModal_1.BasicModal);
        const newLayerForm = Dom_1.Dom.makeComponent(NewLayerForm_1.NewLayerForm);
        modal.append(newLayerForm);
        document.body.append(modal);
    }, events_1.EVENTS.openAddNewLayer);
    Events_1.Events.listen((event) => {
        const input = event.detail;
        const layer = Object.assign(LayerFactory_1.LayerFactory.make(), input);
        Events_1.Events.emit(events_1.EVENTS.newLayerMapped, [layer]);
        LayerRepository_1.layerRepository.persist(layer);
    }, events_1.EVENTS.newLayerSubmit);
    Events_1.Events.listen(event => {
        document.body.append(...event.detail
            .sort((a, b) => b.order - a.order)
            .map(layer => Dom_1.Dom.makeComponent(CanvasLayer_1.CanvasLayer, { layer })));
    }, events_1.EVENTS.gotLayer, events_1.EVENTS.newLayerMapped);
    Events_1.Events.listen(event => {
        LayerRepository_1.layerRepository.update(event.detail);
    }, events_1.EVENTS.layerPlacementMade);
    Events_1.Events.listen(event => {
        LayerRepository_1.layerRepository.setActive(event.detail.uuid);
    }, 'layer-active');
    Events_1.Events.listen(event => {
        LayerRepository_1.layerRepository.toggleVisible(event.detail.uuid);
    }, 'layer-visible-toggle');
    Events_1.Events.listen(event => {
        LayerRepository_1.layerRepository.update(event.detail);
    }, 'layer-update');
    Events_1.Events.listen(event => {
        const uuid = event.detail;
        LayerRepository_1.layerRepository.remove(uuid)
            .then(() => {
            Events_1.Events.emit('layer-deleted', uuid);
        });
    }, 'layer-delete');
    Events_1.Events.listen(async (event) => {
        const corrdinates = event.detail;
        const userData = await UserDataRepository_1.userDataRepository.getAll();
        userData.lastViewPosition.x = corrdinates.x;
        userData.lastViewPosition.y = corrdinates.y;
        UserDataRepository_1.userDataRepository.persist(userData);
    }, 'updated-view-coordinates');
    Events_1.Events.listen(async (event) => {
        const windowConfiguration = event.detail;
        const userData = await UserDataRepository_1.userDataRepository.getAll();
        userData.windows[windowConfiguration.uuid] = windowConfiguration;
        UserDataRepository_1.userDataRepository.persist(userData);
    }, 'window-update');
    Events_1.Events.listen(event => {
        WindowBoxFactory_1.WindowBoxFactory.make(Dom_1.Dom.makeComponent(PlacementHistory_1.PlacementHistory), 'Placement History', {
            uuid: components_1.COMPONENT_UUIDS_CONSTRUCT_LOOKUP.get(PlacementHistory_1.PlacementHistory),
            componentConfigration: { dataset: {} },
            title: 'Placement History',
        });
    }, 'click-open-history');
    Events_1.Events.listen(async (event) => {
        const placementUuid = event.detail;
        const layers = await LayerRepository_1.layerRepository.getAll();
        LoadedPlacement_1.loadedPlacementRepository.removeByUuid(placementUuid);
        for (const layer of layers) {
            const index = layer.placements.findIndex(p => p.uuid === placementUuid);
            if (index !== -1) {
                layer.placements.splice(index, 1);
                LayerRepository_1.layerRepository.update(layer);
                Events_1.Events.emit('layer-update', layer);
                break;
            }
        }
    }, 'request-placement-deletion');
    window.addEventListener('resize', () => Events_1.Events.emit(events_1.EVENTS.windowResize));
    const sideMenu = Dom_1.Dom.makeComponent(SideMenu_1.SideMenu);
    const layerListing = Dom_1.Dom.makeComponent(LayerListing_1.LayerListing, { layers });
    sideMenu.append(layerListing);
    const layerElements = layers.map(layer => Dom_1.Dom.makeComponent(CanvasLayer_1.CanvasLayer, { layer, userData }));
    // Object.entries(userData.windows).forEach(([componentUuid, windowConfiguration]) => {
    //     WindowBoxFactory.make(
    //         Dom.makeComponent(
    //             COMPONENT_UUID_LOOKUP.get(componentUuid)!,
    //             windowConfiguration.componentConfigration.dataset
    //         ),
    //         windowConfiguration.title,
    //         windowConfiguration,
    //     )
    // })
    const tools = Dom_1.Dom.makeComponent(CanvasTools_1.CanvasTools, { currentTool: userData.currentTool });
    document.body.append(sideMenu, tools, ...layerElements);
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map