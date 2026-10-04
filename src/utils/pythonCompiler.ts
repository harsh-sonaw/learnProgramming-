/**
 * A small Python -> JavaScript compiler for the DevPulse practice runner.
 *
 * It understands the everyday subset of Python taught in beginner/intermediate
 * courses: functions, classes (basic), loops, comprehensions, f-strings,
 * slicing, tuples/dicts/sets, try/except, lambdas, and common builtins.
 * Generated code relies on the helpers in pythonRuntime.ts.
 */

export class PySyntaxError extends Error {
  line: number;
  constructor(message: string, line = 0) {
    super(message);
    this.name = 'SyntaxError';
    this.line = line;
  }
}

/* ------------------------------------------------------------------ */
/* Tokenizer                                                           */
/* ------------------------------------------------------------------ */

interface Tok {
  t: 'num' | 'str' | 'name' | 'op';
  v: string;
  prefix?: string;
}

const OPS3 = ['**=', '//=', '>>=', '<<=', '...'];
const OPS2 = ['**', '//', '>>', '<<', '<=', '>=', '==', '!=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '->', ':='];
const STR_PREFIX = /^[rRbBfFuU]{1,2}$/;

function tokenize(src: string, line: number): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }

    // identifier / string prefix
    if (/[A-Za-z_\u0080-\uffff]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_\u0080-\uffff]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (j < n && (src[j] === '"' || src[j] === "'") && STR_PREFIX.test(word)) {
        const r = readString(src, j, word, line);
        toks.push(r.tok);
        i = r.end;
        continue;
      }
      toks.push({ t: 'name', v: word });
      i = j;
      continue;
    }

    if (c === '"' || c === "'") {
      const r = readString(src, i, '', line);
      toks.push(r.tok);
      i = r.end;
      continue;
    }

    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let j = i;
      if (c === '0' && /[xXoObB]/.test(src[i + 1] || '')) {
        j += 2;
        while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
      } else {
        while (j < n && /[0-9_]/.test(src[j])) j++;
        if (src[j] === '.') { j++; while (j < n && /[0-9_]/.test(src[j])) j++; }
        if (/[eE]/.test(src[j] || '') && /[0-9+\-]/.test(src[j + 1] || '')) {
          j += 2;
          while (j < n && /[0-9]/.test(src[j])) j++;
        }
      }
      toks.push({ t: 'num', v: src.slice(i, j).replace(/_/g, '') });
      i = j;
      continue;
    }

    const three = src.slice(i, i + 3);
    if (OPS3.includes(three)) { toks.push({ t: 'op', v: three }); i += 3; continue; }
    const two = src.slice(i, i + 2);
    if (OPS2.includes(two)) { toks.push({ t: 'op', v: two }); i += 2; continue; }
    if ('+-*/%<>=()[]{},:.;@&|^~!'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
    throw new PySyntaxError(`invalid character '${c}'`, line);
  }
  return toks;
}

function readString(src: string, start: number, prefix: string, line: number): { tok: Tok; end: number } {
  const q = src[start];
  const triple = src.slice(start, start + 3) === q.repeat(3);
  const raw = /r/i.test(prefix);
  let i = start + (triple ? 3 : 1);
  let body = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') { body += ch + (src[i + 1] ?? ''); i += 2; continue; }
    if (triple) {
      if (src.slice(i, i + 3) === q.repeat(3)) { i += 3; return { tok: { t: 'str', v: raw ? body : cook(body), prefix: prefix.toLowerCase() }, end: i }; }
    } else if (ch === q) {
      i++;
      return { tok: { t: 'str', v: raw ? body : cook(body), prefix: prefix.toLowerCase() }, end: i };
    }
    body += ch;
    i++;
  }
  throw new PySyntaxError('unterminated string literal', line);
}

function cook(s: string): string {
  return s.replace(/\\(\r?\n|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8}|[0-7]{1,3}|[\s\S])/g, (_m, g: string) => {
    switch (g[0]) {
      case '\n': case '\r': return '';
      case 'n': return '\n';
      case 't': return '\t';
      case 'r': return '\r';
      case '\\': return '\\';
      case "'": return "'";
      case '"': return '"';
      case 'a': return '\x07';
      case 'b': return '\b';
      case 'f': return '\f';
      case 'v': return '\v';
      case 'x': case 'u': case 'U': return g.length > 1 ? String.fromCodePoint(parseInt(g.slice(1), 16)) : g;
      default:
        if (/^[0-7]+$/.test(g)) return String.fromCharCode(parseInt(g, 8));
        return '\\' + g; // unknown escapes are kept verbatim, like Python
    }
  });
}

/* ------------------------------------------------------------------ */
/* Logical lines (indentation, brackets, continuation, comments)       */
/* ------------------------------------------------------------------ */

interface LLine { indent: number; text: string; line: number }

function splitLogicalLines(src: string): LLine[] {
  const out: LLine[] = [];
  const text = src.replace(/\r\n?/g, '\n');
  let i = 0;
  let line = 1;
  let cur = '';
  let curLine = 1;
  let depth = 0;
  let indent = 0;
  let atStart = true;
  let strQuote = '';
  const n = text.length;

  const flush = () => {
    if (cur.trim()) out.push({ indent, text: cur.trim(), line: curLine });
    cur = '';
    atStart = true;
  };

  while (i < n) {
    const c = text[i];
    if (atStart && !strQuote) {
      // measure indentation
      let w = 0;
      let j = i;
      while (j < n && (text[j] === ' ' || text[j] === '\t')) { w = text[j] === '\t' ? (Math.floor(w / 8) + 1) * 8 : w + 1; j++; }
      if (j >= n) break;
      if (text[j] === '\n' || text[j] === '#') { // blank or comment-only line
        while (j < n && text[j] !== '\n') j++;
        i = j + 1;
        line++;
        continue;
      }
      indent = w;
      curLine = line;
      atStart = false;
      i = j;
      continue;
    }

    if (strQuote) {
      if (c === '\\') { cur += c + (text[i + 1] ?? ''); if (text[i + 1] === '\n') line++; i += 2; continue; }
      if (text.slice(i, i + strQuote.length) === strQuote) { cur += strQuote; i += strQuote.length; strQuote = ''; continue; }
      if (c === '\n') { line++; if (strQuote.length === 1) throw new PySyntaxError('unterminated string literal', curLine); }
      cur += c; i++; continue;
    }

    if (c === '"' || c === "'") {
      const q = text.slice(i, i + 3) === c.repeat(3) ? c.repeat(3) : c;
      strQuote = q; cur += q; i += q.length; continue;
    }
    if (c === '#') { while (i < n && text[i] !== '\n') i++; continue; }
    if (c === '\\' && text[i + 1] === '\n') { cur += ' '; i += 2; line++; continue; }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth = Math.max(0, depth - 1);
    if (c === '\n') {
      line++;
      i++;
      if (depth > 0) { cur += ' '; continue; }
      flush();
      continue;
    }
    cur += c;
    i++;
  }
  if (strQuote) throw new PySyntaxError('unterminated triple-quoted string', curLine);
  flush();
  return out;
}

