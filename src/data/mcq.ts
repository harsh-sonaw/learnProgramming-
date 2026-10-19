import { shuffle } from '@/core/quiz';
import type { Difficulty, LanguageId, McqQuestion } from '@/types';

/** Small seeded PRNG so every question gets a stable, mixed option order. */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Compact builder so each question reads as one entry. Write the correct answer wherever
 * is convenient: options are shuffled (deterministically) so it isn't always in the same slot.
 */
function q(
  trackId: LanguageId,
  n: number,
  difficulty: Difficulty,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  code?: string,
): McqQuestion {
  const id = `mcq-${trackId}-${n}`;
  const correct = options[correctIndex];
  const mixed = shuffle(options, seededRandom(id));
  return { id, trackId, difficulty, question, code, options: mixed, correctIndex: mixed.indexOf(correct), explanation };
}

const PYTHON: McqQuestion[] = [
  q('python', 1, 'Beginner', 'What does print(2 ** 3) output?', ['6', '8', '9', '23'], 1,
    '** is the exponent operator, so 2 ** 3 is 2 × 2 × 2 = 8.'),
  q('python', 2, 'Beginner', 'Which expression creates an empty dictionary?', ['[]', '()', '{}', '<>'], 2,
    '{} creates an empty dict (dict() works too). [] is a list and () is a tuple.'),
  q('python', 3, 'Beginner', 'What does len("hello") return?', ['4', '5', '6', 'It raises an error'], 1,
    'len() counts characters. "hello" has 5 of them.'),
  q('python', 4, 'Intermediate', 'What does this print?', ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'], 1,
    'y = x does not copy the list. Both names point to the same list, so appending through y changes x too.',
    'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)'),
  q('python', 5, 'Intermediate', "What does print('abc'[::-1]) output?", ['abc', 'cba', 'bca', 'Error'], 1,
    'A slice with step -1 walks the string backwards, so it reverses it.'),
  q('python', 6, 'Intermediate', 'What is the value of [n * n for n in range(4)]?', ['[1, 4, 9, 16]', '[0, 1, 4, 9]', '[0, 1, 2, 3]', '[0, 2, 4, 6]'], 1,
    'range(4) gives 0, 1, 2, 3, and each is squared: 0, 1, 4, 9.'),
  q('python', 7, 'Advanced', 'What do the two print calls output?', ['[1] then [2]', '[1] then [1, 2]', '[1] then [1]', 'Error'], 1,
    'The default list b=[] is created once, when the function is defined, and shared by every call. Use b=None and create the list inside.',
    'def add(a, b=[]):\n    b.append(a)\n    return b\n\nprint(add(1))\nprint(add(2))'),
  q('python', 8, 'Advanced', 'Which statement about == and is is correct?', [
    'They always give the same result',
    '== compares values, is checks whether both names point to the same object',
    'is compares values, == compares memory addresses',
    'is only works with numbers',
  ], 1, '== asks "are these equal?"; is asks "are these the very same object?". Two equal lists are different objects.'),
];

const JAVASCRIPT: McqQuestion[] = [
  q('javascript', 1, 'Beginner', 'Which keyword declares a block-scoped variable you can reassign?', ['var', 'let', 'const', 'def'], 1,
    'let is block-scoped and reassignable. const is block-scoped but cannot be reassigned; var is function-scoped.'),
  q('javascript', 2, 'Beginner', 'What does console.log(1 + "2") print?', ['3', '12', 'NaN', 'TypeError'], 1,
    'With a string on one side, + joins instead of adding, so the number 1 becomes "1" and the result is the string "12".'),
  q('javascript', 3, 'Beginner', 'What does [1, 2, 3].map(n => n * 2) return?', ['6', '[1, 2, 3]', '[2, 4, 6]', 'undefined'], 2,
    'map builds a new array by applying the function to every item.'),
  q('javascript', 4, 'Intermediate', 'What does typeof null return?', ['"null"', '"object"', '"undefined"', '"number"'], 1,
    'A long-standing quirk of JavaScript: typeof null is "object". Check for null with value === null.'),
  q('javascript', 5, 'Intermediate', 'What does === do that == does not?', [
    'Compares only references',
    'Compares value and type without converting types',
    'Compares only types',
    'Nothing, they are identical',
  ], 1, '== converts types before comparing ("5" == 5 is true). === does not, so "5" === 5 is false.'),
  q('javascript', 6, 'Intermediate', 'What does console.log(0.1 + 0.2 === 0.3) print?', ['true', 'false', 'undefined', 'It throws'], 1,
    'Decimal fractions like 0.1 cannot be stored exactly in binary floating point, so 0.1 + 0.2 is 0.30000000000000004.'),
  q('javascript', 7, 'Advanced', 'What does this code print?', ['0 1 2', '3 3 3', '0 0 0', 'undefined x3'], 1,
    'var is function-scoped, so all three callbacks share one i. By the time they run, the loop has finished and i is 3. Using let gives each iteration its own i.',
    'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}'),
  q('javascript', 8, 'Advanced', 'What does Promise.resolve(1).then(x => x + 1) evaluate to?', [
    'The number 2',
    'A Promise that resolves to 2',
    'undefined',
    'It throws an error',
  ], 1, '.then always returns a new Promise. You read the 2 with another .then or with await.'),
];

