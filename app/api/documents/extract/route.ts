import { NextRequest, NextResponse } from 'next/server';
import { DocumentNormalizer } from '@/lib/documents/normalize-document';
import { DocumentType } from '@/lib/validation/schemas';

/**
 * POST /api/documents/extract
 * Accepts multipart/form-data containing a candidate PDF or text file.
 * Returns normalized extraction result with page-level mapping.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('documentType') as DocumentType) || 'RESUME';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'NO_FILE_PROVIDED: Please upload a file.' },
        { status: 400 }
      );
    }

    const filename = file.name || 'document.pdf';
    const mimeType = file.type || 'application/pdf';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run full server-side validation & extraction pipeline
    const extracted = await DocumentNormalizer.processUpload({
      documentType,
      filename,
      buffer,
      mimeType
    });

    return NextResponse.json({
      success: true,
      document: extracted
    });
  } catch (err: any) {
    const message = err.message || 'Document extraction failed';
    const isValidationErr = message.startsWith('VALIDATION_ERROR') || message.startsWith('UNSUPPORTED_FORMAT') || message.startsWith('EMPTY_');

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: isValidationErr ? 'VALIDATION_FAILED' : 'EXTRACTION_FAILED'
      },
      { status: isValidationErr ? 400 : 422 }
    );
  }
}
