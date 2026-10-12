import React from 'react';
import { Receipt, CreditCard, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ProfilePlaceholderPageProps {
  type: 'card-transaction';
  onNavigateToDebitCard?: () => void;
  onNavigateToCustomer?: () => void;
  onNavigateToTransactionHistory?: () => void;
}

export const ProfilePlaceholderPage: React.FC<ProfilePlaceholderPageProps> = ({
  onNavigateToDebitCard,
  onNavigateToCustomer,
  onNavigateToTransactionHistory
}) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Card Transaction
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Card-Present (CP) &amp; Card-Not-Present (CNP) POS/ATM Real-Time Transaction Stream
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Module Planned for Next Release
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-xs space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 shadow-inner">
          <CreditCard className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-slate-900">
            Modul Card Transaction Sedang Disiapkan
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Modul ini akan menyajikan stream transaksi kartu debit (ATM, EDC POS offline, QRIS CPM, dan 3D Secure E-Commerce) secara real-time dari Core Switch Bank Sampoerna.
          </p>
        </div>

        {/* Feature List Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-blue-600 font-mono block mb-1">
              ISO 8583 Messaging
            </span>
            <p className="text-[11px] text-slate-600">Pencatatan raw message &amp; response code lengkap.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-blue-600 font-mono block mb-1">
              Cross-Channel Filter
            </span>
            <p className="text-[11px] text-slate-600">Filter berdasarkan terminal ID, merchant MCC, dan channel.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-blue-600 font-mono block mb-1">
              Instant Rule Match
            </span>
            <p className="text-[11px] text-slate-600">Visualisasi trigger rule FMS langsung dari log mutasi.</p>
          </div>
        </div>

        {/* Action Links */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          {onNavigateToTransactionHistory && (
            <button
              onClick={onNavigateToTransactionHistory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>Buka Transaction History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateToCustomer && (
            <button
              onClick={onNavigateToCustomer}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <span>Buka Customer Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateToDebitCard && (
            <button
              onClick={onNavigateToDebitCard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition cursor-pointer"
            >
              <span>Buka Debit Card Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