/* ------------------------------------------------------------------ */
/* Expression parser (Pratt-style recursive descent -> JS source)      */
/* ------------------------------------------------------------------ */

interface E { js: string; b: boolean } // b: JS value is already a real boolean

type Target =
  | { k: 'name'; name: string }
  | { k: 'sub'; obj: string; idx: string }
  | { k: 'attr'; obj: string; name: string }
  | { k: 'tuple'; items: Target[] }
  | { k: 'star'; t: Target };

const JS_RESERVED = new Set([
  'var', 'let', 'const', 'new', 'function', 'this', 'null', 'typeof', 'void', 'delete', 'default', 'switch', 'case',
  'enum', 'export', 'extends', 'super', 'static', 'public', 'private', 'protected', 'interface', 'package', 'implements',
  'instanceof', 'do', 'catch', 'throw', 'finally', 'debugger', 'await', 'arguments', 'eval', 'undefined', 'NaN', 'Infinity',
  'Map', 'Set', 'Array', 'Object', 'Math', 'JSON', 'Error', 'Symbol', 'Proxy', 'Reflect', 'Number', 'String', 'Boolean',
]);

const BUILTIN_RENAME: Record<string, string> = { TypeError: 'TypeError_' };

const PY_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif',
  'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or',
  'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
]);

class ExprParser {
  i = 0;
  last: Target | null = null; // structure of the most recent postfix expression, for assignment targets
  constructor(public toks: Tok[], private ctx: PyCompiler, private line: number) {}

  err(msg: string): PySyntaxError { return new PySyntaxError(msg, this.line); }
  peek(o = 0): Tok | undefined { return this.toks[this.i + o]; }
  atEnd(): boolean { return this.i >= this.toks.length; }
  isOp(v: string, o = 0): boolean { const t = this.peek(o); return !!t && t.t === 'op' && t.v === v; }
  isKw(v: string, o = 0): boolean { const t = this.peek(o); return !!t && t.t === 'name' && t.v === v; }
  eatOp(v: string): boolean { if (this.isOp(v)) { this.i++; return true; } return false; }
  eatKw(v: string): boolean { if (this.isKw(v)) { this.i++; return true; } return false; }
  expectOp(v: string): void { if (!this.eatOp(v)) throw this.err(`invalid syntax: expected '${v}'`); }
  expectKw(v: string): void { if (!this.eatKw(v)) throw this.err(`invalid syntax: expected '${v}'`); }

  bool(e: E): string { return e.b ? e.js : `__truthy(${e.js})`; }
  val(e: E): string { return e.js; }

  /** Full expression (with ternary + lambda) */
  expr(): E {
    if (this.isKw('lambda')) return this.lambda();
    const body = this.orTest();
    if (this.isKw('if')) {
      this.i++;
      const cond = this.orTest();
      this.expectKw('else');
      const alt = this.expr();
      return { js: `(${this.bool(cond)} ? ${body.js} : ${alt.js})`, b: false };
    }
    return body;
  }

  /** Comma separated expressions -> JS array literal if more than one (tuple) */
  exprList(stop?: (p: ExprParser) => boolean): E {
    const first = this.starOrExpr();
    if (!this.isOp(',')) return first.js.startsWith('...') ? { js: `__tup([${first.js}])`, b: false } : first;
    const items = [first.js];
    while (this.eatOp(',')) {
      if (this.atEnd() || (stop && stop(this))) break;
      items.push(this.starOrExpr().js);
    }
    return { js: `__tup([${items.join(', ')}])`, b: false };
  }

  starOrExpr(): E {
    if (this.eatOp('*')) return { js: `...__iter(${this.orTest().js})`, b: false };
    return this.expr();
  }

  lambda(): E {
    this.expectKw('lambda');
    const params: string[] = [];
    while (!this.isOp(':')) {
      const t = this.peek();
      if (!t || t.t !== 'name') throw this.err('invalid lambda parameters');
      this.i++;
      let p = this.ctx.ident(t.v);
      if (this.eatOp('=')) p += ` = ${this.expr().js}`;
      params.push(p);
      if (!this.eatOp(',')) break;
    }
    this.expectOp(':');
    const body = this.expr();
    return { js: `((${params.join(', ')}) => ${body.js})`, b: false };
  }

  orTest(): E {
    let l = this.andTest();
    while (this.isKw('or')) {
      this.i++;
      const r = this.andTest();
      l = l.b && r.b ? { js: `(${l.js} || ${r.js})`, b: true } : { js: `__or(() => ${l.js}, () => ${r.js})`, b: false };
    }
    return l;
  }

  andTest(): E {
    let l = this.notTest();
    while (this.isKw('and')) {
      this.i++;
      const r = this.notTest();
      l = l.b && r.b ? { js: `(${l.js} && ${r.js})`, b: true } : { js: `__and(() => ${l.js}, () => ${r.js})`, b: false };
    }
    return l;
  }

  notTest(): E {
    if (this.isKw('not')) {
      this.i++;
      const e = this.notTest();
      return { js: `(!${this.bool(e)})`, b: true };
    }
    return this.comparison();
  }

  comparison(): E {
    const first = this.bitOr();
    const parts: string[] = [];
    let left = first.js;
    let any = false;
    for (;;) {
      let op: string | null = null;
      const t = this.peek();
      if (t && t.t === 'op' && ['<', '>', '<=', '>=', '==', '!='].includes(t.v)) { op = t.v; this.i++; }
      else if (this.isKw('in')) { op = 'in'; this.i++; }
      else if (this.isKw('not') && this.isKw('in', 1)) { op = 'not in'; this.i += 2; }
      else if (this.isKw('is')) { this.i++; op = this.eatKw('not') ? 'is not' : 'is'; }
      if (!op) break;
      const right = this.bitOr().js;
      any = true;
      switch (op) {
        case '==': parts.push(`__eq(${left}, ${right})`); break;
        case '!=': parts.push(`(!__eq(${left}, ${right}))`); break;
        case 'in': parts.push(`__in(${left}, ${right})`); break;
        case 'not in': parts.push(`(!__in(${left}, ${right}))`); break;
        case 'is': parts.push(`(${left} === ${right})`); break;
        case 'is not': parts.push(`(${left} !== ${right})`); break;
        default: parts.push(`(${left} ${op} ${right})`);
      }
      left = right;
    }
    if (!any) return first;
    return { js: parts.length === 1 ? parts[0] : `(${parts.join(' && ')})`, b: true };
  }

