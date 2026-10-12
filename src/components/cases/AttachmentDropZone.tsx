import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle, Paperclip, Eye, X } from 'lucide-react';
import { FraudCaseAttachment } from '../../types/fms';

interface AttachmentDropZoneProps {
  attachments: FraudCaseAttachment[];
  onAttachmentsChange: (updated: FraudCaseAttachment[]) => void;
  isReadOnly?: boolean;
  maxFileSizeMB?: number; // default 10MB
  allowedExtensions?: string[];
}

const DEFAULT_ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx'];
const DEFAULT_MAX_SIZE_MB = 10;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const AttachmentDropZone: React.FC<AttachmentDropZoneProps> = ({
  attachments,
  onAttachmentsChange,
  isReadOnly = false,
  maxFileSizeMB = DEFAULT_MAX_SIZE_MB,
  allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<FraudCaseAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxFileSizeMB * 1024 * 1024;

  const processFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    const newAttachments: FraudCaseAttachment[] = [];
    const errors: string[] = [];

    filesArray.forEach((file) => {
      // Check size
      if (file.size > maxSizeBytes) {
        errors.push(`"${file.name}" melebihi batas maksimum ${maxFileSizeMB}MB (${formatFileSize(file.size)}).`);
        return;
      }

      // Check extension
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        errors.push(`"${file.name}" memiliki format tidak didukung. Format diizinkan: ${allowedExtensions.join(', ')}.`);
        return;
      }

      // Check duplicate
      const isDuplicate = attachments.some((a) => a.name.toLowerCase() === file.name.toLowerCase());
      if (isDuplicate) {
        errors.push(`File "${file.name}" sudah terunggah sebelumnya.`);
        return;
      }

      let fileUrl = '';
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        try {
          fileUrl = URL.createObjectURL(file);
        } catch {
          fileUrl = '';
        }
      }

      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || ext,
        url: fileUrl,
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      });
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  };

  // Drag Event Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReadOnly && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReadOnly) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isReadOnly) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isReadOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // reset input value so re-selecting same file triggers event
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    if (isReadOnly) return;
    const filtered = attachments.filter((att) => att.id !== id);
    onAttachmentsChange(filtered);
  };

  const getFileIcon = (fileName: string, fileType?: string) => {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || fileType?.startsWith('image/')) {
      return <Image className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0" />;
    }
    if (ext === 'pdf' || fileType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
  };

  return (
    <div className="space-y-3 font-sans">
      {!isReadOnly && (
        <div>
          {/* Drop Zone Box */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-all cursor-pointer select-none ${
              isDragging
                ? 'border-blue-500 bg-blue-50/80 shadow-md scale-[1.005]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept={allowedExtensions.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={`p-2.5 rounded-full ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-200/80 text-slate-600'}`}>
                <UploadCloud className="w-6 h-6 animate-bounce-short" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Tarik & lepas file di sini, atau{' '}
                  <span className="text-blue-600 underline decoration-blue-400 hover:text-blue-700">
                    klik untuk memilih dari perangkat anda
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format didukung: <span className="font-medium text-slate-700">{allowedExtensions.join(', ')}</span> (Maksimal {maxFileSizeMB}MB per file)
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Pilih File / Browse Device</span>
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Uploaded File List Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span>Daftar Dokumen / Barang Bukti Terlampir</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono">
              {attachments.length} File
            </span>
          </span>
        </div>

        {attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition group"
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                  {getFileIcon(att.name, att.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={att.name}>
                      {att.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{att.size}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Uploaded</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  {att.url && (
                    <button
                      type="button"
                      onClick={() => setPreviewModal(att)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition rounded"
                      title="Lihat Pratinjau File"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition rounded cursor-pointer"
                      title="Hapus File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500 italic">
            {isReadOnly ? 'Tidak ada dokumen lampiran untuk kasus ini.' : 'Belum ada file yang diunggah.'}
          </div>
        )}
      </div>

      {/* Modal Preview simple */}
      {previewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 overflow-hidden space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-slate-800 truncate">{previewModal.name}</span>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto flex justify-center bg-slate-100 p-2 rounded">
              {previewModal.type?.startsWith('image/') || previewModal.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={previewModal.url} alt={previewModal.name} className="max-h-[50vh] object-contain rounded" />
              ) : (
                <iframe src={previewModal.url} className="w-full h-[50vh]" title={previewModal.name} />
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewModal(null)}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
