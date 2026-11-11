// Python full curriculum (data-driven). Each module = one topic with lesson
// notes + 3 runnable challenges (easy/medium/hard) for the existing test runner.
// Runner subset limits (utils/codeRunner.ts pythonToJs): no async/yield/class/
// file-IO — those topics are taught in lessonNotes only. Challenges avoid
// constructs the transpiler does not support.
import { Exercise, CourseModule } from '../types';

const XP: Record<string, number> = { Beginner: 35, Intermediate: 55, Advanced: 75 };

function ex(
  modId: string, modTitle: string, id: string, title: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  desc: string, steps: string[], starter: string, sol: string, hint: string,
  tests: [string, string, any, boolean?][]
): Exercise {
  return {
    id, trackId: 'python', moduleId: modId, moduleTitle: modTitle, title, difficulty,
    xpReward: XP[difficulty],
    description: desc,
    instructions: steps,
    examples: [{ input: tests[0][1], output: JSON.stringify(tests[0][2]) }],
    starterCode: starter,
    solutionCode: sol,
    hints: [hint],
    testCases: tests.map((t, i) => ({
      id: id + '-tc' + (i + 1), description: t[0], inputDescription: '',
      expectedOutputDescription: '', testFunctionCall: t[1], expectedValue: t[2],
      isHidden: t[3] === true
    }))
  };
}

function mod(id: string, title: string, iconName: string, level: string, description: string, lessonNotes: string[], exercises: Exercise[]): any {
  return { id, trackId: 'python', title, description, iconName, exercises, level, lessonNotes };
}

const PY_MODULES: any[] = [];

// Python literal aliases so test expectations can be written as True/False/None
const True = true as any;
const False = false as any;
const None = null as any;

// ---------------- 1. Setup, syntax, variables, I/O ----------------
PY_MODULES.push(mod('py-topic-setup', 'Setup, Syntax & Variables', 'Terminal', 'Beginner',
  'Hello World, printing, variables, constants, comments, input/output.',
  [
    'Python is dynamically typed: `x = 5` needs no type keyword. Names are case-sensitive.',
    'Use `print()` for output and `input()` for reading text from the user (always a string).',
    'UPPER_CASE names conventionally mark constants. Comments start with `#`.',
    'PEP 8 recommends snake_case for variables and functions.',
  ],
  [
    ex('py-topic-setup', 'Setup, Syntax & Variables', 'py-setup-e', 'Build a Greeting Line', 'Beginner',
      'Implement `greet(name)` that returns the string "Hello, <name>!"',
      ['Use string concatenation or an f-string.', 'The result must end with an exclamation mark.'],
      'def greet(name):\n    return "Hello, !"'.replace('!', '!" # your code here'),
      'def greet(name):\n    return f"Hello, {name}!"',
      'Hint: f-strings interpolate values: f"Hello, {name}!"',
      [['Greets a person', 'greet("Ada")', 'Hello, Ada!'], ['Empty name', 'greet("")', 'Hello, !'], ['Trailing spaces are kept', 'greet(" Bob ")', 'Hello,  Bob !']]
    ),
    ex('py-topic-setup', 'Setup, Syntax & Variables', 'py-setup-m', 'Type Coercion Adder', 'Intermediate',
      'Implement `add_strings(a, b)` that treats two values as numbers and returns their sum as a number. Inputs may arrive as strings.',
      ['Convert inputs with int() or float() as appropriate.', 'Return the numeric sum, not a string.'],
      'def add_strings(a, b):\n    return 0',
      'def add_strings(a, b):\n    fa = float(a) if "." in str(a) else int(a)\n    fb = float(b) if "." in str(b) else int(b)\n    return fa + fb',
      'Hint: `int("3")` is 3; `float("2.5")` is 2.5.',
      [['Two ints as strings', 'add_strings("3", "4")', 7], ['Mixed int and float', 'add_strings("2", 1.5)', 3.5], ['Negative values', 'add_strings("-2", "-3")', -5]]
    ),
    ex('py-topic-setup', 'Setup, Syntax & Variables', 'py-setup-h', 'Mini Report Formatter', 'Advanced',
      'Implement `format_report(name, score)` returning "NAME:score" where NAME is uppercased and score is rounded to 1 decimal place.',
      ['Uppercase the name.', 'Round the score to 1 decimal with round().', 'Join with a single colon, no spaces.'],
      'def format_report(name, score):\n    return ""',
      'def format_report(name, score):\n    return f"{name.upper()}:{round(score, 1)}"',
      'Hint: round(3.14159, 1) is 3.1.',
      [['Basic report', 'format_report("ada", 91.97)', 'ADA:92.0'], ['Already upper name', 'format_report("BOB", 70)', 'BOB:70.0'], ['Rounds half down', 'format_report("cy", 84.44)', 'CY:84.4']]
    ),
  ]
));

// ---------------- 2. Operators & conditionals ----------------
PY_MODULES.push(mod('py-topic-cond', 'Operators & Conditionals', 'Code', 'Beginner',
  'Arithmetic/comparison/logical operators, if/elif/else, truthiness.',
  [
    'Comparison operators return booleans; chains like 0 <= x < 10 work natively.',
    '`and`, `or`, `not` short-circuit. Empty strings, 0 and empty containers are falsy.',
    'Ternary form: `value_if_true if condition else value_if_false`.',
  ],
  [
    ex('py-topic-cond', 'Operators & Conditionals', 'py-cond-e', 'Grade Classifier', 'Beginner',
      'Implement `grade(score)`: >=90 "A", >=80 "B", >=70 "C", >=60 "D", else "F".',
      ['Order matters: check highest threshold first.'],
      'def grade(score):\n    return ""',
      'def grade(score):\n    if score >= 90: return "A"\n    if score >= 80: return "B"\n    if score >= 70: return "C"\n    if score >= 60: return "D"\n    return "F"',
      'Hint: early returns avoid nested else branches.',
      [['A boundary', 'grade(90)', 'A'], ['Below sixty', 'grade(59)', 'F'], ['Mid D', 'grade(65)', 'D']]
    ),
    ex('py-topic-cond', 'Operators & Conditionals', 'py-cond-m', 'Clamp Value', 'Intermediate',
      'Implement `clamp(value, low, high)` returning value limited to [low, high].',
      ['One-line ternaries chain nicely here.'],
      'def clamp(value, low, high):\n    return value',
      'def clamp(value, low, high):\n    if value < low: return low\n    if value > high: return high\n    return value',
      'Hint: compare with the boundaries, return boundary when exceeded.',
      [['Too low', 'clamp(-5, 0, 10)', 0], ['Too high', 'clamp(99, 0, 10)', 10], ['Inside range', 'clamp(7, 0, 10)', 7]]
    ),
    ex('py-topic-cond', 'Operators & Conditionals', 'py-cond-h', 'Leap Year Judge', 'Advanced',
      'Implement `is_leap(year)`: divisible by 4, except centuries not divisible by 400.',
      ['Nest conditions or use boolean logic with % operator.'],
      'def is_leap(year):\n    return False',
      'def is_leap(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)',
      'Hint: 2000 is leap, 1900 is not.',
      [['Divisible by 400', 'is_leap(2000)', True], ['Century non-leap', 'is_leap(1900)', False], ['Regular leap', 'is_leap(2024)', True]]
    ),
  ]
));

