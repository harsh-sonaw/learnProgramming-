import type { LanguageId } from '@/types';

/** Starter code shown in each sandbox language the first time. */
export const DEFAULT_SANDBOX_CODE: Record<LanguageId, string> = {
  python: `# DevPulse Python Interactive Sandbox
# Write any Python code and hit "Run Code"

def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("Generated Fibonacci Series:")
print(fibonacci(10))
`,
  javascript: `// DevPulse Modern JavaScript Playground
// Run modern JS with full console output

const developers = [
  { name: 'Alice', language: 'TypeScript', solved: 42 },
  { name: 'Bob', language: 'Python', solved: 35 },
  { name: 'Charlie', language: 'Go', solved: 28 },
];

const totalSolved = developers.reduce((acc, dev) => acc + dev.solved, 0);
console.log('Total problems solved by team:', totalSolved);

const topPerformer = developers.sort((a, b) => b.solved - a.solved)[0];
console.log('Top coder:', topPerformer.name, 'with', topPerformer.solved, 'exercises');
`,
  typescript: `// DevPulse TypeScript Playground
interface DeveloperMetric {
  id: string;
  name: string;
  languages: string[];
  streakDays: number;
}

const coder: DeveloperMetric = {
  id: 'dev-001',
  name: 'Alex Rivera',
  languages: ['TypeScript', 'Python', 'SQL'],
  streakDays: 14
};

console.log('Developer profile:', coder.name);
console.log('Current streak:', coder.streakDays, 'days unbroken!');
`,
  go: `// DevPulse Go Playground (Simulation)
package main

func main() {
    languages := []string{"Go", "Rust", "Python", "TypeScript"}
    fmt.Println("Languages active in DevPulse:")
    for i, lang := range languages {
        fmt.Println(i+1, "->", lang)
    }
}
`,
  sql: `-- DevPulse Interactive Relational SQL
-- Query the in-memory database: employees, departments, products, orders

SELECT 
  department, 
  COUNT(id) AS head_count, 
  AVG(salary) AS average_salary
FROM employees
GROUP BY department
ORDER BY average_salary DESC;
`
};
