import type OpenAI from "openai";

interface Word {
  word: string;
  start: number;
  end: number;
  language?: string;
}

interface Section {
  type: string;
  words?: Word[];
}

interface SectionsData {
  sections: Section[];
}

const SPANISH_SECTIONS = new Set(["title_spanish", "story"]);
const ENGLISH_SECTIONS = new Set(["title_english", "summary"]);
const MIXED_SECTIONS = new Set(["vocabulary", "verbs", "subjunctive_verbs"]);

function tagAllWords(words: Word[], language: string): void {
  for (const word of words) {
    word.language = language;
  }
}

async function tagWordsWithAi(
  words: Word[],
  client: OpenAI,
): Promise<void> {
  const wordStrings = words.map((w) => w.word);

  const prompt = `You are tagging words from a Spanish learning video. The vocabulary and verbs sections contain Spanish words followed by their English translations/explanations.

For each word in the list below, determine if it is Spanish ("es") or English ("en").

Return a JSON array with exactly ${wordStrings.length} objects, one for each word in order.
Each object must have "word" and "language" fields.

Example output format:
[{"word": "gato", "language": "es"}, {"word": "cat", "language": "en"}]

Words to tag: ${JSON.stringify(wordStrings)}`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a language detection assistant. Return only valid JSON, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0].message.content?.trim() ?? "";
    const parsed = JSON.parse(responseText);

    // Handle both array response and object with array field
    let taggedWords: { word: string; language: string }[];
    if (Array.isArray(parsed)) {
      taggedWords = parsed;
    } else if (parsed && typeof parsed === "object") {
      taggedWords =
        parsed.words ?? parsed.result ?? parsed.data ?? [];
      if (!Array.isArray(taggedWords) || taggedWords.length === 0) {
        // Get first array value from object
        for (const v of Object.values(parsed)) {
          if (Array.isArray(v)) {
            taggedWords = v;
            break;
          }
        }
      }
    } else {
      taggedWords = [];
    }

    if (taggedWords.length === words.length) {
      for (let i = 0; i < taggedWords.length; i++) {
        words[i].language = taggedWords[i].language ?? "es";
      }
    } else {
      // Length mismatch — fallback to Spanish
      tagAllWords(words, "es");
    }
  } catch {
    // API failure — fallback to Spanish
    tagAllWords(words, "es");
  }
}

export async function tagLanguages(
  sectionsJson: string,
  client: OpenAI,
): Promise<string> {
  const data: SectionsData = JSON.parse(sectionsJson);
  const mixedWords: Word[] = [];

  for (const section of data.sections) {
    const words = section.words ?? [];
    if (words.length === 0) continue;

    if (SPANISH_SECTIONS.has(section.type)) {
      tagAllWords(words, "es");
    } else if (ENGLISH_SECTIONS.has(section.type)) {
      tagAllWords(words, "en");
    } else if (MIXED_SECTIONS.has(section.type)) {
      mixedWords.push(...words);
    } else {
      // Unknown section type — default to Spanish
      tagAllWords(words, "es");
    }
  }

  if (mixedWords.length > 0) {
    await tagWordsWithAi(mixedWords, client);
  }

  return JSON.stringify(data);
}
