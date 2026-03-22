import PDFDocument from "pdfkit";
import type { Story } from "@real-spanish-stories/shared";
import type {
  TranscriptionSection,
  TranscriptionWord,
} from "@real-spanish-stories/shared";

const THEMES = {
  light: {
    background: "#FFFFFF",
    foreground: "#3A2E28",
    primary: "#8B4F2A",
    mutedBg: "#EBE5D9",
    mutedFg: "#5C4C43",
    card: "#FFFFFF",
  },
  dark: {
    background: "#1A1826",
    foreground: "#E6DFCF",
    primary: "#D4C4A0",
    mutedBg: "#2A2840",
    mutedFg: "#B5AEA0",
    card: "#201E30",
  },
} as const;

type Colors = (typeof THEMES)[keyof typeof THEMES];

const PAGE_MARGIN = 50;
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const CONTENT_WIDTH = A4_WIDTH - PAGE_MARGIN * 2;
const FONT_SIZE = 13;
const LINE_HEIGHT = FONT_SIZE * 1.6;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > A4_HEIGHT - PAGE_MARGIN) {
    doc.addPage();
  }
}

function stripComma(text: string): string {
  return text.replace(/,+$/, "");
}

/** Split words into lines using lineBreak markers */
function splitByLineBreak(
  words: TranscriptionWord[],
): TranscriptionWord[][] {
  const lines: TranscriptionWord[][] = [];
  let current: TranscriptionWord[] = [];
  for (const word of words) {
    current.push(word);
    if (word.lineBreak) {
      lines.push(current);
      current = [];
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

/** Group consecutive words by language */
function getLanguageRuns(
  words: TranscriptionWord[],
): Array<{ language: string; words: TranscriptionWord[] }> {
  const runs: Array<{ language: string; words: TranscriptionWord[] }> = [];
  for (const word of words) {
    const lang = word.language;
    if (runs.length === 0 || runs[runs.length - 1].language !== lang) {
      runs.push({ language: lang, words: [word] });
    } else {
      runs[runs.length - 1].words.push(word);
    }
  }
  return runs;
}

// --- Section renderers ---

function renderTitleSpanish(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  ensureSpace(doc, 40);
  const text = section.words.map((w) => w.word).join(" ");
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor(colors.foreground)
    .text(text, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.3);
}

function renderTitleEnglish(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  ensureSpace(doc, 30);
  const text = section.words.map((w) => w.word).join(" ");
  doc
    .fontSize(14)
    .font("Helvetica")
    .fillColor(colors.mutedFg)
    .text(text, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(1);
}

function renderSummary(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  const text = section.words.map((w) => w.word).join(" ");
  const innerWidth = CONTENT_WIDTH - 20;
  const summaryLineGap = 4;
  const textHeight = doc
    .fontSize(FONT_SIZE)
    .font("Helvetica")
    .heightOfString(text, { width: innerWidth, lineGap: summaryLineGap });
  const boxHeight = textHeight + 24;

  ensureSpace(doc, boxHeight + 10);

  const boxY = doc.y;
  doc
    .save()
    .roundedRect(PAGE_MARGIN, boxY, CONTENT_WIDTH, boxHeight, 4)
    .fill(colors.mutedBg);
  doc.restore();

  doc
    .fontSize(FONT_SIZE)
    .font("Helvetica")
    .fillColor(colors.foreground)
    .text(text, PAGE_MARGIN + 10, boxY + 12, { width: innerWidth, lineGap: summaryLineGap });

  doc.y = boxY + boxHeight;
  doc.moveDown(1);
}

function renderSectionHeader(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  doc.moveDown(1.5);
  ensureSpace(doc, 40);
  const text =
    section.static && section.text
      ? section.text
      : section.words.map((w) => w.word).join(" ");
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor(colors.primary)
    .text(text, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });

  const lineY = doc.y + 2;
  doc
    .save()
    .moveTo(PAGE_MARGIN, lineY)
    .lineTo(A4_WIDTH - PAGE_MARGIN, lineY)
    .strokeColor(colors.primary)
    .lineWidth(1)
    .stroke();
  doc.restore();

  doc.y = lineY + 8;
}

/**
 * Vocabulary: each line split by lineBreak.
 * Per line: "Spanish words  -  English words" as a single text call.
 */
function renderVocabulary(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  const lines = splitByLineBreak(section.words);

  for (const line of lines) {
    const spanish = line
      .filter((w) => w.language !== "en")
      .map((w) => stripComma(w.word))
      .join(" ");
    const english = line
      .filter((w) => w.language === "en")
      .map((w) => stripComma(w.word))
      .join(" ");

    ensureSpace(doc, LINE_HEIGHT);
    doc.fontSize(FONT_SIZE).fillColor(colors.foreground);
    doc
      .font("Helvetica-Bold")
      .text(spanish, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, continued: true })
      .font("Helvetica")
      .text("  -  ", { continued: english ? true : false })
      .text(english);
  }

  doc.moveDown(0.5);
}

/**
 * Verbs: split by lineBreak into groups.
 * Each group has 4 language runs:
 *   1. Verb (es) - 2. Translation (en)
 *   3. Example sentence (es) - 4. Example translation (en)
 * Groups separated by a thin rule.
 * All rendered as plain text calls (no continued).
 */
function renderVerbs(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  const groups = splitByLineBreak(section.words);

  for (let gi = 0; gi < groups.length; gi++) {
    if (gi > 0) {
      ensureSpace(doc, LINE_HEIGHT + 8);
      const ruleY = doc.y + 2;
      doc
        .save()
        .moveTo(PAGE_MARGIN, ruleY)
        .lineTo(A4_WIDTH - PAGE_MARGIN, ruleY)
        .strokeColor(colors.mutedBg)
        .lineWidth(0.5)
        .stroke();
      doc.restore();
      doc.y = ruleY + 8;
    }

    const runs = getLanguageRuns(groups[gi]);
    const verbText = runs[0]
      ? runs[0].words.map((w) => w.word).join(" ")
      : "";
    const translationText = runs[1]
      ? runs[1].words.map((w) => w.word).join(" ")
      : "";
    const esSentenceText = runs[2]
      ? runs[2].words.map((w) => w.word).join(" ")
      : "";
    const enSentenceText = runs[3]
      ? runs[3].words.map((w) => w.word).join(" ")
      : "";

    // Line 1: verb - translation
    const line1 = translationText
      ? `${verbText}  -  ${translationText}`
      : verbText;
    ensureSpace(doc, LINE_HEIGHT * 2 + 4);
    doc
      .fontSize(FONT_SIZE)
      .font("Helvetica-Bold")
      .fillColor(colors.foreground)
      .text(line1, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });

    // Line 2: example sentence - example translation
    if (esSentenceText) {
      const line2 = enSentenceText
        ? `${esSentenceText}  -  ${enSentenceText}`
        : esSentenceText;
      doc
        .fontSize(FONT_SIZE)
        .font("Helvetica")
        .fillColor(colors.foreground)
        .text(line2, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH });
    }

    doc.moveDown(0.3);
  }

  doc.moveDown(0.5);
}

