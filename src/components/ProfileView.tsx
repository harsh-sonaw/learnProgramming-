import React from 'react';
import { ArrowRight, Award, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BADGES } from '../data/badgesData';
import { COURSES } from '../data/courses';
import { LanguageId } from '../types';
import { TAB_PAGES } from '../utils/routes';
import { ButtonLink, Card, Page, PageHeader, Progress, Section, Stat } from './ui';

export const ProfileView: React.FC = () => {
  const { user } = useApp();

  const totalExercises = Object.values(COURSES).reduce(
    (total, course) => total + course.modules.reduce((sum, module) => sum + module.exercises.length, 0),
    0
  );
  const solvedCount = Object.keys(user.solvedExercises).length;
  const unlockedBadges = BADGES.filter(badge => user.unlockedBadgeIds.includes(badge.id));

  return (
    <Page>
      <PageHeader
        eyebrow="Profile"
        title={user.displayName}
        description={user.bio || `@${user.username} · joined ${user.joinedDate}`}
        actions={
          <ButtonLink href={TAB_PAGES.profileEdit} variant="secondary" size="sm">
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </ButtonLink>
        }
      />

      <Section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Level" value={user.level} hint={`${user.currentXp} / ${user.nextLevelXp} XP`} />
          <Stat label="Streak" value={`${user.streak}d`} hint={`best ${user.longestStreak}d`} />
          <Stat label="Solved" value={`${solvedCount}/${totalExercises}`} />
          <Stat label="League" value={user.league} />
        </div>
      </Section>

      <Section title="Language progress">
        <ul className="space-y-4">
          {(Object.keys(COURSES) as LanguageId[]).map(languageId => {
            const course = COURSES[languageId];
            const exercises = course.modules.flatMap(module => module.exercises);
            const solved = exercises.filter(exercise => user.solvedExercises[exercise.id]).length;
            return (
              <li key={languageId}>
                <div className="mb-1.5 flex items-baseline justify-between text-xs">
                  <span className="text-slate-300">{course.name}</span>
                  <span className="font-mono text-slate-500">
                    {solved}/{exercises.length}
                  </span>
                </div>
                <Progress value={solved} max={exercises.length} label={`${course.name} progress`} />
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        title={`Badges (${unlockedBadges.length}/${BADGES.length})`}
        description="Earned automatically as you practise."
        actions={
          <ButtonLink href={TAB_PAGES.profileBadges} size="sm" variant="ghost">
            View all
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </ButtonLink>
        }
      >
        {unlockedBadges.length === 0 ? (
          <Card className="p-4 text-sm text-slate-500">No badges yet — solve an exercise to start.</Card>
        ) : (
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {unlockedBadges.slice(0, 4).map(badge => (
              <li key={badge.id} className="flex items-start gap-2.5 rounded-lg border border-slate-800 p-3">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{badge.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-slate-500">{badge.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Page>
  );
};