  private binLevel(next: () => E, ops: Record<string, (a: string, b: string) => string>): E {
    let l = next();
    for (;;) {
      const t = this.peek();
      if (!t || t.t !== 'op' || !(t.v in ops)) break;
      this.i++;
      const r = next();
      l = { js: ops[t.v](l.js, r.js), b: false };
    }
    return l;
  }

  bitOr(): E { return this.binLevel(() => this.bitXor(), { '|': (a, b) => `(${a} | ${b})` }); }
  bitXor(): E { return this.binLevel(() => this.bitAnd(), { '^': (a, b) => `(${a} ^ ${b})` }); }
  bitAnd(): E { return this.binLevel(() => this.shift(), { '&': (a, b) => `(${a} & ${b})` }); }
  shift(): E { return this.binLevel(() => this.arith(), { '<<': (a, b) => `(${a} << ${b})`, '>>': (a, b) => `(${a} >> ${b})` }); }
  arith(): E { return this.binLevel(() => this.term(), { '+': (a, b) => `__add(${a}, ${b})`, '-': (a, b) => `(${a} - ${b})` }); }
  term(): E {
    return this.binLevel(() => this.factor(), {
      '*': (a, b) => `__mul(${a}, ${b})`,
      '/': (a, b) => `__div(${a}, ${b})`,
      '//': (a, b) => `__floordiv(${a}, ${b})`,
      '%': (a, b) => `__mod(${a}, ${b})`,
    });
  }

  factor(): E {
    if (this.eatOp('-')) return { js: `(-${this.factor().js})`, b: false };
    if (this.eatOp('+')) return { js: `(+${this.factor().js})`, b: false };
    if (this.eatOp('~')) return { js: `(~${this.factor().js})`, b: false };
    return this.power();
  }

  power(): E {
    const base = this.postfix();
    if (this.eatOp('**')) {
      const exp = this.factor();
      return { js: `__pow(${base.js}, ${exp.js})`, b: false };
    }
    return base;
  }

  /** atom followed by calls, subscripts and attribute accesses */
  postfix(): E {
    let cur = this.atom();
    let node: Target | null = this.last;
    let attr: { obj: string; name: string } | null = null;
    let isSuper = cur.js === '__SUPER__';
    for (;;) {
      if (this.isOp('(')) {
        this.i++;
        const args = this.callArgs();
        if (isSuper) { cur = { js: '__SUPER__', b: false }; isSuper = true; attr = null; node = null; continue; }
        if (attr) {
          if (attr.obj === '__SUPER__') {
            cur = { js: attr.name === '__init__' ? `(super(${args}), (__self = this), null)` : `super.${attr.name}(${args})`, b: false };
          } else {
            cur = { js: `__bindM(${attr.obj}, ${JSON.stringify(attr.name)})(${args})`, b: false };
          }
          attr = null;
        } else {
          cur = { js: `${cur.js}(${args})`, b: false };
        }
        node = null;
        continue;
      }
      if (this.isOp('[')) {
        this.i++;
        const sub = this.subscript();
        if (sub.kind === 'slice') {
          cur = { js: `__slice(${cur.js}, ${sub.a}, ${sub.b}, ${sub.c})`, b: false };
          node = null;
        } else {
          node = { k: 'sub', obj: cur.js, idx: sub.idx };
          cur = { js: `__idx(${cur.js}, ${sub.idx})`, b: false };
        }
        attr = null;
        isSuper = false;
        continue;
      }
      if (this.isOp('.')) {
        this.i++;
        const t = this.peek();
        if (!t || t.t !== 'name') throw this.err("invalid syntax after '.'");
        this.i++;
        attr = { obj: cur.js, name: t.v };
        node = { k: 'attr', obj: cur.js, name: t.v };
        cur = { js: `${cur.js}.${t.v}`, b: false };
        isSuper = false;
        continue;
      }
      break;
    }
    this.last = node;
    return cur;
  }

  callArgs(): string {
    const pos: string[] = [];
    const kw: string[] = [];
    let kwSplat: string | null = null;
    while (!this.isOp(')')) {
      if (this.eatOp('*')) { pos.push(`...__iter(${this.expr().js})`); }
      else if (this.eatOp('**')) { kwSplat = this.expr().js; }
      else if (this.peek()?.t === 'name' && this.isOp('=', 1) && !this.isOp('==', 1)) {
        const name = this.peek()!.v;
        this.i += 2;
        kw.push(`${JSON.stringify(name)}: ${this.expr().js}`);
      } else {
        const e = this.expr();
        if (this.isKw('for')) {
          pos.push(this.comprehension(e.js, 'list').js);
        } else {
          pos.push(e.js);
        }
      }
      if (!this.eatOp(',')) break;
    }
    this.expectOp(')');
    if (kw.length || kwSplat) {
      const base = kw.length ? `{${kw.join(', ')}}` : '{}';
      pos.push(kwSplat ? `new KW(Object.assign(${base}, __kwsplat(${kwSplat})))` : `new KW(${base})`);
    }
    return pos.join(', ');
  }

  subscript(): { kind: 'slice'; a: string; b: string; c: string } | { kind: 'index'; idx: string } {
    // parse up to three parts separated by ':'
    const parts: (string | null)[] = [];
    let sawColon = false;
    let cur: string | null = null;
    while (!this.isOp(']')) {
      if (this.eatOp(':')) { parts.push(cur); cur = null; sawColon = true; continue; }
      if (cur !== null) {
        // tuple index like a[1, 2]
        if (this.eatOp(',')) { cur = `[${cur}, ${this.expr().js}]`; continue; }
        throw this.err('invalid subscript');
      }
      cur = this.expr().js;
    }
    this.expectOp(']');
    if (!sawColon) return { kind: 'index', idx: cur ?? 'undefined' };
    parts.push(cur);
    while (parts.length < 3) parts.push(null);
    const f = (x: string | null) => (x === null ? 'undefined' : x);
    return { kind: 'slice', a: f(parts[0]), b: f(parts[1]), c: f(parts[2]) };
  }

  /** comprehension clauses after the element expression */
  comprehension(elt: string, kind: 'list' | 'set' | 'dict', valueJs?: string): E {
    const loops: string[] = [];
    let closers = 0;
    while (this.isKw('for')) {
      this.i++;
      const target = this.parseTargetList();
      this.expectKw('in');
      const iter = this.orTest();
      // a trailing "if" belongs to the comprehension, so use orTest (no ternary)
      loops.push(`for (let ${this.ctx.patternOf(target)} of __iter(${iter.js})) {`);
      closers++;
      while (this.isKw('if')) {
        this.i++;
        const cond = this.orTestNoTernary();
        loops.push(`if (${this.bool(cond)}) {`);
        closers++;
      }
    }
    const push = kind === 'list' ? `__r.push(${elt});` : kind === 'set' ? `__sadd(__r, ${elt});` : `__setitem(__r, ${elt}, ${valueJs});`;
    const init = kind === 'list' ? '[]' : kind === 'set' ? 'new Set()' : 'new Map()';
    return { js: `(() => { const __r = ${init}; ${loops.join(' ')} ${push} ${'}'.repeat(closers)} return __r; })()`, b: false };
  }

