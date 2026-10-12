import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { ExternalBlacklistEntry, ExternalIdentityType, ExternalDataSource, ExternalThreatLevel } from '../../types/fms';

interface ExternalBlacklistImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (entries: Array<Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>>) => { addedCount: number; matchedCount: number };
}

interface ParsedRow {
  fullName: string;
  identityType: ExternalIdentityType;
  identityNumber: string;
  birthDate?: string;
  birthPlace?: string;
  citizenship?: string;
  accountNumber?: string;
  bankName?: string;
  phoneNumber?: string;
  source: ExternalDataSource;
  referenceNumber: string;
  threatLevel: ExternalThreatLevel;
  reason: string;
  isValid: boolean;
  errorMessage?: string;
}

export const ExternalBlacklistImportModal: React.FC<ExternalBlacklistImportModalProps> = ({
  isOpen,
  onClose,
  onBulkImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ addedCount: number; matchedCount: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvContent = 
      'Nama_Lengkap,Tipe_Identitas,Nomor_Identitas,Tempat_Lahir,Tanggal_Lahir,Kewarganegaraan,Nomor_Rekening,Nama_Bank,Nomor_Telepon,Sumber_Data,Nomor_Referensi_SK,Tingkat_Ancaman,Alasan_Blocking\n' +
      '"Joko Santoso Sindikat","NIK / KTP","3578011204850001","Surabaya","1985-04-12","Indonesia","01499201928","Bank Sampoerna","081234567890","DTTOT","SK/DTTOT/2026/099","CRITICAL","DTTOT Terduga Terorisme Jaringan Regional"\n' +
      '"Mikhail Rostov","Passport","88P902198","Moscow","1982-11-20","Rusia","-","-","+79001122334","Regulator (OJK/BI)","OJK-S-782/2026","HIGH","Sanction List International Cyber Crime"\n' +
      '"CV Prima Dana Makmur","NPWP","02.456.789.1-015.000","Jakarta","-","Indonesia","5270991823","Bank Central Asia","021-88997711","Konsorsium Perbankan","KONSORSIUM/2026/112","HIGH","Merchant Aggregator Pinjol Ilegal"\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_external_blacklist_fms.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      alert('File CSV kosong atau hanya berisi baris header.');
      return;
    }

    // Parse rows
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV field parser handling quotes
      const values: string[] = [];
      let currentVal = '';
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      if (values.length < 5) continue;

      const [
        rawName,
        rawIdType,
        rawIdNum,
        rawBirthPlace,
        rawBirthDate,
        rawCitizenship,
        rawAccNum,
        rawBankName,
        rawPhone,
        rawSource,
        rawRefNum,
        rawThreat,
        rawReason
      ] = values;

      const fullName = (rawName || '').replace(/^"|"$/g, '').trim();
      let identityType: ExternalIdentityType = 'NIK / KTP';
      if (rawIdType && rawIdType.toLowerCase().includes('pass')) identityType = 'Passport';
      else if (rawIdType && rawIdType.toLowerCase().includes('npwp')) identityType = 'NPWP';

      const identityNumber = (rawIdNum || '').replace(/^"|"$/g, '').trim();
      const birthPlace = (rawBirthPlace || '').replace(/^"|"$/g, '').trim();
      const birthDate = (rawBirthDate || '').replace(/^"|"$/g, '').trim();
      const citizenship = (rawCitizenship || 'Indonesia').replace(/^"|"$/g, '').trim();
      const accountNumber = (rawAccNum || '').replace(/^"|"$/g, '').trim();
      const bankName = (rawBankName || '').replace(/^"|"$/g, '').trim();
      const phoneNumber = (rawPhone || '').replace(/^"|"$/g, '').trim();

      let source: ExternalDataSource = 'DTTOT';
      const sLower = (rawSource || '').toLowerCase();
      if (sLower.includes('ojk') || sLower.includes('regulator') || sLower.includes('bi')) source = 'Regulator (OJK/BI)';
      else if (sLower.includes('konsorsium')) source = 'Konsorsium Perbankan';
      else if (sLower.includes('polri') || sLower.includes('aparat') || sLower.includes('hukum')) source = 'Aparat Penegak Hukum';
      else if (sLower.includes('internal')) source = 'Internal Inquiry';

      const referenceNumber = (rawRefNum || `SK/IMPORT/${Date.now()}`).replace(/^"|"$/g, '').trim();

      let threatLevel: ExternalThreatLevel = 'HIGH';
      const tUpper = (rawThreat || '').toUpperCase();
      if (tUpper.includes('CRIT')) threatLevel = 'CRITICAL';
      else if (tUpper.includes('MED')) threatLevel = 'MEDIUM';
      else threatLevel = 'HIGH';

      const reason = (rawReason || 'Import data massal external blacklist registry').replace(/^"|"$/g, '').trim();

      const isValid = Boolean(fullName && identityNumber && referenceNumber);
      const errorMessage = !fullName ? 'Nama Lengkap kosong' : !identityNumber ? 'No. Identitas kosong' : undefined;

      rows.push({
        fullName,
        identityType,
        identityNumber,
        birthPlace: birthPlace !== '-' ? birthPlace : undefined,
        birthDate: birthDate !== '-' ? birthDate : undefined,
        citizenship,
        accountNumber: accountNumber !== '-' ? accountNumber : undefined,
        bankName: bankName !== '-' ? bankName : undefined,
        phoneNumber: phoneNumber !== '-' ? phoneNumber : undefined,
        source,
        referenceNumber,
        threatLevel,
        reason,
        isValid,
        errorMessage
      });
    }

    setParsedRows(rows);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVText(text);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVText(text);
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const entriesToImport = validRows.map(r => ({
        fullName: r.fullName,
        identityType: r.identityType,
        identityNumber: r.identityNumber,
        birthDate: r.birthDate,
        birthPlace: r.birthPlace,
        citizenship: r.citizenship,
        accountNumber: r.accountNumber,
        bankName: r.bankName,
        phoneNumber: r.phoneNumber,
        source: r.source,
        referenceNumber: r.referenceNumber,
        threatLevel: r.threatLevel,
        reason: r.reason,
        createdBy: 'Yoseph Sanjaya (Bulk Import Operator)'
      }));

      const result = onBulkImport(entriesToImport);
      setImportResult(result);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Import Massal External Blacklist Registry
              </h2>
              <p className="text-xs text-slate-400">
                Unggah berkas CSV atau Excel resmi dari DTTOT, OJK, Satgas PASTI, atau konsorsium perbankan.
              </p>
            </div>
          </div>
          <button 
            id="close-import-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Success State */}
          {importResult ? (
            <div className="py-8 px-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Import Berhasil Diselesaikan!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Sebanyak <strong>{importResult.addedCount} entitas data eksternal</strong> telah berhasil dimasukkan ke dalam database registry.
                </p>
              </div>

              {importResult.matchedCount > 0 ? (
                <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 font-medium inline-block max-w-lg">
                  🚨 <strong>Perhatian:</strong> Ditemukan <strong>{importResult.matchedCount} entitas</strong> yang langsung cocok (Matched) dengan CIF atau nomor rekening nasabah bank!
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium inline-block">
                  🟢 Seluruh data berstatus No Match (Aman dari profil nasabah eksisting).
                </div>
              )}

              <div className="pt-4">
                <button
                  id="finish-import-btn"
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-blue-700 transition"
                >
                  Kembali ke Tabel Registry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Template Download & Instruction Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="text-xs text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Format File Standar Neo FMS</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pastikan kolom Nama Lengkap, Nomor Identitas, Sumber, dan No. Referensi SK telah terisi.
                  </p>
                </div>
                <button
                  id="download-template-csv-btn"
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Format CSV</span>
                </button>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  {file ? file.name : 'Klik atau Tarik File CSV ke Sini'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mendukung file teks terformat .CSV dengan delimiter koma (,)
                </p>
              </div>

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data ({parsedRows.length} baris terdeteksi):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Valid: <strong className="text-emerald-600 font-mono">{parsedRows.filter(r => r.isValid).length}</strong> | 
                      Error: <strong className="text-red-600 font-mono">{parsedRows.filter(r => !r.isValid).length}</strong>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2">Status</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">Identitas</th>
                          <th className="p-2">Sumber</th>
                          <th className="p-2">No. SK</th>
                          <th className="p-2">Threat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                            <td className="p-2">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Siap</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-600 font-bold" title={row.errorMessage}>
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                  <span>Error</span>
                                </span>
                              )}
                            </td>
                            <td className="p-2 font-bold text-slate-900">{row.fullName}</td>
                            <td className="p-2 font-mono text-slate-700">{row.identityNumber} ({row.identityType})</td>
                            <td className="p-2 text-slate-600">{row.source}</td>
                            <td className="p-2 font-mono text-slate-600">{row.referenceNumber}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                row.threatLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {row.threatLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  id="cancel-import-action-btn"
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  id="commit-import-action-btn"
                  type="button"
                  disabled={parsedRows.filter(r => r.isValid).length === 0 || isProcessing}
                  onClick={handleCommitImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? 'Memproses Validasi & Matching...' 
                      : `Import ${parsedRows.filter(r => r.isValid).length} Baris Data`}
                  </span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