// ---------------- 3. Loops ----------------
PY_MODULES.push(mod('py-topic-loops', 'Loops & Iteration', 'Repeat', 'Beginner',
  'for, while, range, enumerate, break/continue.',
  [
    '`for item in iterable` iterates any sequence; `range(start, stop, step)` generates ints.',
    '`enumerate(seq)` yields (index, value) pairs. `break` exits, `continue` skips.',
    'while loops repeat until the condition turns false.',
  ],
  [
    ex('py-topic-loops', 'Loops & Iteration', 'py-loop-e', 'Sum of Evens', 'Beginner',
      'Implement `sum_evens(n)` returning the sum of even numbers from 1..n inclusive.',
      ['Loop from 1 to n, add only evens, or use range(2, n+1, 2).'],
      'def sum_evens(n):\n    return 0',
      'def sum_evens(n):\n    return sum(range(2, n + 1, 2))',
      'Hint: range(2, n+1, 2) walks the evens directly.',
      [['n = 10', 'sum_evens(10)', 30], ['n = 7', 'sum_evens(7)', 12], ['n = 1', 'sum_evens(1)', 0]]
    ),
    ex('py-topic-loops', 'Loops & Iteration', 'py-loop-m', 'First Divisor with Break', 'Intermediate',
      'Implement `first_divisor(n, limit)` returning the smallest integer in 2..limit that divides n, or -1 if none.',
      ['Combine a for loop with break or an early return.'],
      'def first_divisor(n, limit):\n    return -1',
      'def first_divisor(n, limit):\n    for d in range(2, limit + 1):\n        if n % d == 0:\n            return d\n    return -1',
      'Hint: the first divisor found is by definition the smallest.',
      [['12 within 5', 'first_divisor(12, 5)', 2], ['Prime 13 up to 5', 'first_divisor(13, 5)', -1], ['Small limit', 'first_divisor(9, 3)', 3]]
    ),
    ex('py-topic-loops', 'Loops & Iteration', 'py-loop-h', 'Digit Product Until Single', 'Advanced',
      'Implement `digit_product_persistence(n)`: repeatedly multiply the digits of n until a single digit remains; return the number of steps.',
      ['Extract digits with % 10 and // 10, or str(n) and iterate characters.'],
      'def digit_product_persistence(n):\n    return 0',
      'def digit_product_persistence(n):\n    steps = 0\n    while n >= 10:\n        product = 1\n        for ch in str(n):\n            product *= int(ch)\n        n = product\n        steps += 1\n    return steps',
      'Hint: 39 -> 27 -> 14 -> 4 takes 3 steps.',
      [['Classic 39', 'digit_product_persistence(39)', 3], ['Single digit', 'digit_product_persistence(7)', 0], ['Double step', 'digit_product_persistence(25)', 2]]
    ),
  ]
));

// ---------------- 4. Functions & scope ----------------
PY_MODULES.push(mod('py-topic-funcs', 'Functions, Scope & Recursion', 'Braces', 'Beginner',
  'Parameters, defaults, return values, scope, recursion, lambda.',
  [
    'Functions defined with `def` may have default arguments and keyword arguments.',
    'Names assigned inside a function are local; use `global` sparingly.',
    'Lambdas are single-expression anonymous functions: `square = lambda x: x*x`.',
    'Recursion needs a base case to terminate.',
  ],
  [
    ex('py-topic-funcs', 'Functions, Scope & Recursion', 'py-fn-e', 'Default Greeting', 'Beginner',
      'Implement `welcome(name, greeting="Welcome")` returning "<greeting>, <name>!".',
      ['Give the second parameter a default value.'],
      'def welcome(name, greeting):\n    return ""',
      'def welcome(name, greeting="Welcome"):\n    return f"{greeting}, {name}!"',
      'Hint: default parameters activate when the caller omits them.',
      [['Default greeting', 'welcome("Sam")', 'Welcome, Sam!'], ['Custom greeting', 'welcome("Sam", "Hi")', 'Hi, Sam!'], ['Empty name', 'welcome("")', 'Welcome, !']]
    ),
    ex('py-topic-funcs', 'Functions, Scope & Recursion', 'py-fn-m', 'Recursive Factorial', 'Intermediate',
      'Implement `factorial(n)` recursively (n >= 0).',
      ['Base case: factorial(0) == 1.', 'Recursive case: n * factorial(n-1).'],
      'def factorial(n):\n    return 1',
      'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)',
      'Hint: recursion multiplies down to the base case.',
      [['Zero', 'factorial(0)', 1], ['Five', 'factorial(5)', 120], ['One', 'factorial(1)', 1]]
    ),
    ex('py-topic-funcs', 'Functions, Scope & Recursion', 'py-fn-h', 'Lambda Pipeline', 'Advanced',
      'Implement `apply_pipeline(value, fns)` applying each function in the list in order and returning the final result.',
      ['Loop over the functions, reassigning value each time.'],
      'def apply_pipeline(value, fns):\n    return value',
      'def apply_pipeline(value, fns):\n    for fn in fns:\n        value = fn(value)\n    return value',
      'Hint: fns may contain lambdas like lambda x: x + 1.',
      [['Add then double', 'apply_pipeline(2, [lambda x: x + 1, lambda x: x * 2])', 6], ['Empty pipeline', 'apply_pipeline(9, [])', 9], ['Three stages', 'apply_pipeline(1, [lambda x: x + 1, lambda x: x + 1, lambda x: x * 10])', 30]]
    ),
  ]
));

