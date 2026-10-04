import { Exercise } from '../types';

export interface DailyChallenge extends Exercise {
  date: string;
  bonusXp: number;
  streakBonus: number;
  lore: string;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily-valid-parentheses',
    date: '2026-10-04',
    trackId: 'javascript',
    moduleId: 'daily-hub',
    moduleTitle: 'Daily Code Sprint',
    title: 'Balanced Brackets & Parentheses Validator',
    difficulty: 'Intermediate',
    xpReward: 75,
    bonusXp: 50,
    streakBonus: 1,
    lore: 'Today\'s sprint focuses on stack data structures: verify that code delimiter pairs close in proper nested order.',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order, and every close bracket must have a corresponding open bracket.',
    instructions: [
      'Initialize an empty stack array.',
      'Iterate through each character in the string.',
      'If it is an opening bracket `(`, `{`, or `[`, push it onto the stack.',
      'If it is a closing bracket, pop the last element from the stack and verify it matches.',
      'Return `true` if the stack is completely empty at the end, otherwise `false`.'
    ],
    examples: [
      { input: '"()[]{}"', output: 'true' },
      { input: '"(]"', output: 'false' },
      { input: '"([{}])"', output: 'true' }
    ],
    constraints: [
      '1 <= s.length <= 104',
      's consists of parentheses only: ()[]{}'
    ],
    starterCode: `function isValid(s) {
  const stack = [];
  // Use a stack to track open brackets
  return false;
}
`,
    solutionCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}
`,
    hints: [
      'Hint 1: Use an array as a LIFO stack with `.push()` and `.pop()`.',
      'Hint 2: A lookup dictionary mapping closing brackets to their opening counterparts keeps code clean.'
    ],
    testCases: [
      {
        id: 'tc-daily-1',
        description: 'Sequence of standard bracket pairs',
        inputDescription: '"()[]{}"',
        expectedOutputDescription: 'true',
        testFunctionCall: 'isValid("()[]{}")',
        expectedValue: true
      },
      {
        id: 'tc-daily-2',
        description: 'Mismatched brackets',
        inputDescription: '"(]"',
        expectedOutputDescription: 'false',
        testFunctionCall: 'isValid("(]")',
        expectedValue: false
      },
      {
        id: 'tc-daily-3',
        description: 'Properly nested multi-tier brackets',
        inputDescription: '"([{}])"',
        expectedOutputDescription: 'true',
        testFunctionCall: 'isValid("([{}])")',
        expectedValue: true
      },
      {
        id: 'tc-daily-4',
        description: 'Unclosed opening bracket',
        inputDescription: '"((("',
        expectedOutputDescription: 'false',
        testFunctionCall: 'isValid("(((")',
        expectedValue: false
      }
    ]
  },
  {
    id: 'daily-string-compression',
    date: '2026-10-05',
    trackId: 'python',
    moduleId: 'daily-hub',
    moduleTitle: 'Daily Code Sprint',
    title: 'Run-Length String Compressor',
    difficulty: 'Intermediate',
    xpReward: 80,
    bonusXp: 50,
    streakBonus: 1,
    lore: 'Data compression algorithm challenge: encode repeating characters into count tokens.',
    description: 'Implement `compress_string(s)` that takes a string of characters and performs basic run-length compression. For example, "aabcccccaaa" becomes "a2b1c5a3". If the compressed string would not become smaller than the original string, return the original string.',
    instructions: [
      'Track current character and consecutive frequency count.',
      'Iterate through the string, building the compressed representation.',
      'Return the compressed string only if its length is strictly less than original length; otherwise return original.'
    ],
    examples: [
      { input: '"aabcccccaaa"', output: '"a2b1c5a3"' },
      { input: '"abc"', output: '"abc"' }
    ],
    starterCode: `def compress_string(s):
    # Your compression code here
    return s
`,
    solutionCode: `def compress_string(s):
    if not s:
        return s
    compressed = []
    count = 0
    for i in range(len(s)):
        count += 1
        if i + 1 >= len(s) or s[i] != s[i + 1]:
            compressed.append(s[i] + str(count))
            count = 0
    result = "".join(compressed)
    return result if len(result) < len(s) else s
`,
    hints: [
      'Hint 1: Check `if i + 1 >= len(s) or s[i] != s[i+1]` to know when a run finishes.'
    ],
    testCases: [
      {
        id: 'tc-comp-1',
        description: 'Compresses long repeated sequences',
        inputDescription: '"aabcccccaaa"',
        expectedOutputDescription: '"a2b1c5a3"',
        testFunctionCall: 'compress_string("aabcccccaaa")',
        expectedValue: 'a2b1c5a3'
      },
      {
        id: 'tc-comp-2',
        description: 'Returns original when compression is longer',
        inputDescription: '"abc"',
        expectedOutputDescription: '"abc"',
        testFunctionCall: 'compress_string("abc")',
        expectedValue: 'abc'
      }
    ]
  }
];

export function getTodayChallenge(): DailyChallenge {
  return DAILY_CHALLENGES[0];
}
