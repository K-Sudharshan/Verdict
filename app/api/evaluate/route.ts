import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db/repository';
import { EvaluationOrchestrator } from '@/lib/services/orchestrator';
import { RawDocumentInput } from '@/lib/services/profile-service';
import { DocumentNormalizer } from '@/lib/documents/normalize-document';
import { DocumentType } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let candidateName = '';
    let roleTitle = 'Senior Software Engineer';
    let documents: RawDocumentInput[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      candidateName = (formData.get('candidateName') as string) || '';
      roleTitle = (formData.get('roleTitle') as string) || 'Senior Software Engineer';

      const fileEntries: { key: string; type: DocumentType; defaultName: string }[] = [
        { key: 'resumeFile', type: 'RESUME', defaultName: 'Resume.pdf' },
        { key: 'transcriptFile', type: 'TRANSCRIPT', defaultName: 'Transcript.pdf' },
        { key: 'jobDescriptionFile', type: 'JOB_DESCRIPTION', defaultName: 'Job_Description.txt' },
        { key: 'additionalEvidenceFile', type: 'INTERVIEW_TRANSCRIPT', defaultName: 'Additional_Evidence.pdf' }
      ];

      for (const entry of fileEntries) {
        const file = formData.get(entry.key) as File | null;
        if (file && file.size > 0) {
          const buf = Buffer.from(await file.arrayBuffer());
          const extracted = await DocumentNormalizer.processUpload({
            documentType: entry.type,
            filename: file.name || entry.defaultName,
            buffer: buf,
            mimeType: file.type
          });
          documents.push(DocumentNormalizer.toRawDocumentInput(extracted));
        }
      }

      // Check text fallback in form data if files weren't attached
      if (documents.length === 0 || !documents.some(d => d.document_type === 'RESUME')) {
        const resumeText = (formData.get('resumeText') as string) || '';
        if (resumeText.trim()) {
          documents.unshift({
            id: `doc_resume_${Date.now()}`,
            document_type: 'RESUME',
            original_filename: `${candidateName.replace(/\s+/g, '_') || 'Candidate'}_Resume.txt`,
            text_content: resumeText.trim()
          });
        }
      }
    } else {
      // JSON body
      const body = await req.json();
      candidateName = body.candidateName;
      roleTitle = body.roleTitle || 'Senior Software Engineer';

      if (body.documents && Array.isArray(body.documents) && body.documents.length > 0) {
        documents = body.documents.map((d: any) => ({
          id: d.id || `doc_${Date.now()}`,
          document_type: d.document_type || d.documentType || 'RESUME',
          original_filename: d.original_filename || d.originalFilename || 'Document.pdf',
          text_content: d.text_content || d.fullText || d.textContent || '',
          pages: d.pages
        }));
      } else {
        // Text fallback
        const { resumeText, transcriptText, jobDescriptionText } = body;
        if (resumeText) {
          documents.push({
            id: `doc_resume_${Date.now()}`,
            document_type: 'RESUME',
            original_filename: `${candidateName ? candidateName.replace(/\s+/g, '_') : 'Candidate'}_Resume.pdf`,
            text_content: resumeText
          });
        }
        if (transcriptText) {
          documents.push({
            id: `doc_transcript_${Date.now()}`,
            document_type: 'TRANSCRIPT',
            original_filename: `${candidateName ? candidateName.replace(/\s+/g, '_') : 'Candidate'}_Transcript.pdf`,
            text_content: transcriptText
          });
        }
        if (jobDescriptionText) {
          documents.push({
            id: `doc_jd_${Date.now()}`,
            document_type: 'JOB_DESCRIPTION',
            original_filename: 'Job_Description.txt',
            text_content: jobDescriptionText
          });
        }
      }
    }

    if (!candidateName || !candidateName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Candidate name is required.' },
        { status: 400 }
      );
    }

    const hasResume = documents.some(d => d.document_type === 'RESUME' && d.text_content.trim().length > 0);
    if (!hasResume) {
      return NextResponse.json(
        { success: false, error: 'Candidate Resume (PDF or Text) is required.' },
        { status: 400 }
      );
    }

    const evalId = `eval_${Date.now()}`;
    const candidateId = `cand_${Date.now()}`;

    dbRepository.createEvaluation({
      id: evalId,
      candidate_id: candidateId,
      candidate_name: candidateName,
      role_title: roleTitle || 'Senior Software Engineer',
      documents: documents.map(d => ({
        id: d.id,
        document_type: d.document_type,
        original_filename: d.original_filename,
        status: 'PROCESSED',
        file_size_bytes: d.text_content.length,
        text_content: d.text_content
      }))
    });

    // Execute full pipeline
    const completedEval = await EvaluationOrchestrator.executeFullPipeline({
      evaluationId: evalId,
      candidateName,
      roleTitle,
      documents
    });

    return NextResponse.json({ success: true, evaluation: completedEval });
  } catch (err: any) {
    const errMsg: string = err?.message || 'Internal error';
    console.error('[API /evaluate] Pipeline error:', errMsg);

    if (errMsg.includes('LLM_CALL_FAILED')) {
      return NextResponse.json(
        { success: false, error: errMsg, code: 'LLM_CALL_FAILED' },
        { status: 502 }
      );
    }

    if (errMsg.startsWith('VALIDATION_ERROR') || errMsg.startsWith('EMPTY_')) {
      return NextResponse.json(
        { success: false, error: errMsg, code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
