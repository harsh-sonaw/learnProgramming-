import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Terminal as TerminalIcon,
  Sparkles,
  ArrowRight,
  Code2,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_EXERCISES, COURSES } from '../data/courses';
import { runCode } from '../utils/codeRunner';
import { RunResults } from '../types';
import { HelpPanel } from './HelpPanel';

type EditorFontSize = 'sm' | 'base' | 'lg';

const EDITOR_TEXT_CLASS: Record<EditorFontSize, string> = {
  sm: 'text-xs leading-5',
  base: 'text-sm leading-6',
  lg: 'text-base leading-6',
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{children}</h2>
);

export const CodingWorkspace: React.FC = () => {
  const {
    currentExerciseId,
    setCurrentExerciseId,
    setActiveTab,
    completeExercise,
    user
  } = useApp();

  const exercise = ALL_EXERCISES.find(e => e.id === currentExerciseId) || ALL_EXERCISES[0];
  const isAlreadySolved = Boolean(user.solvedExercises[exercise.id]);

  // Code state
  const [code, setCode] = useState<string>(() => {
    if (user.solvedExercises[exercise.id]?.code) {
      return user.solvedExercises[exercise.id].code;
    }
    return exercise.starterCode;
  });

  // Test run state
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<RunResults | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'tests' | 'console'>('tests');
  const [failedRuns, setFailedRuns] = useState(0);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)');
    const f = () => setIsDesktop(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  const [fontSize, setFontSize] = useState<EditorFontSize>('sm');
  const [copied, setCopied] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [mobilePane, setMobilePane] = useState<'problem' | 'code'>('problem');
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync code whenever exercise changes
  useEffect(() => {
    if (user.solvedExercises[exercise.id]?.code) {
      setCode(user.solvedExercises[exercise.id].code);
    } else {
      setCode(exercise.starterCode);
    }
    setRunResults(null);
    setFailedRuns(0);
    setSubmissionSuccess(false);
    setCursor({ line: 1, column: 1 });
  }, [exercise.id]);

  // Find next exercise in same course or next track
  const currentCourseExercises = COURSES[exercise.trackId]?.modules.flatMap(m => m.exercises) || [];
  const currentIndex = currentCourseExercises.findIndex(e => e.id === exercise.id);
  const nextExercise = currentCourseExercises[currentIndex + 1];

  const handleResetCode = () => {
    setCode(exercise.starterCode);
    setRunResults(null);
    setCursor({ line: 1, column: 1 });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateCursor = (el: HTMLTextAreaElement) => {
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split('\n');
    setCursor({ line: lines.length, column: lines[lines.length - 1].length + 1 });
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Tab key and indentation handler in editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunTests();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = '  ';

      const nextVal = code.substring(0, start) + spaces + code.substring(end);
      setCode(nextVal);

      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
          updateCursor(textareaRef.current);
        }
      }, 0);
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const results = await runCode(exercise.trackId, code, exercise.testCases);
      setRunResults(results);
      if (!results.allPassed) setFailedRuns(n => n + 1);
      if (results.consoleOutput.length > 0 && results.results.length === 0) {
        setActiveResultTab('console');
      } else {
        setActiveResultTab('tests');
      }
    } catch (err: any) {
      setRunResults({
        success: false,
        allPassed: false,
        passedTests: 0,
        totalTests: exercise.testCases.length,
        results: [],
        consoleOutput: [err.message || 'Execution error'],
        executionTimeMs: 0,
        error: err.message
      });
      setActiveResultTab('console');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    setIsRunning(true);
    try {
      const results = await runCode(exercise.trackId, code, exercise.testCases);
      setRunResults(results);
      if (!results.allPassed) setFailedRuns(n => n + 1);
      setActiveResultTab('tests');

      if (results.allPassed) {
        setSubmissionSuccess(true);
        completeExercise(exercise.id, code, exercise.xpReward);
      }
    } catch (err: any) {
      setRunResults({
        success: false,
        allPassed: false,
        passedTests: 0,
        totalTests: exercise.testCases.length,
        results: [],
        consoleOutput: [err.message || 'Execution error'],
        executionTimeMs: 0,
        error: err.message
      });
      setActiveResultTab('console');
    } finally {
      setIsRunning(false);
    }
  };

  const jumpToHelp = () => {
    if (!isDesktop) setMobilePane('problem');
    window.setTimeout(() => {
      document.getElementById('help-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const lineCount = Math.max(code.split('\n').length, 14);
  const visibleTests = exercise.testCases.filter(t => !t.isHidden);
  const totalTests = exercise.testCases.length;
  const failingCount = runResults ? runResults.totalTests - runResults.passedTests : 0;

  const fileName =
    exercise.trackId === 'python' ? 'solution.py'
      : exercise.trackId === 'sql' ? 'query.sql'
        : exercise.trackId === 'go' ? 'main.go'
          : exercise.trackId === 'javascript' ? 'solution.js'
            : 'solution.ts';

  const difficultyClass =
    exercise.difficulty === 'Beginner'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : exercise.difficulty === 'Intermediate'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        : 'border-rose-500/30 bg-rose-500/10 text-rose-300';

  return (
    <div className="flex flex-col bg-slate-950 text-slate-100 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      {/* Top Breadcrumb & Exercise Switcher */}
      <div className="flex min-h-11 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/60 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setActiveTab('tracks')}
            className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Back to learning tracks"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden text-xs sm:inline">Tracks</span>
          </button>
          <span className="hidden text-slate-600 sm:inline" aria-hidden="true">/</span>
          <span className="hidden shrink-0 font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald-400 sm:inline">
            {exercise.trackId}
          </span>
          <span className="hidden text-slate-600 sm:inline" aria-hidden="true">/</span>
          <span className="truncate text-xs font-medium text-slate-200 sm:text-sm">{exercise.title}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <span className="shrink-0 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300">
            +{exercise.xpReward} XP
          </span>
          <button
            onClick={jumpToHelp}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-[11px] font-semibold text-amber-300 transition-colors hover:bg-slate-800 hover:text-amber-200"
            aria-label="Jump to hints and help"
          >
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Hints</span>
          </button>
          {isAlreadySolved && (
            <span className="flex items-center gap-1 font-mono text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Solved</span>
            </span>
          )}
          {nextExercise && (
            <button
              onClick={() => setCurrentExerciseId(nextExercise.id)}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              title={`Next: ${nextExercise.title}`}
              aria-label={`Next exercise: ${nextExercise.title}`}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile pane switcher */}
      <div className="flex shrink-0 gap-1 border-b border-slate-800 bg-slate-950 p-2 lg:hidden" role="tablist" aria-label="Workspace view">
        {(['problem', 'code'] as const).map(pane => {
          const selected = mobilePane === pane;
          return (
            <button
              key={pane}
              role="tab"
              aria-selected={selected}
              onClick={() => setMobilePane(pane)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                selected ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {pane === 'problem' ? 'Problem' : 'Code'}
              {pane === 'code' && runResults && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${runResults.allPassed ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  aria-label={runResults.allPassed ? 'All tests passing' : 'Some tests failing'}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Split Body: Left Instructions | Right Code Editor & Tests */}
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
        {/* Left Problem Description Panel */}
        <section
          aria-label="Problem description"
          className={`${mobilePane === 'problem' ? 'flex' : 'hidden'} min-w-0 flex-col border-b border-slate-800 bg-slate-900/30 lg:flex lg:w-5/12 lg:overflow-y-auto lg:border-b-0 lg:border-r`}
        >
          <div className="space-y-7 px-5 py-6 sm:px-6">
            <header>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {exercise.moduleTitle}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyClass}`}>
                  {exercise.difficulty}
                </span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{exercise.title}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">{exercise.description}</p>
            </header>

            {/* Instructions checklist */}
            <section>
              <SectionLabel>Instructions</SectionLabel>
              <ol className="space-y-2.5">
                {exercise.instructions.map((ins, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-700 font-mono text-[10px] text-slate-400">
                      {i + 1}
                    </span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Examples */}
            {exercise.examples.length > 0 && (
              <section>
                <SectionLabel>Examples</SectionLabel>
                <div className="space-y-2.5">
                  {exercise.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 font-mono text-xs">
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                        <span className="shrink-0 text-slate-500">Input</span>
                        <span className="break-all text-slate-200">{ex.input}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span className="shrink-0 text-slate-500">Output</span>
                        <span className="break-all text-emerald-300">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <p className="mt-2.5 border-t border-slate-800/80 pt-2 font-sans text-[11px] leading-5 text-slate-400">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Constraints if present */}
            {exercise.constraints && exercise.constraints.length > 0 && (
              <section>
                <SectionLabel>Constraints</SectionLabel>
                <ul className="list-disc space-y-1 pl-5 font-mono text-xs leading-6 text-slate-400">
                  {exercise.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tests the solution must pass */}
            {visibleTests.length > 0 && (
              <section>
                <SectionLabel>Tests your code must pass</SectionLabel>
                <div className="space-y-2">
                  {visibleTests.map(t => (
                    <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 text-xs">
                      <p className="font-medium text-slate-200">{t.description}</p>
                      <dl className="mt-1.5 space-y-1 font-mono">
                        <div className="flex flex-wrap gap-x-2">
                          <dt className="shrink-0 text-slate-500">Input</dt>
                          <dd className="break-all text-slate-300">{t.inputDescription}</dd>
                        </div>
                        <div className="flex flex-wrap gap-x-2">
                          <dt className="shrink-0 text-slate-500">Expected</dt>
                          <dd className="break-all text-emerald-300">{t.expectedOutputDescription}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="help-section" className="border-t border-slate-800 pt-6">
              <SectionLabel>Hints &amp; help</SectionLabel>
              <HelpPanel exercise={exercise} runResults={runResults} failedRuns={failedRuns} />
            </section>
          </div>
        </section>

        {/* Right Code Editor & Execution Panel */}
        <section
          aria-label="Code editor and test results"
          className={`${mobilePane === 'code' ? 'flex' : 'hidden'} h-[36rem] min-w-0 flex-col bg-slate-950 lg:flex lg:h-auto lg:min-h-0 lg:w-7/12`}
        >
          {/* Editor Header Toolbar */}
          <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/60 px-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Code2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
              <span className="truncate font-mono text-[11px] font-medium text-slate-300">{fileName}</span>
              <span className="hidden shrink-0 font-mono text-[10px] text-slate-500 md:inline">
                Ln {cursor.line}, Col {cursor.column}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {/* Font size toggle */}
              <div
                className="mr-1 hidden items-center gap-0.5 rounded border border-slate-800 bg-slate-950 p-0.5 sm:flex"
                role="group"
                aria-label="Editor font size"
              >
                {(['sm', 'base', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    aria-pressed={fontSize === size}
                    aria-label={`Font size ${size === 'sm' ? 'small' : size === 'base' ? 'medium' : 'large'}`}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
                      fontSize === size ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {size === 'sm' ? 'S' : size === 'base' ? 'M' : 'L'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                title="Copy code"
                aria-label="Copy code"
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>

              <button
                onClick={handleResetCode}
                title="Reset to starter code"
                aria-label="Reset to starter code"
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Interactive Code Editor with Line Numbers */}
          <div className="relative flex min-h-0 flex-1 bg-slate-950 font-mono">
            <div
              ref={gutterRef}
              aria-hidden="true"
              className={`w-10 shrink-0 select-none overflow-hidden border-r border-slate-800/80 bg-slate-900/30 py-3 pr-2 text-right text-slate-600 ${EDITOR_TEXT_CLASS[fontSize]}`}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="pr-0.5">{i + 1}</div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
              onSelect={e => updateCursor(e.currentTarget)}
              onClick={e => updateCursor(e.currentTarget)}
              spellCheck={false}
              wrap="off"
              aria-label={`${fileName} code editor`}
              className={`flex-1 resize-none overflow-auto bg-transparent px-3 py-3 text-emerald-300/90 caret-emerald-300 outline-none selection:bg-emerald-500/30 selection:text-white ${EDITOR_TEXT_CLASS[fontSize]}`}
              placeholder="Write your code here..."
            />
          </div>

          {/* Test Results / Console Drawer */}
          <div className="shrink-0 border-t border-slate-800 bg-slate-950">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/40 px-2">
              <div role="tablist" aria-label="Run results" className="flex items-center gap-0.5 py-1.5">
                <button
                  role="tab"
                  aria-selected={activeResultTab === 'tests'}
                  onClick={() => setActiveResultTab('tests')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    activeResultTab === 'tests' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tests
                  <span className={`rounded px-1 py-px font-mono text-[10px] ${activeResultTab === 'tests' ? 'bg-slate-900/80 text-slate-300' : 'bg-slate-800/60 text-slate-500'}`}>
                    {runResults ? `${runResults.passedTests}/${runResults.totalTests}` : totalTests}
                  </span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeResultTab === 'console'}
                  onClick={() => setActiveResultTab('console')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    activeResultTab === 'console' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Console
                  {runResults && runResults.consoleOutput.length > 0 && (
                    <span className="rounded bg-slate-800/60 px-1 py-px font-mono text-[10px] text-slate-400">
                      {runResults.consoleOutput.length}
                    </span>
                  )}
                </button>
              </div>
              {runResults && (
                <span className={`shrink-0 pr-1 font-mono text-[10px] font-medium ${runResults.allPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {runResults.allPassed ? 'All passing' : `${failingCount} failing`}
                </span>
              )}
            </div>

            <div className="h-36 overflow-y-auto p-3 font-mono text-xs sm:h-40" role="tabpanel">
              {isRunning ? (
                <div className="flex h-full items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" aria-hidden="true" />
                  <span>Compiling &amp; evaluating test suite...</span>
                </div>
              ) : !runResults ? (
                <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center text-slate-500">
                  <TerminalIcon className="h-5 w-5 text-slate-600" aria-hidden="true" />
                  <p className="text-[11px]">Run the tests to see results here.</p>
                  <p className="text-[10px] text-slate-600">Ctrl + Enter</p>
                </div>
              ) : activeResultTab === 'tests' ? (
                <div className="space-y-2">
                  {/* Result Summary Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 text-[11px]">
                    <span className={`flex items-center gap-1.5 font-semibold ${runResults.allPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {runResults.allPassed ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <XCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                      {runResults.allPassed
                        ? `All ${runResults.totalTests} tests passed`
                        : `${runResults.passedTests} of ${runResults.totalTests} tests passed`}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-500">{runResults.executionTimeMs}ms</span>
                  </div>

                  {runResults.error && (
                    <div className="rounded-md border border-rose-500/30 bg-rose-950/20 p-2 text-[11px] text-rose-300">
                      {runResults.error}
                    </div>
                  )}

                  {/* Success Banner */}
                  {submissionSuccess && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2.5">
                      <div>
                        <h4 className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> Challenge solved
                        </h4>
                        <p className="text-[11px] text-emerald-400/80">
                          +{exercise.xpReward} XP added to your streak
                        </p>
                      </div>
                      {nextExercise && (
                        <button
                          onClick={() => setCurrentExerciseId(nextExercise.id)}
                          className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-400 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 transition-colors hover:bg-emerald-300"
                        >
                          Next <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Individual Test Cards */}
                  <div className="space-y-1.5">
                    {runResults.results.map((res, i) => (
                      <div
                        key={res.testId || i}
                        className={`rounded-md border p-2.5 text-xs ${
                          res.passed
                            ? 'border-emerald-900/50 bg-emerald-950/20'
                            : 'border-rose-900/50 bg-rose-950/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`flex items-start gap-1.5 text-[11px] font-medium ${res.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {res.passed
                              ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                              : <XCircle className="mt-px h-3.5 w-3.5 shrink-0 text-rose-400" aria-hidden="true" />}
                            <span>{res.description}</span>
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-500">{res.executionTimeMs}ms</span>
                        </div>

                        {!res.passed && (
                          <div className="mt-2 space-y-1 rounded border border-rose-900/30 bg-slate-950/80 p-2 text-[11px]">
                            {res.error ? (
                              <div className="break-all text-rose-400">{res.error}</div>
                            ) : (
                              <>
                                <div className="break-all text-slate-400">
                                  Expected: <span className="text-emerald-400">{JSON.stringify(res.expected)}</span>
                                </div>
                                <div className="break-all text-slate-400">
                                  Actual: <span className="text-rose-400">{JSON.stringify(res.actual)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Console Output Tab */
                <div className="space-y-1">
                  {runResults.consoleOutput.length === 0 ? (
                    <p className="italic text-slate-500">No console output during this run.</p>
                  ) : (
                    runResults.consoleOutput.map((out, i) => (
                      <div key={i} className="flex gap-2 leading-5 text-slate-300">
                        <span className="select-none text-slate-600">&gt;</span>
                        <span className="break-all">{out}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Execution Bar */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-800 bg-slate-900/60 p-2.5">
            <span className="hidden items-center gap-1.5 font-mono text-[10px] text-slate-500 md:flex">
              Ctrl + Enter to run
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/60 px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                {isRunning
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  : <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />}
                <span>{isRunning ? 'Running…' : 'Run tests'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isRunning}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-400 px-3.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