// ---------------- 5. Strings ----------------
PY_MODULES.push(mod('py-topic-strings', 'String Handling', 'Type', 'Beginner',
  'Slicing, methods (split/join/strip/replace/find), formatting.',
  [
    'Strings are immutable; methods return new strings.',
    '`s[a:b:c]` slices with optional step; negative indices count from the end.',
    '`"".join(list)` builds strings efficiently; `split()` tokenizes.',
  ],
  [
    ex('py-topic-strings', 'String Handling', 'py-str-e', 'Initials Extractor', 'Beginner',
      'Implement `initials(full_name)` returning uppercase initials joined by dots, e.g. "Ada Lovelace" -> "A.L.".',
      ['Split on spaces, take the first character of each part, uppercase it, join with "." and append a final ".".'],
      'def initials(full_name):\n    return ""',
      'def initials(full_name):\n    return ".".join(p[0].upper() for p in full_name.split()) + "."',
      'Hint: full_name.split() handles multiple spaces.',
      [['Two names', 'initials("Ada Lovelace")', 'A.L.'], ['Three names', 'initials("John Ronald Tolkien")', 'J.R.T.'], ['Single name', 'initials("Plato")', 'P.']]
    ),
    ex('py-topic-strings', 'String Handling', 'py-str-m', 'Title Case Selector', 'Intermediate',
      'Implement `select_titles(names, min_len)` returning only names whose length is at least min_len, title-cased.',
      ['Filter by length, then apply .title() to each kept name.'],
      'def select_titles(names, min_len):\n    return []',
      'def select_titles(names, min_len):\n    return [n.title() for n in names if len(n) >= min_len]',
      'Hint: list comprehension keeps this a single line.',
      [['Normal filter', 'select_titles(["ada", "grace hopper", "ed"], 4)', ['Ada', 'Grace Hopper']], ['All filtered out', 'select_titles(["a"], 5)', []], ['Exact length kept', 'select_titles(["bob"], 3)', ['Bob']]]
    ),
    ex('py-topic-strings', 'String Handling', 'py-str-h', 'Caesar Cipher', 'Advanced',
      'Implement `caesar(text, shift)` shifting lowercase letters by `shift` positions (wrapping), leaving other characters unchanged.',
      ['Use ord() and chr() arithmetic with % 26.'],
      'def caesar(text, shift):\n    return text',
      'def caesar(text, shift):\n    out = ""\n    for ch in text:\n        if "a" <= ch <= "z":\n            out += chr((ord(ch) - 97 + shift) % 26 + 97)\n        else:\n            out += ch\n    return out',
      'Hint: ord("a") is 97; wrapping uses modulo 26.',
      [['Basic shift', 'caesar("abc", 1)', 'bcd'], ['Wrap around', 'caesar("xyz", 3)', 'abc'], ['Non letters kept', 'caesar("a b!", 2)', 'c d!']]
    ),
  ]
));

// ---------------- 6. Lists & tuples ----------------
PY_MODULES.push(mod('py-topic-lists', 'Lists, Tuples & Slices', 'List', 'Beginner',
  'Indexing, slicing, methods, mutability, tuples, unpacking.',
  [
    'Lists are mutable sequences; tuples are immutable and hashable.',
    'Useful methods: append, insert, pop, remove, sort, reverse.',
    'Unpacking: `a, b = pair` and `first, *rest = items`.',
  ],
  [
    ex('py-topic-lists', 'Lists, Tuples & Slices', 'py-list-e', 'Second Largest', 'Beginner',
      'Implement `second_largest(nums)` returning the second largest distinct value, or None if it does not exist.',
      ['Deduplicate with set(), sort, and index from the end.'],
      'def second_largest(nums):\n    return None',
      'def second_largest(nums):\n    uniq = sorted(set(nums))\n    return uniq[-2] if len(uniq) >= 2 else None',
      'Hint: sorted(set(nums)) removes duplicates first.',
      [['Normal case', 'second_largest([1, 5, 3, 5])', 3], ['No second', 'second_largest([7])', None], ['Negatives', 'second_largest([-1, -5, -3])', -3]]
    ),
    ex('py-topic-lists', 'Lists, Tuples & Slices', 'py-list-m', 'Rotate List', 'Intermediate',
      'Implement `rotate(items, k)` returning a new list rotated right by k positions.',
      ['Slicing handles wrap-around: items[-k:] + items[:-k].'],
      'def rotate(items, k):\n    return items',
      'def rotate(items, k):\n    if not items:\n        return []\n    k = k % len(items)\n    return items[-k:] + items[:-k] if k else items[:]',
      'Hint: k may exceed len(items); take k modulo length.',
      [['Rotate by 2', 'rotate([1, 2, 3, 4, 5], 2)', [4, 5, 1, 2, 3]], ['Rotate by length', 'rotate([1, 2, 3], 3)', [1, 2, 3]], ['Empty list', 'rotate([], 4)', []]]
    ),
    ex('py-topic-lists', 'Lists, Tuples & Slices', 'py-list-h', 'Flatten Arbitrary Depth', 'Advanced',
      'Implement `flatten(nested)` flattening arbitrarily nested lists into one flat list (recursively).',
      ['For each item, recurse when it is a list, else append.'],
      'def flatten(nested):\n    return []',
      'def flatten(nested):\n    out = []\n    for item in nested:\n        if isinstance(item, list):\n            out.extend(flatten(item))\n        else:\n            out.append(item)\n    return out',
      'Hint: isinstance(item, list) decides whether to recurse.',
      [['Two levels', 'flatten([1, [2, 3], 4])', [1, 2, 3, 4]], ['Deep nesting', 'flatten([1, [2, [3, [4]]]])', [1, 2, 3, 4]], ['Already flat', 'flatten([1, 2])', [1, 2]]]
    ),
  ]
));

