import React from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAV_ITEMS, PAGE_SECTION, SECTION_HOME, TAB_PAGES } from '../utils/routes';

/**
 * One row, five destinations, plus the account link. Secondary pages are
 * reached from within their section rather than from more top-level tabs.
 */
export const Navbar: React.FC = () => {
  const { user, activeTab } = useApp();
  const section = PAGE_SECTION[activeTab];

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 pt-5 sm:px-8">
        <a href={TAB_PAGES.tracks} className="flex items-baseline gap-2 text-white">
          <span className="text-base font-semibold tracking-tight">devpulse</span>
          <span className="text-base font-semibold text-emerald-400">.</span>
        </a>

        <div className="flex items-center gap-1">
          <a
            href={TAB_PAGES.streak}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-200"
            aria-label={`${user.streak} day streak — view streak details`}
          >
            <Flame className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span className="font-mono text-slate-300">{user.streak}</span>
            <span className="hidden sm:inline">day streak</span>
          </a>
          <a
            href={TAB_PAGES.profile}
            className="ml-1 flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-slate-900"
            aria-label="Open your profile"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-200">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm text-slate-300 sm:inline">{user.displayName}</span>
          </a>
        </div>
      </div>

      <nav aria-label="Main" className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 sm:gap-7 sm:px-8">
        {NAV_ITEMS.map(item => {
          const selected = section === item;
          return (
            <a
              key={item}
              href={SECTION_HOME[item]}
              aria-current={selected ? 'page' : undefined}
              className={`shrink-0 border-b-2 pb-3 pt-4 text-sm transition-colors ${
                selected
                  ? 'border-emerald-400 text-white'
                  : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {item}
            </a>
          );
        })}
      </nav>
    </header>
  );
};
