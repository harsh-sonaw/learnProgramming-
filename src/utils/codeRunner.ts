import { TestCase, TestExecutionResult, RunResults, LanguageId } from '../types';

/**
 * Deep equality checker for test assertion
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];
      if (key !== keysB[i] || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

/**
 * In-memory Mock SQL Database for interactive SQL exercises
 */
export const sqlDatabase: Record<string, Record<string, any>[]> = {
  employees: [
    { id: 1, name: 'Alice Chen', department: 'Engineering', salary: 115000, hire_year: 2021 },
    { id: 2, name: 'Marcus Brody', department: 'Engineering', salary: 130000, hire_year: 2019 },
    { id: 3, name: 'Elena Rostova', department: 'Design', salary: 92000, hire_year: 2022 },
    { id: 4, name: 'David Kim', department: 'Marketing', salary: 88000, hire_year: 2023 },
    { id: 5, name: 'Sarah Connor', department: 'Engineering', salary: 145000, hire_year: 2018 },
    { id: 6, name: 'Leo Vance', department: 'Design', salary: 95000, hire_year: 2021 },
    { id: 7, name: 'Priya Patel', department: 'Marketing', salary: 98000, hire_year: 2020 },
    { id: 8, name: 'James Wilson', department: 'Sales', salary: 105000, hire_year: 2022 },
  ],
  departments: [
    { id: 1, name: 'Engineering', budget: 1500000, location: 'San Francisco' },
    { id: 2, name: 'Design', budget: 500000, location: 'New York' },
    { id: 3, name: 'Marketing', budget: 800000, location: 'Austin' },
    { id: 4, name: 'Sales', budget: 1200000, location: 'Chicago' },
  ],
  products: [
    { id: 101, title: 'Mechanical Keyboard', category: 'Hardware', price: 149.99, stock: 42 },
    { id: 102, title: 'UltraWide Monitor', category: 'Hardware', price: 699.00, stock: 15 },
    { id: 103, title: 'Ergonomic Desk Chair', category: 'Furniture', price: 349.50, stock: 24 },
    { id: 104, title: 'Noise Cancelling Headphones', category: 'Audio', price: 299.00, stock: 80 },
    { id: 105, title: 'USB-C Thunderbolt Hub', category: 'Accessories', price: 89.99, stock: 110 },
    { id: 106, title: 'Standing Desk Converter', category: 'Furniture', price: 199.00, stock: 8 },
  ],
  orders: [
    { id: 501, customer_name: 'TechCorp', product_id: 101, quantity: 5, total_price: 749.95, status: 'Completed' },
    { id: 502, customer_name: 'StudioAlpha', product_id: 102, quantity: 2, total_price: 1398.00, status: 'Completed' },
    { id: 503, customer_name: 'DevFlow Inc', product_id: 105, quantity: 10, total_price: 899.90, status: 'Shipped' },
    { id: 504, customer_name: 'TechCorp', product_id: 104, quantity: 3, total_price: 897.00, status: 'Pending' },
    { id: 505, customer_name: 'CloudScale', product_id: 103, quantity: 4, total_price: 1398.00, status: 'Completed' },
    { id: 506, customer_name: 'StudioAlpha', product_id: 101, quantity: 2, total_price: 299.98, status: 'Completed' },
  ]
};

/**
 * Safe SQL Parser and In-memory Executor
 */
