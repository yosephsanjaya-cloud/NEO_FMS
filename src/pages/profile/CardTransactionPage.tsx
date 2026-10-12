import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Calendar, 
  RotateCcw, 
  ArrowUpDown, 
  Download, 
  Layers, 
  DollarSign, 
  Copy, 
  Check,
  Terminal,
  Store,
  Clock,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { CardTransactionRecord } from '../../types/fms';
import { INITIAL_CARD_TRANSACTIONS } from '../../data/mockCardTransactions';
import { CardTransactionDetailView } from '../../components/profile/CardTransactionDetailView';
import { cn } from '../../lib/utils';

export const CardTransactionPage: React.FC = () => {
  // Selected transaction state for detail view
  const [selectedTransaction, setSelectedTransaction] = useState<CardTransactionRecord | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [cardFilter, setCardFilter] = useState<string>('');
  const [merchantTypeFilter, setMerchantTypeFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'FLAGGED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Distinct Merchant Types for filter dropdown
  const merchantTypes = useMemo(() => {
    const types = new Set<string>();
    INITIAL_CARD_TRANSACTIONS.forEach(t => {
      const code = t.Merchant_Type.slice(0, 4);
      types.add(code);
    });
    return Array.from(types);
  }, []);

  // Filter Computation
  const filteredTransactions = useMemo(() => {
    return INITIAL_CARD_TRANSACTIONS.filter((trx) => {
      // 1. General Search Query (Transaction ID, Account Number, Card ID, Merchant Type, RRN)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTrxId = trx.Transaction_ID.toLowerCase().includes(q);
        const matchAcc = trx.Account_Number.toLowerCase().includes(q);
        const matchCard = trx.Card_ID.toLowerCase().includes(q);
        const matchMcc = trx.Merchant_Type.toLowerCase().includes(q);
        const matchRrn = trx.Reference_Retrieval_Number.toLowerCase().includes(q);
        const matchCust = trx.Customer_ID.toLowerCase().includes(q);
        const matchDesc = trx.Transaction_Description.toLowerCase().includes(q);
        const matchTerminal = (trx.Terminal_ID || '').toLowerCase().includes(q);

        if (!matchTrxId && !matchAcc && !matchCard && !matchMcc && !matchRrn && !matchCust && !matchDesc && !matchTerminal) {
          return false;
        }
      }

      // 2. Specific Account Filter
      if (accountFilter.trim()) {
        if (!trx.Account_Number.includes(accountFilter.trim())) {
          return false;
        }
      }

      // 3. Specific Card ID Filter
      if (cardFilter.trim()) {
        if (!trx.Card_ID.toLowerCase().includes(cardFilter.trim().toLowerCase())) {
          return false;
        }
      }

      // 4. Merchant Type Filter
      if (merchantTypeFilter !== 'ALL') {
        if (!trx.Merchant_Type.startsWith(merchantTypeFilter)) {
          return false;
        }
      }

      // 5. Date Range Filter
      if (dateRangeFilter === 'TODAY') {
        if (trx.Local_Date !== '2026-09-02') return false;
      } else if (dateRangeFilter === '7DAYS') {
        // Mock dataset date is in early Sept 2026
        if (trx.Local_Date < '2026-08-27') return false;
      } else if (dateRangeFilter === '30DAYS') {
        if (trx.Local_Date < '2026-08-01') return false;
      } else if (dateRangeFilter === 'CUSTOM') {
        if (startDate && trx.Local_Date < startDate) return false;
        if (endDate && trx.Local_Date > endDate) return false;
      }

      // 6. Status / Flagged Filter
      if (statusFilter === 'FLAGGED' && !trx.Flagged) return false;
      if (statusFilter === 'APPROVED' && (!trx.Response_Code.startsWith('00') || trx.Flagged)) return false;

      return true;
    });
  }, [searchQuery, accountFilter, cardFilter, merchantTypeFilter, dateRangeFilter, startDate, endDate, statusFilter]);

  // Metrics summary
  const totalCount = INITIAL_CARD_TRANSACTIONS.length;
  const flaggedCount = INITIAL_CARD_TRANSACTIONS.filter(t => t.Flagged).length;
  const approvedCount = INITIAL_CARD_TRANSACTIONS.filter(t => t.Response_Code.startsWith('00')).length;
  const totalAmountIDR = INITIAL_CARD_TRANSACTIONS.reduce((acc, curr) => acc + curr.Transaction_Amount, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setAccountFilter('');
    setCardFilter('');
    setMerchantTypeFilter('ALL');
    setDateRangeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setStatusFilter('ALL');
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Transaction ID',
      'Account Number',
      'Card ID',
      'Transaction Amount',
      'Settlement Amount',
      'Cardholder Billing Amount',
      'Local Time',
      'Local Date',
      'Merchant Type',
      'Pos Entry Mode',
      'Pos Pin Capture',
      'Source Account VA',
      'Source Account VA Name',
      'Destination Account VA',
      'Destination Account VA Name',
      'Reference Retrieval Number',
      'Response Code',
      'Customer ID',
      'Processing Code'
    ];

    const rows = filteredTransactions.map((t, idx) => [
      idx + 1,
      `"${t.Transaction_ID}"`,
      `"${t.Account_Number}"`,
      `"${t.Card_ID}"`,
      t.Transaction_Amount,
      t.Settlement_Amount,
      t.Cardholder_Billing_Amount,
      `"${t.Local_Time}"`,
      `"${t.Local_Date}"`,
      `"${t.Merchant_Type}"`,
      `"${t.Pos_Entry_Mode}"`,
      `"${t.Pos_Pin_Capture}"`,
      `"${t.Source_Account_VA}"`,
      `"${t.Source_Account_VA_Name}"`,
      `"${t.Destination_Account_VA}"`,
      `"${t.Destination_Account_VA_Name}"`,
      `"${t.Reference_Retrieval_Number}"`,
      `"${t.Response_Code}"`,
      `"${t.Customer_ID}"`,
      `"${t.Processing_Code}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Card_Transaction_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If a transaction is selected, show Detail View
  if (selectedTransaction) {
    return (
      <CardTransactionDetailView
        transaction={selectedTransaction}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Profile</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-blue-600">Card Transaction</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Card Transaction Lookup</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200">
              ISO 8583
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pemantauan transaksi kartu ATM, Debit EDC POS, E-Commerce 3DS, dan QRIS CPM Bank Sahabat Sampoerna.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export CSV Transaksi Kartu"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Transaksi</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1.5 font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Switching &amp; Core Engine</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Volume Nilai</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1.5 font-mono truncate" title={formatIDR(totalAmountIDR)}>
            {formatIDR(totalAmountIDR)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Akumulasi Kartu Debit</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Disetujui (Approved 00)</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1.5 font-mono">{approvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Transaksi Sukses</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Flagged / Suspicious</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1.5 font-mono">{flaggedCount}</div>
          <div className="text-[11px] text-red-500 mt-0.5 font-medium">Dalam Penyelidikan FMS</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Pencarian Transaksi Kartu
            </h2>
          </div>
          {(searchQuery || accountFilter || cardFilter || merchantTypeFilter !== 'ALL' || dateRangeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Row 1: Search Query + Account Number + Card ID */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari Transaction ID, RRN, Customer, Deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Account Number Filter */}
          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="Filter No. Rekening..."
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Card ID Filter */}
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Filter Card ID (cth: 5379-4112...)"
              value={cardFilter}
              onChange={(e) => setCardFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Row 2: Merchant Type + Date Range + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          {/* Merchant Type Selector */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              MCC:
            </span>
            <select
              value={merchantTypeFilter}
              onChange={(e) => setMerchantTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Merchant Type (MCC)</option>
              <option value="5411">5411 - Grocery / Supermarket</option>
              <option value="6011">6011 - ATM Cash Dispense</option>
              <option value="5311">5311 - E-Commerce / Dept Store</option>
              <option value="5812">5812 - Eating Places &amp; Lounges</option>
              <option value="5814">5814 - Fast Food / Coffee Shop</option>
              <option value="5944">5944 - Jewelry / Watches (High Risk)</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Date:
            </span>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Tanggal Transaksi</option>
              <option value="TODAY">Hari Ini (2026-09-02)</option>
              <option value="7DAYS">7 Hari Terakhir</option>
              <option value="30DAYS">30 Hari Terakhir</option>
              <option value="CUSTOM">Rentang Kustom (Pilih Tanggal)</option>
            </select>
          </div>

          {/* Status / Flagged Filter */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
            >
              <option value="ALL">Semua Status Transaksi</option>
              <option value="APPROVED">Hanya Approved (Sukses)</option>
              <option value="FLAGGED">Hanya Flagged / Suspicious</option>
            </select>
          </div>
        </div>

        {/* Optional Custom Date Inputs */}
        {dateRangeFilter === 'CUSTOM' && (
          <div className="flex items-center gap-3 pt-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-fadeIn">
            <span className="text-xs font-semibold text-blue-900">Pilih Rentang:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
            />
            <span className="text-xs text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>
        )}
      </div>

      {/* 4. Main Lookup Table (Flat Grid) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Data Transaksi Kartu
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
              {filteredTransactions.length} Record
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Klik baris atau tombol <strong>Detail</strong> untuk membuka 4-Section View
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 text-center">Action</th>
                <th className="py-3 px-3 font-mono">Transaction ID</th>
                <th className="py-3 px-3 font-mono">Account Number</th>
                <th className="py-3 px-3 font-mono">Card ID</th>
                <th className="py-3 px-3 font-mono text-right">Transaction Amount</th>
                <th className="py-3 px-3 font-mono text-right">Settlement Amount</th>
                <th className="py-3 px-3 font-mono text-right">Cardholder Billing Amount</th>
                <th className="py-3 px-3 font-mono text-center">Local Time</th>
                <th className="py-3 px-3 font-mono text-center">Local Date</th>
                <th className="py-3 px-3">Merchant Type</th>
                <th className="py-3 px-3 font-mono">Pos Entry Mode</th>
                <th className="py-3 px-3 font-mono">Pos Pin Capture</th>
                <th className="py-3 px-3 font-mono">Source Account VA</th>
                <th className="py-3 px-3">Source Account VA Name</th>
                <th className="py-3 px-3 font-mono">Destination Account VA</th>
                <th className="py-3 px-3">Destination Account VA Name</th>
                <th className="py-3 px-3 font-mono">Reference Retrieval Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">Tidak ada transaksi kartu yang sesuai kriteria filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coba atur ulang kata kunci atau reset filter pencarian</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx, idx) => {
                  const isFlagged = trx.Flagged;
                  const isApproved = trx.Response_Code.startsWith('00');

                  return (
                    <tr
                      key={trx.id}
                      onClick={() => setSelectedTransaction(trx)}
                      className={cn(
                        "transition cursor-pointer group",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                        "hover:bg-blue-50/60",
                        isFlagged && "bg-red-50/25 hover:bg-red-50/50"
                      )}
                    >
                      {/* 1. No */}
                      <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* 2. Action (Tombol "Detail") */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTransaction(trx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-[11px] transition shadow-2xs cursor-pointer border border-blue-200 hover:border-blue-600"
                          title="Lihat Detail Transaksi Kartu"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      </td>

                      {/* 3. Transaction ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded border text-[11px]",
                            isFlagged 
                              ? "bg-red-100 text-red-900 border-red-300" 
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          )}>
                            {trx.Transaction_ID}
                          </span>
                          <button
                            onClick={(e) => handleCopy(trx.Transaction_ID, `TXN_${trx.id}`, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy Transaction ID"
                          >
                            {copiedId === `TXN_${trx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* 4. Account Number */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{trx.Account_Number}</span>
                          <button
                            onClick={(e) => handleCopy(trx.Account_Number, `ACC_${trx.id}`, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedId === `ACC_${trx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* 5. Card ID */}
                      <td className="py-3 px-3 font-mono text-slate-800 font-semibold">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[11px]">
                          {trx.Card_ID}
                        </span>
                      </td>

                      {/* 6. Transaction Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-right text-slate-900">
                        <span className={cn(isFlagged && "text-red-700")}>
                          {formatIDR(trx.Transaction_Amount)}
                        </span>
                      </td>

                      {/* 7. Settlement Amount */}
                      <td className="py-3 px-3 font-mono font-semibold text-right text-slate-700">
                        {formatIDR(trx.Settlement_Amount)}
                      </td>

                      {/* 8. Cardholder Billing Amount */}
                      <td className="py-3 px-3 font-mono font-semibold text-right text-slate-700">
                        {formatIDR(trx.Cardholder_Billing_Amount)}
                      </td>

                      {/* 9. Local Time */}
                      <td className="py-3 px-3 font-mono text-center text-slate-600 text-[11px]">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          {trx.Local_Time}
                        </span>
                      </td>

                      {/* 10. Local Date */}
                      <td className="py-3 px-3 font-mono text-center text-slate-600 text-[11px]">
                        {trx.Local_Date}
                      </td>

                      {/* 11. Merchant Type */}
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[200px] truncate" title={trx.Merchant_Type}>
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 text-[11px] font-semibold">
                          {trx.Merchant_Type.split(' ')[0]}
                        </span>
                        <span className="ml-1.5 text-[11px] text-slate-600">
                          {trx.Merchant_Type.substring(trx.Merchant_Type.indexOf('(') + 1, trx.Merchant_Type.indexOf(')'))}
                        </span>
                      </td>

                      {/* 12. Pos Entry Mode */}
                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px] max-w-[160px] truncate" title={trx.Pos_Entry_Mode}>
                        <span className="font-bold text-slate-900">{trx.Pos_Entry_Mode.slice(0, 3)}</span>
                        <span className="text-slate-500 ml-1 text-[10px]">
                          {trx.Pos_Entry_Mode.substring(3, 20)}...
                        </span>
                      </td>

                      {/* 13. Pos Pin Capture */}
                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {trx.Pos_Pin_Capture.slice(0, 2)}
                        </span>
                      </td>

                      {/* 14. Source Account VA */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {trx.Source_Account_VA}
                      </td>

                      {/* 15. Source Account VA Name */}
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[180px] truncate" title={trx.Source_Account_VA_Name}>
                        {trx.Source_Account_VA_Name}
                      </td>

                      {/* 16. Destination Account VA */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {trx.Destination_Account_VA}
                      </td>

                      {/* 17. Destination Account VA Name */}
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[180px] truncate" title={trx.Destination_Account_VA_Name}>
                        {trx.Destination_Account_VA_Name}
                      </td>

                      {/* 18. Reference Retrieval Number */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span>{trx.Reference_Retrieval_Number}</span>
                          <button
                            onClick={(e) => handleCopy(trx.Reference_Retrieval_Number, `RRN_${trx.id}`, e)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            title="Copy RRN"
                          >
                            {copiedId === `RRN_${trx.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Menampilkan <strong className="text-slate-800 font-mono">{filteredTransactions.length}</strong> dari <strong className="text-slate-800 font-mono">{totalCount}</strong> transaksi kartu
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>RC 00 Approved</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Flagged / Rejected</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
