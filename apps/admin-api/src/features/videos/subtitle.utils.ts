const DIALOGUE_RE =
  /Dialogue:\s*(?<Layer>\d+),(?<Start>[\d:.]+),(?<End>[\d:.]+),(?<Style>[^,]+),(?<Name>[^,]*),(?<MarginL>\d+),(?<MarginR>\d+),(?<MarginV>\d+),(?<Effect>[^,]*),(?<Text>.*)/;

const KARAOKE_RE = /\{\\k(\d+)\}/g;

interface RawWord {
  word: string;
  start: number;
  end: number;
}

interface TranscriptionData {
  text: string;
  words: RawWord[];
  segments: unknown[];
}

function formatTime(seconds: number): string {
  seconds = Math.max(0, seconds);
  const h = Math.floor(seconds / 3600);
  const rem1 = seconds % 3600;
  const m = Math.floor(rem1 / 60);
  const rem2 = rem1 % 60;
  const s = Math.floor(rem2);
  const cs = Math.round((rem2 - s) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function parseTime(timeStr: string): number {
  try {
    const [h, m, sCs] = timeStr.split(":");
    const [s, cs] = sCs.split(".");
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(cs) / 100;
  } catch {
    return 0;
  }
}

function generateAssHeader(title: string): string {
  return `[Script Info]
Title: ${title}
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080
Comment: Transcription export. Edit words and timings in Aegisub, then re-upload.
`;
}

function generateAssStyles(): string {
  return `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Open Sans,60,&H00FFFFFF,&H00000000,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,10,10,10,1
`;
}

function parseKaraokeText(text: string, lineStartTime: number): RawWord[] {
  const words: RawWord[] = [];
  let currentTime = lineStartTime;

  // Split by karaoke tags: ['', duration1, word1, duration2, word2, ...]
  const parts = text.split(KARAOKE_RE);

  for (let i = 1; i < parts.length; i += 2) {
    const durationCs = parseInt(parts[i]);
    const wordText = parts[i + 1]?.trim();

    if (isNaN(durationCs) || !wordText) continue;

    const durationS = durationCs / 100;
    const wordEnd = currentTime + durationS;

    words.push({
      word: wordText,
      start: Math.round(currentTime * 1000) / 1000,
      end: Math.round(wordEnd * 1000) / 1000,
    });

    currentTime = wordEnd;
  }

  // Reset lastIndex since KARAOKE_RE is global
  KARAOKE_RE.lastIndex = 0;

  return words;
}

export function toAss(transcriptionJson: string, title: string): string {
  const data: TranscriptionData = JSON.parse(transcriptionJson);
  const words = data.words ?? [];

  const eventsHeader =
    "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text";

  if (words.length === 0) {
    return `${generateAssHeader(title)}\n${generateAssStyles()}\n${eventsHeader}\n`;
  }

  const parts = [
    generateAssHeader(title),
    generateAssStyles(),
    eventsHeader,
  ];

  for (const word of words) {
    const start = word.start ?? 0;
    const end = word.end ?? start;
    const text = word.word ?? "";
    if (text) {
      parts.push(
        `Dialogue: 0,${formatTime(start)},${formatTime(end)},Default,,0,0,0,,${text}`,
      );
    }
  }

  return parts.join("\n");
}

export function fromAss(
  assContent: string,
  originalTranscriptionJson: string,
): string {
  const originalData: TranscriptionData = JSON.parse(originalTranscriptionJson);
  const newWords: RawWord[] = [];

  for (const line of assContent.split("\n")) {
    if (!line.startsWith("Dialogue:")) continue;

    const match = DIALOGUE_RE.exec(line);
    if (!match?.groups) continue;

    const lineStartTime = parseTime(match.groups.Start);
    const lineEndTime = parseTime(match.groups.End);
    const text = match.groups.Text.trim();

    if (!text) continue;

    // Reset lastIndex before testing
    KARAOKE_RE.lastIndex = 0;

    if (KARAOKE_RE.test(text)) {
      newWords.push(...parseKaraokeText(text, lineStartTime));
    } else {
      newWords.push({
        word: text,
        start: Math.round(lineStartTime * 1000) / 1000,
        end: Math.round(lineEndTime * 1000) / 1000,
      });
    }
  }

  if (newWords.length === 0) {
    return originalTranscriptionJson;
  }

  const result: TranscriptionData = {
    text: newWords.map((w) => w.word).join(" "),
    words: newWords,
    segments: originalData.segments ?? [],
  };

  return JSON.stringify(result, null, 2);
}
