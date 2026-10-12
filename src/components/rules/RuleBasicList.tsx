import React, { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit, 
  Trash2, 
  Sliders, 
  Columns,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserCheck,
  CreditCard,
  Smartphone,
  Phone,
  Eye
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { RuleBasic, RuleDomain } from '../../types/fms';
import { 
  VersionBadge, 
  SyncStatusBadge, 
  TestingStatusBadge, 
  UrgencyBadge,
  DomainBadge 
} from '../common/Badge';
import { RuleBasicModal } from './RuleBasicModal';
import { RuleBasicViewModal } from './RuleBasicViewModal';
import { ConfigComparisonModal } from './ConfigComparisonModal';

interface RuleBasicListProps {
  domain?: RuleDomain;
}

export const RuleBasicList: React.FC<RuleBasicListProps> = ({ domain: initialDomain }) => {
  const { 
    ruleBasics, 
    syncRuleBasic, 
    deleteRuleBasic, 
    ruleTemplates,
    ruleBasicDomain,
    setRuleBasicDomain
  } = useFMS();
  const { user } = useAuth();

  const isSysAdmin = !user || user.username === 'sysadmin' || user.riskDomain === 'FULL ACCESS' || user.group === 'IT DCA Maker Checker';
  const isL2User = !isSysAdmin && (
    user?.username === 'afcl2' || 
    user?.username === 'analystl2' || 
    user?.group === 'AFC L2' || 
    user?.group === 'Analyst L2' || 
    user?.role?.includes('Checker') || 
    user?.role?.includes('Approver')
  );

  React.useEffect(() => {
    if (initialDomain && ruleBasicDomain !== initialDomain) {
      setRuleBasicDomain(initialDomain);
    }
  }, [initialDomain]);

  const [searchTerm, setSearchTerm] = useState('');
  const [syncFilter, setSyncFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBasic, setEditingBasic] = useState<RuleBasic | null>(null);
  const [viewingBasic, setViewingBasic] = useState<RuleBasic | null>(null);

  // Comparison side-by-side modal
  const [comparingBasic, setComparingBasic] = useState<RuleBasic | null>(null);

  const filteredBasics = ruleBasics.filter(rb => {
    if (ruleBasicDomain !== 'ALL' && (rb.domain || 'Fraud') !== ruleBasicDomain) return false;
    if (syncFilter !== 'ALL' && rb.syncStatus !== syncFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      rb.code.toLowerCase().includes(q) ||
      rb.name.toLowerCase().includes(q) ||
      rb.templateCode.toLowerCase().includes(q) ||
      rb.txnType.toLowerCase().includes(q) ||
      rb.channel.toLowerCase().includes(q)
    );
  });

  const handleEdit = (rb: RuleBasic) => {
    setEditingBasic(rb);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBasic(null);
    setModalOpen(true);
  };

  const handleCompare = (rb: RuleBasic) => {
    setComparingBasic(rb);
  };

  const fraudCount = ruleBasics.filter(rb => (rb.domain || 'Fraud') === 'Fraud').length;
  const amlCount = ruleBasics.filter(rb => rb.domain === 'AML').length;

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Rule Engine - Rule Basics {ruleBasicDomain !== 'ALL' && `(${ruleBasicDomain})`}
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {filteredBasics.length} of {ruleBasics.length} Active Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Implementasi aturan {ruleBasicDomain === 'AML' ? 'Anti-Money Laundering (AML)' : ruleBasicDomain === 'Fraud' ? 'Fraud Detection' : 'Fraud & AML'} dengan nilai threshold nyata, pemicu otomatis blokir (Auto-Block), dan sinkronisasi versi template.
          </p>
        </div>

        {!isL2User && (
          <button
            id="btn-create-rule-basic"
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Rule Basic Baru ({ruleBasicDomain === 'ALL' ? 'Fraud' : ruleBasicDomain})</span>
          </button>
        )}
      </div>

      {/* Domain Separation Filter Tabs & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Domain Locked Badge */}
        <div className="flex items-center gap-2">
          {ruleBasicDomain === 'Fraud' ? (
            <div className="px-3 py-1.5 rounded-lg font-bold text-red-700 bg-red-50 border border-red-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Fraud Engine Archive ({fraudCount})</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 text-[9px] font-mono border border-red-300">LOCKED</span>
            </div>
          ) : ruleBasicDomain === 'AML' ? (
            <div className="px-3 py-1.5 rounded-lg font-bold text-amber-900 bg-amber-50 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
              <span>AML Engine Archive ({amlCount})</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-[9px] font-mono border border-amber-300">LOCKED</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-slate-100 border border-slate-200 shadow-2xs">
              Semua Domain ({ruleBasics.length})
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          {/* Sync Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Sync:</span>
            <select
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none text-xs"
            >
              <option value="ALL">Semua Sync</option>
              <option value="In Sync">In Sync</option>
              <option value="Out of Sync">Out of Sync (Butuh Sync)</option>
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Rule Basic..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Rule Basics Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBasics.map(rb => {
          const parentTemplate = ruleTemplates.find(t => t.code === rb.templateCode);
          const isOutOfSync = rb.syncStatus === 'Out of Sync';
          const autoBlock = rb.autoBlock || { cif: false, sourceAccountNumber: false, deviceId: false, phoneNumber: false };

          return (
            <div 
              key={rb.id}
              className={`p-5 rounded-xl bg-white border transition space-y-4 shadow-xs flex flex-col justify-between ${
                isOutOfSync ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                
                {/* Top: Code, Version & Sync Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {rb.code}
                    </span>
                    <DomainBadge domain={rb.domain || 'Fraud'} />
                    <VersionBadge version={rb.version} />
                    <SyncStatusBadge status={rb.syncStatus} />
                    <TestingStatusBadge status={rb.testingStatus} />
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Sync Button (Maker / Admin only) */}
                    {isOutOfSync && !isL2User && (
                      <button
                        id={`btn-sync-${rb.code}`}
                        onClick={() => syncRuleBasic(rb.id)}
                        className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1 border border-amber-300 transition cursor-pointer"
                        title="Sinkronisasikan parameter baru dari Template Induk (Bump to v2.0)"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Sinkronisasi (v2.0)</span>
                      </button>
                    )}

                    {/* View Button */}
                    <button
                      onClick={() => setViewingBasic(rb)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                      title="View Rule Basic & History Changes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCompare(rb)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      title="Bandingkan Konfigurasi Template & Basic"
                    >
                      <Columns className="w-4 h-4" />
                    </button>
                    {!isL2User && (
                      <>
                        <button
                          onClick={() => handleEdit(rb)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Edit Rule Basic"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRuleBasic(rb.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 transition cursor-pointer"
                          title="Hapus Rule Basic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Out of Sync Warning Banner */}
                {isOutOfSync && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <span>
                      ⚠️ Template induk (<strong>{rb.templateCode}</strong> v{parentTemplate?.version}) memiliki perubahan parameter variabel.
                    </span>
                  </div>
                )}

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{rb.name}</h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                    <span>Parent: <strong className="font-mono text-blue-700">{rb.templateCode} (v{rb.templateVersion})</strong></span>
                    <span>•</span>
                    <span>Channel: <strong className="text-slate-700">{rb.channel}</strong></span>
                  </div>
                  {parentTemplate && parentTemplate.parameters && parentTemplate.parameters.length > 0 && (
                    <div className="mt-2 p-2 rounded bg-blue-50/70 border border-blue-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-blue-900 font-bold font-mono">
                        <span>⚡ Parameter Template ({parentTemplate.parameters.length} Placeholders):</span>
                        <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded">v{parentTemplate.version} {rb.syncStatus === 'In Sync' ? '• In Sync & Passed' : ''}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {parentTemplate.parameters.map(p => (
                          <span key={p.id} className="px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-800 font-mono text-[10px]" title={p.label}>
                            {p.key}: {String(p.defaultValue)} {p.unit || ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {rb.description}
                  </p>
                </div>

                {/* Concrete Parameter Values */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    <span>Nilai Threshold Terpasang:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(rb.parameterValues).map(([k, v]) => (
                      <div key={k} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono">
                        <span className="text-slate-400 text-[10px] block truncate">{k}</span>
                        <span className="font-bold text-slate-900">
                          {typeof v === 'number' && v >= 1000 ? v.toLocaleString('id-ID') : String(v)}
                        </span>
                      </div>
                    ))}

                    {/* Show placeholder for NEW parameters if out of sync */}
                    {isOutOfSync && parentTemplate && parentTemplate.parameters
                      .filter(p => !rb.parameterValues.hasOwnProperty(p.key))
                      .map(p => (
                        <div key={p.key} className="p-2 rounded bg-amber-50 border border-amber-300 border-dashed text-[11px] font-mono shadow-inner animate-in fade-in slide-in-from-right-2">
                          <span className="text-amber-600 text-[10px] block truncate font-bold">{p.key}</span>
                          <span className="text-amber-800 underline italic decoration-amber-400/50">Need Setup</span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Auto-Block Indicators */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <Ban className="w-3 h-3 text-red-500" />
                    <span>Aksi Blokir Otomatis (Auto-Block):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {autoBlock.cif && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <UserCheck className="w-3 h-3" /> CIF
                      </span>
                    )}
                    {autoBlock.sourceAccountNumber && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <CreditCard className="w-3 h-3" /> Source Account
                      </span>
                    )}
                    {autoBlock.deviceId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <Smartphone className="w-3 h-3" /> Device ID
                      </span>
                    )}
                    {autoBlock.phoneNumber && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        <Phone className="w-3 h-3" /> Phone No
                      </span>
                    )}
                    {!autoBlock.cif && !autoBlock.sourceAccountNumber && !autoBlock.deviceId && !autoBlock.phoneNumber && (
                      <span className="text-[10px] text-slate-400 font-mono italic">
                        Tidak ada blokir otomatis (Hanya Alert)
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Card Footer: Urgency & Scores */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <UrgencyBadge urgency={rb.caseUrgency} />
                  <span className="text-slate-500">Base: <strong className="font-mono text-slate-800">{rb.baseScore} Pts</strong></span>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                  Updated: {rb.updatedAt.split(' ')[0]}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {modalOpen && (
        <RuleBasicModal
          basic={editingBasic}
          initialDomain={ruleBasicDomain === 'ALL' ? 'Fraud' : ruleBasicDomain}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Config Comparison Modal */}
      {comparingBasic && (
        <ConfigComparisonModal
          ruleBasic={comparingBasic}
          onClose={() => setComparingBasic(null)}
        />
      )}

      {/* View Modal */}
      {viewingBasic && (
        <RuleBasicViewModal
          ruleBasic={viewingBasic}
          onClose={() => setViewingBasic(null)}
        />
      )}

    </div>
  );
};
