import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Trash2,
  HelpCircle,
  ShieldAlert,
  Scale,
  CreditCard,
  UserCheck,
  Smartphone,
  Phone,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ListEntry, ListType, EntitySubTab } from '../../types/fms';
import { useAuth } from '../../context/AuthContext';

interface BulkUploadListModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDomain: 'FRAUD' | 'AML';
  activeListType: ListType;
  activeEntitySubTab: string;
  onBulkImport: (
    entries: Array<Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>>,
    options?: { batchId?: string; fileName?: string; targetDomain?: 'FRAUD' | 'AML'; targetListType?: ListType; makerName?: string }
  ) => { addedCount: number; batchId?: string; ticketNo?: string };
  onSuccessToast?: (message: string) => void;
}

export interface BatchParsedRow {
  rowNumber: number;
  cif: string;
  accountNumber: string;
  customerName: string;
  entityType: EntitySubTab;
  value: string;
  category: string;
  reason: string;
  riskWeight: number;
  source: string;
  tags: string[];
  expiryDate?: string;
  whitelistType?: 'PERMANENT' | 'DATE_RANGE' | 'RECURRING_MONTHLY';
  startDate?: string;
  endDate?: string;
  recurringDayOfMonth?: number;
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
}

const SESSION_DRAFT_KEY = 'fms_batch_upload_drafts';

