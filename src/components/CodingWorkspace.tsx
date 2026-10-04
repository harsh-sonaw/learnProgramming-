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
  Code2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_EXERCISES, COURSES } from '../data/courses';
import { runCode } from '../utils/codeRunner';
import { RunResults } from '../types';
import { HelpPanel } from './HelpPanel';

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
  const [showHintIndex, setShowHintIndex] = useState<number>(-1);
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
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [copied, setCopied] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync code whenever exercise changes
  useEffect(() => {
    if (user.solvedExercises[exercise.id]?.code) {
      setCode(user.solvedExercises[exercise.id].code);
    } else {
      setCode(exercise.starterCode);
    }
    setRunResults(null);
    setShowHintIndex(-1);
    setFailedRuns(0);
    setSubmissionSuccess(false);
  }, [exercise.id]);

  // Find next exercise in same course or next track
  const currentCourseExercises = COURSES[exercise.trackId]?.modules.flatMap(m => m.exercises) || [];
  const currentIndex = currentCourseExercises.findIndex(e => e.id === exercise.id);
  const nextExercise = currentCourseExercises[currentIndex + 1];

  const handleResetCode = () => {
    setCode(exercise.starterCode);
    setRunResults(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    } finally {
      setIsRunning(false);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-xs';
      case 'base': return 'text-sm';
      case 'lg': return 'text-base';
    }
  };

  const lineCount = Math.max(code.split('\n').length, 14);

  return (
    <div className="min-h-[calc(100vh-4.1rem)] lg:h-[calc(100vh-4.1rem)] flex flex-col bg-slate-950 text-slate-100 lg:overflow-hidden">
      {/* Top Breadcrumb & Exercise Switcher */}
      <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('tracks')}
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Tracks</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-emerald-400 uppercase font-semibold">{exercise.trackId}</span>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{exercise.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-400 font-semibold bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded text-[11px]">
            +{exercise.xpReward} XP
          </span>
          <button
            onClick={() => document.getElementById('help-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[11px] font-mono font-semibold"
            title="Jump to hints and help"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Hints
          </button>
          {isAlreadySolved && (
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved
            </span>
          )}
          {nextExercise && (
            <button
              onClick={() => setCurrentExerciseId(nextExercise.id)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
              title={`Next: ${nextExercise.title}`}
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Body: Left Instructions | Right Code Editor & Tests */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Left Problem Description Panel */}
        <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 lg:overflow-y-auto p-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                {exercise.moduleTitle}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-emerald-400">{exercise.difficulty}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{exercise.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              {exercise.description}
            </p>
          </div>

          {/* Instructions checklist */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Instructions
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {exercise.instructions.map((ins, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono font-bold mt-0.5">{i + 1}.</span>
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Examples
            </h3>
            <div className="space-y-3">
              {exercise.examples.map((ex, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-xs space-y-1">
                  <div className="text-slate-400">
                    <span className="text-slate-500">Input:</span> <span className="text-slate-200">{ex.input}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-500">Output:</span> <span className="text-emerald-300">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-[11px] text-slate-400 font-sans pt-1 border-t border-slate-800">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Constraints if present */}
          {exercise.constraints && exercise.constraints.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Constraints
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono">
                {exercise.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tests the solution must pass */}
          {exercise.testCases.filter(t => !t.isHidden).length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Your code must pass these tests
              </h3>
              <div className="space-y-2">
                {exercise.testCases.filter(t => !t.isHidden).map(t => (
                  <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs font-mono space-y-0.5">
                    <div className="text-slate-300 font-sans font-medium">{t.description}</div>
                    <div className="text-slate-500">Input: <span className="text-slate-200 break-all">{t.inputDescription}</span></div>
                    <div className="text-slate-500">Expected: <span className="text-emerald-300 break-all">{t.expectedOutputDescription}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isDesktop && (
            <div id="help-section">
              <HelpPanel exercise={exercise} runResults={runResults} failedRuns={failedRuns} />
            </div>
          )}
        </div>

        {/* Right Code Editor & Execution Panel */}
        <div className="lg:hidden px-5 py-2 bg-slate-900 border-y border-slate-800 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
          Write your code
        </div>
        <div className="w-full lg:w-7/12 flex flex-col h-[36rem] lg:h-full bg-slate-950">
          {/* Editor Header Toolbar */}
          <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] font-semibold">
                {exercise.trackId === 'python' ? 'solution.py' : exercise.trackId === 'sql' ? 'query.sql' : 'solution.ts'}
              </span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">Ctrl + Enter to run</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Font size toggle */}
              <div className="flex items-center bg-slate-800 rounded p-0.5 text-[10px] font-mono mr-1">
                {(['sm', 'base', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-1.5 py-0.5 rounded ${fontSize === size ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                title="Copy Code"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleResetCode}
                title="Reset Starter Code"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Code Editor with Line Numbers */}
          <div className="flex-1 min-h-[220px] relative overflow-hidden flex bg-slate-950 font-mono">
            {/* Gutter Line Numbers */}
            <div className="w-10 pt-3 pb-3 pr-2 text-right select-none text-slate-600 bg-slate-950/80 border-r border-slate-900 text-xs font-mono leading-6">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className={`flex-1 p-3 bg-transparent text-emerald-300/90 font-mono ${getFontSizeClass()} leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-emerald-500/30 selection:text-white`}
              placeholder="Write your code here..."
            />
          </div>

          {/* Bottom Execution Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveResultTab('tests')}
                className={`px-3 py-1.5 rounded text-xs font-semibold font-mono transition-colors ${
                  activeResultTab === 'tests' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Test Suite ({exercise.testCases.length})
              </button>
              <button
                onClick={() => setActiveResultTab('console')}
                className={`px-3 py-1.5 rounded text-xs font-semibold font-mono transition-colors ${
                  activeResultTab === 'console' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Console Output {runResults?.consoleOutput.length ? `(${runResults.consoleOutput.length})` : ''}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Run Tests</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                disabled={isRunning}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Solution</span>
              </button>
            </div>
          </div>

          {/* Test Results / Console Drawer */}
          <div className="h-44 sm:h-52 bg-slate-950 border-t border-slate-800/80 overflow-y-auto p-4 font-mono text-xs">
            {isRunning ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Compiling & evaluating test suite...</span>
              </div>
            ) : !runResults ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center gap-1">
                <TerminalIcon className="w-6 h-6 text-slate-600 mb-1" />
                <p>Click "Run Tests" or press Ctrl+Enter to execute test assertions.</p>
              </div>
            ) : activeResultTab === 'tests' ? (
              <div className="space-y-3">
                {/* Result Summary Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    {runResults.allPassed ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> All {runResults.totalTests} Tests Passed!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                        <XCircle className="w-4 h-4" /> {runResults.passedTests} of {runResults.totalTests} Tests Passed
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Execution: {runResults.executionTimeMs}ms
                  </span>
                </div>

                {/* Success Banner */}
                {submissionSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <h4 className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" /> Challenge Solved!
                      </h4>
                      <p className="text-[11px] text-emerald-400/80">
                        Earned +{exercise.xpReward} XP & advanced daily streak!
                      </p>
                    </div>
                    {nextExercise && (
                      <button
                        onClick={() => setCurrentExerciseId(nextExercise.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        Next Exercise <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Individual Test Cards */}
                <div className="space-y-2">
                  {runResults.results.map((res, i) => (
                    <div
                      key={res.testId || i}
                      className={`p-2.5 rounded-lg border text-xs ${
                        res.passed 
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' 
                          : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold flex items-center gap-1.5">
                          {res.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                          Test #{i + 1}: {res.description}
                        </span>
                        <span className="text-[10px] text-slate-500">{res.executionTimeMs}ms</span>
                      </div>

                      {!res.passed && (
                        <div className="mt-2 space-y-1 text-[11px] bg-slate-950/80 p-2 rounded border border-rose-900/30">
                          {res.error ? (
                            <div className="text-rose-400">Error: {res.error}</div>
                          ) : (
                            <>
                              <div className="text-slate-400">
                                Expected: <span className="text-emerald-400">{JSON.stringify(res.expected)}</span>
                              </div>
                              <div className="text-slate-400">
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
                  <p className="text-slate-500 italic">No console logs output during this run.</p>
                ) : (
                  runResults.consoleOutput.map((out, i) => (
                    <div key={i} className="text-slate-300 leading-5">
                      <span className="text-slate-600 select-none mr-2">&gt;</span>
                      {out}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {!isDesktop && (
          <div id="help-section" className="p-5 border-t border-slate-800 bg-slate-900/40">
            <div className="mb-4 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">Need help?</div>
            <HelpPanel exercise={exercise} runResults={runResults} failedRuns={failedRuns} />
          </div>
        )}
      </div>
    </div>
  );
};
