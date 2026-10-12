import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Receipt, 
  Eye, 
  RotateCcw, 
  Download, 
  Info,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  CreditCard,
  Building2
} from 'lucide-react';
import { TransactionHistoryRecord } from '../../types/fms';
import { INITIAL_TRANSACTION_HISTORY } from '../../data/mockTransactionHistory';
import { TransactionHistoryDetailView } from '../../components/profile/TransactionHistoryDetailView';
import { cn } from '../../lib/utils';

export const TransactionHistoryPage: React.FC = () => {
  // Persistence with sessionStorage to ensure data integrity
  const [transactions] = useState<TransactionHistoryRecord[]>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = sessionStorage.getItem('fms_transaction_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.warn('Error reading transaction history from sessionStorage', e);
        }
      }
    }
    return INITIAL_TRANSACTION_HISTORY;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('fms_transaction_history', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Selected transaction state for detail view
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryRecord | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BERHASIL' | 'GAGAL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Incoming' | 'Outgoing' | 'ONUS'>('ALL');
  const [channelFilter, setChannelFilter] = useState<'ALL' | string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper for IDR currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper for VA extraction
  const getVaNumber = (trx: TransactionHistoryRecord) => {
    if (trx.vaNumber && trx.vaNumber !== '-') return trx.vaNumber;
    if (trx.destination_Account_VA && trx.destination_Account_VA !== '-') return trx.destination_Account_VA;
    if (trx.Source_Account_VA && trx.Source_Account_VA !== '-') return trx.Source_Account_VA;
    return '-';
  };

  // Helper for FT extraction
  const getFtNumber = (trx: TransactionHistoryRecord) => {
    return trx.ftNumber || trx.Transaction_Reference || trx.Transaction_ID;
  };

  // Helper for Category extraction
  const getCategory = (trx: TransactionHistoryRecord) => {
    if (trx.transactionCategory) return trx.transactionCategory;
    if (trx.channel === 'Internal Transfer') return 'ONUS';
    return 'Outgoing';
  };

  // Filter Computation - Standardized to CIF, No Customer ID
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      // 1. Search Query - Focus on CIF, FT Number, Account Number, VA, Device ID, RRN, Merchant, etc.
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ftNum = getFtNumber(trx).toLowerCase();
        const vaNum = getVaNumber(trx).toLowerCase();
        const cifMatch = (trx.Source_CIF || '').toLowerCase().includes(q) || (trx.Beneficiary_CIF || '').toLowerCase().includes(q);
        const ftMatch = ftNum.includes(q);
        const trxIdMatch = (trx.Transaction_ID || '').toLowerCase().includes(q);
        const accMatch = (trx.Source_Account_Number || '').toLowerCase().includes(q) || (trx.Beneficiary_Account_Number || '').toLowerCase().includes(q);
        const nameMatch = (trx.Source_Account_Name || '').toLowerCase().includes(q) || (trx.Beneficiary_Account_Name || '').toLowerCase().includes(q);
        const vaMatch = vaNum.includes(q);
        const deviceIdMatch = (trx.deviceId || '').toLowerCase().includes(q);
        const deviceModelMatch = (trx.deviceModel || '').toLowerCase().includes(q);
        const ipMatch = (trx.ipAddress || '').toLowerCase().includes(q);
        const rrnMatch = (trx.rrn || '').toLowerCase().includes(q);
        const merchantMatch = (trx.merchantName || '').toLowerCase().includes(q) || (trx.terminalId || '').toLowerCase().includes(q);
        const categoryMatch = getCategory(trx).toLowerCase().includes(q);
        const statusMatch = (trx.transactionStatus || '').toLowerCase().includes(q);

        if (!cifMatch && !ftMatch && !trxIdMatch && !accMatch && !nameMatch && !vaMatch && 
            !deviceIdMatch && !deviceModelMatch && !ipMatch && !rrnMatch && !merchantMatch && 
            !categoryMatch && !statusMatch) {
          return false;
        }
      }

      // 2. Status Transaksi Filter (BERHASIL / GAGAL)
      if (statusFilter !== 'ALL') {
        const isSuccess = trx.transactionStatus === 'BERHASIL' || trx.transactionStatus === 'SUCCESS';
        if (statusFilter === 'BERHASIL' && !isSuccess) return false;
        if (statusFilter === 'GAGAL' && isSuccess) return false;
      }

      // 3. Category Filter (Incoming / Outgoing / ONUS)
      if (categoryFilter !== 'ALL') {
        const cat = getCategory(trx);
        if (categoryFilter === 'Incoming' && !cat.toLowerCase().includes('incoming')) return false;
        if (categoryFilter === 'Outgoing' && !cat.toLowerCase().includes('outgoing')) return false;
        if (categoryFilter === 'ONUS' && cat !== 'ONUS') return false;
      }

      // 4. Channel Filter
      if (channelFilter !== 'ALL' && trx.channel !== channelFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, statusFilter, categoryFilter, channelFilter]);

  // Metrics summary
  const totalCount = transactions.length;
  const berhasilCount = transactions.filter(t => t.transactionStatus === 'BERHASIL' || t.transactionStatus === 'SUCCESS').length;
  const gagalCount = transactions.filter(t => t.transactionStatus === 'GAGAL' || t.transactionStatus === 'BLOCKED' || t.Flagged).length;
  const totalVolumeIDR = transactions
    .filter(t => t.Currency_Code === 'IDR')
    .reduce((acc, curr) => acc + curr.Transaction_amount, 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setChannelFilter('ALL');
  };

  // If a transaction is selected, switch to detail view
  if (selectedTransaction) {
    return (
      <TransactionHistoryDetailView
        transaction={selectedTransaction}
        onBackToList={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. PAGE TITLE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Transaction History
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Direktori Jurnal Transaksi Multi-Kanal Core Banking Berbasis Standardisasi CIF Bank Sahabat Sampoerna
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button - Complete 14 Columns without Customer ID */}
          <button
            onClick={() => {
              const headers = [
                'No',
                'Tanggal & Waktu Transaksi',
                'Nomor FT',
                'CIF',
                'Nomor Rekening',
                'Virtual Account (VA) Number',
                'Status Transaksi',
                'Available Balance',
                'Device ID',
                'Device Model',
                'IP Address',
                'RRN',
                'Merchant Name',
                'Tipe/Kategori Transaksi',
                'Nominal Transaksi'
              ];
              const rows = filteredTransactions.map((t, idx) => [
                idx + 1,
                `"${t.Transaction_Datetime}"`,
                `"${getFtNumber(t)}"`,
                `"${t.Source_CIF}"`,
                `"${t.Source_Account_Number}"`,
                `"${getVaNumber(t)}"`,
                t.transactionStatus === 'BERHASIL' ? 'BERHASIL' : 'GAGAL',
                t.Total_Balance,
                `"${t.deviceId || '-'}"`,
                `"${t.deviceModel || '-'}"`,
                `"${t.ipAddress || '-'}"`,
                `"${t.rrn || '-'}"`,
                `"${t.merchantName || t.terminalId || '-'}"`,
                `"${getCategory(t)}"`,
                t.Transaction_amount
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `Transaction_History_CIF_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Recorded Trx
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900">{totalCount}</div>
            <p className="text-[11px] text-slate-500">Jurnal transaksi terarsip</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Status Berhasil */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Status Berhasil
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-600">{berhasilCount}</div>
            <p className="text-[11px] text-emerald-700/80 font-medium">Transaksi tervalidasi sukses</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Status Gagal / Suspect */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Status Gagal / Suspect
            </span>
            <div className="text-2xl font-bold font-mono text-red-600">{gagalCount}</div>
            <p className="text-[11px] text-red-600/80 font-medium">Gagal otorisasi / Anomaly</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Total Volume IDR */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Volume (IDR)
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 truncate max-w-[170px]">
              {formatIDR(totalVolumeIDR)}
            </div>
            <p className="text-[11px] text-slate-500">Omset mutasi tercatat</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & COMPREHENSIVE FILTERS - STANDARDIZED TO CIF */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Search Bar - CIF & Key Attributes */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan CIF, Nomor FT, Nomor Rekening, Virtual Account (VA), Device ID, RRN, atau Merchant..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Transaksi Filter (BERHASIL / GAGAL) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Semua Status</option>
                <option value="BERHASIL">BERHASIL</option>
                <option value="GAGAL">GAGAL</option>
              </select>
            </div>

            {/* Kategori Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
                <option value="ONUS">ONUS</option>
              </select>
            </div>

            {/* Channel Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">Semua Kanal</option>
                <option value="BI-FAST">BI-FAST</option>
                <option value="Virtual Account">Virtual Account</option>
                <option value="RTOL">Online Transfer (RTOL)</option>
                <option value="RTGS">RTGS High Value</option>
                <option value="QRIS">QRIS</option>
                <option value="ATM">ATM Switch</option>
                <option value="Internal Transfer">Internal Transfer</option>
                <option value="Over-the-Counter">Over-the-Counter</option>
              </select>
            </div>

            {/* Reset Button */}
            {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || channelFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges Active */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Menampilkan <span className="font-bold text-slate-800">{filteredTransactions.length}</span> dari <span className="font-semibold text-slate-700">{totalCount}</span> data transaksi &bull; <span className="text-blue-600 font-semibold">Standardisasi Identitas CIF</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Info className="w-3 h-3" />
              <span>Menampilkan 14 kolom lengkap detail transaksi</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. MASTER TRANSACTION TABLE - 14 COMPLETE COLUMNS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header: 14 Columns + No & Action */}
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px] select-none whitespace-nowrap">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 text-center">Action</th>
                <th className="py-3 px-3">1. Tanggal &amp; Waktu Transaksi</th>
                <th className="py-3 px-3 font-mono">2. Nomor FT</th>
                <th className="py-3 px-3 font-mono">3. CIF</th>
                <th className="py-3 px-3 font-mono">4. Nomor Rekening</th>
                <th className="py-3 px-3 font-mono">5. Virtual Account (VA) Number</th>
                <th className="py-3 px-3 text-center">6. Status Transaksi</th>
                <th className="py-3 px-3 text-right font-mono">7. Available Balance</th>
                <th className="py-3 px-3 font-mono">8. Device ID</th>
                <th className="py-3 px-3">9. Device Model</th>
                <th className="py-3 px-3 font-mono">10. IP Address</th>
                <th className="py-3 px-3 font-mono">11. RRN</th>
                <th className="py-3 px-3">12. Merchant Name</th>
                <th className="py-3 px-3 text-center">13. Tipe / Kategori Transaksi</th>
                <th className="py-3 px-3 text-right font-mono">14. Nominal Transaksi</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">Tidak ada data transaksi yang sesuai filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau reset filter</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx, index) => {
                  const ftNumber = getFtNumber(trx);
                  const vaNumber = getVaNumber(trx);
                  const category = getCategory(trx);
                  const isSuccess = trx.transactionStatus === 'BERHASIL' || trx.transactionStatus === 'SUCCESS';
                  const isGagal = trx.transactionStatus === 'GAGAL' || trx.transactionStatus === 'BLOCKED' || trx.Flagged;

                  return (
                    <tr 
                      key={trx.id}
                      onClick={() => setSelectedTransaction(trx)}
                      className={cn(
                        "transition-colors cursor-pointer group whitespace-nowrap",
                        trx.Flagged ? "hover:bg-red-50/40" : "hover:bg-blue-50/40",
                        index % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                      )}
                    >
                      {/* Control: No */}
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      {/* Control: Action (Detail Button) */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTransaction(trx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-[11px] font-semibold transition shadow-2xs cursor-pointer group/btn"
                        >
                          <Eye className="w-3 h-3 text-blue-600 group-hover/btn:text-white" />
                          <span>Detail</span>
                        </button>
                      </td>

                      {/* 1. Tanggal & Waktu Transaksi */}
                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                        {trx.Transaction_Datetime}
                      </td>

                      {/* 2. Nomor FT (Financial Transaction Reference Number) */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 group-hover:underline">
                            {ftNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopy(ftNumber, `FT_${trx.id}`, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy Nomor FT"
                          >
                            {copiedId === `FT_${trx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* 3. CIF (Standard Primary Identifier) */}
                      <td className="py-3 px-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            {trx.Source_CIF}
                          </span>
                          <button
                            onClick={(e) => handleCopy(trx.Source_CIF, `CIF_${trx.id}`, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy CIF"
                          >
                            {copiedId === `CIF_${trx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* 4. Nomor Rekening */}
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                        <div className="flex flex-col">
                          <span>{trx.Source_Account_Number}</span>
                          <span className="text-[10px] text-slate-500 font-sans font-normal truncate max-w-[140px]">
                            {trx.Source_Account_Name}
                          </span>
                        </div>
                      </td>

                      {/* 5. Virtual Account (VA) Number */}
                      <td className="py-3 px-3 font-mono">
                        {vaNumber !== '-' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 font-medium rounded text-[11px] border border-amber-200">
                              {vaNumber}
                            </span>
                            <button
                              onClick={(e) => handleCopy(vaNumber, `VA_${trx.id}`, e)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="Copy VA Number"
                            >
                              {copiedId === `VA_${trx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 pl-2">-</span>
                        )}
                      </td>

                      {/* 6. Status Transaksi (BERHASIL / GAGAL) */}
                      <td className="py-3 px-3 text-center">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            BERHASIL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            GAGAL
                          </span>
                        )}
                      </td>

                      {/* 7. Available Balance (Saldo Akhir Nasabah) */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        {trx.Currency_Code === 'USD'
                          ? `$ ${trx.Total_Balance.toLocaleString('en-US')}`
                          : formatIDR(trx.Total_Balance)
                        }
                      </td>

                      {/* 8. Device ID */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {trx.deviceId ? (
                          <div className="flex items-center gap-1">
                            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono text-[10px] truncate max-w-[120px]" title={trx.deviceId}>
                              {trx.deviceId}
                            </span>
                            <button
                              onClick={(e) => handleCopy(trx.deviceId!, `DEV_${trx.id}`, e)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              title="Copy Device ID"
                            >
                              {copiedId === `DEV_${trx.id}` ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 pl-2">-</span>
                        )}
                      </td>

                      {/* 9. Device Model */}
                      <td className="py-3 px-3 text-slate-800 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{trx.deviceModel || '-'}</span>
                        </div>
                      </td>

                      {/* 10. IP Address */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {trx.ipAddress || '-'}
                      </td>

                      {/* 11. RRN (Retrieval Reference Number) */}
                      <td className="py-3 px-3 font-mono text-slate-800 font-semibold">
                        {trx.rrn ? (
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] border border-slate-200">
                            {trx.rrn}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* 12. Merchant Name (Nama Merchant / Terminal ID) */}
                      <td className="py-3 px-3 text-slate-800 whitespace-nowrap font-medium">
                        <div className="flex flex-col">
                          <span>{trx.merchantName || '-'}</span>
                          {trx.terminalId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Terminal: {trx.terminalId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 13. Tipe / Kategori Transaksi (Incoming, Outgoing, ONUS) */}
                      <td className="py-3 px-3 text-center">
                        {category.toLowerCase().includes('incoming') ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Incoming
                          </span>
                        ) : category === 'ONUS' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            ONUS
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Outgoing
                          </span>
                        )}
                      </td>

                      {/* 14. Nominal Transaksi */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {trx.Currency_Code === 'USD' 
                          ? `$ ${trx.Transaction_amount.toLocaleString('en-US')}` 
                          : formatIDR(trx.Transaction_amount)
                        }
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Menampilkan {filteredTransactions.length} dari {totalCount} baris data</span>
            <span className="text-slate-300">&bull;</span>
            <span className="font-mono text-[11px]">Core Banking Transaction Lake (Standardized to CIF)</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1">Database Shard:</span>
            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
              ONEFCC_TRX_PROD_01
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
