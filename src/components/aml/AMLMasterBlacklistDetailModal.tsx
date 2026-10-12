import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Calendar, 
  Globe, 
  FileText, 
  MapPin, 
  Briefcase, 
  Copy, 
  Check, 
  Edit3, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Tag, 
  Info,
  ExternalLink
} from 'lucide-react';
import { AmlMasterBlacklistEntry } from '../../types/amlBlacklist';
import { cn } from '../../lib/utils';

interface AMLMasterBlacklistDetailModalProps {
  isOpen: boolean;
  entry: AmlMasterBlacklistEntry | null;
  onClose: () => void;
  onEdit: (entry: AmlMasterBlacklistEntry) => void;
}

export const AMLMasterBlacklistDetailModal: React.FC<AMLMasterBlacklistDetailModalProps> = ({
  isOpen,
  entry,
  onClose,
  onEdit
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs",
              entry.type === 'Non-Individu' ? "bg-amber-600" : "bg-blue-600"
            )}>
              {entry.type === 'Non-Individu' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {entry.nama} {entry.gelar && entry.gelar !== '-' && <span className="font-normal text-slate-500 text-sm">({entry.gelar})</span>}
                </h3>
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-semibold rounded-full",
                  entry.status === 'Active' ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                )}>
                  {entry.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                ID: {entry.id} • Entity Type: {entry.type} • Kategori: {entry.categoryTag || 'Judi Online'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Reference Notice Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Referensi Regulasi &amp; Dasar Hukum Blacklist
                  </h4>
                  <p className="text-sm font-medium text-slate-800 mt-1 leading-relaxed">
                    {entry.referensi}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(entry.referensi, 'ref')}
                className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors shrink-0"
                title="Copy Reference"
              >
                {copiedKey === 'ref' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Core Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Identification Details */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Data Identitas &amp; Dokumen</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                {entry.type === 'Individu' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Nomor Induk Kependudukan (NIK)</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-semibold text-slate-800">{entry.nik || '-'}</span>
                        {entry.nik && entry.nik !== '-' && (
                          <button
                            onClick={() => handleCopy(entry.nik || '', 'nik')}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {copiedKey === 'nik' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Nomor Paspor</span>
                      <span className="font-mono font-medium text-slate-800">{entry.nomorPassport || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Kewarganegaraan</span>
                      <span className="font-medium text-slate-800 flex items-center space-x-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{entry.kewarganegaraan || '-'}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                      <span className="font-medium text-slate-800">
                        {entry.tempatLahir && entry.tempatLahir !== '-' ? entry.tempatLahir : ''}
                        {entry.tempatLahir && entry.tanggalLahir && entry.tanggalLahir !== '-' ? ', ' : ''}
                        {entry.tanggalLahir || '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Pekerjaan</span>
                      <span className="font-medium text-slate-800">{entry.pekerjaan || '-'}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">NPWP</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-semibold text-slate-800">{entry.npwp || '-'}</span>
                    {entry.npwp && entry.npwp !== '-' && (
                      <button
                        onClick={() => handleCopy(entry.npwp || '', 'npwp')}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                      >
                        {copiedKey === 'npwp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kategori Tag</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                    {entry.categoryTag || 'Judi Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address & Meta */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Domisili &amp; Riwayat Pencatatan</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Alamat / Lokasi Operasional:</span>
                  <p className="font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                    {entry.alamat || '-'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created At:</span>
                    <span className="font-mono text-slate-700">{entry.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created By:</span>
                    <span className="font-medium text-slate-700">{entry.createdBy}</span>
                  </div>
                  {entry.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Last Updated:</span>
                      <span className="font-mono text-slate-700">{entry.updatedAt}</span>
                    </div>
                  )}
                  {entry.updatedBy && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Updated By:</span>
                      <span className="font-medium text-slate-700">{entry.updatedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Rich Information & Auditor Notes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Informasi Lain &amp; Catatan Investigasi AML</span>
            </h4>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {entry.informasiLain || 'Tidak ada catatan tambahan.'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            FMS AML Compliance Engine • Internal Security Level: Confidential
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
