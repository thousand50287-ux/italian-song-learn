# 義式歌詞學堂 · Italian Song Learn

用經典義大利歌曲學義大利文：歌詞對照、聽力填空、單字／文法重點與小測驗。介面為繁體中文（台灣）。

Learn Italian through classic songs — lyric对照, cloze listening practice, vocab/grammar notes, and a short quiz. UI in Traditional Chinese (Taiwan).

## 第一首歌

**Sarà perché ti amo** — Ricchi e Poveri (1981)

## 開發 / Development

```bash
cd /workspace/italian-song-learn
npm install
npm run dev
```

預設開發伺服器：`http://localhost:5173`（綁定 `0.0.0.0`）

建置正式檔：

```bash
npm run build
npm run preview
```

## 技術棧

- Vite + React + TypeScript
- Tailwind CSS v4
- React Router（純前端，無後端）
- 歌曲資料：`src/data/songs/*.ts`

## 版權說明

本站僅供教育學習。請聆聽官方錄音（可用頁面上的 YouTube 搜尋連結）；不嵌入受版權保護的音訊檔。