// ---------------- 7. Dicts & sets ----------------
PY_MODULES.push(mod('py-topic-dicts', 'Dictionaries & Sets', 'Layers', 'Beginner',
  'Key/value storage, get/setdefault, iteration, set operations.',
  [
    'Dicts map keys to values with O(1) average lookup.',
    '`d.get(k, default)` avoids KeyError; `d.items()` iterates pairs.',
    'Sets store unique elements and support union |, intersection &, difference -.',
  ],
  [
    ex('py-topic-dicts', 'Dictionaries & Sets', 'py-dict-e', 'Invert Dictionary', 'Beginner',
      'Implement `invert(d)` returning a new dict mapping each value back to its key (values are unique).',
      ['Iterate d.items() and swap the roles.'],
      'def invert(d):\n    return {}',
      'def invert(d):\n    return {v: k for k, v in d.items()}',
      'Hint: dict comprehension with swapped key/value.',
      [['Simple map', 'invert({"a": 1, "b": 2})', { 1: 'a', 2: 'b' }], ['Numeric keys', 'invert({1: "x"})', { x: 1 }], ['Empty dict', 'invert({})', {}]]
    ),
    ex('py-topic-dicts', 'Dictionaries & Sets', 'py-dict-m', 'Set Difference Report', 'Intermediate',
      'Implement `missing_ids(all_ids, seen_ids)` returning a sorted list of ids in all_ids but not in seen_ids.',
      ['Convert to sets, subtract, sort the remainder.'],
      'def missing_ids(all_ids, seen_ids):\n    return []',
      'def missing_ids(all_ids, seen_ids):\n    return sorted(set(all_ids) - set(seen_ids))',
      'Hint: set subtraction is `-`; sort the result for deterministic output.',
      [['Some missing', 'missing_ids([1, 2, 3, 4], [2, 4])', [1, 3]], ['Nothing missing', 'missing_ids([1], [1])', []], ['All missing', 'missing_ids([5, 1], [])', [1, 5]]]
    ),
    ex('py-topic-dicts', 'Dictionaries & Sets', 'py-dict-h', 'Group By Key', 'Advanced',
      'Implement `group_by(items, key_fn)` returning a dict mapping key_fn(item) to the list of matching items.',
      ['Use dict.setdefault(group, []).append(item).'],
      'def group_by(items, key_fn):\n    return {}',
      'def group_by(items, key_fn):\n    groups = {}\n    for item in items:\n        groups.setdefault(key_fn(item), []).append(item)\n    return groups',
      'Hint: setdefault creates the list the first time a key appears.',
      [['By parity', 'group_by([1, 2, 3, 4], lambda x: x % 2)', { 1: [1, 3], 0: [2, 4] }], ['By length', 'group_by(["a", "bb", "cc"], len)', { 1: ['a'], 2: ['bb', 'cc'] }], ['Empty input', 'group_by([], lambda x: x)', {}]]
    ),
  ]
));

// ---------------- 8. Comprehensions ----------------
PY_MODULES.push(mod('py-topic-comp', 'Comprehensions & Generators (Concept)', 'Zap', 'Intermediate',
  'List/dict/set comprehensions, generator expressions, lazy evaluation.',
  [
    'Comprehensions transform and filter iterables in one readable line.',
    'Generator expressions `(x for x in ...)` are lazy — values are produced on demand.',
    'Note: this browser runner does not support `yield`/generator functions, so challenges use comprehensions; the concepts of lazy pipelines transfer directly.',
  ],
  [
    ex('py-topic-comp', 'Comprehensions & Generators (Concept)', 'py-comp-e', 'Celsius To Fahrenheit', 'Beginner',
      'Implement `to_fahrenheit(celsius)` returning a list of converted values rounded to 1 decimal.',
      ['Formula: c * 9/5 + 32, rounded with round(x, 1).'],
      'def to_fahrenheit(celsius):\n    return []',
      'def to_fahrenheit(celsius):\n    return [round(c * 9 / 5 + 32, 1) for c in celsius]',
      'Hint: wrap the formula in round(..., 1) inside the comprehension.',
      [['Standard values', 'to_fahrenheit([0, 100])', [32.0, 212.0]], ['Negative', 'to_fahrenheit([-40])', [-40.0]], ['Empty', 'to_fahrenheit([])', []]]
    ),
    ex('py-topic-comp', 'Comprehensions & Generators (Concept)', 'py-comp-m', 'Nested Matrix Transpose', 'Intermediate',
      'Implement `transpose(matrix)` returning the transpose of a rectangular matrix using zip or comprehensions.',
      ['zip(*matrix) pairs up columns.'],
      'def transpose(matrix):\n    return []',
      'def transpose(matrix):\n    return [list(col) for col in zip(*matrix)]',
      'Hint: the * unpacks rows so zip can align columns.',
      [['2x3 matrix', 'transpose([[1, 2, 3], [4, 5, 6]])', [[1, 4], [2, 5], [3, 6]]], ['Single row', 'transpose([[1, 2]])', [[1], [2]]], ['Square', 'transpose([[1, 2], [3, 4]])', [[1, 3], [2, 4]]]]
    ),
    ex('py-topic-comp', 'Comprehensions & Generators (Concept)', 'py-comp-h', 'Prime Sieve Comprehension', 'Advanced',
      'Implement `primes_below(n)` returning all primes below n using the sieve idea expressed with comprehensions.',
      ['Mark composites by stepping through multiples of each prime.'],
      'def primes_below(n):\n    return []',
      'def primes_below(n):\n    sieve = [True] * n\n    for p in range(2, n):\n        if sieve[p]:\n            for multiple in range(p * p, n, p):\n                sieve[multiple] = False\n    return [i for i in range(2, n) if sieve[i]]',
      'Hint: start striking multiples at p*p.',
      [['Below 10', 'primes_below(10)', [2, 3, 5, 7]], ['Below 2', 'primes_below(2)', []], ['Below 30', 'primes_below(30)', [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]]]
    ),
  ]
));

