import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Clock, 
  Building2, 
  Receipt, 
  DollarSign, 
  Server, 
  Lock, 
  Terminal, 
  FileText, 
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Zap,
  Globe
} from 'lucide-react';
import { CardTransactionRecord } from '../../types/fms';
import { cn } from '../../lib/utils';

interface CardTransactionDetailViewProps {
  transaction: CardTransactionRecord;
  onBack: () => void;
}

export const CardTransactionDetailView: React.FC<CardTransactionDetailViewProps> = ({
  transaction,
  onBack
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const isApproved = transaction.Response_Code.startsWith('00');
  const isFlagged = transaction.Flagged;

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer flex items-center justify-center shrink-0"
            title="Kembali ke Card Transaction List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span>Profile</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Card Transaction</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-blue-600">Detail</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Card Transaction Detail</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {transaction.id}
              </span>
            </h1>
          </div>
        </div>

        {/* Header Action Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>{transaction.Card_ID}</span>
          </span>

          <span className={cn(
            "px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border",
            isApproved 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : "bg-red-50 text-red-700 border-red-200"
          )}>
            {isApproved ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            <span>RC: {transaction.Response_Code.split(' ')[0]}</span>
          </span>

          {isFlagged ? (
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1.5 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>FLAGGED (Risk: {transaction.Risk_Score || 85})</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>NORMAL RISK ({transaction.Risk_Score || 10})</span>
            </span>
          )}

          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to List</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6 transition-all shadow-xs",
        isFlagged
          ? "bg-gradient-to-r from-red-50 via-amber-50/50 to-white border-red-200"
          : "bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-blue-200"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Transaction ID
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold text-slate-900">
                {transaction.Transaction_ID}
              </span>
              <button
                onClick={() => handleCopy(transaction.Transaction_ID, 'Hero_Txn_ID')}
                className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Copy Transaction ID"
              >
                {copiedKey === 'Hero_Txn_ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {transaction.Transaction_Description}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Transaction Amount
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {formatIDR(transaction.Transaction_Amount)}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Fee: {formatIDR(transaction.Transaction_Fee_Amount)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Settlement &amp; Billing
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-800">
              {formatIDR(transaction.Settlement_Amount)}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Billing: {formatIDR(transaction.Cardholder_Billing_Amount)}
            </span>
          </div>

          <div className="space-y-1 md:text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Channel &amp; Terminal
            </span>
            <div className="flex md:justify-end items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-white border border-slate-300 text-slate-800 shadow-2xs">
                {transaction.Channel_Type || 'EDC POS'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-blue-100 text-blue-800 font-bold">
                {transaction.Terminal_ID || 'TERM-STD'}
              </span>
            </div>
            <span className="text-xs text-slate-500 block">
              RRN: <strong className="font-mono text-slate-700">{transaction.Reference_Retrieval_Number}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODERNIZED DETAIL VIEW: GRID 4 SECTION LAYOUT                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: BASIC TRANSACTION INFO                             */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Section 1: Basic Transaction Info</h3>
                <p className="text-[11px] text-slate-500">Identitas nasabah, rekening debit, dan token transmisi Core</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              8 Fields
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {/* 1. Customer ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Customer ID
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Customer_ID}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Customer_ID, 'Customer_ID')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Customer ID"
                >
                  {copiedKey === 'Customer_ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Customer CIF */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Customer CIF
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Customer_CIF}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Customer_CIF, 'Customer_CIF')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Customer CIF"
                >
                  {copiedKey === 'Customer_CIF' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Transaction ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Transaction ID
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Transaction_ID}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Transaction_ID, 'Transaction_ID')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copiedKey === 'Transaction_ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 4. Record ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Record ID
              </label>
              <input
                type="text"
                readOnly
                value={String(transaction.Record_ID)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 5. Account Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Account Number
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Account_Number}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Account_Number, 'Account_Number')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedKey === 'Account_Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 6. Card ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Card ID
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Card_ID}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Card_ID, 'Card_ID')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Card ID"
                >
                  {copiedKey === 'Card_ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 7. Additional Datetime */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Additional Datetime
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Additional_Datetime}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 8. Processing Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Processing Code
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Processing_Code}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-900 select-all focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: AMOUNT & SETTLEMENT DETAIL                         */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Section 2: Amount &amp; Settlement Detail</h3>
                <p className="text-[11px] text-slate-500">Valuta transaksi, komisi biaya, settlement kliring, dan billing</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              7 Fields
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {/* 1. Transaction Currency Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Transaction Currency Code
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Transaction_Currency_Code}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 2. Transaction Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Transaction Amount
              </label>
              <input
                type="text"
                readOnly
                value={`${formatIDR(transaction.Transaction_Amount)} (${transaction.Transaction_Amount.toLocaleString('id-ID')})`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700 select-all focus:outline-hidden text-right"
              />
            </div>

            {/* 3. Transaction Fee Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Transaction Fee Amount
              </label>
              <input
                type="text"
                readOnly
                value={`${formatIDR(transaction.Transaction_Fee_Amount)} (${transaction.Transaction_Fee_Amount.toLocaleString('id-ID')})`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden text-right"
              />
            </div>

            {/* 4. Settlement Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Settlement Amount
              </label>
              <input
                type="text"
                readOnly
                value={`${formatIDR(transaction.Settlement_Amount)} (${transaction.Settlement_Amount.toLocaleString('id-ID')})`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden text-right"
              />
            </div>

            {/* 5. Cardholder Billing Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Cardholder Billing Amount
              </label>
              <input
                type="text"
                readOnly
                value={`${formatIDR(transaction.Cardholder_Billing_Amount)} (${transaction.Cardholder_Billing_Amount.toLocaleString('id-ID')})`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden text-right"
              />
            </div>

            {/* 6. Cardholder Billing Fee Amount */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Cardholder Billing Fee Amount
              </label>
              <input
                type="text"
                readOnly
                value={`${formatIDR(transaction.Cardholder_Billing_Fee_Amount)} (${transaction.Cardholder_Billing_Fee_Amount.toLocaleString('id-ID')})`}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden text-right"
              />
            </div>

            {/* 7. Date Settlement */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Date Settlement
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Date_Settlement}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: POS & MERCHANT TECHNICAL DATA                      */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Section 3: POS &amp; Merchant Technical Data</h3>
                <p className="text-[11px] text-slate-500">Parameter ISO 8583 switch, acquiring bank, terminal entry &amp; PIN</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              10 Fields
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {/* 1. Merchant Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Merchant Type (MCC)
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Merchant_Type}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 2. Trimmed Acquiring Institution */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Trimmed Acquiring Institution
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Trimmed_Acquiring_Institution}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 3. Pos Entry Mode */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Pos Entry Mode
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Pos_Entry_Mode}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 4. Pos Condition Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Pos Condition Code
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Pos_Condition_Code}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 5. Pos Pin Capture */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Pos Pin Capture
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Pos_Pin_Capture}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 6. Acquiring Institution Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Acquiring Institution Code
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Acquiring_Institution_Code}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 7. Reference Retrieval Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Reference Retrieval Number (RRN)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Reference_Retrieval_Number}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Reference_Retrieval_Number, 'Reference_Retrieval_Number')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy RRN"
                >
                  {copiedKey === 'Reference_Retrieval_Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 8. Authorization Identification Response */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Authorization Identification Response
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={transaction.Authorization_Identification_Response}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 select-all focus:outline-hidden"
                />
                <button
                  onClick={() => handleCopy(transaction.Authorization_Identification_Response, 'Authorization_Identification_Response')}
                  className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy Auth Code"
                >
                  {copiedKey === 'Authorization_Identification_Response' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 9. Response Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Response Code (ISO 8583 RC)
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Response_Code}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-xs font-mono font-bold select-all focus:outline-hidden border",
                  isApproved 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-red-50 text-red-800 border-red-300"
                )}
              />
            </div>

            {/* 10. Receiving Institution Code */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Receiving Institution Code
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Receiving_Institution_Code}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 4: VIRTUAL ACCOUNT & AUDIT INFO                       */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Section 4: Virtual Account &amp; Audit Info</h3>
                <p className="text-[11px] text-slate-500">Pemetaan nomor VA, identifikasi akun ganda, dan audit trail sistem</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
              8 Fields
            </span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {/* 1. Source Account VA */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Source Account VA
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Source_Account_VA}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 2. Source Account VA Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Source Account VA Name
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Source_Account_VA_Name}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 3. Destination Account VA */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Destination Account VA
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Destination_Account_VA}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 select-all focus:outline-hidden"
              />
            </div>

            {/* 4. Destination Account VA Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Destination Account VA Name
              </label>
              <input
                type="text"
                readOnly
                value={transaction.Destination_Account_VA_Name}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 select-all focus:outline-hidden"
              />
            </div>

            {/* 5. Account Identification 1 & 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Account Identification 1
                </label>
                <input
                  type="text"
                  readOnly
                  value={transaction.Account_Identification_1}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Account Identification 2
                </label>
                <input
                  type="text"
                  readOnly
                  value={transaction.Account_Identification_2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
                />
              </div>
            </div>

            {/* 6. Transaction Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Transaction Description
              </label>
              <textarea
                readOnly
                rows={2}
                value={transaction.Transaction_Description}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-normal text-slate-900 select-all focus:outline-hidden resize-none"
              />
            </div>

            {/* 7. CreatedBy / Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                CreatedBy / Date
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  readOnly
                  value={`By: ${transaction.Created_By}`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
                />
                <input
                  type="text"
                  readOnly
                  value={transaction.Created_Date}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-700 select-all focus:outline-hidden"
                />
              </div>
            </div>

            {/* 8. LastUpdateBy / Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                LastUpdateBy / Date
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  readOnly
                  value={`By: ${transaction.Last_Update_By}`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 select-all focus:outline-hidden"
                />
                <input
                  type="text"
                  readOnly
                  value={transaction.Last_Update_Date}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-700 select-all focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky-style Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Server className="w-4 h-4 text-slate-400" />
          <span>Record ID: <strong className="font-mono text-slate-700">{transaction.Record_ID}</strong> | Switch Gateway ISO 8583</span>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-sm hover:shadow transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>
      </div>
    </div>
  );
};