const TYPESCRIPT: McqQuestion[] = [
  q('typescript', 1, 'Beginner', 'Which line declares a variable that can only hold text?', ['let name: text', 'string name', 'let name: string', 'let name = <text>'], 2,
    'Types go after a colon: let name: string.'),
  q('typescript', 2, 'Beginner', 'What does the ? mean in this interface?', [
    'age must be a number',
    'age is optional',
    'age can be null only',
    'age is read-only',
  ], 1, 'A ? after a property name makes it optional, so objects may leave it out.',
    'interface User {\n  name: string;\n  age?: number;\n}'),
  q('typescript', 3, 'Beginner', 'What happens to TypeScript types when the code is compiled to JavaScript?', [
    'They are checked again at runtime',
    'They are erased',
    'They become comments',
    'They become classes',
  ], 1, 'Types exist only at compile time. The emitted JavaScript contains no type information.'),
  q('typescript', 4, 'Intermediate', 'What does type Id = string | number allow?', ['Only strings', 'Only numbers', 'A string or a number', 'Both at the same time'], 2,
    'A union type means the value is one of the listed types.'),
  q('typescript', 5, 'Intermediate', "Which type is the safer choice when you don't yet know a value's type?", ['any', 'unknown', 'object', 'void'], 1,
    'unknown forces you to check the type before using the value. any switches checking off.'),
  q('typescript', 6, 'Intermediate', 'What does Partial<User> produce?', [
    'A type with every property of User required',
    'A type with every property of User optional',
    'A type with only the first property',
    'A type with no properties',
  ], 1, 'Partial<T> makes all properties of T optional, which is handy for update functions.'),
  q('typescript', 7, 'Advanced', 'Inside the if block, what is the type of x?', ['string | number', 'number', 'string', 'unknown'], 2,
    'The typeof check narrows the union. Inside the block TypeScript knows x is a string.',
    'function show(x: string | number) {\n  if (typeof x === "string") {\n    // x is ...\n  }\n}'),
  q('typescript', 8, 'Advanced', 'Which best describes the never type?', [
    'A value that can be anything',
    'A value that may be missing',
    'Values that can never occur, such as the return type of a function that always throws',
    'The same as void',
  ], 2, 'never marks code paths that cannot finish normally. void means "returns nothing", which is different.'),
];