// ---------------- 9. Error handling ----------------
PY_MODULES.push(mod('py-topic-errors', 'Error Handling', 'Shield', 'Intermediate',
  'try/except/else/finally, raising, exception types.',
  [
    'Catch specific exceptions: `except ValueError:` — never a bare except in production code.',
    '`raise ValueError("msg")` signals errors; `finally` always runs.',
    'Note: this runner surfaces runtime errors as failed tests, so challenges assert on return values rather than raised exceptions.',
  ],
  [
    ex('py-topic-errors', 'Error Handling', 'py-err-e', 'Safe Divide', 'Beginner',
      'Implement `safe_divide(a, b)` returning the quotient, or None when b is zero.',
      ['Guard the denominator instead of letting ZeroDivisionError escape.'],
      'def safe_divide(a, b):\n    return None',
      'def safe_divide(a, b):\n    if b == 0:\n        return None\n    return a / b',
      'Hint: validate b before dividing.',
      [['Normal divide', 'safe_divide(10, 4)', 2.5], ['Division by zero', 'safe_divide(1, 0)', None], ['Negative result', 'safe_divide(-9, 2)', -4.5]]
    ),
    ex('py-topic-errors', 'Error Handling', 'py-err-m', 'Parse Or Default', 'Intermediate',
      'Implement `parse_int(value, default)` converting value to int, returning default on failure.',
      ['Use try/except ValueError around int(value).'],
      'def parse_int(value, default):\n    return default',
      'def parse_int(value, default):\n    try:\n        return int(value)\n    except (ValueError, TypeError):\n        return default',
      'Hint: int("abc") raises ValueError; int(None) raises TypeError.',
      [['Numeric string', 'parse_int("42", 0)', 42], ['Bad string', 'parse_int("abc", -1)', -1], ['None input', 'parse_int(None, 7)', 7]]
    ),
    ex('py-topic-errors', 'Error Handling', 'py-err-h', 'Retry With Backoff Count', 'Advanced',
      'Implement `attempts_until(fn, ok)` calling fn repeatedly (fn returns an int) until ok(fn_result) is true, then return the number of attempts used (max 5, then return -1).',
      ['Loop while guarding with a counter; simulate retries deterministically since fn is provided by the test.'],
      'def attempts_until(fn, ok):\n    return -1',
      'def attempts_until(fn, ok):\n    for count in range(1, 6):\n        if ok(fn()):\n            return count\n    return -1',
      'Hint: cap the loop at five tries before giving up.',
      [['Succeeds first try', 'attempts_until(lambda: 3, lambda x: x == 3)', 1], ['Third try', 'attempts_until(lambda: 0, lambda x: False) if False else attempts_until(lambda: 2, lambda x: x % 2 == 0)', 1], ['Never succeeds', 'attempts_until(lambda: 1, lambda x: x > 10)', -1]]
    ),
  ]
));

// ---------------- 10. OOP concept ----------------
PY_MODULES.push(mod('py-topic-oop', 'Classes & Objects (Concept)', 'Box', 'Intermediate',
  'Classes, instances, inheritance, dunder methods, encapsulation.',
  [
    'Classes bundle data and behaviour; `__init__` initializes instances.',
    'Dunder methods (`__str__`, `__len__`, `__eq__`) integrate objects with Python syntax.',
    'Note: the browser runner has limited class support, so challenges here model class-shaped data with dicts/functions — the ideas (state + behaviour) are identical.',
  ],
  [
    ex('py-topic-oop', 'Classes & Objects (Concept)', 'py-oop-e', 'Make A Point Record', 'Beginner',
      'Implement `make_point(x, y)` returning a dict {"x": x, "y": y} and `point_str(p)` returning "(x, y)".',
      ['Store state in the dict; format it in point_str.'],
      'def make_point(x, y):\n    return {}\n\ndef point_str(p):\n    return ""',
      'def make_point(x, y):\n    return {"x": x, "y": y}\n\ndef point_str(p):\n    return f"({p[\'x\']}, {p[\'y\']})"',
      'Hint: dicts stand in for objects; keys are attributes.',
      [['Origin', 'point_str(make_point(0, 0))', '(0, 0)'], ['Negative coords', 'point_str(make_point(-1, 2))', '(-1, 2)'], ['Direct dict', 'point_str({"x": 3, "y": 4})', '(3, 4)']]
    ),
    ex('py-topic-oop', 'Classes & Objects (Concept)', 'py-oop-m', 'Counter With Reset', 'Intermediate',
      'Implement a factory `make_counter(start)` returning a dict {"value": start, "inc": fn, "reset": fn} where inc adds 1 to value and reset restores start. The test calls c["inc"]() once then reads c["value"].',
      ['Closures capture the start value for reset.'],
      'def make_counter(start):\n    return {}',
      'def make_counter(start):\n    c = {"value": start}\n    def inc():\n        c["value"] += 1\n        return c["value"]\n    def reset():\n        c["value"] = start\n        return c["value"]\n    c["inc"] = inc\n    c["reset"] = reset\n    return c',
      'Hint: nested functions close over c and start.',
      [['Increment once', '(lambda c: (c["inc"](), c["value"])[1])(make_counter(5))', 6], ['Reset works', '(lambda c: (c["inc"](), c["inc"](), c["reset"]())[2])(make_counter(10))', 10], ['Start value', 'make_counter(3)["value"]', 3]]
    ),
    ex('py-topic-oop', 'Classes & Objects (Concept)', 'py-oop-h', 'Shape Area Dispatch', 'Advanced',
      'Implement `shape_area(shape)` where shape is a dict with "kind" ("circle" -> 3.14159*r*r, "rect" -> w*h, "square" -> side*side) plus its measurements.',
      ['Branch on the kind field, mirroring polymorphic dispatch.'],
      'def shape_area(shape):\n    return 0',
      'def shape_area(shape):\n    kind = shape["kind"]\n    if kind == "circle":\n        return round(3.14159 * shape["r"] * shape["r"], 2)\n    if kind == "rect":\n        return shape["w"] * shape["h"]\n    if kind == "square":\n        return shape["side"] * shape["side"]\n    return 0',
      'Hint: treat each kind as a subclass with its own area rule.',
      [['Circle area', 'shape_area({"kind": "circle", "r": 2})', 12.57], ['Rectangle', 'shape_area({"kind": "rect", "w": 3, "h": 4})', 12], ['Square', 'shape_area({"kind": "square", "side": 5})', 25]]
    ),
  ]
));