  private orTestNoTernary(): E { return this.orTest(); }

  atom(): E {
    this.last = null;
    const t = this.peek();
    if (!t) throw this.err('unexpected end of expression');

    if (t.t === 'num') {
      this.i++;
      return { js: t.v.replace(/^0[oO]/, '0o').replace(/^0[bB]/, '0b'), b: false };
    }

    if (t.t === 'str') {
      let js = '';
      while (this.peek()?.t === 'str') {
        const s = this.peek()!;
        this.i++;
        const piece = s.prefix && s.prefix.includes('f') ? this.fstring(s.v) : JSON.stringify(s.v);
        js = js ? `${js} + ${piece}` : piece;
      }
      return { js: js.includes(' + ') ? `(${js})` : js, b: false };
    }

    if (t.t === 'name') {
      this.i++;
      switch (t.v) {
        case 'True': return { js: 'true', b: true };
        case 'False': return { js: 'false', b: true };
        case 'None': return { js: 'null', b: false };
        case 'super':
          if (this.isOp('(') && this.isOp(')', 1)) { this.i += 2; return { js: '__SUPER__', b: false }; }
          throw this.err("only 'super()' is supported");
      }
      if (PY_KEYWORDS.has(t.v)) throw this.err(`invalid syntax near '${t.v}'`);
      const js = this.ctx.ident(t.v);
      this.last = { k: 'name', name: js };
      return { js, b: false };
    }

    if (t.v === '...') { this.i++; return { js: 'null', b: false }; }

    if (t.v === '(') {
      this.i++;
      if (this.eatOp(')')) return { js: '__tup([])', b: false };
      const first = this.starOrExpr();
      if (this.isKw('for')) { const r = this.comprehension(first.js, 'list'); this.expectOp(')'); return r; }
      if (this.isOp(',')) {
        const items = [first.js];
        while (this.eatOp(',')) { if (this.isOp(')')) break; items.push(this.starOrExpr().js); }
        this.expectOp(')');
        this.last = null;
        return { js: `__tup([${items.join(', ')}])`, b: false };
      }
      this.expectOp(')');
      this.last = null;
      return first.js.startsWith('...') ? { js: `__tup([${first.js}])`, b: false } : { js: `(${first.js})`, b: first.b };
    }

    if (t.v === '[') {
      this.i++;
      if (this.eatOp(']')) return { js: '[]', b: false };
      const first = this.starOrExpr();
      if (this.isKw('for')) { const r = this.comprehension(first.js, 'list'); this.expectOp(']'); return r; }
      const items = [first.js];
      while (this.eatOp(',')) { if (this.isOp(']')) break; items.push(this.starOrExpr().js); }
      this.expectOp(']');
      this.last = null;
      return { js: `[${items.join(', ')}]`, b: false };
    }

    if (t.v === '{') {
      this.i++;
      if (this.eatOp('}')) return { js: 'new Map()', b: false };
      if (this.eatOp('**')) {
        // {**a, 'k': v}
        const entries = [`...__dictEntries(${this.orTest().js})`];
        while (this.eatOp(',')) {
          if (this.isOp('}')) break;
          if (this.eatOp('**')) entries.push(`...__dictEntries(${this.orTest().js})`);
          else { const k = this.expr().js; this.expectOp(':'); entries.push(`[${k}, ${this.expr().js}]`); }
        }
        this.expectOp('}');
        return { js: `new Map([${entries.join(', ')}])`, b: false };
      }
      const first = this.starOrExpr();
      if (this.eatOp(':')) {
        const v = this.expr();
        if (this.isKw('for')) { const r = this.comprehension(first.js, 'dict', v.js); this.expectOp('}'); return r; }
        const entries = [`[${first.js}, ${v.js}]`];
        while (this.eatOp(',')) {
          if (this.isOp('}')) break;
          if (this.eatOp('**')) { entries.push(`...__dictEntries(${this.orTest().js})`); continue; }
          const k = this.expr().js;
          this.expectOp(':');
          entries.push(`[${k}, ${this.expr().js}]`);
        }
        this.expectOp('}');
        return { js: `new Map([${entries.join(', ')}])`, b: false };
      }
      if (this.isKw('for')) { const r = this.comprehension(first.js, 'set'); this.expectOp('}'); return r; }
      const items = [first.js];
      while (this.eatOp(',')) { if (this.isOp('}')) break; items.push(this.starOrExpr().js); }
      this.expectOp('}');
      return { js: `new Set([${items.join(', ')}])`, b: false };
    }

    throw this.err(`invalid syntax near '${t.v}'`);
  }

  /** compile an f-string body into a JS expression */
  fstring(body: string): string {
    const parts: string[] = [];
    let lit = '';
    let i = 0;
    const flushLit = () => { if (lit) { parts.push(JSON.stringify(lit)); lit = ''; } };
    while (i < body.length) {
      const c = body[i];
      if (c === '{' && body[i + 1] === '{') { lit += '{'; i += 2; continue; }
      if (c === '}' && body[i + 1] === '}') { lit += '}'; i += 2; continue; }
      if (c === '{') {
        let depth = 1;
        let j = i + 1;
        let quote = '';
        while (j < body.length && depth > 0) {
          const d = body[j];
          if (quote) { if (d === quote) quote = ''; }
          else if (d === '"' || d === "'") quote = d;
          else if (d === '{' || d === '[' || d === '(') depth++;
          else if (d === '}' || d === ']' || d === ')') depth--;
          j++;
        }
        if (depth !== 0) throw this.err("f-string: expecting '}'");
        const inner = body.slice(i + 1, j - 1);
        flushLit();
        parts.push(this.fstringField(inner));
        i = j;
        continue;
      }
      if (c === '}') throw this.err("f-string: single '}' is not allowed");
      lit += c;
      i++;
    }
    flushLit();
    if (!parts.length) return '""';
    return parts.length === 1 && parts[0].startsWith('"') ? parts[0] : `("" + ${parts.join(' + ')})`;
  }

