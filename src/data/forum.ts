import { ForumPost } from '../types';

export const SEED_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'How do you handle edge cases in Two Sum when numbers are duplicated?',
    content: 'When working through the hash map solution for Two Sum in Python, I noticed that storing indices when there are duplicate numbers (e.g., [3, 3] with target 6) can cause collisions if we index before checking the complement. Is checking `if complement in seen:` before storing `seen[num] = i` standard practice?',
    category: 'qna',
    language: 'python',
    tags: ['python', 'algorithms', 'hashmaps', 'interviews'],
    authorId: 'user-7',
    authorName: 'Chloe Dupont',
    authorAvatar: 'chloe',
    authorAvatarBg: 'bg-rose-600',
    createdAt: '2 hours ago',
    upvotes: 18,
    commentsCount: 3,
    isResolved: true,
    hasAcceptedAnswer: true,
    codeSnippet: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    codeLanguage: 'python',
    comments: [
      {
        id: 'c-1',
        authorId: 'user-top-2',
        authorName: 'Elena Voronova',
        authorAvatar: 'elena',
        authorAvatarBg: 'bg-amber-600',
        content: 'Exactly right! By looking up the complement first before inserting the current item, you naturally avoid pairing the element with itself while seamlessly matching duplicates like [3, 3] on the second occurrence.',
        createdAt: '1 hour ago',
        upvotes: 14,
        isAcceptedAnswer: true
      },
      {
        id: 'c-2',
        authorId: 'user-4',
        authorName: 'Maya Lin',
        authorAvatar: 'maya',
        authorAvatarBg: 'bg-purple-600',
        content: 'This also ensures it runs in a single O(N) pass instead of two separate loops. Great attention to detail!',
        createdAt: '45 mins ago',
        upvotes: 5
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Showcase: Mini In-Browser State Store with Subscriptions & History',
    content: 'I built a lightweight state management mini-store inspired by Redux and Zustand in TypeScript. It supports action dispatch, computed selectors, and undo/redo history stacks. Feel free to fork it into the playground and try adding middleware support!',
    category: 'projects',
    language: 'typescript',
    tags: ['typescript', 'architecture', 'state-management', 'open-source'],
    authorId: 'user-top-1',
    authorName: 'Sora Takahashi',
    authorAvatar: 'sora',
    authorAvatarBg: 'bg-emerald-600',
    createdAt: '5 hours ago',
    upvotes: 34,
    commentsCount: 2,
    isCollaborative: true,
    lookingForCollaborators: true,
    codeLanguage: 'typescript',
    codeSnippet: `// Mini Reactive Store in TypeScript
class ReactiveStore<T extends object> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();
  private history: T[] = [];

  constructor(initialState: T) {
    this.state = Object.freeze({ ...initialState });
  }

  getState(): T {
    return this.state;
  }

  setState(updater: Partial<T> | ((prev: T) => Partial<T>)): void {
    const nextUpdates = typeof updater === 'function' ? updater(this.state) : updater;
    this.history.push(this.state);
    this.state = Object.freeze({ ...this.state, ...nextUpdates });
    this.listeners.forEach(fn => fn(this.state));
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  undo(): void {
    if (this.history.length > 0) {
      this.state = this.history.pop()!;
      this.listeners.forEach(fn => fn(this.state));
    }
  }
}

// Example usage:
const counter = new ReactiveStore({ count: 0, user: 'Pioneer' });
counter.subscribe(s => console.log('State updated:', s));
counter.setState({ count: 1 });
counter.setState(prev => ({ count: prev.count + 5 }));
counter.undo();`,
    comments: [
      {
        id: 'c-3',
        authorId: 'user-top-3',
        authorName: 'Kenji Sato',
        authorAvatar: 'kenji',
        authorAvatarBg: 'bg-cyan-600',
        content: 'Love this! Forked it and added async action thunk support in 15 lines. Sending you a collaborative PR idea.',
        createdAt: '3 hours ago',
        upvotes: 8
      }
    ]
  },
  {
    id: 'post-3',
    title: 'Why `GROUP BY` with aggregate functions behaves differently across SQL dialects',
    content: 'A common question when jumping from MySQL to PostgreSQL or SQLite: MySQL historically allowed non-aggregated columns in SELECT without GROUP BY, but standard ANSI SQL requires all non-aggregated select items to appear in the GROUP BY clause. Here is a handy comparison.',
    category: 'tips',
    language: 'sql',
    tags: ['sql', 'database', 'best-practices', 'queries'],
    authorId: 'user-5',
    authorName: 'Samuel Osei',
    authorAvatar: 'samuel',
    authorAvatarBg: 'bg-teal-600',
    createdAt: '1 day ago',
    upvotes: 27,
    commentsCount: 1,
    codeLanguage: 'sql',
    codeSnippet: `-- Safe standard practice for all relational engines:
SELECT 
  department, 
  COUNT(id) AS total_staff,
  AVG(salary) AS average_salary
FROM employees
GROUP BY department
HAVING COUNT(id) >= 2;`,
    comments: [
      {
        id: 'c-4',
        authorId: 'user-top-2',
        authorName: 'Elena Voronova',
        authorAvatar: 'elena',
        authorAvatarBg: 'bg-amber-600',
        content: 'Great reminder! The `ONLY_FULL_GROUP_BY` SQL mode in MySQL 5.7+ made it strict by default to match Postgres standard.',
        createdAt: '18 hours ago',
        upvotes: 6
      }
    ]
  },
  {
    id: 'post-4',
    title: 'Collaborative Project: High-Throughput Token Bucket Rate Limiter in Go',
    content: 'Looking for a collaborator to extend our concurrent rate limiter simulator. We want to test sliding-window counter vs token bucket with simulated goroutines and ticker channels. Open for anyone learning Go concurrency!',
    category: 'projects',
    language: 'go',
    tags: ['go', 'concurrency', 'networking', 'distributed-systems'],
    authorId: 'user-top-3',
    authorName: 'Kenji Sato',
    authorAvatar: 'kenji',
    authorAvatarBg: 'bg-cyan-600',
    createdAt: '2 days ago',
    upvotes: 41,
    commentsCount: 4,
    isCollaborative: true,
    lookingForCollaborators: true,
    codeLanguage: 'go',
    codeSnippet: `package main

type TokenBucket struct {
    capacity   int
    tokens     int
    refillRate int
}

func NewTokenBucket(capacity, refillRate int) *TokenBucket {
    return &TokenBucket{
        capacity:   capacity,
        tokens:     capacity,
        refillRate: refillRate,
    }
}

func (tb *TokenBucket) Allow() bool {
    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    return false
}

func (tb *TokenBucket) Refill(amount int) {
    tb.tokens += amount
    if tb.tokens > tb.capacity {
        tb.tokens = tb.capacity
    }
}`,
    comments: [
      {
        id: 'c-5',
        authorId: 'user-top-1',
        authorName: 'Sora Takahashi',
        authorAvatar: 'sora',
        authorAvatarBg: 'bg-emerald-600',
        content: 'I would love to help! I have experience writing Go concurrency benchmarks. Forked the project and will comment with benchmark results.',
        createdAt: '1 day ago',
        upvotes: 4
      }
    ]
  }
];
