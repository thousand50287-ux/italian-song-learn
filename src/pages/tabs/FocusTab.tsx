import type { Song } from '../../data/types';

interface Props {
  song: Song;
}

export default function FocusTab({ song }: Props) {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink">重點片語</h3>
        <ul className="space-y-3">
          {song.keyPhrases.map((kp) => (
            <li
              key={kp.id}
              className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4"
            >
              <p className="font-display text-lg font-medium text-terracotta-800">{kp.it}</p>
              <p className="mt-1 text-sm text-stone-700">{kp.zh}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{kp.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink">單字卡</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {song.vocab.map((v) => (
            <article
              key={v.id}
              className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-lg font-semibold text-terracotta-700">{v.it}</h4>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-500">
                  {v.pos}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink">{v.zh}</p>
              {v.example && (
                <div className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs leading-relaxed">
                  <p className="italic text-stone-700">{v.example}</p>
                  {v.exampleZh && <p className="mt-0.5 text-stone-400">{v.exampleZh}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink">文法小教室</h3>
        <div className="space-y-4">
          {song.grammar.map((g) => (
            <article
              key={g.id}
              className="rounded-2xl border border-terracotta-100 bg-white p-5 shadow-sm"
            >
              <h4 className="font-medium text-terracotta-800">{g.title}</h4>
              <div className="mt-3 space-y-2 text-sm leading-relaxed whitespace-pre-line text-stone-600">
                {g.body}
              </div>
              {g.exampleIt && (
                <div className="mt-4 rounded-xl border border-dashed border-terracotta-200 bg-terracotta-50/50 px-4 py-3">
                  <p className="font-display text-base text-ink">{g.exampleIt}</p>
                  {g.exampleZh && <p className="mt-1 text-sm text-stone-500">{g.exampleZh}</p>}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
