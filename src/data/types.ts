export type Pos =
  | '名詞'
  | '動詞'
  | '形容詞'
  | '副詞'
  | '代名詞'
  | '介系詞'
  | '連接詞'
  | '感嘆詞'
  | '片語'
  | '其他';

export interface WordGloss {
  word: string;
  lemma?: string;
  gloss: string;
  pos: Pos;
  note?: string;
}

export interface LyricLine {
  id: string;
  it: string;
  zh: string;
  /** Token indices (0-based) that are key phrases; or phrase markers */
  isKeyPhrase?: boolean;
  keyPhraseId?: string;
}

export interface KeyPhrase {
  id: string;
  it: string;
  zh: string;
  note: string;
}

export interface VocabItem {
  id: string;
  it: string;
  zh: string;
  pos: Pos;
  example?: string;
  exampleZh?: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  body: string;
  exampleIt?: string;
  exampleZh?: string;
}

export interface ClozeBlank {
  lineId: string;
  /** Word index in the Italian line (split by spaces, punctuation attached) */
  wordIndex: number;
  answer: string;
  options?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  year: number;
  youtubeSearch: string;
  summary: string;
  lines: LyricLine[];
  keyPhrases: KeyPhrase[];
  words: Record<string, WordGloss>;
  vocab: VocabItem[];
  grammar: GrammarLesson[];
  cloze: ClozeBlank[];
  quiz: QuizQuestion[];
}
