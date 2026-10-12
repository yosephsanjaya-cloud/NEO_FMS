import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  ShieldAlert, 
  Save, 
  Send, 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  User, 
  FileText, 
  CreditCard, 
  Smartphone, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  Layers, 
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  UploadCloud,
  Paperclip,
  Eye,
  Image,
  FileSpreadsheet,
  AlertCircle,
  Download
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { FraudCase, CaseUrgency, TransactionInfo, FraudCaseAttachment, AlertStatus } from '../../types/fms';
import { MOCK_CORE_TRANSACTIONS, SearchableTransaction } from '../../data/mockTransactions';
import { formatIDR } from '../../lib/utils';
import { normalizeTrxStatus } from './TransactionAlertTable';

interface CreateManualAlertModalProps {
  defaultDomain?: 'Fraud' | 'AML';
  onClose: () => void;
  onSuccess?: (newCase: FraudCase) => void;
}

const COMMON_ALERT_SOURCES = [
  'External Report',
  'Law Enforcement / Police (Bareskrim/Polda)',
  'Branch Escalation (KC / KCP)',
  'Call Center / Contact Center 1500-xxx',
  'Regulatory Authority (OJK / PPATK / BI)',
  'Internal Audit & Compliance Finding',
  'Customer Dispute / Chargeback',
  'Whistleblower System (WBS)',
  'Anti-Fraud Intelligence & Threat Intel',
  'Partner / Payment Gateway / Fintech Escalation',
  'Media Intelligence / Social Media Monitoring'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'];

const FRAUD_INCIDENT_OPTIONS = [
  'Pengambilalihan Akun (Account Takeover / ATO)',
  'Transaksi Mencurigakan / Anomali Frekuensi (Suspicious Transaction)',
  'Indikasi Phishing / Social Engineering',
  'Penggunaan Identitas Palsu (Identity Theft / Fraud Carding)',
  'Fraud Internal / Penyalahgunaan Wewenang',
  'Lainnya (Isi Manual)'
];

const AML_INCIDENT_OPTIONS = [
  'Indikasi Pencucian Uang (Money Laundering Suspicion)',
  'Transaksi Tanpa Tujuan Ekonomi Jelas (No Economic Rationale)',
  'Pola Transaksi Structured / Smurfing',
  'Profil Nasabah Tidak Sesuai Transaksi (Profile Mismatch)',
  'Terindikasi Terorisme / Daftar Terlarang (PEP / Sanction List Match)',
  'Lainnya (Isi Manual)'
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const CreateManualAlertModal: React.FC<CreateManualAlertModalProps> = ({
  defaultDomain = 'Fraud',
  onClose,
  onSuccess
}) => {
  const { createManualAlert, addNotification } = useFMS();

  // Category Domain: Locked 100% to defaultDomain (Strict Domain Isolation)
  const alertCategory = defaultDomain;

  // File / Document Evidence Upload State (Section 4)
  const [uploadedFiles, setUploadedFiles] = useState<FraudCaseAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [previewDoc, setPreviewDoc] = useState<FraudCaseAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. ALERT INFORMATION
  const [source, setSource] = useState<string>('External Report');
  const [severity, setSeverity] = useState<CaseUrgency>('High');
  // Default to current local datetime YYYY-MM-DDTHH:MM
  const [detectionDate, setDetectionDate] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // 2. CUSTOMER INFORMATION
  const [cif, setCif] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [sourceAccountNumber, setSourceAccountNumber] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  // 3. ADDITIONAL INFORMATION
  const [externalCaseId, setExternalCaseId] = useState<string>('');
  const [selectedIncidentCategory, setSelectedIncidentCategory] = useState<string>('');
  const [customIncidentDescription, setCustomIncidentDescription] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const currentIncidentOptions = useMemo(() => {
    return alertCategory === 'Fraud' ? FRAUD_INCIDENT_OPTIONS : AML_INCIDENT_OPTIONS;
  }, [alertCategory]);

  // 4. TRANSACTION EVIDENCE
  const [selectedTransactions, setSelectedTransactions] = useState<SearchableTransaction[]>([]);
  const [isSearchTxnModalOpen, setIsSearchTxnModalOpen] = useState<boolean>(false);

  // Search Txn Popup State
  const [txnSearchTerm, setTxnSearchTerm] = useState<string>('');
  const [txnChannelFilter, setTxnChannelFilter] = useState<string>('ALL');
  const [tempCheckedTxnIds, setTempCheckedTxnIds] = useState<string[]>([]);

  // Notification / Validation state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quick Autofill from Core DB if CIF or Account is matched
  const handleAutofillCustomer = (txn: SearchableTransaction) => {
    setCif(txn.cif);
    setName(txn.customerName);
    if (txn.customerId) setCustomerId(txn.customerId);
    setSourceAccountNumber(txn.sourceAccount);
    if (!phoneNumber) setPhoneNumber('081298765432');
    if (!deviceId) setDeviceId(txn.deviceModel ? `DEV-${txn.deviceModel.replace(/\s+/g, '-').toUpperCase()}` : 'DEV-CORE-001');
  };

  // Filtered pool of searchable core transactions
  const filteredSearchTxns = useMemo(() => {
    return MOCK_CORE_TRANSACTIONS.filter(item => {
      if (txnChannelFilter !== 'ALL' && !item.channel.toLowerCase().includes(txnChannelFilter.toLowerCase())) {
        return false;
      }
      if (txnSearchTerm.trim()) {
        const q = txnSearchTerm.toLowerCase();
        return (
          item.trxId.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.cif.toLowerCase().includes(q) ||
          item.sourceAccount.toLowerCase().includes(q) ||
          item.destinationAccount.toLowerCase().includes(q) ||
          item.destinationBank.toLowerCase().includes(q) ||
          item.trxType.toLowerCase().includes(q) ||
          item.amount.toString().includes(q)
        );
      }
      return true;
    });
  }, [txnSearchTerm, txnChannelFilter]);

  // Open transaction picker modal
  const handleOpenTxnSearchModal = () => {
    // Pre-check currently selected items
    setTempCheckedTxnIds(selectedTransactions.map(t => t.trxId));
    setIsSearchTxnModalOpen(true);
  };

  // Toggle selection inside popup
  const handleToggleTempTxn = (trxId: string) => {
    setTempCheckedTxnIds(prev => 
      prev.includes(trxId) ? prev.filter(id => id !== trxId) : [...prev, trxId]
    );
  };

  // Select all in search popup
  const handleToggleSelectAllSearch = () => {
    if (tempCheckedTxnIds.length === filteredSearchTxns.length) {
      setTempCheckedTxnIds([]);
    } else {
      setTempCheckedTxnIds(filteredSearchTxns.map(t => t.trxId));
    }
  };

  // Confirm selection from popup
  const handleConfirmAddTransactions = () => {
    const newlySelected = MOCK_CORE_TRANSACTIONS.filter(t => tempCheckedTxnIds.includes(t.trxId));
    setSelectedTransactions(newlySelected);

    // If customer info is empty, auto-fill from first selected transaction
    if (newlySelected.length > 0 && (!cif || !name)) {
      handleAutofillCustomer(newlySelected[0]);
    }

    setIsSearchTxnModalOpen(false);
  };

  // Remove single transaction from evidence
  const handleRemoveTransaction = (trxId: string) => {
    setSelectedTransactions(prev => prev.filter(t => t.trxId !== trxId));
  };

  // Total Transaction Evidence Amount
  const totalEvidenceAmount = useMemo(() => {
    return selectedTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [selectedTransactions]);

  // File processing and document attachment handlers (Section 4)
  const processFiles = (fileList: FileList | File[]) => {
    const newFiles: FraudCaseAttachment[] = [];
    let errorMsg = '';

    Array.from(fileList).forEach((file) => {
      // Validate size (max 10MB)
      if (file.size > MAX_FILE_SIZE) {
        errorMsg = `File "${file.name}" melebihi batas maksimum 10MB (${formatFileSize(file.size)}).`;
        return;
      }

      // Validate extension
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errorMsg = `Format file "${file.name}" tidak didukung. Format yang diizinkan: .pdf, .jpg, .png, .xlsx`;
        return;
      }

      // Generate preview object URL if image or pdf
      let url = '';
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        try {
          url = URL.createObjectURL(file);
        } catch (e) {
          url = '';
        }
      }

      newFiles.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        type: ext.replace('.', '').toUpperCase(),
        url
      });
    });

    if (errorMsg) {
      setValidationError(errorMsg);
    } else {
      setValidationError(null);
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Form Submit Handler
  const handleSubmitAlert = (status: AlertStatus) => {
    setValidationError(null);

    // Basic Validation
    if (!source.trim()) {
      setValidationError('Silakan isi atau pilih Alert Source.');
      return;
    }
    if (!name.trim() && !cif.trim() && !sourceAccountNumber.trim()) {
      setValidationError('Silakan isi minimal Customer Name, CIF, atau Source Account Number.');
      return;
    }

    const finalIncidentDescription = 
      selectedIncidentCategory === 'Lainnya (Isi Manual)'
        ? customIncidentDescription.trim()
        : selectedIncidentCategory.trim();

    if (!finalIncidentDescription) {
      setValidationError('Silakan pilih Kategori Insiden atau isi Deskripsi Insiden Manual.');
      return;
    }

    // Prepare Primary Transaction Info
    const primaryTxn: TransactionInfo = selectedTransactions.length > 0 ? {
      trxId: selectedTransactions[0].trxId,
      amount: selectedTransactions[0].amount,
      currency: selectedTransactions[0].currency || 'IDR',
      sourceAccount: selectedTransactions[0].sourceAccount || sourceAccountNumber || 'N/A',
      destinationAccount: selectedTransactions[0].destinationAccount || 'N/A',
      destinationBank: selectedTransactions[0].destinationBank || 'N/A',
      channel: selectedTransactions[0].channel || 'Direct Escalation',
      ipAddress: selectedTransactions[0].ipAddress || '127.0.0.1',
      location: selectedTransactions[0].location || 'Bank Sampoerna HO',
      deviceModel: selectedTransactions[0].deviceModel || deviceId || 'Manual Entry',
      timestamp: selectedTransactions[0].timestamp || detectionDate.replace('T', ' ') + ':00',
      trxType: selectedTransactions[0].trxType || 'Manual Escalation Record'
    } : {
      trxId: `TRX-MAN-${Date.now().toString().slice(-6)}`,
      amount: totalEvidenceAmount || 0,
      currency: 'IDR',
      sourceAccount: sourceAccountNumber || 'N/A',
      destinationAccount: 'N/A',
      destinationBank: 'N/A',
      channel: 'Manual Escalation',
      ipAddress: '10.10.1.1',
      location: 'Bank Sampoerna Internal',
      deviceModel: deviceId || 'N/A',
      timestamp: detectionDate.replace('T', ' ') + ':00',
      trxType: 'Manual Alert Escalation'
    };

    const newCase = createManualAlert({
      alertCategory,
      source,
      severity,
      detectionDate: detectionDate.replace('T', ' ') + ':00',
      cif: cif.trim() || `CIF${Math.floor(1000000 + Math.random() * 9000000)}`,
      customerName: name.trim() || 'Nasabah Belum Teridentifikasi',
      customerId: customerId.trim(),
      sourceAccountNumber: sourceAccountNumber.trim(),
      phoneNumber: phoneNumber.trim() || '08xxxxxxxxxx',
      deviceId: deviceId.trim() || 'DEV-MANUAL-ESC',
      externalCaseId: externalCaseId.trim(),
      incidentDescription: finalIncidentDescription,
      note: note.trim(),
      transaction: primaryTxn,
      transactionEvidenceList: selectedTransactions,
      attachments: uploadedFiles,
      alertStatus: status
    });

    if (status === 'Pending Approval') {
      addNotification({
        domain: alertCategory === 'AML' ? 'AML' : 'FRAUD',
        title: 'Manual Alert Disubmit',
        message: 'Manual Alert berhasil dikirim. Menunggu persetujuan L2 Checker.',
        targetRole: 'checker'
      });
    }

    if (onSuccess) {
      onSuccess(newCase);
    }
    onClose();
  };

  return (
    <>
      <div 
        id="modal-create-manual-alert"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      >
        <div className="bg-white border border-slate-300 rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
          
          {/* ========================================================= */}
          {/* HEADER                                                    */}
          {/* ========================================================= */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold font-mono text-white tracking-wide">
                    CREATE MANUAL ALERT ({alertCategory.toUpperCase()})
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
                    MANUAL INTAKE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Formulir Penambahan Kasus Manual untuk Investigasi Fraud &amp; AML Bank Sampoerna
                </p>
              </div>
            </div>

            {/* Locked Domain Context Badge & Close Button */}
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1.5 rounded-lg border font-mono font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-xs ${
                alertCategory === 'Fraud' 
                  ? 'bg-red-600/30 border-red-500/50 text-red-300' 
                  : 'bg-amber-600/30 border-amber-500/50 text-amber-300'
              }`}>
                <ShieldAlert className="w-4 h-4" />
                <span>{alertCategory.toUpperCase()} ALERT INTAKE</span>
              </div>

              <button
                id="btn-close-create-manual-alert"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                title="Tutup Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{validationError}</span>
              </div>
              <button onClick={() => setValidationError(null)} className="text-rose-600 hover:text-rose-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODAL BODY (FORM SECTIONS)                                */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs flex-1 bg-slate-50">
            
            {/* ======================================================= */}
            {/* 1. ALERT INFORMATION                                    */}
            {/* ======================================================= */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Alert Information
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Source (Freetext with dropdown / datalist) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Source <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-slate-400 font-normal">Freetext &amp; Dropdown</span>
                  </label>
                  <div className="relative">
                    <input
                      id="input-manual-alert-source"
                      type="text"
                      list="alert-source-options"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Pilih atau ketik sumber laporan..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <datalist id="alert-source-options">
                      {COMMON_ALERT_SOURCES.map((src, idx) => (
                        <option key={idx} value={src} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Contoh: External Report, Bareskrim Polri, Call Center, OJK, dsb.
                  </p>
                </div>

                {/* Severity (Dropdown: Low, Med, High) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-manual-alert-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as CaseUrgency)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low - Prioritas Rendah / Pemantauan Berkala</option>
                    <option value="Med">Med - Prioritas Menengah / Klarifikasi Standar</option>
                    <option value="High">High - Prioritas Kritis / Urgent Action Required</option>
                  </select>
                  <div className="flex items-center space-x-2 pt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      severity === 'High' ? 'bg-red-100 text-red-700' :
                      severity === 'Med' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      Level: {severity}
                    </span>
                  </div>
                </div>

                {/* Detection Date (Calendar with Time) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Detection Date &amp; Time <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    id="input-manual-alert-detection-date"
                    type="datetime-local"
                    value={detectionDate}
                    onChange={(e) => setDetectionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Waktu insiden pertama kali terdeteksi atau dilaporkan
                  </p>
                </div>

              </div>
            </div>

            {/* ======================================================= */}
            {/* 2. CUSTOMER INFORMATION                                 */}
            {/* ======================================================= */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Customer Information
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  Identitas rekening &amp; profil nasabah terkait
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* CIF */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>CIF Number</span>
                  </label>
                  <input
                    id="input-manual-cif"
                    type="text"
                    value={cif}
                    onChange={(e) => setCif(e.target.value)}
                    placeholder="e.g. CIF8829103"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-manual-customer-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap Nasabah..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Customer ID (KTP, Passport, etc) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer ID (KTP / Passport / NIK)</span>
                  </label>
                  <input
                    id="input-manual-customer-id"
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="e.g. 3171028392810002"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Source Account Number */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Source Account Number</span>
                  </label>
                  <input
                    id="input-manual-source-account"
                    type="text"
                    value={sourceAccountNumber}
                    onChange={(e) => setSourceAccountNumber(e.target.value)}
                    placeholder="e.g. 10892019283"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    id="input-manual-phone-number"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 081298765432"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Device ID */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Device ID</span>
                  </label>
                  <input
                    id="input-manual-device-id"
                    type="text"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="e.g. DEV-SAMS-S24-9912"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>
            </div>

            {/* ======================================================= */}
            {/* 3. ADDITIONAL INFORMATION                               */}
            {/* ======================================================= */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Additional Information
                </h4>
              </div>

              <div className="space-y-4">
                
                {/* External Case ID */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    External Case ID <span className="text-slate-400 font-normal">(Nomor Surat / Tiket Eksternal / Laporan Polisi)</span>
                  </label>
                  <input
                    id="input-manual-external-case-id"
                    type="text"
                    value={externalCaseId}
                    onChange={(e) => setExternalCaseId(e.target.value)}
                    placeholder="e.g. LP/B/902/VIII/2026/BARESKRIM atau TICKET-CC-2026-88192"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Incident Description */}
                <div className="space-y-2">
                  <label htmlFor="select-manual-incident-category" className="font-semibold text-slate-700 block">
                    Incident Description / Keterangan Insiden <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-manual-incident-category"
                    value={selectedIncidentCategory}
                    onChange={(e) => setSelectedIncidentCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kategori Insiden ({alertCategory.toUpperCase()}) --</option>
                    {currentIncidentOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {selectedIncidentCategory === 'Lainnya (Isi Manual)' && (
                    <div className="pt-1.5 space-y-1 animate-in fade-in duration-150">
                      <label htmlFor="textarea-manual-incident-description" className="text-[11px] font-semibold text-slate-600 block">
                        Detail Deskripsi Insiden Manual <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="textarea-manual-incident-description"
                        rows={3}
                        value={customIncidentDescription}
                        onChange={(e) => setCustomIncidentDescription(e.target.value)}
                        placeholder="Ketikkan deskripsi insiden secara rinci dan bebas di sini..."
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Note <span className="text-slate-400 font-normal">(Catatan Tambahan &amp; Rekomendasi Investigasi)</span>
                  </label>
                  <textarea
                    id="textarea-manual-note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tambahkan catatan khusus untuk investigator L1/L2 atau tim AML..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                  />
                </div>

              </div>
            </div>

            {/* ======================================================= */}
            {/* 4. TRANSACTION & DOCUMENT EVIDENCE                     */}
            {/* ======================================================= */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span>Transaction Evidence &amp; Document Attachments</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-sans text-[10px] font-normal border border-slate-200">
                        Bukti Transaksi &amp; Dokumen
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Lampiran data transaksi perbankan &amp; berkas dokumen bukti pendukung (SPK, BAP, Rekening Koran, Laporan Polisi)
                    </p>
                  </div>
                </div>

                {/* Section Action Buttons */}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                    className="hidden"
                  />
                  <button
                    id="btn-upload-document-evidence"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-emerald-400" />
                    <span>+ Upload Document</span>
                  </button>

                  <button
                    id="btn-add-transaction-evidence"
                    type="button"
                    onClick={handleOpenTxnSearchModal}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Transaction</span>
                  </button>
                </div>
              </div>

              {/* SUBSECTION 4A: Core Banking Transaction Evidence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>A. Core Banking Transaction Evidence ({selectedTransactions.length})</span>
                  </span>
                  {selectedTransactions.length > 0 && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      Total: <strong className="text-red-600 font-bold">{formatIDR(totalEvidenceAmount)}</strong>
                    </span>
                  )}
                </div>

                {selectedTransactions.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/60 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-left">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Belum ada transaksi core banking yang ditambahkan</p>
                        <p className="text-[10px] text-slate-400">Klik "+ Add Transaction" untuk mencari transaksi yang melanggar/mencurigakan.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenTxnSearchModal}
                      className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer shrink-0"
                    >
                      + Add Transaction
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-semibold font-mono">
                        <tr>
                          <th className="p-2 text-center w-8">No</th>
                          <th className="p-2">Trx ID</th>
                          <th className="p-2">Waktu Transaksi</th>
                          <th className="p-2">Channel / Tipe</th>
                          <th className="p-2">Rekening Sumber</th>
                          <th className="p-2">Tujuan Transfer</th>
                          <th className="p-2 text-right">Nominal</th>
                          <th className="p-2 text-center">Status</th>
                          <th className="p-2 text-center w-10">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                        {selectedTransactions.map((txn, idx) => (
                          <tr key={txn.trxId} className="hover:bg-slate-50 transition">
                            <td className="p-2 text-center text-slate-500 font-sans">{idx + 1}</td>
                            <td className="p-2 font-bold text-blue-700">{txn.trxId}</td>
                            <td className="p-2 text-slate-600 whitespace-nowrap">{txn.timestamp}</td>
                            <td className="p-2 font-sans whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{txn.channel}</div>
                              <div className="text-[10px] text-slate-400">{txn.trxType}</div>
                            </td>
                            <td className="p-2 text-slate-800">{txn.sourceAccount}</td>
                            <td className="p-2 font-sans">
                              <div className="font-mono font-medium text-slate-800">{txn.destinationAccount}</div>
                              <div className="text-[10px] text-slate-500">{txn.destinationBank}</div>
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900 whitespace-nowrap">
                              {formatIDR(txn.amount)}
                            </td>
                            <td className="p-2 text-center">
                              {(() => {
                                const st = normalizeTrxStatus(txn.status);
                                return (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                    st === 'BERHASIL'
                                      ? 'bg-green-100 text-green-800 border-green-300'
                                      : 'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {st}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveTransaction(txn.trxId)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Hapus Transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SUBSECTION 4B: Document Evidence Upload & Drag and Drop Zone */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center space-x-1.5">
                    <Paperclip className="w-4 h-4 text-emerald-600" />
                    <span>B. Upload Document / File Evidence ({uploadedFiles.length} Berkas)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Format: .pdf, .jpg, .png, .xlsx (Max 10MB/file)
                  </span>
                </div>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 border-2 border-dashed rounded-xl text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                    isDragOver 
                      ? 'border-emerald-500 bg-emerald-50/70 scale-[1.005]' 
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Drag &amp; drop file dokumen bukti di sini, atau <span className="text-emerald-700 underline">klik untuk mencari berkas</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mendukung format: <strong className="text-slate-700 font-mono">.pdf, .jpg, .png, .xlsx</strong> • Batas maksimum <strong className="text-slate-700 font-mono">10MB</strong> per file
                    </p>
                  </div>
                </div>

                {/* Uploaded Document List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Daftar Berkas Terlampir ({uploadedFiles.length}):</span>
                      <span className="text-[10px] text-slate-400 font-normal">Klik tombol Preview untuk melihat isi dokumen</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {uploadedFiles.map((file) => {
                        const isImage = file.type === 'JPG' || file.type === 'JPEG' || file.type === 'PNG';
                        const isSpreadsheet = file.type === 'XLSX' || file.type === 'XLS';
                        const isPdf = file.type === 'PDF';

                        return (
                          <div
                            key={file.id}
                            className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isPdf ? 'bg-red-50 text-red-600 border border-red-200' :
                                isImage ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                isSpreadsheet ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {isImage ? <Image className="w-4 h-4" /> :
                                 isSpreadsheet ? <FileSpreadsheet className="w-4 h-4" /> :
                                 <FileText className="w-4 h-4" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                  <span className="font-bold text-slate-600 uppercase bg-slate-100 px-1 rounded">{file.type || 'FILE'}</span>
                                  <span>•</span>
                                  <span>{file.size}</span>
                                  <span>•</span>
                                  <span className="truncate">{file.uploadedAt}</span>
                                </div>
                              </div>
                            </div>

                            {/* File Action Buttons */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(file)}
                                className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center space-x-1 text-[11px] font-semibold cursor-pointer"
                                title="Pratinjau Dokumen"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Preview</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* MODAL FOOTER                                              */}
          {/* ========================================================= */}
          <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-mono">
              Kategori Alert: <strong className={alertCategory === 'Fraud' ? "text-red-700" : "text-amber-700"}>{alertCategory} (Strict Domain Isolation)</strong> • Severity: <strong className="text-red-600">{severity}</strong>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Batal
              </button>

              <button
                id="btn-save-draft-manual-alert"
                type="button"
                onClick={() => handleSubmitAlert('Draft')}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                id="btn-submit-manual-alert"
                type="button"
                onClick={() => handleSubmitAlert('Pending Approval')}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Alert</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* POPUP MODAL: SEARCH & SELECT TRANSACTION EVIDENCE         */}
      {/* ========================================================= */}
      {isSearchTxnModalOpen && (
        <div 
          id="modal-search-transaction-evidence"
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6"
        >
          <div className="bg-white border border-slate-300 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Popup Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-sm font-bold font-mono text-white">
                    SEARCH &amp; ADD TRANSACTION EVIDENCE
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Pilih satu atau lebih riwayat transaksi dari database core banking Bank Sampoerna
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSearchTxnModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-search-core-transactions"
                  type="text"
                  value={txnSearchTerm}
                  onChange={(e) => setTxnSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan Trx ID, CIF, Nama Nasabah, No Rekening, Nominal..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-semibold">Channel:</span>
                <select
                  value={txnChannelFilter}
                  onChange={(e) => setTxnChannelFilter(e.target.value)}
                  className="px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">Semua Channel</option>
                  <option value="Mobile">Mobile Banking</option>
                  <option value="Internet">Internet Banking</option>
                  <option value="QRIS">QRIS Gateway</option>
                  <option value="ATM">ATM Network</option>
                  <option value="Branch">Branch / Teller</option>
                </select>
              </div>
            </div>

            {/* Popup Table */}
            <div className="p-4 overflow-y-auto flex-1 max-h-[50vh]">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-semibold font-mono sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 text-center w-10">
                        <button
                          type="button"
                          onClick={handleToggleSelectAllSearch}
                          className="text-slate-600 hover:text-blue-600 cursor-pointer"
                        >
                          {tempCheckedTxnIds.length === filteredSearchTxns.length && filteredSearchTxns.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="p-2.5">Trx ID</th>
                      <th className="p-2.5">Nama Nasabah / CIF</th>
                      <th className="p-2.5">Rekening Sumber</th>
                      <th className="p-2.5">Channel / Tipe</th>
                      <th className="p-2.5 text-right">Nominal</th>
                      <th className="p-2.5">Waktu Transaksi</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px]">
                    {filteredSearchTxns.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                          Tidak ada transaksi yang cocok dengan kriteria pencarian "{txnSearchTerm}".
                        </td>
                      </tr>
                    ) : (
                      filteredSearchTxns.map((item) => {
                        const isChecked = tempCheckedTxnIds.includes(item.trxId);
                        return (
                          <tr 
                            key={item.trxId}
                            onClick={() => handleToggleTempTxn(item.trxId)}
                            className={`cursor-pointer transition ${
                              isChecked ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTempTxn(item.trxId)}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-2.5 font-bold text-blue-700">{item.trxId}</td>
                            <td className="p-2.5 font-sans">
                              <div className="font-semibold text-slate-900">{item.customerName}</div>
                              <div className="font-mono text-[10px] text-slate-500">{item.cif}</div>
                            </td>
                            <td className="p-2.5 text-slate-800">{item.sourceAccount}</td>
                            <td className="p-2.5 font-sans">
                              <div className="font-semibold text-slate-800">{item.channel}</div>
                              <div className="text-[10px] text-slate-400">{item.trxType}</div>
                            </td>
                            <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                              {formatIDR(item.amount)}
                            </td>
                            <td className="p-2.5 text-slate-600 whitespace-nowrap">{item.timestamp}</td>
                            <td className="p-2.5 text-center">
                              {(() => {
                                const st = normalizeTrxStatus(item.status);
                                return (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                                    st === 'BERHASIL'
                                      ? 'bg-green-100 text-green-800 border-green-300'
                                      : 'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {st}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Popup Footer */}
            <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-sans">
                {tempCheckedTxnIds.length} Transaksi Terpilih
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSearchTxnModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddTransactions}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tambahkan ({tempCheckedTxnIds.length}) Transaksi Terpilih</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* POPUP MODAL: DOCUMENT PREVIEW                             */}
      {/* ========================================================= */}
      {previewDoc && (
        <div 
          id="modal-preview-document-evidence"
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6"
        >
          <div className="bg-white border border-slate-300 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold font-mono text-white truncate max-w-md">
                    DOCUMENT PREVIEW: {previewDoc.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Ukuran: {previewDoc.size} • Format: {previewDoc.type} • Diunggah: {previewDoc.uploadedAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {previewDoc.url && (previewDoc.type === 'JPG' || previewDoc.type === 'JPEG' || previewDoc.type === 'PNG') ? (
                <div className="bg-white p-2 border border-slate-300 rounded-lg shadow-md max-w-full">
                  <img 
                    src={previewDoc.url} 
                    alt={previewDoc.name} 
                    className="max-h-[55vh] object-contain rounded mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-md max-w-lg w-full text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 font-mono">{previewDoc.name}</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Lampiran Dokumen Bukti Penelitian ({previewDoc.type})
                    </p>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs font-mono space-y-1 text-slate-700">
                    <div>• File Name: <strong>{previewDoc.name}</strong></div>
                    <div>• File Size: <strong>{previewDoc.size}</strong></div>
                    <div>• Date Attached: <strong>{previewDoc.uploadedAt}</strong></div>
                    <div>• Security Clearance: <strong className="text-emerald-700">CONFIDENTIAL / RESTRICTED EVIDENCE</strong></div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    Berkas tersimpan aman di direktori terenkripsi dan siap dilampirkan ke laporan investigasi.
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-200 border-t border-slate-300 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
