import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  FolderClock, 
  Receipt, 
  ShieldCheck, 
  ShieldAlert, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  FileText, 
  UserCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Smartphone,
  Eye,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { CustomerProfileRecord, CustomerTransactionRecord } from '../../types/fms';
import { CustomerTransactionDetailModal } from './CustomerTransactionDetailModal';
import { cn } from '../../lib/utils';

interface CustomerProfileDetailProps {
  searchedAccount?: string | null;
  customer: CustomerProfileRecord;
  onBackToList: () => void;
}

export const CustomerProfileDetail: React.FC<CustomerProfileDetailProps> = ({
  customer,
  onBackToList,
  searchedAccount
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'accounts' | 'cases' | 'transactions'>('profile');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Transaction History State
  const [selectedTxnModal, setSelectedTxnModal] = useState<CustomerTransactionRecord | null>(null);
  const [sourceAccountFilter, setSourceAccountFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [txnSearchQuery, setTxnSearchQuery] = useState<string>('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Helper badge styles
  const getRiskBadge = (risk: 'High' | 'Medium' | 'Low') => {
    switch (risk) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            High Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Medium Risk
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Low Risk
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-customer-list"
            onClick={onBackToList}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to List</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Customer Profile</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{customer.cif}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 font-medium">Detail 360° View</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            System ID: {customer.id}
          </span>
          <span className="text-[11px] font-medium text-slate-600 bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded font-mono">
            Bank Sampoerna Core CIF
          </span>
        </div>
      </div>

      {/* 2. UPPER SUMMARY HEADER BOX (3-Column Layout) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 px-6 py-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              <User className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {customer.customerName}
                </h1>
                <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-mono border border-blue-400/30">
                  {customer.customerType}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>CIF: <strong className="font-mono text-white">{customer.cif}</strong></span>
                <span>•</span>
                <span>ID: <strong className="font-mono text-white">{customer.id}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(customer.customerStatus)}
            {getRiskBadge(customer.riskRatingTest)}
          </div>
        </div>

        {/* 3-Column Summary Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
          {/* Kolom 1: Customer ID, CIF, Name */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Identity Summary</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Customer ID:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {customer.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Customer CIF:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {customer.cif}
                  </span>
                  <button
                    onClick={() => handleCopy(customer.cif, 'cif')}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100 cursor-pointer"
                    title="Copy CIF"
                  >
                    {copiedKey === 'cif' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-500 font-medium">Customer Name:</span>
                <span className="font-semibold text-slate-900 text-right max-w-[180px]">
                  {customer.customerName}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Customer Start Date, Branch ID, CR Manager */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Relationship &amp; Branch</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Customer Start Date:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {customer.customerStartDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Branch ID:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {customer.branchId}
                </span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-500 font-medium">CR Manager:</span>
                <span className="font-semibold text-blue-700 text-right max-w-[180px]">
                  {customer.crManager}
                </span>
              </div>
            </div>
          </div>

          {/* Kolom 3: Last Due Diligence, Status, Risk Rating */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Compliance &amp; Risk Rating</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Last Due Diligence:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {customer.dateOfLastDueDiligence}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Customer Status:</span>
                <div>{getStatusBadge(customer.customerStatus)}</div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500 font-medium">Risk Rating Test:</span>
                <div>{getRiskBadge(customer.riskRatingTest)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN NAVIGATION TABS (4 Horizontal Tabs) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-3 bg-slate-50/50 flex flex-wrap gap-2">
          {/* Tab 1: Customer Profile (Active Default) */}
          <button
            id="tab-customer-profile-main"
            onClick={() => setActiveSubTab('profile')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeSubTab === 'profile'
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg -mb-px"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>Customer Profile</span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {/* Tab 2: Account Profile (Placeholder / Preview) */}
          <button
            id="tab-account-profile-main"
            onClick={() => setActiveSubTab('accounts')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeSubTab === 'accounts'
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg -mb-px"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Account Profile</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-200 text-slate-600 font-semibold">
              {customer.totalAccountsCount || 3} Rekening
            </span>
          </button>

          {/* Tab 3: Case History (Placeholder / Preview) */}
          <button
            id="tab-case-history-main"
            onClick={() => setActiveSubTab('cases')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeSubTab === 'cases'
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg -mb-px"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <FolderClock className="w-4 h-4 text-slate-400" />
            <span>Case History</span>
            <span className={cn(
              "px-1.5 py-0.2 text-[10px] font-mono rounded font-semibold",
              (customer.totalActiveAlertsCount || 0) > 0 ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600"
            )}>
              {customer.totalActiveAlertsCount || 0} Alerts
            </span>
          </button>

          {/* Tab 4: Transaction History (Placeholder / Preview) */}
          <button
            id="tab-transaction-history-main"
            onClick={() => setActiveSubTab('transactions')}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeSubTab === 'transactions'
                ? "border-blue-600 text-blue-700 bg-white shadow-2xs rounded-t-lg -mb-px"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 rounded-t-lg"
            )}
          >
            <Receipt className="w-4 h-4 text-slate-400" />
            <span>Transaction History</span>
            <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-200 text-slate-600 font-semibold">
              Activity
            </span>
          </button>
        </div>

        {/* 4. TAB CONTENTS */}
        <div className="p-6">
          {/* TAB 1: CUSTOMER PROFILE (PERSONAL & GENERAL INFORMATION) */}
          {activeSubTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Section: Personal & General Information (2-Column Form Readonly) */}
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Personal &amp; General Information</h2>
                      <p className="text-xs text-slate-500">Data identitas nasabah terverifikasi berdasarkan kependudukan dan sistem registrasi.</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> e-KYC Verified
                  </span>
                </div>

                {/* 2-Column Readonly Form Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kolom Kiri: Email, Person ID, Customer Source, Customer Type, ID Type */}
                  <div className="space-y-4 bg-slate-50/60 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Account &amp; Registration Specs</span>
                    </h3>

                    {/* 1. Email Address */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs">
                        <div className="flex items-center gap-2 font-mono">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{customer.emailAddress}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(customer.emailAddress, 'email')}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* 2. Person ID */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Person ID
                      </label>
                      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs">
                        <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{customer.personId}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(customer.personId, 'personId')}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          title="Copy Person ID"
                        >
                          {copiedKey === 'personId' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* 3. Customer Source */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Customer Source
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 shadow-2xs">
                        {customer.customerSource}
                      </div>
                    </div>

                    {/* 4. Customer Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Customer Type
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs flex items-center justify-between shadow-2xs">
                        <span className="font-semibold text-slate-900">{customer.customerType}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-mono border border-blue-200 font-semibold">
                          Classification Level A
                        </span>
                      </div>
                    </div>

                    {/* 5. ID Type & ID Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        ID Type (KTP / SIM / Paspor)
                      </label>
                      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold text-[11px] border border-slate-200">
                            {customer.idType}
                          </span>
                          <span className="font-mono font-bold text-slate-900">{customer.idNumber}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(customer.idNumber, 'idNumber')}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                          title="Copy ID Number"
                        >
                          {copiedKey === 'idNumber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Tax ID / NPWP */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Tax ID / NPWP
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-800 shadow-2xs flex justify-between items-center">
                        <span>{customer.taxId || '00.000.000.0-000.000'}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans font-semibold">DJP Valid</span>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Full Name, Nick Name, Gender, Date of Birth, Place of Birth */}
                  <div className="space-y-4 bg-slate-50/60 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Personal Demographics</span>
                    </h3>

                    {/* 1. Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Full Name (Sesuai KTP/Paspor)
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 shadow-2xs">
                        {customer.fullName}
                      </div>
                    </div>

                    {/* 2. Nick Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nick Name / Alias
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 shadow-2xs">
                        {customer.nickName || '-'}
                      </div>
                    </div>

                    {/* 3. Gender */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Gender
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 shadow-2xs flex items-center justify-between">
                        <span>{customer.gender === 'Male' ? 'Laki-laki (Male)' : 'Perempuan (Female)'}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                          {customer.gender}
                        </span>
                      </div>
                    </div>

                    {/* 4. Date of Birth */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Date of Birth (Tanggal Lahir)
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 shadow-2xs flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{customer.dateOfBirth}</span>
                      </div>
                    </div>

                    {/* 5. Place of Birth */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Place of Birth (Tempat Lahir)
                      </label>
                      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 shadow-2xs flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{customer.placeOfBirth}</span>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Phone Number (Nomor Telepon/HP)
                      </label>
                      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 shadow-2xs font-mono">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{customer.phoneNumber || '-'}</span>
                        </div>
                        <span className="text-[10px] font-sans text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                          WhatsApp Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Secondary Information (Address & Occupation) */}
              <div className="pt-2">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
                  <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Address &amp; Occupation Profile</h2>
                    <p className="text-xs text-slate-500">Informasi domisili, profil pekerjaan, dan estimasi kemampuan finansial nasabah.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Address Box */}
                  <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>Alamat Domisili &amp; Wilayah</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Alamat Lengkap:</span>
                        <div className="bg-white p-3 rounded-lg border border-slate-300 text-slate-800 font-medium">
                          {customer.address}, {customer.city}, {customer.province} ({customer.postalCode}), {customer.country}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Kota / Kabupaten</span>
                          <span className="font-semibold text-slate-800">{customer.city || 'Jakarta'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Kode Pos</span>
                          <span className="font-mono font-semibold text-slate-800">{customer.postalCode || '10110'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Occupation & Financial Box */}
                  <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-200">
                      <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                      <span>Pekerjaan &amp; Profil Sumber Dana</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Profesi / Jabatan:</span>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800">
                          {customer.occupation || '-'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Nama Perusahaan / Tempat Usaha:</span>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-medium text-slate-800">
                          {customer.employerName || '-'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Range Penghasilan</span>
                          <span className="font-semibold text-blue-700">{customer.monthlyIncomeRange || 'Standard'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">PEP Status</span>
                          <span className={cn(
                            "font-bold text-xs",
                            customer.pepStatus ? "text-red-700" : "text-emerald-700"
                          )}>
                            {customer.pepStatus ? 'YA (PEP Flagged)' : 'TIDAK (Non-PEP)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Registered Device (POIN C - STRICTLY 2 FIELDS) */}
              <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Registered Device</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1.5">Device ID (UUID / Hash)</span>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-mono text-xs font-semibold text-slate-800 break-all flex items-center justify-between group">
                      <span>{customer.deviceId || '-'}</span>
                      {customer.deviceId && (
                        <button 
                          onClick={() => handleCopy(customer.deviceId || '', 'device-id')}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
                          title="Copy Device ID"
                        >
                          {copiedKey === 'device-id' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1.5">Device Model</span>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800">
                      {customer.deviceModel || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Notes & AML Compliance Status */}
              {customer.notes && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="font-bold text-blue-900 block mb-0.5">Catatan Investigasi / Compliance Notes:</strong>
                    <p className="text-blue-800">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACCOUNT PROFILE */}
          {activeSubTab === 'accounts' && (
            <div className="space-y-6 animate-fadeIn py-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daftar Rekening Terhubung (CIF: {customer.cif})</h3>
                    <p className="text-xs text-slate-500">Daftar rekening tabungan, giro, dan deposito aktif atas nama nasabah.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                  {customer.associatedAccounts ? customer.associatedAccounts.length : 0} Rekening Terdaftar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.associatedAccounts && customer.associatedAccounts.map((acc, idx) => {
                  const isHighlighted = searchedAccount && acc.accountNumber.includes(searchedAccount);
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 bg-white rounded-xl border ${isHighlighted ? 'border-amber-400 shadow-md ring-2 ring-amber-100' : 'border-slate-200 shadow-2xs hover:border-blue-300'} transition space-y-2.5`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                          acc.accountType.includes('GIRO') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          acc.accountType.includes('DEPOSITO') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {acc.accountType}
                        </span>
                        <span className={`text-xs font-semibold flex items-center gap-1 ${
                          acc.status === 'Active' ? 'text-emerald-600' : 
                          acc.status === 'Inactive' ? 'text-slate-500' : 
                          acc.status === 'Dormant' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            acc.status === 'Active' ? 'bg-emerald-500' : 
                            acc.status === 'Inactive' ? 'bg-slate-400' : 
                            acc.status === 'Dormant' ? 'bg-orange-500' : 'bg-red-500'
                          }`} /> {acc.status}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-base text-slate-900 flex items-center gap-2">
                        {acc.accountNumber}
                        {isHighlighted && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] uppercase tracking-wider rounded border border-amber-300 font-sans">
                            Matched
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                        <span>Cabang: {customer.branchId || 'Pusat'}</span>
                        <span className="font-bold text-slate-800">Saldo: Rp {acc.balance.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CASE HISTORY (PLACEHOLDER / PREVIEW) */}
          {activeSubTab === 'cases' && (
            <div className="space-y-6 animate-fadeIn py-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <FolderClock className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Riwayat Kasus Alert &amp; Investigasi (CIF: {customer.cif})</h3>
                    <p className="text-xs text-slate-500">Daftar tiket investigasi Fraud dan AML yang pernah menargetkan profil nasabah ini.</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded font-mono text-xs font-bold",
                  (customer.totalActiveAlertsCount || 0) > 0 ? "bg-red-100 text-red-800 border border-red-200" : "bg-emerald-100 text-emerald-800"
                )}>
                  {customer.totalActiveAlertsCount || 0} Alert Aktif
                </span>
              </div>

              {(customer.totalActiveAlertsCount || 0) > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-xl border border-red-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-mono font-bold text-xs">
                        CAS-20260828-00108
                      </span>
                      <span className="text-xs font-bold text-red-600">Urgency: HIGH</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      R-TRX-HIGH-VAL-001: High Value Outlier Transaction Detection
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Status: Open (Investigation in progress)</span>
                      <span>Loss Exposure: Rp 450.000.000</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-800">Tidak Ada Kasus Aktif</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Nasabah tidak memiliki catatan alert kritis yang sedang terbuka.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRANSACTION HISTORY (NEO FMS V1.22 ENHANCED) */}
          {activeSubTab === 'transactions' && (() => {
            const rawTransactions = customer.transactionHistory || [];
            
            // Filter transactions
            const filteredTransactions = rawTransactions.filter(txn => {
              const srcAcc = txn.sourceAccount || txn.accountNumber || '';
              if (sourceAccountFilter !== 'ALL' && srcAcc !== sourceAccountFilter) {
                return false;
              }
              if (categoryFilter !== 'ALL' && txn.transactionCategory !== categoryFilter) {
                return false;
              }
              if (txnSearchQuery.trim()) {
                const query = txnSearchQuery.toLowerCase();
                const matchId = txn.id?.toLowerCase().includes(query);
                const matchRef = txn.transactionRef?.toLowerCase().includes(query);
                const matchBeneName = txn.beneficiaryAccountName?.toLowerCase().includes(query);
                const matchBeneAcc = txn.beneficiaryAccountNumber?.toLowerCase().includes(query);
                const matchVaName = txn.beneficiaryVaName?.toLowerCase().includes(query);
                const matchVaNum = txn.beneficiaryVaNumber?.toLowerCase().includes(query);
                const matchSrc = srcAcc.toLowerCase().includes(query);
                const matchChannel = txn.channel?.toLowerCase().includes(query);
                return matchId || matchRef || matchBeneName || matchBeneAcc || matchVaName || matchVaNum || matchSrc || matchChannel;
              }
              return true;
            });

            // Calculate metrics
            const totalCount = rawTransactions.length;
            const totalOutflow = rawTransactions
              .filter(t => t.transactionCategory === 'Outgoing Transfer' || t.direction === 'DB')
              .reduce((acc, t) => acc + (t.amount || 0), 0);
            const totalInflow = rawTransactions
              .filter(t => t.transactionCategory === 'Incoming Transfer' || t.direction === 'CR')
              .reduce((acc, t) => acc + (t.amount || 0), 0);
            const uniqueSourceAccounts = Array.from(new Set(rawTransactions.map(t => t.sourceAccount || t.accountNumber).filter(Boolean)));

            const formatIDR = (val: number) => {
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(val);
            };

            return (
              <div className="space-y-6 animate-fadeIn py-2">
                {/* 1. SECTION HEADER BANNER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-700">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          Riwayat Transaksi Finansial Nasabah
                        </h3>
                        <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                          CIF: {customer.cif}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Audit mutasi debit/kredit multi-rekening sumber dengan 14 field telemetri lengkap. Klik baris atau tombol <b>Detail</b> untuk membuka modal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed v1.22
                    </span>
                  </div>
                </div>

                {/* 2. SUMMARY METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Total Transaksi</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-900 mt-1">
                      {totalCount} <span className="text-xs font-normal text-slate-500">Record</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Total Inflow (Masuk)</span>
                    </div>
                    <div className="text-sm sm:text-base font-black font-mono text-emerald-600 mt-1 truncate">
                      {formatIDR(totalInflow)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                      <span>Total Outflow (Keluar)</span>
                    </div>
                    <div className="text-sm sm:text-base font-black font-mono text-blue-700 mt-1 truncate">
                      {formatIDR(totalOutflow)}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                      <span>Rekening Sumber CIF</span>
                    </div>
                    <div className="text-lg font-black font-mono text-slate-900 mt-1">
                      {uniqueSourceAccounts.length || customer.associatedAccounts?.length || 1} <span className="text-xs font-normal text-slate-500">Akun</span>
                    </div>
                  </div>
                </div>

                {/* 3. FILTER BAR */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-search-transaction-history"
                        type="text"
                        value={txnSearchQuery}
                        onChange={(e) => setTxnSearchQuery(e.target.value)}
                        placeholder="Cari Trx ID, No. Referensi FT, Nama Penerima, Rekening Sumber, atau No. VA..."
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {txnSearchQuery && (
                        <button
                          onClick={() => setTxnSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Source Account Filter Dropdown */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-600 shrink-0">Rek. Sumber:</span>
                        <select
                          id="select-filter-source-account"
                          value={sourceAccountFilter}
                          onChange={(e) => setSourceAccountFilter(e.target.value)}
                          className="bg-transparent border-0 text-xs font-medium text-slate-800 focus:ring-0 focus:outline-hidden py-0.5 cursor-pointer"
                        >
                          <option value="ALL">Semua Rekening Sumber ({uniqueSourceAccounts.length})</option>
                          {customer.associatedAccounts && customer.associatedAccounts.length > 0 ? (
                            customer.associatedAccounts.map(acc => (
                              <option key={acc.accountNumber} value={acc.accountNumber}>
                                {acc.accountNumber} - {acc.accountType}
                              </option>
                            ))
                          ) : (
                            uniqueSourceAccounts.map(acc => (
                              <option key={acc} value={acc}>
                                {acc}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Category Filter Dropdown */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-600 shrink-0">Kategori:</span>
                        <select
                          id="select-filter-category"
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-transparent border-0 text-xs font-medium text-slate-800 focus:ring-0 focus:outline-hidden py-0.5 cursor-pointer"
                        >
                          <option value="ALL">Semua Kategori</option>
                          <option value="Outgoing Transfer">Outgoing Transfer</option>
                          <option value="Incoming Transfer">Incoming Transfer</option>
                          <option value="ONUS">ONUS</option>
                        </select>
                      </div>

                      {/* Reset Filters */}
                      {(sourceAccountFilter !== 'ALL' || categoryFilter !== 'ALL' || txnSearchQuery) && (
                        <button
                          onClick={() => {
                            setSourceAccountFilter('ALL');
                            setCategoryFilter('ALL');
                            setTxnSearchQuery('');
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. MAIN TRANSACTION HISTORY TABLE (WITH SOURCE ACCOUNT & DETAIL ACTION) */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-3.5 whitespace-nowrap">Waktu &amp; Tanggal</th>
                          <th className="py-3 px-3.5 whitespace-nowrap">Trx ID &amp; Ref</th>
                          {/* 1. MANDATORY: SOURCE ACCOUNT COLUMN */}
                          <th className="py-3 px-3.5 whitespace-nowrap bg-blue-50/60 text-blue-900 border-x border-blue-100">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-700" />
                              <span>Source Account</span>
                            </div>
                          </th>
                          <th className="py-3 px-3.5 whitespace-nowrap">Kategori</th>
                          <th className="py-3 px-3.5 whitespace-nowrap">Channel</th>
                          <th className="py-3 px-3.5 min-w-[180px]">Penerima / Tujuan (VA)</th>
                          <th className="py-3 px-3.5 text-right whitespace-nowrap">Nominal (IDR)</th>
                          <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
                          <th className="py-3 px-3.5 text-center whitespace-nowrap">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-500">
                              <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="font-semibold text-slate-700">Tidak ada data transaksi yang sesuai filter.</p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Coba ubah kata kunci pencarian atau reset filter rekening sumber.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((txn, idx) => {
                            const isOutgoing = txn.transactionCategory === 'Outgoing Transfer' || txn.direction === 'DB';
                            const isIncoming = txn.transactionCategory === 'Incoming Transfer' || txn.direction === 'CR';
                            const isONUS = txn.transactionCategory === 'ONUS';
                            const isSuccess = txn.status === 'BERHASIL' || txn.status === 'SUCCESS';
                            const srcAcc = txn.sourceAccount || txn.accountNumber || '-';

                            const hasVA = txn.beneficiaryVaName && txn.beneficiaryVaName !== '-';

                            return (
                              <tr
                                key={txn.id || idx}
                                id={`row-customer-txn-${txn.id}`}
                                onClick={() => setSelectedTxnModal(txn)}
                                className="hover:bg-blue-50/60 transition cursor-pointer group"
                                title="Klik untuk melihat 14 Field Detail Transaksi Lengkap"
                              >
                                {/* Waktu */}
                                <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                                  <div className="font-bold text-slate-800">{txn.transactionDate?.split(' ')[0] || txn.transactionDate}</div>
                                  <div className="text-slate-400 text-[10px]">{txn.transactionDate?.split(' ')[1] || ''}</div>
                                </td>

                                {/* Trx ID & Ref */}
                                <td className="py-3 px-3.5 whitespace-nowrap font-mono">
                                  <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                                    {txn.id}
                                  </div>
                                  <div className="text-[10px] text-blue-600 font-semibold">
                                    {txn.transactionRef || '-'}
                                  </div>
                                </td>

                                {/* 1. MANDATORY SOURCE ACCOUNT COLUMN */}
                                <td className="py-3 px-3.5 whitespace-nowrap bg-blue-50/30 border-x border-blue-100 font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-blue-950 text-xs bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                                      {srcAcc}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5 font-sans truncate max-w-[170px]">
                                    {txn.sourceAccountType || 'Tabungan / Giro Utama'}
                                  </div>
                                </td>

                                {/* Kategori */}
                                <td className="py-3 px-3.5 whitespace-nowrap">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border",
                                    isIncoming && "bg-emerald-50 text-emerald-800 border-emerald-200",
                                    isOutgoing && "bg-blue-50 text-blue-800 border-blue-200",
                                    isONUS && "bg-purple-50 text-purple-800 border-purple-200"
                                  )}>
                                    {isIncoming && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                                    {isOutgoing && <ArrowUpRight className="w-3 h-3 text-blue-600" />}
                                    {isONUS && <RefreshCw className="w-3 h-3 text-purple-600" />}
                                    <span>{txn.transactionCategory}</span>
                                  </span>
                                </td>

                                {/* Channel */}
                                <td className="py-3 px-3.5 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                                    {txn.channel || 'BI-FAST'}
                                  </span>
                                </td>

                                {/* Penerima & VA */}
                                <td className="py-3 px-3.5">
                                  <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                                    {txn.beneficiaryAccountName || '-'}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                    <span>{txn.beneficiaryAccountNumber || '-'}</span>
                                    {hasVA && (
                                      <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-1 rounded">
                                        VA
                                      </span>
                                    )}
                                  </div>
                                  {hasVA && (
                                    <div className="text-[9px] text-indigo-700 truncate max-w-[200px]">
                                      {txn.beneficiaryVaName}
                                    </div>
                                  )}
                                </td>

                                {/* Nominal */}
                                <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                                  <span className={cn(
                                    isIncoming ? "text-emerald-600" : isOutgoing ? "text-slate-900" : "text-purple-700"
                                  )}>
                                    {isIncoming ? '+' : isOutgoing ? '-' : ''} {formatIDR(txn.amount)}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded font-bold text-[10px] border",
                                    isSuccess 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                      : "bg-red-50 text-red-700 border-red-200"
                                  )}>
                                    {txn.status}
                                  </span>
                                </td>

                                {/* 2. MANDATORY: DETAIL BUTTON */}
                                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                  <button
                                    id={`btn-detail-txn-${txn.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTxnModal(txn);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition shadow-2xs cursor-pointer group-hover:scale-105"
                                    title="Lihat 14 Field Detail Transaksi"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Detail</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer / Counter */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                    <span>
                      Menampilkan <b>{filteredTransactions.length}</b> dari <b>{totalCount}</b> total transaksi finansial nasabah.
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Klik baris atau tombol Detail untuk membuka lembar audit 14 parameter.
                    </span>
                  </div>
                </div>

                {/* 5. TRANSACTION DETAIL POP-UP MODAL (14 MANDATORY FIELDS) */}
                {selectedTxnModal && (
                  <CustomerTransactionDetailModal
                    transaction={selectedTxnModal}
                    cif={customer.cif}
                    customerName={customer.customerName}
                    onClose={() => setSelectedTxnModal(null)}
                  />
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 5. BOTTOM BACK ACTION BUTTON */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="btn-back-to-customer-list-bottom"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Kembali ke Halaman Daftar Nasabah</span>
        </button>

        <span className="text-xs text-slate-400">
          Neo FMS 360° Customer Profile Engine
        </span>
      </div>
    </div>
  );
};
