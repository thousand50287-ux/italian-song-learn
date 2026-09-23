import { useMemo, useState } from 'react';
import type { ClozeBlank, Song } from '../../data/types';
import { wordTokens } from '../../utils/tokenize';

interface Props {
  song: Song;
}

type BlankKey = string;

function blankKey(b: ClozeBlank): BlankKey {
  return `${b.lineId}:${b.wordIndex}`;
}

export default function ClozeTab({ song }: Props) {
  const blanksByLine = useMemo(() => {
    const map = new Map<string, ClozeBlank[]>();
    for (const b of song.cloze) {
      const list = map.get(b.lineId) ?? [];
      list.push(b);
      map.set(b.lineId, list);
    }
    return map;
  }, [song.cloze]);

  const [answers, setAnswers] = useState<Record<BlankKey, string>>({});
  const [mode, setMode] = useState<'choice' | 'type'>('choice');
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [activeBlank, setActiveBlank] = useState<BlankKey | null>(
    song.cloze[0] ? blankKey(song.cloze[0]) : null,
  );

  const total = song.cloze.length;
  const score = useMemo(() => {
    if (!checked && !revealed) return null;
    let correct = 0;
    for (const b of song.cloze) {
      const user = (answers[blankKey(b)] ?? '').trim();
      if (user.toLowerCase() === b.answer.toLowerCase()) correct += 1;
    }
    return correct;
  }, [answers, checked, revealed, song.cloze]);

  const active = song.cloze.find((b) => blankKey(b) === activeBlank);

  function setAnswer(key: BlankKey, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setChecked(false);
  }

  function reset() {
    setAnswers({});
    setChecked(false);
    setRevealed(false);
    setActiveBlank(song.cloze[0] ? blankKey(song.cloze[0]) : null);
  }

  function revealAll() {
    const filled: Record<BlankKey, string> = {};
    for (const b of song.cloze) filled[blankKey(b)] = b.answer;
    setAnswers(filled);
    setRevealed(true);
    setChecked(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          約 {Math.round((total / song.lines.reduce((n, l) => n + wordTokens(l.it).length, 0)) * 100)}%
          內容詞已挖空。可邊聽官方錄音邊填。
        </p>
        <div className="flex rounded-full border border-stone-200 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('choice')}
            className={`rounded-full px-3 py-1.5 ${mode === 'choice' ? 'bg-terracotta-500 text-white' : 'text-stone-600'}`}
          >
            選擇題
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`rounded-full px-3 py-1.5 ${mode === 'type' ? 'bg-terracotta-500 text-white' : 'text-stone-600'}`}
          >
            輸入
          </button>
        </div>
      </div>

      <ul className="space-y-2 rounded-2xl border border-stone-100 bg-white p-4">
        {song.lines.map((line) => {
          const words = wordTokens(line.it);
          const blanks = blanksByLine.get(line.id) ?? [];
          const blankMap = new Map(blanks.map((b) => [b.wordIndex, b]));

          return (
            <li key={line.id} className="font-display text-base leading-relaxed text-ink sm:text-lg">
              {words.map((w, wi) => {
                const blank = blankMap.get(wi);
                if (!blank) {
                  return (
                    <span key={wi} className="mr-1.5 inline-block">
                      {w}
                    </span>
                  );
                }
                const key = blankKey(blank);
                const user = answers[key] ?? '';
                const isActive = activeBlank === key;
                const isCorrect =
                  (checked || revealed) && user.toLowerCase() === blank.answer.toLowerCase();
                const isWrong =
                  (checked || revealed) && user.length > 0 && !isCorrect;

                return (
                  <button
                    key={wi}
                    type="button"
                    onClick={() => setActiveBlank(key)}
                    className={`mr-1.5 mb-1 inline-flex min-w-[4.5rem] items-center justify-center rounded-lg border-b-2 px-1.5 py-0.5 text-sm transition ${
                      isActive
                        ? 'border-terracotta-500 bg-terracotta-50'
                        : isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : isWrong
                            ? 'border-rose-400 bg-rose-50 text-rose-800'
                            : 'border-stone-300 bg-stone-50 text-stone-400'
                    }`}
                  >
                    {user || '____'}
                  </button>
                );
              })}
              <span className="ml-2 text-xs text-stone-400">（{line.zh}）</span>
            </li>
          );
        })}
      </ul>

      {active && (
        <div className="rounded-2xl border border-terracotta-100 bg-terracotta-50/40 p-4">
          <p className="mb-2 text-xs font-medium text-terracotta-700">
            填空：第 {song.cloze.findIndex((b) => blankKey(b) === activeBlank) + 1} / {total} 題
          </p>
          {mode === 'choice' && active.options ? (
            <div className="grid grid-cols-2 gap-2">
              {active.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswer(blankKey(active), opt)}
                  className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                    answers[blankKey(active)] === opt
                      ? 'border-terracotta-500 bg-white font-medium text-terracotta-800 shadow-sm'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-terracotta-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={answers[blankKey(active)] ?? ''}
              onChange={(e) => setAnswer(blankKey(active), e.target.value)}
              placeholder="輸入義大利文…"
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-100"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!activeBlank}
              onClick={() => {
                const idx = song.cloze.findIndex((b) => blankKey(b) === activeBlank);
                if (idx >= 0 && idx < song.cloze.length - 1) {
                  setActiveBlank(blankKey(song.cloze[idx + 1]));
                }
              }}
              className="rounded-full bg-terracotta-500 px-4 py-1.5 text-sm text-white hover:bg-terracotta-600"
            >
              下一空
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-full bg-ink px-4 py-2 text-sm text-white hover:bg-stone-800"
        >
          核對答案
        </button>
        <button
          type="button"
          onClick={revealAll}
          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          顯示全部答案
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-4 py-2 text-sm text-stone-500 hover:text-stone-700"
        >
          重來
        </button>
        {score !== null && (
          <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
            得分：{score} / {total}
          </span>
        )}
      </div>
    </div>
  );
}
