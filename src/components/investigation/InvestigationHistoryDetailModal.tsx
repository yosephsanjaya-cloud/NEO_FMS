import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Scale, 
  Lock, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  CreditCard, 
  Layers, 
  Hash, 
  ExternalLink,
  ChevronRight,
  Info,
  KeyRound
} from 'lucide-react';
import { InvestigationHistoryItem, ViolatedRuleItem } from '../../types/fms';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, cn } from '../../lib/utils';
import { RuleTransactionDrilldownModal } from './RuleTransactionDrilldownModal';
import { formatTaxonomyLabel } from '../../lib/taxonomyHelper';

interface Props {
  item: InvestigationHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvestigationHistoryDetailModal: React.FC<Props> = ({ item, isOpen, onClose }) => {
  const { updateInvestigationHistoryItem } = useFMS();
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRuleForDrilldown, setSelectedRuleForDrilldown] = useState<ViolatedRuleItem | null>(null);

  if (!isOpen || !item) return null;

  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !item) return;
    const file = e.target.files[0];
    const newFile = {
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: user?.username || 'CurrentUser',
      uploadedRole: user?.role || 'user',
      timestamp: new Date().toLocaleString('id-ID')
    };
    const updatedItem = {
      ...item,
      postClosureAttachments: [...(item.postClosureAttachments || []), newFile]
    };
    updateInvestigationHistoryItem(updatedItem);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!item) return;
    const updatedItem = {
      ...item,
      postClosureAttachments: (item.postClosureAttachments || []).filter(f => f.id !== fileId)
    };
    updateInvestigationHistoryItem(updatedItem);
  };
