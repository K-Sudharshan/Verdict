import { DocumentType } from '../validation/schemas';

export interface DocumentUploadFile {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
  documentType: DocumentType;
}

export interface DocumentPageText {
  pageNumber: number;
  text: string;
  characterCount: number;
}

export interface ExtractedDocumentResult {
  id: string;
  documentType: DocumentType;
  originalFilename: string;
  fileSizeBytes: number;
  pageCount: number;
  fullText: string;
  pages: DocumentPageText[];
  extractedAt: string;
  status: 'READY' | 'FAILED';
  error?: string;
}

export interface DocumentValidationResult {
  valid: boolean;
  error?: string;
  normalizedMimeType?: string;
}
