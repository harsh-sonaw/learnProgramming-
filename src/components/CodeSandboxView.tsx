import React, { useState } from 'react';
import { Check, Copy, Loader2, Play, RotateCcw, Share2, Terminal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageId } from '../types';
import { runCode, executeSql } from '../utils/codeRunner';
import { TAB_PAGES } from '../utils/routes';
import { Button, ButtonLink, Page, PageHeader } from './ui';

const LANGUAGES: { id: LanguageId; label: string; extension: string }[] = [
  { id: 'python', label: 'Python', extension: 'py' },
  { id: 'javascript', label: 'JavaScript', extension: 'js' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts' },
  { id: 'go', label: 'Go', extension: 'go' },
  { id: 'sql', label: 'SQL', extension: 'sql' },
];

const STARTER_OUTPUT = ['Ready. Press Run to execute your code.'];

export const CodeSandboxView: React.FC = () => {
  const { sandboxCode, setSandboxCode, sandboxLanguage, setSandboxLanguage } = useApp();
  const [output, setOutput] = useState<string[]>(STARTER_OUTPUT);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = sandboxCode[sandboxLanguage];
  const current = LANGUAGES.find(language => language.id === sandboxLanguage)!;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      if (sandboxLanguage === 'sql') {
        const result = executeSql(code);
        setOutput(
          result.error
            ? [`SQL error: ${result.error}`]
            : [`${result.rows.length} row(s) returned:`, JSON.stringify(result.rows, null, 2)]
        );
      } else {
        const result = await runCode(sandboxLanguage, code, []);
        if (result.consoleOutput.length > 0) setOutput(result.consoleOutput);
        else if (result.error) setOutput([`Error: ${result.error}`]);
        else setOutput(['Executed successfully with no output.']);
      }
    } catch (error) {
      setOutput([`Execution error: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSandboxCode(sandboxLanguage, '');
    setOutput(STARTER_OUTPUT);
  };

  return (
    <Page width="wide">
      <PageHeader
        eyebrow="Practice"
        title="Playground"
        description="A scratchpad for Python, JavaScript, TypeScript, Go and SQL. Nothing here is graded."
        actions={
          <ButtonLink href={TAB_PAGES.sandboxShare} variant="secondary" size="sm">
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            Share snippet
          </ButtonLink>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Language">
        {LANGUAGES.map(language => {
          const selected = sandboxLanguage === language.id;
          return (
            <button
              key={language.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setSandboxLanguage(language.id)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                selected
                  ? 'bg-slate-800 font-medium text-white'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {language.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex h-[26rem] flex-col overflow-hidden rounded-lg border border-slate-800">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/40 px-3 py-2">
            <span className="font-mono text-[11px] text-slate-400">scratch.{current.extension}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Copy code"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
              <button
                onClick={handleReset}
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Clear editor"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={event => setSandboxCode(sandboxLanguage, event.target.value)}
            spellCheck={false}
            aria-label={`${current.label} code`}
            placeholder="Write some code"
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-6 text-slate-200 selection:bg-emerald-500/30 focus:outline-none"
          />
        </div>

        <div className="flex h-[26rem] flex-col overflow-hidden rounded-lg border border-slate-800">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/40 px-3 py-2">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
              Output
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOutput([])}
                className="rounded px-1.5 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              >
                Clear
              </button>
              <Button size="sm" variant="primary" onClick={handleRun} disabled={isRunning}>
                {isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                )}
                {isRunning ? 'Running' : 'Run'}
              </Button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 font-mono text-xs leading-6" role="log">
            {output.length === 0 ? (
              <p className="italic text-slate-600">Output cleared.</p>
            ) : (
              output.map((line, index) => (
                <div key={index} className="flex gap-2 text-slate-300">
                  <span className="select-none text-slate-700">&gt;</span>
                  <span className="break-all">{line}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};
