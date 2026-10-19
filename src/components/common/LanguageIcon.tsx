import { Code2, Cpu, Database, Layers, Terminal, type LucideIcon } from 'lucide-react';
import type { LanguageId } from '@/types';

const ICONS: Record<LanguageId, LucideIcon> = {
  python: Terminal,
  javascript: Code2,
  typescript: Layers,
  go: Cpu,
  sql: Database,
};

const COLORS: Record<LanguageId, string> = {
  python: 'text-amber-400',
  javascript: 'text-yellow-400',
  typescript: 'text-blue-400',
  go: 'text-cyan-400',
  sql: 'text-emerald-400',
};

interface LanguageIconProps {
  id: LanguageId;
  /** Size (and optionally colour) classes, e.g. "w-4 h-4". */
  className?: string;
  /** Append the language's brand colour to `className`. */
  colored?: boolean;
}

/** One icon per language, shared by every screen that lists languages. */
export function LanguageIcon({ id, className = 'w-5 h-5', colored = false }: LanguageIconProps) {
  const Icon = ICONS[id] ?? Code2;
  return <Icon className={colored ? `${className} ${COLORS[id]}` : className} />;
}
