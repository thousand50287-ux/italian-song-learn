import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LyricLine, Song } from '../../data/types';
import WordPopup from '../../components/WordPopup';
import { isWhitespace, normalizeWord, tokenizeItalian } from '../../utils/tokenize';

interface Props {
  song: Song;
}

type Mode = 'sing' | 'all';

const YT_API_SRC = 'https://www.youtube.com/iframe_api';
const POLL_MS = 200;
const NUDGE_SEC = 0.5;

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };

    if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
      const tag = document.createElement('script');
      tag.src = YT_API_SRC;
      tag.async = true;
      document.head.appendChild(tag);
    }

    // Script may already be present and about to fire, or already ready.
    const check = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(check);
        resolve();
      }
    }, 50);
  });

  return ytApiPromise;
}

/** Last line whose startSec + offset <= t; -1 if before first timed line. */
function lineIndexAtTime(
  lines: LyricLine[],
  t: number,
  offset: number,
): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    const start = lines[i].startSec;
    if (start == null) continue;
    if (start + offset <= t) idx = i;
    else break;
  }
  return idx;
}

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

function ManualSingMode({
  song,
  lines,
  keyPhraseIds,
  onSelectWord,
}: {
  song: Song;
  lines: LyricLine[];
  keyPhraseIds: Set<string>;
  onSelectWord: (key: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const total = lines.length;
  const safeIndex = total === 0 ? 0 : Math.min(Math.max(index, 0), total - 1);
  const current = total > 0 ? lines[safeIndex] : null;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [total]);

  useEffect(() => {
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
  }, [goPrev, goNext]);

  const currentHighlighted =
    current?.isKeyPhrase &&
    current.keyPhraseId &&
    keyPhraseIds.has(current.keyPhraseId);

  return (
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
            onSelect={onSelectWord}
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
  );
}

function SyncedSingMode({
  song,
  lines,
  keyPhraseIds,
  onSelectWord,
}: {
  song: Song;
  lines: LyricLine[];
  keyPhraseIds: Set<string>;
  onSelectWord: (key: string) => void;
}) {
  const youtubeId = song.youtubeId!;
  const baseOffset = song.syncOffsetSec ?? 0;
  const [nudgeSec, setNudgeSec] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playerReady, setPlayerReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const playerRef = useRef<YTPlayer | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLLIElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const offsetRef = useRef(baseOffset + nudgeSec);
  const linesRef = useRef(lines);

  const totalOffset = baseOffset + nudgeSec;
  offsetRef.current = totalOffset;
  linesRef.current = lines;

  const total = lines.length;
  const displayIndex = activeIndex < 0 ? 0 : activeIndex;
  const current = total > 0 ? lines[Math.min(displayIndex, total - 1)] : null;
  const prevLine = activeIndex > 0 ? lines[activeIndex - 1] : null;
  const nextLine =
    activeIndex >= 0 && activeIndex < total - 1 ? lines[activeIndex + 1] : null;

  const stopPolling = useCallback(() => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const syncFromPlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const t = player.getCurrentTime();
      const idx = lineIndexAtTime(linesRef.current, t, offsetRef.current);
      setActiveIndex((prev) => (prev === idx ? prev : idx));
    } catch {
      // Player may be mid-destroy.
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = window.setInterval(syncFromPlayer, POLL_MS);
  }, [stopPolling, syncFromPlayer]);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    setPlayerReady(false);
    setLoadError(null);

    loadYouTubeIframeAPI()
      .then(() => {
        if (cancelled || !hostRef.current || !window.YT?.Player) return;

        // Clear previous iframe node content for remount safety.
        hostRef.current.innerHTML = '';
        const mount = document.createElement('div');
        hostRef.current.appendChild(mount);

        const player = new window.YT.Player(mount, {
          videoId: youtubeId,
          width: '100%',
          height: '100%',
          playerVars: {
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (cancelled) return;
              playerRef.current = player;
              setPlayerReady(true);
              syncFromPlayer();
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const playing = window.YT?.PlayerState.PLAYING;
              if (playing != null && event.data === playing) {
                startPolling();
              } else {
                stopPolling();
                syncFromPlayer();
              }
            },
            onError: () => {
              if (!cancelled) setLoadError('無法載入 YouTube 播放器，請稍後再試或改用搜尋連結。');
            },
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) setLoadError('無法載入 YouTube API。');
      });

    return () => {
      cancelled = true;
      stopPolling();
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
  }, [youtubeId, startPolling, stopPolling, syncFromPlayer]);

  // Keep highlight in view when line advances.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeIndex]);

  const currentHighlighted =
    current?.isKeyPhrase &&
    current.keyPhraseId &&
    keyPhraseIds.has(current.keyPhraseId);

  const progressLabel =
    activeIndex < 0
      ? `準備中 · 共 ${total} 句`
      : `第 ${activeIndex + 1} / ${total} 句`;

  return (
    <>
      <p className="text-sm text-stone-500">
        動態跟唱：按下影片播放後，歌詞會依時間軸自動前進。點義大利文單字可查看詞義。
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

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-black shadow-sm">
        <div className="relative aspect-video w-full">
          <div ref={hostRef} className="absolute inset-0 h-full w-full" />
          {!playerReady && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/80 text-sm text-stone-200">
              載入播放器中…
            </div>
          )}
        </div>
      </div>

      {loadError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {loadError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setNudgeSec((n) => Math.round((n - NUDGE_SEC) * 10) / 10)}
          className="min-h-11 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 sm:text-sm"
        >
          歌詞提早 0.5 秒
        </button>
        <button
          type="button"
          onClick={() => setNudgeSec((n) => Math.round((n + NUDGE_SEC) * 10) / 10)}
          className="min-h-11 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 sm:text-sm"
        >
          歌詞延後 0.5 秒
        </button>
        <span className="text-xs text-stone-400">
          微調 {totalOffset >= 0 ? '+' : ''}
          {totalOffset.toFixed(1)} 秒
          {nudgeSec !== 0 && (
            <button
              type="button"
              className="ml-2 text-terracotta-700 underline"
              onClick={() => setNudgeSec(0)}
            >
              重設
            </button>
          )}
        </span>
      </div>

      <div
        className={`rounded-2xl border px-4 py-6 text-center sm:px-8 sm:py-8 ${
          currentHighlighted
            ? 'border-amber-200 bg-amber-50/50'
            : 'border-stone-100 bg-white shadow-sm'
        }`}
        role="region"
        aria-label={progressLabel}
      >
        <p className="mb-4 text-sm font-medium text-stone-400">{progressLabel}</p>

        {prevLine && activeIndex >= 0 && (
          <p className="mb-3 truncate text-sm text-stone-300 sm:text-base">{prevLine.it}</p>
        )}

        {current && activeIndex >= 0 ? (
          <>
            <LyricTokens
              line={current}
              song={song}
              onSelect={onSelectWord}
              className="font-display text-2xl leading-relaxed text-ink sm:text-3xl"
            />
            <p className="mt-4 text-base text-stone-600 sm:text-lg">{current.zh}</p>
          </>
        ) : (
          <p className="text-stone-500">
            {playerReady ? '按下播放，歌詞會從第一句開始同步' : '等待播放器…'}
          </p>
        )}

        {nextLine && activeIndex >= 0 && (
          <p className="mt-3 truncate text-sm text-stone-300 sm:text-base">{nextLine.it}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-stone-500">歌詞進度</p>
        <ul
          ref={listRef}
          className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-stone-100 bg-white p-2 sm:max-h-72"
        >
          {lines.map((line, i) => {
            const isActive = i === activeIndex;
            const highlighted =
              line.isKeyPhrase && line.keyPhraseId && keyPhraseIds.has(line.keyPhraseId);
            return (
              <li
                key={line.id}
                ref={isActive ? activeRef : undefined}
                className={`rounded-lg px-3 py-2 transition ${
                  isActive
                    ? 'bg-terracotta-700 text-white shadow-sm'
                    : highlighted
                      ? 'bg-amber-50/80 text-stone-700'
                      : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                <p
                  className={`font-display text-sm leading-snug sm:text-base ${
                    isActive ? 'text-white' : 'text-ink'
                  }`}
                >
                  {line.it}
                </p>
                <p className={`text-xs ${isActive ? 'text-terracotta-100' : 'text-stone-400'}`}>
                  {line.zh}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs leading-relaxed text-stone-400">
        嵌入 YouTube 官方／公開影片供學習；時間軸可能因版本略有差異，可用提早／延後微調。
      </p>
    </>
  );
}

export default function ContrastTab({ song }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('sing');

  const lines = song.lines;
  const hasYouTube = Boolean(song.youtubeId);

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
          {hasYouTube ? '動態跟唱' : '跟唱模式'}
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
        hasYouTube ? (
          <SyncedSingMode
            song={song}
            lines={lines}
            keyPhraseIds={keyPhraseIds}
            onSelectWord={setSelected}
          />
        ) : (
          <ManualSingMode
            song={song}
            lines={lines}
            keyPhraseIds={keyPhraseIds}
            onSelectWord={setSelected}
          />
        )
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
                  <p className="mb-1 text-xs text-stone-400">
                    第 {i + 1} 句
                    {line.startSec != null && (
                      <span className="ml-2 tabular-nums">
                        {Math.floor(line.startSec / 60)}:
                        {String(Math.floor(line.startSec % 60)).padStart(2, '0')}
                      </span>
                    )}
                  </p>
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