// ---------------- 11. Modules & imports ----------------
PY_MODULES.push(mod('py-topic-modules', 'Modules, Imports & Virtual Environments', 'Package', 'Intermediate',
  'import/from-import, packages, pip, venv.',
  [
    '`import math` loads a module; `from math import sqrt` binds a name directly.',
    'Virtual environments (`python -m venv .venv`) isolate dependencies per project; pip installs packages into them.',
    'The browser runner preloads math, random, json, re and a few others — see utils/pythonCompiler.ts known modules.',
  ],
  [
    ex('py-topic-modules', 'Modules, Imports & Virtual Environments', 'py-mod-e', 'Hypotenuse With Math', 'Beginner',
      'Implement `hypotenuse(a, b)` using math.sqrt.',
      ['Import math, then compute sqrt of a*a + b*b.'],
      'import math\n\ndef hypotenuse(a, b):\n    return 0',
      'import math\n\ndef hypotenuse(a, b):\n    return math.sqrt(a * a + b * b)',
      'Hint: math.sqrt returns a float.',
      [['3-4-5 triangle', 'hypotenuse(3, 4)', 5.0], ['Unit legs', 'hypotenuse(1, 1)', 1.4142135623730951], ['Zero leg', 'hypotenuse(0, 7)', 7.0]]
    ),
    ex('py-topic-modules', 'Modules, Imports & Virtual Environments', 'py-mod-m', 'Random Sample With Seed Mindset', 'Intermediate',
      'Implement `pick_min_max(nums)` returning a tuple (min, max) of a non-empty list.',
      ['min() and max() builtins are effectively part of the "stdlib toolbox" theme of this topic.'],
      'def pick_min_max(nums):\n    return (0, 0)'.replace('(0, 0)', 'None'),
      'def pick_min_max(nums):\n    return (min(nums), max(nums))',
      'Hint: return a tuple (min_value, max_value).',
      [['Simple list', 'pick_min_max([3, 1, 4])', [1, 4]], ['All equal', 'pick_min_max([2, 2])', [2, 2]], ['Negatives', 'pick_min_max([-5, -1])', [-5, -1]]]
    ),
    ex('py-topic-modules', 'Modules, Imports & Virtual Environments', 'py-mod-h', 'Collections Counter Top', 'Advanced',
      'Implement `top_word(words)` returning the most frequent word (ties broken alphabetically) using collections.Counter thinking.',
      ['Count with a dict, then pick by (-count, word) sort key.'],
      'def top_word(words):\n    return ""',
      'def top_word(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]',
      'Hint: sorting by (-count, word) resolves ties alphabetically.',
      [['Clear winner', 'top_word(["a", "b", "a"])', 'a'], ['Tie broken alphabetically', 'top_word(["b", "a"])', 'a'], ['Single word', 'top_word(["z"])', 'z']]
    ),
  ]
));

// ---------------- 12. Decorators, closures, HOFs ----------------
PY_MODULES.push(mod('py-topic-hof', 'Higher-Order Functions & Decorators', 'Wand', 'Advanced',
  'Closures, functions as values, decorator pattern.',
  [
    'Functions are first-class objects; they can be stored, passed and returned.',
    'A decorator is a function taking a function and returning a wrapped function; `@dec` is sugar for `f = dec(f)`.',
    'Closures capture variables from the enclosing scope even after it returns.',
  ],
  [
    ex('py-topic-hof', 'Higher-Order Functions & Decorators', 'py-hof-e', 'Map And Filter Combo', 'Beginner',
      'Implement `process(nums, fn, predicate)` returning fn applied to items that pass predicate, in order.',
      ['Filter first, then transform.'],
      'def process(nums, fn, predicate):\n    return []',
      'def process(nums, fn, predicate):\n    return [fn(n) for n in nums if predicate(n)]',
      'Hint: one comprehension does both filter and map.',
      [['Square evens', 'process([1, 2, 3, 4], lambda x: x * x, lambda x: x % 2 == 0)', [4, 16]], ['Uppercase shorts', 'process(["ab", "abcd"], lambda s: s.upper(), lambda s: len(s) < 4)', ['AB']], ['Nothing passes', 'process([1], lambda x: x, lambda x: False)', []]]
    ),
    ex('py-topic-hof', 'Higher-Order Functions & Decorators', 'py-hof-m', 'Call Counting Decorator Logic', 'Intermediate',
      'Implement `count_calls(fn)` returning a dict {"call": fn, "count": 0, "run": wrapper} where wrapper invokes fn and increments count. The test runs r["run"](2), r["run"](3) then reads r["count"].',
      ['The wrapper closes over a mutable counter.'],
      'def count_calls(fn):\n    return {}',
      'def count_calls(fn):\n    state = {"count": 0}\n    def run(*args):\n        state["count"] += 1\n        return fn(*args)\n    return {"run": run, "count": state["count"] if False else state, "fn": fn}'.replace('"count": state["count"] if False else state', '"state": state'),
      'Hint: store the counter in a dict so the closure mutates it.',
      [['Counts twice', '(lambda r: (r["run"](2), r["run"](3), r["state"]["count"])[2])(count_calls(lambda x: x * 10))', 2], ['Value passes through', '(lambda r: r["run"](5))(count_calls(lambda x: x + 1))', 6], ['Zero calls', 'count_calls(lambda x: x)["state"]["count"]', 0]]
    ),
    ex('py-topic-hof', 'Higher-Order Functions & Decorators', 'py-hof-h', 'Memoize Function', 'Advanced',
      'Implement `memoize(fn)` returning a wrapped function that caches results per argument.',
      ['Keep a cache dict in the closure keyed by the argument.'],
      'def memoize(fn):\n    def wrapper(x):\n        return fn(x)\n    return wrapper',
      'def memoize(fn):\n    cache = {}\n    def wrapper(x):\n        if x not in cache:\n            cache[x] = fn(x)\n        return cache[x]\n    return wrapper',
      'Hint: cache hits must not call fn again.',
      [['Cache hit counted', '(lambda r: (r(4), r(4))[0])(memoize(lambda x: x * x))', 16], ['Distinct args', '(lambda r: (r(1), r(2)))(memoize(lambda x: x + 100))', [101, 102]], ['Cached fib is fast', 'memoize(lambda n: n)(7)', 7]]
    ),
  ]
));

