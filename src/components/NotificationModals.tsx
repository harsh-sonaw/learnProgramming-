import React from 'react';
import { Award, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TAB_PAGES } from '../utils/routes';

/** Transient notifications only — anything with a URL is a page, not a modal. */
export const NotificationModals: React.FC = () => {
  const {
    badgeNotification,
    dismissBadgeNotification,
    levelUpNotification,
    dismissLevelUpNotification,
  } = useApp();

  return (
    <>
      {badgeNotification && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2.5rem))] rounded-lg border border-slate-800 bg-slate-900 p-3.5 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Badge unlocked</p>
                <button
                  onClick={dismissBadgeNotification}
                  className="-mr-1 -mt-1 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-100">{badgeNotification.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-400">{badgeNotification.description}</p>
              <a
                href={TAB_PAGES.profileBadges}
                className="mt-2 inline-block text-xs text-emerald-400 hover:text-emerald-300"
              >
                View badges
              </a>
            </div>
          </div>
        </div>
      )}

      {levelUpNotification !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6 text-center">
            <Zap className="mx-auto h-6 w-6 text-emerald-400" aria-hidden="true" />
            <p className="mt-3 text-[11px] uppercase tracking-widest text-slate-500">Level up</p>
            <p className="mt-1 text-2xl font-semibold text-white">{levelUpNotification}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Higher league placement and leaderboard standing unlocked.
            </p>
            <button
              onClick={dismissLevelUpNotification}
              className="mt-5 w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};
