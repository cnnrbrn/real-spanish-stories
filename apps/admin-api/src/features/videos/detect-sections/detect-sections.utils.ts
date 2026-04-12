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
): SectionsJson {
  const vocabPhrase = useSpanishHeadings
    ? VOCABULARY_HEADER_PHRASE_ES
    : VOCABULARY_HEADER_PHRASE;
  const verbsPhrase = useSpanishHeadings
    ? VERBS_HEADER_PHRASE_ES
    : VERBS_HEADER_PHRASE;
  const storyPhrase = useSpanishHeadings
    ? STORY_HEADER_PHRASE_ES
    : STORY_HEADER_PHRASE;

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

  // Advanced videos: title_spanish + subjunctive_verbs_header + subjunctive_verbs + story_header + story
  if (level === "advanced") {
    const storyIdx = findPhraseIndex(words, STORY_HEADER_PHRASE_ES, currentIndex);

    if (storyIdx >= 0) {
      const subjunctiveWords = words.slice(currentIndex, storyIdx);

      // Split off the spoken header ("En esta historia vamos a incorporar … en modo subjuntivo")
      // from the actual verb content. The header is displayed as a static title; its spoken
      // words don't need to appear in subjunctive_verbs.
      const HEADER_END_PHRASE = "en modo subjuntivo";
      const headerPhraseLen = HEADER_END_PHRASE.split(/\s+/).length;
      const headerEndIdx = findPhraseIndex(subjunctiveWords, HEADER_END_PHRASE, 0);
      const verbStartIdx = headerEndIdx >= 0 ? headerEndIdx + headerPhraseLen : 0;
      const headerWords = subjunctiveWords.slice(0, verbStartIdx);
      const verbWords = subjunctiveWords.slice(verbStartIdx);

      sections.push({
        type: "subjunctive_verbs_header",
        text: "En esta historia vamos a incorporar 2 verbos en modo subjuntivo.",
        start_time: headerWords.length > 0 ? headerWords[0].start : 0,
        end_time: headerWords.length > 0 ? headerWords[headerWords.length - 1].end : 0,
        words: headerWords,
      });

      if (verbWords.length > 0) {
        // Mark lineBreaks to split each verb into 2 screens.
        // inScreen2 tracks state: Screen 1 ends on ")" word, Screen 2 ends on the
        // word before the next verb's "(" word. Using a stateful loop avoids
        // wrongly marking the EN verb word that precedes the grammar note's own "(".
        const markedWords: (Word & { lineBreak?: boolean })[] = [];
        let inScreen2 = false;
        for (let idx = 0; idx < verbWords.length; idx++) {
          const w = verbWords[idx];
          const nextWord = verbWords[idx + 1];
          if (!inScreen2 && w.word.includes(")")) {
            markedWords.push({ ...w, lineBreak: true });
            inScreen2 = true;
          } else if (inScreen2 && nextWord && nextWord.word.includes("(")) {
            markedWords.push({ ...w, lineBreak: true });
            inScreen2 = false;
          } else {
            markedWords.push(w);
          }
        }
        sections.push({
          type: "subjunctive_verbs",
          start_time: markedWords[0].start,
          end_time: markedWords[markedWords.length - 1].end,
          words: markedWords,
        });
      }

      const storyPhraseLen = STORY_HEADER_PHRASE_ES.split(/\s+/).length;
      const storyHeaderWords = words.slice(storyIdx, storyIdx + storyPhraseLen);
      sections.push({
        type: "story_header",
        static: true,
        text: STORY_HEADER_PHRASE_ES,
        start_time: storyHeaderWords[0].start,
        end_time: storyHeaderWords[storyHeaderWords.length - 1].end,
        words: storyHeaderWords,
      });

      const storyWords = words.slice(storyIdx + storyPhraseLen);
      if (storyWords.length > 0) {
        sections.push({
          type: "story",
          start_time: storyWords[0].start,
          end_time: storyWords[storyWords.length - 1].end,
          words: storyWords,
        });
      }
    } else {
      // Fallback: no story marker found
      const storyWords = words.slice(currentIndex);
      if (storyWords.length > 0) {
        sections.push({
          type: "story",
          start_time: storyWords[0].start,
          end_time: storyWords[storyWords.length - 1].end,
          words: storyWords,
        });
      }
    }

    return { sections };
  }

  // 2. Extract title_english (based on word count in alt_title)
  if (altTitle) {
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

  // Find marker phrase indices
  const vocabHeaderIdx = findPhraseIndex(words, vocabPhrase, currentIndex);
  const verbsHeaderIdx = findPhraseIndex(
    words,
    verbsPhrase,
    vocabHeaderIdx >= 0 ? vocabHeaderIdx + 1 : currentIndex,
  );
  const storyHeaderIdx = findPhraseIndex(
    words,
    storyPhrase,
    verbsHeaderIdx >= 0 ? verbsHeaderIdx + 1 : currentIndex,
  );
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
    const vocabPhraseLen = vocabPhrase.split(/\s+/).length;
    const vocabHeaderWords = words.slice(
      vocabHeaderIdx,
      vocabHeaderIdx + vocabPhraseLen,
    );
    sections.push({
      type: "vocabulary_header",
      static: true,
      text: vocabPhrase,
      start_time: vocabHeaderWords[0].start,
      end_time: vocabHeaderWords[vocabHeaderWords.length - 1].end,
      words: vocabHeaderWords,
    });
    const vocabContentStart = vocabHeaderIdx + vocabPhraseLen;

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
    const verbsPhraseLen = verbsPhrase.split(/\s+/).length;
    const verbsHeaderWords = words.slice(
      verbsHeaderIdx,
      verbsHeaderIdx + verbsPhraseLen,
    );
    sections.push({
      type: "verbs_header",
      static: true,
      text: verbsPhrase,
      start_time: verbsHeaderWords[0].start,
      end_time: verbsHeaderWords[verbsHeaderWords.length - 1].end,
      words: verbsHeaderWords,
    });
    const verbsContentStart = verbsHeaderIdx + verbsPhraseLen;

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
    const storyPhraseLen = storyPhrase.split(/\s+/).length;
    const storyHeaderWords = words.slice(
      storyHeaderIdx,
      storyHeaderIdx + storyPhraseLen,
    );
    sections.push({
      type: "story_header",
      static: true,
      text: storyPhrase,
      start_time: storyHeaderWords[0].start,
      end_time: storyHeaderWords[storyHeaderWords.length - 1].end,
      words: storyHeaderWords,
    });
    const storyContentStart = storyHeaderIdx + storyPhraseLen;

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
