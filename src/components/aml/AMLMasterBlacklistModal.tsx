import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  ShieldAlert, 
  User, 
  Building2, 
  Calendar, 
  FileText, 
  Globe, 
  AlertTriangle,
  Info,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { AmlMasterBlacklistEntry, AmlEntityType, AmlBlacklistStatus } from '../../types/amlBlacklist';
import { cn } from '../../lib/utils';

interface AMLMasterBlacklistModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  entryData?: AmlMasterBlacklistEntry | null;
  onClose: () => void;
  onSave: (data: Omit<AmlMasterBlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export const AMLMasterBlacklistModal: React.FC<AMLMasterBlacklistModalProps> = ({
  isOpen,
  mode,
  entryData,
  onClose,
  onSave
}) => {
  // Form State
  const [type, setType] = useState<AmlEntityType>('Non-Individu');
  const [referensi, setReferensi] = useState<string>('');
  const [nama, setNama] = useState<string>('');
  const [gelar, setGelar] = useState<string>('');
  
  // Individual fields
  const [pekerjaan, setPekerjaan] = useState<string>('');
  const [tanggalLahir, setTanggalLahir] = useState<string>('');
  const [tempatLahir, setTempatLahir] = useState<string>('');
  const [kewarganegaraan, setKewarganegaraan] = useState<string>('Indonesia');
  const [nik, setNik] = useState<string>('');
  const [nomorPassport, setNomorPassport] = useState<string>('');
  
  // Common & Corporate fields
  const [npwp, setNpwp] = useState<string>('');
  const [alamat, setAlamat] = useState<string>('');
  const [informasiLain, setInformasiLain] = useState<string>('');
  const [status, setStatus] = useState<AmlBlacklistStatus>('Active');
  const [categoryTag, setCategoryTag] = useState<'Judi Online' | 'Terrorism / DTTOT' | 'Fraud Syndicate' | 'Money Laundering' | 'Illegal Investment' | 'Sanctions'>('Judi Online');

  // Errors & validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && entryData) {
        setType(entryData.type);
        setReferensi(entryData.referensi || '');
        setNama(entryData.nama || '');
        setGelar(entryData.gelar === '-' ? '' : (entryData.gelar || ''));
        setPekerjaan(entryData.pekerjaan === '-' ? '' : (entryData.pekerjaan || ''));
        setTanggalLahir(entryData.tanggalLahir === '-' ? '' : (entryData.tanggalLahir || ''));
        setTempatLahir(entryData.tempatLahir === '-' ? '' : (entryData.tempatLahir || ''));
        setKewarganegaraan(entryData.kewarganegaraan === '-' ? 'Indonesia' : (entryData.kewarganegaraan || 'Indonesia'));
        setNik(entryData.nik === '-' ? '' : (entryData.nik || ''));
        setNomorPassport(entryData.nomorPassport === '-' ? '' : (entryData.nomorPassport || ''));
        setNpwp(entryData.npwp === '-' ? '' : (entryData.npwp || ''));
        setAlamat(entryData.alamat || '');
        setInformasiLain(entryData.informasiLain || '');
        setStatus(entryData.status);
        setCategoryTag(entryData.categoryTag || 'Judi Online');
      } else {
        // Reset to Default Non-Individu
        setType('Non-Individu');
        setReferensi('');
        setNama('');
        setGelar('');
        setPekerjaan('');
        setTanggalLahir('');
        setTempatLahir('');
        setKewarganegaraan('Indonesia');
        setNik('');
        setNomorPassport('');
        setNpwp('');
        setAlamat('');
        setInformasiLain('');
        setStatus('Active');
        setCategoryTag('Judi Online');
      }
      setErrors({});
    }
  }, [isOpen, mode, entryData]);

  if (!isOpen) return null;

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only accept numeric input up to 16 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setNik(val);
    if (errors.nik) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.nik;
        return next;
      });
    }
  };

  const handleValidate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nama.trim()) {
      newErrors.nama = 'Nama / Nama Entitas wajib diisi.';
    }

    if (!referensi.trim()) {
      newErrors.referensi = 'Referensi / Sumber data blacklist wajib diisi.';
    }

    if (type === 'Individu') {
      if (nik && nik.length !== 16) {
        newErrors.nik = 'NIK harus tepat 16 digit angka.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidate()) return;

    onSave({
      type,
      referensi: referensi.trim(),
      nama: nama.trim(),
      gelar: gelar.trim() || '-',
      pekerjaan: type === 'Individu' ? (pekerjaan.trim() || '-') : '-',
      tanggalLahir: type === 'Individu' ? (tanggalLahir || '-') : '-',
      tempatLahir: type === 'Individu' ? (tempatLahir.trim() || '-') : '-',
      kewarganegaraan: type === 'Individu' ? (kewarganegaraan.trim() || '-') : '-',
      nomorPassport: type === 'Individu' ? (nomorPassport.trim() || '-') : '-',
      npwp: npwp.trim() || '-',
      nik: type === 'Individu' ? (nik.trim() || '-') : '-',
      alamat: alamat.trim() || '-',
      informasiLain: informasiLain.trim() || '-',
      status,
      categoryTag
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
              type === 'Non-Individu' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            )}>
              {type === 'Non-Individu' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {mode === 'add' ? 'Tambah Record AML Master Blacklist' : `Edit Record Blacklist [${entryData?.id}]`}
                </h3>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-semibold rounded-full",
                  type === 'Individu' ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                )}>
                  {type}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pengelolaan entitas berisiko tinggi tindak pidana pencucian uang, situs judi online, dan terorisme.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Header Controls: Type & Referensi */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tipe Entitas (Entity Type) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as AmlEntityType)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Non-Individu">Non-Individu (Badan Usaha / Judol / Sindikat)</option>
                      <option value="Individu">Individu (Perorangan / Karyawan / WNA)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {type === 'Non-Individu' 
                      ? 'Untuk situs judi daring, platform ilegal, korporasi shell'
                      : 'Untuk perorangan, IT dev, pengepul rekening, kurir ATM'}
                  </p>
                </div>

                {/* Category Tag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kategori Indikasi</span>
                  </label>
                  <select
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Judi Online">Judi Online (Judol / Slot)</option>
                    <option value="Money Laundering">Money Laundering (TPPU / Penampung)</option>
                    <option value="Fraud Syndicate">Fraud Syndicate (Sindikat Rekening)</option>
                    <option value="Terrorism / DTTOT">Terrorism / DTTOT</option>
                    <option value="Illegal Investment">Illegal Investment (Investasi Bodong)</option>
                    <option value="Sanctions">Sanctions &amp; Embargo</option>
                  </select>
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status Blacklist
                  </label>
                  <div className="flex items-center space-x-3 h-10">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={status === 'Active'}
                        onChange={(e) => setStatus(e.target.checked ? 'Active' : 'Inactive')}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className={cn(
                        "ms-3 text-xs font-semibold px-2 py-0.5 rounded",
                        status === 'Active' ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      )}>
                        {status === 'Active' ? 'Active (Aktif Terblokir)' : 'Inactive (Non-Aktif)'}
                      </span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Referensi Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>
                    Referensi / Sumber Data Blacklist <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Contoh: Bareskrim Siber, Kominfo Blocklist, Satgas PASTI OJK, PPATK
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={referensi}
                  onChange={(e) => {
                    setReferensi(e.target.value);
                    if (errors.referensi) setErrors(prev => ({ ...prev, referensi: '' }));
                  }}
                  placeholder="Masukkan nomor surat keputusan, rujukan laporan polisi, nota dinas regulator, atau tautan blocklist..."
                  className={cn(
                    "w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none",
                    errors.referensi ? "border-rose-300 bg-rose-50/20" : "border-slate-300"
                  )}
                />
                {errors.referensi && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{errors.referensi}</span>
                  </p>
                )}
              </div>

            </div>

            {/* Main Info Section: Nama & Gelar */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Informasi Utama (Main Identification)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {type === 'Individu' ? 'Nama Lengkap' : 'Nama Entitas / Situs / Brand Judi'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => {
                      setNama(e.target.value);
                      if (errors.nama) setErrors(prev => ({ ...prev, nama: '' }));
                    }}
                    placeholder={type === 'Individu' ? "Contoh: Budi Santoso / Rian Hartono" : "Contoh: gadunslot / horas88 / slot777"}
                    className={cn(
                      "w-full h-10 px-3 py-2 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      errors.nama ? "border-rose-300 bg-rose-50/20" : "border-slate-300"
                    )}
                  />
                  {errors.nama && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{errors.nama}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gelar (Honorific / Title)
                  </label>
                  <input
                    type="text"
                    value={gelar}
                    onChange={(e) => setGelar(e.target.value)}
                    placeholder="Contoh: S.Kom. / S.E. / Dr."
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Individual Section (Only shown if Type === 'Individu') */}
            {type === 'Individu' && (
              <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 space-y-4 transition-all">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 pb-1 border-b border-blue-200 flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Data Khusus Individu / Perorangan</span>
                </h4>

                {/* Row 1: Pekerjaan, Tanggal Lahir, Tempat Lahir */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pekerjaan / Jabatan
                    </label>
                    <input
                      type="text"
                      value={pekerjaan}
                      onChange={(e) => setPekerjaan(e.target.value)}
                      placeholder="Contoh: IT Support / Kurir ATM / Runner"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tanggal Lahir</span>
                    </label>
                    <input
                      type="date"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={tempatLahir}
                      onChange={(e) => setTempatLahir(e.target.value)}
                      placeholder="Contoh: Bandung / Medan / Surabaya"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Row 2: Kewarganegaraan, NIK (16 digit), Nomor Passport */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Kewarganegaraan</span>
                    </label>
                    <input
                      type="text"
                      value={kewarganegaraan}
                      onChange={(e) => setKewarganegaraan(e.target.value)}
                      placeholder="Contoh: Indonesia / China / Kamboja"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        NIK (16 Digit)
                      </label>
                      <span className={cn(
                        "text-[10px] font-mono",
                        nik.length === 16 ? "text-emerald-600 font-bold" : "text-slate-400"
                      )}>
                        {nik.length}/16 digit
                      </span>
                    </div>
                    <input
                      type="text"
                      value={nik}
                      onChange={handleNikChange}
                      maxLength={16}
                      placeholder="3273011405890002"
                      className={cn(
                        "w-full h-10 px-3 py-2 bg-white border rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500",
                        errors.nik ? "border-rose-300 bg-rose-50/20" : "border-slate-300"
                      )}
                    />
                    {errors.nik && (
                      <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{errors.nik}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor Paspor (Passport No)
                    </label>
                    <input
                      type="text"
                      value={nomorPassport}
                      onChange={(e) => setNomorPassport(e.target.value)}
                      placeholder="Contoh: A 8921820"
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Common & Corporate Section: NPWP, Alamat, Informasi Lain */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Data Pajak, Domisili &amp; Catatan Audit (Common &amp; Corporate)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor Pokok Wajib Pajak (NPWP)
                  </label>
                  <input
                    type="text"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="01.234.567.8-012.000"
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Alamat / Domisili / Server Location
                  </label>
                  <textarea
                    rows={2}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Alamat kantor, domisili KTP, atau lokasi cluster hosting..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Informasi Lain (Rich Textarea) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Informasi Lain &amp; Catatan Investigasi (Auditor &amp; Fraud Notes)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Catat detail modus, nomor rekening penampung, mirror link, atau kronologi
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={informasiLain}
                  onChange={(e) => setInformasiLain(e.target.value)}
                  placeholder="Catatan hasil investigasi:
- Modus operandi / tindak pidana asal (Judi Online, Layering, Structuring)
- Daftar nomor rekening nominee / Virtual Account penampung
- URL domain mirror atau alamat IP server
- Rekomendasi tindakan (Auto Reject transaksi, Exit Customer)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
              </div>

            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Perubahan data akan tercatat otomatis di Audit Trail Changes.</span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center space-x-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Record</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
