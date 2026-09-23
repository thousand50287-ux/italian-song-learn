import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LyricLine, Song } from '../../data/types';
import WordPopup from '../../components/WordPopup';
import { isWhitespace, normalizeWord, tokenizeItalian } from '../../utils/tokenize';

interface Props {
  song: Song;
}

type Mode = 'sing' | 'all';

function LyricTokens({
  line,
  song,
  onSelect,
  className,
}: {
  line: LyricLine;
  song: Song;
  onSelect: (key: string) => void;
  className?: string;
}) {
  const tokens = tokenizeItalian(line.it);

  return (
    <p className={className}>
      {tokens.map((tok, i) => {
        if (isWhitespace(tok)) return <span key={i}>{tok}</span>;
        const key = normalizeWord(tok);
        const lookupKey =
          song.words[key] ? key : song.words[key.toLowerCase()] ? key.toLowerCase() : null;
        const clickable = !!lookupKey;

        return (
          <button
            key={i}
            type="button"
            disabled={!clickable}
            onClick={(e) => {
              e.stopPropagation();
              if (lookupKey) onSelect(lookupKey);
            }}
            className={
              clickable
                ? 'rounded px-0.5 transition hover:bg-terracotta-100 hover:text-terracotta-800 cursor-pointer'
                : 'cursor-default'
            }
          >
            {tok}
          </button>
        );
      })}
    </p>
  );
}

export default function ContrastTab({ song }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('sing');
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const lines = song.lines;
  const total = lines.length;
  const safeIndex = total === 0 ? 0 : Math.min(Math.max(index, 0), total - 1);
  const current = total > 0 ? lines[safeIndex] : null;

  const gloss = useMemo(() => {
    if (!selected) return null;
    return song.words[selected] ?? song.words[selected.toLowerCase()] ?? null;
  }, [selected, song.words]);

  const keyPhraseIds = useMemo(
    () => new Set(song.keyPhrases.map((k) => k.id)),
    [song.keyPhrases],
  );

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  useEffect(() => {
    if (mode !== 'sing') return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement | null)?.isContentEditable) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, goPrev, goNext]);

  const currentHighlighted =
    current?.isKeyPhrase &&
    current.keyPhraseId &&
    keyPhraseIds.has(current.keyPhraseId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode('sing')}
          className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === 'sing'
              ? 'bg-terracotta-700 text-white shadow-sm'
              : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          跟唱模式
        </button>
        <button
          type="button"
          onClick={() => setMode('all')}
          className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === 'all'
              ? 'bg-terracotta-700 text-white shadow-sm'
              : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          全部歌詞
        </button>
      </div>

      {mode === 'sing' ? (
        <>
          <p className="text-sm text-stone-500">
            跟著唱：一次一句，點「下一句」或按空白鍵前進。點義大利文單字可查看詞義。
          </p>

          {song.keyPhrases.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {song.keyPhrases.map((kp) => (
                <span
                  key={kp.id}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-900"
                  title={kp.note}
                >
                  {kp.it}
                </span>
              ))}
            </div>
          )}

          {current ? (
            <div
              ref={cardRef}
              tabIndex={0}
              role="region"
              aria-label={`第 ${safeIndex + 1} / ${total} 句`}
              onClick={(e) => {
                // Advance on card tap, but not when clicking a word button
                if ((e.target as HTMLElement).closest('button')) return;
                const rect = cardRef.current?.getBoundingClientRect();
                if (!rect) {
                  goNext();
                  return;
                }
                const x = e.clientX - rect.left;
                if (x < rect.width * 0.35) goPrev();
                else goNext();
              }}
              className={`cursor-pointer rounded-2xl border px-5 py-10 text-center outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 sm:px-8 sm:py-14 ${
                currentHighlighted
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-stone-100 bg-white shadow-sm'
              }`}
            >
              <p className="mb-6 text-sm font-medium text-stone-400">
                第 {safeIndex + 1} / {total} 句
              </p>

              <LyricTokens
                line={current}
                song={song}
                onSelect={setSelected}
                className="font-display text-2xl leading-relaxed text-ink sm:text-3xl"
              />

              <p className="mt-5 text-base text-stone-600 sm:text-lg">{current.zh}</p>

              <p className="mt-8 text-xs text-stone-400">
                點左側上一句 · 點右側或空白處下一句
              </p>
            </div>
          ) : (
            <p className="rounded-2xl border border-stone-100 bg-white px-4 py-8 text-center text-stone-500">
              尚無歌詞
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={safeIndex <= 0}
              className="min-h-12 min-w-[7rem] flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base font-medium text-stone-700 transition enabled:hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              上一句
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={safeIndex >= total - 1}
              className="min-h-12 min-w-[7rem] flex-1 rounded-xl bg-terracotta-700 px-4 py-3 text-base font-medium text-white transition enabled:hover:bg-terracotta-800 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              下一句
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-stone-500">
            點擊義大利文單字可查看詞義。標了琥珀色底的是本課重點片語。
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {song.keyPhrases.map((kp) => (
              <span
                key={kp.id}
                className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-900"
                title={kp.note}
              >
                {kp.it}
              </span>
            ))}
          </div>

          <ul className="space-y-3">
            {lines.map((line, i) => {
              const highlighted =
                line.isKeyPhrase && line.keyPhraseId && keyPhraseIds.has(line.keyPhraseId);

              return (
                <li
                  key={line.id}
                  className={`rounded-xl border px-4 py-3 transition ${
                    highlighted
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-stone-100 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    className="mb-1 text-left text-xs text-stone-400 hover:text-terracotta-700"
                    onClick={() => {
                      setIndex(i);
                      setMode('sing');
                    }}
                  >
                    第 {i + 1} 句 · 跟唱此句
                  </button>
                  <LyricTokens
                    line={line}
                    song={song}
                    onSelect={setSelected}
                    className="font-display text-lg leading-relaxed text-ink"
                  />
                  <p className="mt-1.5 text-sm text-stone-500">{line.zh}</p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {gloss && <WordPopup gloss={gloss} onClose={() => setSelected(null)} />}
    </div>
  );
}
