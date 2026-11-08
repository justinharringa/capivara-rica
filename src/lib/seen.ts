/**
 * Per-device "already seen" flags for one-time hints (the first-month guide, the first chapter
 * card). localStorage only, wrapped in try/catch: in a private window or with storage blocked
 * the hint simply shows again, which is harmless. Nothing here leaves the device.
 */
const PREFIX = 'capivara-rica:seen:';

export function seen(key: string): boolean {
  try {
    return localStorage.getItem(PREFIX + key) === '1';
  } catch {
    return false;
  }
}

export function markSeen(key: string): void {
  try {
    localStorage.setItem(PREFIX + key, '1');
  } catch {
    /* storage blocked: the hint shows again next time */
  }
}
