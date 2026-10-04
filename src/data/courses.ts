import { LanguageInfo, LanguageTrack, Exercise } from '../types';

export const LANGUAGES: LanguageInfo[] = [
  {
    id: 'python',
    name: 'Python 3',
    shortName: 'PY',
    icon: 'Terminal',
    color: 'from-amber-400 to-yellow-600',
    accentColor: 'text-amber-400',
    description: 'Clean, elegant syntax for data analysis, machine learning, and rapid backend scripting.',
    popularFor: 'AI, Data Science & Web Backends',
    totalExercises: 7
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    shortName: 'JS',
    icon: 'Code2',
    color: 'from-yellow-400 to-amber-500',
    accentColor: 'text-yellow-400',
    description: 'The ubiquitous language of the web. Learn modern ES6+, async programming, and closures.',
    popularFor: 'Full-stack Web & Browser Apps',
    totalExercises: 6
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    shortName: 'TS',
    icon: 'Layers',
    color: 'from-blue-400 to-cyan-500',
    accentColor: 'text-blue-400',
    description: 'JavaScript with static types. Write enterprise-grade, bug-resistant, scalable systems.',
    popularFor: 'Large-scale Modern Applications',
    totalExercises: 4
  },
  {
    id: 'go',
    name: 'Go (Golang)',
    shortName: 'GO',
    icon: 'Cpu',
    color: 'from-cyan-400 to-teal-500',
    accentColor: 'text-cyan-400',
    description: 'Built for speed, massive concurrency, cloud infrastructure, and distributed systems.',
    popularFor: 'Cloud Native & Microservices',
    totalExercises: 3
  },
  {
    id: 'sql',
    name: 'SQL (Relational)',
    shortName: 'SQL',
    icon: 'Database',
    color: 'from-emerald-400 to-teal-600',
    accentColor: 'text-emerald-400',
    description: 'Master relational data modeling, complex filtering, multi-table joins, and aggregations.',
    popularFor: 'Databases, Analytics & BI',
    totalExercises: 4
  }
];

