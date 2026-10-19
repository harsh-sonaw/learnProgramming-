import type { LanguageCompletions, Suggestion } from '@/core/autocomplete';
import { sqlDatabase } from '@/core/execution/codeRunner';
import type { LanguageId } from '@/types';

const snip = (label: string, insertText: string, detail = 'snippet'): Suggestion => ({
  label,
  insertText,
  detail,
  kind: 'snippet',
});

const PYTHON: LanguageCompletions = {
  keywords: [
    'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
    'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not',
    'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'True', 'False', 'None',
  ],
  globals: [
    'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'sum', 'min',
    'max', 'abs', 'round', 'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple', 'type',
    'isinstance', 'any', 'all', 'input', 'open', 'divmod', 'pow', 'chr', 'ord', 'next', 'iter',
  ],
  members: [
    'append', 'extend', 'insert', 'pop', 'remove', 'sort', 'reverse', 'index', 'count', 'copy', 'clear',
    'join', 'split', 'strip', 'lstrip', 'rstrip', 'replace', 'lower', 'upper', 'title', 'capitalize',
    'startswith', 'endswith', 'find', 'format', 'isdigit', 'isalpha', 'isalnum', 'keys', 'values',
    'items', 'get', 'update', 'setdefault', 'add', 'discard', 'union', 'intersection', 'difference',
  ],
  snippets: [
    snip('def function', 'def $0():\n\tpass', 'function'),
    snip('for loop', 'for $0 in :\n\t'),
    snip('for range', 'for i in range($0):\n\t'),
    snip('if statement', 'if $0:\n\t'),
    snip('if / else', 'if $0:\n\t\nelse:\n\t'),
    snip('while loop', 'while $0:\n\t'),
    snip('class definition', 'class $0:\n\tdef __init__(self):\n\t\tpass', 'class'),
    snip('try / except', 'try:\n\t$0\nexcept Exception as e:\n\tprint(e)'),
    snip('list comprehension', '[$0 for x in ]'),
    snip('with open', 'with open($0) as f:\n\t'),
  ],
};

const JS_KEYWORDS = [
  'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'delete', 'do',
  'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
  'new', 'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'while',
  'yield', 'true', 'false', 'null', 'undefined',
];

const JS_GLOBALS = [
  'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Promise', 'Map',
  'Set', 'RegExp', 'Error', 'parseInt', 'parseFloat', 'isNaN', 'setTimeout', 'setInterval',
  'clearTimeout', 'Symbol', 'NaN', 'Infinity',
];

const JS_MEMBERS = [
  'log', 'error', 'warn', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'some', 'every',
  'includes', 'indexOf', 'slice', 'splice', 'push', 'pop', 'shift', 'unshift', 'concat', 'join', 'split',
  'sort', 'reverse', 'flat', 'flatMap', 'fill', 'length', 'keys', 'values', 'entries', 'assign', 'freeze',
  'toString', 'toUpperCase', 'toLowerCase', 'trim', 'replace', 'replaceAll', 'padStart', 'padEnd',
  'startsWith', 'endsWith', 'charAt', 'substring', 'repeat', 'floor', 'ceil', 'round', 'max', 'min', 'abs',
  'random', 'sqrt', 'pow', 'stringify', 'parse', 'isArray', 'from', 'then', 'catch', 'finally', 'resolve',
  'get', 'set', 'has', 'add', 'delete', 'clear', 'size', 'toFixed',
];

const JAVASCRIPT: LanguageCompletions = {
  keywords: JS_KEYWORDS,
  globals: JS_GLOBALS,
  members: JS_MEMBERS,
  snippets: [
    snip('function declaration', 'function $0() {\n\t\n}', 'function'),
    snip('arrow function', 'const $0 = () => {\n\t\n};', 'function'),
    snip('for loop', 'for (let i = 0; i < $0; i++) {\n\t\n}'),
    snip('for of', 'for (const $0 of ) {\n\t\n}'),
    snip('if statement', 'if ($0) {\n\t\n}'),
    snip('if / else', 'if ($0) {\n\t\n} else {\n\t\n}'),
    snip('try / catch', 'try {\n\t$0\n} catch (error) {\n\tconsole.error(error);\n}'),
    snip('console.log', 'console.log($0);'),
    snip('class definition', 'class $0 {\n\tconstructor() {\n\t\t\n\t}\n}', 'class'),
  ],
};