export function executeSql(query: string): { rows: any[]; error?: string } {
  try {
    const cleaned = query.trim().replace(/;+$/, '');
    if (!cleaned) return { rows: [], error: 'Empty SQL query' };

    // Standardize spacing
    const lower = cleaned.toLowerCase();
    if (!lower.startsWith('select')) {
      return { rows: [], error: 'Only SELECT queries are supported in this interactive runner.' };
    }

    // Extract table from query
    const fromMatch = cleaned.match(/\bFROM\s+([a-zA-Z0-9_]+)/i);
    if (!fromMatch) {
      return { rows: [], error: 'Missing FROM clause in SELECT statement.' };
    }

    const primaryTableName = fromMatch[1].toLowerCase();
    if (!sqlDatabase[primaryTableName]) {
      return {
        rows: [],
        error: `Table "${primaryTableName}" does not exist. Available tables: ${Object.keys(sqlDatabase).join(', ')}`
      };
    }

    let rows = JSON.parse(JSON.stringify(sqlDatabase[primaryTableName]));

    // Check for JOIN
    const joinMatch = cleaned.match(/\b(LEFT\s+JOIN|INNER\s+JOIN|JOIN)\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)/i);
    if (joinMatch) {
      const joinType = joinMatch[1].toUpperCase();
      const joinTable = joinMatch[2].toLowerCase();
      const leftCol = joinMatch[3];
      const rightCol = joinMatch[4];

      if (sqlDatabase[joinTable]) {
        const joinData = sqlDatabase[joinTable];
        const merged: any[] = [];

        const getColName = (fullCol: string) => {
          const parts = fullCol.split('.');
          return parts.length > 1 ? parts[1] : parts[0];
        };

        const leftKey = getColName(leftCol);
        const rightKey = getColName(rightCol);

        for (const row of rows) {
          const matches = joinData.filter((jRow: any) => {
            const v1 = row[leftKey] !== undefined ? row[leftKey] : row[rightKey];
            const v2 = jRow[rightKey] !== undefined ? jRow[rightKey] : jRow[leftKey];
            return v1 === v2;
          });

          if (matches.length > 0) {
            matches.forEach((m: any) => {
              merged.push({ ...row, ...m });
            });
          } else if (joinType.includes('LEFT')) {
            merged.push({ ...row });
          }
        }
        rows = merged;
      }
    }

    // WHERE clause
    const whereMatch = cleaned.match(/\bWHERE\s+(.*?)(?=\bGROUP\s+BY|\bORDER\s+BY|\bLIMIT|$)/i);
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      // Handle simple conditions like salary > 100000, department = 'Engineering', etc.
      rows = rows.filter((row: any) => {
        try {
          // Replace column names with row['col']
          let evalExpr = condition;
          for (const key of Object.keys(row)) {
            const regex = new RegExp(`\\b${key}\\b`, 'gi');
            evalExpr = evalExpr.replace(regex, `row['${key}']`);
          }
          evalExpr = evalExpr.replace(/=/g, '===')
                             .replace(/<===/g, '<=')
                             .replace(/>===/g, '>=')
                             .replace(/!==/g, '!=')
                             .replace(/\bAND\b/gi, '&&')
                             .replace(/\bOR\b/gi, '||');
          // eslint-disable-next-line no-new-func
          return Boolean(new Function('row', `return ${evalExpr}`)(row));
        } catch {
          return true;
        }
      });
    }

    // GROUP BY clause
    const groupMatch = cleaned.match(/\bGROUP\s+BY\s+([a-zA-Z0-9_,\s]+)(?=\bHAVING|\bORDER\s+BY|\bLIMIT|$)/i);
    let groupedData: Record<string, any[]> | null = null;
    let groupKeys: string[] = [];
    if (groupMatch) {
      groupKeys = groupMatch[1].split(',').map(s => s.trim().toLowerCase());
      groupedData = {};
      rows.forEach((row: any) => {
        const groupVal = groupKeys.map(k => row[k]).join('___');
        if (!groupedData![groupVal]) groupedData![groupVal] = [];
        groupedData![groupVal].push(row);
      });
    }

    // ORDER BY clause
    const orderMatch = cleaned.match(/\bORDER\s+BY\s+([a-zA-Z0-9_]+)(\s+(ASC|DESC))?/i);
    if (orderMatch && !groupedData) {
      const orderCol = orderMatch[1].trim();
      const isDesc = orderMatch[3] && orderMatch[3].toUpperCase() === 'DESC';
      rows.sort((a: any, b: any) => {
        const vA = a[orderCol] ?? 0;
        const vB = b[orderCol] ?? 0;
        if (vA < vB) return isDesc ? 1 : -1;
        if (vA > vB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // SELECT columns & aggregations
    const selectColsPart = cleaned.substring(
      cleaned.toUpperCase().indexOf('SELECT') + 6,
      cleaned.toUpperCase().indexOf('FROM')
    ).trim();

    if (groupedData) {
      const resultRows: any[] = [];
      for (const key of Object.keys(groupedData)) {
        const groupRows = groupedData[key];
        const representative = groupRows[0];
        const outRow: Record<string, any> = {};

        // Parse column selections
        const colDefs = selectColsPart.split(',').map(c => c.trim());
        for (const colDef of colDefs) {
          const aliasMatch = colDef.match(/(.*?)\s+(?:AS\s+)?([a-zA-Z0-9_]+)$/i);
          const expr = aliasMatch ? aliasMatch[1].trim() : colDef;
          const colName = aliasMatch ? aliasMatch[2].trim() : colDef;

          // Aggregates
          const countMatch = expr.match(/COUNT\((.*?)\)/i);
          const sumMatch = expr.match(/SUM\(([a-zA-Z0-9_]+)\)/i);
          const avgMatch = expr.match(/AVG\(([a-zA-Z0-9_]+)\)/i);
          const maxMatch = expr.match(/MAX\(([a-zA-Z0-9_]+)\)/i);
          const minMatch = expr.match(/MIN\(([a-zA-Z0-9_]+)\)/i);

          if (countMatch) {
            outRow[colName] = groupRows.length;
          } else if (sumMatch) {
            const field = sumMatch[1].trim();
            outRow[colName] = groupRows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
          } else if (avgMatch) {
            const field = avgMatch[1].trim();
            const sum = groupRows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
            outRow[colName] = Math.round((sum / groupRows.length) * 100) / 100;
          } else if (maxMatch) {
            const field = maxMatch[1].trim();
            outRow[colName] = Math.max(...groupRows.map(r => Number(r[field]) || 0));
          } else if (minMatch) {
            const field = minMatch[1].trim();
            outRow[colName] = Math.min(...groupRows.map(r => Number(r[field]) || 0));
          } else {
            outRow[colName] = representative[expr] !== undefined ? representative[expr] : representative[colName];
          }
        }
        resultRows.push(outRow);
      }
      rows = resultRows;
    } else if (selectColsPart !== '*') {
      const colDefs = selectColsPart.split(',').map(c => c.trim());
      rows = rows.map((row: any) => {
        const outRow: Record<string, any> = {};
        for (const colDef of colDefs) {
          const aliasMatch = colDef.match(/(.*?)\s+(?:AS\s+)?([a-zA-Z0-9_]+)$/i);
          const originalCol = aliasMatch ? aliasMatch[1].trim() : colDef;
          const finalColName = aliasMatch ? aliasMatch[2].trim() : colDef;
          outRow[finalColName] = row[originalCol];
        }
        return outRow;
      });
    }

    // LIMIT
    const limitMatch = cleaned.match(/\bLIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limitVal = parseInt(limitMatch[1], 10);
      rows = rows.slice(0, limitVal);
    }

    return { rows };
  } catch (err: any) {
    return { rows: [], error: err.message || 'Error executing SQL statement' };
  }
}

/**
 * Transpiles basic Python syntax to JS representation so users can run real Python functions
 */
export function pythonToJs(pythonCode: string): string {
  let js = pythonCode;

  // Replace def func_name(args): with function func_name(args) {
  js = js.replace(/def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:/g, 'function $1($2) {');

  // Replace Python True, False, None
  js = js.replace(/\bTrue\b/g, 'true');
  js = js.replace(/\bFalse\b/g, 'false');
  js = js.replace(/\bNone\b/g, 'null');

  // Replace and, or, not
  js = js.replace(/\band\b/g, '&&');
  js = js.replace(/\bor\b/g, '||');
  js = js.replace(/\bnot\s+/g, '!');

  // Replace len(x) with (x).length
  js = js.replace(/len\((.*?)\)/g, '($1).length');

  // Replace print(...) with console.log(...)
  js = js.replace(/print\((.*?)\)/g, 'console.log($1)');

  // Convert Python string slicing [::-1]
  js = js.replace(/([a-zA-Z0-9_]+)\[::-1\]/g, '($1.split ? $1.split("").reverse().join("") : [...$1].reverse())');

  // Convert for item in list:
  js = js.replace(/for\s+([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_()]+)\s*:/g, 'for (const $1 of $2) {');

  // Convert range(n)
  js = js.replace(/range\((.*?)\)/g, 'Array.from({length: $1}, (_, i) => i)');

  // Convert if condition:
  js = js.replace(/if\s+(.*?)\s*:/g, 'if ($1) {');
  js = js.replace(/elif\s+(.*?)\s*:/g, '} else if ($1) {');
  js = js.replace(/else\s*:/g, '} else {');

  // Convert while condition:
  js = js.replace(/while\s+(.*?)\s*:/g, 'while ($1) {');

  // Append closing braces based on indentation or end of blocks
  const lines = js.split('\n');
  const resultLines: string[] = [];
  const indentStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      resultLines.push(rawLine);
      continue;
    }

    const currentIndent = rawLine.search(/\S/);

    while (indentStack.length > 0 && currentIndent <= indentStack[indentStack.length - 1]) {
      indentStack.pop();
      resultLines.push(' '.repeat(Math.max(0, currentIndent)) + '}');
    }

    resultLines.push(rawLine);

    if (trimmed.endsWith('{')) {
      indentStack.push(currentIndent);
    }
  }

  while (indentStack.length > 0) {
    indentStack.pop();
    resultLines.push('}');
  }

  return resultLines.join('\n');
}

