import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Share2, 
  Terminal, 
  Code2, 
  Database, 
  Cpu, 
  Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageId } from '../types';
import { runCode, executeSql } from '../utils/codeRunner';

export const CodeSandboxView: React.FC = () => {
  const { 
    sandboxCode, 
    setSandboxCode, 
    sandboxLanguage, 
    setSandboxLanguage, 
    createForumPost,
    setActiveTab,
    triggerConfetti 
  } = useApp();

  const [outputLines, setOutputLines] = useState<string[]>([
    'DevPulse Interactive Code Runner ready.',
    'Select a language and press "Run Code" to execute.'
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [shareCategory, setShareCategory] = useState<'projects' | 'qna' | 'tips' | 'showcase'>('projects');
  const [shareCollaborative, setShareCollaborative] = useState(true);

  const currentCode = sandboxCode[sandboxLanguage];

  const handleRun = async () => {
    setIsRunning(true);
    const logs: string[] = [];

    try {
      if (sandboxLanguage === 'sql') {
        const res = executeSql(currentCode);
        if (res.error) {
          setOutputLines([`[SQL ERROR] ${res.error}`]);
        } else {
          setOutputLines([
            `Query executed successfully. Returned ${res.rows.length} row(s):`,
            JSON.stringify(res.rows, null, 2)
          ]);
        }
      } else {
        const res = await runCode(sandboxLanguage, currentCode, []);
        if (res.consoleOutput.length > 0) {
          setOutputLines(res.consoleOutput);
        } else if (res.error) {
          setOutputLines([`[ERROR] ${res.error}`]);
        } else {
          setOutputLines(['Code executed successfully (no stdout produced).']);
        }
      }
    } catch (err: any) {
      setOutputLines([`[EXECUTION ERROR] ${err.message || String(err)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTitle.trim() || !shareDescription.trim()) return;

    createForumPost({
      title: shareTitle,
      content: shareDescription,
      category: shareCategory,
      language: sandboxLanguage,
      tags: [sandboxLanguage, 'playground', 'community'],
      codeSnippet: currentCode,
      codeLanguage: sandboxLanguage,
      isCollaborative: shareCollaborative,
      lookingForCollaborators: shareCollaborative
    });

    setShareModalOpen(false);
    triggerConfetti();
    setActiveTab('community');
  };

  const getLangIcon = (id: LanguageId) => {
    switch (id) {
      case 'python': return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'javascript': return <Code2 className="w-4 h-4 text-yellow-400" />;
      case 'typescript': return <Layers className="w-4 h-4 text-blue-400" />;
      case 'go': return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'sql': return <Database className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            Code Sandbox & Playground
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Experiment freely, test scripts, and publish working prototypes directly to the community forum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Share to Forum</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['python', 'javascript', 'typescript', 'go', 'sql'] as LanguageId[]).map(lang => (
          <button
            key={lang}
            onClick={() => setSandboxLanguage(lang)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              sandboxLanguage === lang
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-900'
            }`}
          >
            {getLangIcon(lang)}
            <span className="capitalize">{lang}</span>
          </button>
        ))}
      </div>

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[550px]">
        {/* Editor Box */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              playground.{sandboxLanguage === 'python' ? 'py' : sandboxLanguage === 'sql' ? 'sql' : 'ts'}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <textarea
            value={currentCode}
            onChange={e => setSandboxCode(sandboxLanguage, e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 bg-transparent text-emerald-300 font-mono text-xs leading-6 resize-none focus:outline-none selection:bg-emerald-500/30 selection:text-white"
            placeholder="Type your code here..."
          />
        </div>

        {/* Console Stdout Box */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
          <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Standard Output (stdout)
            </span>
            <button
              onClick={() => setOutputLines(['Console cleared.'])}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 bg-slate-950/90 text-slate-300">
            {outputLines.map((line, idx) => (
              <div key={idx} className="leading-5">
                <span className="text-slate-600 select-none mr-2">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share to Community Forum Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Share Project with DevPulse Community
            </h3>
            <p className="text-xs text-slate-400">
              Your code snippet will be published so other developers can run it, fork it, and collaborate.
            </p>

            <form onSubmit={handlePublishToCommunity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={shareTitle}
                  onChange={e => setShareTitle(e.target.value)}
                  placeholder="e.g. Distributed Ring Buffer in TypeScript"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={shareCategory}
                  onChange={e => setShareCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="projects">Collaborative Project</option>
                  <option value="showcase">Show & Tell</option>
                  <option value="qna">Help & Peer Q&A</option>
                  <option value="tips">Tips & Best Practices</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Documentation
                </label>
                <textarea
                  required
                  rows={3}
                  value={shareDescription}
                  onChange={e => setShareDescription(e.target.value)}
                  placeholder="Explain what this snippet does and how peers can contribute or test it..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="collab"
                  checked={shareCollaborative}
                  onChange={e => setShareCollaborative(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="collab" className="text-xs text-slate-300 select-none">
                  Open for peer collaborators (display "Looking for collaborators" badge)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Publish & Earn +25 XP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
