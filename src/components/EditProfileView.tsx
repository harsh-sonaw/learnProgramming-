import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button, ButtonLink, Field, Page, PageHeader, Section, inputClass } from './ui';
import { TAB_PAGES, navigateToTab } from '../utils/routes';

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-violet-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

/** Previously a modal over the profile. */
export const EditProfileView: React.FC = () => {
  const { user, updateUserProfile, triggerConfetti } = useApp();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatarBg, setAvatarBg] = useState(user.avatarBg);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateUserProfile({
      displayName: displayName.trim() || user.displayName,
      bio: bio.trim(),
      avatarBg,
    });
    triggerConfetti();
    navigateToTab('profile');
  };

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Profile"
        title="Edit profile"
        actions={
          <ButtonLink href={TAB_PAGES.profile} size="sm" variant="ghost">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Profile
          </ButtonLink>
        }
      />

      <Section>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Display name" htmlFor="display-name">
            <input
              id="display-name"
              type="text"
              required
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Bio" htmlFor="bio" hint="One line about what you are working on.">
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={event => setBio(event.target.value)}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <fieldset>
            <legend className="mb-2 block text-xs font-medium text-slate-300">Avatar colour</legend>
            <div className="flex flex-wrap items-center gap-2">
              {AVATAR_COLORS.map(color => {
                const selected = avatarBg === color;
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={color.replace('bg-', '').replace('-600', '')}
                    aria-pressed={selected}
                    onClick={() => setAvatarBg(color)}
                    className={`h-8 w-8 rounded-full ${color} transition-transform ${
                      selected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-105'
                    }`}
                  />
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-5">
            <ButtonLink href={TAB_PAGES.profile} variant="ghost">
              Cancel
            </ButtonLink>
            <Button type="submit" variant="primary">
              Save changes
            </Button>
          </div>
        </form>
      </Section>
    </Page>
  );
};