const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrintPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 400);
  };

  const isConfirmed = item.closingStatus === 'CLOSED - CONFIRMED FRAUD' || item.closingStatus === 'CLOSED - CONFIRMED AML';
  const isFraud = item.domain === 'Fraud';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        id="audit-snapshot-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* =========================================================================
            1. TOP HEADER & IDENTITY BAR WITH EXPLICIT CASE ID
           ========================================================================= */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0",
              isFraud ? "bg-red-600 text-white" : "bg-amber-600 text-white"
            )}>
              {isFraud ? <ShieldAlert className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {/* EXPLICIT CASE ID BADGE WITH ONE-CLICK COPY */}
                <div className="flex items-center gap-1.5 bg-slate-800/90 text-slate-200 px-2.5 py-0.5 rounded border border-slate-700 font-mono text-xs font-bold shadow-2xs">
                  <span className="text-slate-400 font-medium text-[11px]">CASE ID:</span>
                  <span className="text-white tracking-wide">{item.caseId}</span>
                  <button 
                    onClick={() => copyToClipboard(item.caseId, 'caseIdHeader')}
                    className="text-slate-400 hover:text-white ml-0.5 p-0.5 transition cursor-pointer"
                    title="Salin Case ID"
                  >
                    {copiedField === 'caseIdHeader' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono",
                  isFraud ? "bg-red-950 text-red-300 border border-red-800" : "bg-amber-950 text-amber-300 border border-amber-800"
                )}>
                  {isFraud ? '🛡️ Fraud Audit Snapshot' : '⚖️ AML Audit Snapshot'}
                </span>
                <span className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full font-bold",
                  isConfirmed 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                )}>
                  {item.closingStatus}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>{item.ticketTitle}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-print-audit-snapshot-header"
              onClick={handlePrintPDF}
              disabled={isExporting}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Preparing Print...' : 'Cetak PDF'}</span>
            </button>
            <button
              id="btn-close-audit-snapshot-top"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. IMMUTABLE NOTICE BANNER (SPEC MANDATE A)
           ========================================================================= */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-start space-x-3 text-emerald-900 shrink-0">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-emerald-800">STATUS INFORMASI: READ-ONLY AUDIT SNAPSHOT.</span>{' '}
            Data ini diambil langsung saat proses penutupan (Close) kasus disetujui L2 Reviewer. Seluruh formula penilaian risiko bersifat permanen (Immutable) dan tidak dapat dimodifikasi kembali.
            <div className="mt-1 flex items-center gap-3 text-[11px] text-emerald-700 font-mono">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Audit Hash: {item.auditHash.substring(0, 32)}...</span>
              </span>
              <span>•</span>
              <span>Waktu Approval L2: {item.closedAt} WIB</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. MAIN TWO-COLUMN BODY CONTENT
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ===================================================================
                LEFT COLUMN SECTION (7 COLS)
               =================================================================== */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CARD 1: INFORMASI UTAMA KASUS & ATURAN TERLANGGAR */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">Informasi Utama Kasus</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Prioritas: <span className="font-bold text-slate-800">{item.slaLevel}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* EXPLICIT HIGHLIGHTED CASE ID / TICKET NUMBER FIELD */}
                  <div className="sm:col-span-2 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 p-3 rounded-lg border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-blue-700 font-bold block text-[11px] uppercase tracking-wider">
                        CASE ID / TICKET NUMBER
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-base font-extrabold text-blue-950">
                          {item.caseId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-200/80 text-blue-900 rounded font-bold">
                          Immutable Identifier
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.caseId, 'caseIdMain')}
                      className="px-3 py-1.5 bg-white hover:bg-blue-100/70 text-blue-800 rounded-md border border-blue-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      title="Salin Case ID"
                    >
                      {copiedField === 'caseIdMain' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-blue-600" />
                          <span>Salin ID</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Deskripsi & Indikasi Kasus */}
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px] mb-1.5 font-bold uppercase tracking-wider">Deskripsi &amp; Indikasi Kasus</span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {item.ruleBasicCode && item.ruleBasicCode !== 'MANUAL' && item.ruleBasicCode !== 'System'
                        ? `Rule Terpicu: ${item.ruleBasicName || item.ruleBasicCode} - ${item.incidentDescription || item.ticketTitle || 'Tidak ada deskripsi'}`
                        : (item.ticketTitle && item.incidentDescription ? `${item.ticketTitle} - ${item.incidentDescription}` : (item.ticketTitle || item.incidentDescription || 'Tidak ada deskripsi'))}
                    </p>
                  </div>

                  {/* Nama Nasabah */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Nama Nasabah (Subjek)</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-bold text-slate-900">{item.customerName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-medium">
                        {item.customerType}
                      </span>
                    </div>
                  </div>

                  {/* CIF Nasabah */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Nomor CIF Nasabah</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-blue-700">{item.cif}</span>
                      <button 
                        onClick={() => copyToClipboard(item.cif, 'cif')}
                        className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                        title="Copy CIF"
                      >
                        {copiedField === 'cif' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Rekening */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Nomor Rekening / Source</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-800">{item.accountNumber}</span>
                      <button 
                        onClick={() => copyToClipboard(item.accountNumber, 'acc')}
                        className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                        title="Copy Rekening"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Kerugian Terlibat */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Kerugian Terlibat (Rp)</span>
                    <span className="font-mono font-bold text-red-600 text-sm">
                      {formatRupiah(item.lossAmountIdr)}
                    </span>
                  </div>

                  {/* =========================================================================
                      FOCUSED ATURAN TERLANGGAR (MULTI-RULE VIOLATIONS) WITH CLICKABLE DRILLDOWN
                     ========================================================================= */}
                  <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-800 font-bold text-xs">
                          {item.violatedRules && item.violatedRules.length > 1 
                            ? `Aturan Terlanggar (${item.violatedRules.length} Multi-Rule Violations)` 
                            : 'Rule Basic Violated'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.violatedRules && item.violatedRules.length > 1 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-full">
                            Multi-Rule Triggered
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium italic">
                          (Klik kode rule untuk lihat transaksi)
                        </span>
                      </div>
                    </div>

                    {item.violatedRules && item.violatedRules.length > 0 ? (
                      <div className="space-y-3">
                        {item.violatedRules.map((rule, idx) => {
                          const specificRuleCaseId = rule.ruleCaseId || `${item.caseId}-${rule.ruleCode}`;
                          const txCount = rule.transactions?.length || rule.hitCount;

                          return (
                            <div 
                              key={`${rule.ruleCode}-${idx}`} 
                              className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-300 transition space-y-2.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* CLICKABLE RULE CODE BADGE TRIGGER FOR SECONDARY MODAL */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRuleForDrilldown(rule)}
                                    className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 hover:text-blue-900 border border-blue-300 rounded font-bold shadow-2xs transition cursor-pointer group"
                                    title="Klik untuk membuka rincian transaksi pemicu rule ini"
                                  >
                                    <span>{rule.ruleCode}</span>
                                    <ExternalLink className="w-3 h-3 text-blue-500 group-hover:text-blue-700 transition shrink-0" />
                                  </button>

                                  <span className="font-semibold text-slate-900 text-xs">
                                    {rule.ruleName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 ml-auto">
                                  <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase",
                                    rule.severity === 'HIGH' ? "bg-red-100 text-red-800 border border-red-200" :
                                    rule.severity === 'MEDIUM' ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                    "bg-blue-100 text-blue-800 border border-blue-200"
                                  )}>
                                    {rule.severity} SEVERITY
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded">
                                    Hit: {rule.hitCount}x
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                                    +{rule.pointsAdded} pts
                                  </span>
                                </div>
                              </div>

                              {/* Rule Case ID Identifier */}
                              <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded border border-slate-100 text-[11px] font-mono">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <span className="text-slate-400 font-sans text-[10px]">Rule Case ID:</span>
                                  <span className="font-bold text-slate-800">{specificRuleCaseId}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(specificRuleCaseId, `rcid-${idx}`)}
                                  className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                                  title="Salin Rule Case ID"
                                >
                                  {copiedField === `rcid-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>

                              {rule.triggerCondition && (
                                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1.5">
                                  <span className="font-semibold text-slate-800 shrink-0">Trigger:</span>
                                  <span>{rule.triggerCondition}</span>
                                </div>
                              )}

                              {/* Click trigger shortcut strip */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-mono text-[10px]">
                                  {txCount} transaksi tercatat
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedRuleForDrilldown(rule)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 transition cursor-pointer group"
                                >
                                  <span>Lihat Transaksi Pemicu</span>
                                  <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedRuleForDrilldown({
                                ruleCaseId: `${item.caseId}-${item.ruleBasicCode}`,
                                ruleCode: item.ruleBasicCode,
                                ruleName: item.ruleBasicName,
                                severity: (item.slaLevel.includes('Critical') || item.riskScoreSnapshot >= 80) ? 'HIGH' : item.riskScoreSnapshot >= 50 ? 'MEDIUM' : 'LOW',
                                hitCount: item.anomalyTransactions?.length || 1,
                                pointsAdded: item.formulaResultTotal || item.riskScoreSnapshot,
                                triggerCondition: item.incidentDescription,
                                transactions: item.anomalyTransactions || []
                              })}
                              className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold shadow-2xs transition cursor-pointer group"
                              title="Klik untuk membuka rincian transaksi pemicu rule ini"
                            >
                              <span>{item.ruleBasicCode}</span>
                              <ExternalLink className="w-3 h-3 text-blue-500 group-hover:text-blue-700 transition shrink-0" />
                            </button>
                            <span className="font-semibold text-slate-800 text-xs">
                              {item.ruleBasicName}
                            </span>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                            +{item.formulaResultTotal || item.riskScoreSnapshot} pts
                          </span>
                        </div>

                        

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono text-[10px]">
                            {item.anomalyTransactions?.length || 1} transaksi tercatat
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedRuleForDrilldown({
                              ruleCaseId: `${item.caseId}-${item.ruleBasicCode}`,
                              ruleCode: item.ruleBasicCode,
                              ruleName: item.ruleBasicName,
                              severity: (item.slaLevel.includes('Critical') || item.riskScoreSnapshot >= 80) ? 'HIGH' : item.riskScoreSnapshot >= 50 ? 'MEDIUM' : 'LOW',
                              hitCount: item.anomalyTransactions?.length || 1,
                              pointsAdded: item.formulaResultTotal || item.riskScoreSnapshot,
                              triggerCondition: item.incidentDescription,
                              transactions: item.anomalyTransactions || []
                            })}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 transition cursor-pointer group"
                          >
                            <span>Lihat Transaksi Pemicu</span>
                            <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  

                  {/* Unit Pelapor & Cabang */}
                  <div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Unit Pelapor</span>
                    <span className="font-medium text-slate-800">{item.reportingUnit}</span>
                  </div>

                  
                </div>
              </div>

              {/* CARD: HASIL TINDAK LANJUT & CATATAN PERSETUJUAN AUDIT */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">Hasil Tindak Lanjut &amp; Catatan Persetujuan Audit</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold font-mono uppercase">
                    Audit Follow-Up Snapshot
                  </span>
                </div>

                <div className="space-y-4">
                  {/* 1. Keputusan Akhir Kasus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Reviewer Result (L1)
                      </span>
                      <div className="font-semibold text-slate-900 font-mono">
                        {formatTaxonomyLabel(item.reviewerResult || item.l1Maker.recommendation, item.domain)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Final Result (Keputusan Akhir)
                      </span>
                      <div className="font-semibold text-blue-900 font-mono">
                        {formatTaxonomyLabel(item.finalResult || item.closingStatus, item.domain)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Closing Action
                      </span>
                      <div className="font-semibold text-purple-900 font-mono">
                        {formatTaxonomyLabel(item.closingAction || 'Close and Archive', item.domain)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        {item.domain === 'AML' ? 'Tipe Aktivitas AML' : 'Tipe Fraud Terindikasi'}
                      </span>
                      <div className="font-semibold text-amber-900 font-mono">
                        {formatTaxonomyLabel(item.typeOfFraud || item.typeOfAml || (item.domain === 'Fraud' ? 'FR-TOF-001 - Account Take Over (ATO)' : 'AM-TOF-001 - Structuring (Smurfing)'), item.domain)}
                      </div>
                    </div>
                  </div>

                  {/* 2. Catatan Dual Control (Maker-Checker) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* L1 Maker Card */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        L1 Maker
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Investigator In Charge
                      </span>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.l1Maker.name}</div>
                          <div className="font-mono text-[10px] text-blue-700 font-semibold">Role: {item.domain === 'Fraud' ? 'afcl1' : 'analystl1'}</div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 text-right">
                          <Clock className="w-3 h-3 inline mr-1"/>
                          {item.l1Maker.actionTime}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100 mt-2">
                        "{item.reviewerComment || item.l1Maker.notes || 'Hasil investigasi dan rekomendasi tindakan lanjut telah diselesaikan sesuai SOP.'}"
                      </p>
                    </div>

                    {/* L2 Checker Card */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        L2 Reviewer
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                        Approver / Reviewer
                      </span>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.l2Checker.name}</div>
                          <div className="font-mono text-[10px] text-emerald-700 font-semibold">Role: {item.domain === 'Fraud' ? 'afcl2' : 'analystl2'}</div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 text-right">
                          <Clock className="w-3 h-3 inline mr-1"/>
                          {item.l2Checker.actionTime}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100 text-[11px] mb-2 font-bold text-emerald-700">
                        Keputusan Final L2: {item.l2Checker.decision || 'Approve'}
                      </div>
                      <p className="text-[11px] text-emerald-900 italic bg-white p-2 rounded border border-emerald-100">
                        "{item.approverComment || item.l2Checker.notes || 'Penyelesaian kasus disetujui. Kasus resmi ditutup.'}"
                      </p>
                    </div>
                  </div>

                  {/* 3. Post-Closure Analysis Attachment Zone */}
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-sm text-slate-900">Dokumen &amp; Laporan Hasil Analisis Akhir (Post-Closure Evidence)</h4>
                      </div>
                      <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                        <span>+ Upload Laporan Analisis</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-slate-600">Nama Berkas</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Ukuran File</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Diupload Oleh</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Waktu Upload</th>
                            <th className="px-4 py-2 font-semibold text-slate-600 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!item.postClosureAttachments || item.postClosureAttachments.length === 0) ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                                Belum ada dokumen lampiran post-closure.
                              </td>
                            </tr>
                          ) : (
                            item.postClosureAttachments.map(file => (
                              <tr key={file.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-4 py-2.5 font-medium text-slate-800 flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                                  {file.fileName}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-slate-500">{(file.fileSize / 1024).toFixed(1)} KB</td>
                                <td className="px-4 py-2.5">
                                  <div className="font-semibold text-slate-800">{file.uploadedBy}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{file.uploadedRole}</div>
                                </td>
                                <td className="px-4 py-2.5 font-mono text-slate-500">{file.timestamp}</td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button type="button" className="text-blue-600 hover:text-blue-800 text-[10px] font-bold px-2 py-1 bg-blue-50 rounded border border-blue-100 transition">Preview</button>
                                    <button type="button" className="text-slate-600 hover:text-slate-800 text-[10px] font-bold px-2 py-1 bg-slate-50 rounded border border-slate-200 transition">Download</button>
                                    <button type="button" onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-800 text-[10px] font-bold px-2 py-1 bg-red-50 rounded border border-red-100 transition">Hapus</button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

                        </div>

            {/* ===================================================================
                RIGHT COLUMN SECTION (5 COLS)
               =================================================================== */}
            <div className="lg:col-span-5 space-y-6">

              {/* CARD 1: FORMULA RISK PROFILE SNAPSHOT (SPEC MANDATE C1) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <h3 className="font-bold text-sm text-slate-900">Formula Risk Profile</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 uppercase font-mono tracking-wider">
                    RISK SNAPSHOT
                  </span>
                </div>

                {/* Big Score Display */}
                <div className="bg-radial from-red-50 to-rose-50/40 rounded-xl p-4 border border-red-100 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                      Final Risk Score Snapshot
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-extrabold text-slate-900 font-mono">
                        {item.riskScoreSnapshot}
                      </span>
                      <span className="text-sm font-semibold text-slate-400 font-mono">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider",
                      item.riskLevelSnapshot === 'High' ? "bg-red-600 text-white shadow-sm" :
                      item.riskLevelSnapshot === 'Med' ? "bg-amber-500 text-white shadow-sm" :
                      "bg-emerald-600 text-white shadow-sm"
                    )}>
                      LEVEL: {item.riskLevelSnapshot}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                      Immutable at Close
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="space-y-2 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50 mb-3">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600 font-medium">Base Parameter Score:</span>
                    <span className="font-mono font-bold text-slate-900">{item.baseScoreSnapshot}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600 font-medium">Repeated Offender Adjustment:</span>
                    <span className="font-mono font-bold text-slate-900">
                      +{item.repeatedOffenderAdjustment}
                    </span>
                  </div>

                  {item.formulaAdjustments.map((fa) => (
                    <div key={fa.code} className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600 pr-2">
                        Formula Risk ({fa.code}):
                      </span>
                      <span className="font-mono font-bold text-red-600 shrink-0">
                        +{fa.points}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-1.5 font-bold text-slate-900 text-sm">
                    <span>Total Formula Result:</span>
                    <span className="font-mono text-red-700">{item.formulaResultTotal} / 100</span>
                  </div>
                </div>

                {/* Matched Attributes */}
                {item.formulaAdjustments.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Matched Indicators at Snapshot:
                    </span>
                    {item.formulaAdjustments.map((fa) => (
                      <div key={fa.code} className="p-2 rounded bg-red-50/60 border border-red-100 text-[11px]">
                        <div className="font-semibold text-red-900">{fa.name}</div>
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                          Field: <span className="font-bold text-slate-700">{fa.matchedField}</span> = "{fa.matchedValue}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formula Footer Text */}
                <div className="text-[11px] text-slate-500 bg-slate-100 p-2 rounded text-center font-mono border border-slate-200">
                  Formula: Final Risk Score = Base Score + Repeated Offender Adjustment (Max 100)
                </div>
              </div>

              

            </div>

          </div>
        </div>

        {/* =========================================================================
            4. BOTTOM ACTIONS (SPEC MANDATE D)
           ========================================================================= */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Digital Snapshot ID: {item.id}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-close-audit-snapshot-bottom"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Tutup Arsip
            </button>

            <button
              id="btn-export-pdf-audit-snapshot-bottom"
              type="button"
              onClick={handlePrintPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : '📥 Export PDF Audit Snapshot'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. SECONDARY POP-UP DRILLDOWN: RULE TRANSACTION DRILLDOWN MODAL
         ========================================================================= */}
      <RuleTransactionDrilldownModal
        isOpen={Boolean(selectedRuleForDrilldown)}
        onClose={() => setSelectedRuleForDrilldown(null)}
        rule={selectedRuleForDrilldown}
        caseInfo={{
          caseId: item.caseId,
          ticketTitle: item.ticketTitle,
          customerName: item.customerName,
          cif: item.cif,
          accountNumber: item.accountNumber,
          domain: item.domain
        }}
        fallbackTransactions={item.anomalyTransactions || []}
      />
    </div>
  );
};

