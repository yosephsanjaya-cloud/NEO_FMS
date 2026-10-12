import React from 'react';
import { 
  X, 
  Layers, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink,
  Info,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { ViolatedRuleItem, HistoryAnomalyTransaction } from '../../types/fms';
import { formatRupiah, cn } from '../../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rule: ViolatedRuleItem | null;
  caseInfo: {
    caseId: string;
    ticketTitle: string;
    customerName: string;
    cif: string;
    accountNumber: string;
    domain: string;
  } | null;
  fallbackTransactions?: HistoryAnomalyTransaction[];
}

export const RuleTransactionDrilldownModal: React.FC<Props> = ({
  isOpen,
  onClose,
  rule,
  caseInfo,
  fallbackTransactions = []
}) => {
  if (!isOpen || !rule || !caseInfo) return null;

  // Defensive check for transactions: prioritize rule-specific transactions, fallback gracefully
  const rawTransactions = rule.transactions || [];
  const transactions: HistoryAnomalyTransaction[] = rawTransactions.length > 0 
    ? rawTransactions 
    : (fallbackTransactions || []);

  const totalAmount = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const specificRuleCaseId = rule.ruleCaseId || `${caseInfo.caseId}-${rule.ruleCode}`;

  return (
    <div 
      id="rule-transaction-drilldown-modal-backdrop"
      className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div 
        id="rule-transaction-drilldown-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* =========================================================================
            HEADER
           ========================================================================= */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-start justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 text-white flex items-center justify-center shadow-inner shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded font-bold">
                  {rule.ruleCode}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded font-bold">
                  Rule Case ID: {specificRuleCaseId}
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase",
                  rule.severity === 'HIGH' ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                  rule.severity === 'MEDIUM' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                )}>
                  {rule.severity} SEVERITY
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  Hit: {rule.hitCount}x
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-900/60 text-purple-200 border border-purple-700/50 rounded">
                  +{rule.pointsAdded} pts
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Rincian Transaksi Pemicu Rule: <span className="text-blue-300">{rule.ruleCode}</span> - {rule.ruleName}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-300 font-mono">
                <span>Group/CIF Case ID: <strong className="text-white">{caseInfo.caseId}</strong></span>
                <span>•</span>
                <span>CIF: <strong className="text-blue-300">{caseInfo.cif}</strong> ({caseInfo.customerName})</span>
                <span>•</span>
                <span>Rek: <strong className="text-slate-200">{caseInfo.accountNumber}</strong></span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-rule-drilldown-top"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Tutup Drilldown"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================================
            TRIGGER CONDITION BANNER
           ========================================================================= */}
        {rule.triggerCondition && (
          <div className="bg-blue-50/90 border-b border-blue-200 px-6 py-2.5 flex items-start space-x-3 text-blue-950 shrink-0">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-blue-900">Kondisi Parameter Pemicu (Trigger Condition):</span>{' '}
              <span className="text-blue-800 font-medium">{rule.triggerCondition}</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            TRANSACTION TABLE CONTENT
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Daftar Transaksi Anomali Spesifik ({transactions.length} Transaksi Terpicu)
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-600">
                Total Nominal Terpicu:{' '}
                <span className="font-bold text-red-600 text-sm">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" id="rule-anomaly-transactions-table">
                <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5 text-center w-12">No</th>
                    <th className="px-3.5 py-2.5">Transaction ID</th>
                    <th className="px-3.5 py-2.5">Waktu &amp; Tanggal</th>
                    <th className="px-3.5 py-2.5">Channel</th>
                    <th className="px-3.5 py-2.5 text-right">Nominal (Rp)</th>
                    <th className="px-3.5 py-2.5">Nomor Rekening</th>
                    <th className="px-3.5 py-2.5">Rekening Tujuan</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {transactions.length > 0 ? (
                    transactions.map((tx, idx) => (
                      <tr key={tx.trxId || idx} className="hover:bg-blue-50/40 transition">
                        {/* 1. No */}
                        <td className="px-3.5 py-2.5 text-center font-mono text-slate-400 font-semibold">
                          {tx.no || (idx + 1)}
                        </td>

                        {/* 2. Transaction ID */}
                        <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                          {tx.trxId}
                          {tx.trxType && (
                            <span className="block text-[10px] font-sans font-normal text-slate-500">
                              {tx.trxType}
                            </span>
                          )}
                        </td>

                        {/* 3. Waktu & Tanggal */}
                        <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{tx.timestamp} WIB</span>
                          </div>
                        </td>

                        {/* 4. Channel */}
                        <td className="px-3.5 py-2.5 text-slate-700 font-medium whitespace-nowrap">
                          {tx.channel}
                        </td>

                        {/* 5. Nominal */}
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatRupiah(tx.amount)}
                        </td>

                        {/* 6. Nomor Rekening */}
                        <td className="px-3.5 py-2.5 font-mono text-slate-800 text-xs whitespace-nowrap">
                          {tx.sourceAccount || caseInfo.accountNumber}
                        </td>

                        {/* 7. Rekening Tujuan */}
                        <td className="px-3.5 py-2.5 text-slate-700">
                          {tx.destinationAccount ? (
                            <div>
                              <span className="font-mono font-semibold text-slate-900 block">
                                {tx.destinationAccount}
                              </span>
                              {tx.destinationBank && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span>{tx.destinationBank}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">N/A (Cash In / Structuring)</span>
                          )}
                        </td>

                        {/* 8. Status */}
                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                          <span className={cn(
                            "px-2.5 py-1 rounded text-[10px] font-bold font-mono inline-block shadow-2xs",
                            (tx.statusFlag === 'SUCCESS' || tx.statusFlag === 'BERHASIL' || !tx.statusFlag) && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                            (tx.statusFlag === 'FAILED' || tx.statusFlag === 'GAGAL') && "bg-red-100 text-red-800 border border-red-200",
                            (tx.statusFlag === 'BLOCKED' || tx.statusFlag === 'DIBLOKIR') && "bg-rose-100 text-rose-800 border border-rose-200",
                            (tx.statusFlag === 'PENDING') && "bg-amber-100 text-amber-800 border border-amber-200"
                          )}>
                            {tx.statusFlag === 'FAILED' ? 'GAGAL' :
                             tx.statusFlag === 'BLOCKED' ? 'DIBLOKIR' :
                             tx.statusFlag === 'PENDING' ? 'PENDING' : 'BERHASIL'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-70" />
                        <p className="font-semibold text-slate-700">Tidak ada transaksi individual spesifik.</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Seluruh parameter rule dinilai berdasarkan agregat profil anomali CIF pada sistem.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =========================================================================
            FOOTER ACTIONS
           ========================================================================= */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Secondary Drilldown Snapshot Active</span>
          </div>

          <button
            id="btn-close-rule-drilldown-bottom"
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};
