import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  Building2, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  History, 
  Sliders, 
  AlertTriangle, 
  Lock, 
  Layers, 
  ChevronRight,
  Info,
  User,
  Zap,
  Globe,
  ShoppingCart,
  Banknote,
  Radio
} from 'lucide-react';
import { DebitCardRecord, CardHistoryRecord } from '../../types/fms';
import { cn } from '../../lib/utils';

interface DebitCardDetailViewProps {
  card: DebitCardRecord;
  onBackToList: () => void;
}

export const DebitCardDetailView: React.FC<DebitCardDetailViewProps> = ({
  card,
  onBackToList
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showFullCardNumber, setShowFullCardNumber] = useState<boolean>(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Helper Badge for Card Status
  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }
    if (status.includes('Blocked') || status.includes('Fraud') || status.includes('Lost')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {status}
        </span>
      );
    }
    if (status === 'Expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        {status}
      </span>
    );
  };

  const getHistoryStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            ACTIVATED
          </span>
        );
      case 'ISSUED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            ISSUED
          </span>
        );
      case 'BLOCKED_FRAUD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 font-mono">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            BLOCKED_FRAUD
          </span>
        );
      case 'BLOCKED_LOST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 font-mono">
            <Lock className="w-3 h-3 text-orange-600" />
            BLOCKED_LOST
          </span>
        );
      case 'TEMPORARY_LOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">
            <Clock className="w-3 h-3 text-amber-600" />
            TEMPORARY_LOCK
          </span>
        );
      case 'LIMIT_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 font-mono">
            <Sliders className="w-3 h-3 text-purple-600" />
            LIMIT_UPDATED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
            CLOSED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 font-mono">
            {status}
          </span>
        );
    }
  };

  const displayedCardNumber = showFullCardNumber 
    ? (card.rawCardNumber || card.cardNumber) 
    : card.cardNumber;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-debit-card-list"
            onClick={onBackToList}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to List</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Profile</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 font-semibold">Debit Card Profile</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-mono font-semibold">{card.cardId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Card ID: {card.cardId}
          </span>
          <span className="text-[11px] font-medium text-slate-600 bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded font-mono">
            Sampoerna Card System
          </span>
        </div>
      </div>

      {/* 2. CARD OVERVIEW BANNER WITH VIRTUAL CHIP CARD PREVIEW */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Virtual Visual Card Graphic */}
          <div className="w-full sm:w-80 h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-800 p-5 shadow-xl border border-blue-400/30 flex flex-col justify-between relative overflow-hidden shrink-0">
            {/* Background Decorative Rings */}
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-blue-500/10 pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wider text-amber-400 font-mono">BANK SAMPOERNA</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
                {card.cardType.includes('GPN') ? 'GPN DEBIT' : card.cardType.includes('Visa') ? 'VISA DEBIT' : 'MASTERCARD'}
              </span>
            </div>

            {/* Chip & Contactless Waves */}
            <div className="flex items-center gap-3 relative z-10 my-1">
              <div className="w-9 h-7 rounded bg-amber-300/80 border border-amber-200/90 flex flex-col justify-around p-1 shadow-inner">
                <div className="h-0.5 bg-amber-600/40 rounded" />
                <div className="h-0.5 bg-amber-600/40 rounded" />
              </div>
              <Radio className="w-4 h-4 text-slate-300/80 rotate-90" />
            </div>

            {/* Card Number & Name */}
            <div className="relative z-10 space-y-1">
              <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-white drop-shadow">
                {displayedCardNumber}
              </div>
              <div className="flex items-end justify-between pt-1">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-mono">CARDHOLDER</div>
                  <div className="text-xs font-bold tracking-wide text-slate-100 truncate max-w-[170px] uppercase font-mono">
                    {card.cardName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-mono">EXPIRES</div>
                  <div className="text-[11px] font-mono font-bold text-slate-200">
                    {card.expirationTimestamp.slice(0, 7)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Details & Status on Banner Right */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700/60">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{card.cardName}</span>
                </h1>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                  <span>Type: <strong className="text-blue-300">{card.cardType}</strong></span>
                  <span>•</span>
                  <span>Branch: <strong className="text-white">{card.branchCode}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(card.status)}
              </div>
            </div>

            {/* Block Code & Compliance Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-400 uppercase font-mono font-bold block mb-1">
                  Card Block Code / ISO Status:
                </span>
                <span className={cn(
                  "font-mono font-bold text-xs",
                  card.cardBlockCode.startsWith('00') ? "text-emerald-400" : "text-amber-400"
                )}>
                  {card.cardBlockCode}
                </span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-400 uppercase font-mono font-bold block mb-1">
                  Primary Linked CIF &amp; Nasabah:
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate">{card.customerName}</span>
                  <span className="font-mono text-blue-300 text-[11px] bg-blue-900/50 px-1.5 py-0.5 rounded border border-blue-700">
                    {card.cif}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION DEBIT CARD DETAIL (2-COLUMN READ-ONLY FORM) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Debit Card Detail Specification</h2>
              <p className="text-xs text-slate-500">Konfigurasi parameter kartu debit, nomor rekening tertaut, dan limit transaksi harian.</p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 font-medium">
            EMV Chip Standard
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ========================================================= */}
          {/* KOLOM KIRI: Card ID, Type, Number, Name, Accounts, Timestamps */}
          {/* ========================================================= */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>General Card Identification</span>
            </div>

            {/* 1. Card ID */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Card ID
              </label>
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs font-mono font-bold">
                <span>{card.cardId}</span>
                <button
                  onClick={() => handleCopy(card.cardId, 'cardId')}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 cursor-pointer transition"
                  title="Copy Card ID"
                >
                  {copiedKey === 'cardId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Card Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Card Type
              </label>
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs">
                <span className="font-semibold">{card.cardType}</span>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                  {card.chipType || 'EMV Contactless'}
                </span>
              </div>
            </div>

            {/* 3. Card Number (Masked / Unmasked Toggle) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Card Number (PAN)
              </label>
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs font-mono">
                <span className="font-bold text-sm tracking-wide text-blue-950">
                  {displayedCardNumber}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowFullCardNumber(!showFullCardNumber)}
                    className="text-slate-500 hover:text-blue-700 p-1 rounded hover:bg-slate-200 cursor-pointer transition flex items-center gap-1 text-[11px] font-sans"
                    title={showFullCardNumber ? "Sembunyikan PAN" : "Tampilkan PAN Lengkap"}
                  >
                    {showFullCardNumber ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Mask</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Show</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCopy(card.rawCardNumber || card.cardNumber, 'cardNumber')}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 cursor-pointer transition"
                    title="Copy Card Number"
                  >
                    {copiedKey === 'cardNumber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Card Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Card Name (Embossed on Plastic)
              </label>
              <div className="bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 shadow-2xs font-mono uppercase">
                {card.cardName}
              </div>
            </div>

            {/* 5. Linked Account Numbers */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Linked Account Numbers (Rekening Tertaut)
              </label>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 space-y-2 shadow-2xs">
                {card.linkedAccountNumbers.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-slate-200 text-xs font-mono">
                    <span className="font-semibold text-slate-800">{acc}</span>
                    {i === 0 && (
                      <span className="text-[10px] font-sans font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                        Primary Account
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Timestamps (Activated, Expiration, Closed) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Activated Timestamp</span>
                <span className="font-mono text-xs font-medium text-slate-800 block">
                  {card.activatedTimestamp}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Expiration Timestamp</span>
                <span className="font-mono text-xs font-bold text-blue-700 block">
                  {card.expirationTimestamp}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Closed Timestamp</span>
                <span className={cn(
                  "font-mono text-xs block",
                  card.closedTimestamp !== '-' ? "font-bold text-red-600" : "text-slate-400 font-medium"
                )}>
                  {card.closedTimestamp}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* KOLOM KANAN: Limit Information */}
          {/* ========================================================= */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Limit Information &amp; Transaction Caps</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-semibold border border-emerald-200">
                IDR Daily Limits
              </span>
            </div>

            {/* Limit Items Grid */}
            <div className="space-y-3">
              {/* 1. Withdrawal Limit */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-600">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Withdrawal Limit (Per Transaksi ATM)
                    </span>
                    <span className="text-xs text-slate-400">Maksimum penarikan tunai per sesi ATM</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                  {formatCurrency(card.withdrawalLimit)}
                </span>
              </div>

              {/* 2. Daily Withdrawal Limit */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-600">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Daily Withdrawal Limit
                    </span>
                    <span className="text-xs text-slate-400">Akumulasi limit tarik tunai harian</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-blue-800 bg-blue-50/60 px-3 py-1.5 rounded-lg border border-blue-200">
                  {formatCurrency(card.dailyWithdrawalLimit)}
                </span>
              </div>

              {/* 3. POS Transaction Limit */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-purple-600">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      POS Transaction Limit (Per Transaksi EDC)
                    </span>
                    <span className="text-xs text-slate-400">Belanja merchant via mesin EDC offline</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                  {formatCurrency(card.posTransactionLimit)}
                </span>
              </div>

              {/* 4. Daily POS Transaction Limit */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-purple-600">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Daily POS Transaction Limit
                    </span>
                    <span className="text-xs text-slate-400">Akumulasi belanja EDC per hari kalender</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-purple-900 bg-purple-50/60 px-3 py-1.5 rounded-lg border border-purple-200">
                  {formatCurrency(card.dailyPosTransactionLimit)}
                </span>
              </div>

              {/* 5. Ecommerce Transaction Limit Amount */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Ecommerce Transaction Limit Amount
                    </span>
                    <span className="text-xs text-slate-400">Transaksi online 3D-Secure per transaksi</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                  {formatCurrency(card.ecommerceTransactionLimitAmount)}
                </span>
              </div>

              {/* 6. Ecommerce Daily Limit Amount */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Ecommerce Daily Limit Amount
                    </span>
                    <span className="text-xs text-slate-400">Total belanja e-commerce harian</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-900 bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-200">
                  {formatCurrency(card.ecommerceDailyLimitAmount)}
                </span>
              </div>

              {/* 7. Contactless Daily Limit Amount */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-600">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Contactless Daily Limit Amount
                    </span>
                    <span className="text-xs text-slate-400">Tap-to-pay nirkabel tanpa input PIN</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-amber-900 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200">
                  {formatCurrency(card.contactlessDailyLimitAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION CARD HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Card History Log</h2>
              <p className="text-xs text-slate-500">Audit trail siklus hidup kartu, perubahan status, pemblokiran, dan otorisasi limit.</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            {card.history.length} Event Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Card History Status</th>
                <th className="py-3 px-4 text-center w-28">Sequence</th>
                <th className="py-3 px-4">Card History Start Time</th>
                <th className="py-3 px-4">Channel / Operator</th>
                <th className="py-3 px-4">Audit Notes &amp; Trigger Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {card.history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada riwayat aktivitas kartu yang tercatat.
                  </td>
                </tr>
              ) : (
                card.history.map((hist, idx) => (
                  <tr key={hist.id} className="hover:bg-slate-50/80 transition">
                    {/* 1. No */}
                    <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* 2. Card History Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getHistoryStatusBadge(hist.cardHistoryStatus)}
                    </td>

                    {/* 3. Card History Sequence */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        #{hist.cardHistorySequence}
                      </span>
                    </td>

                    {/* 4. Card History Start Time */}
                    <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hist.cardHistoryStartTime}</span>
                      </div>
                    </td>

                    {/* 5. Channel / Operator */}
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{hist.channel || 'Core Switch'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{hist.operator || 'SYS_AUTO'}</div>
                    </td>

                    {/* 6. Audit Notes */}
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      <p className="text-xs leading-relaxed">{hist.notes || '-'}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BOTTOM BACK ACTION BUTTON */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-back-to-debit-card-list-bottom"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Kembali ke Halaman Utama Debit Card Profile</span>
        </button>

        <span className="text-xs text-slate-400">
          Bank Sampoerna Fraud Management System • Card Profile Engine
        </span>
      </div>
    </div>
  );
};
