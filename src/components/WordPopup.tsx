import type { WordGloss } from '../data/types';

interface Props {
  gloss: WordGloss;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export default function WordPopup({ gloss, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-terracotta-100 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold text-terracotta-700">{gloss.word}</p>
            {gloss.lemma && gloss.lemma !== gloss.word && (
              <p className="mt-0.5 text-xs text-stone-400">原形：{gloss.lemma}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-terracotta-50 px-2.5 py-0.5 text-xs font-medium text-terracotta-700">
            {gloss.pos}
          </span>
        </div>
        <p className="mt-3 text-base text-ink">{gloss.gloss}</p>
        {gloss.note && (
          <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm leading-relaxed text-stone-600">
            {gloss.note}
          </p>
        )}
      </div>
    </div>
  );
}
