import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, ShieldAlert, FileText, CheckCircle2, AlertTriangle, Building2, Phone, Calendar, Globe } from 'lucide-react';
import { 
  ExternalBlacklistEntry, 
  ExternalIdentityType, 
  ExternalDataSource, 
  ExternalThreatLevel 
} from '../../types/fms';

interface ExternalBlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entryData: Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>) => void;
  initialData?: ExternalBlacklistEntry | null;
}

export const ExternalBlacklistModal: React.FC<ExternalBlacklistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // Section 1: Data Identitas Personal
  const [fullName, setFullName] = useState('');
  const [identityType, setIdentityType] = useState<ExternalIdentityType>('NIK / KTP');
  const [identityNumber, setIdentityNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [citizenship, setCitizenship] = useState('Indonesia');

  // Section 2: Data Kontak & Rekening Tambahan
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('Bank Sampoerna');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Section 3: Sumber & Legal Basis
  const [source, setSource] = useState<ExternalDataSource>('DTTOT');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [threatLevel, setThreatLevel] = useState<ExternalThreatLevel>('CRITICAL');
  const [reason, setReason] = useState('');
  const [createdBy, setCreatedBy] = useState('Yoseph Sanjaya (AML Compliance)');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setIdentityType(initialData.identityType || 'NIK / KTP');
      setIdentityNumber(initialData.identityNumber || '');
      setBirthDate(initialData.birthDate || '');
      setBirthPlace(initialData.birthPlace || '');
      setCitizenship(initialData.citizenship || 'Indonesia');
      setAccountNumber(initialData.accountNumber || '');
      setBankName(initialData.bankName || 'Bank Sampoerna');
      setPhoneNumber(initialData.phoneNumber || '');
      setSource(initialData.source || 'DTTOT');
      setReferenceNumber(initialData.referenceNumber || '');
      setThreatLevel(initialData.threatLevel || 'CRITICAL');
      setReason(initialData.reason || '');
      setCreatedBy(initialData.createdBy || 'Yoseph Sanjaya (AML Compliance)');
    } else {
      setFullName('');
      setIdentityType('NIK / KTP');
      setIdentityNumber('');
      setBirthDate('');
      setBirthPlace('');
      setCitizenship('Indonesia');
      setAccountNumber('');
      setBankName('Bank Sampoerna');
      setPhoneNumber('');
      setSource('DTTOT');
      setReferenceNumber('');
      setThreatLevel('CRITICAL');
      setReason('');
      setCreatedBy('Yoseph Sanjaya (AML Compliance)');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Nama Lengkap wajib diisi';
    if (!identityNumber.trim()) newErrors.identityNumber = 'Nomor Identitas wajib diisi';
    if (!reason.trim()) newErrors.reason = 'Keterangan / Alasan Blocking wajib diisi';
    if (!referenceNumber.trim()) newErrors.referenceNumber = 'Nomor Surat Referensi / SK wajib diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      fullName: fullName.trim(),
      identityType,
      identityNumber: identityNumber.trim(),
      birthDate: birthDate.trim() || undefined,
      birthPlace: birthPlace.trim() || undefined,
      citizenship: citizenship.trim() || 'Indonesia',
      accountNumber: accountNumber.trim() || undefined,
      bankName: bankName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      source,
      referenceNumber: referenceNumber.trim(),
      threatLevel,
      reason: reason.trim(),
      createdBy
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {initialData ? 'Edit Data External Blacklist' : 'Tambah Data External Blacklist Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Pencatatan subjek terlarang berdasarkan direktif DTTOT, Regulator, Konsorsium, atau Aparat Hukum.
              </p>
            </div>
          </div>
          <button 
            id="close-external-blacklist-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Data Identitas Personal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                Section 1: Data Identitas Personal
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="eb-fullname-input"
                  type="text"
                  placeholder="Contoh: Abu Bakar Hasanudin / Rian Hidayat"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
                />
                {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Tipe Identitas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Identitas <span className="text-red-500">*</span>
                </label>
                <select
                  id="eb-idtype-select"
                  value={identityType}
                  onChange={(e) => setIdentityType(e.target.value as ExternalIdentityType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NIK / KTP">NIK / KTP</option>
                  <option value="Passport">Passport</option>
                  <option value="NPWP">NPWP</option>
                </select>
              </div>

              {/* Nomor Identitas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Identitas <span className="text-red-500">*</span>
                </label>
                <input
                  id="eb-idnumber-input"
                  type="text"
                  placeholder="Contoh: 3171051208820004 / 75N9821034"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.identityNumber ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono`}
                />
                {errors.identityNumber && <p className="text-[11px] text-red-600 mt-1">{errors.identityNumber}</p>}
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir (Opsional)
                </label>
                <input
                  id="eb-birthplace-input"
                  type="text"
                  placeholder="Contoh: Solo, Jakarta, St. Petersburg"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir (Opsional)
                </label>
                <input
                  id="eb-birthdate-input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Kewarganegaraan */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kewarganegaraan
                </label>
                <input
                  id="eb-citizenship-input"
                  type="text"
                  placeholder="Contoh: Indonesia, Rusia, Malaysia"
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Data Kontak & Rekening Tambahan */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                Section 2: Data Kontak & Rekening Terkait (Opsional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nomor Rekening */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Rekening (Jika Ada)
                </label>
                <input
                  id="eb-account-input"
                  type="text"
                  placeholder="Contoh: 014889218201"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Nama Bank */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bank
                </label>
                <input
                  id="eb-bankname-input"
                  type="text"
                  placeholder="Contoh: Bank Sampoerna / BCA"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Nomor Telepon / HP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon / HP
                </label>
                <input
                  id="eb-phone-input"
                  type="text"
                  placeholder="Contoh: 081299887711"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Sumber & Legal Basis */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
                Section 3: Sumber & Legal Basis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sumber Data */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sumber Data <span className="text-red-500">*</span>
                </label>
                <select
                  id="eb-source-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value as ExternalDataSource)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="DTTOT">DTTOT (Terorisme)</option>
                  <option value="Regulator (OJK/BI)">Regulator (OJK/BI)</option>
                  <option value="Konsorsium Perbankan">Konsorsium Perbankan</option>
                  <option value="Aparat Penegak Hukum">Aparat Penegak Hukum (POLRI/KPK/Kejaksaan)</option>
                  <option value="Internal Inquiry">Internal Inquiry</option>
                </select>
              </div>

              {/* Nomor Surat Referensi / SK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Surat Referensi / SK <span className="text-red-500">*</span>
                </label>
                <input
                  id="eb-refnum-input"
                  type="text"
                  placeholder="Contoh: SK/DTTOT/POLRI/2026/089"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.referenceNumber ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono`}
                />
                {errors.referenceNumber && <p className="text-[11px] text-red-600 mt-1">{errors.referenceNumber}</p>}
              </div>

              {/* Tingkat Ancaman (Threat Level) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkat Ancaman <span className="text-red-500">*</span>
                </label>
                <select
                  id="eb-threat-select"
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value as ExternalThreatLevel)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border font-bold ${
                    threatLevel === 'CRITICAL'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : threatLevel === 'HIGH'
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-yellow-300 bg-yellow-50 text-yellow-800'
                  } focus:outline-hidden focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="CRITICAL">CRITICAL (Pemblokiran Seketika)</option>
                  <option value="HIGH">HIGH (Escalated Review & Block)</option>
                  <option value="MEDIUM">MEDIUM (Enhanced Due Diligence)</option>
                </select>
              </div>

              {/* Keterangan / Alasan Blocking */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan Blocking <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="eb-reason-textarea"
                  rows={3}
                  placeholder="Jelaskan dasar hukum, rincian kasus pidana/terorisme/sanksi, dan instruksi penanganan mitigasi..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    errors.reason ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  } focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed`}
                />
                {errors.reason && <p className="text-[11px] text-red-600 mt-1">{errors.reason}</p>}
              </div>
            </div>
          </div>

          {/* Auto-matching info box */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Automated Database Cross-Match:</span> Sistem Neo FMS akan secara otomatis memindai seluruh CIF aktif, rekening tabungan/giro, nomor telepon, dan nomor identitas nasabah di database bank untuk mendeteksi kecocokan instan begitu data disimpan.
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              id="eb-modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              id="eb-modal-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Simpan Perubahan' : 'Simpan Data Eksternal'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
