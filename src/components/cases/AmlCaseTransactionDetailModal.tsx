import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  Search, 
  FileSpreadsheet, 
  Download, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight 
} from 'lucide-react';
import { formatIDR } from '../../lib/utils';

interface AmlCaseTransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: {
    caseId: string;
    cif?: string;
    customerName?: string;
    ruleBasicCode?: string;
    ruleName?: string;
    finalRiskScore?: number;
    transaction?: {
      amount?: number;
      timestamp?: string;
    };
    identifiedOn?: string;
    caseUrgency?: string;
  } | null;
}

export const AmlCaseTransactionDetailModal: React.FC<AmlCaseTransactionDetailModalProps> = ({
  isOpen,
  onClose,
  caseItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CR' | 'DB'>('ALL');

  // Case Metadata Fallbacks matching screenshot
  const caseId = caseItem?.caseId || '46AB2705-9107-4712-8812-110293810293';
  const cif = caseItem?.cif || '100124483';
  const customerName = caseItem?.customerName || 'MUHAMMAD RIDHO';
  const ruleCode = caseItem?.ruleBasicCode || 'B-04';
  const ruleFullCode = `RL_${ruleCode}`;
  const amount = caseItem?.transaction?.amount || 180000000;
  const riskScore = caseItem?.finalRiskScore || 72;
  const priority = caseItem?.caseUrgency || 'Med';
  const identifiedOn = caseItem?.identifiedOn || '2026-07-23 12:00:00.000';

  // Demo Transaction Mutasi List (5 transactions summing up to Inflow: 112.5M & Outflow: 75M)
  const defaultTransactions = [
    {
      no: 1,
      trxId: 'TXN-AML-4483-20260701',
      timestamp: '2026-07-23 12:03:14.123',
      channel: 'SKN/RTGS Transfer',
      sourceAccount: '8800100191',
      destAccount: '1055019201 (Bank Sampoerna)',
      tipe: 'CR' as const,
      amount: 36500000,
      keterangan: 'Inbound Transfer Structuring Part 1/5',
      flagRule: `Trigger ${ruleCode} (Threshold Anomali)`
    },
    {
      no: 2,
      trxId: 'TXN-AML-4483-20260702',
      timestamp: '2026-07-23 12:06:28.246',
      channel: 'M-Banking BI-FAST',
      sourceAccount: '1055019201',
      destAccount: '1020088192 (Bank BCA)',
      tipe: 'DB' as const,
      amount: 37000000,
      keterangan: 'Rapid Outbound Transfer to Linked Account 2',
      flagRule: `Trigger ${ruleCode} (Threshold Anomali)`
    },
    {
      no: 3,
      trxId: 'TXN-AML-4483-20260703',
      timestamp: '2026-07-23 12:09:42.369',
      channel: 'SKN/RTGS Transfer',
      sourceAccount: '8800100391',
      destAccount: '1055019201 (Bank Sampoerna)',
      tipe: 'CR' as const,
      amount: 37500000,
      keterangan: 'Inbound Transfer Structuring Part 3/5',
      flagRule: `Trigger ${ruleCode} (Threshold Anomali)`
    },
    {
      no: 4,
      trxId: 'TXN-AML-4483-20260704',
      timestamp: '2026-07-23 12:12:56.492',
      channel: 'M-Banking BI-FAST',
      sourceAccount: '1055019201',
      destAccount: '1020088194 (Bank BCA)',
      tipe: 'DB' as const,
      amount: 38000000,
      keterangan: 'Rapid Outbound Transfer to Linked Account 4',
      flagRule: `Trigger ${ruleCode} (Threshold Anomali)`
    },
    {
      no: 5,
      trxId: 'TXN-AML-4483-20260705',
      timestamp: '2026-07-23 12:15:10.810',
      channel: 'SKN/RTGS Transfer',
      sourceAccount: '8800100495',
      destAccount: '1055019201 (Bank Sampoerna)',
      tipe: 'CR' as const,
      amount: 38500000,
      keterangan: 'Inbound Transfer Structuring Part 5/5',
      flagRule: `Trigger ${ruleCode} (Threshold Anomali)`
    }
  ];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return defaultTransactions.filter(item => {
      const matchesSearch = 
        item.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.destAccount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'ALL' || item.tipe === filterType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType, defaultTransactions]);

  // Total Inflow & Outflow
  const totalInflow = useMemo(() => {
    return defaultTransactions.filter(t => t.tipe === 'CR').reduce((acc, curr) => acc + curr.amount, 0);
  }, [defaultTransactions]);

  const totalOutflow = useMemo(() => {
    return defaultTransactions.filter(t => t.tipe === 'DB').reduce((acc, curr) => acc + curr.amount, 0);
  }, [defaultTransactions]);

  if (!isOpen || !caseItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-900/20 w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ========================================================= */}
        {/* HEADER MODAL                                              */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-[#1a120b] via-[#241a10] to-[#1a120b] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-800/40 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3a2912] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  RINCIAN TRANSAKSI ANOMALI AML
                </h3>
                <span className="px-2 py-0.5 bg-[#212c3f] border border-slate-700 text-slate-200 text-xs font-mono rounded font-semibold">
                  RULE: {ruleCode}
                </span>
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-mono rounded font-bold uppercase">
                  RULE CODE: {ruleFullCode}
                </span>
              </div>
              <div className="text-xs font-mono mt-1">
                <span className="text-slate-400">Alert Case ID: </span>
                <span className="text-amber-400 font-bold">{caseId}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODAL BODY CONTENT                                        */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/70 text-xs flex-1">

          {/* ROW 1: 5 INFO CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Card 1: CUSTOMER / CIF */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                CUSTOMER / CIF
              </div>
              <div className="font-black text-slate-900 text-xs uppercase truncate">
                {customerName}
              </div>
              <div className="font-mono text-amber-800 font-bold text-[11px]">
                CIF: {cif}
              </div>
            </div>

            {/* Card 2: REKENING NASABAH */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                REKENING NASABAH
              </div>
              <div className="font-mono font-bold text-slate-900 text-xs">
                1055019201
              </div>
              <div className="font-mono text-slate-500 text-[11px]">
                ID: CUST-MRD-882
              </div>
            </div>

            {/* Card 3: RULE TEMPLATE & BASIC */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                RULE TEMPLATE & BASIC
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-mono text-[10px] font-bold">
                  {ruleCode}
                </span>
                <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded font-mono text-[10px] font-bold">
                  {ruleFullCode}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Rule yang Dilanggar
              </div>
            </div>

            {/* Card 4: NOMINAL CASE / FRAUD SCORE (YELLOW HIGHLIGHT) */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">
                NOMINAL CASE / FRAUD SCORE
              </div>
              <div className="font-mono font-bold text-red-600 text-xs sm:text-sm">
                {formatIDR(amount)}
              </div>
              <div className="font-mono text-slate-700 text-[11px]">
                Score: <strong className="text-slate-900">{riskScore}</strong> ({priority} Priority)
              </div>
            </div>

            {/* Card 5: WAKTU TERIDENTIFIKASI */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                WAKTU TERIDENTIFIKASI
              </div>
              <div className="font-mono font-bold text-slate-900 text-[11px] truncate">
                {identifiedOn}
              </div>
              <div className="text-[11px] text-slate-500">
                Identified On (Timestamp)
              </div>
            </div>
          </div>

          {/* ROW 2: 3 SUMMARY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  TOTAL TRANSAKSI CASE
                </div>
                <div className="font-mono font-extrabold text-slate-900 text-lg mt-0.5">
                  {defaultTransactions.length} Mutasi
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  TOTAL INFLOW (CR)
                </div>
                <div className="font-mono font-extrabold text-emerald-600 text-lg mt-0.5">
                  {formatIDR(totalInflow)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wide">
                  TOTAL OUTFLOW (DB)
                </div>
                <div className="font-mono font-extrabold text-red-600 text-lg mt-0.5">
                  {formatIDR(totalOutflow)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-red-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ROW 3: SEARCH, FILTER, EXPORT BAR */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Txn ID, Rekening, Bank, Narasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                />
              </div>

              {/* Tipe Dropdown */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'ALL' | 'CR' | 'DB')}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="ALL">Semua Tipe (CR &amp; DB)</option>
                <option value="CR">Inflow Only (CR)</option>
                <option value="DB">Outflow Only (DB)</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => alert('Exporting Excel...')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>
              
              <button
                type="button"
                onClick={() => alert('Exporting CSV...')}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* ROW 4: TRANSACTION TABLE */}
          <div className="overflow-hidden border border-slate-300 rounded-xl shadow-2xs bg-white">
            <div className="overflow-x-auto max-h-[360px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0b1324] text-white text-[11px] font-mono tracking-wider uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 text-center w-10 border-r border-slate-800">NO</th>
                    <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">TRANSACTION ID</th>
                    <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">DATE &amp; TIME (TIMESTAMP)</th>
                    <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">CHANNEL / LAYANAN</th>
                    <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">REKENING ASAL / VA</th>
                    <th className="p-2.5 border-r border-slate-800 whitespace-nowrap">REKENING TUJUAN / BANK</th>
                    <th className="p-2.5 border-r border-slate-800 text-center whitespace-nowrap">TIPE</th>
                    <th className="p-2.5 border-r border-slate-800 text-right whitespace-nowrap">NOMINAL (RP)</th>
                    <th className="p-2.5 whitespace-nowrap">KETERANGAN / FLAG RULE</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-amber-100/50 text-[11px] font-mono">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((trx, idx) => (
                      <tr 
                        key={trx.trxId} 
                        className={`transition ${idx % 2 === 1 ? 'bg-amber-50/30' : 'bg-white'} hover:bg-amber-100/40`}
                      >
                        <td className="p-2.5 text-center border-r border-slate-200 font-sans text-slate-500">
                          {trx.no}
                        </td>
                        
                        <td className="p-2.5 border-r border-slate-200 font-bold text-amber-900 whitespace-nowrap">
                          {trx.trxId}
                        </td>

                        <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                          {trx.timestamp}
                        </td>

                        <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-slate-800 whitespace-nowrap">
                          {trx.channel}
                        </td>

                        <td className="p-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                          {trx.sourceAccount}
                        </td>

                        <td className="p-2.5 border-r border-slate-200 font-sans text-slate-800 whitespace-nowrap">
                          {trx.destAccount}
                        </td>

                        <td className="p-2.5 border-r border-slate-200 text-center whitespace-nowrap font-sans">
                          {trx.tipe === 'CR' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                              CR
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px]">
                              DB
                            </span>
                          )}
                        </td>

                        <td className="p-2.5 border-r border-slate-200 text-right font-bold whitespace-nowrap">
                          {trx.tipe === 'CR' ? (
                            <span className="text-emerald-600">+ {formatIDR(trx.amount)}</span>
                          ) : (
                            <span className="text-red-600">- {formatIDR(trx.amount)}</span>
                          )}
                        </td>

                        <td className="p-2.5 font-sans space-y-0.5">
                          <div className="font-semibold text-slate-800">
                            {trx.keterangan}
                          </div>
                          <div>
                            <span className="px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] rounded font-mono font-medium inline-block">
                              {trx.flagRule}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 font-sans italic">
                        Tidak ada transaksi yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
