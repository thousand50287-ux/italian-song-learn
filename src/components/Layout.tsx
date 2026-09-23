import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-terracotta-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-lg text-white shadow-sm transition group-hover:bg-terracotta-600">
              ♪
            </span>
            <div>
              <div className="text-sm font-semibold tracking-tight text-ink">義式歌詞學堂</div>
              <div className="text-[11px] text-terracotta-600">Impara l'italiano con le canzoni</div>
            </div>
          </Link>
          <Link
            to="/"
            className="rounded-full px-3 py-1.5 text-sm text-terracotta-700 transition hover:bg-terracotta-50"
          >
            歌曲列表
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-terracotta-100 bg-white/60">
        <div className="mx-auto max-w-3xl px-4 py-5 text-center text-xs leading-relaxed text-stone-500">
          <p>本站僅供教育學習使用，歌詞對照與練習為教學改編內容。</p>
          <p className="mt-1">
            請聆聽官方錄音以感受完整旋律與發音；本站不嵌入受版權保護的音訊。
          </p>
        </div>
      </footer>
    </div>
  );
}
