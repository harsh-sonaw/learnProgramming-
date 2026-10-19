import React from 'react';
import { ArrowRight, Check, CheckCircle2, Terminal } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/store';
import { LANGUAGES, COURSES } from '@/data/courses';
import type { LanguageId } from '@/types';

export const TracksView: React.FC = () => {
  const { currentTrackId, setCurrentTrackId, selectExercise, user, setActiveTab } = useAppStore(
    useShallow((s) => ({
      currentTrackId: s.currentTrackId,
      setCurrentTrackId: s.setCurrentTrackId,
      selectExercise: s.selectExercise,
      user: s.user,
      setActiveTab: s.setActiveTab,
    })),
  );
  const activeTrack = COURSES[currentTrackId];
  const language = LANGUAGES.find(lang => lang.id === currentTrackId)!;
  const exercises = activeTrack.modules.flatMap(module => module.exercises);
  const solvedCount = exercises.filter(exercise => user.solvedExercises[exercise.id]).length;
  const percent = exercises.length ? Math.round(solvedCount / exercises.length * 100) : 0;
  const nextExercise = exercises.find(exercise => !user.solvedExercises[exercise.id]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">Your learning workspace</p>
          <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">A little practice. Real progress.</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">Pick a language, work through the exercises, and learn by writing code.</p>
        </div>
        <span className="text-sm text-slate-400"><span className="font-mono text-slate-200">{Object.keys(user.solvedExercises).length}</span> exercises completed</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500"><label htmlFor="mobile-track">Learning tracks</label></h2>
          <select id="mobile-track" value={currentTrackId} onChange={event => setCurrentTrackId(event.target.value as LanguageId)} className="min-h-12 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 lg:hidden">
            {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
          </select>
          <nav aria-label="Learning tracks" className="hidden gap-1 lg:grid">
            {LANGUAGES.map(lang => {
              const selected = currentTrackId === lang.id;
              const trackExercises = COURSES[lang.id].modules.flatMap(module => module.exercises);
              const solved = trackExercises.filter(exercise => user.solvedExercises[exercise.id]).length;
              return (
                <button key={lang.id} onClick={() => setCurrentTrackId(lang.id)} aria-current={selected ? 'true' : undefined}
                  className={`flex min-h-14 items-center justify-between gap-2 rounded-md px-3 py-3 text-left transition-colors ${selected ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'}`}>
                  <span className="text-sm font-medium">{lang.name}</span>
                  <span className={`font-mono text-xs ${selected ? 'text-emerald-400' : 'text-slate-500'}`}>{solved}/{trackExercises.length}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-8 hidden border-t border-slate-800 pt-6 lg:block">
            <Terminal className="mb-3 h-5 w-5 text-slate-500" aria-hidden="true" />
            <h3 className="text-sm font-medium text-slate-200">Room to experiment.</h3>
            <p className="mt-2 text-xs leading-6 text-slate-400">Try an idea or revisit a concept in the playground.</p>
            <button onClick={() => setActiveTab('sandbox')} className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300">Open playground <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </div>
        </aside>

        <div className="min-w-0">
          <section aria-labelledby="track-heading" className="mb-10">
            <div className="mb-5 flex items-center gap-3 text-xs text-slate-400">
              <span className="rounded border border-slate-700 px-2 py-1 font-mono text-emerald-400">{language.shortName}</span>
              <span>{activeTrack.modules.length} modules</span><span aria-hidden="true">/</span><span>{exercises.length} exercises</span>
            </div>
            <h2 id="track-heading" className="text-2xl font-medium tracking-tight text-white sm:text-3xl">{language.name}</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">{activeTrack.description}</p>
            <div className="mt-6 flex flex-col gap-5 rounded-lg border border-slate-800 bg-slate-900/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <div className="mb-3 flex items-center justify-between gap-5 text-xs"><span className="text-slate-300">{solvedCount} of {exercises.length} completed</span><span className="font-mono text-slate-400">{percent}%</span></div>
                <progress aria-label={`${language.name} track progress`} value={solvedCount} max={exercises.length} className="track-progress block h-1 w-full" />
              </div>
              {nextExercise ? (
                <button onClick={() => selectExercise(nextExercise.id)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-md bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300">
                  {solvedCount ? 'Continue learning' : 'Start learning'}<ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <span className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Track complete</span>
              )}
            </div>
            {nextExercise && <p className="mt-3 text-xs leading-5 text-slate-500">Up next: <span className="text-slate-400">{nextExercise.title}</span></p>}
            <button onClick={() => setActiveTab('test')} className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300">Take the {language.name} test <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </section>

          <section aria-labelledby="curriculum-heading">
            <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 id="curriculum-heading" className="text-sm font-semibold text-slate-200">Course curriculum</h2>
              <span className="text-xs text-slate-500">At your own pace</span>
            </div>
            {activeTrack.modules.map((module, moduleIndex) => (
              <section key={module.id} aria-labelledby={`${module.id}-heading`} className="pt-7">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="pt-0.5 font-mono text-xs text-slate-500">{String(moduleIndex + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 id={`${module.id}-heading`} className="text-sm font-medium text-slate-100">{module.title}</h3>
                      <p className="mt-1.5 text-xs leading-5 text-slate-500">{module.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-500">{module.exercises.filter(exercise => user.solvedExercises[exercise.id]).length}/{module.exercises.length}</span>
                </div>
                <div className="divide-y divide-slate-800 rounded-md border border-slate-800">
                  {module.exercises.map((exercise, index) => {
                    const solved = Boolean(user.solvedExercises[exercise.id]);
                    return (
                      <button key={exercise.id} onClick={() => selectExercise(exercise.id)} className="group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-900 sm:gap-4 sm:px-5">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center font-mono text-xs ${solved ? 'text-emerald-400' : 'text-slate-500'}`} aria-label={solved ? 'Completed' : undefined}>{solved ? <Check className="h-4 w-4" aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm leading-6 text-slate-200 group-hover:text-white">{exercise.title}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"><span>{exercise.difficulty}</span><span>{exercise.xpReward} XP</span>{solved && <span className="text-emerald-400">Completed</span>}</span>
                        </span>
                        <span className="hidden text-xs text-slate-400 sm:inline">{solved ? 'Review' : 'Solve'}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-emerald-400" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
          <p className="mt-10 border-t border-slate-800 pt-5 text-xs leading-6 text-slate-500">Your progress is saved in this browser. Come back whenever you’re ready.</p>
        </div>
      </div>
    </div>
  );
};
