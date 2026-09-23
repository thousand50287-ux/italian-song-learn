import { useMemo, useState } from 'react';
import type { Song } from '../../data/types';
import WordPopup from '../../components/WordPopup';
import { isWhitespace, normalizeWord, tokenizeItalian } from '../../utils/tokenize';

interface Props {
  song: Song;
}

export default function ContrastTab({ song }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const gloss = useMemo(() => {
    if (!selected) return null;
    return song.words[selected] ?? song.words[selected.toLowerCase()] ?? null;
  }, [selected, song.words]);

  const keyPhraseIds = useMemo(
    () => new Set(song.keyPhrases.map((k) => k.id)),
    [song.keyPhrases],
  );

  return (
    <div className="space-y-4">
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
        {song.lines.map((line) => {
          const tokens = tokenizeItalian(line.it);
          const highlighted = line.isKeyPhrase && line.keyPhraseId && keyPhraseIds.has(line.keyPhraseId);

          return (
            <li
              key={line.id}
              className={`rounded-xl border px-4 py-3 transition ${
                highlighted
                  ? 'border-amber-200 bg-amber-50/50'
                  : 'border-stone-100 bg-white'
              }`}
            >
              <p className="font-display text-lg leading-relaxed text-ink">
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
                      onClick={() => lookupKey && setSelected(lookupKey)}
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
              <p className="mt-1.5 text-sm text-stone-500">{line.zh}</p>
            </li>
          );
        })}
      </ul>

      {gloss && <WordPopup gloss={gloss} onClose={() => setSelected(null)} />}
    </div>
  );
}
