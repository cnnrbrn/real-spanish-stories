import PDFDocument from "pdfkit";
import { parse, HTMLElement, NodeType, type Node } from "node-html-parser";
import type { News } from "@real-spanish-stories/shared";

// Single light-themed PDF. News has no theme/level dimension like stories, so
// there is one clean document per article.
const COLORS = {
  background: "#FFFFFF",
  foreground: "#3A2E28",
  primary: "#8B4F2A",
  muted: "#5C4C43",
  rule: "#D8D0C4",
} as const;

const PAGE_MARGIN = 50;
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const CONTENT_WIDTH = A4_WIDTH - PAGE_MARGIN * 2;

// Font sizes (points).
const HEADING_SIZE = 22;
const DATE_SIZE = 12;
const H2_SIZE = 17;
const H3_SIZE = 14;
const BODY_SIZE = 12;

// Vertical rhythm (points).
const LINE_GAP = 3;
const PARAGRAPH_SPACING = 8;
const HEADING_SPACING_BEFORE = 14;
const HEADING_SPACING_AFTER = 6;
const HEADER_DIVIDER_SPACING = 12;
const RULE_SPACING = 10;

// Indentation (points) applied per nesting level for lists and blockquotes.
const INDENT_STEP = 18;
const LIST_MARKER_WIDTH = 16;

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  italic: "Helvetica-Oblique",
  boldItalic: "Helvetica-BoldOblique",
} as const;

// Footer watermark, matching the story PDFs.
const FOOTER_SIZE = 11;
const FOOTER_OFFSET_FROM_BOTTOM = 28;
const SITE_URL = "https://realspanishstories.com";
const SITE_LABEL = "realspanishstories.com";

const NEWS_SERIES_NAME = "Latin American News in Slow, Easy Spanish";

// Mirror the web heading fallback (apps/web/src/features/news/utils/title.ts).
function newsHeading(news: Pick<News, "title" | "date">): string {
  return news.title ?? `${NEWS_SERIES_NAME} – ${formatNewsDate(news.date)}`;
}

// Mirror the web date formatting (apps/web/src/features/news/utils/date.ts).
function formatNewsDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

interface InlineStyle {
  bold: boolean;
  italic: boolean;
}

interface InlineRun {
  text: string;
  style: InlineStyle;
}

function fontFor(style: InlineStyle): string {
  if (style.bold && style.italic) return FONTS.boldItalic;
  if (style.bold) return FONTS.bold;
  if (style.italic) return FONTS.italic;
  return FONTS.regular;
}

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === NodeType.ELEMENT_NODE;
}

// Collapse runs of whitespace the way an HTML renderer would, so the source
// indentation between tags does not leak into the PDF.
function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ");
}

// Walk an element's descendants into styled inline runs, tracking bold/italic
// and turning <br> into hard line breaks.
function collectInlineRuns(
  node: Node,
  style: InlineStyle,
  runs: InlineRun[],
): void {
  if (node.nodeType === NodeType.TEXT_NODE) {
    const text = collapseWhitespace(node.text);
    if (text.length > 0) runs.push({ text, style });
    return;
  }
  if (!isElement(node)) return;

  const tag = node.rawTagName?.toLowerCase();
  if (tag === "br") {
    runs.push({ text: "\n", style });
    return;
  }

  const nextStyle: InlineStyle = {
    bold: style.bold || tag === "strong" || tag === "b",
    italic: style.italic || tag === "em" || tag === "i",
  };
  for (const child of node.childNodes) {
    collectInlineRuns(child, nextStyle, runs);
  }
}

// Trim leading/trailing whitespace-only runs so blocks do not start or end with
// stray spaces produced by whitespace collapsing.
function trimRuns(runs: InlineRun[]): InlineRun[] {
  const trimmed = runs.map((run) => ({ ...run }));
  if (trimmed.length > 0) {
    trimmed[0].text = trimmed[0].text.replace(/^\s+/, "");
    const last = trimmed.length - 1;
    trimmed[last].text = trimmed[last].text.replace(/\s+$/, "");
  }
  return trimmed.filter((run) => run.text.length > 0);
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > A4_HEIGHT - PAGE_MARGIN) {
    doc.addPage();
  }
}