/**
 * Story: render words inline with manual x/y tracking.
 * Spanish in foreground, English in muted+italic.
 * lineBreak starts a new line.
 */
function renderStory(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  ensureSpace(doc, LINE_HEIGHT);
  let curX = PAGE_MARGIN;
  let curY = doc.y;

  for (const word of section.words) {
    const isEnglish = word.language === "en";
    const font = isEnglish ? "Helvetica-Oblique" : "Helvetica";
    const color = isEnglish ? colors.mutedFg : colors.foreground;

    doc.fontSize(FONT_SIZE).font(font);
    const wordText = word.word;
    const wordW = doc.widthOfString(wordText);
    const spaceW = doc.widthOfString(" ");

    // Wrap to next line if needed
    if (curX + wordW > A4_WIDTH - PAGE_MARGIN && curX > PAGE_MARGIN) {
      curX = PAGE_MARGIN;
      curY += LINE_HEIGHT;
      ensureSpace(doc, LINE_HEIGHT);
      curY = doc.y > curY ? doc.y : curY;
    }

    doc.fillColor(color).text(wordText, curX, curY, { lineBreak: false });
    curX += wordW + spaceW;

    if (word.lineBreak) {
      curX = PAGE_MARGIN;
      curY += LINE_HEIGHT * 1.2;
      ensureSpace(doc, LINE_HEIGHT);
      curY = doc.y > curY ? doc.y : curY;
    }
  }

  doc.y = curY + LINE_HEIGHT;
  doc.moveDown(0.5);
}

function renderEndCard(
  doc: PDFKit.PDFDocument,
  section: TranscriptionSection,
  colors: Colors,
) {
  ensureSpace(doc, 30);
  const text = section.words.map((w) => w.word).join(" ");
  doc
    .fontSize(FONT_SIZE)
    .font("Helvetica")
    .fillColor(colors.mutedFg)
    .text(text, PAGE_MARGIN, doc.y, { width: CONTENT_WIDTH, align: "center" });
  doc.moveDown(1);
}

export function generateStoryPdf(
  story: Story,
  theme: "light" | "dark",
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const colors = THEMES[theme];
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: PAGE_MARGIN,
        bottom: PAGE_MARGIN,
        left: PAGE_MARGIN,
        right: PAGE_MARGIN,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Background on first page
    doc
      .save()
      .rect(0, 0, A4_WIDTH, A4_HEIGHT)
      .fill(colors.background)
      .restore();

    // Background on new pages
    doc.on("pageAdded", () => {
      doc
        .save()
        .rect(0, 0, A4_WIDTH, A4_HEIGHT)
        .fill(colors.background)
        .restore();
    });

    if (!story.transcription) {
      doc.end();
      return;
    }

    for (const section of story.transcription.sections) {
      switch (section.type) {
        case "title_spanish":
          renderTitleSpanish(doc, section, colors);
          break;
        case "title_english":
          renderTitleEnglish(doc, section, colors);
          break;
        case "summary":
          renderSummary(doc, section, colors);
          break;
        case "vocabulary_header":
        case "verbs_header":
        case "story_header":
          renderSectionHeader(doc, section, colors);
          break;
        case "vocabulary":
          renderVocabulary(doc, section, colors);
          break;
        case "verbs":
          renderVerbs(doc, section, colors);
          break;
        case "story":
          renderStory(doc, section, colors);
          break;
        case "end_card":
          renderEndCard(doc, section, colors);
          break;
      }
    }

    doc.end();
  });
}
