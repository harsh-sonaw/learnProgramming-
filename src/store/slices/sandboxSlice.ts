import { DEFAULT_SANDBOX_CODE } from '@/data/sandboxDefaults';
import type { LanguageId } from '@/types';
import type { SliceCreator } from '@/store/types';

export interface SandboxSlice {
  sandboxCode: Record<LanguageId, string>;
  sandboxLanguage: LanguageId;
  setSandboxCode: (lang: LanguageId, code: string) => void;
  setSandboxLanguage: (lang: LanguageId) => void;
  /** Copy code into the sandbox and jump to it (used by "Fork" in the forum). */
  forkCodeToSandbox: (code: string, language: LanguageId) => void;
}

export const createSandboxSlice: SliceCreator<SandboxSlice> = (set) => ({
  sandboxCode: DEFAULT_SANDBOX_CODE,
  sandboxLanguage: 'javascript',

  setSandboxCode: (lang, code) => set((s) => ({ sandboxCode: { ...s.sandboxCode, [lang]: code } })),
  setSandboxLanguage: (sandboxLanguage) => set({ sandboxLanguage }),
  forkCodeToSandbox: (code, language) =>
    set((s) => ({
      sandboxLanguage: language,
      sandboxCode: { ...s.sandboxCode, [language]: code },
      activeTab: 'sandbox',
    })),
});