// Render a sequence of styled runs as flowing text, using pdfkit's `continued`
// option so style changes stay on the same line.
function renderInlineBlock(
  doc: PDFKit.PDFDocument,
  runs: InlineRun[],
  options: {
    size: number;
    indent?: number;
    color?: string;
    prefix?: InlineRun;
  },
): void {
  const trimmed = trimRuns(runs);
  const prefix = options.prefix ? [options.prefix] : [];
  const all = [...prefix, ...trimmed];
  if (all.length === 0) return;

  const indent = options.indent ?? 0;
  const x = PAGE_MARGIN + indent;
  const width = CONTENT_WIDTH - indent;

  doc.fontSize(options.size).fillColor(options.color ?? COLORS.foreground);
  ensureSpace(doc, options.size + LINE_GAP);

  all.forEach((run, i) => {
    doc.font(fontFor(run.style)).fontSize(options.size);
    doc.text(run.text, x, doc.y, {
      continued: i < all.length - 1,
      width,
      lineGap: LINE_GAP,
    });
  });
}

function drawRule(
  doc: PDFKit.PDFDocument,
  spacing: number,
  color: string = COLORS.rule,
): void {
  ensureSpace(doc, spacing * 2);
  doc.moveDown(0.5);
  const y = doc.y;
  doc
    .save()
    .lineWidth(1)
    .strokeColor(color)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(A4_WIDTH - PAGE_MARGIN, y)
    .stroke()
    .restore();
  doc.y = y + spacing;
}

// Centred, hyperlinked site watermark at the foot of the current page. Matches
// the story PDFs; draws below the content margin by temporarily zeroing it.
function drawFooter(doc: PDFKit.PDFDocument): void {
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc
    .fontSize(FOOTER_SIZE)
    .font(FONTS.regular)
    .fillColor(COLORS.muted)
    .text(SITE_LABEL, PAGE_MARGIN, A4_HEIGHT - FOOTER_OFFSET_FROM_BOTTOM, {
      width: CONTENT_WIDTH,
      align: "center",
      lineBreak: false,
      link: SITE_URL,
    });
  doc.page.margins.bottom = savedBottom;
}

// Render one block-level element. Lists recurse with increasing indent.
function renderBlock(
  doc: PDFKit.PDFDocument,
  element: HTMLElement,
  indent: number,
): void {
  const tag = element.rawTagName?.toLowerCase();

  switch (tag) {
    case "h2":
    case "h3": {
      const runs: InlineRun[] = [];
      collectInlineRuns(element, { bold: true, italic: false }, runs);
      doc.y += HEADING_SPACING_BEFORE;
      renderInlineBlock(doc, runs, {
        size: tag === "h2" ? H2_SIZE : H3_SIZE,
        indent,
        color: COLORS.primary,
      });
      doc.y += HEADING_SPACING_AFTER;
      break;
    }
    case "blockquote": {
      // Render child blocks in italic, indented one step further.
      const childBlocks = element.childNodes.filter(isElement);
      if (childBlocks.length > 0) {
        for (const child of childBlocks) {
          renderQuoteBlock(doc, child, indent + INDENT_STEP);
        }
      } else {
        const runs: InlineRun[] = [];
        collectInlineRuns(element, { bold: false, italic: true }, runs);
        renderInlineBlock(doc, runs, {
          size: BODY_SIZE,
          indent: indent + INDENT_STEP,
          color: COLORS.muted,
        });
        doc.y += PARAGRAPH_SPACING;
      }
      break;
    }
    case "ul":
    case "ol": {
      const items = element.childNodes
        .filter(isElement)
        .filter((child) => child.rawTagName?.toLowerCase() === "li");
      items.forEach((li, index) => {
        renderListItem(doc, li, indent, tag === "ol" ? `${index + 1}.` : "•");
      });
      break;
    }
    case "hr":
      drawRule(doc, RULE_SPACING);
      break;
    case "p":
    default: {
      const runs: InlineRun[] = [];
      collectInlineRuns(element, { bold: false, italic: false }, runs);
      renderInlineBlock(doc, runs, { size: BODY_SIZE, indent });
      doc.y += PARAGRAPH_SPACING;
      break;
    }
  }
}

