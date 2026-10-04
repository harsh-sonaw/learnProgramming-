import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  CheckCircle2, 
  Share2, 
  Search, 
  Plus, 
  Terminal, 
  Code2, 
  Sparkles, 
  Users, 
  GitFork, 
  Copy, 
  Check, 
  X,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ForumPost, ForumCategory, LanguageId } from '../types';

export const CommunityForumView: React.FC = () => {
  const { 
    forumPosts, 
    createForumPost, 
    upvoteForumPost, 
    addCommentToPost, 
    markAnswerAccepted, 
    toggleStarProject,
    forkCodeToSandbox, 
    user 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<ForumCategory>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // New Post Modal State
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'qna' | 'projects' | 'tips' | 'showcase'>('qna');
  const [newLanguage, setNewLanguage] = useState<LanguageId | 'general'>('python');
  const [newTags, setNewTags] = useState('');
  const [newSnippet, setNewSnippet] = useState('');
  const [isCollab, setIsCollab] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Filter posts
  const filteredPosts = forumPosts.filter(post => {
    if (activeCategory !== 'all' && post.category !== activeCategory) return false;
    if (selectedLanguage !== 'all' && post.language !== selectedLanguage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchContent = post.content.toLowerCase().includes(q);
      const matchTags = post.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    createForumPost({
      title: newTitle,
      content: newContent,
      category: newCategory,
      language: newLanguage,
      tags: parsedTags.length > 0 ? parsedTags : [newLanguage],
      codeSnippet: newSnippet.trim() ? newSnippet : undefined,
      codeLanguage: newLanguage !== 'general' ? newLanguage : undefined,
      isCollaborative: isCollab,
      lookingForCollaborators: isCollab
    });

    setNewTitle('');
    setNewContent('');
    setNewSnippet('');
    setNewTags('');
    setNewPostModalOpen(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !newCommentText.trim()) return;

    addCommentToPost(activePost.id, newCommentText);
    setNewCommentText('');
    // refresh activePost reference
    const updated = forumPosts.find(p => p.id === activePost.id);
    if (updated) {
      setActivePost({
        ...updated,
        commentsCount: updated.commentsCount + 1,
        comments: [
          ...updated.comments,
          {
            id: `temp-${Date.now()}`,
            authorId: user.id,
            authorName: user.displayName,
            authorAvatar: user.avatarSeed,
            authorAvatarBg: user.avatarBg,
            content: newCommentText,
            createdAt: 'Just now',
            upvotes: 0
          }
        ]
      });
    }
  };

  const handleCopyCode = (postId: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            Developer Community & Project Collab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Get peer debugging support, discuss tricky algorithmic concepts, and fork collaborative projects.
          </p>
        </div>

        <button
          onClick={() => setNewPostModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Discussion or Project</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'all', label: 'All Discussions' },
            { id: 'qna', label: 'Peer Q&A' },
            { id: 'projects', label: 'Collaborative Projects' },
            { id: 'tips', label: 'Tips & Guides' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeCategory === tab.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics, questions, tags..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Language filter pills */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto pb-1">
        <span className="text-[11px] text-slate-500">Filter Language:</span>
        {['all', 'python', 'javascript', 'typescript', 'go', 'sql'].map(lang => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-2.5 py-1 rounded-md text-[11px] uppercase transition-colors ${
              selectedLanguage === lang
                ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No discussions found</h3>
            <p className="text-xs text-slate-400">Be the first to start a conversation in this topic!</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isStarred = user.starredProjectIds.includes(post.id);

            return (
              <div
                key={post.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-slate-700/80 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${post.authorAvatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                        {post.isCollaborative && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Collab Project
                          </span>
                        )}
                        {post.hasAcceptedAnswer && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Solved
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => setActivePost(post)}
                        className="text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer mt-1"
                      >
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {post.isCollaborative && (
                      <button
                        onClick={() => toggleStarProject(post.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          isStarred ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title="Bookmark / Star Project"
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={() => upvoteForumPost(post.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                      title="Upvote discussion"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{post.upvotes}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>

                {/* Code preview snippet if attached */}
                {post.codeSnippet && (
                  <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                    <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>snippet.{post.codeLanguage || 'ts'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(post.id, post.codeSnippet!)}
                          className="hover:text-white flex items-center gap-1"
                        >
                          {copiedPostId === post.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPostId === post.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        {post.codeLanguage && (
                          <button
                            onClick={() => forkCodeToSandbox(post.codeSnippet!, post.codeLanguage!)}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                          >
                            <GitFork className="w-3 h-3" />
                            <span>Fork in Playground</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <pre className="p-3 text-emerald-300/80 max-h-32 overflow-y-auto overflow-x-auto text-[11px] leading-5">
                      {post.codeSnippet}
                    </pre>
                  </div>
                )}

                {/* Footer tags and comments count */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="text-[11px] font-mono text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setActivePost(post)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.commentsCount} comments</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Discussion Detail Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                  <span className="uppercase text-emerald-400">{activePost.category}</span>
                  <span>·</span>
                  <span>{activePost.language}</span>
                  <span>·</span>
                  <span>{activePost.createdAt}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{activePost.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-6 h-6 rounded-md ${activePost.authorAvatarBg} flex items-center justify-center text-white text-[11px] font-bold`}>
                    {activePost.authorName.charAt(0)}
                  </div>
                  <span className="text-xs text-slate-300 font-semibold">{activePost.authorName}</span>
                </div>
              </div>
              <button
                onClick={() => setActivePost(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activePost.content}
              </p>

              {activePost.codeSnippet && (
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                  <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Code Attached</span>
                    {activePost.codeLanguage && (
                      <button
                        onClick={() => {
                          forkCodeToSandbox(activePost.codeSnippet!, activePost.codeLanguage!);
                          setActivePost(null);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                      >
                        <GitFork className="w-3.5 h-3.5" />
                        <span>Fork to Playground</span>
                      </button>
                    )}
                  </div>
                  <pre className="p-4 text-emerald-300 overflow-x-auto text-xs leading-5">
                    {activePost.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Comments Thread */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Peer Answers & Discussion ({activePost.comments.length})
                </h3>

                {activePost.comments.map(c => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      c.isAcceptedAnswer
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md ${c.authorAvatarBg} flex items-center justify-center text-white text-[10px] font-bold`}>
                          {c.authorName.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{c.authorName}</span>
                        <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                      </div>

                      {c.isAcceptedAnswer ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
                        </span>
                      ) : (
                        <button
                          onClick={() => markAnswerAccepted(activePost.id, c.id)}
                          className="text-[11px] text-slate-400 hover:text-emerald-400"
                        >
                          Mark Accepted
                        </button>
                      )}
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Share your answer, insight, or suggestion..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Post Modal */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">Create Community Discussion</h3>
              <button onClick={() => setNewPostModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Best pattern for async race conditions in TypeScript"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="qna">Peer Q&A / Debugging</option>
                    <option value="projects">Collaborative Project</option>
                    <option value="tips">Tips & Architecture</option>
                    <option value="showcase">Showcase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
                  <select
                    value={newLanguage}
                    onChange={e => setNewLanguage(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                    <option value="general">General / Polyglot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Content / Explanation</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Describe your question or outline your project goals..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={newSnippet}
                  onChange={e => setNewSnippet(e.target.value)}
                  placeholder="// Paste code here..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="algorithms, performance, concurrency"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="collab-check"
                  checked={isCollab}
                  onChange={e => setIsCollab(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="collab-check" className="text-xs text-slate-300">
                  Tag as Collaborative Project (Invite peer forks)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Post (+25 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