const GO: McqQuestion[] = [
  q('go', 1, 'Beginner', 'Which keyword declares a function in Go?', ['function', 'def', 'fn', 'func'], 3, 'Go functions start with func.'),
  q('go', 2, 'Beginner', 'Inside a function, which line declares and assigns a variable in one step?', ['x = 5', 'x := 5', 'var x := 5', 'let x = 5'], 1,
    ':= is the short declaration. It works only inside functions.'),
  q('go', 3, 'Beginner', 'What does this print?', ['2', '3', '4', 'Error'], 1, 'len returns the number of elements: 3.',
    'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println(len([]int{1, 2, 3}))\n}'),
  q('go', 4, 'Intermediate', 'What is the zero value of an int variable that was declared but not assigned?', ['nil', 'undefined', '0', '-1'], 2,
    'Every Go type has a zero value: 0 for numbers, "" for strings, false for bool, nil for pointers, slices and maps.'),
  q('go', 5, 'Intermediate', 'How do Go functions usually report a failure?', [
    'By throwing an exception',
    'By returning an error as the last return value',
    'By setting a global flag',
    'By calling exit()',
  ], 1, 'Go has no exceptions for normal errors. Functions return an error value that the caller checks with if err != nil.'),
  q('go', 6, 'Intermediate', 'When does a deferred call run?', [
    'Immediately',
    'When the surrounding function returns',
    'When the program exits',
    'On a separate goroutine at random',
  ], 1, 'defer schedules the call to run as the surrounding function returns, which is why it is used for cleanup like closing files.'),
  q('go', 7, 'Advanced', 'What happens when you write to a nil map?', [
    'It creates the map',
    'It is silently ignored',
    'The program panics',
    'It returns an error',
  ], 2, 'Reading a nil map is safe and gives the zero value, but writing panics. Create maps with make(map[K]V).'),
  q('go', 8, 'Advanced', 'What does sending on an unbuffered channel do?', [
    'Returns immediately',
    'Blocks until another goroutine receives',
    'Drops the value if nobody is listening',
    'Copies the value into a queue',
  ], 1, 'An unbuffered send and receive meet at the same moment, so the sender waits until someone receives.'),
];

const SQL: McqQuestion[] = [
  q('sql', 1, 'Beginner', 'Which statement reads data from a table?', ['GET', 'SELECT', 'FETCH', 'READ'], 1, 'SELECT retrieves rows and columns.'),
  q('sql', 2, 'Beginner', 'What does SELECT COUNT(*) FROM employees; return?', [
    'The names of all employees',
    'The number of rows in employees',
    'The sum of all salaries',
    'The first row',
  ], 1, 'COUNT(*) counts rows.'),
  q('sql', 3, 'Beginner', 'Which query lists employees from the highest salary to the lowest?', [
    'SELECT * FROM employees ORDER BY salary ASC;',
    'SELECT * FROM employees ORDER BY salary DESC;',
    'SELECT * FROM employees GROUP BY salary;',
    'SELECT * FROM employees SORT salary;',
  ], 1, 'ORDER BY ... DESC sorts from largest to smallest. ASC is the default.'),
  q('sql', 4, 'Intermediate', 'Which clause filters groups after GROUP BY?', ['WHERE', 'HAVING', 'LIMIT', 'DISTINCT'], 1,
    'WHERE filters individual rows before grouping. HAVING filters the groups, for example HAVING COUNT(*) > 2.'),
  q('sql', 5, 'Intermediate', 'What does a LEFT JOIN return?', [
    'Only rows that match in both tables',
    'All rows from the left table, plus matching rows from the right (NULL where none)',
    'All rows from the right table only',
    'Every possible combination of rows',
  ], 1, 'LEFT JOIN keeps every row of the left table. Where the right table has no match, its columns are NULL.'),
  q('sql', 6, 'Intermediate', 'Which query finds the average salary per department?', [
    'SELECT department, AVG(salary) FROM employees;',
    'SELECT department, AVG(salary) FROM employees GROUP BY department;',
    'SELECT AVG(department) FROM employees GROUP BY salary;',
    'SELECT department FROM employees AVG(salary);',
  ], 1, 'A per-group aggregate needs GROUP BY on the non-aggregated column.'),
  q('sql', 7, 'Advanced', 'What does WHERE salary = NULL return?', [
    'Rows where salary is empty',
    'Rows where salary is 0',
    'No rows, because comparing with NULL is never true',
    'All rows',
  ], 2, 'NULL means "unknown", so = NULL is never true. Use WHERE salary IS NULL.'),
  q('sql', 8, 'Advanced', 'What is the difference between COUNT(*) and COUNT(email)?', [
    'There is none',
    'COUNT(email) skips rows where email is NULL',
    'COUNT(*) skips rows where email is NULL',
    'COUNT(email) counts distinct emails only',
  ], 1, 'COUNT(*) counts every row. COUNT(column) counts only rows where that column is not NULL.'),
];

export const MCQ_QUESTIONS: Record<LanguageId, McqQuestion[]> = {
  python: PYTHON,
  javascript: JAVASCRIPT,
  typescript: TYPESCRIPT,
  go: GO,
  sql: SQL,
};

export const getMcqQuestions = (language: LanguageId): McqQuestion[] => MCQ_QUESTIONS[language] ?? [];