const TYPESCRIPT: LanguageCompletions = {
  keywords: [...JS_KEYWORDS, 'interface', 'type', 'enum', 'implements', 'readonly', 'public', 'private', 'protected', 'abstract', 'declare', 'namespace', 'keyof', 'as', 'is', 'satisfies'],
  globals: JS_GLOBALS,
  members: JS_MEMBERS,
  types: ['string', 'number', 'boolean', 'void', 'unknown', 'any', 'never', 'object', 'Record', 'Partial', 'Required', 'Readonly', 'Pick', 'Omit', 'ReturnType', 'Array', 'Promise'],
  snippets: [
    ...JAVASCRIPT.snippets.filter((s) => s.label !== 'function declaration'),
    snip('function declaration', 'function $0(): void {\n\t\n}', 'function'),
    snip('interface', 'interface $0 {\n\t\n}', 'type'),
    snip('type alias', 'type $0 = ;', 'type'),
    snip('enum', 'enum $0 {\n\t\n}', 'type'),
  ],
};

const GO: LanguageCompletions = {
  keywords: [
    'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'func',
    'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select', 'struct',
    'switch', 'type', 'var', 'true', 'false', 'nil',
  ],
  globals: ['fmt', 'strings', 'strconv', 'sort', 'errors', 'math', 'os', 'len', 'cap', 'append', 'make', 'new', 'copy', 'delete', 'panic', 'recover', 'print', 'println'],
  members: [
    'Println', 'Printf', 'Sprintf', 'Sprint', 'Errorf', 'Atoi', 'Itoa', 'ParseInt', 'ParseFloat', 'Join',
    'Split', 'Contains', 'HasPrefix', 'HasSuffix', 'ToUpper', 'ToLower', 'TrimSpace', 'Trim', 'Repeat',
    'Replace', 'Fields', 'Index', 'Ints', 'Strings', 'Slice', 'Sort', 'New', 'Sqrt', 'Pow', 'Abs', 'Floor',
    'Max', 'Min',
  ],
  types: ['int', 'int64', 'int32', 'uint', 'float64', 'float32', 'string', 'bool', 'byte', 'rune', 'error', 'any'],
  snippets: [
    snip('func', 'func $0() {\n\t\n}', 'function'),
    snip('func with return', 'func $0() int {\n\treturn 0\n}', 'function'),
    snip('for loop', 'for i := 0; i < $0; i++ {\n\t\n}'),
    snip('for range', 'for i, v := range $0 {\n\t\n}'),
    snip('if statement', 'if $0 {\n\t\n}'),
    snip('if err != nil', 'if err != nil {\n\t$0\n}'),
    snip('switch', 'switch $0 {\ncase :\n\t\ndefault:\n\t\n}'),
    snip('struct', 'type $0 struct {\n\t\n}', 'type'),
    snip('map', 'map[string]int{$0}'),
  ],
};

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'AS', 'JOIN',
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL',
  'IS NOT NULL', 'ASC', 'DESC', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'INSERT INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'EXISTS',
];

const SQL: LanguageCompletions = {
  keywords: SQL_KEYWORDS,
  globals: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'UPPER', 'LOWER', 'LENGTH', 'COALESCE'],
  members: [],
  snippets: [
    snip('select all', 'SELECT * FROM $0;'),
    snip('select where', 'SELECT $0\nFROM \nWHERE ;'),
    snip('group by', 'SELECT $0, COUNT(*)\nFROM \nGROUP BY ;'),
    snip('join', 'SELECT $0\nFROM a\nJOIN b ON a.id = b.id;'),
  ],
};

/** Table and column names of the in-memory database the SQL runner queries. */
function sqlSchemaWords(): Suggestion[] {
  const words: Suggestion[] = [];
  const columns = new Set<string>();
  for (const [table, rows] of Object.entries(sqlDatabase)) {
    words.push({ label: table, insertText: table, kind: 'table', detail: 'table' });
    for (const column of Object.keys(rows[0] ?? {})) columns.add(column);
  }
  for (const column of columns) words.push({ label: column, insertText: column, kind: 'column', detail: 'column' });
  return words;
}

const COMPLETIONS: Record<LanguageId, LanguageCompletions> = {
  python: PYTHON,
  javascript: JAVASCRIPT,
  typescript: TYPESCRIPT,
  go: GO,
  sql: { ...SQL, extraWords: sqlSchemaWords() },
};

export const getCompletions = (language: LanguageId): LanguageCompletions => COMPLETIONS[language];

/** One indentation step used when a snippet spans several lines. */
export const indentUnitFor = (language: LanguageId): string => (language === 'python' ? '    ' : '  ');
