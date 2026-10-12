import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  RotateCcw, 
  AlertTriangle,
  Lock,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Info
} from 'lucide-react';
import { DebitCardRecord, DebitCardStatusType } from '../../types/fms';
import { INITIAL_DEBIT_CARDS } from '../../data/mockDebitCards';
import { DebitCardDetailView } from '../../components/profile/DebitCardDetailView';
import { cn } from '../../lib/utils';

export const DebitCardProfilePage: React.FC = () => {
  // Selected Card state for detail view
  const [selectedCard, setSelectedCard] = useState<DebitCardRecord | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DebitCardStatusType>('ALL');
  const [cardTypeFilter, setCardTypeFilter] = useState<'ALL' | string>('ALL');

  // Filter Computation (Search by Card Number, Card Name, Linked Account Number, Card ID, CIF)
  const filteredCards = useMemo(() => {
    return INITIAL_DEBIT_CARDS.filter((card) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = card.cardNumber.toLowerCase().includes(q) || (card.rawCardNumber && card.rawCardNumber.toLowerCase().includes(q));
        const matchName = card.cardName.toLowerCase().includes(q);
        const matchId = card.cardId.toLowerCase().includes(q);
        const matchCust = card.customerName.toLowerCase().includes(q);
        const matchCif = card.cif.toLowerCase().includes(q);
        const matchAccounts = card.linkedAccountNumbers.some(acc => acc.toLowerCase().includes(q));
        
        if (!matchNumber && !matchName && !matchId && !matchCust && !matchCif && !matchAccounts) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL' && card.status !== statusFilter) {
        return false;
      }

      // 3. Card Type Filter
      if (cardTypeFilter !== 'ALL' && card.cardType !== cardTypeFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, statusFilter, cardTypeFilter]);

  // Summary Metrics
  const totalCards = INITIAL_DEBIT_CARDS.length;
  const activeCount = INITIAL_DEBIT_CARDS.filter(c => c.status === 'Active').length;
  const blockedCount = INITIAL_DEBIT_CARDS.filter(c => c.status.includes('Blocked') || c.status.includes('Locked')).length;
  const expiredClosedCount = INITIAL_DEBIT_CARDS.filter(c => c.status === 'Expired' || c.status === 'Closed').length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCardTypeFilter('ALL');
  };

  // If a card is selected, show the detail view
  if (selectedCard) {
    return (
      <DebitCardDetailView 
        card={selectedCard} 
        onBackToList={() => setSelectedCard(null)} 
      />
    );
  }

  // Helper Badge Renderers
  const renderStatusBadge = (status: DebitCardStatusType) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'Blocked - Fraud Suspicion':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            <ShieldAlert className="w-3 h-3 text-red-600" />
            Fraud Block
          </span>
        );
      case 'Blocked - Lost/Stolen':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
            <Lock className="w-3 h-3 text-orange-600" />
            Lost / Stolen
          </span>
        );
      case 'Blocked - PIN Exceeded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            PIN Exceeded
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Expired
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. PAGE TITLE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Debit Card Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive Debit Card Lookup, ISO Block Status, &amp; Dynamic Limit Specifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold font-mono">
            Bank Sampoerna Card Management System (CMS)
          </span>
        </div>
      </div>

      {/* 2. STATS CARDS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Kartu Terdaftar</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalCards}</span>
            <span className="text-[11px] text-slate-400">Debit Cards</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kartu Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Ready in Service</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Blocked / Suspicious</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-600">{blockedCount}</span>
            <span className="text-[11px] text-red-500 font-medium">Fraud / Lost / PIN</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Expired / Closed</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-700">{expiredClosedCount}</span>
            <span className="text-[11px] text-slate-400">Out of Validity</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input: Card Number, Card Name, Linked Account Number */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-debit-card"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Nomor Kartu (misal: 8821), Nama Kartu, Nomor Rekening Tautan, Card ID, atau CIF..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Status: Active / Blocked / Expired */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter:</span>
            </div>
            <select
              id="select-filter-card-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status Kartu</option>
              <option value="Active">Active</option>
              <option value="Blocked - Fraud Suspicion">Blocked - Fraud Suspicion</option>
              <option value="Blocked - Lost/Stolen">Blocked - Lost/Stolen</option>
              <option value="Blocked - PIN Exceeded">Blocked - PIN Exceeded</option>
              <option value="Expired">Expired</option>
            </select>

            {/* Filter Card Type */}
            <select
              id="select-filter-card-type"
              value={cardTypeFilter}
              onChange={(e) => setCardTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Tipe Kartu</option>
              <option value="Mastercard Platinum">Mastercard Platinum</option>
              <option value="Mastercard Prioritas">Mastercard Prioritas</option>
              <option value="Mastercard Gold">Mastercard Gold</option>
              <option value="Visa Platinum Corporate">Visa Platinum Corporate</option>
              <option value="Visa Gold Debit">Visa Gold Debit</option>
              <option value="GPN Chip Bisnis">GPN Chip Bisnis</option>
              <option value="GPN Chip Regular">GPN Chip Regular</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || cardTypeFilter !== 'ALL') && (
              <button
                id="btn-reset-debit-card-filters"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Menampilkan <strong className="text-slate-800 font-mono">{filteredCards.length}</strong> dari <span className="font-mono">{totalCards}</span> kartu debit terdaftar
          </div>
          <div className="text-[11px] text-slate-400">
            Klik tombol "Detail" pada baris untuk melihat konfigurasi limit dan riwayat kartu
          </div>
        </div>
      </div>

      {/* 4. MAIN DEBIT CARD LOOKUP TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-3 text-center w-10">No</th>
                <th className="py-3.5 px-3 text-center w-24">Action</th>
                <th className="py-3.5 px-3">Card ID</th>
                <th className="py-3.5 px-3">Card Number (Masked)</th>
                <th className="py-3.5 px-3">Card Type</th>
                <th className="py-3.5 px-3">Card Name</th>
                <th className="py-3.5 px-3">Linked Account Numbers</th>
                <th className="py-3.5 px-3">Activated Timestamp</th>
                <th className="py-3.5 px-3">Expiration Timestamp</th>
                <th className="py-3.5 px-3 text-center">Closed Timestamp</th>
                <th className="py-3.5 px-3 text-center">Card Block Code / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="font-bold text-slate-800 text-sm">Kartu Debit Tidak Ditemukan</div>
                      <p className="text-xs text-slate-500">
                        Tidak ada data kartu debit yang sesuai dengan kriteria pencarian atau filter yang dipilih.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filter</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCards.map((card, idx) => (
                  <tr 
                    key={card.id} 
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedCard(card)}
                  >
                    {/* 1. No */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* 2. Action (Detail Button) */}
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-detail-card-${card.id.toLowerCase()}`}
                        onClick={() => setSelectedCard(card)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-semibold transition-all shadow-2xs group-hover:bg-blue-600 group-hover:text-white cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>

                    {/* 3. Card ID */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {card.cardId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{card.cif}</span>
                    </td>

                    {/* 4. Card Number (Masked) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-900 bg-blue-50/60 px-2.5 py-1 rounded border border-blue-200 text-xs inline-block">
                        {card.cardNumber}
                      </div>
                    </td>

                    {/* 5. Card Type */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{card.cardType}</div>
                      <span className="text-[10px] text-slate-400">{card.chipType?.slice(0, 20)}</span>
                    </td>

                    {/* 6. Card Name */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 uppercase font-mono group-hover:text-blue-700 transition">
                        {card.cardName}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {card.customerName}
                      </div>
                    </td>

                    {/* 7. Linked Account Numbers */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5 max-w-xs">
                        {card.linkedAccountNumbers.map((acc, accIdx) => (
                          <div key={accIdx} className="text-[11px] font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 truncate">
                            {acc}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* 8. Activated Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{card.activatedTimestamp}</span>
                      </div>
                    </td>

                    {/* 9. Expiration Timestamp */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-blue-700 font-medium text-[11px]">
                      {card.expirationTimestamp}
                    </td>

                    {/* 10. Closed Timestamp */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                      <span className={cn(
                        card.closedTimestamp !== '-' ? "text-red-600 font-bold" : "text-slate-400"
                      )}>
                        {card.closedTimestamp}
                      </span>
                    </td>

                    {/* 11. Card Block Code / Status */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <div className="space-y-1">
                        {renderStatusBadge(card.status)}
                        <div className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">
                          {card.cardBlockCode.split(' ')[0]} {card.cardBlockCode.split(' ')[1] || ''}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Debit Card Management System (CMS) • Bank Sampoerna</span>
          <span className="font-mono text-[11px] text-slate-400">EMV ISO/IEC 7816 &amp; GPN Compliant</span>
        </div>
      </div>
    </div>
  );
};
