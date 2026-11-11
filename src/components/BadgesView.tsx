import React from 'react';
import { Award, ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BADGES } from '../data/badgesData';
import { ButtonLink, Page, PageHeader, Section } from './ui';
import { TAB_PAGES } from '../utils/routes';

/** Split out of the profile page so each screen has one job. */
export const BadgesView: React.FC = () => {
  const { user } = useApp();
  const unlockedCount = BADGES.filter(badge => user.unlockedBadgeIds.includes(badge.id)).length;

  return (
    <Page>
      <PageHeader
        eyebrow="Profile"
        title="Badges"
        description={`${unlockedCount} of ${BADGES.length} unlocked. Badges are earned automatically as you practise.`}
        actions={
          <ButtonLink href={TAB_PAGES.profile} size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Profile
          </ButtonLink>
        }
      />

      <Section>
        <ul className="grid gap-3 sm:grid-cols-2">
          {BADGES.map(badge => {
            const unlocked = user.unlockedBadgeIds.includes(badge.id);
            return (
              <li
                key={badge.id}
                className={`rounded-lg border p-4 ${
                  unlocked ? 'border-slate-800 bg-slate-900/40' : 'border-slate-900 bg-slate-950/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                      unlocked
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-slate-800 text-slate-600'
                    }`}
                  >
                    <Award className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className={`truncate text-sm font-medium ${unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                        {badge.title}
                      </h3>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-slate-500">
                        {badge.rarity}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs leading-5 ${unlocked ? 'text-slate-400' : 'text-slate-600'}`}>
                      {badge.description}
                    </p>
                    {unlocked && (
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Unlocked
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>
    </Page>
  );
};