// ---------------- 13. Algorithms: sorting/searching ----------------
PY_MODULES.push(mod('py-topic-algos', 'Sorting, Searching & Big-O', 'BarChart', 'Advanced',
  'Bubble/merge style sorting, binary search, complexity analysis.',
  [
    'Linear scan is O(n); binary search on sorted data is O(log n).',
    'Merge sort splits and merges: O(n log n), stable.',
    'Big-O measures growth, not raw speed; constants matter for small n.',
  ],
  [
    ex('py-topic-algos', 'Sorting, Searching & Big-O', 'py-alg-e', 'Sorted Squares', 'Beginner',
      'Implement `sorted_squares(nums)` returning squares of a sorted list, still sorted.',
      ['Square then sort, or merge two ends from the outside in.'],
      'def sorted_squares(nums):\n    return []',
      'def sorted_squares(nums):\n    return sorted(n * n for n in nums)',
      'Hint: sorted() handles negatives squaring to positives.',
      [['Mixed signs', 'sorted_squares([-3, 1, 2])', [1, 4, 9]], ['All positive', 'sorted_squares([1, 2])', [1, 4]], ['Empty', 'sorted_squares([])', []]]
    ),
    ex('py-topic-algos', 'Sorting, Searching & Big-O', 'py-alg-m', 'Binary Search Index', 'Intermediate',
      'Implement `binary_search(sorted_nums, target)` returning the index or -1.',
      ['Keep lo/hi pointers, halve the range each step.'],
      'def binary_search(sorted_nums, target):\n    return -1',
      'def binary_search(sorted_nums, target):\n    lo, hi = 0, len(sorted_nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if sorted_nums[mid] == target:\n            return mid\n        if sorted_nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1',
      'Hint: lo <= hi keeps single-element ranges searchable.',
      [['Find middle', 'binary_search([1, 3, 5, 7, 9], 5)', 2], ['Missing value', 'binary_search([1, 3, 5], 4)', -1], ['First element', 'binary_search([2, 4], 2)', 0]]
    ),
    ex('py-topic-algos', 'Sorting, Searching & Big-O', 'py-alg-h', 'Merge Sorted Lists', 'Advanced',
      'Implement `merge_sorted(a, b)` merging two sorted lists into one sorted list in O(n+m).',
      ['Two pointers walk both lists, always taking the smaller head.'],
      'def merge_sorted(a, b):\n    return []',
      'def merge_sorted(a, b):\n    i = j = 0\n    out = []\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    out.extend(a[i:]); out.extend(b[j:])\n    return out',
      'Hint: drain the leftovers after the main loop.',
      [['Interleaved', 'merge_sorted([1, 3, 5], [2, 4, 6])', [1, 2, 3, 4, 5, 6]], ['One empty', 'merge_sorted([], [1, 2])', [1, 2]], ['Duplicates', 'merge_sorted([1, 1], [1, 2])', [1, 1, 1, 2]]]
    ),
  ]
));

// ---------------- 14. Data structures ----------------
PY_MODULES.push(mod('py-topic-ds', 'Stacks, Queues & Hash Maps', 'GitBranch', 'Advanced',
  'Classic data structures implemented with Python primitives.',
  [
    'A stack is LIFO (list.append/pop); a queue is FIFO (collections.deque popleft).',
    'Hash maps (dicts) give O(1) average lookup and power frequency counting.',
    'Choosing the right structure often turns an O(n^2) solution into O(n).',
  ],
  [
    ex('py-topic-ds', 'Stacks, Queues & Hash Maps', 'py-ds-e', 'Valid Parentheses', 'Beginner',
      'Implement `valid_parens(s)` checking balanced (), [] and {} using a stack.',
      ['Push openers, match closers against the stack top.'],
      'def valid_parens(s):\n    return False',
      'def valid_parens(s):\n    pairs = {chr(41): chr(40), chr(93): chr(91), chr(125): chr(123)}\n    stack = []\n    for ch in s:\n        if ch in chr(40) + chr(91) + chr(123):\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack',
      'Hint: an empty stack at the end means balance.',
      [['Balanced mix', 'valid_parens("([{}])")', True], ['Wrong order', 'valid_parens("(]")', False], ['Unclosed', 'valid_parens("((")', False]]
    ),
    ex('py-topic-ds', 'Stacks, Queues & Hash Maps', 'py-ds-m', 'Queue Interleave', 'Intermediate',
      'Implement `interleave(q)` taking an even-length list treated as a queue and returning it interleaving first half with second half (first element of each half first).',
      ['Split with slicing, then zip the halves flat.'],
      'def interleave(q):\n    return []',
      'def interleave(q):\n    half = len(q) // 2\n    out = []\n    for i in range(half):\n        out.append(q[i]); out.append(q[half + i])\n    return out',
      'Hint: pairs come out as (q[i], q[i+half]).',
      [['Four items', 'interleave([1, 2, 3, 4])', [1, 3, 2, 4]], ['Six items', 'interleave([1, 2, 3, 4, 5, 6])', [1, 4, 2, 5, 3, 6]], ['Two items', 'interleave([9, 8])', [9, 8]]]
    ),
    ex('py-topic-ds', 'Stacks, Queues & Hash Maps', 'py-ds-h', 'LRU Cache Core', 'Advanced',
      'Implement `touch(order, key, capacity)` returning the updated access-order list with key moved to the end, evicting the oldest entry beyond capacity (LRU cache core).',
      ['Remove key if present, append it, trim from the front when over capacity.'],
      'def touch(order, key, capacity):\n    return []',
      'def touch(order, key, capacity):\n    if key in order:\n        order.remove(key)\n    order.append(key)\n    while len(order) > capacity:\n        order.pop(0)\n    return order',
      'Hint: eviction pops from the front (least recent).',
      [['Move to end', 'touch([1, 2, 3], 1, 3)', [2, 3, 1]], ['Evict oldest', 'touch([1, 2, 3], 4, 3)', [2, 3, 4]], ['No change within cap', 'touch([5], 5, 2)', [5]]]
    ),
  ]
));

