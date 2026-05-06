import type { SectionType } from "@real-spanish-stories/shared";

// English marker phrases
const VOCABULARY_HEADER_PHRASE = "Vocabulary from the story";
const VERBS_HEADER_PHRASE = "Verbs from the story";
const STORY_HEADER_PHRASE = "Now, the story";

// Spanish marker phrases
const VOCABULARY_HEADER_PHRASE_ES = "Vocabulario de la historia";
const VERBS_HEADER_PHRASE_ES = "Verbos de la historia";
const STORY_HEADER_PHRASE_ES = "Ahora, la historia";

interface Word {
  word: string;
  start: number;
  end: number;
}

interface Section {
  type: SectionType;
  start_time: number;
  end_time: number;
  words: Word[];
  static?: boolean;
  text?: string;
}

interface SectionsJson {
  sections: Section[];
}

function stripPunctuation(s: string): string {
  return s.replace(/[.,!?;:]/g, "");
}

interface HeaderMatch {
  idx: number;
  phrase: string;
  phraseLen: number;
}

function findHeaderWithFallback(
  words: Word[],
  preferred: string,
  fallback: string,
  startIndex: number,
): HeaderMatch {
  const preferredIdx = findPhraseIndex(words, preferred, startIndex);
  if (preferredIdx >= 0) {
    return {
      idx: preferredIdx,
      phrase: preferred,
      phraseLen: preferred.split(/\s+/).length,
    };
  }
  const fallbackIdx = findPhraseIndex(words, fallback, startIndex);
  if (fallbackIdx >= 0) {
    return {
      idx: fallbackIdx,
      phrase: fallback,
      phraseLen: fallback.split(/\s+/).length,
    };
  }
  return {
    idx: -1,
    phrase: preferred,
    phraseLen: preferred.split(/\s+/).length,
  };
}

