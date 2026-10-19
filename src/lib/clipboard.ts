import { createLogger } from './logger';

const log = createLogger('clipboard');

/** Copy text to the clipboard. Resolves to true on success; never throws. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return legacyCopy(text);
  } catch (error) {
    log.warn('Clipboard API failed, trying legacy fallback', error);
    return legacyCopy(text);
  }
}

function legacyCopy(text: string): boolean {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch (error) {
    log.error('Copy failed', error);
    return false;
  }
}
