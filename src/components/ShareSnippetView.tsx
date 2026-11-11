import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, ButtonLink, Card, Field, Page, PageHeader, Section, inputClass } from './ui';
import { TAB_PAGES, navigateToTab } from '../utils/routes';

type PostCategory = 'projects' | 'qna' | 'tips' | 'showcase';

/** Formerly a modal on the playground; publishes the current snippet. */
export const ShareSnippetView: React.FC = () => {
  const { sandboxCode, sandboxLanguage, createForumPost, triggerConfetti } = useApp();
  const code = sandboxCode[sandboxLanguage];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>('projects');
  const [collaborative, setCollaborative] = useState(true);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createForumPost({
      title: title.trim(),
      content: description.trim(),
      category,
      language: sandboxLanguage,
      tags: [sandboxLanguage, 'playground'],
      codeSnippet: code,
      codeLanguage: sandboxLanguage,
      isCollaborative: collaborative,
      lookingForCollaborators: collaborative,
    });

    triggerConfetti();
    navigateToTab('community');
  };

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Practice"
        title="Share to community"
        description="Publish the snippet from your playground as a discussion. Others can read it and fork it back into their own playground."
        actions={
          <ButtonLink href={TAB_PAGES.sandbox} size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Playground
          </ButtonLink>
        }
      />

      <Section title="Your snippet" description={`${sandboxLanguage} · ${code.split('\n').length} lines`}>
        <Card className="overflow-hidden">
          <pre className="max-h-56 overflow-auto p-4 font-mono text-xs leading-6 text-slate-200">{code}</pre>
        </Card>
      </Section>

      <Section>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Title" htmlFor="share-title">
            <input
              id="share-title"
              required
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="What does this snippet do?"
              className={inputClass}
            />
          </Field>

          <Field label="Description" htmlFor="share-description">
            <textarea
              id="share-description"
              required
              rows={4}
              value={description}
              onChange={event => setDescription(event.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Category" htmlFor="share-category">
            <select
              id="share-category"
              value={category}
              onChange={event => setCategory(event.target.value as PostCategory)}
              className={inputClass}
            >
              <option value="projects">Collaborative project</option>
              <option value="qna">Question / debugging</option>
              <option value="tips">Tip or guide</option>
              <option value="showcase">Showcase</option>
            </select>
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={collaborative}
              onChange={event => setCollaborative(event.target.checked)}
              className="accent-emerald-400"
            />
            Invite others to fork and collaborate
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-5">
            <ButtonLink href={TAB_PAGES.sandbox} variant="ghost">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary">
              Publish
            </Button>
          </div>
        </form>
      </Section>
    </Page>
  );
};
