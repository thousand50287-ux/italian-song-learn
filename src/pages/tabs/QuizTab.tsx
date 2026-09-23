import { useState } from 'react';
import type { Song } from '../../data/types';

interface Props {
  song: Song;
}

export default function QuizTab({ song }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = song.quiz.reduce((n, q) => {
    return n + (answers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-stone-500">
        共 {song.quiz.length} 題，複習片語、詞義與文法重點。
      </p>

      <ul className="space-y-4">
        {song.quiz.map((q, qi) => {
          const chosen = answers[q.id];
          return (
            <li key={q.id} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-ink">
                <span className="mr-2 text-terracotta-500">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = chosen === oi;
                  let style =
                    'border-stone-200 bg-white hover:border-terracotta-300 text-stone-700';
                  if (submitted) {
                    if (oi === q.correctIndex) {
                      style = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                    } else if (selected) {
                      style = 'border-rose-300 bg-rose-50 text-rose-800';
                    } else {
                      style = 'border-stone-100 bg-stone-50 text-stone-400';
                    }
                  } else if (selected) {
                    style = 'border-terracotta-500 bg-terracotta-50 text-terracotta-900';
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className={`flex w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${style}`}
                    >
                      <span className="mr-2 font-medium opacity-60">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-xs leading-relaxed text-stone-600">
                  {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        {!submitted ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < song.quiz.length}
            className="rounded-full bg-ink px-5 py-2 text-sm text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            交卷
          </button>
        ) : (
          <>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
              得分：{score} / {song.quiz.length}
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600"
            >
              再測一次
            </button>
          </>
        )}
      </div>
    </div>
  );
}
