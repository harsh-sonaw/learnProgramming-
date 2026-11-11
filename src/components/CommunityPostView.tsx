import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, GitFork, MessageCircle, ThumbsUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { readQueryParam, TAB_PAGES, navigateToTab } from '../utils/routes';
import { Button, ButtonLink, Card, EmptyState, Page, PageHeader, Section, inputClass } from './ui';

/** Formerly a modal over the discussion list. */
export const CommunityPostView: React.FC = () => {
  const { forumPosts, addCommentToPost, markAnswerAccepted, upvoteForumPost, forkCodeToSandbox } = useApp();
  const postId = readQueryParam('id');
  const post = forumPosts.find(candidate => candidate.id === postId);
  const [reply, setReply] = useState('');

  if (!post) {
    return (
      <Page width="narrow">
        <PageHeader eyebrow="Community" title="Discussion" />
        <EmptyState
          icon={<MessageCircle className="h-6 w-6" />}
          title="This discussion is not here"
          description="It may have been removed, or the link is out of date."
          action={
            <ButtonLink href={TAB_PAGES.community} variant="primary" size="sm">
              Back to community
            </ButtonLink>
          }
        />
      </Page>
    );
  }

  const handleReply = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reply.trim()) return;
    addCommentToPost(post.id, reply.trim());
    setReply('');
  };

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={`Community · ${post.category === 'qna' ? 'Q&A' : post.category}`}
        title={post.title}
        description={`${post.authorName} · ${post.createdAt}`}
        actions={
          <ButtonLink href={TAB_PAGES.community} size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Community
          </ButtonLink>
        }
      />

      <Section>
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{post.content}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => upvoteForumPost(post.id)}>
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
            {post.upvotes}
          </Button>
          {post.tags.map(tag => (
            <span key={tag} className="font-mono text-[11px] text-slate-500">
              #{tag}
            </span>
          ))}
        </div>

        {post.codeSnippet && (
          <Card className="mt-6 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
              <span className="font-mono text-[11px] text-slate-500">
                snippet.{post.codeLanguage ?? 'txt'}
              </span>
              {post.codeLanguage && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => forkCodeToSandbox(post.codeSnippet!, post.codeLanguage!)}
                >
                  <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                  Fork in playground
                </Button>
              )}
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-slate-200">
              {post.codeSnippet}
            </pre>
          </Card>
        )}
      </Section>

      <Section title={`Replies (${post.comments.length})`}>
        {post.comments.length === 0 ? (
          <EmptyState title="No replies yet" description="Be the first to answer." />
        ) : (
          <ul className="space-y-3">
            {post.comments.map(comment => (
              <li
                key={comment.id}
                className={`rounded-lg border p-4 ${
                  comment.isAcceptedAnswer
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-medium text-slate-200">
                      {comment.authorName.charAt(0)}
                    </span>
                    <span className="text-xs font-medium text-slate-200">{comment.authorName}</span>
                    <span className="text-[11px] text-slate-500">{comment.createdAt}</span>
                  </div>
                  {comment.isAcceptedAnswer ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Accepted answer
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAnswerAccepted(post.id, comment.id)}
                    >
                      Mark accepted
                    </Button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleReply} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="reply" className="sr-only">
            Your reply
          </label>
          <input
            id="reply"
            value={reply}
            onChange={event => setReply(event.target.value)}
            placeholder="Share an answer or suggestion"
            className={inputClass}
          />
          <Button type="submit" variant="primary" className="shrink-0">
            Reply
          </Button>
        </form>
      </Section>
    </Page>
  );
};
