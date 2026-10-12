import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Copy, 
  Check, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { CustomerTransactionRecord } from '../../types/fms';
import { cn } from '../../lib/utils';

interface CustomerTransactionDetailModalProps {
  transaction: CustomerTransactionRecord | null;
  cif?: string;
  customerName?: string;
  onClose: () => void;
}

export const CustomerTransactionDetailModal: React.FC<CustomerTransactionDetailModalProps> = ({
  transaction,
  cif,
  customerName,
  onClose
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    if (!text || text === '-' || text === '— (N/A)') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const isOutgoing = transaction.transactionCategory === 'Outgoing Transfer' || transaction.direction === 'DB';
  const isIncoming = transaction.transactionCategory === 'Incoming Transfer' || transaction.direction === 'CR';
  const isONUS = transaction.transactionCategory === 'ONUS';
  const isSuccess = transaction.status === 'BERHASIL' || transaction.status === 'SUCCESS';

  const sourceAccount = transaction.sourceAccount || transaction.accountNumber || '-';
  const hasVA = transaction.beneficiaryVaName && transaction.beneficiaryVaName !== '-' && transaction.beneficiaryVaName !== '— (N/A)';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="modal-customer-transaction-detail"
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider font-mono">
                  Neo FMS v1.22
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[11px] text-slate-300 font-mono">
                  CIF: {cif || 'N/A'} {customerName ? `(${customerName})` : ''}
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Detail Transaksi Nasabah</span>
                <span className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border",
                  isSuccess 
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                    : "bg-red-500/20 text-red-300 border-red-500/40"
                )}>
                  {transaction.status}
                </span>
              </h2>
            </div>
          </div>

          <button
            id="btn-close-transaction-detail-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY: CLEAN VERTICAL LIST (DESCRIPTION / TABULAR VIEW) */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-200">
          
          {/* SOURCE ACCOUNT CONTEXT ROW (AUDIT REQUIREMENT) */}
          <div className="px-5 py-3 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-700">Rekening Sumber (CIF):</span>
              <span className="font-mono font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-200 select-all">
                {sourceAccount}
              </span>
              <span className="text-[11px] text-slate-500">
                ({transaction.sourceAccountType || 'Tabungan / Giro'})
              </span>
            </div>
            <button
              onClick={() => handleCopy(sourceAccount, 'source')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 cursor-pointer self-start sm:self-auto"
            >
              {copiedField === 'source' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-blue-500" />
                  <span>Salin Rekening</span>
                </>
              )}
            </button>
          </div>

          {/* 1. TRANSACTION ID */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              1. Transaction ID
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className="font-mono font-bold text-slate-900 select-all text-xs break-all">
                {transaction.id}
              </span>
              <button
                onClick={() => handleCopy(transaction.id, 'id')}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                title="Salin Transaction ID"
              >
                {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 2. TRANSACTION REFERENCE */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              2. Transaction Reference
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className="font-mono font-bold text-blue-700 select-all text-xs break-all">
                {transaction.transactionRef || '-'}
              </span>
              {transaction.transactionRef && (
                <button
                  onClick={() => handleCopy(transaction.transactionRef || '', 'ref')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Transaction Reference"
                >
                  {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 3. TRANSACTION DATE */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              3. Transaction Date
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-900 text-xs">
                  {transaction.transactionDate}
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  (WIB &bull; {transaction.channel || 'BI-FAST'})
                </span>
              </div>
              <button
                onClick={() => handleCopy(transaction.transactionDate || '', 'date')}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                title="Salin Tanggal Transaksi"
              >
                {copiedField === 'date' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 4. TRANSACTION CATEGORY */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              4. Transaction Category
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  isIncoming && "bg-emerald-50 text-emerald-800 border-emerald-200",
                  isOutgoing && "bg-blue-50 text-blue-800 border-blue-200",
                  isONUS && "bg-purple-50 text-purple-800 border-purple-200"
                )}>
                  {isIncoming && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                  {isOutgoing && <ArrowUpRight className="w-3 h-3 text-blue-600" />}
                  {isONUS && <RefreshCw className="w-3 h-3 text-purple-600" />}
                  <span>{transaction.transactionCategory}</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {transaction.direction || (isIncoming ? 'CR' : 'DB')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {transaction.channel || 'BI-FAST'}
              </span>
            </div>
          </div>

          {/* 5. TRANSACTION AMOUNT */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              5. Transaction Amount
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-mono font-extrabold text-sm sm:text-base",
                  isIncoming ? "text-emerald-600" : isOutgoing ? "text-blue-700" : "text-purple-700"
                )}>
                  {isIncoming ? '+' : isOutgoing ? '-' : ''} {formatIDR(transaction.amount)}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">IDR</span>
              </div>
              <button
                onClick={() => handleCopy(String(transaction.amount), 'amount')}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                title="Salin Nominal Transaksi"
              >
                {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 6. PHONE NUMBER */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              6. Phone Number
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className="font-mono font-semibold text-slate-900 select-all text-xs">
                {transaction.phoneNumber || '— (N/A)'}
              </span>
              {transaction.phoneNumber && (
                <button
                  onClick={() => handleCopy(transaction.phoneNumber || '', 'phone')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Nomor HP"
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 7. DEVICE ID */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              7. Device ID
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className="font-mono font-semibold text-slate-900 select-all text-xs break-all">
                {transaction.deviceId || '— (N/A)'}
              </span>
              {transaction.deviceId && (
                <button
                  onClick={() => handleCopy(transaction.deviceId || '', 'devId')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Device ID"
                >
                  {copiedField === 'devId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 8. DEVICE MODEL */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              8. Device Model
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900 text-xs">
                {transaction.deviceModel || '— (N/A)'}
              </span>
              {transaction.deviceModel && (
                <button
                  onClick={() => handleCopy(transaction.deviceModel || '', 'devModel')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Device Model"
                >
                  {copiedField === 'devModel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 9. LATITUDE & LONGITUDE */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>9. Latitude &amp; Longitude</span>
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-900 select-all text-xs">
                  {transaction.latitude !== undefined && transaction.longitude !== undefined 
                    ? `${transaction.latitude}, ${transaction.longitude}` 
                    : '— (N/A)'}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded">
                  GPS Valid
                </span>
              </div>
              {transaction.latitude !== undefined && transaction.longitude !== undefined && (
                <div className="flex items-center gap-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${transaction.latitude},${transaction.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-blue-600 transition"
                    title="Buka di Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopy(`${transaction.latitude}, ${transaction.longitude}`, 'coords')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                    title="Salin Koordinat (Lat, Long)"
                  >
                    {copiedField === 'coords' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 10. BENEFICIARY ACCOUNT NAME */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              10. Beneficiary Account Name
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className="font-bold text-slate-900 select-all text-xs">
                {transaction.beneficiaryAccountName || '— (N/A)'}
              </span>
              {transaction.beneficiaryAccountName && (
                <button
                  onClick={() => handleCopy(transaction.beneficiaryAccountName || '', 'beneName')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Nama Penerima"
                >
                  {copiedField === 'beneName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 11. BENEFICIARY ACCOUNT NUMBER */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              11. Beneficiary Account Number
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 select-all text-xs">
                  {transaction.beneficiaryAccountNumber || '— (N/A)'}
                </span>
                {transaction.beneficiaryBank && (
                  <span className="text-[11px] text-slate-500 font-sans">
                    ({transaction.beneficiaryBank})
                  </span>
                )}
              </div>
              {transaction.beneficiaryAccountNumber && (
                <button
                  onClick={() => handleCopy(transaction.beneficiaryAccountNumber || '', 'beneAcc')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Nomor Rekening Penerima"
                >
                  {copiedField === 'beneAcc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 12. BENEFICIARY ACCOUNT VA NAME */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              12. Beneficiary Account VA Name
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold text-xs",
                  hasVA ? "text-indigo-950 font-bold" : "text-slate-400 font-normal"
                )}>
                  {hasVA ? transaction.beneficiaryVaName : '— (N/A)'}
                </span>
                {hasVA && (
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                    Virtual Account
                  </span>
                )}
              </div>
              {hasVA && transaction.beneficiaryVaName && (
                <button
                  onClick={() => handleCopy(transaction.beneficiaryVaName || '', 'vaName')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Nama Virtual Account"
                >
                  {copiedField === 'vaName' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 13. BENEFICIARY ACCOUNT VA NUMBER */}
          <div className="px-5 py-3 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="w-full sm:w-56 shrink-0 font-medium text-slate-500">
              13. Beneficiary Account VA Number
            </div>
            <div className="flex-1 flex items-center justify-between gap-3">
              <span className={cn(
                "font-mono text-xs select-all",
                transaction.beneficiaryVaNumber && transaction.beneficiaryVaNumber !== '-' 
                  ? "font-bold text-slate-900" 
                  : "text-slate-400 font-normal"
              )}>
                {transaction.beneficiaryVaNumber && transaction.beneficiaryVaNumber !== '-' 
                  ? transaction.beneficiaryVaNumber 
                  : '— (N/A)'}
              </span>
              {transaction.beneficiaryVaNumber && transaction.beneficiaryVaNumber !== '-' && (
                <button
                  onClick={() => handleCopy(transaction.beneficiaryVaNumber || '', 'vaNum')}
                  className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
                  title="Salin Nomor Virtual Account"
                >
                  {copiedField === 'vaNum' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(JSON.stringify(transaction, null, 2), 'ALL_JSON')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold shadow-2xs transition cursor-pointer"
            >
              {copiedField === 'ALL_JSON' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Seluruh Data (JSON)</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              13 Item Terstruktur &bull; Verbatim List
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-modal-close-footer"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition shadow-2xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

