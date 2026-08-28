import { DocumentValidationResult } from './types';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_FILE_SIZE_BYTES = 8; // At least 8 bytes

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.text', '.md']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'text/plain',
  'text/markdown',
  'application/octet-stream'
]);

export class DocumentValidator {
  public static validateUpload(
    filename: string,
    fileSize: number,
    mimeType: string,
    buffer?: Buffer
  ): DocumentValidationResult {
    // 1. Check filename
    if (!filename || typeof filename !== 'string') {
      return { valid: false, error: 'INVALID_FILENAME: Missing or invalid filename.' };
    }

    const lowerFilename = filename.toLowerCase().trim();
    const lastDotIndex = lowerFilename.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return { valid: false, error: 'INVALID_EXTENSION: File must have a valid extension (.pdf, .txt, .md).' };
    }

    const ext = lowerFilename.substring(lastDotIndex);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        valid: false,
        error: `UNSUPPORTED_FORMAT: Extension "${ext}" is not supported. Supported extensions: .pdf, .txt, .md`
      };
    }

    // 2. Check file size
    if (fileSize <= MIN_FILE_SIZE_BYTES) {
      return { valid: false, error: 'EMPTY_FILE: Uploaded file is empty or too small to contain meaningful text.' };
    }

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      const maxMb = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
      const actualMb = (fileSize / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `FILE_TOO_LARGE: File size (${actualMb} MB) exceeds maximum allowed limit of ${maxMb} MB.`
      };
    }

    // 3. Check MIME type
    const normalizedMime = mimeType?.toLowerCase().split(';')[0].trim() || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(normalizedMime) && !ALLOWED_EXTENSIONS.has(ext)) {
      return {
        valid: false,
        error: `INVALID_MIME_TYPE: File type "${normalizedMime}" is not allowed.`
      };
    }

    // 4. Magic byte validation if buffer is supplied
    if (buffer && buffer.length > 0) {
      if (ext === '.pdf') {
        const header = buffer.subarray(0, 5).toString('ascii');
        if (header !== '%PDF-') {
          return {
            valid: false,
            error: 'CORRUPTED_PDF: File extension is .pdf but the file content does not start with valid PDF magic bytes (%PDF-).'
          };
        }
      }
    }

    return {
      valid: true,
      normalizedMimeType: ext === '.pdf' ? 'application/pdf' : 'text/plain'
    };
  }
}
