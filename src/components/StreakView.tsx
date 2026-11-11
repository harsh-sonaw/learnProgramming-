import React from 'react';
import { CheckCircle2, Flame, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { spendableXp } from '../utils/progress';
import { Button, ButtonLink, Card, Label, Page, PageHeader, Section, Stat } from './ui';
import { TAB_PAGES } from '../utils/routes';

/** Formerly a modal in the navbar; now a page you can link to. */
export const StreakView: React.FC = () => {
  const { user, buyStreakFreeze, triggerConfetti } = useApp();

  const today = new Date();
  const lastFourWeeks = Array.from({ length: 28 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (27 - i));
    const daysAgo = 27 - i;
    return {
      date: date.toISOString().split('T')[0],
      dayNum: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      active: daysAgo < user.streak,
      isToday: daysAgo === 0,
    };
  });

  const milestones = [
    { days: 3, label: '3-day streak', reward: '+50 XP', unlocked: user.streak >= 3 },
    { days: 7, label: '7-day streak', reward: '+150 XP, rare badge', unlocked: user.streak >= 7 },
    { days: 14, label: '14-day streak', reward: '+300 XP, streak freeze', unlocked: user.streak >= 14 },
    { days: 30, label: '30-day streak', reward: '+1,000 XP', unlocked: user.streak >= 30 },
  ];

  const canAfford = spendableXp(user) >= 150;

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Profile"
        title="Streak"
        description="Solve one exercise or daily challenge every day to keep the streak alive."
        actions={
          <ButtonLink href={TAB_PAGES.profile} size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Profile
          </ButtonLink>
        }
      />

      <Section>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Current" value={user.streak} />
          <Stat label="Longest" value={user.longestStreak} />
          <Stat label="Freezes" value={user.streakFreezes} />
        </div>
      </Section>

      <Section title="Last four weeks" description={`Today is ${today.toLocaleDateString()}.`}>
        <div className="grid grid-cols-7 gap-1.5">
          {lastFourWeeks.map(day => (
            <div
              key={day.date}
              title={`${day.date} — ${day.active ? 'active' : 'no activity'}`}
              className={`flex aspect-square flex-col items-center justify-center rounded border text-[10px] ${
                day.active
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-800 bg-slate-900/40 text-slate-600'
              } ${day.isToday ? 'ring-1 ring-emerald-400' : ''}`}
            >
              <span className="text-[9px] opacity-70">{day.dayName}</span>
              <span className="font-mono">{day.dayNum}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Streak freeze">
        <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-sm text-slate-200">Protects your streak for one missed day.</p>
              <p className="mt-1 text-xs text-slate-500">
                You own {user.streakFreezes}. Costs 150 XP; you have {spendableXp(user)} available.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canAfford}
            onClick={() => {
              if (buyStreakFreeze(150)) triggerConfetti();
            }}
          >
            Buy freeze
          </Button>
        </Card>
      </Section>

      <Section title="Milestones">
        <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800">
          {milestones.map(milestone => (
            <li key={milestone.days} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="flex items-center gap-2.5 text-sm text-slate-200">
                {milestone.unlocked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-700 font-mono text-[9px] text-slate-500">
                    {milestone.days}
                  </span>
                )}
                {milestone.label}
              </span>
              <span className="shrink-0 font-mono text-xs text-slate-400">{milestone.reward}</span>
            </li>
          ))}
        </ul>
      </Section>

      <p className="flex items-center gap-2 text-xs leading-6 text-slate-500">
        <Flame className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
        A freeze is used automatically the first day you miss.
      </p>
    </Page>
  );
};
