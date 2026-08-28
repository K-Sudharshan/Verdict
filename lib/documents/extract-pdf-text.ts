import { DocumentPageText } from './types';

export interface PDFExtractionResult {
  fullText: string;
  pageCount: number;
  pages: DocumentPageText[];
  metadata: {
    info?: any;
    version?: string;
  };
}

export class PDFTextExtractor {
  /**
   * Extracts clean, structured text and page-level mappings from a PDF buffer.
   * Uses pdf-parse on the server.
   */
  public static async extract(buffer: Buffer): Promise<PDFExtractionResult> {
    if (!buffer || buffer.length === 0) {
      throw new Error('EXTRACTION_FAILED: Buffer is empty.');
    }

    try {
      // Dynamic require to ensure seamless server-side execution across Next.js bundles
      const pdfParse = require('pdf-parse');

      const pages: DocumentPageText[] = [];
      let currentPageNum = 0;

      // Custom page renderer to capture page-level text blocks
      const pager = (pageData: any) => {
        currentPageNum++;
        const pNum = currentPageNum;

        return pageData.getTextContent().then((textContent: any) => {
          let lastY: number | undefined;
          let text = '';

          for (const item of textContent.items) {
            if (lastY === item.transform[5] || lastY === undefined) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }

          const cleanedPageText = PDFTextExtractor.cleanText(text);
          pages.push({
            pageNumber: pNum,
            text: cleanedPageText,
            characterCount: cleanedPageText.length
          });

          return cleanedPageText;
        });
      };

      const data = await pdfParse(buffer, {
        pager
      });

      const fullText = PDFTextExtractor.cleanText(data.text);
      const pageCount = data.numpages || pages.length || 1;

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('EMPTY_PDF_CONTENT: The PDF contains no extractable text (e.g. scanned image-only PDF without OCR).');
      }

      // If pager didn't populate for single-page documents, ensure at least one page is recorded
      if (pages.length === 0) {
        pages.push({
          pageNumber: 1,
          text: fullText,
          characterCount: fullText.length
        });
      }

      return {
        fullText,
        pageCount,
        pages,
        metadata: {
          info: data.info,
          version: data.version
        }
      };
    } catch (err: any) {
      if (err.message && err.message.startsWith('EMPTY_PDF_CONTENT')) {
        throw err;
      }
      const safeError = String(err?.message || 'UNKNOWN_PDF_PARSING_ERROR').slice(0, 200);
      throw new Error(`PDF_PARSING_FAILED: Could not parse PDF file (${safeError})`);
    }
  }

  /**
   * Cleans and sanitizes extracted text:
   * - Normalizes CRLF and consecutive newlines
   * - Strips unprintable control characters
   * - Neutralizes system delimiter tokens to prevent prompt injection
   */
  public static cleanText(rawText: string): string {
    if (!rawText) return '';

    return rawText
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove null bytes and unprintable control characters (except newline, tab)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Neutralize potential prompt injection XML delimiters by escaping angle brackets in structural tokens
      .replace(/<\/?(?:SYSTEM|INSTRUCTION|PROMPT|CANDIDATE_PROFILE|EVIDENCE_LEDGER|TARGET_JOB_DESCRIPTION)[^>]*>/gi, (match) => `[${match.replace(/[<>]/g, '')}]`)
      // Collapse excessive blank lines
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  }
}
