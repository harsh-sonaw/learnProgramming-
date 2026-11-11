import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageId } from '../types';
import { Button, ButtonLink, Field, Page, PageHeader, Section, inputClass } from './ui';
import { TAB_PAGES, navigateToTab } from '../utils/routes';

type PostCategory = 'qna' | 'projects' | 'tips' | 'showcase';

/** Previously a modal over the discussion list. */
export const NewDiscussionView: React.FC = () => {
  const { createForumPost } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('qna');
  const [language, setLanguage] = useState<LanguageId | 'general'>('python');
  const [tags, setTags] = useState('');
  const [snippet, setSnippet] = useState('');
  const [collaborative, setCollaborative] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const parsedTags = tags
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);

    createForumPost({
      title: title.trim(),
      content: content.trim(),
      category,
      language,
      tags: parsedTags.length > 0 ? parsedTags : [language],
      codeSnippet: snippet.trim() ? snippet : undefined,
      codeLanguage: language === 'general' ? undefined : language,
      isCollaborative: collaborative,
      lookingForCollaborators: collaborative,
    });

    navigateToTab('community');
  };

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Community"
        title="New discussion"
        description="Ask a question, share a tip, or open a project to collaborators."
        actions={
          <ButtonLink href={TAB_PAGES.community} size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Community
          </ButtonLink>
        }
      />

      <Section>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Title" htmlFor="post-title">
            <input
              id="post-title"
              required
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="What are you working on?"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="post-category">
              <select
                id="post-category"
                value={category}
                onChange={event => setCategory(event.target.value as PostCategory)}
                className={inputClass}
              >
                <option value="qna">Question / debugging</option>
                <option value="projects">Collaborative project</option>
                <option value="tips">Tip or guide</option>
                <option value="showcase">Showcase</option>
              </select>
            </Field>

            <Field label="Language" htmlFor="post-language">
              <select
                id="post-language"
                value={language}
                onChange={event => setLanguage(event.target.value as LanguageId | 'general')}
                className={inputClass}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="sql">SQL</option>
                <option value="general">General</option>
              </select>
            </Field>
          </div>

          <Field label="Details" htmlFor="post-content">
            <textarea
              id="post-content"
              required
              rows={5}
              value={content}
              onChange={event => setContent(event.target.value)}
              placeholder="Add context, what you tried, and what you expected."
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Code snippet" htmlFor="post-snippet" hint="Optional. Shown as code in your post.">
            <textarea
              id="post-snippet"
              rows={5}
              value={snippet}
              onChange={event => setSnippet(event.target.value)}
              className={`${inputClass} resize-y font-mono text-xs leading-6`}
            />
          </Field>

          <Field label="Tags" htmlFor="post-tags" hint="Comma separated.">
            <input
              id="post-tags"
              value={tags}
              onChange={event => setTags(event.target.value)}
              placeholder="arrays, performance"
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={collaborative}
              onChange={event => setCollaborative(event.target.checked)}
              className="accent-emerald-400"
            />
            Open to collaborators
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-5">
            <ButtonLink href={TAB_PAGES.community} variant="ghost">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary">
              Post discussion
            </Button>
          </div>
        </form>
      </Section>
    </Page>
  );
};
