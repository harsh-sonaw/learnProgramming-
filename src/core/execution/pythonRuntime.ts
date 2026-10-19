/**
 * JavaScript source that implements the parts of Python's runtime that the
 * compiled code (see pythonCompiler.ts) relies on. It is prepended to the
 * program inside the sandbox worker, so patching globals here is safe.
 */
export const PY_PRELUDE = String.raw`
var __stdout = '';
function __tup(a) { Object.defineProperty(a, '__t', { value: true, enumerable: false }); return a; }
function __norm(c, k) {
  if (!Array.isArray(k)) return k;
  var s = JSON.stringify(k);
  var t = c.__tk || (c.__tk = new Map());
  var ex = t.get(s);
  if (ex) return ex;
  t.set(s, k);
  return k;
}
function __sadd(c, k) { if (c instanceof Set) c.add(__norm(c, k)); else c.add(k); }
var KW = class KW { constructor(o) { this.o = o; } };

function __mkexc(name, parent) {
  var F = function (msg) {
    if (!(this instanceof F)) return new F(...arguments);
    var e = new Error(msg === undefined ? '' : String(msg));
    Object.setPrototypeOf(e, F.prototype);
    e.args = Array.prototype.slice.call(arguments);
    e.pyName = name;
    return e;
  };
  F.prototype = Object.create(parent.prototype, { constructor: { value: F, writable: true, configurable: true } });
  Object.defineProperty(F, 'name', { value: name });
  return F;
}
var BaseException = __mkexc('BaseException', Error);
var Exception = __mkexc('Exception', BaseException);
var ValueError = __mkexc('ValueError', Exception);
var TypeError_ = __mkexc('TypeError', Exception);
var KeyError = __mkexc('KeyError', Exception);
var IndexError = __mkexc('IndexError', Exception);
var ZeroDivisionError = __mkexc('ZeroDivisionError', Exception);
var RuntimeError = __mkexc('RuntimeError', Exception);
var StopIteration = __mkexc('StopIteration', Exception);
var AttributeError = __mkexc('AttributeError', Exception);
var NameError = __mkexc('NameError', Exception);
var AssertionError = __mkexc('AssertionError', Exception);
var NotImplementedError = __mkexc('NotImplementedError', RuntimeError);

function __cls(C, name) {
  if (name) Object.defineProperty(C, 'name', { value: name });
  return new Proxy(C, {
    apply: function (t, thisArg, args) { return Reflect.construct(t, args); }
  });
}

function __truthy(x) {
  if (x === null || x === undefined || x === false || x === 0 || x === '') return false;
  if (Array.isArray(x)) return x.length > 0;
  if (x instanceof Map || x instanceof Set) return x.size > 0;
  if (typeof x === 'object') {
    if (typeof x.__bool__ === 'function') return !!x.__bool__();
    if (typeof x.__len__ === 'function') return x.__len__() > 0;
  }
  return true;
}
function __or(a, b) { var x = a(); return __truthy(x) ? x : b(); }
function __and(a, b) { var x = a(); return __truthy(x) ? b() : x; }

function __eq(a, b) {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a === 'object' && typeof a.__eq__ === 'function') return !!a.__eq__(b);
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (!__eq(a[i], b[i])) return false;
    return true;
  }
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (var [k, v] of a) { if (!b.has(k) || !__eq(v, b.get(k))) return false; }
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (var v2 of a) if (!b.has(v2)) return false;
    return true;
  }
  return false;
}

function __add(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a + b;
  if (typeof a === 'string' && typeof b === 'string') return a + b;
  if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
  if (a && typeof a.__add__ === 'function') return a.__add__(b);
  throw new TypeError_("unsupported operand type(s) for +: '" + __typename(a) + "' and '" + __typename(b) + "'");
}
function __mul(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a * b;
  if (typeof a === 'string' && typeof b === 'number') return b > 0 ? a.repeat(b) : '';
  if (typeof b === 'string' && typeof a === 'number') return a > 0 ? b.repeat(a) : '';
  if (Array.isArray(a) && typeof b === 'number') { var r = []; for (var i = 0; i < b; i++) r = r.concat(a); return r; }
  if (Array.isArray(b) && typeof a === 'number') return __mul(b, a);
  if (a && typeof a.__mul__ === 'function') return a.__mul__(b);
  throw new TypeError_("unsupported operand type(s) for *: '" + __typename(a) + "' and '" + __typename(b) + "'");
}
function __div(a, b) { if (b === 0) throw ZeroDivisionError('division by zero'); return a / b; }
function __floordiv(a, b) { if (b === 0) throw ZeroDivisionError('integer division or modulo by zero'); return Math.floor(a / b); }
function __mod(a, b) {
  if (typeof a === 'string') return __percentFormat(a, b);
  if (b === 0) throw ZeroDivisionError('integer division or modulo by zero');
  var r = a % b; if (r !== 0 && (r < 0) !== (b < 0)) r += b; return r;
}
function __pow(a, b) { return Math.pow(a, b); }
function __percentFormat(fmt, args) {
  var list = Array.isArray(args) ? args.slice() : [args];
  return fmt.replace(/%([sdrif%])/g, function (m, c) {
    if (c === '%') return '%';
    var v = list.shift();
    if (c === 's') return __str(v);
    if (c === 'r') return __repr(v);
    if (c === 'f') return Number(v).toFixed(6);
    return String(Math.trunc(Number(v)));
  });
}

function __typename(x) {
  if (x === null || x === undefined) return 'NoneType';
  if (typeof x === 'number') return Number.isInteger(x) ? 'int' : 'float';
  if (typeof x === 'string') return 'str';
  if (typeof x === 'boolean') return 'bool';
  if (Array.isArray(x)) return 'list';
  if (x instanceof Map) return 'dict';
  if (x instanceof Set) return 'set';
  if (typeof x === 'function') return 'function';
  return (x.constructor && x.constructor.name) || 'object';
}

function __len(x) {
  if (typeof x === 'string' || Array.isArray(x)) return x.length;
  if (x instanceof Map || x instanceof Set) return x.size;
  if (x && typeof x.__len__ === 'function') return x.__len__();
  throw new TypeError_("object of type '" + __typename(x) + "' has no len()");
}
var len = __len;

function __iter(x) {
  if (Array.isArray(x)) return x;
  if (typeof x === 'string') return Array.from(x);
  if (x instanceof Map) return Array.from(x.keys());
  if (x instanceof Set) return Array.from(x);
  if (x && typeof x.__iter__ === 'function') return __iter(x.__iter__());
  if (x && typeof x[Symbol.iterator] === 'function') return Array.from(x);
  throw new TypeError_("'" + __typename(x) + "' object is not iterable");
}

function __idx(o, i) {
  if (Array.isArray(o) || typeof o === 'string') {
    if (typeof i !== 'number') throw new TypeError_((Array.isArray(o) ? 'list' : 'string') + ' indices must be integers');
    var n = i < 0 ? o.length + i : i;
    if (n < 0 || n >= o.length) throw IndexError((Array.isArray(o) ? 'list' : 'string') + ' index out of range');
    return o[n];
  }
  if (o instanceof Map) {
    i = __norm(o, i);
    if (o.has(i)) return o.get(i);
    if (o.__default) { var d = o.__default(); o.set(i, d); return d; }
    if (o.__counter) return 0;
    throw KeyError(__repr(i));
  }
  if (o && typeof o.__getitem__ === 'function') return o.__getitem__(i);
  throw new TypeError_("'" + __typename(o) + "' object is not subscriptable");
}
function __setitem(o, i, v) {
  if (Array.isArray(o)) {
    var n = i < 0 ? o.length + i : i;
    if (n < 0 || n >= o.length) throw IndexError('list assignment index out of range');
    o[n] = v; return;
  }
  if (o instanceof Map) { o.set(__norm(o, i), v); return; }
  if (o && typeof o.__setitem__ === 'function') { o.__setitem__(i, v); return; }
  throw new TypeError_("'" + __typename(o) + "' object does not support item assignment");
}
function __delitem(o, i) {
  if (Array.isArray(o)) { var n = i < 0 ? o.length + i : i; o.splice(n, 1); return; }
  if (o instanceof Map) { if (!o.delete(__norm(o, i))) throw KeyError(__repr(i)); return; }
  throw new TypeError_("'" + __typename(o) + "' object doesn't support item deletion");
}
function __slice(o, a, b, c) {
  var isStr = typeof o === 'string';
  var arr = isStr ? Array.from(o) : o;
  var n = arr.length, step = c === undefined || c === null ? 1 : c;
  if (step === 0) throw ValueError('slice step cannot be zero');
  var lo, hi;
  if (step > 0) {
    lo = a === undefined || a === null ? 0 : (a < 0 ? Math.max(0, n + a) : Math.min(a, n));
    hi = b === undefined || b === null ? n : (b < 0 ? Math.max(0, n + b) : Math.min(b, n));
  } else {
    lo = a === undefined || a === null ? n - 1 : (a < 0 ? Math.max(-1, n + a) : Math.min(a, n - 1));
    hi = b === undefined || b === null ? -1 : (b < 0 ? Math.max(-1, n + b) : Math.min(b, n - 1));
  }
  var out = [];
  if (step > 0) { for (var i = lo; i < hi; i += step) out.push(arr[i]); }
  else { for (var j = lo; j > hi; j += step) out.push(arr[j]); }
  return isStr ? out.join('') : out;
}
function __in(x, c) {
  if (typeof c === 'string') return c.indexOf(x) !== -1;
  if (Array.isArray(c)) { for (var i = 0; i < c.length; i++) if (__eq(c[i], x)) return true; return false; }
  if (c instanceof Map || c instanceof Set) return c.has(__norm(c, x));
  if (c && typeof c.__contains__ === 'function') return !!c.__contains__(x);
  return __iter(c).some(function (y) { return __eq(y, x); });
}

/* ---------- builtins ---------- */
function __kwOf(args) {
  if (args.length && args[args.length - 1] instanceof KW) return args.pop().o;
  return {};
}
function range() {
  var a = Array.prototype.slice.call(arguments), s = 0, e, st = 1;
  if (a.length === 1) e = a[0]; else { s = a[0]; e = a[1]; if (a.length > 2) st = a[2]; }
  if (st === 0) throw ValueError('range() arg 3 must not be zero');
  var out = [];
  if (st > 0) for (var i = s; i < e; i += st) out.push(i); else for (var j = s; j > e; j += st) out.push(j);
  return out;
}
function enumerate(it) {
  var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a);
  var start = a.length > 1 ? a[1] : (kw.start !== undefined ? kw.start : 0);
  return __iter(it).map(function (x, i) { return __tup([i + start, x]); });
}
function zip() {
  var its = Array.prototype.slice.call(arguments).map(__iter);
  if (!its.length) return [];
  var n = Math.min.apply(null, its.map(function (x) { return x.length; }));
  var out = []; for (var i = 0; i < n; i++) out.push(__tup(its.map(function (x) { return x[i]; })));
  return out;
}
function __cmpVals(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    for (var i = 0; i < Math.min(a.length, b.length); i++) { var c = __cmpVals(a[i], b[i]); if (c) return c; }
    return a.length - b.length;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}
function sorted(it) {
  var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a);
  var arr = __iter(it).slice();
  var key = kw.key;
  if (key) { var dec = arr.map(function (x) { return [key(x), x]; }); dec.sort(function (p, q) { return __cmpVals(p[0], q[0]); }); arr = dec.map(function (p) { return p[1]; }); }
  else arr.sort(__cmpVals);
  if (kw.reverse && __truthy(kw.reverse)) arr.reverse();
  return arr;
}
function reversed(it) { return __iter(it).slice().reverse(); }
function sum(it, start) { var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a); var t = a.length > 1 ? a[1] : (kw.start !== undefined ? kw.start : 0); for (var x of __iter(a[0])) t = __add(t, x); return t; }
function __minmax(name, sign, args) {
  var a = Array.prototype.slice.call(args); var kw = __kwOf(a);
  var items = a.length === 1 ? __iter(a[0]) : a;
  if (!items.length) { if (kw.default !== undefined) return kw.default; throw ValueError(name + '() arg is an empty sequence'); }
  var key = kw.key || function (x) { return x; };
  var best = items[0], bk = key(best);
  for (var i = 1; i < items.length; i++) { var k = key(items[i]); if (sign * __cmpVals(k, bk) > 0) { best = items[i]; bk = k; } }
  return best;
}
function min() { return __minmax('min', -1, arguments); }
function max() { return __minmax('max', 1, arguments); }
function abs(x) { return Math.abs(x); }
function any(it) { for (var x of __iter(it)) if (__truthy(x)) return true; return false; }
function all(it) { for (var x of __iter(it)) if (!__truthy(x)) return false; return true; }
function map(f) { var its = Array.prototype.slice.call(arguments, 1).map(__iter); var n = Math.min.apply(null, its.map(function (x) { return x.length; })); var out = []; for (var i = 0; i < n; i++) out.push(f.apply(null, its.map(function (x) { return x[i]; }))); return out; }
function filter(f, it) { return __iter(it).filter(function (x) { return f === null ? __truthy(x) : __truthy(f(x)); }); }
function int(x, base) {
  if (typeof x === 'string') { var s = x.trim().replace(/_/g, ''); var b = base || 10; if (!/^[+-]?[0-9a-zA-Z]+$/.test(s) || isNaN(parseInt(s, b)) || (b === 10 && !/^[+-]?\d+$/.test(s))) throw ValueError("invalid literal for int() with base " + b + ": " + __repr(x)); return parseInt(s, b); }
  if (typeof x === 'boolean') return x ? 1 : 0;
  if (typeof x === 'number') return Math.trunc(x);
  throw TypeError_("int() argument must be a string or a number, not '" + __typename(x) + "'");
}
function float(x) { if (typeof x === 'string') { var n = Number(x.trim()); if (x.trim() === '' || isNaN(n)) { if (/^[+-]?inf(inity)?$/i.test(x.trim())) return x.trim()[0] === '-' ? -Infinity : Infinity; throw ValueError('could not convert string to float: ' + __repr(x)); } return n; } return Number(x); }
function repr(x) { return __repr(x); }
function str(x) { return x === undefined ? '' : __str(x); }
function bool(x) { return __truthy(x); }
function list(x) { return x === undefined ? [] : __iter(x).slice(); }
function tuple(x) { return __tup(x === undefined ? [] : __iter(x).slice()); }
function set(x) { var s = new Set(); if (x !== undefined) for (var v of __iter(x)) s.add(__norm(s, v)); return s; }
function dict(x) {
  var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a); var m = new Map();
  if (a.length) { var src = a[0]; if (src instanceof Map) src.forEach(function (v, k) { m.set(k, v); }); else for (var p of __iter(src)) m.set(__norm(m, p[0]), p[1]); }
  for (var k of Object.keys(kw)) m.set(k, kw[k]);
  return m;
}
function round(x, n) {
  var m = Math.pow(10, n || 0); var v = x * m; var f = Math.floor(v); var diff = v - f; var r;
  if (Math.abs(diff - 0.5) < 1e-9) r = f % 2 === 0 ? f : f + 1; else r = Math.round(v);
  return n ? r / m : r;
}
function pow(a, b) { return Math.pow(a, b); }
function divmod(a, b) { return __tup([__floordiv(a, b), __mod(a, b)]); }
function ord(c) { return c.codePointAt(0); }
function chr(n) { return String.fromCodePoint(n); }
function isinstance(x, t) {
  if (Array.isArray(t)) return t.some(function (y) { return isinstance(x, y); });
  if (t === int) return typeof x === 'number' && Number.isInteger(x);
  if (t === float) return typeof x === 'number';
  if (t === str) return typeof x === 'string';
  if (t === bool) return typeof x === 'boolean';
  if (t === list || t === tuple) return Array.isArray(x);
  if (t === dict) return x instanceof Map;
  if (t === set) return x instanceof Set;
  return typeof t === 'function' && x instanceof t;
}
function type(x) { return { __name__: __typename(x), toString: function () { return "<class '" + __typename(x) + "'>"; } }; }
function input() { return ''; }
function hasattr(o, n) { return o !== null && o !== undefined && n in Object(o); }
function getattr(o, n, d) { return o !== null && o !== undefined && n in Object(o) ? o[n] : d; }
function callable(x) { return typeof x === 'function'; }
function id(x) { return 0; }
function hash(x) { return typeof x === 'string' ? Array.from(x).reduce(function (h, c) { return (h * 31 + c.charCodeAt(0)) | 0; }, 7) : x; }
function bin(n) { return (n < 0 ? '-0b' : '0b') + Math.abs(n).toString(2); }
function hex(n) { return (n < 0 ? '-0x' : '0x') + Math.abs(n).toString(16); }
function oct(n) { return (n < 0 ? '-0o' : '0o') + Math.abs(n).toString(8); }
function __assert(c, m) { if (!__truthy(c)) throw AssertionError(m === undefined ? '' : m); }

/* ---------- repr / str / print ---------- */
function __reprStr(s) {
  var q = s.indexOf("'") !== -1 && s.indexOf('"') === -1 ? '"' : "'";
  var out = s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r');
  if (q === "'") out = out.replace(/'/g, "\\'");
  return q + out + q;
}
function __repr(x) {
  if (x === null || x === undefined) return 'None';
  if (x === true) return 'True';
  if (x === false) return 'False';
  if (typeof x === 'number') return isNaN(x) ? 'nan' : x === Infinity ? 'inf' : x === -Infinity ? '-inf' : String(x);
  if (typeof x === 'string') return __reprStr(x);
  if (Array.isArray(x)) return x.__t ? '(' + x.map(__repr).join(', ') + (x.length === 1 ? ',' : '') + ')' : '[' + x.map(__repr).join(', ') + ']';
  if (x instanceof Map) return '{' + Array.from(x.entries()).map(function (e) { return __repr(e[0]) + ': ' + __repr(e[1]); }).join(', ') + '}';
  if (x instanceof Set) return x.size ? '{' + Array.from(x).map(__repr).join(', ') + '}' : 'set()';
  if (typeof x === 'function') return '<function ' + (x.name || 'lambda') + '>';
  if (typeof x.__repr__ === 'function') return x.__repr__();
  if (x instanceof Error) return (x.pyName || x.name) + '(' + __reprStr(x.message) + ')';
  if (typeof x.__str__ === 'function' && !x.__repr__) return '<' + __typename(x) + ' object>';
  return '<' + __typename(x) + ' object>';
}
function __str(x) {
  if (typeof x === 'string') return x;
  if (x !== null && typeof x === 'object' && !Array.isArray(x) && !(x instanceof Map) && !(x instanceof Set)) {
    if (typeof x.__str__ === 'function') return x.__str__();
    if (x instanceof Error) return x.message;
  }
  return __repr(x);
}
function __write(s) {
  __stdout += s;
  var idx;
  while ((idx = __stdout.indexOf('\n')) !== -1) { console.log(__stdout.slice(0, idx)); __stdout = __stdout.slice(idx + 1); }
}
function __flush() { if (__stdout.length) { console.log(__stdout); __stdout = ''; } }
function print() {
  var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a);
  var sep = kw.sep === undefined || kw.sep === null ? ' ' : kw.sep;
  var end = kw.end === undefined || kw.end === null ? '\n' : kw.end;
  __write(a.map(__str).join(sep) + end);
}

/* ---------- formatting (f-strings / str.format) ---------- */
function __fmt(v, spec) {
  if (!spec) return __str(v);
  var m = /^(?:(.)?([<>^=]))?([+\- ])?(0)?(\d+)?(,)?(?:\.(\d+))?([sdfFeExXbo%])?$/.exec(spec);
  if (!m) return __str(v);
  var fill = m[1] || (m[4] ? '0' : ' '), align = m[2], sign = m[3], width = m[5] ? +m[5] : 0, comma = m[6], prec = m[7], type = m[8];
  var s;
  if (type === 'f' || type === 'F') s = Number(v).toFixed(prec === undefined ? 6 : +prec);
  else if (type === 'e' || type === 'E') s = Number(v).toExponential(prec === undefined ? 6 : +prec);
  else if (type === '%') s = (Number(v) * 100).toFixed(prec === undefined ? 6 : +prec) + '%';
  else if (type === 'x') s = Math.trunc(v).toString(16);
  else if (type === 'X') s = Math.trunc(v).toString(16).toUpperCase();
  else if (type === 'b') s = Math.trunc(v).toString(2);
  else if (type === 'o') s = Math.trunc(v).toString(8);
  else if (type === 'd') s = String(Math.trunc(v));
  else if (typeof v === 'number' && prec !== undefined) s = String(+Number(v).toPrecision(+prec));
  else if (typeof v === 'string' && prec !== undefined) s = v.slice(0, +prec);
  else s = __str(v);
  if (comma && typeof v === 'number') { var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); }
  if (sign === '+' && typeof v === 'number' && v >= 0) s = '+' + s;
  var numeric = typeof v === 'number';
  var al = align || (numeric ? '>' : '<');
  if (s.length < width) {
    var pad = width - s.length;
    if (al === '<') s = s + fill.repeat(pad);
    else if (al === '^') s = fill.repeat(Math.floor(pad / 2)) + s + fill.repeat(Math.ceil(pad / 2));
    else if (al === '=' || (m[4] && !align && numeric)) { var sg = /^[+-]/.test(s) ? s[0] : ''; s = sg + fill.repeat(pad) + s.slice(sg.length); }
    else s = fill.repeat(pad) + s;
  }
  return s;
}

/* ---------- methods on built-in types ---------- */
function __bindM(obj, name) {
  var f = __M(obj, name);
  if (f) return f;
  var v = obj === null || obj === undefined ? undefined : obj[name];
  if (typeof v === 'function') return v.bind(obj);
  throw AttributeError("'" + __typename(obj) + "' object has no attribute '" + name + "'");
}
var __STR = {
  upper: function (s) { return function () { return s.toUpperCase(); }; },
  lower: function (s) { return function () { return s.toLowerCase(); }; },
  strip: function (s) { return function (c) { return c === undefined ? s.trim() : __stripChars(s, c, true, true); }; },
  lstrip: function (s) { return function (c) { return c === undefined ? s.trimStart() : __stripChars(s, c, true, false); }; },
  rstrip: function (s) { return function (c) { return c === undefined ? s.trimEnd() : __stripChars(s, c, false, true); }; },
  split: function (s) { return function (sep, maxsplit) {
    var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a); sep = a[0] !== undefined ? a[0] : kw.sep; maxsplit = a[1] !== undefined ? a[1] : (kw.maxsplit !== undefined ? kw.maxsplit : -1);
    if (sep === undefined || sep === null) { var t = s.trim(); if (!t) return []; var parts = t.split(/\s+/); if (maxsplit >= 0 && parts.length > maxsplit + 1) { parts = t.split(/\s+/, maxsplit).concat([t.split(/\s+/).slice(maxsplit).join(' ')]); } return parts; }
    if (sep === '') throw ValueError('empty separator');
    var all = s.split(sep); if (maxsplit >= 0 && all.length > maxsplit + 1) return all.slice(0, maxsplit).concat([all.slice(maxsplit).join(sep)]); return all; }; },
  join: function (s) { return function (it) { return __iter(it).map(function (x) { if (typeof x !== 'string') throw TypeError_('sequence item: expected str instance, ' + __typename(x) + ' found'); return x; }).join(s); }; },
  replace: function (s) { return function (a, b, n) { if (n === undefined || n < 0) return s.split(a).join(b); var out = s; var parts = s.split(a); if (parts.length - 1 <= n) return parts.join(b); return parts.slice(0, n + 1).join(b) + a + parts.slice(n + 1).join(a); }; },
  startswith: function (s) { return function (p) { return Array.isArray(p) ? p.some(function (x) { return s.startsWith(x); }) : s.startsWith(p); }; },
  endswith: function (s) { return function (p) { return Array.isArray(p) ? p.some(function (x) { return s.endsWith(x); }) : s.endsWith(p); }; },
  find: function (s) { return function (x, st) { return s.indexOf(x, st); }; },
  rfind: function (s) { return function (x) { return s.lastIndexOf(x); }; },
  index: function (s) { return function (x) { var i = s.indexOf(x); if (i < 0) throw ValueError('substring not found'); return i; }; },
  count: function (s) { return function (x) { return x === '' ? s.length + 1 : s.split(x).length - 1; }; },
  isalpha: function (s) { return function () { return s.length > 0 && /^\p{L}+$/u.test(s); }; },
  isdigit: function (s) { return function () { return s.length > 0 && /^\d+$/.test(s); }; },
  isnumeric: function (s) { return function () { return s.length > 0 && /^\p{N}+$/u.test(s); }; },
  isalnum: function (s) { return function () { return s.length > 0 && /^[\p{L}\p{N}]+$/u.test(s); }; },
  isspace: function (s) { return function () { return s.length > 0 && /^\s+$/.test(s); }; },
  isupper: function (s) { return function () { return /[A-Z]/.test(s) && s === s.toUpperCase(); }; },
  islower: function (s) { return function () { return /[a-z]/.test(s) && s === s.toLowerCase(); }; },
  title: function (s) { return function () { return s.toLowerCase().replace(/(^|[^A-Za-z])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }; },
  capitalize: function (s) { return function () { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }; },
  swapcase: function (s) { return function () { return Array.from(s).map(function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); }).join(''); }; },
  center: function (s) { return function (w, f) { return __fmt(s, (f || ' ') + '^' + w); }; },
  ljust: function (s) { return function (w, f) { return __fmt(s, (f || ' ') + '<' + w); }; },
  rjust: function (s) { return function (w, f) { return __fmt(s, (f || ' ') + '>' + w); }; },
  zfill: function (s) { return function (w) { var sg = /^[+-]/.test(s) ? s[0] : ''; var b = s.slice(sg.length); return sg + b.padStart(w - sg.length, '0'); }; },
  splitlines: function (s) { return function () { return s.split(/\r?\n/).filter(function (x, i, a) { return !(i === a.length - 1 && x === ''); }); }; },
  format: function (s) { return function () { var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a); var auto = 0;
    return s.replace(/\{\{|\}\}|\{([^{}:!]*)(?:![rs])?(?::([^{}]*))?\}/g, function (m, key, spec) {
      if (m === '{{') return '{'; if (m === '}}') return '}';
      var v = key === '' ? a[auto++] : (/^\d+$/.test(key) ? a[+key] : kw[key]);
      return __fmt(v, spec); }); }; },
  encode: function (s) { return function () { return Array.from(new TextEncoder().encode(s)); }; }
};
function __stripChars(s, chars, left, right) {
  var a = 0, b = s.length;
  if (left) while (a < b && chars.indexOf(s[a]) !== -1) a++;
  if (right) while (b > a && chars.indexOf(s[b - 1]) !== -1) b--;
  return s.slice(a, b);
}
var __LIST = {
  append: function (l) { return function (x) { l.push(x); return null; }; },
  appendleft: function (l) { return function (x) { l.unshift(x); return null; }; },
  extend: function (l) { return function (it) { for (var x of __iter(it).slice()) l.push(x); return null; }; },
  insert: function (l) { return function (i, x) { if (i < 0) i = Math.max(0, l.length + i); l.splice(i, 0, x); return null; }; },
  pop: function (l) { return function (i) { if (!l.length) throw IndexError('pop from empty list'); if (i === undefined) return l.pop(); var n = i < 0 ? l.length + i : i; if (n < 0 || n >= l.length) throw IndexError('pop index out of range'); return l.splice(n, 1)[0]; }; },
  popleft: function (l) { return function () { if (!l.length) throw IndexError('pop from an empty deque'); return l.shift(); }; },
  remove: function (l) { return function (x) { for (var i = 0; i < l.length; i++) if (__eq(l[i], x)) { l.splice(i, 1); return null; } throw ValueError('list.remove(x): x not in list'); }; },
  index: function (l) { return function (x) { for (var i = 0; i < l.length; i++) if (__eq(l[i], x)) return i; throw ValueError(__repr(x) + ' is not in list'); }; },
  count: function (l) { return function (x) { return l.filter(function (y) { return __eq(y, x); }).length; }; },
  sort: function (l) { return function () { var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a); var r = sorted(l, new KW(kw)); for (var i = 0; i < r.length; i++) l[i] = r[i]; return null; }; },
  reverse: function (l) { return function () { l.reverse(); return null; }; },
  copy: function (l) { return function () { return l.slice(); }; },
  clear: function (l) { return function () { l.length = 0; return null; }; }
};
var __DICT = {
  get: function (m) { return function (k, d) { k = __norm(m, k); return m.has(k) ? m.get(k) : (d === undefined ? null : d); }; },
  keys: function (m) { return function () { return Array.from(m.keys()); }; },
  values: function (m) { return function () { return Array.from(m.values()); }; },
  items: function (m) { return function () { return Array.from(m.entries()).map(function (e) { return __tup([e[0], e[1]]); }); }; },
  pop: function (m) { return function (k, d) { k = __norm(m, k); if (m.has(k)) { var v = m.get(k); m.delete(k); return v; } if (d !== undefined) return d; throw KeyError(__repr(k)); }; },
  popitem: function (m) { return function () { var last = Array.from(m.entries()).pop(); if (!last) throw KeyError('popitem(): dictionary is empty'); m.delete(last[0]); return __tup([last[0], last[1]]); }; },
  update: function (m) { return function (o) { var a = Array.prototype.slice.call(arguments); var kw = __kwOf(a); if (a.length) { if (a[0] instanceof Map) a[0].forEach(function (v, k) { m.set(k, v); }); else for (var p of __iter(a[0])) m.set(p[0], p[1]); } for (var k of Object.keys(kw)) m.set(k, kw[k]); return null; }; },
  setdefault: function (m) { return function (k, d) { k = __norm(m, k); if (!m.has(k)) m.set(k, d === undefined ? null : d); return m.get(k); }; },
  copy: function (m) { return function () { var n = new Map(m); n.__default = m.__default; n.__counter = m.__counter; return n; }; },
  clear: function (m) { return function () { m.clear(); return null; }; }
};
var __SET = {
  add: function (s) { return function (x) { s.add(__norm(s, x)); return null; }; },
  remove: function (s) { return function (x) { if (!s.delete(__norm(s, x))) throw KeyError(__repr(x)); return null; }; },
  discard: function (s) { return function (x) { s.delete(__norm(s, x)); return null; }; },
  pop: function (s) { return function () { var v = s.values().next(); if (v.done) throw KeyError('pop from an empty set'); s.delete(v.value); return v.value; }; },
  union: function (s) { return function () { var r = new Set(s); for (var o of arguments) for (var x of __iter(o)) r.add(x); return r; }; },
  intersection: function (s) { return function (o) { var os = new Set(__iter(o)); return new Set(Array.from(s).filter(function (x) { return os.has(x); })); }; },
  difference: function (s) { return function (o) { var os = new Set(__iter(o)); return new Set(Array.from(s).filter(function (x) { return !os.has(x); })); }; },
  update: function (s) { return function (o) { for (var x of __iter(o)) s.add(x); return null; }; },
  issubset: function (s) { return function (o) { var os = new Set(__iter(o)); return Array.from(s).every(function (x) { return os.has(x); }); }; },
  issuperset: function (s) { return function (o) { return __iter(o).every(function (x) { return s.has(x); }); }; },
  copy: function (s) { return function () { return new Set(s); }; },
  clear: function (s) { return function () { s.clear(); return null; }; }
};
function __M(obj, name) {
  var table = typeof obj === 'string' ? __STR : Array.isArray(obj) ? __LIST : obj instanceof Map ? __DICT : obj instanceof Set ? __SET : null;
  if (table && table[name]) return table[name](obj);
  if (obj instanceof Map && name === 'most_common') return function (n) { var e = Array.from(obj.entries()).sort(function (a, b) { return b[1] - a[1]; }).map(function (p) { return __tup([p[0], p[1]]); }); return n === undefined ? e : e.slice(0, n); };
  if (obj instanceof Map && name === 'elements') return function () { var r = []; obj.forEach(function (v, k) { for (var i = 0; i < v; i++) r.push(k); }); return r; };
  return null;
}

/* ---------- stdlib bits ---------- */
function Counter(it) {
  var m = new Map(); m.__counter = true;
  if (it !== undefined) { if (it instanceof Map) it.forEach(function (v, k) { m.set(k, v); }); else for (var x of __iter(it)) m.set(x, (m.get(x) || 0) + 1); }
  return m;
}
function defaultdict(factory) {
  var m = new Map();
  if (factory !== undefined && factory !== null) m.__default = function () {
    if (factory === list) return []; if (factory === int) return 0; if (factory === set) return new Set(); if (factory === dict) return new Map(); if (factory === str) return ''; if (factory === float) return 0;
    return factory();
  };
  return m;
}
function deque(it) { return it === undefined ? [] : __iter(it).slice(); }
var math = {
  pi: Math.PI, e: Math.E, inf: Infinity, nan: NaN, tau: 2 * Math.PI,
  sqrt: function (x) { if (x < 0) throw ValueError('math domain error'); return Math.sqrt(x); },
  floor: Math.floor, ceil: Math.ceil, fabs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan, atan: Math.atan, atan2: Math.atan2,
  exp: Math.exp, log: function (x, b) { if (x <= 0) throw ValueError('math domain error'); return b === undefined ? Math.log(x) : Math.log(x) / Math.log(b); },
  log2: Math.log2, log10: Math.log10, pow: Math.pow, trunc: Math.trunc, hypot: Math.hypot,
  isnan: isNaN, isinf: function (x) { return x === Infinity || x === -Infinity; },
  factorial: function (n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; },
  gcd: function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; },
  comb: function (n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); },
  radians: function (d) { return d * Math.PI / 180; }, degrees: function (r) { return r * 180 / Math.PI; }
};
var random = {
  random: Math.random,
  randint: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  choice: function (s) { var a = __iter(s); return a[Math.floor(Math.random() * a.length)]; },
  shuffle: function (l) { for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = l[i]; l[i] = l[j]; l[j] = t; } return null; },
  seed: function () { return null; }, uniform: function (a, b) { return a + Math.random() * (b - a); }
};

/* ---------- calling convention, unpacking, exceptions ---------- */
function __bind(fname, args, spec) {
  var kw = null;
  if (args.length && args[args.length - 1] instanceof KW) { kw = args[args.length - 1].o; args = args.slice(0, -1); }
  var out = [], ai = 0;
  for (var si = 0; si < spec.length; si++) {
    var s = spec[si];
    if (s.k === '*') { out.push(__tup(args.slice(ai))); ai = args.length; continue; }
    if (s.k === '**') { var m = new Map(); if (kw) Object.keys(kw).forEach(function (k) { if (!spec.some(function (x) { return x.n === k; })) m.set(k, kw[k]); }); out.push(m); continue; }
    if (ai < args.length) out.push(args[ai++]);
    else if (kw && Object.prototype.hasOwnProperty.call(kw, s.n)) out.push(kw[s.n]);
    else if (s.d) out.push(s.d());
    else throw TypeError_(fname + "() missing required positional argument: '" + s.n + "'");
  }
  if (ai < args.length && !spec.some(function (x) { return x.k === '*'; })) throw TypeError_(fname + '() takes ' + spec.length + ' positional argument(s) but ' + args.length + ' were given');
  return out;
}
function __unpack(v, n, star) {
  var a = __iter(v);
  if (!star && a.length !== n) throw ValueError(a.length > n ? 'too many values to unpack (expected ' + n + ')' : 'not enough values to unpack (expected ' + n + ', got ' + a.length + ')');
  if (star && a.length < n - 1) throw ValueError('not enough values to unpack (expected at least ' + (n - 1) + ', got ' + a.length + ')');
  return a;
}
function __kwsplat(m) { var o = {}; if (m instanceof Map) m.forEach(function (v, k) { o[k] = v; }); return o; }
function __dictEntries(m) { return m instanceof Map ? Array.from(m.entries()) : []; }
var RecursionError = __mkexc('RecursionError', RuntimeError);
var __lastExc = null;
function __pyexc(e) {
  if (e && e.pyName) return e;
  var r;
  if (e instanceof RangeError && /call stack/i.test(e.message)) r = RecursionError('maximum recursion depth exceeded');
  else if (e instanceof ReferenceError) { var m = /^(\S+) is not defined/.exec(e.message); r = NameError(m ? "name '" + m[1] + "' is not defined" : e.message); }
  else if (e instanceof TypeError) r = TypeError_(e.message);
  else r = Exception(e && e.message ? e.message : String(e));
  __lastExc = r;
  return r;
}
function __catches(e, T) {
  __lastExc = __pyexc(e);
  var py = __lastExc;
  var list = Array.isArray(T) ? T : [T];
  return list.some(function (t) { return typeof t === 'function' && py instanceof t; });
}
function __raise(x) {
  if (typeof x === 'function') { try { return x(); } catch (err) { return new x(); } }
  return x;
}

/* ---------- result conversion for the test runner ---------- */
function __plain(x, depth) {
  depth = depth || 0;
  if (depth > 50) return '<deep>';
  if (x === undefined) return undefined;
  if (x instanceof Map) { var o = {}; x.forEach(function (v, k) { o[typeof k === 'string' ? k : __str(k)] = __plain(v, depth + 1); }); return o; }
  if (x instanceof Set) return Array.from(x).map(function (v) { return __plain(v, depth + 1); });
  if (Array.isArray(x)) return x.map(function (v) { return __plain(v, depth + 1); });
  if (typeof x === 'function') return '<function ' + (x.name || 'lambda') + '>';
  if (x && typeof x === 'object') { var r = {}; Object.keys(x).forEach(function (k) { r[k] = __plain(x[k], depth + 1); }); return r; }
  return x;
}
function __errText(e) {
  if (e && e.pyName) return e.pyName + (e.message ? ': ' + e.message : '');
  if (e instanceof ReferenceError) { var m = /^(\S+) is not defined/.exec(e.message); return m ? "NameError: name '" + m[1] + "' is not defined" : 'NameError: ' + e.message; }
  if (e instanceof RangeError && /call stack/i.test(e.message)) return 'RecursionError: maximum recursion depth exceeded';
  if (e instanceof TypeError) return 'TypeError: ' + e.message;
  return (e && e.message) ? String(e.message) : String(e);
}
`;
