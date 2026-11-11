import React, { useState } from 'react';
import { MessageCircle, Plus, Search, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ForumCategory } from '../types';
import { withParam, TAB_PAGES } from '../utils/routes';
import { ButtonLink, Card, EmptyState, Page, PageHeader, inputClass } from './ui';

const CATEGORIES: { id: ForumCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'qna', label: 'Questions' },
  { id: 'projects', label: 'Projects' },
  { id: 'tips', label: 'Tips' },
  { id: 'showcase', label: 'Showcase' },
];

export const CommunityForumView: React.FC = () => {
  const { forumPosts, upvoteForumPost, user } = useApp();
  const [category, setCategory] = useState<ForumCategory>('all');
  const [query, setQuery] = useState('');

  const posts = forumPosts.filter(post => {
    if (category !== 'all' && post.category !== category) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <Page>
      <PageHeader
        eyebrow="Community"
        title="Discussions"
        description="Ask questions, share what you built, and find people to build with."
        actions={
          <ButtonLink href={TAB_PAGES.communityNew} variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New discussion
          </ButtonLink>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Category">
          {CATEGORIES.map(option => {
            const selected = category === option.id;
            return (
              <button
                key={option.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setCategory(option.id)}
                className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  selected ? 'bg-slate-800 font-medium text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600"
            aria-hidden="true"
          />
          <label htmlFor="post-search" className="sr-only">
            Search discussions
          </label>
          <input
            id="post-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search"
            className={`${inputClass} pl-8 py-1.5 text-xs`}
          />
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-6 w-6" />}
          title="Nothing here yet"
          description={query ? 'No discussions match that search.' : 'Start the first discussion in this category.'}
          action={
            <ButtonLink href={TAB_PAGES.communityNew} variant="primary" size="sm">
              New discussion
            </ButtonLink>
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {posts.map(post => (
            <Card as="li" key={post.id} className="p-4 transition-colors hover:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-medium text-slate-200">
                    {post.authorName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <a
                      href={withParam('communityPost', 'id', post.id)}
                      className="block truncate text-sm font-medium text-slate-100 hover:text-emerald-300"
                    >
                      {post.title}
                    </a>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                      <span>{post.authorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.createdAt}</span>
                      {post.hasAcceptedAnswer && <span className="text-emerald-400">answered</span>}
                      {post.isCollaborative && <span className="text-slate-400">open to collab</span>}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => upvoteForumPost(post.id)}
                    aria-label={`Upvote, ${post.upvotes} votes`}
                    className={`flex items-center gap-1 rounded px-1.5 py-1 font-mono text-[11px] transition-colors ${
                      user.upvotedPostIds?.includes(post.id)
                        ? 'text-emerald-400'
                        : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" aria-hidden="true" />
                    {post.upvotes}
                  </button>
                  <a
                    href={withParam('communityPost', 'id', post.id)}
                    className="flex items-center gap-1 rounded px-1.5 py-1 font-mono text-[11px] text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                    aria-label={`${post.commentsCount} replies`}
                  >
                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                    {post.commentsCount}
                  </a>
                </div>
              </div>

              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{post.content}</p>

              {post.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {post.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="font-mono text-[10px] text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </ul>
      )}
    </Page>
  );
};
