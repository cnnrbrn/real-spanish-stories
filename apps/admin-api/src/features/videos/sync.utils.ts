interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
}

interface TranscriptionData {
  words: TranscriptionWord[];
}

interface SectionWord {
  word: string;
  start: number;
  end: number;
  lineBreak?: boolean;
  language?: string;
}

interface Section {
  type: string;
  words?: SectionWord[];
  [key: string]: unknown;
}

interface SectionsData {
  sections: Section[];
}

/**
 * Sync word text from transcription to sections, preserving other fields.
 * When the user corrects spelling in the raw transcription, this propagates
 * those corrections to sections_json/language_tagged_json.
 */
export function syncTranscriptWords(
  transcriptionJson: string,
  sectionsJson: string,
): string {
  const transcription: TranscriptionData = JSON.parse(transcriptionJson);
  const sectionsData: SectionsData = JSON.parse(sectionsJson);
  const transcriptWords = transcription.words;

  let wordIndex = 0;
  for (const section of sectionsData.sections) {
    if (!section.words) continue;
    for (const sectionWord of section.words) {
      if (wordIndex < transcriptWords.length) {
        sectionWord.word = transcriptWords[wordIndex].word;
        wordIndex++;
      }
    }
  }

  return JSON.stringify(sectionsData);
}

/**
 * Sync lineBreak markers from sections_json to language_tagged_json.
 */
export function syncLineBreaks(
  sectionsJson: string,
  languageTaggedJson: string,
): string {
  const sections: SectionsData = JSON.parse(sectionsJson);
  const tagged: SectionsData = JSON.parse(languageTaggedJson);

  // Build lookup: sectionType -> wordIndex -> lineBreak
  const lineBreaks = new Map<string, Map<number, boolean>>();
  for (const section of sections.sections) {
    const wordMap = new Map<number, boolean>();
    for (const [i, word] of (section.words ?? []).entries()) {
      wordMap.set(i, word.lineBreak ?? false);
    }
    lineBreaks.set(section.type, wordMap);
  }

  // Apply to tagged JSON
  for (const section of tagged.sections) {
    const sectionBreaks = lineBreaks.get(section.type);
    if (!sectionBreaks) continue;
    for (const [i, word] of (section.words ?? []).entries()) {
      const hasBreak = sectionBreaks.get(i);
      if (hasBreak) {
        word.lineBreak = true;
      } else if ("lineBreak" in word) {
        delete word.lineBreak;
      }
    }
  }

  return JSON.stringify(tagged);
}
