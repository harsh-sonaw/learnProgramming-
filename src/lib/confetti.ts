import confetti from 'canvas-confetti';
import { CONFETTI_COLORS } from '@/config/constants';
import { createLogger } from './logger';

const log = createLogger('confetti');

/** Celebration effect. Purely cosmetic, so failures are logged and swallowed. */
export function triggerConfetti(): void {
  try {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: CONFETTI_COLORS });
  } catch (error) {
    log.debug('Confetti unavailable', error);
  }
}
