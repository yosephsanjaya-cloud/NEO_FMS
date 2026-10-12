import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserCheck, 
  Eye, 
  Building2, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  ChevronRight, 
  RotateCcw,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info
} from 'lucide-react';
import { CustomerProfileRecord, CustomerStatusType } from '../../types/fms';
import { useCustomer } from '../../context/CustomerContext';
import { CustomerProfileDetail } from '../../components/profile/CustomerProfileDetail';
import { cn } from '../../lib/utils';

export const CustomerProfilePage: React.FC = () => {
  const { customers, selectedCustomer, setSelectedCustomer } = useCustomer();
  const [searchedAccount, setSearchedAccount] = useState<string | null>(null);

  const handleSelectCustomer = (cust: CustomerProfileRecord) => {
    setSelectedCustomer(cust);
    const query = searchQuery.trim();
    if (query && cust.associatedAccounts?.some(a => a.accountNumber.includes(query))) {
      setSearchedAccount(query);
    } else {
      setSearchedAccount(null);
    }
  };

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CustomerStatusType>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL');

  // Filtered List Computation
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Search Query (CIF or Customer Name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchCif = c.cif.toLowerCase().includes(query);
        const matchName = c.customerName.toLowerCase().includes(query);
        const matchId = c.id.toLowerCase().includes(query);
        const matchRm = c.crManager.toLowerCase().includes(query);
        const matchAccount = c.associatedAccounts?.some(acc => acc.accountNumber.includes(query));
        if (!matchCif && !matchName && !matchId && !matchRm && !matchAccount) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL' && c.customerStatus !== statusFilter) {
        return false;
      }

      // 3. Risk Filter
      if (riskFilter !== 'ALL' && c.riskRatingTest !== riskFilter) {
        return false;
      }

      return true;
    });
  }, [customers, searchQuery, statusFilter, riskFilter]);

  // Summary Metrics
  const totalCustomers = customers.length;
  const activeCount = customers.filter(c => c.customerStatus === 'Active').length;
  const highRiskCount = customers.filter(c => c.riskRatingTest === 'High').length;
  const inactiveCount = customers.filter(c => c.customerStatus === 'Inactive').length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setRiskFilter('ALL');
  };

  // If a customer is selected, render the Detail 360 View
  if (selectedCustomer) {
    return (
      <CustomerProfileDetail 
        customer={selectedCustomer} 
        onBackToList={() => setSelectedCustomer(null)}
        searchedAccount={searchedAccount} 
      />
    );
  }

  // Helper Badge Renderers
  const renderStatusBadge = (status: CustomerStatusType) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      case 'Dormant':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Dormant
          </span>
        );
      case 'Suspend / Blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Suspend / Blocked
          </span>
        );
      default:
        return null;
    }
  };

  const renderRiskBadge = (risk: 'High' | 'Medium' | 'Low') => {
    switch (risk) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. PAGE TITLE & OVERVIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Customer Profile
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Main Customer Lookup &amp; Comprehensive 360° Profile Analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold font-mono">
            Bank Sampoerna Core Directory
          </span>
        </div>
      </div>

      {/* 2. STATS CARDS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Nasabah</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalCustomers}</span>
            <span className="text-[11px] text-slate-400">Profiles</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status Aktif</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Verified Active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">High Risk Rating</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-600">{highRiskCount}</span>
            <span className="text-[11px] text-red-500 font-medium">EDD Required</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Inactive / Suspended</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-700">{inactiveCount}</span>
            <span className="text-[11px] text-slate-400">Dormant / Blocked</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input: CIF or Customer Name */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-customer"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan CIF (misal: CIF1089201), Nama Nasabah, ID, atau Relationship Manager..."
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

          {/* Filter Status: Active / Inactive / All */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
            </div>
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Dormant">Dormant</option>
              <option value="Suspend / Blocked">Suspend / Blocked</option>
            </select>

            {/* Filter Risk Rating */}
            <select
              id="select-filter-risk"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Risk Rating</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            {(searchQuery || statusFilter !== 'ALL' || riskFilter !== 'ALL') && (
              <button
                id="btn-reset-customer-filters"
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

        {/* Filter Summary & Total Results */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Menampilkan <strong className="text-slate-800 font-mono">{filteredCustomers.length}</strong> dari <span className="font-mono">{totalCustomers}</span> nasabah terdaftar
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Klik tombol "Detail" pada baris tabel untuk membuka 360° view</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN CUSTOMER LOOKUP TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4 text-center w-28">Action</th>
                <th className="py-3.5 px-4">CIF</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Customer Start Date</th>
                <th className="py-3.5 px-4">Customer Relationship Manager</th>
                <th className="py-3.5 px-4">Account Summary</th>
                <th className="py-3.5 px-4 text-center">Risk</th>
                <th className="py-3.5 px-4 text-center">Customer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="font-bold text-slate-800 text-sm">Nasabah Tidak Ditemukan</div>
                      <p className="text-xs text-slate-500">
                        Tidak ada data profil nasabah yang sesuai dengan kriteria pencarian atau filter yang dipilih.
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
                filteredCustomers.map((cust, idx) => (
                  <tr 
                    key={cust.id} 
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => handleSelectCustomer(cust)}
                  >
                    {/* 1. No */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* 2. Action (Detail Button) */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-detail-customer-${cust.cif.toLowerCase()}`}
                        onClick={() => handleSelectCustomer(cust)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-semibold transition-all shadow-2xs group-hover:bg-blue-600 group-hover:text-white cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>

                    {/* 3. CIF */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {cust.cif}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{cust.id}</span>
                    </td>

                    {/* 4. Customer Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {cust.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{cust.customerType}</span>
                        <span>•</span>
                        <span className="text-slate-400">{cust.idType}: {cust.idNumber}</span>
                      </div>
                    </td>

                    {/* 5. Customer Start Date */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cust.customerStartDate}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{cust.branchId}</span>
                    </td>

                    {/* 6. Customer Relationship Manager */}
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-medium text-slate-900">{cust.crManager}</div>
                      <div className="text-[10px] text-slate-400">Due Diligence: {cust.dateOfLastDueDiligence}</div>
                    </td>

                    {/* 6.5 Account Summary */}
                    <td className="py-3.5 px-4">
                      {cust.associatedAccounts && cust.associatedAccounts.length > 0 ? (
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">{cust.associatedAccounts.length} Rekening</span>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-[140px] truncate">
                            ({cust.associatedAccounts.map(a => a.accountNumber).join(', ')})
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No accounts</span>
                      )}
                    </td>

                    {/* 7. Risk Rating */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderRiskBadge(cust.riskRatingTest)}
                    </td>

                    {/* 8. Customer Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(cust.customerStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Navigation Note */}
        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Neo FMS Centralized Customer Profile Directory • Bank Sampoerna</span>
          <span className="font-mono text-[11px] text-slate-400">Real-time Core Data Synchronization</span>
        </div>
      </div>
    </div>
  );
};