function renderQuoteBlock(
  doc: PDFKit.PDFDocument,
  element: HTMLElement,
  indent: number,
): void {
  const runs: InlineRun[] = [];
  collectInlineRuns(element, { bold: false, italic: true }, runs);
  renderInlineBlock(doc, runs, {
    size: BODY_SIZE,
    indent,
    color: COLORS.muted,
  });
  doc.y += PARAGRAPH_SPACING;
}

function renderListItem(
  doc: PDFKit.PDFDocument,
  li: HTMLElement,
  indent: number,
  marker: string,
): void {
  // Inline content of the <li> (excluding any nested lists).
  const inlineRuns: InlineRun[] = [];
  const nestedLists: HTMLElement[] = [];
  for (const child of li.childNodes) {
    if (
      isElement(child) &&
      ["ul", "ol"].includes(child.rawTagName?.toLowerCase() ?? "")
    ) {
      nestedLists.push(child);
    } else {
      collectInlineRuns(child, { bold: false, italic: false }, inlineRuns);
    }
  }

  renderInlineBlock(doc, inlineRuns, {
    size: BODY_SIZE,
    indent: indent + LIST_MARKER_WIDTH,
    prefix: {
      text: `${marker}  `,
      style: { bold: false, italic: false },
    },
  });
  doc.y += LINE_GAP;

  for (const nested of nestedLists) {
    renderBlock(doc, nested, indent + INDENT_STEP);
  }
}

export function generateNewsPdf(news: News): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      bufferPages: true,
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

    const paintBackground = () => {
      doc
        .save()
        .rect(0, 0, A4_WIDTH, A4_HEIGHT)
        .fill(COLORS.background)
        .restore();
    };
    paintBackground();
    doc.on("pageAdded", paintBackground);

    // Header: heading, date, divider.
    doc
      .font(FONTS.bold)
      .fontSize(HEADING_SIZE)
      .fillColor(COLORS.foreground)
      .text(newsHeading(news), PAGE_MARGIN, doc.y, {
        width: CONTENT_WIDTH,
        lineGap: LINE_GAP,
      });

    // Only show a separate date line when there is a custom title; the default
    // heading already ends with the date (mirrors the web NewsDetails layout).
    if (news.title) {
      doc.moveDown(0.4);
      doc
        .font(FONTS.regular)
        .fontSize(DATE_SIZE)
        .fillColor(COLORS.muted)
        .text(formatNewsDate(news.date), PAGE_MARGIN, doc.y, {
          width: CONTENT_WIDTH,
        });
    }

    drawRule(doc, HEADER_DIVIDER_SPACING, COLORS.primary);

    const root = parse(news.transcript ?? "");
    for (const node of root.childNodes) {
      if (isElement(node)) {
        renderBlock(doc, node, 0);
      } else if (node.nodeType === NodeType.TEXT_NODE) {
        // Bare text at the top level (rare) — treat as a paragraph.
        const text = collapseWhitespace(node.text).trim();
        if (text.length > 0) {
          renderInlineBlock(
            doc,
            [{ text, style: { bold: false, italic: false } }],
            { size: BODY_SIZE, indent: 0 },
          );
          doc.y += PARAGRAPH_SPACING;
        }
      }
    }

    // Draw the footer on every page now that all content is laid out.
    const { start, count } = doc.bufferedPageRange();
    for (let i = 0; i < count; i++) {
      doc.switchToPage(start + i);
      drawFooter(doc);
    }
    doc.flushPages();

    doc.end();
  });
}
