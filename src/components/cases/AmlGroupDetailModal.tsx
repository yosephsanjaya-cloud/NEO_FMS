import React, { useState } from 'react';
import { 
  X, 
  Users, 
  CreditCard,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  FileText,
  Layers,
  Send,
  Paperclip,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { UrgencyBadge, AlertStatusBadge } from '../common/Badge';
import { formatIDR } from '../../lib/utils';

export const AmlGroupDetailModal: React.FC = () => {
  const { 
    selectedAmlGroupForDetail, 
    setSelectedAmlGroupForDetail,
    handleOpenFollowUp,
    handleOpenDetail
  } = useFMS();

  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  if (!selectedAmlGroupForDetail) return null;
  const g = selectedAmlGroupForDetail;

  const handleToggleSelectAll = () => {
    if (selectedCaseIds.length === g.cases.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(g.cases.map(c => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-7xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[95vh]">
        
        {/* Header - Ringkasan Profil Nasabah (Overall Risk Exposure) */}
        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black tracking-tight uppercase">
                  {g?.customerName ?? 'Unknown Customer'}
                </h3>
                <span className="px-2 py-0.5 bg-blue-800 text-blue-200 rounded text-[10px] font-mono font-bold border border-blue-700">
                  CIF: {g?.cif ?? 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                   <CreditCard className="w-4 h-4" />
                   <span>Rekening Utama: <span className="text-white font-mono">{g?.cases?.[0]?.transaction?.sourceAccount ?? 'N/A'}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="text-slate-500">Highest Risk Score:</span>
                   <span className={`font-black ${g?.maxRiskScore >= 70 ? 'text-red-400' : 'text-amber-400'}`}>
                     {g?.maxRiskScore ?? 0} Pts
                   </span>
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="text-slate-500">Overall Risk Level:</span>
                   <UrgencyBadge urgency={g?.maxRiskLevel ?? 'Low'} />
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setSelectedAmlGroupForDetail(null)}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Modal Body - Detailed List of Transaction Alerts & Violations */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Section: List Transaction Alert & Violations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-black text-[14px] text-slate-900 uppercase flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>List Transaction Alert & Violations</span>
                </h4>
                <p className="text-xs text-slate-500">Daftar transaksi yang memicu rule AML beserta rincian pelanggaran dan formula risk.</p>
              </div>
              
              <div className="flex items-center gap-3">
                 {selectedCaseIds.length > 0 && (
                   <button 
                    onClick={() => setSelectedCaseIds([])}
                    className="px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-50 transition"
                   >
                     <RotateCcw className="w-3 h-3" />
                     Batalkan Seleksi ({selectedCaseIds.length})
                   </button>
                 )}
              </div>
            </div>

            <div className="space-y-4">
              {(g?.cases ?? []).map((c, idx) => {
                const isSelected = selectedCaseIds.includes(c.id);
                return (
                  <div 
                    key={c?.id ?? idx} 
                    className={`bg-white border rounded-xl overflow-hidden transition shadow-sm ${
                      isSelected ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Item Header (Rule & Summary) */}
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(c.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-[13px]">{c?.ruleName ?? 'Unknown Rule'}</span>
                              <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[9px] font-bold font-mono">
                                {c?.ruleBasicCode ?? 'N/A'}
                              </span>
                           </div>
                           <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-medium">ID Case: <span className="text-slate-700 font-mono font-bold">{c?.caseId ?? 'N/A'}</span></span>
                              <span className="text-[10px] text-slate-400 font-medium">Identified: <span className="text-slate-700">{c?.identifiedOn ?? 'N/A'}</span></span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                           <div className="text-[10px] text-slate-400 uppercase font-black">Base Score</div>
                           <div className="text-sm font-black text-slate-900">{c?.baseScore ?? 0} Pts</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-1" />
                        <div className="text-right">
                           <div className="text-[10px] text-slate-400 uppercase font-black">Risk Score</div>
                           <div className="text-sm font-black text-blue-700">{c?.finalRiskScore ?? 0} Pts</div>
                        </div>
                        <div className="ml-4">
                          <AlertStatusBadge status={c?.alertStatus ?? 'Open'} />
                        </div>
                      </div>
                    </div>

                    {/* Item Content (Transaction Details & Formula Risk) */}
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                       
                       {/* Transaction Details */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-900 font-black text-[11px] uppercase tracking-wider">
                             <CreditCard className="w-4 h-4 text-slate-400" />
                             Detail Transaksi Terkait
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px]">
                             <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-medium uppercase text-[9px]">Transaction ID</span>
                                <span className="text-slate-900 font-mono font-bold truncate">{c?.transaction?.trxId ?? 'N/A'}</span>
                             </div>
                             <div className="flex flex-col gap-1 text-right">
                                <span className="text-slate-400 font-medium uppercase text-[9px]">Timestamp</span>
                                <span className="text-slate-900 font-bold">{c?.transaction?.timestamp ?? 'N/A'}</span>
                             </div>
                             
                             <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-medium uppercase text-[9px]">Nominal (Amount)</span>
                                <span className="text-blue-700 font-black text-[13px]">{formatIDR(c?.transaction?.amount ?? 0)}</span>
                             </div>
                             <div className="flex flex-col gap-1 text-right">
                                <span className="text-slate-400 font-medium uppercase text-[9px]">Tipe Transaksi</span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold ml-auto w-fit">{c?.transaction?.trxType ?? 'Transfer'}</span>
                             </div>

                             <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded border border-slate-100">
                                <span className="text-slate-400 font-medium uppercase text-[9px]">Account Origin</span>
                                <span className="text-slate-900 font-mono font-bold">{c?.transaction?.sourceAccount ?? 'N/A'}</span>
                             </div>
                             <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded border border-slate-100 text-right">
                                <span className="text-slate-400 font-medium uppercase text-[9px]">Destination Account</span>
                                <span className="text-slate-900 font-mono font-bold">{c?.transaction?.destinationAccount ?? 'N/A'}</span>
                             </div>

                             <div className="flex flex-col gap-1 col-span-2">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-3">
                                   <span>Device: <span className="text-slate-600">{c?.transaction?.deviceModel ?? 'Unknown'}</span></span>
                                   <span>IP: <span className="text-slate-600 font-mono">{c?.transaction?.ipAddress ?? '0.0.0.0'}</span></span>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Formula Risk Matches */}
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-900 font-black text-[11px] uppercase tracking-wider">
                             <ShieldAlert className="w-4 h-4 text-amber-500" />
                             Rincian Formula Risk (Dynamic Scoring)
                          </div>

                          <div className="space-y-2">
                             {(c?.formulaMatches ?? []).length === 0 ? (
                               <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-400 text-[10px] italic">
                                  Tidak ada kriteria Formula Risk tambahan yang terdeteksi untuk alert ini.
                               </div>
                             ) : (
                               (c?.formulaMatches ?? []).map((fm, fidx) => (
                                 <div key={fm?.formulaId ?? fidx} className="flex items-start justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                                    <div className="space-y-1">
                                       <div className="font-bold text-slate-900 text-[11px]">{fm?.name ?? 'Unknown Indicator'}</div>
                                       <div className="text-[10px] text-slate-500">
                                          Kriteria: <span className="font-mono text-amber-800">{fm?.matchedField ?? 'N/A'}</span>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="text-[11px] font-black text-amber-700">+{fm?.points ?? 0}</div>
                                       <div className="text-[8px] text-amber-500 uppercase font-black leading-none">Score Impact</div>
                                    </div>
                                 </div>
                               ))
                             )}
                          </div>

                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                             <div className="text-[10px] font-bold text-blue-900">TOTAL FORMULA IMPACT</div>
                             <div className="text-sm font-black text-blue-700">+{c?.formulaRiskPoints ?? 0} Pts</div>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedAmlGroupForDetail(null)}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 font-bold text-[12px] cursor-pointer transition shadow-sm"
            >
              Tutup Modal
            </button>
            <div className="text-xs text-slate-400 font-medium">
              Agregasi mencakup <span className="text-slate-900 font-bold">{g?.totalCases ?? 0} Alerts</span> dari CIF ini.
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedCaseIds.length > 1 ? (
              <button
                onClick={() => setShowBatchModal(true)}
                className="px-8 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-[13px] shadow-lg shadow-red-200 flex items-center gap-2 cursor-pointer transition transform active:scale-95 uppercase tracking-tight"
              >
                <CheckCircle2 className="w-5 h-5" />
                Solve Batching ({selectedCaseIds.length} Cases)
              </button>
            ) : selectedCaseIds.length === 1 ? (
              <button
                onClick={() => {
                  const c = g.cases.find(item => item.id === selectedCaseIds[0]);
                  if (c) handleOpenFollowUp(c);
                }}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[13px] shadow-lg shadow-blue-200 flex items-center gap-2 cursor-pointer transition transform active:scale-95 uppercase tracking-tight"
              >
                Tindak Lanjut Kasus
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 italic bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                Pilih satu atau lebih alert di atas untuk mengeksekusi follow-up.
              </div>
            )}
          </div>
        </div>

      </div>

      {showBatchModal && (
        <AmlBatchSolveModal 
          selectedCaseIds={selectedCaseIds} 
          cif={g.cif}
          onClose={() => setShowBatchModal(false)} 
        />
      )}
    </div>
  );
};

const AmlBatchSolveModal: React.FC<{
  selectedCaseIds: string[];
  cif: string;
  onClose: () => void;
}> = ({ selectedCaseIds, cif, onClose }) => {
  const { handleBatchAction } = useFMS();
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
      <div className="bg-white border-2 border-orange-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">PILIHAN SOLVE BATCHING — FORM EKSEKUSI FOLLOW UP CIF</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Selesaikan <span className="text-red-600 font-bold">{selectedCaseIds.length} case AML</span> pilihan untuk CIF <span className="font-bold text-slate-900">{cif}</span> secara langsung.
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-amber-100 border border-amber-300 rounded text-[9px] font-black text-amber-800 tracking-wider">
            BATCH SOLVER ACTIVE
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-[11px] bg-slate-50/30">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="font-black text-slate-700 uppercase flex items-center gap-1">
                ALERT STATUS BARU <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                <option>SUBMITTED (Lanjut Approval / L1 Done)</option>
                <option>CLOSED (Resolved / No Indication)</option>
                <option>ESCALATED (Need High Level Review)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-slate-700 uppercase flex items-center gap-1">
                REVIEWER / INVESTIGATOR L1
              </label>
              <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-bold font-mono">
                Sysadmin - sysadmin
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-slate-700 uppercase flex items-center gap-1">
                REVIEWER RESULT / HASIL EVALUASI <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                <option>INDICATED_AML (Indikasi Pencucian Uang / Fraud)</option>
                <option>NORMAL_ACTIVITY (Aktivitas Wajar Nasabah)</option>
                <option>SUSPICIOUS (Perlu Pemantauan Lanjutan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-1.5">
              <label className="font-black text-slate-700 uppercase flex items-center gap-1">
                KATEGORI ANOMALI AML <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                <option>Structuring / Smurfing (Transaksi Terpecah)</option>
                <option>U-Turn Transaction (Dana Kembali ke Pengirim)</option>
                <option>Dormant Activation (Rekening Lama Aktif Tiba-tiba)</option>
                <option>High Frequency Small Amount (Pola Transfer Berulang)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-slate-700 uppercase flex items-center gap-1">
                TINDAKAN AKHIR (CLOSING ACTION)
              </label>
              <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                <option>MONITORING (Pemantauan Lanjutan Rekening)</option>
                <option>BLOCK_ACCOUNT (Pemblokiran Rekening Sementara)</option>
                <option>CLOSE_ACCOUNT (Penutupan Hubungan Usaha)</option>
                <option>REPORT_PPATK (Pelaporan STR/LTKM)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-black text-slate-700 uppercase flex items-center gap-1">
                UNGGAH BUKTI / DOKUMEN AML
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Contoh: Bukti_Laporan_CIF_100068..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button className="px-3 py-2 bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-slate-700 transition">
                   <Plus className="w-4 h-4" />
                   Tambah
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-black text-slate-700 uppercase flex items-center gap-1">
              CATATAN EVALUASI / HASIL INVESTIGASI BATCH CIF <span className="text-red-500">*</span>
            </label>
            <textarea 
              rows={4}
              placeholder="Tuliskan catatan hasil analisis indikasi AML untuk seluruh case pada CIF ini..."
              className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
             <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">LAMPIRAN:</span>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] text-slate-600 font-bold">
                <Paperclip className="w-3 h-3 text-slate-400" />
                <span>Laporan_Analisis_Mutasi_AML_CIF.pdf</span>
                <button className="text-red-500 ml-1 hover:text-red-700 font-bold cursor-pointer transition">×</button>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-[11px] uppercase transition cursor-pointer"
          >
            Batal / Tutup
          </button>
          
          <div className="flex gap-3">
             <button className="px-6 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-900 font-black text-[11px] uppercase hover:bg-amber-100 transition cursor-pointer">
                Simpan Draft
             </button>
             <button 
                onClick={() => {
                  handleBatchAction(selectedCaseIds, {
                    alertStatus: 'Close',
                    assignee: 'Sysadmin',
                    disposition: 'True Positive (Fraud)',
                    note: 'AML Batch Solve Executed'
                  });
                  onClose();
                }}
                className="px-8 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white font-black text-[11px] uppercase flex items-center gap-3 shadow-xl shadow-red-100 transition transform active:scale-95 cursor-pointer"
             >
                <Send className="w-4 h-4" />
                Proses Solve Batching ({selectedCaseIds.length} Case)
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