  private fstringField(inner: string): string {
    // split expr / !conv / :spec at top level
    let depth = 0;
    let quote = '';
    let exprEnd = inner.length;
    let conv = '';
    let spec = '';
    for (let k = 0; k < inner.length; k++) {
      const d = inner[k];
      if (quote) { if (d === quote) quote = ''; continue; }
      if (d === '"' || d === "'") { quote = d; continue; }
      if ('([{'.includes(d)) depth++;
      else if (')]}'.includes(d)) depth--;
      else if (depth === 0 && d === '!' && inner[k + 1] !== '=') {
        exprEnd = k;
        conv = inner[k + 1] || '';
        const colon = inner.indexOf(':', k);
        if (colon >= 0) spec = inner.slice(colon + 1);
        break;
      } else if (depth === 0 && d === ':') {
        exprEnd = k;
        spec = inner.slice(k + 1);
        break;
      }
    }
    const exprSrc = inner.slice(0, exprEnd).trim();
    if (!exprSrc) throw this.err('f-string: empty expression not allowed');
    const sub = new ExprParser(tokenize(exprSrc, this.line), this.ctx, this.line);
    const e = sub.exprList();
    if (!sub.atEnd()) throw this.err('f-string: invalid expression');
    let js = e.js;
    if (conv === 'r') js = `__repr(${js})`;
    if (spec.includes('{')) {
      // nested field in format spec, e.g. {x:{width}}
      const specJs = this.fstring(spec);
      return `__fmt(${js}, ${specJs})`;
    }
    return spec ? `__fmt(${js}, ${JSON.stringify(spec)})` : `__str(${js})`;
  }

  /** assignment / for-loop targets: a, (b, c), *rest, x[i], obj.attr */
  parseTargetList(): Target {
    const first = this.parseTargetItem();
    if (!this.isOp(',')) return first;
    const items = [first];
    while (this.eatOp(',')) {
      if (this.isKw('in') || this.isOp('=') || this.atEnd()) break;
      items.push(this.parseTargetItem());
    }
    return { k: 'tuple', items };
  }

  private parseTargetItem(): Target {
    if (this.eatOp('*')) return { k: 'star', t: this.parseTargetItem() };
    if ((this.isOp('(') || this.isOp('[')) ) {
      // could be a parenthesised target group
      const close = this.isOp('(') ? ')' : ']';
      const save = this.i;
      this.i++;
      try {
        const inner = this.parseTargetList();
        if (this.eatOp(close)) {
          // only a group if not followed by postfix ops
          if (!this.isOp('.') && !this.isOp('[') && !this.isOp('(')) return inner.k === 'tuple' ? inner : { k: 'tuple', items: [inner] };
        }
      } catch { /* fall through */ }
      this.i = save;
    }
    this.postfix();
    const node = this.last;
    if (!node) throw this.err('cannot assign to expression');
    return node;
  }
}

/* ------------------------------------------------------------------ */
/* Statement compiler                                                  */
/* ------------------------------------------------------------------ */

interface Block {
  indent: number;
  kind: 'def' | 'class' | 'if' | 'loop' | 'try' | 'other' | 'method';
  closer: string;
  prevSelf?: string | null;
  prevGlobals?: Set<string>;
  prevInMethod?: boolean;
}

export interface CompileOptions { filename?: string }

class PyCompiler {
  private lines: LLine[] = [];
  private out: string[] = [];
  private stack: Block[] = [];
  selfName: string | null = null; // name that maps to `this`-like __self
  private globals = new Set<string>();
  private classStack: { name: string; hasBase: boolean }[] = [];
  private pendingDecorators: string[] = [];
  private uid = 0;

  compile(src: string): string {
    this.lines = splitLogicalLines(src);
    for (let idx = 0; idx < this.lines.length; idx++) {
      const ln = this.lines[idx];
      const nextIndent = this.lines[idx + 1]?.indent;
      this.closeBlocks(ln);
      this.statement(ln, idx, nextIndent);
    }
    this.closeBlocks({ indent: -1, text: '', line: 0 });
    return this.out.join('\n');
  }

  /** compile a single expression (used for test case calls) */
  compileExpression(src: string): string {
    const p = new ExprParser(tokenize(src, 0), this, 0);
    const e = p.exprList();
    if (!p.atEnd()) throw new PySyntaxError('invalid expression', 0);
    return e.js;
  }

  ident(name: string): string {
    if (this.selfName && name === this.selfName) return '__self';
    if (name in BUILTIN_RENAME) return BUILTIN_RENAME[name];
    if (JS_RESERVED.has(name)) return `${name}_`;
    return name;
  }

  patternOf(t: Target): string {
    switch (t.k) {
      case 'name': return t.name;
      case 'tuple': return `[${t.items.map(x => this.patternOf(x)).join(', ')}]`;
      case 'star': return `...${this.patternOf(t.t)}`;
      default: throw new PySyntaxError('unsupported assignment target in this position');
    }
  }

  private allNames(t: Target): boolean {
    if (t.k === 'name') return true;
    if (t.k === 'star') return this.allNames(t.t);
    if (t.k === 'tuple') return t.items.every(x => this.allNames(x));
    return false;
  }

  private emit(s: string) { this.out.push(s); }

