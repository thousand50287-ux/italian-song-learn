import { useMemo, useState } from 'react';
import type { ClozeBlank, ClozeOption, Song } from '../../data/types';
import { wordTokens } from '../../utils/tokenize';

interface Props {
  song: Song;
}

type BlankKey = string;

function blankKey(b: ClozeBlank): BlankKey {
  return `${b.lineId}:${b.wordIndex}`;
}

function isAnswerCorrect(user: string, answer: string): boolean {
  return user.trim().toLowerCase() === answer.trim().toLowerCase();
}

/** Stable shuffle so order differs per blank but does not jump on re-render. */
function shuffleOptions(options: ClozeOption[], seed: string): ClozeOption[] {
  const arr = [...options];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const j = Math.abs(h) % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export default function ClozeTab({ song }: Props) {
  const blanks = song.cloze;
  const total = blanks.length;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<BlankKey, string>>({});
  const [locked, setLocked] = useState<Record<BlankKey, boolean>>({});
  const [mode, setMode] = useState<'choice' | 'type'>('choice');
  const [draft, setDraft] = useState('');

  const safeIndex = total === 0 ? 0 : Math.min(Math.max(index, 0), total - 1);
  const current = total > 0 ? blanks[safeIndex] : null;
  const currentKey = current ? blankKey(current) : null;
  const currentLine = current
    ? song.lines.find((l) => l.id === current.lineId)
    : undefined;

  const shuffledOptions = useMemo(() => {
    if (!current?.options?.length || !currentKey) return [];
    return shuffleOptions(current.options, currentKey);
  }, [current, currentKey]);

  const answeredCount = useMemo(
    () => blanks.filter((b) => locked[blankKey(b)]).length,
    [blanks, locked],
  );
  const correctCount = useMemo(() => {
    let n = 0;
    for (const b of blanks) {
      const key = blankKey(b);
      if (!locked[key]) continue;
      if (isAnswerCorrect(answers[key] ?? '', b.answer)) n += 1;
    }
    return n;
  }, [answers, blanks, locked]);

  const userAnswer = currentKey ? (answers[currentKey] ?? '') : '';
  const isLocked = currentKey ? !!locked[currentKey] : false;
  const isCorrect =
    isLocked && current ? isAnswerCorrect(userAnswer, current.answer) : false;
  const isWrong = isLocked && current && !isCorrect;
  const allDone = total > 0 && answeredCount === total;

  function goTo(i: number) {
    const next = Math.min(Math.max(i, 0), Math.max(total - 1, 0));
    setIndex(next);
    const b = blanks[next];
    if (b) {
      const key = blankKey(b);
      setDraft(locked[key] ? answers[key] ?? '' : '');
    } else {
      setDraft('');
    }
  }

  function lockAnswer(value: string) {
    if (!current || !currentKey || isLocked) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setAnswers((prev) => ({ ...prev, [currentKey]: trimmed }));
    setLocked((prev) => ({ ...prev, [currentKey]: true }));
    setDraft(trimmed);
  }

  function reset() {
    setAnswers({});
    setLocked({});
    setDraft('');
    setIndex(0);
  }

  function revealCurrent() {
    if (!current || !currentKey) return;
    setAnswers((prev) => ({ ...prev, [currentKey]: current.answer }));
    setLocked((prev) => ({ ...prev, [currentKey]: true }));
    setDraft(current.answer);
  }

  if (!current || !currentLine || !currentKey) {
    return (
      <p className="rounded-2xl border border-stone-100 bg-white px-4 py-8 text-center text-stone-500">
        尚無填空題。
      </p>
    );
  }

  const words = wordTokens(currentLine.it);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          一次一題。選完後立刻對錯，並可看四個選項的詞性與意思。
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
            onClick={() => {
              setMode('type');
              setDraft(isLocked ? userAnswer : '');
            }}
            className={`rounded-full px-3 py-1.5 ${mode === 'type' ? 'bg-terracotta-500 text-white' : 'text-stone-600'}`}
          >
            輸入
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-terracotta-700">
          第 {safeIndex + 1} / {total} 題
        </span>
        <span className="text-stone-500">
          已答 {answeredCount} · 對 {correctCount}
        </span>
      </div>

      <div
        className={`rounded-2xl border px-5 py-6 sm:px-6 sm:py-8 ${
          isCorrect
            ? 'border-emerald-200 bg-emerald-50/60'
            : isWrong
              ? 'border-rose-200 bg-rose-50/50'
              : 'border-stone-100 bg-white shadow-sm'
        }`}
      >
        <p className="mb-4 text-center text-xs font-medium text-stone-400">
          聽這句，補上挖空的字
        </p>
        <p className="text-center font-display text-xl leading-relaxed text-ink sm:text-2xl">
          {words.map((w, wi) => {
            if (wi !== current.wordIndex) {
              return (
                <span key={wi} className="mr-1.5 inline-block">
                  {w}
                </span>
              );
            }
            const shown = isLocked ? userAnswer || '____' : userAnswer || '____';
            return (
              <span
                key={wi}
                className={`mr-1.5 mb-1 inline-flex min-w-[5rem] items-center justify-center rounded-lg border-b-2 px-2 py-0.5 text-lg sm:text-xl ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                    : isWrong
                      ? 'border-rose-400 bg-rose-100 text-rose-900'
                      : 'border-terracotta-500 bg-terracotta-50 text-terracotta-800'
                }`}
              >
                {shown}
              </span>
            );
          })}
        </p>
        <p className="mt-4 text-center text-sm text-stone-500">{currentLine.zh}</p>

        {isLocked && (
          <div
            className={`mt-5 rounded-xl px-4 py-3 text-center text-sm font-medium ${
              isCorrect
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-rose-100 text-rose-900'
            }`}
            role="status"
          >
            {isCorrect ? (
              <span>正確！</span>
            ) : (
              <span>
                不對。正確答案是{' '}
                <span className="font-display text-base">{current.answer}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {!isLocked && mode === 'choice' && shuffledOptions.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {shuffledOptions.map((opt) => (
            <button
              key={opt.it}
              type="button"
              onClick={() => lockAnswer(opt.it)}
              className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 py-3 text-left text-base text-stone-800 shadow-sm transition hover:border-terracotta-400 hover:bg-terracotta-50"
            >
              <span className="font-display">{opt.it}</span>
            </button>
          ))}
        </div>
      )}

      {!isLocked && mode === 'type' && (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            lockAnswer(draft);
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="輸入義大利文…"
            className="min-h-12 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-100"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="min-h-12 rounded-xl bg-terracotta-700 px-5 py-3 text-base font-medium text-white transition enabled:hover:bg-terracotta-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            送出
          </button>
        </form>
      )}

      {isLocked && shuffledOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500">選項詳解</p>
          <ul className="space-y-2">
            {shuffledOptions.map((opt) => {
              const right = isAnswerCorrect(opt.it, current.answer);
              const picked = isAnswerCorrect(opt.it, userAnswer);
              let box =
                'border-stone-200 bg-white text-stone-700';
              if (right) {
                box = 'border-emerald-300 bg-emerald-50 text-emerald-950';
              } else if (picked) {
                box = 'border-rose-300 bg-rose-50 text-rose-950';
              }
              return (
                <li
                  key={opt.it}
                  className={`rounded-xl border px-4 py-3 ${box}`}
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-base font-semibold">
                      {opt.it}
                    </span>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-stone-600">
                      {opt.pos}
                    </span>
                    {right && (
                      <span className="text-xs font-medium text-emerald-700">
                        正確答案
                      </span>
                    )}
                    {!right && picked && (
                      <span className="text-xs font-medium text-rose-700">
                        你選的
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{opt.gloss}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(safeIndex - 1)}
          disabled={safeIndex <= 0}
          className="min-h-11 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 enabled:hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          上一題
        </button>
        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          disabled={safeIndex >= total - 1}
          className="min-h-11 rounded-full bg-terracotta-700 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-terracotta-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {safeIndex >= total - 1 ? '已是最後一題' : '下一題'}
        </button>
        {!isLocked && (
          <button
            type="button"
            onClick={revealCurrent}
            className="min-h-11 rounded-full px-4 py-2 text-sm text-stone-500 hover:text-stone-700"
          >
            看答案
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full px-4 py-2 text-sm text-stone-500 hover:text-stone-700"
        >
          重來
        </button>
      </div>

      {allDone && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
          <p className="font-medium text-emerald-900">
            全部完成！得分 {correctCount} / {total}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 rounded-full bg-emerald-800 px-4 py-2 text-sm text-white hover:bg-emerald-900"
          >
            再練一次
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
        {blanks.map((b, i) => {
          const key = blankKey(b);
          const done = !!locked[key];
          const ok = done && isAnswerCorrect(answers[key] ?? '', b.answer);
          const active = i === safeIndex;
          return (
            <button
              key={key}
              type="button"
              title={`第 ${i + 1} 題`}
              onClick={() => goTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                active ? 'ring-2 ring-terracotta-400 ring-offset-1' : ''
              } ${
                done ? (ok ? 'bg-emerald-500' : 'bg-rose-400') : 'bg-stone-300'
              }`}
              aria-label={`第 ${i + 1} 題`}
            />
          );
        })}
      </div>
    </div>
  );
}
