import React, { useState, useEffect } from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayChallenge } from '../data/challenges';
import { dateKey } from '../utils/progress';
import { Button, Card, Label, Page, PageHeader, Section } from './ui';

export const DailyChallengeView: React.FC = () => {
  const { user, selectExercise } = useApp();
  const challenge = getTodayChallenge();
  const solvedToday =
    user.dailyChallengeSolvedDate === dateKey() || Boolean(user.solvedExercises[challenge.id]);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - Date.now());
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
  const totalXp = challenge.xpReward + challenge.bonusXp;

  return (
    <Page>
      <PageHeader
        eyebrow="Compete · Daily"
        title={challenge.title}
        description={challenge.lore}
        actions={
          solvedToday ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Solved today
            </span>
          ) : (
            <Button variant="primary" onClick={() => selectExercise(challenge.id)}>
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Solve now
            </Button>
          )
        }
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <Label>Resets in</Label>
            <p className="mt-1 font-mono text-lg text-slate-100">{clock}</p>
          </Card>
          <Card className="p-4">
            <Label>Reward</Label>
            <p className="mt-1 font-mono text-lg text-amber-400">+{totalXp} XP</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {challenge.xpReward} base + {challenge.bonusXp} daily bonus
            </p>
          </Card>
          <Card className="p-4">
            <Label>Streak</Label>
            <p className="mt-1 font-mono text-lg text-slate-100">{user.streak} days</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {solvedToday ? 'Today is counted' : `Solve to reach ${user.streak + 1}`}
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Problem">
        <p className="text-sm leading-7 text-slate-300">{challenge.description}</p>

        <h3 className="mt-6 mb-2">
          <Label>Requirements</Label>
        </h3>
        <ol className="space-y-2">
          {challenge.instructions.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm leading-6 text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-700 font-mono text-[10px] text-slate-500">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <h3 className="mt-6 mb-2">
          <Label>Examples</Label>
        </h3>
        <div className="space-y-2">
          {challenge.examples.map((example, index) => (
            <div key={index} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 font-mono text-xs">
              <div className="flex flex-wrap gap-x-2">
                <span className="text-slate-500">Input</span>
                <span className="break-all text-slate-200">{example.input}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-2">
                <span className="text-slate-500">Output</span>
                <span className="break-all text-emerald-400">{example.output}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button variant="primary" onClick={() => selectExercise(challenge.id)}>
            {solvedToday ? 'Review in workspace' : 'Open in workspace'}
          </Button>
        </div>
      </Section>
    </Page>
  );
};