export const COURSES: Record<string, LanguageTrack> = {
  python: {
    id: 'python',
    name: 'Python 3 Mastery',
    tagline: 'From idiomatic basics to algorithmic problem solving',
    description: 'Build intuition for Pythonic structures, list comprehensions, dictionary indexing, and recursion.',
    icon: 'Terminal',
    badge: 'Pythonista',
    color: 'amber',
    modules: [
      {
        id: 'py-mod-1',
        trackId: 'python',
        title: 'Core Structures & Control Flow',
        description: 'Master string operations, conditionals, loops, and list manipulation.',
        iconName: 'Code',
        exercises: [
          {
            id: 'py-ex-1',
            trackId: 'python',
            moduleId: 'py-mod-1',
            moduleTitle: 'Core Structures & Control Flow',
            title: 'String Reversal & Palindrome Checker',
            difficulty: 'Beginner',
            xpReward: 35,
            description: 'Write a Python function `is_palindrome(s)` that determines if a given string is a palindrome, ignoring casing and non-alphanumeric characters.',
            instructions: [
              'Clean the string: convert all characters to lowercase.',
              'Filter out any non-alphanumeric characters (keep only letters and digits).',
              'Check if the cleaned string equals its reverse.',
              'Return `True` if it is a palindrome, otherwise return `False`.'
            ],
            examples: [
              { input: '"A man, a plan, a canal: Panama"', output: 'True', explanation: 'After removing punctuation and lowercasing: "amanaplanacanalpanama", which reads the same forwards and backwards.' },
              { input: '"race a car"', output: 'False', explanation: '"raceacar" reversed is "racaecar", not equal.' },
              { input: '"Was it a car or a cat I saw?"', output: 'True' }
            ],
            constraints: [
              'Length of string s: 0 <= len(s) <= 200',
              'Empty string should return True'
            ],
            starterCode: `def is_palindrome(s):
    # Your code here:
    # 1. Lowercase and strip non-alphanumeric characters
    # 2. Compare against reversed string
    return True
`,
            solutionCode: `def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]
`,
            hints: [
              'Hint 1: You can use `c.isalnum()` to check if a character is a letter or number.',
              'Hint 2: In Python, string slicing `cleaned[::-1]` creates a reversed copy of the string.'
            ],
            testCases: [
              {
                id: 'tc-py-1',
                description: 'Classic Panama palindrome with spaces and punctuation',
                inputDescription: '"A man, a plan, a canal: Panama"',
                expectedOutputDescription: 'True',
                testFunctionCall: 'is_palindrome("A man, a plan, a canal: Panama")',
                expectedValue: true
              },
              {
                id: 'tc-py-2',
                description: 'Non-palindrome phrase',
                inputDescription: '"race a car"',
                expectedOutputDescription: 'False',
                testFunctionCall: 'is_palindrome("race a car")',
                expectedValue: false
              },
              {
                id: 'tc-py-3',
                description: 'Palindrome with mixed punctuation',
                inputDescription: '"Was it a car or a cat I saw?"',
                expectedOutputDescription: 'True',
                testFunctionCall: 'is_palindrome("Was it a car or a cat I saw?")',
                expectedValue: true
              },
              {
                id: 'tc-py-4',
                description: 'Single character string',
                inputDescription: '"z"',
                expectedOutputDescription: 'True',
                testFunctionCall: 'is_palindrome("z")',
                expectedValue: true
              }
            ]
          },
          {
            id: 'py-ex-2',
            trackId: 'python',
            moduleId: 'py-mod-1',
            moduleTitle: 'Core Structures & Control Flow',
            title: 'Custom Multiplier FizzBuzz',
            difficulty: 'Beginner',
            xpReward: 30,
            description: 'Implement `fizz_buzz_custom(n)` that returns a list of string representations from 1 up to `n` (inclusive). Replace multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both 3 and 5 with "FizzBuzz".',
            instructions: [
              'Create a loop or list comprehension from 1 up to n.',
              'If the number is divisible by 15, append "FizzBuzz".',
              'If divisible by 3, append "Fizz".',
              'If divisible by 5, append "Buzz".',
              'Otherwise, append the number as a string `str(num)`.'
            ],
            examples: [
              { input: '5', output: '["1", "2", "Fizz", "4", "Buzz"]' },
              { input: '15', output: '[..., "14", "FizzBuzz"]' }
            ],
            constraints: [
              '1 <= n <= 100'
            ],
            starterCode: `def fizz_buzz_custom(n):
    result = []
    # Write your logic here
    return result
`,
            solutionCode: `def fizz_buzz_custom(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result
`,
            hints: [
              'Hint 1: Check for the compound condition (divisible by 15) first before checking 3 or 5 individually.',
              'Hint 2: Convert numbers using str(i) when neither condition is met.'
            ],
            testCases: [
              {
                id: 'tc-py2-1',
                description: 'Standard 5 numbers sequence',
                inputDescription: '5',
                expectedOutputDescription: '["1", "2", "Fizz", "4", "Buzz"]',
                testFunctionCall: 'fizz_buzz_custom(5)',
                expectedValue: ["1", "2", "Fizz", "4", "Buzz"]
              },
              {
                id: 'tc-py2-2',
                description: 'Sequence spanning up to 15 with FizzBuzz',
                inputDescription: '15',
                expectedOutputDescription: 'Array of 15 elements with FizzBuzz at 15',
                testFunctionCall: 'fizz_buzz_custom(15)',
                expectedValue: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
              }
            ]
          },
          {
            id: 'py-ex-3',
            trackId: 'python',
            moduleId: 'py-mod-1',
            moduleTitle: 'Core Structures & Control Flow',
            title: 'List Comprehension Even Squares',
            difficulty: 'Beginner',
            xpReward: 40,
            description: 'Implement `even_squares(numbers)` which takes a list of integers and returns a new list containing the squares of all even numbers in the original list, maintaining their order.',
            instructions: [
              'Filter the input list for even numbers (num % 2 == 0).',
              'Square each even number.',
              'Return the resulting list.'
            ],
            examples: [
              { input: '[1, 2, 3, 4, 5, 6]', output: '[4, 16, 36]' },
              { input: '[1, 3, 5]', output: '[]' }
            ],
            starterCode: `def even_squares(numbers):
    # Try solving this with a Python list comprehension!
    return []
`,
            solutionCode: `def even_squares(numbers):
    return [x * x for x in numbers if x % 2 == 0]
`,
            hints: [
              'Hint: A list comprehension follows the syntax: `[expression for item in iterable if condition]`.'
            ],
            testCases: [
              {
                id: 'tc-py3-1',
                description: 'Mixed positive integers',
                inputDescription: '[1, 2, 3, 4, 5, 6]',
                expectedOutputDescription: '[4, 16, 36]',
                testFunctionCall: 'even_squares([1, 2, 3, 4, 5, 6])',
                expectedValue: [4, 16, 36]
              },
              {
                id: 'tc-py3-2',
                description: 'Only odd numbers',
                inputDescription: '[7, 11, 13]',
                expectedOutputDescription: '[]',
                testFunctionCall: 'even_squares([7, 11, 13])',
                expectedValue: []
              },
              {
                id: 'tc-py3-3',
                description: 'List containing negatives and zero',
                inputDescription: '[-4, -2, 0, 3]',
                expectedOutputDescription: '[16, 4, 0]',
                testFunctionCall: 'even_squares([-4, -2, 0, 3])',
                expectedValue: [16, 4, 0]
              }
            ]
          }
        ]
      },
      {
        id: 'py-mod-2',
        trackId: 'python',
        title: 'Dictionaries & Algorithmic Patterns',
        description: 'Optimize lookups, frequency counters, and hash maps.',
        iconName: 'Layers',
        exercises: [
          {
            id: 'py-ex-4',
            trackId: 'python',
            moduleId: 'py-mod-2',
            moduleTitle: 'Dictionaries & Algorithmic Patterns',
            title: 'Word Frequency Map',
            difficulty: 'Intermediate',
            xpReward: 50,
            description: 'Write `word_frequency(text)` that takes a string of text, converts it to lowercase, splits it by whitespace, and returns a dictionary with word counts.',
            instructions: [
              'Convert the text to lowercase.',
              'Split words by spaces.',
              'Count the occurrences of each word.',
              'Return the counts dictionary.'
            ],
            examples: [
              { input: '"hello world hello"', output: '{"hello": 2, "world": 1}' }
            ],
            starterCode: `def word_frequency(text):
    counts = {}
    # Count occurrences
    return counts
`,
            solutionCode: `def word_frequency(text):
    counts = {}
    words = text.lower().split()
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts
`,
            hints: [
              'Hint 1: `dict.get(key, 0)` is a clean way to fetch current count with a 0 fallback.',
              'Hint 2: `text.lower().split()` handles multiple spaces gracefully.'
            ],
            testCases: [
              {
                id: 'tc-py4-1',
                description: 'Repeated greeting words',
                inputDescription: '"apple banana apple orange apple"',
                expectedOutputDescription: '{"apple": 3, "banana": 1, "orange": 1}',
                testFunctionCall: 'word_frequency("apple banana apple orange apple")',
                expectedValue: { apple: 3, banana: 1, orange: 1 }
              },
              {
                id: 'tc-py4-2',
                description: 'Case insensitivity test',
                inputDescription: '"Python python PYTHON"',
                expectedOutputDescription: '{"python": 3}',
                testFunctionCall: 'word_frequency("Python python PYTHON")',
                expectedValue: { python: 3 }
              }
            ]
          },
          {
            id: 'py-ex-5',
            trackId: 'python',
            moduleId: 'py-mod-2',
            moduleTitle: 'Dictionaries & Algorithmic Patterns',
            title: 'Two Sum Target Index Pair',
            difficulty: 'Intermediate',
            xpReward: 60,
            description: 'Implement `two_sum(nums, target)` which returns the 0-indexed positions of the two numbers in `nums` such that they add up to `target`. Each input has exactly one solution, and you may not use the same element twice.',
            instructions: [
              'Use a hash map / dictionary to store seen numbers and their indices.',
              'For each number `num` at index `i`, check if `target - num` already exists in your map.',
              'If found, return `[seen[target - num], i]`.',
              'Otherwise, store `seen[num] = i`.'
            ],
            examples: [
              { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
              { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }
            ],
            starterCode: `def two_sum(nums, target):
    seen = {}
    # Loop through nums and find the complement
    return []
`,
            solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
            hints: [
              'Hint 1: Doing this with a hash map runs in O(N) linear time, whereas two nested loops take O(N^2).'
            ],
            testCases: [
              {
                id: 'tc-py5-1',
                description: 'Target 9 with [2, 7, 11, 15]',
                inputDescription: 'nums = [2, 7, 11, 15], target = 9',
                expectedOutputDescription: '[0, 1]',
                testFunctionCall: 'two_sum([2, 7, 11, 15], 9)',
                expectedValue: [0, 1]
              },
              {
                id: 'tc-py5-2',
                description: 'Target 6 with [3, 2, 4]',
                inputDescription: 'nums = [3, 2, 4], target = 6',
                expectedOutputDescription: '[1, 2]',
                testFunctionCall: 'two_sum([3, 2, 4], 6)',
                expectedValue: [1, 2]
              },
              {
                id: 'tc-py5-3',
                description: 'Target 6 with duplicates [3, 3]',
                inputDescription: 'nums = [3, 3], target = 6',
                expectedOutputDescription: '[0, 1]',
                testFunctionCall: 'two_sum([3, 3], 6)',
                expectedValue: [0, 1]
              }
            ]
          }
        ]
      }
    ]
  },
  javascript: {
    id: 'javascript',
    name: 'Modern JavaScript (ES6+)',
    tagline: 'Functional patterns, array transformations, and async mechanics',
    description: 'Master higher-order functions, closures, promises, and real-world JavaScript engineering.',
    icon: 'Code2',
    badge: 'JS Ninja',
    color: 'yellow',
    modules: [
      {
        id: 'js-mod-1',
        trackId: 'javascript',
        title: 'Array Transformations & Functional Patterns',
        description: 'Deepen fluency with functional programming primitives.',
        iconName: 'List',
        exercises: [
          {
            id: 'js-ex-1',
            trackId: 'javascript',
            moduleId: 'js-mod-1',
            moduleTitle: 'Array Transformations & Functional Patterns',
            title: 'Array Chunking Utility',
            difficulty: 'Beginner',
            xpReward: 35,
            description: 'Write a function `chunkArray(array, size)` that splits an array into sub-arrays of maximum length `size`. The final chunk may contain fewer elements.',
            instructions: [
              'Return an empty array if the input array is empty.',
              'Iterate through the array in steps of `size`.',
              'Use `array.slice(i, i + size)` to extract each chunk and push into results.',
              'Return the nested 2D array.'
            ],
            examples: [
              { input: '([1, 2, 3, 4, 5], 2)', output: '[[1, 2], [3, 4], [5]]' },
              { input: '([1, 2, 3, 4], 3)', output: '[[1, 2, 3], [4]]' }
            ],
            starterCode: `function chunkArray(array, size) {
  const result = [];
  // Slice array into groups of length 'size'
  return result;
}
`,
            solutionCode: `function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
`,
            hints: [
              'Hint: `array.slice(start, end)` does not mutate the original array and handles out-of-bound indices cleanly.'
            ],
            testCases: [
              {
                id: 'tc-js1-1',
                description: 'Splits array of 5 elements into chunks of 2',
                inputDescription: '([1, 2, 3, 4, 5], 2)',
                expectedOutputDescription: '[[1, 2], [3, 4], [5]]',
                testFunctionCall: 'chunkArray([1, 2, 3, 4, 5], 2)',
                expectedValue: [[1, 2], [3, 4], [5]]
              },
              {
                id: 'tc-js1-2',
                description: 'Chunk size larger than array length',
                inputDescription: '([1, 2, 3], 5)',
                expectedOutputDescription: '[[1, 2, 3]]',
                testFunctionCall: 'chunkArray([1, 2, 3], 5)',
                expectedValue: [[1, 2, 3]]
              },
              {
                id: 'tc-js1-3',
                description: 'Empty array handles gracefully',
                inputDescription: '([], 3)',
                expectedOutputDescription: '[]',
                testFunctionCall: 'chunkArray([], 3)',
                expectedValue: []
              }
            ]
          },
          {
            id: 'js-ex-2',
            trackId: 'javascript',
            moduleId: 'js-mod-1',
            moduleTitle: 'Array Transformations & Functional Patterns',
            title: 'Function Memoization Cache',
            difficulty: 'Intermediate',
            xpReward: 55,
            description: 'Implement `memoize(fn)` which accepts a function `fn` and returns a memoized version of it. Subsequent calls with the same arguments should return the cached result instead of executing `fn` again.',
            instructions: [
              'Create a cache object or Map in the closure scope.',
              'Serialize the received arguments (e.g. `JSON.stringify(args)`).',
              'If the key exists in cache, return the cached value.',
              'Otherwise, execute `fn(...args)`, save result to cache, and return it.'
            ],
            examples: [
              { input: 'const memoizedSum = memoize((a, b) => a + b); memoizedSum(2, 3); memoizedSum(2, 3);', output: '5' }
            ],
            starterCode: `function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    // Check cache and return result
    return fn(...args);
  };
}
`,
            solutionCode: `function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
`,
            hints: [
              'Hint: `JSON.stringify(args)` produces a deterministic string key for primitive argument lists.'
            ],
            testCases: [
              {
                id: 'tc-js2-1',
                description: 'Calls function once and returns cached response for repeated input',
                inputDescription: 'memoize(square)(4)',
                expectedOutputDescription: '16',
                testFunctionCall: '(() => { let calls = 0; const m = memoize(x => { calls++; return x * x; }); const r1 = m(4); const r2 = m(4); return { r1, r2, calls }; })()',
                expectedValue: { r1: 16, r2: 16, calls: 1 }
              },
              {
                id: 'tc-js2-2',
                description: 'Distinguishes between different argument sets',
                inputDescription: 'm(2, 3) vs m(3, 2)',
                expectedOutputDescription: 'Calculated separately',
                testFunctionCall: '(() => { const m = memoize((a, b) => a * 10 + b); return [m(2, 3), m(3, 2), m(2, 3)]; })()',
                expectedValue: [23, 32, 23]
              }
            ]
          },
          {
            id: 'js-ex-3',
            trackId: 'javascript',
            moduleId: 'js-mod-1',
            moduleTitle: 'Array Transformations & Functional Patterns',
            title: 'Deep Object Clone Without Reference Leaks',
            difficulty: 'Intermediate',
            xpReward: 50,
            description: 'Implement `deepClone(obj)` that produces a full deep copy of nested objects and arrays without mutating the original reference.',
            instructions: [
              'Handle null or non-object primitive values by returning them directly.',
              'Handle arrays by mapping each element recursively.',
              'Handle objects by copying every own property recursively.',
              'Ensure modifying the returned object does not alter the original input.'
            ],
            examples: [
              { input: '{ a: 1, b: { c: 2 } }', output: '{ a: 1, b: { c: 2 } }' }
            ],
            starterCode: `function deepClone(obj) {
  // Your recursive cloning logic here
  return obj;
}
`,
            solutionCode: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  const cloned = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}
`,
            hints: [
              'Hint: Check `Array.isArray(obj)` before standard `typeof obj === "object"`.'
            ],
            testCases: [
              {
                id: 'tc-js3-1',
                description: 'Verifies nested mutation does not affect original',
                inputDescription: 'Nested object with array',
                expectedOutputDescription: 'Original preserved',
                testFunctionCall: '(() => { const orig = { name: "Dev", skills: ["js", "ts"] }; const copy = deepClone(orig); copy.skills.push("python"); return { origSkills: orig.skills.length, copySkills: copy.skills.length }; })()',
                expectedValue: { origSkills: 2, copySkills: 3 }
              }
            ]
          }
        ]
      }
    ]
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript Mastery',
    tagline: 'Static safety, generics, and algebraic types',
    description: 'Bridge JavaScript knowledge into type-safe architectures with generics, discriminated unions, and mapped types.',
    icon: 'Layers',
    badge: 'TS Architect',
    color: 'blue',
    modules: [
      {
        id: 'ts-mod-1',
        trackId: 'typescript',
        title: 'Generics & Discriminated Unions',
        description: 'Write type-safe helper functions and pattern matching.',
        iconName: 'Shield',
        exercises: [
          {
            id: 'ts-ex-1',
            trackId: 'typescript',
            moduleId: 'ts-mod-1',
            moduleTitle: 'Generics & Discriminated Unions',
            title: 'Discriminated Union Shape Calculator',
            difficulty: 'Beginner',
            xpReward: 40,
            description: 'Implement `calculateArea(shape)` that calculates the area of a circle, rectangle, or square based on a discriminated union with a `kind` tag.',
            instructions: [
              'If `shape.kind === "circle"`, area = Math.PI * radius * radius (rounded to 2 decimal places).',
              'If `shape.kind === "rectangle"`, area = width * height.',
              'If `shape.kind === "square"`, area = side * side.',
              'Return the computed numeric area.'
            ],
            examples: [
              { input: '{ kind: "square", side: 5 }', output: '25' },
              { input: '{ kind: "rectangle", width: 4, height: 6 }', output: '24' },
              { input: '{ kind: "circle", radius: 3 }', output: '28.27' }
            ],
            starterCode: `// Type definition for reference:
// type Shape =
//   | { kind: 'circle'; radius: number }
//   | { kind: 'rectangle'; width: number; height: number }
//   | { kind: 'square'; side: number };

function calculateArea(shape: any): number {
  // Use switch or if based on shape.kind
  return 0;
}
`,
            solutionCode: `function calculateArea(shape: any): number {
  switch (shape.kind) {
    case 'circle':
      return Math.round(Math.PI * shape.radius * shape.radius * 100) / 100;
    case 'rectangle':
      return shape.width * shape.height;
    case 'square':
      return shape.side * shape.side;
    default:
      return 0;
  }
}
`,
            hints: [
              'Hint: A switch on `shape.kind` allows TypeScript compiler to narrow types automatically.'
            ],
            testCases: [
              {
                id: 'tc-ts1-1',
                description: 'Square area',
                inputDescription: '{ kind: "square", side: 5 }',
                expectedOutputDescription: '25',
                testFunctionCall: 'calculateArea({ kind: "square", side: 5 })',
                expectedValue: 25
              },
              {
                id: 'tc-ts1-2',
                description: 'Rectangle area',
                inputDescription: '{ kind: "rectangle", width: 4, height: 7 }',
                expectedOutputDescription: '28',
                testFunctionCall: 'calculateArea({ kind: "rectangle", width: 4, height: 7 })',
                expectedValue: 28
              },
              {
                id: 'tc-ts1-3',
                description: 'Circle area rounded to 2 decimal places',
                inputDescription: '{ kind: "circle", radius: 3 }',
                expectedOutputDescription: '28.27',
                testFunctionCall: 'calculateArea({ kind: "circle", radius: 3 })',
                expectedValue: 28.27
              }
            ]
          },
          {
            id: 'ts-ex-2',
            trackId: 'typescript',
            moduleId: 'ts-mod-1',
            moduleTitle: 'Generics & Discriminated Unions',
            title: 'Type-Safe Key Picker',
            difficulty: 'Intermediate',
            xpReward: 45,
            description: 'Implement `pickKeys(obj, keys)` which takes an object and an array of valid keys, returning a new object containing only those selected keys.',
            instructions: [
              'Iterate through the array of keys.',
              'If the key exists on `obj`, copy it into the output object.',
              'Return the filtered object.'
            ],
            examples: [
              { input: 'pickKeys({ a: 1, b: 2, c: 3 }, ["a", "c"])', output: '{ a: 1, c: 3 }' }
            ],
            starterCode: `function pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  // Copy selected keys
  return result;
}
`,
            solutionCode: `function pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
`,
            hints: [
              'Hint: `key in obj` tests whether the property exists on the object.'
            ],
            testCases: [
              {
                id: 'tc-ts2-1',
                description: 'Selects specific subset of properties',
                inputDescription: 'pickKeys({ name: "Alex", role: "Dev", xp: 1200 }, ["name", "xp"])',
                expectedOutputDescription: '{ name: "Alex", xp: 1200 }',
                testFunctionCall: 'pickKeys({ name: "Alex", role: "Dev", xp: 1200 }, ["name", "xp"])',
                expectedValue: { name: 'Alex', xp: 1200 }
              }
            ]
          }
        ]
      }
    ]
  },
  go: {
    id: 'go',
    name: 'Go (Golang)',
    tagline: 'Simplicity, concurrency, and high-performance engineering',
    description: 'Learn Go idiomatic patterns: slices, structs, error handling, and pipeline structures.',
    icon: 'Cpu',
    badge: 'Gopher',
    color: 'cyan',
    modules: [
      {
        id: 'go-mod-1',
        trackId: 'go',
        title: 'Slices & Data Structures',
        description: 'Work with Go slices, deduplication, and struct aggregations.',
        iconName: 'Box',
        exercises: [
          {
            id: 'go-ex-1',
            trackId: 'go',
            moduleId: 'go-mod-1',
            moduleTitle: 'Slices & Data Structures',
            title: 'Slice Deduplicator',
            difficulty: 'Beginner',
            xpReward: 35,
            description: 'Write `RemoveDuplicates(numbers)` that takes a slice of integers and returns a new slice preserving the original order of the first occurrence of each element.',
            instructions: [
              'Create a map to track visited values.',
              'Iterate through the input slice.',
              'Append unvisited items to a result slice.',
              'Return the deduplicated slice.'
            ],
            examples: [
              { input: '[1, 2, 2, 3, 4, 3, 5]', output: '[1, 2, 3, 4, 5]' }
            ],
            starterCode: `package main

func RemoveDuplicates(numbers []int) []int {
    result := []int{}
    // Track seen numbers and append unique ones
    return result
}
`,
            solutionCode: `package main

func RemoveDuplicates(numbers []int) []int {
    seen := make(map[int]bool)
    result := []int{}
    for _, num := range numbers {
        if !seen[num] {
            seen[num] = true
            result = append(result, num)
        }
    }
    return result
}
`,
            hints: [
              'Hint: Use a `map[int]bool` to achieve O(N) lookup efficiency.'
            ],
            testCases: [
              {
                id: 'tc-go1-1',
                description: 'Preserves first occurrence in sequence',
                inputDescription: '[1, 2, 2, 3, 4, 3, 5]',
                expectedOutputDescription: '[1, 2, 3, 4, 5]',
                testFunctionCall: 'RemoveDuplicates([1, 2, 2, 3, 4, 3, 5])',
                expectedValue: [1, 2, 3, 4, 5]
              },
              {
                id: 'tc-go1-2',
                description: 'All duplicates collapse to single item',
                inputDescription: '[9, 9, 9, 9]',
                expectedOutputDescription: '[9]',
                testFunctionCall: 'RemoveDuplicates([9, 9, 9, 9])',
                expectedValue: [9]
              }
            ]
          }
        ]
      }
    ]
  },
  sql: {
    id: 'sql',
    name: 'SQL (Relational Databases)',
    tagline: 'Querying, joining, aggregating, and analyzing relational data',
    description: 'Gain fluency in SQL SELECT statements, WHERE filters, GROUP BY, aggregations, and multi-table JOINs.',
    icon: 'Database',
    badge: 'SQL Sorcerer',
    color: 'emerald',
    modules: [
      {
        id: 'sql-mod-1',
        trackId: 'sql',
        title: 'Filtering & Aggregations',
        description: 'Explore employee and department data with real SQL queries.',
        iconName: 'Search',
        exercises: [
          {
            id: 'sql-ex-1',
            trackId: 'sql',
            moduleId: 'sql-mod-1',
            moduleTitle: 'Filtering & Aggregations',
            title: 'Top Earning Engineers Filter',
            difficulty: 'Beginner',
            xpReward: 30,
            description: 'Write a SQL query that retrieves `name`, `department`, and `salary` from the `employees` table for all staff in the "Engineering" department earning more than $120,000.',
            instructions: [
              'Target table: `employees`',
              'Filter by `department = \'Engineering\'`',
              'And `salary > 120000`',
              'Select columns: `name`, `department`, `salary`'
            ],
            examples: [
              { input: 'Table: employees', output: '2 rows matching Marcus Brody ($130,000) and Sarah Connor ($145,000)' }
            ],
            starterCode: `-- Available table: employees (id, name, department, salary, hire_year)
SELECT name, department, salary
FROM employees
WHERE 
`,
            solutionCode: `SELECT name, department, salary
FROM employees
WHERE department = 'Engineering' AND salary > 120000;
`,
            hints: [
              'Hint: Use the `AND` keyword to combine multiple conditions.'
            ],
            testCases: [
              {
                id: 'tc-sql1-1',
                description: 'Returns only Engineering staff with salary > 120000',
                inputDescription: 'employees table query',
                expectedOutputDescription: 'Marcus Brody & Sarah Connor',
                expectedValue: [
                  { name: 'Marcus Brody', department: 'Engineering', salary: 130000 },
                  { name: 'Sarah Connor', department: 'Engineering', salary: 145000 }
                ]
              }
            ]
          },
          {
            id: 'sql-ex-2',
            trackId: 'sql',
            moduleId: 'sql-mod-1',
            moduleTitle: 'Filtering & Aggregations',
            title: 'Department Salary Metrics',
            difficulty: 'Intermediate',
            xpReward: 45,
            description: 'Write a SQL query to calculate the number of employees (`emp_count`) and the average salary (`avg_salary`) for each department.',
            instructions: [
              'Target table: `employees`',
              'Group rows by `department`',
              'Use `COUNT(*)` as `emp_count`',
              'Use `AVG(salary)` as `avg_salary`',
              'Select: `department`, `COUNT(*) AS emp_count`, `AVG(salary) AS avg_salary`'
            ],
            examples: [
              { input: 'Table: employees', output: 'Rows grouped by department with counts and averages' }
            ],
            starterCode: `-- Group employees by department and calculate aggregates
SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY 
`,
            solutionCode: `SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
`,
            hints: [
              'Hint: `GROUP BY department` aggregates all matching records for each distinct department.'
            ],
            testCases: [
              {
                id: 'tc-sql2-1',
                description: 'Computes department headcounts and average salaries correctly',
                inputDescription: 'Department grouped stats',
                expectedOutputDescription: 'Engineering (3, 130000), Design (2, 93500), Marketing (2, 93000), Sales (1, 105000)',
                expectedValue: [
                  { department: 'Engineering', emp_count: 3, avg_salary: 130000 },
                  { department: 'Design', emp_count: 2, avg_salary: 93500 },
                  { department: 'Marketing', emp_count: 2, avg_salary: 93000 },
                  { department: 'Sales', emp_count: 1, avg_salary: 105000 }
                ]
              }
            ]
          },
          {
            id: 'sql-ex-3',
            trackId: 'sql',
            moduleId: 'sql-mod-1',
            moduleTitle: 'Filtering & Aggregations',
            title: 'Customer Total Revenue Aggregator',
            difficulty: 'Intermediate',
            xpReward: 50,
            description: 'Query the `orders` table to find the total money spent by each customer. Group by `customer_name` and calculate `SUM(total_price) AS total_spent`.',
            instructions: [
              'Table: `orders`',
              'Group by `customer_name`',
              'Calculate `SUM(total_price) AS total_spent`',
              'Select `customer_name, SUM(total_price) AS total_spent`'
            ],
            examples: [
              { input: 'Orders table with customer purchase totals', output: 'Aggregated total spend per customer' }
            ],
            starterCode: `-- Query customer spend aggregation
SELECT customer_name, SUM(total_price) AS total_spent
FROM orders
GROUP BY customer_name;
`,
            solutionCode: `SELECT customer_name, SUM(total_price) AS total_spent
FROM orders
GROUP BY customer_name;
`,
            hints: [
              'Hint: Grouping by `customer_name` collapses all orders placed by that organization into a single summed total.'
            ],
            testCases: [
              {
                id: 'tc-sql3-1',
                description: 'Summarizes purchase revenues by customer account',
                inputDescription: 'Customer order sums',
                expectedOutputDescription: 'TechCorp, StudioAlpha, DevFlow Inc, CloudScale',
                expectedValue: [
                  { customer_name: 'TechCorp', total_spent: 1646.95 },
                  { customer_name: 'StudioAlpha', total_spent: 1697.98 },
                  { customer_name: 'DevFlow Inc', total_spent: 899.9 },
                  { customer_name: 'CloudScale', total_spent: 1398 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

export const ALL_EXERCISES: Exercise[] = Object.values(COURSES).flatMap(course =>
  course.modules.flatMap(m => m.exercises)
);
