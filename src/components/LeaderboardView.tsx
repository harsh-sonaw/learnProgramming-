import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageId } from '../types';
import { Card, Page, PageHeader, Section } from './ui';

type Period = 'weekly' | 'alltime' | 'language';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'weekly', label: 'This week' },
  { id: 'alltime', label: 'All time' },
  { id: 'language', label: 'By language' },
];

const LANGUAGE_TAGS: Record<string, string> = {
  python: 'PY',
  javascript: 'JS',
  typescript: 'TS',
  go: 'GO',
  sql: 'SQL',
};

/** Filtering is a view of one task, so it stays on this page. */
export const LeaderboardView: React.FC = () => {
  const { leaderboardUsers, user, userRank } = useApp();
  const [period, setPeriod] = useState<Period>('weekly');
  const [language, setLanguage] = useState<LanguageId>('typescript');

  let users = [...leaderboardUsers];
  if (period === 'alltime') users.sort((a, b) => b.totalXp - a.totalXp);
  if (period === 'language') users = users.filter(entry => entry.topLanguage === language);
  users = users.map((entry, index) => ({ ...entry, rank: index + 1 }));

  const xpFor = (entry: (typeof users)[number]) => (period === 'alltime' ? entry.totalXp : entry.weeklyXp);

  return (
    <Page>
      <PageHeader
        eyebrow="Compete"
        title="Leaderboard"
        description={`Weekly sprints close Sunday 23:59 UTC. You are ranked #${userRank} in the ${user.league} league.`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div
          className="inline-flex rounded-md border border-slate-800 p-0.5"
          role="tablist"
          aria-label="Leaderboard period"
        >
          {PERIODS.map(option => {
            const selected = period === option.id;
            return (
              <button
                key={option.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setPeriod(option.id)}
                className={`rounded px-3 py-1.5 text-xs transition-colors ${
                  selected ? 'bg-slate-800 font-medium text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {period === 'language' && (
          <div className="flex items-center gap-1">
            {Object.keys(LANGUAGE_TAGS).map(id => (
              <button
                key={id}
                onClick={() => setLanguage(id as LanguageId)}
                aria-pressed={language === id}
                className={`rounded px-2 py-1 font-mono text-[11px] uppercase transition-colors ${
                  language === id
                    ? 'bg-emerald-400 font-semibold text-slate-950'
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                {LANGUAGE_TAGS[id]}
              </button>
            ))}
          </div>
        )}
      </div>

      <Section>
        <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 font-mono text-sm text-emerald-300">
              #{userRank}
            </span>
            <div>
              <p className="text-sm text-slate-100">
                {user.displayName} <span className="text-slate-500">· {user.league}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {userRank <= 3 ? 'In the promotion zone' : 'Keep solving to reach the top three'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm text-slate-100">{period === 'alltime' ? user.totalXpEarned ?? user.currentXp : user.weeklyXp ?? 0} XP</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 font-mono text-[11px] text-amber-400">
              <Flame className="h-3 w-3" aria-hidden="true" />
              {user.streak}d
            </p>
          </div>
        </Card>

        <ul className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
          {users.map(entry => {
            const isMe = entry.isCurrentUser || entry.id === user.id;
            return (
              <li
                key={entry.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 ${
                  isMe ? 'border-l-2 border-l-emerald-400 bg-emerald-500/5' : ''
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`w-7 shrink-0 text-center font-mono text-xs ${
                      entry.rank === 1
                        ? 'text-amber-400'
                        : entry.rank <= 3
                          ? 'text-slate-300'
                          : 'text-slate-600'
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-medium text-slate-200">
                    {entry.displayName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-200">
                      {entry.displayName}
                      {isMe && <span className="ml-1.5 text-[10px] text-emerald-400">you</span>}
                    </p>
                    <p className="truncate font-mono text-[11px] text-slate-600">@{entry.username}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 font-mono text-xs">
                  <span className="hidden rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400 sm:inline">
                    {LANGUAGE_TAGS[entry.topLanguage] ?? entry.topLanguage.toUpperCase()}
                  </span>
                  <span className="hidden items-center gap-1 text-amber-400 sm:flex">
                    <Flame className="h-3 w-3" aria-hidden="true" />
                    {entry.streak}d
                  </span>
                  <span className="w-16 text-right text-slate-200">{xpFor(entry)} XP</span>
                </div>
              </li>
            );
          })}
        </ul>

        {users.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-800 px-4 py-10 text-center text-sm text-slate-500">
            Nobody has ranked in this language yet.
          </p>
        )}
      </Section>
    </Page>
  );
};
