import { TestExecutionResult } from '../types';

const show = (v: any): string => {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return JSON.stringify(v);
  try { return JSON.stringify(v); } catch { return String(v); }
};

/** Plain-English explanation of why one test failed. */
export function diagnose(r: TestExecutionResult): string {
  const err = r.error || '';
  const a = r.actual;
  const e = r.expected;

  if (/is not defined/.test(err)) {
    const name = /(\S+) is not defined/.exec(err)?.[1];
    return `"${name ?? 'a name'}" doesn't exist. Check the spelling, and make sure the function is defined with exactly the name in the starter code.`;
  }
  if (/is not a function/.test(err)) return 'You called something that is not a function. Check method names and that the value has the type you expect.';
  if (/Cannot read prop/.test(err)) return 'You used a property of undefined or null. Print the value just before the failing line to see what it really is.';
  if (/Unexpected|SyntaxError|missing \)/.test(err)) return 'Syntax error: look for a missing bracket, quote, colon or brace near the line you edited last.';
  if (err) return `Your code threw an error: ${err}. Fix that first, then compare the output.`;

  if (a === undefined || a === 'undefined' || a === null) {
    return 'Your function returned nothing. Did you forget a return statement, or does a branch skip it?';
  }
  if (typeof a !== typeof e) {
    return `Wrong type: you returned ${typeof a} (${show(a)}) but the test expects ${typeof e}.`;
  }
  if (Array.isArray(a) && Array.isArray(e)) {
    if (a.length !== e.length) return `Wrong size: you returned ${a.length} item(s) but ${e.length} are expected.`;
    const i = a.findIndex((x, k) => JSON.stringify(x) !== JSON.stringify(e[k]));
    return `Right size, wrong contents. First difference is at position ${i}: got ${show(a[i])}, expected ${show(e[i])}. Check order and off-by-one errors.`;
  }
  if (typeof a === 'number' && typeof e === 'number') {
    return Math.abs(a - e) < 1
      ? 'Very close. This is usually rounding or a tiny formula difference. Check how the task says to round.'
      : `Off by ${Math.abs(a - e)}. Re-check the formula or an off-by-one in a loop bound.`;
  }
  if (typeof a === 'string' && typeof e === 'string') {
    if (a.toLowerCase() === e.toLowerCase()) return 'Only the letter case differs.';
    if (a.trim() === e.trim()) return 'Only whitespace differs (spaces or line breaks at the ends).';
  }
  if (a && e && typeof a === 'object' && typeof e === 'object') {
    const ka = Object.keys(a).sort().join(','), ke = Object.keys(e).sort().join(',');
    if (ka !== ke) return `Different keys. You have [${ka}] but the test expects [${ke}].`;
    return 'Same keys, different values. Compare each value against the example in the instructions.';
  }
  return 'The output differs from what the test expects. Trace the test input through your code by hand, one line at a time.';
}

export const LANGUAGE_TIPS: Record<string, string[]> = {
  python: ['Indentation matters: use 4 spaces inside def, if and for.', 'Return a value with return; print() only shows text.', 'Slicing: s[::-1] reverses; s[1:4] takes items 1 to 3.', 'Dictionary lookup with default: d.get(key, 0).'],
  javascript: ['Use return inside functions; console.log only prints.', 'Compare with ===, not ==.', 'Array helpers: map, filter, reduce, slice.', 'Objects: Object.keys(obj), obj[key].'],
  typescript: ['Types go after a colon: (x: number): string.', 'It runs like JavaScript once types are removed, so the logic is the same.', 'Use a switch on a "kind" field for union types.', 'Use key in obj to test for a property.'],
  go: ['Functions: func Name(a int) int { ... }.', 'Build slices with append(s, x); create maps with make(map[int]bool).', 'Loop with for i, v := range items.', 'Use := to declare and assign in one step.'],
  sql: ['Order matters: SELECT, FROM, WHERE, GROUP BY, ORDER BY, LIMIT.', 'Use AS to rename a column.', 'Text values need single quotes: \'Engineering\'.', 'COUNT, SUM and AVG need GROUP BY when mixed with plain columns.'],
};