export function findPhraseIndex(
  words: Word[],
  phrase: string,
  startIndex: number = 0,
): number {
  const phraseWords = phrase
    .toLowerCase()
    .split(/\s+/)
    .map((w) => stripPunctuation(w));
  const phraseLen = phraseWords.length;

  for (let i = startIndex; i <= words.length - phraseLen; i++) {
    let match = true;
    for (let j = 0; j < phraseLen; j++) {
      const wordText = stripPunctuation(words[i + j].word.toLowerCase());
      if (wordText !== phraseWords[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }

  return -1;
}

export function detectSections(
  transcriptionJson: string,
  title: string,
  altTitle: string | null,
  useSpanishHeadings: boolean = false,
  level: string | null = null,
  skipEnglishTitle: boolean = false,
): SectionsJson {
  const vocabPreferred = useSpanishHeadings
    ? VOCABULARY_HEADER_PHRASE_ES
    : VOCABULARY_HEADER_PHRASE;
  const vocabFallback = useSpanishHeadings
    ? VOCABULARY_HEADER_PHRASE
    : VOCABULARY_HEADER_PHRASE_ES;
  const verbsPreferred = useSpanishHeadings
    ? VERBS_HEADER_PHRASE_ES
    : VERBS_HEADER_PHRASE;
  const verbsFallback = useSpanishHeadings
    ? VERBS_HEADER_PHRASE
    : VERBS_HEADER_PHRASE_ES;
  const storyPreferred = useSpanishHeadings
    ? STORY_HEADER_PHRASE_ES
    : STORY_HEADER_PHRASE;
  const storyFallback = useSpanishHeadings
    ? STORY_HEADER_PHRASE
    : STORY_HEADER_PHRASE_ES;

  const transcription = JSON.parse(transcriptionJson);
  const rawWords: { word: string; start: number; end: number }[] =
    transcription.words ?? [];

  if (rawWords.length === 0) {
    throw new Error("No words found in transcription");
  }

  const words: Word[] = rawWords.map((w) => ({
    word: w.word,
    start: w.start,
    end: w.end,
  }));

  const sections: Section[] = [];
  let currentIndex = 0;

  // 1. Extract title_spanish (based on word count in title)
  const titleWordCount = title.split(/\s+/).length;
  if (currentIndex + titleWordCount <= words.length) {
    const titleWords = words.slice(currentIndex, currentIndex + titleWordCount);
    sections.push({
      type: "title_spanish",
      start_time: titleWords[0].start,
      end_time: titleWords[titleWords.length - 1].end,
      words: titleWords,
    });
    currentIndex += titleWordCount;
  }

  // Advanced videos: title_spanish + story only
  if (level === "advanced") {
    const storyWords = words.slice(currentIndex);
    if (storyWords.length > 0) {
      sections.push({
        type: "story",
        start_time: storyWords[0].start,
        end_time: storyWords[storyWords.length - 1].end,
        words: storyWords,
      });
    }
    return { sections };
  }

  // 2. Extract title_english (based on word count in alt_title)
  if (!skipEnglishTitle && altTitle) {
    const altTitleWordCount = altTitle.split(/\s+/).length;
    if (currentIndex + altTitleWordCount <= words.length) {
      const altTitleWords = words.slice(
        currentIndex,
        currentIndex + altTitleWordCount,
      );
      sections.push({
        type: "title_english",
        start_time: altTitleWords[0].start,
        end_time: altTitleWords[altTitleWords.length - 1].end,
        words: altTitleWords,
      });
      currentIndex += altTitleWordCount;
    }
  }

  // Find marker phrase indices, with per-header language fallback so audio
  // that mixes Spanish and English headers (e.g. Spanish vocab/verbs but
  // English "Now, the story") still gets fully sectioned.
  const vocabMatch = findHeaderWithFallback(
    words,
    vocabPreferred,
    vocabFallback,
    currentIndex,
  );
  const vocabHeaderIdx = vocabMatch.idx;
  const verbsMatch = findHeaderWithFallback(
    words,
    verbsPreferred,
    verbsFallback,
    vocabHeaderIdx >= 0 ? vocabHeaderIdx + 1 : currentIndex,
  );
  const verbsHeaderIdx = verbsMatch.idx;
  const storyMatch = findHeaderWithFallback(
    words,
    storyPreferred,
    storyFallback,
    verbsHeaderIdx >= 0 ? verbsHeaderIdx + 1 : currentIndex,
  );
  const storyHeaderIdx = storyMatch.idx;
  // 3. Extract summary (between title_english and vocabulary_header)
  if (vocabHeaderIdx > currentIndex) {
    const summaryWords = words.slice(currentIndex, vocabHeaderIdx);
    if (summaryWords.length > 0) {
      sections.push({
        type: "summary",
        start_time: summaryWords[0].start,
        end_time: summaryWords[summaryWords.length - 1].end,
        words: summaryWords,
      });
    }
  }

  // 4. Add vocabulary_header (static)
  if (vocabHeaderIdx >= 0) {
    const vocabHeaderWords = words.slice(
      vocabHeaderIdx,
      vocabHeaderIdx + vocabMatch.phraseLen,
    );
    sections.push({
      type: "vocabulary_header",
      static: true,
      text: vocabMatch.phrase,
      start_time: vocabHeaderWords[0].start,
      end_time: vocabHeaderWords[vocabHeaderWords.length - 1].end,
      words: vocabHeaderWords,
    });
    const vocabContentStart = vocabHeaderIdx + vocabMatch.phraseLen;

    // 5. Extract vocabulary (between vocabulary_header and verbs_header)
    const vocabContentEnd =
      verbsHeaderIdx >= 0 ? verbsHeaderIdx : words.length;
    if (vocabContentStart < vocabContentEnd) {
      const vocabWords = words.slice(vocabContentStart, vocabContentEnd);
      if (vocabWords.length > 0) {
        sections.push({
          type: "vocabulary",
          start_time: vocabWords[0].start,
          end_time: vocabWords[vocabWords.length - 1].end,
          words: vocabWords,
        });
      }
    }
  }

  // 6. Add verbs_header (static)
  if (verbsHeaderIdx >= 0) {
    const verbsHeaderWords = words.slice(
      verbsHeaderIdx,
      verbsHeaderIdx + verbsMatch.phraseLen,
    );
    sections.push({
      type: "verbs_header",
      static: true,
      text: verbsMatch.phrase,
      start_time: verbsHeaderWords[0].start,
      end_time: verbsHeaderWords[verbsHeaderWords.length - 1].end,
      words: verbsHeaderWords,
    });
    const verbsContentStart = verbsHeaderIdx + verbsMatch.phraseLen;

    // 7. Extract verbs (between verbs_header and story_header)
    const verbsContentEnd =
      storyHeaderIdx >= 0 ? storyHeaderIdx : words.length;
    if (verbsContentStart < verbsContentEnd) {
      const verbsWords = words.slice(verbsContentStart, verbsContentEnd);
      if (verbsWords.length > 0) {
        sections.push({
          type: "verbs",
          start_time: verbsWords[0].start,
          end_time: verbsWords[verbsWords.length - 1].end,
          words: verbsWords,
        });
      }
    }
  }

  // 8. Add story_header (static)
  if (storyHeaderIdx >= 0) {
    const storyHeaderWords = words.slice(
      storyHeaderIdx,
      storyHeaderIdx + storyMatch.phraseLen,
    );
    sections.push({
      type: "story_header",
      static: true,
      text: storyMatch.phrase,
      start_time: storyHeaderWords[0].start,
      end_time: storyHeaderWords[storyHeaderWords.length - 1].end,
      words: storyHeaderWords,
    });
    const storyContentStart = storyHeaderIdx + storyMatch.phraseLen;

    // 9. Extract story (between story_header and end of audio)
    const storyContentEnd = words.length;
    if (storyContentStart < storyContentEnd) {
      const storyWords = words.slice(storyContentStart, storyContentEnd);
      if (storyWords.length > 0) {
        sections.push({
          type: "story",
          start_time: storyWords[0].start,
          end_time: storyWords[storyWords.length - 1].end,
          words: storyWords,
        });
      }
    }
  }

  return { sections };
}
