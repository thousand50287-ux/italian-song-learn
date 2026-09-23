import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSongById } from '../data';
import ContrastTab from './tabs/ContrastTab';
import ClozeTab from './tabs/ClozeTab';
import FocusTab from './tabs/FocusTab';
import QuizTab from './tabs/QuizTab';

const TABS = [
  { id: 'contrast', label: '對照' },
  { id: 'cloze', label: '聽力填空' },
  { id: 'focus', label: '重點' },
  { id: 'quiz', label: '複習' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Lesson() {
  const { songId } = useParams<{ songId: string }>();
  const song = useMemo(() => (songId ? getSongById(songId) : undefined), [songId]);
  const [tab, setTab] = useState<TabId>('contrast');

  if (!song) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-stone-600">找不到這首歌。</p>
        <Link to="/" className="mt-4 inline-block text-terracotta-600 hover:underline">
          回首頁
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-xs text-stone-400 hover:text-terracotta-600">
          ← 歌曲列表
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
          {song.title}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {song.artist} · {song.year}
        </p>
        <a
          href={song.youtubeSearch}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-terracotta-200 bg-white px-3 py-1.5 text-xs text-terracotta-700 transition hover:bg-terracotta-50"
        >
          ▶ YouTube 搜尋官方錄音
        </a>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-full border border-stone-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 flex-1 rounded-full px-3 py-2 text-sm transition ${
              tab === t.id
                ? 'bg-terracotta-500 font-medium text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'contrast' && <ContrastTab song={song} />}
      {tab === 'cloze' && <ClozeTab song={song} />}
      {tab === 'focus' && <FocusTab song={song} />}
      {tab === 'quiz' && <QuizTab song={song} />}
    </div>
  );
}
