import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Scale, 
  UserCheck, 
  CreditCard, 
  Smartphone, 
  Phone, 
  Tag, 
  Info, 
  CheckCircle2, 
  Layers, 
  Sliders,
  Clock,
  Lock
} from 'lucide-react';
import { ListEntry, ListType, ListCategory, EntitySubTab, RuleBasic } from '../../types/fms';
import { useAuth } from '../../context/AuthContext';

interface BlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entryData: any) => void;
  editingEntry?: ListEntry | null;
  activeDomain: 'FRAUD' | 'AML';
  activeEntitySubTab: string;
  activeListType: ListType;
  ruleBasics: RuleBasic[];
}

export const BlacklistModal: React.FC<BlacklistModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEntry,
  activeDomain,
  activeEntitySubTab,
  activeListType,
  ruleBasics
}) => {
  const { user } = useAuth();

  const isSysAdmin = Boolean(
    !user ||
    user.username === 'sysadmin' ||
    user.riskDomain === 'FULL ACCESS' ||
    user.group?.toLowerCase().includes('it dca') ||
    user.group?.toLowerCase().includes('admin') ||
    user.role?.toLowerCase().includes('admin')
  );

  const isFraudRole = Boolean(
    !isSysAdmin && (
      user?.riskDomain === 'FRAUD ONLY' ||
      user?.group?.includes('AFC') ||
      user?.username?.includes('afc') ||
      user?.role?.toLowerCase().includes('fraud')
    )
  );

  const isAmlRole = Boolean(
    !isSysAdmin && (
      user?.riskDomain === 'AML ONLY' ||
      user?.group?.includes('Analyst') ||
      user?.username?.includes('analyst') ||
      user?.role?.toLowerCase().includes('aml')
    )
  );

  const [domain, setDomain] = useState<'FRAUD' | 'AML'>(
    isFraudRole ? 'FRAUD' : isAmlRole ? 'AML' : activeDomain
  );
  const [type, setType] = useState<ListType>(activeListType || 'Blacklist');
  const [entityType, setEntityType] = useState<EntitySubTab>(
    (activeEntitySubTab && activeEntitySubTab !== 'All' ? activeEntitySubTab : 'Source Account Number') as EntitySubTab
  );
  const [value, setValue] = useState('');
  const [holderName, setHolderName] = useState('');
  const [reason, setReason] = useState('');
  const [source, setSource] = useState('Laporan Satgas PASTI / OJK');
  const [tagsInput, setTagsInput] = useState('High Risk, Indikasi Kejahatan');
  const [riskWeight, setRiskWeight] = useState<number>(95);
  const [status, setStatus] = useState<any>('Pending Approval');
  const [applyToAllRules, setApplyToAllRules] = useState<boolean>(true);
  const [appliedRuleCodes, setAppliedRuleCodes] = useState<string[]>([]);
  
  // Whitelist specific states
  const [whitelistType, setWhitelistType] = useState<'PERMANENT' | 'DATE_RANGE' | 'RECURRING_MONTHLY'>('PERMANENT');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState<number>(25);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingEntry) {
      setDomain(editingEntry.domain || editingEntry.listCategory || (isFraudRole ? 'FRAUD' : isAmlRole ? 'AML' : activeDomain));
      setType(editingEntry.type || 'Blacklist');
      setEntityType((editingEntry.entityType || editingEntry.category || 'Source Account Number') as EntitySubTab);
      setValue(editingEntry.value || '');
      setHolderName(editingEntry.holderName || editingEntry.customerName || '');
      setReason(editingEntry.reason || '');
      setSource(editingEntry.source || '');
      setTagsInput((editingEntry.tags || []).join(', '));
      setRiskWeight(editingEntry.riskWeight ?? (editingEntry.type === 'Blacklist' ? 95 : 50));
      setStatus(editingEntry.status || 'Active');
      setApplyToAllRules(editingEntry.applyToAllRules !== false);
      setAppliedRuleCodes(editingEntry.appliedRuleCodes || []);
      setWhitelistType(editingEntry.whitelistType || 'PERMANENT');
      setStartDate(editingEntry.startDate || '');
      setEndDate(editingEntry.endDate || '');
      setRecurringDayOfMonth(editingEntry.recurringDayOfMonth || 25);
      setErrorMsg('');
    } else {
      const enforcedDomain: 'FRAUD' | 'AML' = isFraudRole ? 'FRAUD' : isAmlRole ? 'AML' : activeDomain;
      setDomain(enforcedDomain);
      setType(activeListType || 'Blacklist');
      setEntityType(
        (activeEntitySubTab && activeEntitySubTab !== 'All' ? activeEntitySubTab : 'Source Account Number') as EntitySubTab
      );
      setValue('');
      setHolderName('');
      setReason('');
      setSource(enforcedDomain === 'FRAUD' ? 'Laporan Satgas PASTI / OJK' : 'PPATK STR Datafeed / DTTOT');
      setTagsInput(enforcedDomain === 'FRAUD' ? 'Scam, Rekening Penampung, Phishing' : 'TPPU / ML, Structuring, Shell Company');
      setRiskWeight(activeListType === 'Blacklist' ? 95 : activeListType === 'Watchlist' ? 50 : 0);
      // STRICT DUAL CONTROL: New submissions MUST start with Pending Approval
      setStatus('Pending Approval');
      setApplyToAllRules(true);
      setAppliedRuleCodes([]);
      setWhitelistType('PERMANENT');
      setStartDate('');
      setEndDate('');
      setRecurringDayOfMonth(25);
      setErrorMsg('');
    }
  }, [editingEntry, activeDomain, activeEntitySubTab, activeListType, isOpen, isFraudRole, isAmlRole]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setErrorMsg('Nilai entitas (Value) wajib diisi');
      return;
    }
    if (!holderName.trim()) {
      setErrorMsg('Nama pemilik / alias terkait wajib diisi');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Alasan registrasi entitas wajib diisi');
      return;
    }
    if (!applyToAllRules && appliedRuleCodes.length === 0) {
      setErrorMsg('Harap pilih minimal 1 Rule Basic spesifik atau pilih opsi Global (Semua Rule)');
      return;
    }
    if (type === 'Whitelist' && whitelistType === 'DATE_RANGE' && (!startDate || !endDate)) {
      setErrorMsg('Tanggal mulai dan selesai wajib diisi untuk whitelist rentang tanggal (Temporary)');
      return;
    }
    if (type === 'Whitelist' && whitelistType === 'RECURRING_MONTHLY' && (!recurringDayOfMonth || recurringDayOfMonth < 1 || recurringDayOfMonth > 31)) {
      setErrorMsg('Tanggal rutin bulanan (Payroll Day) harus di antara 1 sampai 31');
      return;
    }

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    onSave({
      type,
      domain,
      listCategory: domain,
      category: entityType as ListCategory,
      entityType,
      value: value.trim(),
      holderName: holderName.trim(),
      customerName: holderName.trim(),
      reason: reason.trim(),
      source: source.trim() || 'Internal Risk Assessment',
      tags: tagsArray,
      riskWeight: type === 'Whitelist' ? 0 : Number(riskWeight),
      status,
      applyToAllRules,
      appliedRuleCodes,
      whitelistType: type === 'Whitelist' ? whitelistType : undefined,
      startDate: type === 'Whitelist' && whitelistType === 'DATE_RANGE' ? startDate : undefined,
      endDate: type === 'Whitelist' && whitelistType === 'DATE_RANGE' ? endDate : undefined,
      recurringDayOfMonth: type === 'Whitelist' && whitelistType === 'RECURRING_MONTHLY' ? Number(recurringDayOfMonth) : undefined,
    });

    onClose();
  };

  const getPlaceholderByEntity = () => {
    switch (entityType) {
      case 'CIF':
        return 'Contoh: CIF8829103 atau CIF9921045';
      case 'Source Account Number':
        return 'Contoh: 10892019283 atau 88201938472';
      case 'Device ID':
        return 'Contoh: DEV-EMU-NOX-884920 atau DEV-FRIDA-HOOK-99412';
      case 'Phone Number':
        return 'Contoh: 081299482019 atau 085719384729';
      default:
        return 'Masukkan nilai entitas...';
    }
  };

  const entityOptions: { type: EntitySubTab; label: string; icon: any; hint: string }[] = [
    { type: 'CIF', label: 'CIF Nasabah', icon: UserCheck, hint: 'Customer Identification File (Data Nasabah)' },
    { type: 'Source Account Number', label: 'Source Account Number', icon: CreditCard, hint: 'Nomor Rekening Pengirim / Sumber Dana' },
    { type: 'Device ID', label: 'Device ID', icon: Smartphone, hint: 'ID Perangkat Mobile / Web Fingerprint' },
    { type: 'Phone Number', label: 'Phone Number', icon: Phone, hint: 'Nomor Telepon Seluler / MSISDN' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          domain === 'FRAUD' 
            ? 'bg-rose-50/80 border-rose-200 text-rose-950' 
            : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              domain === 'FRAUD' 
                ? 'bg-rose-600 text-white border-rose-700' 
                : 'bg-indigo-600 text-white border-indigo-700'
            }`}>
              {domain === 'FRAUD' ? <ShieldAlert className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {editingEntry ? `Edit Entitas ${type}` : `Tambah Entitas ${type}`}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wide border ${
                  domain === 'FRAUD' 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}>
                  {domain === 'FRAUD' ? '🛡️ FRAUD REGISTRY' : '⚖️ AML REGISTRY'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan daftar entitas pengawasan dan penindakan otomatis transaksi
              </p>
            </div>
          </div>
          <button 
            id="btn-close-blacklist-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Category & Domain Selection with Strict Domain Isolation */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                <span>Kategori Utama Registry (Domain):</span>
              </label>
              {isSysAdmin ? (
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  👑 Sysadmin Domain Switcher
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Domain Terisolasi Sesuai Role</span>
                </span>
              )}
            </div>

            {/* STRICT DOMAIN ISOLATION ON ADD ENTITY MODAL:
                - Role AFC (AFC L1 / AFC L2): ONLY render FRAUD BLACKLIST (hide/lock AML)
                - Role Analyst (Analyst L1 / Analyst L2): ONLY render AML BLACKLIST (hide/lock Fraud)
                - Sysadmin: Domain switcher accessible
            */}
            {isFraudRole ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl border bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-900 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">🛡️ FRAUD {type.toUpperCase()}</div>
                      <div className="text-[10px] text-rose-700">Pendaftaran Khusus Tim Anti-Fraud (Penipuan, Scam, Phishing, Bot)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-rose-200/80 text-rose-900 font-bold text-[10px] rounded-full border border-rose-300">
                      FRAUD ONLY
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Domain dikunci pada <strong>FRAUD</strong> sesuai role aktif Anda ({user?.group || 'AFC Specialist'}). Registrasi AML dinonaktifkan.</span>
                </div>
              </div>
            ) : isAmlRole ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl border bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-900 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <Scale className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold text-xs">⚖️ AML {type.toUpperCase()}</div>
                      <div className="text-[10px] text-indigo-700">Pendaftaran Khusus Tim AML (TPPU, Smurfing, Judol, DTTOT)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-indigo-200/80 text-indigo-900 font-bold text-[10px] rounded-full border border-indigo-300">
                      AML ONLY
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Domain dikunci pada <strong>AML</strong> sesuai role aktif Anda ({user?.group || 'AML Analyst'}). Registrasi Fraud dinonaktifkan.</span>
                </div>
              </div>
            ) : (
              /* Sysadmin Switcher (Full Access) */
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDomain('FRAUD')}
                  className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                    domain === 'FRAUD'
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className={`w-4 h-4 ${domain === 'FRAUD' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-xs">🛡️ FRAUD {type.toUpperCase()}</div>
                      <div className="text-[10px] text-slate-500">Penipuan, Scam, Phishing, Bot</div>
                    </div>
                  </div>
                  {domain === 'FRAUD' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDomain('AML')}
                  className={`p-2.5 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                    domain === 'AML'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Scale className={`w-4 h-4 ${domain === 'AML' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-xs">⚖️ AML {type.toUpperCase()}</div>
                      <div className="text-[10px] text-slate-500">TPPU, Smurfing, Judol, DTTOT</div>
                    </div>
                  </div>
                  {domain === 'AML' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              </div>
            )}
          </div>

          {/* 2. Entity Type Selection */}
          <div className="space-y-2">
            <label className="text-slate-700 font-semibold block">Tipe Entitas Identitas *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {entityOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = entityType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setEntityType(opt.type)}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? domain === 'FRAUD'
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 text-rose-900 font-bold'
                          : 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? (domain === 'FRAUD' ? 'text-rose-600' : 'text-indigo-600') : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Entity Value & Holder Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">
                Nilai Entitas ({entityType}) *
              </label>
              <input
                id="input-entity-value"
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={getPlaceholderByEntity()}
                className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">
                Nama Pemilik / Alias Terkait *
              </label>
              <input
                id="input-holder-name"
                type="text"
                required
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Contoh: Hendrawan Pratama / PT Sindikat Phishing"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition text-xs"
              />
            </div>
          </div>

          {/* Whitelist Configuration Section (if type === 'Whitelist') */}
          {type === 'Whitelist' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-emerald-900 font-bold text-xs flex items-center gap-1.5">
                  <span>✨ Konfigurasi Jenis Whitelist &amp; Durasi</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-mono">Temporary &amp; Recurring Payroll Support</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PERMANENT', label: 'Permanent', desc: 'Selamanya' },
                  { id: 'DATE_RANGE', label: 'Rentang Tanggal', desc: 'Temporary / Event' },
                  { id: 'RECURRING_MONTHLY', label: 'Rutin Bulanan', desc: 'Payroll / Schedule' },
                ].map(wt => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => setWhitelistType(wt.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      whitelistType === wt.id
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-bold'
                        : 'bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
                    }`}
                  >
                    <div className="text-xs font-bold">{wt.label}</div>
                    <div className={`text-[10px] ${whitelistType === wt.id ? 'text-emerald-100' : 'text-slate-500'}`}>{wt.desc}</div>
                  </button>
                ))}
              </div>

              {whitelistType === 'DATE_RANGE' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-emerald-900 font-semibold text-[11px]">Tanggal Mulai (Start Date) *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-emerald-900 font-semibold text-[11px]">Tanggal Selesai (End Date) *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-slate-900 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {whitelistType === 'RECURRING_MONTHLY' && (
                <div className="space-y-1 pt-2">
                  <label className="text-emerald-900 font-semibold text-[11px]">Tanggal Rutin Setiap Bulan (Payroll Day) *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={recurringDayOfMonth}
                      onChange={(e) => setRecurringDayOfMonth(Number(e.target.value))}
                      className="w-32 bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:border-emerald-600"
                    />
                    <span className="text-[11px] text-emerald-800">Contoh: 25 (Berlaku otomatis setiap tanggal 25 setiap bulan untuk jadwal payroll)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Reason & Source */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-semibold">Alasan Registrasi Blacklist *</label>
            <textarea
              id="input-blacklist-reason"
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan pemblokiran, nomor laporan polisi, atau temuan analisis transaksi..."
              className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Sumber Informasi (Source)</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Satgas PASTI / OJK, PPATK, Bareskrim"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Tags (Pisahkan Koma)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Scam, Mule Account, High Risk"
                className="w-full bg-slate-50/50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition text-xs"
              />
            </div>
          </div>

          {/* 5. Risk Weight & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-semibold">Bobot Risiko (Risk Points)</label>
                <span className="font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
                  {riskWeight} Pts
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={riskWeight}
                onChange={(e) => setRiskWeight(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold flex items-center justify-between">
                <span>Status Entitas:</span>
                {!editingEntry && (
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                    Maker-Checker Mandatori
                  </span>
                )}
              </label>

              {!editingEntry ? (
                /* Strict Dual Control Status for New Submissions */
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold text-xs block text-amber-950">Pending Approval</span>
                      <span className="text-[10px] text-amber-700 block">
                        Memerlukan persetujuan L2 Checker sebelum aktif di produksi
                      </span>
                    </div>
                  </div>
                  {isSysAdmin && (
                    <button
                      type="button"
                      onClick={() => setStatus(status === 'Active' ? 'Pending Approval' : 'Active')}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline ml-2 shrink-0 cursor-pointer"
                    >
                      {status === 'Active' ? 'Gunakan Pending' : 'Override ke Active'}
                    </button>
                  )}
                </div>
              ) : (
                /* Editing existing entity */
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="Active">Active (Berlaku & Memblokir)</option>
                  <option value="Pending Approval">Pending Approval (Menunggu Verifikasi L2)</option>
                  <option value="Suspended">Suspended (Ditangguhkan Sementara)</option>
                  <option value="Expired">Expired (Kedaluwarsa)</option>
                  <option value="Revoked">Revoked (Dicabut)</option>
                </select>
              )}
            </div>
          </div>

          {/* 6. Rule Applicability Scope (Global vs Specific) */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" /> Cakupan Penerapan Rule (Rule Scope)
              </label>
              <span className="text-[10px] text-slate-500">Tentukan cakupan penegakan blacklist</span>
            </div>

            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${
                applyToAllRules 
                  ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20' 
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="ruleScope"
                  checked={applyToAllRules}
                  onChange={() => {
                    setApplyToAllRules(true);
                    setAppliedRuleCodes([]);
                  }}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-slate-900 font-bold text-xs block">
                    🌐 GLOBAL (Semua Rule Basic)
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Entitas ini akan langsung memblokir atau menaikkan skor risiko di SELURUH Rule Basic yang aktif di sistem.
                  </span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition ${
                !applyToAllRules 
                  ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20' 
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="ruleScope"
                  checked={!applyToAllRules}
                  onChange={() => setApplyToAllRules(false)}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-slate-900 font-bold text-xs block">
                    🎯 SPECIFIC RULE (Rule Basic Tertentu)
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    Hanya berlaku pada Rule Basic spesifik yang dipilih pada daftar di bawah.
                  </span>
                </div>
              </label>
            </div>

            {!applyToAllRules && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                  <span>Pilih Rule Basic yang Berlaku:</span>
                  <span className="font-mono text-blue-600 font-bold">{appliedRuleCodes.length} Rule Terpilih</span>
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                  {ruleBasics.map(rb => {
                    const isChecked = appliedRuleCodes.includes(rb.code);
                    return (
                      <label 
                        key={rb.id} 
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/80 border border-blue-200 text-blue-950 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAppliedRuleCodes([...appliedRuleCodes, rb.code]);
                            } else {
                              setAppliedRuleCodes(appliedRuleCodes.filter(c => c !== rb.code));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          {rb.code}
                        </span>
                        <span className="text-xs truncate flex-1">{rb.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">v{rb.version || '1.0'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-blacklist-entry"
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                domain === 'FRAUD' 
                  ? 'bg-rose-600 hover:bg-rose-700' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {editingEntry ? 'Simpan Perubahan' : 'Simpan Entitas'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
