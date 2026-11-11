import React from 'react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LANGUAGES, COURSES } from '../data/courses';
import { LanguageId } from '../types';
import { TAB_PAGES } from '../utils/routes';
import { Button, ButtonLink, Page, PageHeader, Progress, Section } from './ui';

export const TracksView: React.FC = () => {
  const { currentTrackId, setCurrentTrackId, selectExercise, user } = useApp();
  const activeTrack = COURSES[currentTrackId];
  const language = LANGUAGES.find(lang => lang.id === currentTrackId)!;
  const exercises = activeTrack.modules.flatMap(module => module.exercises);
  const solvedCount = exercises.filter(exercise => user.solvedExercises[exercise.id]).length;
  const nextExercise = exercises.find(exercise => !user.solvedExercises[exercise.id]);

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Learn"
        title="Your learning tracks"
        description="Pick a language and work through short exercises. Progress is saved in this browser."
        actions={
          <ButtonLink href={TAB_PAGES.sandbox} size="sm" variant="secondary">
            Open playground
          </ButtonLink>
        }
      />

      <div>
        <div className="min-w-0">
          <Section>
            <label htmlFor="track-select" className="mb-2 block text-[11px] uppercase tracking-widest text-slate-500">
              Learning track
            </label>
            <div className="relative">
              <select
                id="track-select"
                value={currentTrackId}
                onChange={event => setCurrentTrackId(event.target.value as LanguageId)}
                className="min-h-11 w-full appearance-none rounded-md border border-slate-800 bg-slate-900 py-2 pl-3 pr-10 text-sm text-slate-100 transition-colors hover:border-slate-700"
              >
                {LANGUAGES.map(lang => {
                  const trackExercises = COURSES[lang.id].modules.flatMap(module => module.exercises);
                  const solved = trackExercises.filter(exercise => user.solvedExercises[exercise.id]).length;
                  return (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} — {solved}/{trackExercises.length} solved
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </Section>

          <section aria-labelledby="track-heading" className="mb-10">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="track-heading" className="text-lg font-medium text-white">
                {language.name}
              </h2>
              <span className="font-mono text-xs text-slate-500">
                {activeTrack.modules.length} modules · {exercises.length} exercises
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{activeTrack.description}</p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
              <div className="min-w-[12rem] flex-1">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    {solvedCount} of {exercises.length} completed
                  </span>
                  <span className="font-mono text-slate-500">
                    {exercises.length ? Math.round((solvedCount / exercises.length) * 100) : 0}%
                  </span>
                </div>
                <Progress value={solvedCount} max={exercises.length} label={`${language.name} progress`} />
              </div>

              {nextExercise ? (
                <Button variant="primary" onClick={() => selectExercise(nextExercise.id)}>
                  {solvedCount ? 'Continue' : 'Start learning'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <span className="text-sm text-emerald-400">Track complete</span>
              )}
            </div>
            {nextExercise && (
              <p className="mt-2 text-xs text-slate-500">Next: {nextExercise.title}</p>
            )}
          </section>

          <section aria-labelledby="curriculum-heading">
            <div className="mb-3 flex items-baseline justify-between border-b border-slate-800 pb-3">
              <h2 id="curriculum-heading" className="text-sm font-medium text-slate-200">
                Curriculum
              </h2>
              <span className="text-xs text-slate-500">At your own pace</span>
            </div>

            {activeTrack.modules.map((module, moduleIndex) => (
              <section key={module.id} aria-labelledby={`${module.id}-heading`} className="pt-6">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="pt-0.5 font-mono text-xs text-slate-600">
                      {String(moduleIndex + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 id={`${module.id}-heading`} className="text-sm font-medium text-slate-100">
                        {module.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{module.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-600">
                    {module.exercises.filter(exercise => user.solvedExercises[exercise.id]).length}/
                    {module.exercises.length}
                  </span>
                </div>

                <ul className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
                  {module.exercises.map((exercise, index) => {
                    const solved = Boolean(user.solvedExercises[exercise.id]);
                    return (
                      <li key={exercise.id}>
                        <button
                          onClick={() => selectExercise(exercise.id)}
                          className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-900"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[11px] ${
                              solved ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                          >
                            {solved ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-slate-200 group-hover:text-white">
                              {exercise.title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[11px] text-slate-500">
                              <span>{exercise.difficulty}</span>
                              <span>{exercise.xpReward} XP</span>
                              {solved && <span className="text-emerald-400">Solved</span>}
                            </span>
                          </span>
                          <ArrowRight
                            className="h-4 w-4 shrink-0 text-slate-700 transition-colors group-hover:text-emerald-400"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </section>
        </div>
      </div>
    </Page>
  );
};
