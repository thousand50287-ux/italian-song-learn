import type { Song } from './types';
import { saraPercheTiAmo } from './songs/sara-perche-ti-amo';
import { tornaACasa } from './songs/torna-a-casa';

export const songs: Song[] = [saraPercheTiAmo, tornaACasa];

export function getSongById(id: string): Song | undefined {
  return songs.find((s) => s.id === id);
}

export type * from './types';
