'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  RefreshCw, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { DocumentType } from '@/lib/validation/schemas';
import { ExtractedDocumentResult } from '@/lib/documents/types';

export interface DocumentSlotState {
  type: DocumentType;
  label: string;
  subLabel?: string;
  icon: React.ElementType;
  required: boolean;
  file: File | null;
  status: 'IDLE' | 'UPLOADING' | 'VALIDATING' | 'EXTRACTING' | 'READY' | 'FAILED';
  extractedData: ExtractedDocumentResult | null;
  manualText: string;
  useManualText: boolean;
  error?: string;
}

interface DocumentIntakeZoneProps {
  slots: Record<string, DocumentSlotState>;
  onSlotChange: (key: string, updated: DocumentSlotState) => void;
}

export const DocumentIntakeZone: React.FC<DocumentIntakeZoneProps> = ({
  slots,
  onSlotChange
}) => {
  const [activePreviewKey, setActivePreviewKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = async (key: string, file: File) => {
    const currentSlot = slots[key];
    if (!currentSlot) return;

    onSlotChange(key, {
      ...currentSlot,
      file,
      useManualText: false,
      status: 'UPLOADING',
      error: undefined
    });

    try {
      onSlotChange(key, {
        ...currentSlot,
        file,
        status: 'EXTRACTING'
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', currentSlot.type);

      const res = await fetch('/api/documents/extract', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract text from document');
      }

      onSlotChange(key, {
        ...currentSlot,
        file,
        status: 'READY',
        extractedData: data.document,
        error: undefined
      });
    } catch (err: any) {
      console.error(`Extraction failed for ${key}:`, err);
      onSlotChange(key, {
        ...currentSlot,
        file: null,
        status: 'FAILED',
        error: err.message || 'Extraction failed. Try uploading plain text instead.'
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, key: string) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(key, file);
    }
  };

  const handleClearSlot = (key: string) => {
    const currentSlot = slots[key];
    if (!currentSlot) return;

    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }

    onSlotChange(key, {
      ...currentSlot,
      file: null,
      status: 'IDLE',
      extractedData: null,
      manualText: '',
      error: undefined
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-white" />
            CANDIDATE EVIDENCE INTAKE
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            Upload candidate resume, transcript, and requirements (PDF or Text). Full text &amp; page provenance are preserved.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Object.entries(slots).map(([key, slot]) => {
          const Icon = slot.icon;
          const isUploaded = slot.status === 'READY' && slot.extractedData;
          const isProcessing = slot.status === 'UPLOADING' || slot.status === 'VALIDATING' || slot.status === 'EXTRACTING';
          const isFailed = slot.status === 'FAILED';

          return (
            <div
              key={key}
              className={`relative rounded-xl border transition-all p-5 space-y-4 ${
                isUploaded
                  ? 'bg-black border-zinc-700'
                  : isFailed
                  ? 'bg-black border-zinc-800'
                  : 'bg-black border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg border bg-zinc-900 text-white border-zinc-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{slot.label}</span>
                      {slot.required ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-700">
                          REQUIRED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          OPTIONAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{slot.subLabel}</p>
                  </div>
                </div>

                {/* Switch between file upload & direct text */}
                <button
                  type="button"
                  onClick={() => {
                    onSlotChange(key, {
                      ...slot,
                      useManualText: !slot.useManualText
                    });
                  }}
                  className="text-xs text-zinc-300 hover:text-white underline font-medium"
                >
                  {slot.useManualText ? 'Switch to PDF Upload' : 'Direct Text Input'}
                </button>
              </div>

              {/* Mode 1: Manual Text Input */}
              {slot.useManualText ? (
                <div className="space-y-2">
                  <textarea
                    value={slot.manualText}
                    onChange={(e) => {
                      onSlotChange(key, {
                        ...slot,
                        manualText: e.target.value,
                        status: e.target.value.trim() ? 'READY' : 'IDLE',
                        extractedData: e.target.value.trim() ? {
                          text: e.target.value.trim(),
                          pageCount: 1,
                          pages: [{ pageNumber: 1, text: e.target.value.trim(), characterCount: e.target.value.length }],
                          metadata: { fileName: `${key}-manual.txt`, fileSize: e.target.value.length, fileType: 'text/plain', extractedAt: new Date().toISOString() },
                          provenance: { documentType: slot.type, documentId: `doc_${key}_manual`, integrityHash: 'manual_hash' }
                        } : null
                      });
                    }}
                    placeholder={`Paste ${slot.label.toLowerCase()} content directly here...`}
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono leading-relaxed"
                  />
                  <span className="text-[11px] text-zinc-500 block">
                    {slot.manualText.length} characters entered
                  </span>
                </div>
              ) : (
                /* Mode 2: PDF Drag & Drop Upload Zone */
                <div>
                  <input
                    type="file"
                    ref={(el) => { fileInputRefs.current[key] = el; }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(key, e.target.files[0]);
                      }
                    }}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />

                  {!isUploaded && !isProcessing && (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleFileDrop(e, key)}
                      onClick={() => fileInputRefs.current[key]?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-zinc-600 bg-zinc-950 rounded-xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                    >
                      <div className="w-10 h-10 mx-auto rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          Click to upload or drag &amp; drop PDF
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          PDF, TXT or Markdown (max 10MB)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Processing State */}
                  {isProcessing && (
                    <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center space-y-2.5 text-center animate-pulse">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                      <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                        {slot.status === 'UPLOADING' ? 'Uploading Document...' : 'Extracting PDF Content & Provenance...'}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Running integrity checks &amp; neutralizing prompt injection
                      </span>
                    </div>
                  )}

                  {/* Uploaded / Extracted Success State */}
                  {isUploaded && slot.extractedData && (
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                          <div className="truncate max-w-[200px] sm:max-w-[260px]">
                            <span className="text-xs font-bold text-white block truncate" title={slot.extractedData.metadata.fileName}>
                              {slot.extractedData.metadata.fileName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {formatBytes(slot.extractedData.metadata.fileSize)} • {slot.extractedData.pageCount} page(s) • {slot.extractedData.text.length} chars
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActivePreviewKey(activePreviewKey === key ? null : key)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                            title="Preview Extracted Text"
                          >
                            {activePreviewKey === key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearSlot(key)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                            title="Remove File"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Text Preview Drawer */}
                      {activePreviewKey === key && (
                        <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-zinc-400">
                            Extracted Plain Text Sample:
                          </span>
                          <div className="p-3 rounded-lg bg-black border border-zinc-800 max-h-36 overflow-y-auto text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {slot.extractedData.text.slice(0, 800)}
                            {slot.extractedData.text.length > 800 ? '...' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Failed State */}
                  {isFailed && (
                    <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-white">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <AlertCircle className="w-4 h-4 text-white" /> Extraction Failed
                        </span>
                        <button
                          type="button"
                          onClick={() => handleClearSlot(key)}
                          className="text-[11px] underline text-zinc-400 hover:text-white"
                        >
                          Retry
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-400">{slot.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