/**
 * Execute User Code against Test Cases
 */
export async function runCode(
  language: LanguageId,
  userCode: string,
  testCases: TestCase[],
  exerciseTargetFnName?: string
): Promise<RunResults> {
  const startTime = performance.now();
  const consoleOutput: string[] = [];

  // Custom console hook
  const customConsole = {
    log: (...args: any[]) => {
      consoleOutput.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    info: (...args: any[]) => {
      consoleOutput.push('[INFO] ' + args.map(a => String(a)).join(' '));
    },
    error: (...args: any[]) => {
      consoleOutput.push('[ERROR] ' + args.map(a => String(a)).join(' '));
    },
    warn: (...args: any[]) => {
      consoleOutput.push('[WARN] ' + args.map(a => String(a)).join(' '));
    }
  };

  // SQL Execution Path
  if (language === 'sql') {
    const sqlRes = executeSql(userCode);
    const endTime = performance.now();

    if (sqlRes.error) {
      return {
        success: false,
        allPassed: false,
        passedTests: 0,
        totalTests: testCases.length,
        results: testCases.map(tc => ({
          testId: tc.id,
          description: tc.description,
          passed: false,
          actual: 'Execution Error',
          expected: tc.expectedValue,
          error: sqlRes.error,
          executionTimeMs: 1
        })),
        consoleOutput: [sqlRes.error],
        executionTimeMs: Math.round(endTime - startTime),
        error: sqlRes.error
      };
    }

    const results: TestExecutionResult[] = [];
    let passedCount = 0;

    for (const testCase of testCases) {
      let isMatch = false;

      if (typeof testCase.expectedValue === 'function') {
        try {
          isMatch = Boolean(testCase.expectedValue(sqlRes.rows));
        } catch {
          isMatch = false;
        }
      } else if (Array.isArray(testCase.expectedValue)) {
        isMatch = deepEqual(sqlRes.rows, testCase.expectedValue);
        // Also check if keys match even if ordering differs slightly
        if (!isMatch && sqlRes.rows.length === testCase.expectedValue.length) {
          const sortedActual = JSON.stringify(sqlRes.rows);
          const sortedExpected = JSON.stringify(testCase.expectedValue);
          if (sortedActual === sortedExpected) isMatch = true;
        }
      } else {
        isMatch = deepEqual(sqlRes.rows, testCase.expectedValue);
      }

      if (isMatch) passedCount++;

      results.push({
        testId: testCase.id,
        description: testCase.description,
        passed: isMatch,
        actual: sqlRes.rows,
        expected: testCase.expectedValue,
        executionTimeMs: Math.round(endTime - startTime)
      });
    }

    // Log query result preview in console output
    consoleOutput.push(`Returned ${sqlRes.rows.length} row(s):`);
    if (sqlRes.rows.length > 0) {
      consoleOutput.push(JSON.stringify(sqlRes.rows.slice(0, 5), null, 2));
      if (sqlRes.rows.length > 5) {
        consoleOutput.push(`... and ${sqlRes.rows.length - 5} more rows`);
      }
    }

    return {
      success: true,
      allPassed: passedCount === testCases.length,
      passedTests: passedCount,
      totalTests: testCases.length,
      results,
      consoleOutput,
      executionTimeMs: Math.round(endTime - startTime)
    };
  }

  // General Programming Languages (JS, TS, Python, Go)
  let executableCode = userCode;

  if (language === 'typescript') {
    // Strip simple TS types (e.g. : string, : number, : any, interface X {}, type Y =)
    executableCode = userCode
      .replace(/:\s*[A-Z][a-zA-Z0-9_<>[\]|&, ]*(?=[,) =])/g, '')
      .replace(/interface\s+[a-zA-Z0-9_]+\s*\{[\s\S]*?\}/g, '')
      .replace(/type\s+[a-zA-Z0-9_]+\s*=\s*[\s\S]*?;/g, '');
  } else if (language === 'python') {
    try {
      executableCode = pythonToJs(userCode);
    } catch (e: any) {
      return {
        success: false,
        allPassed: false,
        passedTests: 0,
        totalTests: testCases.length,
        results: [],
        consoleOutput: [`SyntaxError in Python parsing: ${e.message}`],
        executionTimeMs: 0,
        error: e.message
      };
    }
  } else if (language === 'go') {
    // Go simulation: convert func Name(params) type { ... } to JS function
    executableCode = userCode
      .replace(/package\s+[a-zA-Z0-9_]+/g, '')
      .replace(/import\s+\([\s\S]*?\)/g, '')
      .replace(/import\s+"[a-zA-Z0-9_/]+"/g, '')
      .replace(/func\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*([a-zA-Z0-9_\[\]*]+)?\s*\{/g, 'function $1($2) {')
      .replace(/fmt\.Println\((.*?)\)/g, 'console.log($1)')
      .replace(/fmt\.Printf\((.*?)\)/g, 'console.log($1)')
      .replace(/var\s+([a-zA-Z0-9_]+)\s+[a-zA-Z0-9_\[\]*]+\s*=/g, 'let $1 =')
      .replace(/([a-zA-Z0-9_]+)\s*:=\s*/g, 'let $1 = ')
      .replace(/len\((.*?)\)/g, '($1).length')
      .replace(/append\(([a-zA-Z0-9_]+),\s*(.*?)\)/g, '[...$1, $2]');
  }

  const results: TestExecutionResult[] = [];
  let passedCount = 0;

  try {
    // Build sandbox function scope
    // We execute userCode and then evaluate each test case
    const testRunnerScript = `
      ${executableCode}

      const __outputs = [];
      const __tests = ${JSON.stringify(testCases)};

      for (let i = 0; i < __tests.length; i++) {
        const test = __tests[i];
        const tStart = performance.now();
        let actual = undefined;
        let err = undefined;

        try {
          if (test.testFunctionCall) {
            // e.g. "twoSum([2,7,11,15], 9)"
            actual = eval(test.testFunctionCall);
          } else if ('${exerciseTargetFnName || ''}') {
            const fn = eval('${exerciseTargetFnName || ''}');
            actual = typeof fn === 'function' ? fn(...(Array.isArray(test.input) ? test.input : [test.input])) : undefined;
          }
        } catch (e) {
          err = e.message || String(e);
        }

        const tEnd = performance.now();
        __outputs.push({
          testId: test.id,
          description: test.description,
          actual: actual,
          error: err,
          timeMs: Math.max(1, Math.round(tEnd - tStart))
        });
      }

      return __outputs;
    `;

    // Execute safely
    // eslint-disable-next-line no-new-func
    const runSandbox = new Function('console', 'performance', testRunnerScript);
    const testOutputs: any[] = runSandbox(customConsole, performance);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const out = testOutputs[i] || {};
      const passed = !out.error && deepEqual(out.actual, tc.expectedValue);

      if (passed) passedCount++;

      results.push({
        testId: tc.id,
        description: tc.description,
        passed,
        actual: out.actual !== undefined ? out.actual : (out.error ? `Error: ${out.error}` : 'undefined'),
        expected: tc.expectedValue,
        error: out.error,
        executionTimeMs: out.timeMs || 1
      });
    }
  } catch (err: any) {
    const endTime = performance.now();
    return {
      success: false,
      allPassed: false,
      passedTests: 0,
      totalTests: testCases.length,
      results: testCases.map(tc => ({
        testId: tc.id,
        description: tc.description,
        passed: false,
        actual: 'Error',
        expected: tc.expectedValue,
        error: err.message || 'Execution error',
        executionTimeMs: 1
      })),
      consoleOutput: [...consoleOutput, `Runtime Error: ${err.message || String(err)}`],
      executionTimeMs: Math.round(endTime - startTime),
      error: err.message || 'Runtime Error'
    };
  }

  const endTime = performance.now();
  return {
    success: true,
    allPassed: passedCount === testCases.length,
    passedTests: passedCount,
    totalTests: testCases.length,
    results,
    consoleOutput,
    executionTimeMs: Math.max(1, Math.round(endTime - startTime))
  };
}
