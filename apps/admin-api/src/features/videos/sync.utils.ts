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

  // Build lookup by start time — timings don't change during manual edits
  const wordByStart = new Map<number, string>();
  for (const w of transcription.words) {
    wordByStart.set(w.start, w.word);
  }

  for (const section of sectionsData.sections) {
    if (!section.words) continue;
    for (const sectionWord of section.words) {
      const updated = wordByStart.get(sectionWord.start);
      if (updated !== undefined) {
        sectionWord.word = updated;
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

  // Build lookup by start time — same approach as syncTranscriptWords
  const lineBreaks = new Map<number, boolean>();
  for (const section of sections.sections) {
    for (const word of section.words ?? []) {
      lineBreaks.set(word.start, word.lineBreak ?? false);
    }
  }

  // Apply to tagged JSON
  for (const section of tagged.sections) {
    for (const word of section.words ?? []) {
      const hasBreak = lineBreaks.get(word.start);
      if (hasBreak) {
        word.lineBreak = true;
      } else if ("lineBreak" in word) {
        delete word.lineBreak;
      }
    }
  }

  return JSON.stringify(tagged);
}
