import type { Song } from './types';
import { saraPercheTiAmo } from './songs/sara-perche-ti-amo';

export const songs: Song[] = [saraPercheTiAmo];

export function getSongById(id: string): Song | undefined {
  return songs.find((s) => s.id === id);
}

export type * from './types';
