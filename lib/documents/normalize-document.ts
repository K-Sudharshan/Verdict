import { DocumentType } from '../validation/schemas';
import { DocumentValidator } from './validate-upload';
import { PDFTextExtractor } from './extract-pdf-text';
import { ExtractedDocumentResult, DocumentPageText } from './types';
import { RawDocumentInput } from '../services/profile-service';

export class DocumentNormalizer {
  /**
   * Processes a document (PDF or Text Buffer) from upload to normalized extracted document.
   */
  public static async processUpload(params: {
    id?: string;
    documentType: DocumentType;
    filename: string;
    buffer: Buffer;
    mimeType?: string;
  }): Promise<ExtractedDocumentResult> {
    const { documentType, filename, buffer, mimeType } = params;
    const docId = params.id || `doc_${documentType.toLowerCase()}_${Date.now()}`;
    const fileSize = buffer ? buffer.length : 0;

    // 1. Validate Upload
    const validation = DocumentValidator.validateUpload(
      filename,
      fileSize,
      mimeType || 'application/octet-stream',
      buffer
    );

    if (!validation.valid) {
      throw new Error(`VALIDATION_ERROR: ${validation.error}`);
    }

    const lowerName = filename.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf');

    let fullText = '';
    let pageCount = 1;
    let pages: DocumentPageText[] = [];

    // 2. Extract Text
    if (isPdf) {
      const pdfResult = await PDFTextExtractor.extract(buffer);
      fullText = pdfResult.fullText;
      pageCount = pdfResult.pageCount;
      pages = pdfResult.pages;
    } else {
      // Plain text / Markdown
      const raw = buffer.toString('utf-8');
      fullText = PDFTextExtractor.cleanText(raw);
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('EMPTY_DOCUMENT: Document contains no text content.');
      }
      pages = [
        {
          pageNumber: 1,
          text: fullText,
          characterCount: fullText.length
        }
      ];
    }

    return {
      id: docId,
      documentType,
      originalFilename: filename,
      fileSizeBytes: fileSize,
      pageCount,
      fullText,
      pages,
      extractedAt: new Date().toISOString(),
      status: 'READY'
    };
  }

  /**
   * Converts ExtractedDocumentResult into the RawDocumentInput expected by ProfileService and Orchestrator.
   */
  public static toRawDocumentInput(extracted: ExtractedDocumentResult): RawDocumentInput {
    return {
      id: extracted.id,
      document_type: extracted.documentType,
      original_filename: extracted.originalFilename,
      text_content: extracted.fullText,
      pages: extracted.pages
    };
  }
}