  private closeBlocks(ln: LLine) {
    const kw = ln.text.split(/[\s:(]/, 1)[0];
    const continues = ['elif', 'else', 'except', 'finally'].includes(kw);
    const closed: Block[] = [];
    while (this.stack.length && this.stack[this.stack.length - 1].indent >= ln.indent) {
      closed.push(this.stack.pop()!);
    }
    closed.forEach((b, k) => {
      const isLast = k === closed.length - 1;
      if (isLast && continues && b.kind !== 'def' && b.kind !== 'class' && b.kind !== 'method') {
        this.pendingMerge = true;
      } else {
        this.emit(b.closer);
      }
      if (b.kind === 'def' || b.kind === 'method') {
        this.selfName = b.prevSelf ?? null;
        if (b.prevGlobals) this.globals = b.prevGlobals;
      }
      if (b.kind === 'class') this.classStack.pop();
    });
  }
  private pendingMerge = false;

  private head(js: string): string {
    if (this.pendingMerge) { this.pendingMerge = false; return `} ${js}`; }
    return js;
  }

  private tokenizeLine(text: string, line: number): Tok[] { return tokenize(text, line); }

  /** Split "header: body" at the first top-level colon (ignoring lambda colons) */
  private splitHeader(toks: Tok[], line: number): { head: Tok[]; body: Tok[] } {
    let depth = 0;
    let lambdas = 0;
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k];
      if (t.t === 'name' && t.v === 'lambda' && depth === 0) lambdas++;
      if (t.t === 'op') {
        if ('([{'.includes(t.v)) depth++;
        else if (')]}'.includes(t.v)) depth--;
        else if (t.v === ':' && depth === 0) {
          if (lambdas > 0) { lambdas--; continue; }
          return { head: toks.slice(0, k), body: toks.slice(k + 1) };
        }
      }
    }
    throw new PySyntaxError("expected ':'", line);
  }

  private statement(ln: LLine, idx: number, nextIndent: number | undefined) {
    const toks = this.tokenizeLine(ln.text, ln.line);
    if (!toks.length) return;
    const first = toks[0];
    const line = ln.line;
    const kw = first.t === 'name' ? first.v : '';

    // decorators
    if (first.t === 'op' && first.v === '@') {
      this.pendingDecorators.push(ln.text.slice(1).trim());
      return;
    }

    const compound = ['def', 'class', 'if', 'elif', 'else', 'while', 'for', 'try', 'except', 'finally', 'with'];
    if (compound.includes(kw)) {
      const { head, body } = this.splitHeader(toks, line);
      const hasInlineBody = body.length > 0;
      // inline body: "if x: return y" -> treat body as nested statement at deeper indent
      this.compoundHeader(kw, head, ln, idx);
      if (hasInlineBody) {
        const b = this.stack[this.stack.length - 1];
        this.statementFromTokens(body, { indent: ln.indent + 1, text: body.map(t => t.v).join(' '), line }, idx);
        void b; // the block stays open; the next line (or EOF) closes it, which lets else/except chain
      } else if (nextIndent === undefined || nextIndent <= ln.indent) {
        throw new PySyntaxError('expected an indented block', line);
      }
      return;
    }
    if (this.topLevelIndex(toks, ';') >= 0) { this.statementFromTokens(toks, ln, idx); return; }
    this.simple(toks, ln);
  }

  private statementFromTokens(toks: Tok[], ln: LLine, _idx: number) {
    // inline suite, e.g. `if x: a = 1; b = 2`
    const groups: Tok[][] = [[]];
    let depth = 0;
    for (const t of toks) {
      if (t.t === 'op') { if ('([{'.includes(t.v)) depth++; else if (')]}'.includes(t.v)) depth--; }
      if (t.t === 'op' && t.v === ';' && depth === 0) groups.push([]); else groups[groups.length - 1].push(t);
    }
    for (const g of groups) if (g.length) this.simple(g, ln);
  }

  private newParser(toks: Tok[], line: number) { return new ExprParser(toks, this, line); }

  private cond(toks: Tok[], line: number): string {
    const p = this.newParser(toks, line);
    const e = p.exprList();
    if (!p.atEnd()) throw new PySyntaxError('invalid syntax in condition', line);
    return p.bool(e);
  }

  private compoundHeader(kw: string, head: Tok[], ln: LLine, idx: number) {
    const line = ln.line;
    const indent = ln.indent;
    switch (kw) {
      case 'if': {
        this.emit(this.head(`if (${this.cond(head.slice(1), line)}) {`));
        this.stack.push({ indent, kind: 'if', closer: '}' });
        return;
      }
      case 'elif': {
        if (!this.pendingMerge) throw new PySyntaxError("'elif' without matching 'if'", line);
        this.emit(this.head(`else if (${this.cond(head.slice(1), line)}) {`));
        this.stack.push({ indent, kind: 'if', closer: '}' });
        return;
      }
      case 'else': {
        if (!this.pendingMerge) throw new PySyntaxError("'else' without matching 'if'", line);
        this.emit(this.head('else {'));
        this.stack.push({ indent, kind: 'if', closer: '}' });
        return;
      }
      case 'while': {
        this.emit(`while (${this.cond(head.slice(1), line)}) {`);
        this.stack.push({ indent, kind: 'loop', closer: '}' });
        return;
      }
      case 'for': {
        const p = this.newParser(head.slice(1), line);
        const target = p.parseTargetList();
        p.expectKw('in');
        const iter = p.exprList();
        if (!p.atEnd()) throw new PySyntaxError('invalid syntax in for loop', line);
        if (this.allNames(target)) {
          this.emit(`for (var ${this.patternOf(target)} of __iter(${iter.js})) {`);
        } else {
          const tmp = `__t${this.uid++}`;
          this.emit(`for (const ${tmp} of __iter(${iter.js})) {`);
          this.assignTo(target, tmp);
        }
        this.stack.push({ indent, kind: 'loop', closer: '}' });
        return;
      }
      case 'try': {
        this.emit('try {');
        this.stack.push({ indent, kind: 'try', closer: '}' });
        return;
      }
      case 'except': {
        if (!this.pendingMerge) throw new PySyntaxError("'except' without matching 'try'", line);
        let name = '';
        let typeJs = '';
        const rest = head.slice(1);
        if (rest.length) {
          const asIdx = rest.findIndex(t => t.t === 'name' && t.v === 'as');
          const typeToks = asIdx >= 0 ? rest.slice(0, asIdx) : rest;
          if (asIdx >= 0) name = rest[asIdx + 1]?.v ?? '';
          if (typeToks.length) {
            const p = this.newParser(typeToks, line);
            typeJs = p.exprList().js;
          }
        }
        const ev = `__e${this.uid++}`;
        let h = this.head(`catch (${ev}) {`);
        if (typeJs) h += ` if (!__catches(${ev}, ${typeJs})) throw ${ev};`;
        if (name) h += ` var ${this.ident(name)} = __pyexc(${ev});`;
        this.emit(h);
        this.stack.push({ indent, kind: 'try', closer: '}' });
        return;
      }
      case 'finally': {
        if (!this.pendingMerge) throw new PySyntaxError("'finally' without matching 'try'", line);
        this.emit(this.head('finally {'));
        this.stack.push({ indent, kind: 'try', closer: '}' });
        return;
      }
      case 'with': {
        // minimal: `with expr as name:` -> evaluate and bind, no context protocol
        const rest = head.slice(1);
        const asIdx = rest.findIndex(t => t.t === 'name' && t.v === 'as');
        const exprToks = asIdx >= 0 ? rest.slice(0, asIdx) : rest;
        const p = this.newParser(exprToks, line);
        const e = p.exprList();
        this.emit('{');
        if (asIdx >= 0) this.emit(`var ${this.ident(rest[asIdx + 1].v)} = ${e.js};`);
        else this.emit(`${e.js};`);
        this.stack.push({ indent, kind: 'other', closer: '}' });
        return;
      }
      case 'def':
        this.defHeader(head, ln, idx);
        return;
      case 'class':
        this.classHeader(head, ln);
        return;
    }
  }

  private classHeader(head: Tok[], ln: LLine) {
    const nameTok = head[1];
    if (!nameTok || nameTok.t !== 'name') throw new PySyntaxError('invalid class definition', ln.line);
    const name = this.ident(nameTok.v);
    let ext = '';
    if (head[2] && head[2].v === '(') {
      const inner = head.slice(3, head.length - 1);
      const filtered = inner.filter(t => !(t.t === 'name' && t.v === 'object'));
      if (filtered.length) {
        const p = this.newParser(filtered, ln.line);
        ext = ` extends ${p.exprList().js}`;
      }
    }
    this.pendingDecorators = [];
    // anonymous class expression so that references to the class name inside its own
    // methods resolve to the callable proxy rather than the raw JS class
    this.emit(`var ${name} = __cls(class${ext} {`);
    this.classStack.push({ name, hasBase: !!ext });
    this.stack.push({ indent: ln.indent, kind: 'class', closer: `}, ${JSON.stringify(nameTok.v)});` });
  }

  private defHeader(head: Tok[], ln: LLine, idx: number) {
    const line = ln.line;
    const nameTok = head[1];
    if (!nameTok || nameTok.t !== 'name') throw new PySyntaxError('invalid function definition', line);
    const pyName = nameTok.v;
    if (!(head[2] && head[2].v === '(')) throw new PySyntaxError("expected '('", line);
    // strip return annotation
    let end = head.length;
    for (let k = head.length - 1; k > 2; k--) { if (head[k].t === 'op' && head[k].v === '->') { end = k; break; } }
    const paramToks = head.slice(3, end - 1);

    // split params at top-level commas
    const params: Tok[][] = [[]];
    let depth = 0;
    for (const t of paramToks) {
      if (t.t === 'op') { if ('([{'.includes(t.v)) depth++; else if (')]}'.includes(t.v)) depth--; }
      if (t.t === 'op' && t.v === ',' && depth === 0) params.push([]); else params[params.length - 1].push(t);
    }

    interface Spec { n: string; k: 'p' | '*' | '**'; d?: string }
    const specs: Spec[] = [];
    const inClass = this.classStack.length > 0 && this.stack.length > 0 && this.stack[this.stack.length - 1].kind === 'class';
    const decorators = this.pendingDecorators;
    this.pendingDecorators = [];
    const isStatic = decorators.includes('staticmethod');
    const isClassMethod = decorators.includes('classmethod');
    const isProp = decorators.includes('property');
    const setterDec = decorators.find(d => /\.setter$/.test(d));
    let selfParam: string | null = null;

    for (let pi = 0; pi < params.length; pi++) {
      const ptoks = params[pi];
      if (!ptoks.length) continue;
      let k: 'p' | '*' | '**' = 'p';
      let toks = ptoks;
      if (toks[0].t === 'op' && toks[0].v === '*') { k = '*'; toks = toks.slice(1); }
      else if (toks[0].t === 'op' && toks[0].v === '**') { k = '**'; toks = toks.slice(1); }
      if (!toks.length) continue; // bare `*`
      const nm = toks[0];
      if (nm.t !== 'name') throw new PySyntaxError('invalid parameter', line);
      let def: string | undefined;
      const eq = toks.findIndex(t => t.t === 'op' && t.v === '=');
      if (eq >= 0) {
        const p = this.newParser(toks.slice(eq + 1), line);
        def = p.expr().js;
      }
      if (inClass && !isStatic && pi === 0 && k === 'p') { selfParam = nm.v; continue; }
      specs.push({ n: nm.v, k, d: def });
    }

    const prevSelf = this.selfName;
    const prevGlobals = this.globals;
    this.globals = new Set();
    const jsParamNames = specs.map(s => this.identNoSelf(s.n));
    const simple = specs.every(s => s.k === 'p' && s.d === undefined);

    let header: string;
    let prologue = '';
    const mkBind = () => {
      const specJs = '[' + specs.map(s => `{n: ${JSON.stringify(s.n)}, k: ${JSON.stringify(s.k)}${s.d !== undefined ? `, d: () => ${s.d}` : ''}}`).join(', ') + ']';
      return `__bind(${JSON.stringify(pyName)}, Array.prototype.slice.call(arguments), ${specJs})`;
    };

    const jsName = this.ident(pyName);
    const hasBind = specs.length > 0;
    if (simple) {
      if (hasBind) prologue = `if (arguments.length && arguments[arguments.length - 1] instanceof KW) { [${jsParamNames.join(', ')}] = ${mkBind()}; }`;
    } else {
      prologue = `var [${jsParamNames.map((n, i) => (specs[i].k === '*' ? n : specs[i].k === '**' ? n : n)).join(', ')}] = ${mkBind()};`;
    }
    const plainParams = simple ? jsParamNames.join(', ') : '';

    if (inClass) {
      let methodHead: string;
      const isInit = pyName === '__init__';
      if (isInit) methodHead = `constructor(${plainParams}) {`;
      else if (isProp) methodHead = `get ${jsName}() {`;
      else if (setterDec) methodHead = `set ${jsName}(${plainParams}) {`;
      else methodHead = `${isStatic || isClassMethod ? 'static ' : ''}${jsName}(${plainParams}) {`;
      this.emit(methodHead);
      this.selfName = selfParam;
      const cls = this.classStack[this.classStack.length - 1];
      if (selfParam) {
        if (isInit && cls.hasBase) {
          // derived constructor: __self becomes available once super() has run
          this.emit('var __self;');
          if (!this.bodyContains(idx, ln.indent, 'super()')) this.emit('super(); __self = this;');
        } else if (isClassMethod) {
          this.emit('var __self = this;');
        } else {
          this.emit('var __self = this;');
        }
      }
      if (prologue && !isProp) this.emit(prologue);
      this.stack.push({ indent: ln.indent, kind: 'method', closer: '}', prevSelf, prevGlobals });
      return;
    }

    header = `function ${jsName}(${plainParams}) {`;
    this.emit(header);
    if (prologue) this.emit(prologue);
    this.selfName = prevSelf; // nested functions keep access to the enclosing __self
    this.stack.push({ indent: ln.indent, kind: 'def', closer: '}', prevSelf, prevGlobals });
  }

  private identNoSelf(name: string): string {
    if (name in BUILTIN_RENAME) return BUILTIN_RENAME[name];
    if (JS_RESERVED.has(name)) return `${name}_`;
    return name;
  }

  private bodyContains(idx: number, indent: number, needle: string): boolean {
    for (let k = idx + 1; k < this.lines.length && this.lines[k].indent > indent; k++) {
      if (this.lines[k].text.replace(/\s+/g, '').includes(needle)) return true;
    }
    return false;
  }

  /** emits statements that assign `valueJs` to the target */
  private assignTo(t: Target, valueJs: string) {
    switch (t.k) {
      case 'name':
        this.emit(this.globals.has(t.name) ? `${t.name} = ${valueJs};` : `var ${t.name} = ${valueJs};`);
        return;
      case 'sub':
        this.emit(`__setitem(${t.obj}, ${t.idx}, ${valueJs});`);
        return;
      case 'attr':
        this.emit(`${t.obj}.${t.name} = ${valueJs};`);
        return;
      case 'star':
        throw new PySyntaxError('starred assignment target must be in a list or tuple');
      case 'tuple': {
        if (this.allNames(t)) {
          const names = this.patternOf(t);
          this.emit(`var ${names} = __unpack(${valueJs}, ${t.items.length}${t.items.some(x => x.k === 'star') ? ', true' : ''});`);
          return;
        }
        const tmp = `__u${this.uid++}`;
        this.emit(`var ${tmp} = __unpack(${valueJs}, ${t.items.length}${t.items.some(x => x.k === 'star') ? ', true' : ''});`);
        t.items.forEach((it, k) => this.assignTo(it, `${tmp}[${k}]`));
      }
    }
  }

  private simple(toks: Tok[], ln: LLine) {
    const line = ln.line;
    const first = toks[0];
    const kw = first.t === 'name' ? first.v : '';
    const rest = toks.slice(1);

    switch (kw) {
      case 'pass': this.emit(';'); return;
      case 'break': this.emit('break;'); return;
      case 'continue': this.emit('continue;'); return;
      case 'return': {
        if (!rest.length) { this.emit('return null;'); return; }
        const p = this.newParser(rest, line);
        const e = p.exprList();
        if (!p.atEnd()) throw new PySyntaxError('invalid syntax in return', line);
        this.emit(`return ${e.js};`);
        return;
      }
      case 'raise': {
        if (!rest.length) { this.emit('throw __lastExc;'); return; }
        const fromIdx = rest.findIndex(t => t.t === 'name' && t.v === 'from');
        const p = this.newParser(fromIdx >= 0 ? rest.slice(0, fromIdx) : rest, line);
        const e = p.exprList();
        this.emit(`throw __raise(${e.js});`);
        return;
      }
      case 'import': case 'from': {
        // `import math` etc. are pre-provided by the runtime; unknown modules error clearly
        const mods = kw === 'import'
          ? rest.filter(t => t.t === 'name' && t.v !== 'as' && t.v !== ',').map(t => t.v)
          : [rest[0]?.v ?? ''];
        const known = ['math', 'random', 'collections', 'typing', 'sys', 'time', 'itertools', 'functools', 'string', 're', 'json', 'dataclasses', 'datetime'];
        for (const m of mods) {
          if (m && !known.includes(m)) throw new PySyntaxError(`ModuleNotFoundError: No module named '${m}' (only a few standard modules are available in the browser runner)`, line);
        }
        this.emit(';');
        return;
      }
      case 'global': case 'nonlocal': {
        for (const t of rest) if (t.t === 'name') this.globals.add(this.ident(t.v));
        this.emit(';');
        return;
      }
      case 'assert': {
        const comma = this.topLevelIndex(rest, ',');
        const cond = this.newParser(comma >= 0 ? rest.slice(0, comma) : rest, line).exprList().js;
        const msg = comma >= 0 ? this.newParser(rest.slice(comma + 1), line).exprList().js : 'undefined';
        this.emit(`__assert(${cond}, ${msg});`);
        return;
      }
      case 'del': {
        const p = this.newParser(rest, line);
        for (;;) {
          p.postfix();
          const node = p.last;
          if (!node || node.k !== 'sub') throw new PySyntaxError('del is only supported for items (del x[i])', line);
          this.emit(`__delitem(${node.obj}, ${node.idx});`);
          if (!p.eatOp(',')) break;
        }
        return;
      }
      case 'yield': throw new PySyntaxError("generators ('yield') are not supported in the browser runner", line);
      case 'async': case 'await': throw new PySyntaxError("async/await is not supported in the browser runner", line);
      case 'lambda': break;
    }

    // annotated assignment: name: type = value  /  name: type
    if (first.t === 'name' && toks[1]?.t === 'op' && toks[1].v === ':' && !PY_KEYWORDS.has(first.v)) {
      const eq = this.topLevelIndex(toks, '=');
      if (eq < 0) { this.emit(';'); return; }
      const valueToks = toks.slice(eq + 1);
      const val = this.newParser(valueToks, line).exprList();
      this.assignTo({ k: 'name', name: this.ident(first.v) }, val.js);
      return;
    }

    // augmented assignment
    const augIdx = toks.findIndex((t, k) => t.t === 'op' && /^(\+|-|\*|\/|\/\/|%|\*\*|&|\||\^|>>|<<)=$/.test(t.v) && this.depthAt(toks, k) === 0);
    if (augIdx > 0) {
      const op = toks[augIdx].v.slice(0, -1);
      const lhs = this.newParser(toks.slice(0, augIdx), line);
      lhs.postfix();
      const target = lhs.last;
      if (!target || target.k === 'tuple' || target.k === 'star') throw new PySyntaxError('illegal expression for augmented assignment', line);
      const rhs = this.newParser(toks.slice(augIdx + 1), line).exprList().js;
      const cur = target.k === 'name' ? target.name : target.k === 'sub' ? `__idx(${target.obj}, ${target.idx})` : `${target.obj}.${target.name}`;
      const combined = this.binop(op, cur, rhs);
      this.assignTo(target, combined);
      return;
    }

    // plain (possibly chained) assignment: a = b = value
    const eqs: number[] = [];
    for (let k = 0; k < toks.length; k++) {
      if (toks[k].t === 'op' && toks[k].v === '=' && this.depthAt(toks, k) === 0) eqs.push(k);
    }
    if (eqs.length) {
      const valueToks = toks.slice(eqs[eqs.length - 1] + 1);
      const value = this.newParser(valueToks, line).exprList().js;
      const targets: Target[] = [];
      let startIdx = 0;
      for (const e of eqs) {
        const p = this.newParser(toks.slice(startIdx, e), line);
        const tg = p.parseTargetList();
        if (!p.atEnd()) throw new PySyntaxError('cannot assign to expression', line);
        targets.push(tg);
        startIdx = e + 1;
      }
      if (targets.length === 1) {
        this.assignTo(targets[0], value);
      } else {
        const tmp = `__v${this.uid++}`;
        this.emit(`var ${tmp} = ${value};`);
        for (const tg of targets) this.assignTo(tg, tmp);
      }
      return;
    }

    // expression statement
    const p = this.newParser(toks, line);
    const e = p.exprList();
    if (!p.atEnd()) throw new PySyntaxError(`invalid syntax near '${p.peek()?.v}'`, line);
    this.emit(`${e.js};`);
  }

  private binop(op: string, a: string, b: string): string {
    switch (op) {
      case '+': return `__add(${a}, ${b})`;
      case '-': return `(${a} - ${b})`;
      case '*': return `__mul(${a}, ${b})`;
      case '/': return `__div(${a}, ${b})`;
      case '//': return `__floordiv(${a}, ${b})`;
      case '%': return `__mod(${a}, ${b})`;
      case '**': return `__pow(${a}, ${b})`;
      default: return `(${a} ${op} ${b})`;
    }
  }

  private depthAt(toks: Tok[], idx: number): number {
    let depth = 0;
    for (let k = 0; k < idx; k++) {
      const t = toks[k];
      if (t.t === 'op') { if ('([{'.includes(t.v)) depth++; else if (')]}'.includes(t.v)) depth--; }
    }
    return depth;
  }

  private topLevelIndex(toks: Tok[], v: string): number {
    for (let k = 0; k < toks.length; k++) if (toks[k].t === 'op' && toks[k].v === v && this.depthAt(toks, k) === 0) return k;
    return -1;
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function compilePython(source: string): string {
  return new PyCompiler().compile(source);
}

export function compilePythonExpression(source: string): string {
  return new PyCompiler().compileExpression(source);
}