// ---------------- 15. Testing & debugging ----------------
PY_MODULES.push(mod('py-topic-testing', 'Testing & Debugging', 'Bug', 'Advanced',
  'Assertions, unit tests, reading tracebacks, print vs debugger.',
  [
    'unittest/pytest run assertions; each test should check one behaviour.',
    'Tracebacks read bottom-up: the last line names the exception, the frames show the path.',
    'In this app every exercise IS a unit-test suite — watch the test panel for pass/fail diffs.',
  ],
  [
    ex('py-topic-testing', 'Testing & Debugging', 'py-test-e', 'Write A Pure Predicate', 'Beginner',
      'Implement `is_vowel(ch)` returning True for aeiou (case-insensitive), else False.',
      ['Lowercase the input first; single-character contract.'],
      'def is_vowel(ch):\n    return False',
      'def is_vowel(ch):\n    return ch.lower() in "aeiou"',
      'Hint: membership test in a string is the simplest assertion-friendly predicate.',
      [['Uppercase vowel', 'is_vowel("A")', True], ['Consonant', 'is_vowel("b")', False], ['Boundary letter', 'is_vowel("E")', True]]
    ),
    ex('py-topic-testing', 'Testing & Debugging', 'py-test-m', 'Assert-Based Self Check', 'Intermediate',
      'Implement `median(nums)` returning the middle value of sorted data (average of two middles for even lengths).',
      ['Sort a copy to avoid mutating the caller list.'],
      'def median(nums):\n    return 0',
      'def median(nums):\n    s = sorted(nums)\n    n = len(s)\n    mid = n // 2\n    if n % 2 == 1:\n        return s[mid]\n    return (s[mid - 1] + s[mid]) / 2',
      'Hint: even length averages the two central values.',
      [['Odd count', 'median([3, 1, 2])', 2], ['Even count', 'median([4, 1, 3, 2])', 2.5], ['Single value', 'median([5])', 5]]
    ),
    ex('py-topic-testing', 'Testing & Debugging', 'py-test-h', 'Delta Validator', 'Advanced',
      'Implement `validate_readings(readings)` returning {"ok": bool, "bad_index": int} — ok is False when any reading is negative or > 100, with bad_index the first offending index (-1 when ok).',
      ['Loop with enumerate; return early on first failure.'],
      'def validate_readings(readings):\n    return {}',
      'def validate_readings(readings):\n    for i, r in enumerate(readings):\n        if r < 0 or r > 100:\n            return {"ok": False, "bad_index": i}\n    return {"ok": True, "bad_index": -1}',
      'Hint: enumerate gives you the index for the report.',
      [['First bad at 1', 'validate_readings([50, -3, 20])', { ok: False, bad_index: 1 }], ['All good', 'validate_readings([0, 100])', { ok: True, bad_index: -1 }], ['Above range', 'validate_readings([101])', { ok: False, bad_index: 0 }]]
    ),
  ]
));

// ---------------- 16. Interview patterns ----------------
PY_MODULES.push(mod('py-topic-interview', 'Interview Patterns: Two Pointers & DP', 'Target', 'Advanced',
  'Two pointers, sliding window, dynamic programming basics.',
  [
    'Two pointers converge on sorted input; sliding window maintains a running summary over a subrange.',
    'Dynamic programming caches subproblem answers (bottom-up table or memoization).',
    'Recognizing the pattern is most of the battle; implementations are usually 10 lines.',
  ],
  [
    ex('py-topic-interview', 'Interview Patterns: Two Pointers & DP', 'py-int-e', 'Pair With Target Sum', 'Beginner',
      'Implement `has_pair_with_sum(nums, target)` returning True when two distinct elements sum to target.',
      ['Hash set of seen values gives O(n); two pointers need sorted input.'],
      'def has_pair_with_sum(nums, target):\n    return False',
      'def has_pair_with_sum(nums, target):\n    seen = set()\n    for n in nums:\n        if target - n in seen:\n            return True\n        seen.add(n)\n    return False',
      'Hint: check for the complement before inserting the current value.',
      [['Pair exists', 'has_pair_with_sum([1, 2, 4], 6)', True], ['Same element only', 'has_pair_with_sum([3], 6)', False], ['Negative pair', 'has_pair_with_sum([-2, 5], 3)', True]]
    ),
    ex('py-topic-interview', 'Interview Patterns: Two Pointers & DP', 'py-int-m', 'Max Sliding Window Sum', 'Intermediate',
      'Implement `max_window_sum(nums, k)` returning the maximum sum of any contiguous window of size k.',
      ['Compute the first window sum, then slide: add the incoming, subtract the outgoing.'],
      'def max_window_sum(nums, k):\n    return 0',
      'def max_window_sum(nums, k):\n    window = sum(nums[:k])\n    best = window\n    for i in range(k, len(nums)):\n        window += nums[i] - nums[i - k]\n        if window > best:\n            best = window\n    return best',
      'Hint: sliding keeps the pass O(n) instead of O(n*k).',
      [['Window of 2', 'max_window_sum([1, 5, 2, 3], 2)', 7], ['Whole array', 'max_window_sum([4, 4], 2)', 8], ['Window of 1', 'max_window_sum([-3, 9, -1], 1)', 9]]
    ),
    ex('py-topic-interview', 'Interview Patterns: Two Pointers & DP', 'py-int-h', 'Climbing Stairs DP', 'Advanced',
      'Implement `climb_stairs(n)` counting ways to climb n stairs taking 1 or 2 steps (classic DP).',
      ['ways(n) = ways(n-1) + ways(n-2); iterate bottom-up with two variables.'],
      'def climb_stairs(n):\n    return 0',
      'def climb_stairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b',
      'Hint: it is the Fibonacci sequence shifted.',
      [['Three stairs', 'climb_stairs(3)', 3], ['Five stairs', 'climb_stairs(5)', 8], ['One stair', 'climb_stairs(1)', 1]]
    ),
  ]
));

export const PYTHON_EXTRA_MODULES: CourseModule[] = PY_MODULES as unknown as CourseModule[];
