import { Link } from 'react-router-dom';
import { songs } from '../data';

export default function Home() {
  return (
    <div>
      <section className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-terracotta-500">
          Canzoni · 義大利歌曲
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          用經典歌曲學義大利文
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
          對照歌詞、聽力填空、單字文法重點與小測驗——專為台灣華語學習者設計的溫暖小教室。
        </p>
      </section>

      <ul className="space-y-4">
        {songs.map((song) => (
          <li key={song.id}>
            <Link
              to={`/lesson/${song.id}`}
              className="group block overflow-hidden rounded-2xl border border-terracotta-100 bg-white shadow-sm transition hover:border-terracotta-300 hover:shadow-md"
            >
              <div className="flex">
                <div className="flex w-2 shrink-0 bg-gradient-to-b from-terracotta-400 to-terracotta-600" />
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-xl font-semibold text-ink group-hover:text-terracotta-700">
                      {song.title}
                    </h2>
                    <span className="rounded-full bg-terracotta-50 px-2.5 py-0.5 text-xs text-terracotta-700">
                      {song.year}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">{song.artist}</p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{song.summary}</p>
                  <p className="mt-4 text-sm font-medium text-terracotta-600 group-hover:underline">
                    開始學習 →
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
