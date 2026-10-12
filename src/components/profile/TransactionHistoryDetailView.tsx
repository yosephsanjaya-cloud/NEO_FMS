import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  Copy, 
  Check, 
  Info,
  User,
  Zap,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Server
} from 'lucide-react';
import { TransactionHistoryRecord } from '../../types/fms';
import { cn } from '../../lib/utils';

interface TransactionHistoryDetailViewProps {
  transaction: TransactionHistoryRecord;
  onBackToList: () => void;
}

export const TransactionHistoryDetailView: React.FC<TransactionHistoryDetailViewProps> = ({
  transaction,
  onBackToList
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatCurrency = (val: number, currency: string = 'IDR') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(val);
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const ftNumber = transaction.ftNumber || transaction.Transaction_Reference || transaction.Transaction_ID;
  const vaNumber = transaction.vaNumber && transaction.vaNumber !== '-' 
    ? transaction.vaNumber 
    : (transaction.destination_Account_VA && transaction.destination_Account_VA !== '-' 
      ? transaction.destination_Account_VA 
      : (transaction.Source_Account_VA && transaction.Source_Account_VA !== '-' ? transaction.Source_Account_VA : '-'));
  const isSuccess = transaction.transactionStatus === 'BERHASIL' || transaction.transactionStatus === 'SUCCESS';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. TOP BREADCRUMB & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-2xs transition cursor-pointer"
            title="Kembali ke Daftar Transaksi"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider font-mono">
                PROFILE &bull; TRANSACTION HISTORY
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-500 font-mono">
                CIF: {transaction.Source_CIF}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>Detail Transaksi Finansial</span>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                PK: {transaction.PK_OneFcc_Case_Management_Transaction_Detail_ID}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleCopy(JSON.stringify(transaction, null, 2), 'RAW_JSON')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium shadow-2xs transition cursor-pointer"
          >
            {copiedKey === 'RAW_JSON' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copiedKey === 'RAW_JSON' ? 'Copied JSON' : 'Copy Raw Data'}</span>
          </button>

          <button
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar</span>
          </button>
        </div>
      </div>

      {/* 2. TRANSACTION SUMMARY STRIP / HERO CARD */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all",
        transaction.Flagged || !isSuccess
          ? "bg-gradient-to-r from-red-50/60 via-amber-50/30 to-white border-red-200" 
          : "bg-gradient-to-r from-blue-50/60 via-slate-50/40 to-white border-slate-200"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner border",
              transaction.Flagged || !isSuccess
                ? "bg-red-100 text-red-600 border-red-200" 
                : "bg-blue-100 text-blue-600 border-blue-200"
            )}>
              <Receipt className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900">
                  {ftNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
                  {transaction.channel}
                </span>
                {isSuccess ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    BERHASIL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    GAGAL
                  </span>
                )}
                {transaction.Case_ID && transaction.Case_ID !== '-' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-100 text-amber-900 border border-amber-300">
                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                    CASE: {transaction.Case_ID}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-medium">{transaction.Transaction_Datetime}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600 font-medium">{transaction.Transaction_Location}</span>
              </p>
              {transaction.Flagged && transaction.flagReason && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-red-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{transaction.flagReason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 lg:border-l lg:border-slate-200 lg:pl-6">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Nominal Transaksi
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {formatCurrency(transaction.Transaction_amount, transaction.Currency_Code)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Available Balance
              </div>
              <div className="text-base font-semibold font-mono text-slate-700">
                {formatCurrency(transaction.Total_Balance, transaction.Currency_Code)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN FORM: 2-COLUMN GRID FOR COMPLETE PARAMETERS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Box Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-blue-600 rounded-xs" />
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Spesifikasi Detail Transaksi (Standardisasi CIF Tunggal)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Read-Only Audit Trail Core Banking Bank Sahabat Sampoerna
          </span>
        </div>

        {/* 2-Column Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
          
          {/* ==========================================
              KOLOM KIRI (Identitas Rekening & Standardisasi CIF)
              ========================================== */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Identitas Rekening &amp; CIF Nasabah
              </h3>
            </div>

            {/* 1. CIF (Customer Information File) - Primary Identifier */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
                  CIF (Customer Information File) &bull; Primary Identifier
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Standardized CIF
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Source_CIF}
                  className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Source_CIF, 'Source_CIF')}
                  className="absolute right-2 p-1.5 text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  title="Copy CIF"
                >
                  {copiedKey === 'Source_CIF' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Nomor Rekening (Source Account Number) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Rekening Sumber
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Source_Account_Number}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Source_Account_Number, 'Source_Account_Number')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Nomor Rekening"
                >
                  {copiedKey === 'Source_Account_Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Nama Pemilik Rekening */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pemilik Rekening Sumber
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Source_Account_Name}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 4. Virtual Account (VA) Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Virtual Account (VA) Number
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={vaNumber}
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg text-xs font-mono font-semibold text-amber-950 select-all focus:outline-hidden"
                />
                {vaNumber !== '-' && (
                  <button
                    onClick={() => handleCopy(vaNumber, 'VA_NUMBER')}
                    className="absolute right-2 p-1.5 text-amber-700 hover:text-amber-900 transition cursor-pointer"
                    title="Copy Nomor VA"
                  >
                    {copiedKey === 'VA_NUMBER' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* 5. Beneficiary Account Info */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Informasi Rekening Tujuan / Beneficiary
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Beneficiary CIF
                </label>
                <input
                  type="text"
                  readOnly
                  value={transaction.Beneficiary_CIF || '-'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 select-all focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nomor Rekening Beneficiary
                </label>
                <input
                  type="text"
                  readOnly
                  value={transaction.Beneficiary_Account_Number}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 select-all focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Penerima / Beneficiary Name
                </label>
                <input
                  type="text"
                  readOnly
                  value={transaction.Beneficiary_Account_Name}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 select-all focus:outline-hidden"
                />
              </div>
            </div>

            {/* 6. Primary Key ID */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PK Database ID
              </label>
              <input
                type="text"
                readOnly
                value={transaction.PK_OneFcc_Case_Management_Transaction_Detail_ID}
                className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 select-all focus:outline-hidden"
              />
            </div>
          </div>

          {/* ==========================================
              KOLOM KANAN (Parameter Finansial & Teknis Audit)
              ========================================== */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                Parameter Finansial &amp; Audit Trail
              </h3>
            </div>

            {/* 1. Nomor FT (Financial Transaction Reference Number) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor FT (Financial Transaction Reference Number)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={ftNumber}
                  className="w-full px-3 py-2 bg-blue-50/40 border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(ftNumber, 'FT_NUMBER')}
                  className="absolute right-2 p-1.5 text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  title="Copy Nomor FT"
                >
                  {copiedKey === 'FT_NUMBER' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Tanggal & Waktu Transaksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal &amp; Waktu Transaksi
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Transaction_Datetime}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 3. Status Transaksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Transaksi
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={isSuccess ? 'BERHASIL' : 'GAGAL'}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-xs font-mono font-bold select-all focus:outline-hidden border",
                    isSuccess
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-red-50 text-red-900 border-red-200"
                  )}
                />
              </div>
            </div>

            {/* 4. Available Balance (Saldo Akhir Nasabah) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Available Balance (Saldo Akhir Nasabah)
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(transaction.Total_Balance, transaction.Currency_Code)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 5. Nominal Transaksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nominal Transaksi
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(transaction.Transaction_amount, transaction.Currency_Code)}
                className="w-full px-3 py-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-mono font-bold text-blue-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 6. Tipe / Kategori Transaksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipe / Kategori Transaksi
              </label>
              <input
                type="text"
                readOnly
                value={transaction.transactionCategory || (transaction.channel === 'Internal Transfer' ? 'ONUS' : 'Outgoing')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 7. Case ID Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Case Management ID
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Case_ID || '-'}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-xs font-mono font-bold select-all focus:outline-hidden border",
                  transaction.Flagged && transaction.Case_ID && transaction.Case_ID !== '-'
                    ? "bg-amber-50 text-amber-950 border-amber-300"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                )}
              />
            </div>
          </div>

        </div>

        {/* 4. TECHNICAL AUDIT SECTION: DEVICE, IP, RRN, MERCHANT */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-200">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Audit Data Perangkat, Jaringan &amp; Merchant (Device &amp; Gateway Audit)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Device ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Device ID
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.deviceId || '-'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 select-all focus:outline-hidden"
                />
                {transaction.deviceId && (
                  <button
                    onClick={() => handleCopy(transaction.deviceId!, 'DEVICE_ID')}
                    className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Copy Device ID"
                  >
                    {copiedKey === 'DEVICE_ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Device Model */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Device Model
              </label>
              <input
                type="text"
                readOnly
                value={transaction.deviceModel || '-'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                IP Address
              </label>
              <input
                type="text"
                readOnly
                value={transaction.ipAddress || '-'}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* RRN (Retrieval Reference Number) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                RRN (Retrieval Reference Number)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.rrn || '-'}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 select-all focus:outline-hidden"
                />
                {transaction.rrn && (
                  <button
                    onClick={() => handleCopy(transaction.rrn!, 'RRN')}
                    className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Copy RRN"
                  >
                    {copiedKey === 'RRN' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Merchant Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Merchant Name / Terminal ID
              </label>
              <input
                type="text"
                readOnly
                value={`${transaction.merchantName || '-'} ${transaction.terminalId ? `(${transaction.terminalId})` : ''}`}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* Rule BiFAST / Alert */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Rule Engine / FMS Detection Flag
              </label>
              <input
                type="text"
                readOnly
                value={transaction.rule_bifast || '-'}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-xs font-mono font-semibold select-all focus:outline-hidden border",
                  transaction.rule_bifast !== '-'
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-white text-slate-700 border-slate-200"
                )}
              />
            </div>
          </div>
        </div>

        {/* Box Footer with Primary Back Button */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Audit record tersinkronisasi otomatis dengan Core Banking &amp; OneFCC Case Management berbasis identifikasi CIF.</span>
          </div>

          <button
            onClick={onBackToList}
            id="btn-back-transaction-detail-footer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Transaksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