export const BulkUploadListModal: React.FC<BulkUploadListModalProps> = ({
  isOpen,
  onClose,
  activeDomain,
  activeListType,
  activeEntitySubTab,
  onBulkImport,
  onSuccessToast
}) => {
  const { user } = useAuth();

  const isSysAdmin = Boolean(
    !user ||
    user.username === 'sysadmin' ||
    user.riskDomain === 'FULL ACCESS' ||
    user.group?.toLowerCase().includes('it dca') ||
    user.group?.toLowerCase().includes('admin') ||
    user.role?.toLowerCase().includes('admin')
  );

  const isFraudRole = Boolean(
    !isSysAdmin && (
      user?.riskDomain === 'FRAUD ONLY' ||
      user?.group?.includes('AFC') ||
      user?.username?.includes('afc') ||
      user?.role?.toLowerCase().includes('fraud')
    )
  );

  const isAmlRole = Boolean(
    !isSysAdmin && (
      user?.riskDomain === 'AML ONLY' ||
      user?.group?.includes('Analyst') ||
      user?.username?.includes('analyst') ||
      user?.role?.toLowerCase().includes('aml')
    )
  );

  const [targetDomain, setTargetDomain] = useState<'FRAUD' | 'AML'>(
    isFraudRole ? 'FRAUD' : isAmlRole ? 'AML' : activeDomain
  );
  const [targetListType, setTargetListType] = useState<ListType>(activeListType);
  const [file, setFile] = useState<File | null>(null);
  const [fileNameDisplay, setFileNameDisplay] = useState<string>('');
  const [fileSizeDisplay, setFileSizeDisplay] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<BatchParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'INVALID'>('ALL');
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialDom: 'FRAUD' | 'AML' = isFraudRole ? 'FRAUD' : isAmlRole ? 'AML' : activeDomain;
      setTargetDomain(initialDom);
      setTargetListType(activeListType);
      
      // Check if there is saved draft in sessionStorage
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const draftJson = sessionStorage.getItem(SESSION_DRAFT_KEY);
          if (draftJson) {
            const draft = JSON.parse(draftJson);
            if (draft && Array.isArray(draft.rows) && draft.rows.length > 0) {
              setParsedRows(draft.rows);
              setFileNameDisplay(draft.fileName || 'draft_batch_upload.csv');
              setFileSizeDisplay(draft.fileSize ? formatFileSize(draft.fileSize) : '12.4 KB');
              setHasDraftRestored(true);
            }
          }
        }
      } catch (err) {
        console.warn('Error reading batch upload draft from sessionStorage:', err);
      }
    }
  }, [isOpen, activeDomain, activeListType]);

  // Persist draft to sessionStorage whenever parsedRows changes
  const saveDraftToSession = (rows: BatchParsedRow[], fName: string, fSize: number) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const payload = {
          id: `draft-${Date.now()}`,
          fileName: fName,
          fileSize: fSize,
          uploadedAt: new Date().toISOString(),
          targetDomain,
          targetListType,
          totalRows: rows.length,
          validCount: rows.filter(r => r.isValid).length,
          invalidCount: rows.filter(r => !r.isValid).length,
          rows
        };
        sessionStorage.setItem(SESSION_DRAFT_KEY, JSON.stringify(payload));
      }
    } catch (err) {
      console.warn('Error saving batch draft to sessionStorage:', err);
    }
  };

  const clearDraftSession = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(SESSION_DRAFT_KEY);
      }
    } catch {}
    setHasDraftRestored(false);
  };

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper to infer entity type
  const detectEntityType = (val: string, colType?: string): EntitySubTab => {
    if (colType) {
      const clean = colType.trim().toLowerCase();
      if (clean.includes('cif')) return 'CIF';
      if (clean.includes('acc') || clean.includes('rekening') || clean.includes('source')) return 'Source Account Number';
      if (clean.includes('dev') || clean.includes('imei') || clean.includes('uuid')) return 'Device ID';
      if (clean.includes('phone') || clean.includes('telp') || clean.includes('hp') || clean.includes('wa')) return 'Phone Number';
    }
    const cleanVal = (val || '').trim();
    if (cleanVal.startsWith('+62') || cleanVal.startsWith('08') || cleanVal.startsWith('628')) {
      return 'Phone Number';
    }
    if (cleanVal.includes('-') && (cleanVal.length > 20 || /[a-f0-9]{8}-[a-f0-9]{4}/i.test(cleanVal))) {
      return 'Device ID';
    }
    if (/^\d{6,8}$/.test(cleanVal) || cleanVal.toUpperCase().startsWith('CIF')) {
      return 'CIF';
    }
    return 'Source Account Number';
  };

  // Download Standard CSV Template
  const handleDownloadTemplate = () => {
    const isWhitelist = targetListType === 'Whitelist';
    const isFraud = targetDomain === 'FRAUD';

    let csvContent = '';

    if (isWhitelist) {
      csvContent = 
        'CIF,Nomor_Rekening,Nama_Nasabah,Tipe_Entitas,Nilai_Entitas,Kategori_Whitelist,Alasan_Notes,Bobot_Risiko,Sumber_Data,Tipe_Jadwal,Tanggal_Mulai,Tanggal_Berakhir,Hari_Payroll_Bulanan\n' +
        '"CIF-8829011","014882001928","PT Indofood CBP Makmur","Source Account Number","014882001928","Whitelisted Partner","Rekening payroll bulanan ribuan karyawan tetap","0","Internal Audit","RECURRING_MONTHLY","","","25"\n' +
        '"CIF-7781029","5270991823","dr. Budi Rahardjo Sp.A","CIF","CIF-7781029","VIP Executive","Nasabah Prioritas Private Banking transaksi frekuensi tinggi","0","Branch Manager Cabang Sudirman","PERMANENT","","",""\n' +
        '"CIF-9902188","1029910291","PT Asuransi Jiwa Sejahtera","Source Account Number","1029910291","Temporary Exemption","Klaim pencairan massal nasabah asuransi kuartal III","0","Compliance Officer","DATE_RANGE","2026-09-01","2026-09-30",""\n' +
        '"CIF-4412091","081299887766","Ahmad Fauzi SE (Direktur)","Device ID","DEV-IPHONE15-8821990","Executive Device","Perangkat resmi direksi untuk otorisasi transfer limit tinggi","0","IT Security","PERMANENT","","",""\n';
    } else if (isFraud) {
      csvContent = 
        'CIF,Nomor_Rekening,Nama_Nasabah,Tipe_Entitas,Nilai_Entitas,Kategori_Risiko,Alasan_Notes,Bobot_Risiko,Sumber_Data,Tanggal_Kadaluarsa\n' +
        '"CIF-8829103","01499201928","Hendrawan Pratama","Source Account Number","01499201928","Scam, Rekening Penampung, Phishing","Rekening penampungan hasil penipuan APK undangan nikah kurir","95","Laporan Satgas PASTI / OJK","2027-09-01"\n' +
        '"CIF-9921045","5029910291","Agus Salim (Kevin)","CIF","CIF-9921045","Identity Theft, Fake KTP","Terindikasi pemalsuan KTP untuk pembukaan rekening online sindikat","90","Bareskrim Cyber Crime","2029-08-12"\n' +
        '"CIF-3341092","081234567890","Sindikat SMS Call Center","Phone Number","081234567890","Social Engineering, Vishing","Nomor dipakai broadcast SMS promo bodong mengatasnamakan Bank","85","Customer Care Alert","2027-03-01"\n' +
        '"CIF-6651201","7781029384","Device Farm Botnet #14","Device ID","DEV-SAMSUNG-A54-88319","Bot Attack, Credential Stuffing","Perangkat melakukan 450 request login gagal dalam 5 menit","95","FMS Security Bot Rule","2027-09-01"\n' +
        '"CIF-5510293","8829910283","Rian Hidayat Santoso","Source Account Number","8829910283","Money Mule, Rekening Bodong","Didaftarkan atas nama buruh pabrik tanpa sepengetahuan nasabah","90","Polres Jakarta Selatan","2027-12-31"\n';
    } else {
      // AML Template
      csvContent = 
        'CIF,Nomor_Rekening,Nama_Nasabah,Tipe_Entitas,Nilai_Entitas,Kategori_Risiko,Alasan_Notes,Bobot_Risiko,Sumber_Data,Tanggal_Kadaluarsa\n' +
        '"CIF-7781029","01477209182","CV Maju Mandiri Sejahtera","Source Account Number","01477209182","TPPU, Layering, Shell Company","Transaksi perputaran dana cepat tanpa underlying bisnis jelas","95","PPATK STR Datafeed / DTTOT","2028-09-01"\n' +
        '"CIF-8829011","5029910291","Rian Permana Santoso","CIF","CIF-8829011","Structuring, Smurfing","Pecahan transfer tunai di bawah threshold Rp100jt berulang kali","90","AML Compliance Officer","2027-09-01"\n' +
        '"CIF-9902188","8829910283","Bandar Judol Pay Direct","Source Account Number","8829910283","Judol, Deposit Merchant Ilegal","Rekening terhubung jaringan deposit situs judi online luar negeri","95","Kemenkomdigi / OJK","2027-09-01"\n' +
        '"CIF-4412091","085799881122","Admin Kasir Judol Slot","Phone Number","085799881122","AML Red Flag, Mule Operator","Kontak nomor WhatsApp konfirmasi deposit rekening nominee","85","PPATK STR Datafeed","2027-09-01"\n';
    }

    const filename = `template_batch_upload_${targetListType.toLowerCase()}_${targetDomain.toLowerCase()}_fms.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load Built-in Demo Sample Data (Instant testing for reviewers)
  const handleLoadDemoSample = () => {
    const isFraud = targetDomain === 'FRAUD';
    const sampleRows: BatchParsedRow[] = [
      {
        rowNumber: 1,
        cif: 'CIF8829103',
        accountNumber: '01499201928',
        customerName: 'Hendrawan Pratama (Alias Group)',
        entityType: 'Source Account Number',
        value: '01499201928',
        category: 'Scam, Rekening Penampung, Phishing',
        reason: 'Rekening penampungan dana transfer korban penipuan APK kurir',
        riskWeight: 95,
        source: 'Laporan Satgas PASTI / OJK',
        tags: ['Scam', 'Mule Account', 'Phishing'],
        expiryDate: '2027-09-01',
        isValid: true,
        missingFields: []
      },
      {
        rowNumber: 2,
        cif: 'CIF9921045',
        accountNumber: '5029910291',
        customerName: 'Agus Salim (Kevin)',
        entityType: 'CIF',
        value: 'CIF9921045',
        category: 'Identity Theft, Fake KTP',
        reason: 'Pemalsuan dokumen identitas pembukaan tabungan digital',
        riskWeight: 90,
        source: 'Bareskrim Cyber Crime',
        tags: ['Identity Theft', 'High Risk'],
        expiryDate: '2029-08-12',
        isValid: true,
        missingFields: []
      },
      {
        rowNumber: 3,
        cif: 'CIF7748291',
        accountNumber: '8829910283',
        customerName: 'Ferry Ardiansyah (Nominee Link)',
        entityType: 'Source Account Number',
        value: '8829910283',
        category: isFraud ? 'Money Mule, Rekening Bodong' : 'Judol, Deposit Merchant Ilegal',
        reason: isFraud ? 'Rekening nominee penampung transaksi mencurigakan' : 'Jaringan deposit rekening merchant judol luar negeri',
        riskWeight: 95,
        source: isFraud ? 'Polres Jakarta Selatan' : 'PPATK STR Datafeed',
        tags: [isFraud ? 'Mule Account' : 'Judol', 'Critical'],
        expiryDate: '2027-12-31',
        isValid: true,
        missingFields: []
      },
      {
        rowNumber: 4,
        cif: 'CIF3341092',
        accountNumber: '081234567890',
        customerName: 'Sindikat Call Center Bodong',
        entityType: 'Phone Number',
        value: '081234567890',
        category: 'Social Engineering, Vishing',
        reason: 'Nomor dipakai broadcast SMS tipu-tipu promo perbankan',
        riskWeight: 85,
        source: 'Customer Care Alert',
        tags: ['Vishing', 'Call Center Fraud'],
        expiryDate: '2027-03-01',
        isValid: true,
        missingFields: []
      },
      {
        rowNumber: 5,
        cif: 'CIF6651201',
        accountNumber: '7781029384',
        customerName: 'Device Farm Botnet #14',
        entityType: 'Device ID',
        value: 'DEV-SAMSUNG-A54-88319',
        category: 'Bot Attack, Credential Stuffing',
        reason: 'Perangkat bot terdeteksi 450 request login gagal beruntun',
        riskWeight: 95,
        source: 'FMS Security Bot Rule',
        tags: ['Botnet', 'Device Farm'],
        expiryDate: '2027-09-01',
        isValid: true,
        missingFields: []
      },
      // Intentional INVALID Row #6 (Missing CIF)
      {
        rowNumber: 6,
        cif: '',
        accountNumber: '6620019283',
        customerName: 'Rudi Hartono (Data Cacat 1)',
        entityType: 'Source Account Number',
        value: '6620019283',
        category: 'Account Takeover',
        reason: 'Data import tidak menyertakan CIF nasabah',
        riskWeight: 75,
        source: 'Internal Audit',
        tags: ['Draft Cacat'],
        isValid: false,
        missingFields: ['CIF'],
        errorMessage: 'Parameter wajib CIF tidak ditemukan atau kosong'
      },
      // Intentional INVALID Row #7 (Missing Account Number)
      {
        rowNumber: 7,
        cif: 'CIF2291033',
        accountNumber: '',
        customerName: 'Doni Prasetya (Data Cacat 2)',
        entityType: 'CIF',
        value: 'CIF2291033',
        category: 'Syndicate Member',
        reason: 'Data import tidak menyertakan nomor rekening terkait',
        riskWeight: 80,
        source: 'Risk Analytics',
        tags: ['Draft Cacat'],
        isValid: false,
        missingFields: ['Nomor Rekening'],
        errorMessage: 'Parameter wajib Nomor Rekening tidak ditemukan atau kosong'
      },
      // Intentional INVALID Row #8 (Missing Nama Nasabah)
      {
        rowNumber: 8,
        cif: 'CIF1102948',
        accountNumber: '9901827364',
        customerName: '',
        entityType: 'Source Account Number',
        value: '9901827364',
        category: 'Unknown Entity',
        reason: 'Data import tidak mencantumkan nama nasabah',
        riskWeight: 70,
        source: 'External Feed',
        tags: ['Draft Cacat'],
        isValid: false,
        missingFields: ['Nama Nasabah'],
        errorMessage: 'Parameter wajib Nama Nasabah tidak ditemukan atau kosong'
      }
    ];

    setParsedRows(sampleRows);
    setFileNameDisplay('sample_demo_batch_upload.csv');
    setFileSizeDisplay('18.6 KB');
    setHasDraftRestored(false);
    saveDraftToSession(sampleRows, 'sample_demo_batch_upload.csv', 18600);
  };

  // Process rows matrix (from CSV or XLSX) and validate
  const processMatrixData = (matrix: any[][], fileName: string, fileSize: number) => {
    if (!matrix || matrix.length < 2) {
      alert('Berkas kosong atau hanya berisi baris header.');
      return;
    }

    const headerRow = matrix[0].map(col => String(col || '').trim().toLowerCase());
    
    // Find column indices
    let cifIdx = headerRow.findIndex(h => h.includes('cif'));
    let accIdx = headerRow.findIndex(h => h.includes('rekening') || h.includes('account') || h.includes('acc_num'));
    let nameIdx = headerRow.findIndex(h => h.includes('nama') || h.includes('customer') || h.includes('holder'));
    let typeIdx = headerRow.findIndex(h => h.includes('tipe') || h.includes('type') || h.includes('entity_type'));
    let valIdx = headerRow.findIndex(h => h.includes('nilai') || h.includes('value') || h.includes('entity_val'));
    let catIdx = headerRow.findIndex(h => h.includes('kategori') || h.includes('category') || h.includes('tags'));
    let reasonIdx = headerRow.findIndex(h => h.includes('alasan') || h.includes('reason') || h.includes('notes'));
    let weightIdx = headerRow.findIndex(h => h.includes('bobot') || h.includes('weight') || h.includes('risk'));
    let sourceIdx = headerRow.findIndex(h => h.includes('sumber') || h.includes('source'));
    let expIdx = headerRow.findIndex(h => h.includes('kadaluarsa') || h.includes('expiry') || h.includes('expired'));

    // Fallback default index positions if standard names not matched
    if (cifIdx === -1) cifIdx = 0;
    if (accIdx === -1) accIdx = 1;
    if (nameIdx === -1) nameIdx = 2;
    if (typeIdx === -1) typeIdx = 3;
    if (valIdx === -1) valIdx = 4;
    if (catIdx === -1) catIdx = 5;
    if (reasonIdx === -1) reasonIdx = 6;
    if (weightIdx === -1) weightIdx = 7;
    if (sourceIdx === -1) sourceIdx = 8;
    if (expIdx === -1) expIdx = 9;

    const rows: BatchParsedRow[] = [];

    for (let r = 1; r < matrix.length; r++) {
      const line = matrix[r];
      if (!line || line.length === 0 || line.every(cell => !cell || String(cell).trim() === '')) {
        continue;
      }

      const rawCif = String(line[cifIdx] ?? '').trim();
      const rawAcc = String(line[accIdx] ?? '').trim();
      const rawName = String(line[nameIdx] ?? '').trim();
      const rawType = String(line[typeIdx] ?? '').trim();
      const rawVal = String(line[valIdx] ?? '').trim();
      const rawCat = String(line[catIdx] ?? '').trim();
      const rawReason = String(line[reasonIdx] ?? '').trim();
      const rawWeight = String(line[weightIdx] ?? '').trim();
      const rawSource = String(line[sourceIdx] ?? '').trim();
      const rawExp = String(line[expIdx] ?? '').trim();

      // Entity detection & fallback
      let value = rawVal;
      let detectedEntity = detectEntityType(rawVal || rawAcc || rawCif, rawType);

      if (!value) {
        if (detectedEntity === 'CIF' && rawCif) value = rawCif;
        else if (detectedEntity === 'Source Account Number' && rawAcc) value = rawAcc;
        else value = rawAcc || rawCif || rawVal;
      }

      // Mandatory Field Validations: CIF, Account Number, Nama Nasabah
      const missingFields: string[] = [];
      if (!rawCif || rawCif.length < 3) {
        missingFields.push('CIF');
      }
      if (!rawAcc || rawAcc.length < 5) {
        missingFields.push('Nomor Rekening');
      }
      if (!rawName || rawName.length < 2) {
        missingFields.push('Nama Nasabah');
      }

      const isValid = missingFields.length === 0 && Boolean(value && value.length >= 3);
      const errorMsg = missingFields.length > 0 
        ? `Parameter wajib belum lengkap: ${missingFields.join(', ')} wajib diisi.` 
        : (!value || value.length < 3 ? 'Nilai entitas kosong atau tidak valid (< 3 karakter)' : undefined);

      const parsedWeight = parseInt(rawWeight, 10);
      const riskWeight = !isNaN(parsedWeight) 
        ? parsedWeight 
        : (targetListType === 'Blacklist' ? 95 : targetListType === 'Watchlist' ? 50 : 0);

      const tags = rawCat
        ? rawCat.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
        : [targetDomain, targetListType, 'Batch-Upload'];

      rows.push({
        rowNumber: rows.length + 1,
        cif: rawCif,
        accountNumber: rawAcc,
        customerName: rawName,
        entityType: detectedEntity,
        value: value || rawAcc || rawCif,
        category: rawCat || `${targetDomain} Risk`,
        reason: rawReason || `Batch import data nasabah ${targetListType} ${targetDomain}`,
        riskWeight,
        source: rawSource || (targetDomain === 'FRAUD' ? 'Laporan Satgas PASTI / OJK' : 'PPATK STR Datafeed'),
        tags,
        expiryDate: rawExp || undefined,
        isValid,
        missingFields,
        errorMessage: errorMsg
      });
    }

    setParsedRows(rows);
    setFileNameDisplay(fileName);
    setFileSizeDisplay(formatFileSize(fileSize));
    setHasDraftRestored(false);
    saveDraftToSession(rows, fileName, fileSize);
  };

  // CSV Parsing
  const parseCsvText = (text: string, fileName: string, fileSize: number) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert('File CSV kosong atau hanya berisi baris header.');
      return;
    }

    let delimiter = ',';
    const firstLine = lines[0];
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const matrix: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let current = '';
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === delimiter && !insideQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      matrix.push(values);
    }

    processMatrixData(matrix, fileName, fileSize);
  };

  // XLSX Parsing using SheetJS
  const parseExcelArrayBuffer = (buffer: ArrayBuffer, fileName: string, fileSize: number) => {
    try {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
      processMatrixData(matrix, fileName, fileSize);
    } catch (err) {
      console.error('Error parsing Excel spreadsheet:', err);
      alert('Gagal membaca berkas Excel. Pastikan berkas memiliki format .xlsx atau .xls yang valid.');
    }
  };

  // Handle selected file
  const processSelectedFile = (selectedFile: File) => {
    const validExtensions = ['.csv', '.txt', '.xlsx', '.xls'];
    const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      alert('Format berkas tidak didukung. Harap unggah berkas dengan format .csv, .xlsx, .xls, atau .txt.');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    if (fileExt === '.xlsx' || fileExt === '.xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          parseExcelArrayBuffer(e.target.result, selectedFile.name, selectedFile.size);
        }
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('Gagal membaca berkas Excel.');
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCsvText(text, selectedFile.name, selectedFile.size);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('Gagal membaca berkas CSV.');
        setIsProcessing(false);
      };
      reader.readAsText(selectedFile);
    }
  };

  // Drag and Drop handlers
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
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileNameDisplay('');
    setFileSizeDisplay('');
    setParsedRows([]);
    clearDraftSession();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Execute Submission with Maker-Checker Status & Persistence
  const handleSubmitBatch = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    const rowsToProcess = skipInvalidRows ? validRows : parsedRows;

    if (rowsToProcess.length === 0) {
      alert('Tidak ada baris data valid untuk diunggah. Mohon perbaiki data cacat atau unggah berkas yang memenuhi parameter.');
      return;
    }

    if (!skipInvalidRows && parsedRows.some(r => !r.isValid)) {
      alert('Terdapat baris data yang cacat/invalid. Aktifkan opsi "Hanya proses baris yang VALID" atau perbaiki data sebelum submit.');
      return;
    }

    setIsProcessing(true);

    const batchId = `BATCH-${Date.now().toString().slice(-6)}`;
    const formattedEntries: Array<Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>> = rowsToProcess.map(row => ({
      type: targetListType,
      domain: targetDomain,
      listCategory: targetDomain,
      category: row.entityType as any,
      entityType: row.entityType,
      value: row.value,
      holderName: row.customerName,
      customerName: row.customerName,
      cif: row.cif,
      accountNumber: row.accountNumber,
      reason: row.reason,
      tags: row.tags,
      riskWeight: row.riskWeight,
      source: row.source,
      addedBy: 'Yoseph Sanjaya (DCA Maker)',
      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      expiryDate: row.expiryDate,
      status: 'Pending Approval', // Strictly Pending Approval
      batchId,
      applyToAllRules: true,
      appliedRuleCodes: []
    }));

    const result = onBulkImport(formattedEntries, {
      batchId,
      fileName: fileNameDisplay || 'batch_upload.csv',
      targetDomain,
      targetListType,
      makerName: 'Yoseph Sanjaya (DCA Maker)'
    });

    // Clear draft in session once submitted
    clearDraftSession();

    setIsProcessing(false);
    onClose();

    if (onSuccessToast) {
      onSuccessToast(
        `Batch Upload Berhasil Diajukan! Sebanyak ${result.addedCount} entitas disimpan dengan status Pending Approval dan menunggu persetujuan Supervisor (L2 Checker) dengan Tiket #${result.ticketNo || batchId}.`
      );
    }
  };

  // Metrics
  const totalCount = parsedRows.length;
  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = totalCount - validCount;

  // Filtered rows for table view
  const displayedRows = parsedRows.filter(r => {
    if (statusFilter === 'VALID') return r.isValid;
    if (statusFilter === 'INVALID') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              targetDomain === 'FRAUD' 
                ? 'bg-rose-100 border-rose-200 text-rose-700' 
                : 'bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Batch Upload List (Bulk Import)
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${
                  targetDomain === 'FRAUD' 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {targetDomain}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  targetListType === 'Blacklist'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : targetListType === 'Watchlist'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {targetListType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah massal entitas nasabah terindikasi dengan validasi mandatori CIF, Nomor Rekening, dan Nama Nasabah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-csv-template"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh berkas CSV format standar"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Target Domain & List Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Target Domain Risiko:
                </label>
                {isSysAdmin ? (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    👑 Sysadmin
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-semibold">
                    🔒 Terkunci Sesuai Role
                  </span>
                )}
              </div>

              {isFraudRole ? (
                <div className="p-2.5 rounded-xl border bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-900 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-xs">FRAUD Domain (Khusus AFC)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-200/80 text-rose-900 font-bold text-[10px] rounded-full border border-rose-300">
                    FRAUD ONLY
                  </span>
                </div>
              ) : isAmlRole ? (
                <div className="p-2.5 rounded-xl border bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-900 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs">AML Domain (Khusus Analyst)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-200/80 text-indigo-900 font-bold text-[10px] rounded-full border border-indigo-300">
                    AML ONLY
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetDomain('FRAUD')}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      targetDomain === 'FRAUD'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>FRAUD Domain</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetDomain('AML')}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      targetDomain === 'AML'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    <span>AML Domain</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Target Jenis Daftar (List Type):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Blacklist', 'Watchlist', 'Whitelist'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTargetListType(t)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      targetListType === t
                        ? t === 'Blacklist'
                          ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                          : t === 'Watchlist'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Maker-Checker Workflow Notice Banner */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start space-x-3 text-amber-900">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-amber-800">
                Maker-Checker Workflow Integration:
              </div>
              <p className="mt-0.5 text-amber-700">
                Seluruh data entitas yang diimpor secara masif (bulk) otomatis disimpan dengan status <strong className="font-bold text-amber-900">Pending Approval</strong>. Data hasil upload akan masuk ke antrean persetujuan Supervisor (L2 Checker) sebelum aktif pada daftar Blacklist/Watchlist/Whitelist di mesin deteksi.
              </p>
            </div>
          </div>

          {/* Drag & Drop / Local File Picker Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Unggah Berkas Import (.csv, .xlsx, .txt)</span>
              </label>

              {/* Quick Load Demo Sample Button */}
              <button
                type="button"
                id="btn-load-demo-sample"
                onClick={handleLoadDemoSample}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                title="Muat contoh data pengujian dengan data valid dan data cacat untuk verifikasi cepat"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Muat Contoh Data Uji (Demo Sample)</span>
              </button>
            </div>

            {hasDraftRestored && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Draf berkas sebelumnya telah dipulihkan secara otomatis dari penyimpanan sesi (sessionStorage).
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                >
                  Bersihkan Draf
                </button>
              </div>
            )}

            {!fileNameDisplay ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/70 ring-4 ring-blue-100' 
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Tarik dan lepaskan berkas di sini, atau <span className="text-blue-600 underline">Pilih Berkas Lokal</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Mendukung format file <strong>.csv</strong>, <strong>.xlsx</strong>, atau <strong>.txt</strong> (Maksimal 10 MB)
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200/60 text-slate-600 text-xs font-mono">
                  Kolom Wajib: CIF | Nomor_Rekening | Nama_Nasabah
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{fileNameDisplay}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Ukuran: {fileSizeDisplay} • Total: {totalCount} baris terdeteksi
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  >
                    Ganti Berkas
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Hapus Berkas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* DATA PREVIEW & VALIDATION WINDOW */}
          {parsedRows.length > 0 && (
            <div className="space-y-4 pt-2">
              
              {/* Validation Summary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Total Baris Berkas
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                      {totalCount} Baris
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                      Baris Valid (Siap Diajukan)
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                      {validCount} Baris
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border shadow-xs flex items-center justify-between ${
                  invalidCount > 0 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider">
                      Baris Cacat / Tidak Lengkap
                    </div>
                    <div className={`text-xl font-bold font-mono mt-0.5 ${invalidCount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                      {invalidCount} Baris
                    </div>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    invalidCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Table Controls & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Filter Tampilan:</span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('VALID')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      statusFilter === 'VALID'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Hanya Valid ({validCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('INVALID')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      statusFilter === 'INVALID'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    Hanya Cacat ({invalidCount})
                  </button>
                </div>

                {invalidCount > 0 && (
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipInvalidRows}
                      onChange={e => setSkipInvalidRows(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Hanya import baris yang VALID (Abaikan {invalidCount} data cacat)</span>
                  </label>
                )}
              </div>

              {/* Data Preview Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5 w-10 text-center">#</th>
                        <th className="px-3 py-2.5">Status Validasi</th>
                        <th className="px-3 py-2.5">CIF</th>
                        <th className="px-3 py-2.5">Nomor Rekening</th>
                        <th className="px-3 py-2.5">Nama Nasabah</th>
                        <th className="px-3 py-2.5">Tipe Entitas</th>
                        <th className="px-3 py-2.5">Nilai Entitas (Value)</th>
                        <th className="px-3 py-2.5">Alasan / Catatan</th>
                        <th className="px-3 py-2.5 text-center">Bobot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                            Tidak ada data yang sesuai filter status.
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => (
                          <tr 
                            key={row.rowNumber} 
                            className={`transition ${row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/70'}`}
                          >
                            <td className="px-3 py-2 text-center font-mono text-slate-400">
                              {row.rowNumber}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>VALID</span>
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    <span>INVALID</span>
                                  </span>
                                  {row.missingFields.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {row.missingFields.map(f => (
                                        <span key={f} className="text-[9px] font-semibold px-1 py-0.2 rounded bg-rose-200 text-rose-900">
                                          {f} Kosong
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap font-mono font-bold text-slate-800">
                              {row.cif ? (
                                <span>{row.cif}</span>
                              ) : (
                                <span className="text-rose-600 italic text-[11px] font-medium bg-rose-100 px-1.5 py-0.5 rounded">
                                  (CIF Kosong)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap font-mono font-semibold text-slate-800">
                              {row.accountNumber ? (
                                <span>{row.accountNumber}</span>
                              ) : (
                                <span className="text-rose-600 italic text-[11px] font-medium bg-rose-100 px-1.5 py-0.5 rounded">
                                  (Rekening Kosong)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-900 max-w-[180px] truncate" title={row.customerName}>
                              {row.customerName ? (
                                <span>{row.customerName}</span>
                              ) : (
                                <span className="text-rose-600 italic text-[11px] font-medium bg-rose-100 px-1.5 py-0.5 rounded">
                                  (Nama Kosong)
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-medium">
                                {row.entityType}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap font-mono text-slate-900 select-all font-bold">
                              {row.value}
                            </td>
                            <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate" title={row.reason}>
                              {row.reason}
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold text-slate-700">
                              {row.riskWeight}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                Siap diajukan: <strong className="font-bold text-emerald-700">{skipInvalidRows ? validCount : (invalidCount === 0 ? validCount : 0)} data valid</strong> dengan status <strong className="text-amber-800 font-bold">Pending Approval</strong>.
              </span>
            ) : (
              <span>Harap unggah berkas import CSV / Excel untuk memvalidasi data.</span>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              id="btn-submit-batch-upload"
              disabled={isProcessing || (skipInvalidRows ? validCount === 0 : (totalCount === 0 || invalidCount > 0))}
              onClick={handleSubmitBatch}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                isProcessing || (skipInvalidRows ? validCount === 0 : (totalCount === 0 || invalidCount > 0))
                  ? 'bg-slate-400 cursor-not-allowed'
                  : targetDomain === 'FRAUD'
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
              }`}
            >
              {isProcessing ? (
                <span>Memproses Upload...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim ke Antrean Persetujuan (Pending Approval)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
