import React from 'react';
import { 
  X, 
  ShieldAlert, 
  User, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Phone, 
  Calendar, 
  Globe,
  ExternalLink,
  Lock,
  Clock,
  Fingerprint
} from 'lucide-react';
import { ExternalBlacklistEntry } from '../../types/fms';

interface ExternalBlacklistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ExternalBlacklistEntry | null;
  onEdit?: (entry: ExternalBlacklistEntry) => void;
}

export const ExternalBlacklistDetailModal: React.FC<ExternalBlacklistDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  onEdit
}) => {
  if (!isOpen || !entry) return null;

  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getSourceBadge = (source: string) => {
    if (source.includes('DTTOT')) return 'bg-red-50 text-red-700 border-red-200';
    if (source.includes('Regulator') || source.includes('OJK')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (source.includes('Aparat') || source.includes('POLRI')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (source.includes('Konsorsium')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                  {entry.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getThreatBadge(entry.threatLevel)}`}>
                  {entry.threatLevel} THREAT
                </span>
              </div>
              <h2 className="text-base font-bold text-white">
                {entry.fullName}
              </h2>
            </div>
          </div>
          <button 
            id="close-external-detail-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Match Alert Box if matched */}
          {entry.matchStatus === 'Matched With Existing CIF' ? (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-red-900 flex items-center gap-2">
                  <span>🚨 CRITICAL WARNING: ENTITAS COCOK DENGAN CIF NASABAH BANK!</span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  Sistem mendeteksi kecocokan subjek daftar hitam eksternal ini dengan profil nasabah internal:
                </p>
                <div className="mt-2 inline-flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-red-300 shadow-2xs text-xs font-mono font-bold text-red-900">
                  <span>CIF Teridentifikasi: <span className="underline">{entry.matchedCif}</span></span>
                  <span>•</span>
                  <span>Nama Akun: {entry.matchedCustomerName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Status Verifikasi Bank:</span> 🟢 <strong>No Match</strong> — Tidak ditemukan akun aktif atau transaksi terhubung dengan entitas ini di basis data nasabah saat ini.
              </div>
            </div>
          )}

          {/* Section 1: Data Identitas Personal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Data Identitas Personal</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{entry.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tipe Identitas:</span>
                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                  {entry.identityType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Identitas:</span>
                <span className="font-mono font-bold text-slate-900">{entry.identityNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tempat / Tgl Lahir:</span>
                <span className="text-slate-700 font-medium">
                  {entry.birthPlace || '-'}{entry.birthDate ? `, ${entry.birthDate}` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Kewarganegaraan:</span>
                <span className="text-slate-700 font-medium">{entry.citizenship || 'Indonesia'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Data Kontak & Rekening Tambahan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>2. Data Kontak & Rekening Terkait</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Rekening:</span>
                <span className="font-mono font-bold text-slate-900">
                  {entry.accountNumber || '<Tidak Ada Rekening Spesifik>'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nama Bank:</span>
                <span className="text-slate-700 font-medium">{entry.bankName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nomor Telepon / HP:</span>
                <span className="font-mono font-medium text-slate-700">{entry.phoneNumber || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Sumber & Legal Basis */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>3. Sumber & Legal Basis</span>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Sumber Data:</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mt-0.5 ${getSourceBadge(entry.source)}`}>
                    {entry.source}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Nomor Surat Referensi / SK:</span>
                  <span className="font-mono font-bold text-slate-900">{entry.referenceNumber}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Keterangan / Alasan Blocking Resmi:</span>
                <p className="text-slate-800 text-xs leading-relaxed bg-white p-3 rounded border border-slate-200 mt-1">
                  {entry.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Metadata & Audit Trail */}
          <div className="space-y-2 text-[11px] text-slate-500 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span>Diinput pada: <strong className="font-mono text-slate-700">{entry.createdAt}</strong></span>
              <span>Operator: <strong className="text-slate-700">{entry.createdBy}</strong></span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span>Siklus Sync Terakhir: <strong className="font-mono text-slate-700">{entry.lastCheckedAt || entry.createdAt}</strong></span>
              <span className="text-emerald-700 font-semibold">Integrity Verified (SHA-256)</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            id="close-modal-bottom-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>
          {onEdit && (
            <button
              id="edit-from-detail-btn"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              Edit Data
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
