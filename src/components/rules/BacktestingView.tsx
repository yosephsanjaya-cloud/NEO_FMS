import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Layers, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Sparkles, 
  Columns,
  Check
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { BacktestCategory } from '../../types/fms';
import { VersionBadge, TestingStatusBadge, SyncStatusBadge } from '../common/Badge';
import { ConfigComparisonModal } from './ConfigComparisonModal';

export const BacktestingView: React.FC = () => {
  const { 
    ruleTemplates, 
    ruleBasics, 
    backtestSessions, 
    runBacktestSimulation, 
    promoteRuleAfterTest 
  } = useFMS();

  // Active testing category tab
  const [activeCategory, setActiveCategory] = useState<BacktestCategory>('New Rule');
  const [subConfigType, setSubConfigType] = useState<'Template' | 'Basic'>('Basic');

  // Selected rules for test
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>(ruleTemplates[0]?.code || '');
  const [selectedBasicCode, setSelectedBasicCode] = useState<string>(ruleBasics[0]?.code || '');
  const [datasetPeriod, setDatasetPeriod] = useState('1 Bulan Terakhir (3.5M Transaksi)');

  // Simulation running state
  const [isRunning, setIsRunning] = useState(false);
  const [guardrailError, setGuardrailError] = useState<string | null>(null);
  const [latestResultSession, setLatestResultSession] = useState<any>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Approval & Promotion Confirmation States
  const [testApprovalStatus, setTestApprovalStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [rejectionNote, setRejectionNote] = useState('');
  const [showPromoteConfirmModal, setShowPromoteConfirmModal] = useState(false);

  // Category 1: Rule Template & Basic Baru
  const newCandidateBasics = ruleBasics.filter(
    rb => rb.version === '1.0' && rb.status === 'Inactive' && rb.testingStatus === 'Need Testing'
  );
  const newCandidateTemplates = ruleTemplates.filter(
    t => t.version === '1.0' && t.status === 'Inactive' && t.testingStatus === 'Need Testing'
  );

  // Category 2: Minor Updates Candidates
  const minorUpdateBasics = ruleBasics.filter(rb => rb.version !== '1.0' && rb.testingStatus === 'Need Testing');
  const minorUpdateTemplates = ruleTemplates.filter(t => t.version !== '1.0' && t.testingStatus === 'Need Testing');

  // Category 3: Out of Sync Candidates
  const outOfSyncBasics = ruleBasics.filter(rb => rb.syncStatus === 'Out of Sync');

  // Auto-select valid options when category changes or filtered lists change
  useEffect(() => {
    if (activeCategory === 'New Rule') {
      if (newCandidateTemplates.length > 0 && !newCandidateTemplates.find(t => t.code === selectedTemplateCode)) {
        setSelectedTemplateCode(newCandidateTemplates[0].code);
      }
      if (newCandidateBasics.length > 0 && !newCandidateBasics.find(rb => rb.code === selectedBasicCode)) {
        setSelectedBasicCode(newCandidateBasics[0].code);
      }
    } else if (activeCategory.startsWith('New Config')) {
      if (subConfigType === 'Template') {
        if (minorUpdateTemplates.length > 0 && !minorUpdateTemplates.find(t => t.code === selectedTemplateCode)) {
          setSelectedTemplateCode(minorUpdateTemplates[0].code);
        }
      } else {
        if (minorUpdateBasics.length > 0 && !minorUpdateBasics.find(rb => rb.code === selectedBasicCode)) {
          setSelectedBasicCode(minorUpdateBasics[0].code);
        }
      }
    } else if (activeCategory === 'Dependency Change') {
      const depTemplates = ruleTemplates.filter(t => t.testingStatus === 'Need Testing' && t.version !== '1.0');
      if (depTemplates.length > 0 && !depTemplates.find(t => t.code === selectedTemplateCode)) {
        setSelectedTemplateCode(depTemplates[0].code);
      }
      
      const depBasics = ruleBasics.filter(rb => rb.syncStatus === 'Out of Sync' || rb.testingStatus === 'Need Testing');
      if (depBasics.length > 0 && !depBasics.find(rb => rb.code === selectedBasicCode)) {
        setSelectedBasicCode(depBasics[0].code);
      }
    }
  }, [activeCategory, subConfigType, ruleTemplates, ruleBasics]);

  const handleRunTest = async () => {
    setGuardrailError(null);
    setIsRunning(true);
    setLatestResultSession(null);

    try {
      const selectedTpl = ruleTemplates.find(t => t.code === selectedTemplateCode);
      const selectedRb = ruleBasics.find(rb => rb.code === selectedBasicCode);

      // Section C.4 Category 3: Perubahan Dependensi Guardrail
      if (activeCategory === 'Dependency Change') {
        if (selectedTpl && selectedRb && selectedTpl.version !== selectedRb.version) {
          throw new Error(
            `GUARDRAIL VALIDASI GAGAL: Versi Proposed Rule Template (${selectedTpl.version}) dan Rule Basic (${selectedRb.version}) HARUS SAMA! Lakukan Sinkronisasi pada Rule Basic terlebih dahulu agar keduanya berada pada versi Major v2.0.`
          );
        }
      }

      // Simulate simulation execution
      const session = await runBacktestSimulation({
        category: activeCategory,
        ruleTemplateCode: selectedTemplateCode,
        ruleBasicCode: selectedBasicCode,
        targetVersion: activeCategory === 'New Config Template' ? (selectedTpl?.version || '1.01') : (selectedRb?.version || '1.01'),
        datasetPeriod
      });

      setLatestResultSession(session);
      setTestApprovalStatus('Pending');
      setRejectionNote('');
    } catch (err: any) {
      setGuardrailError(err.message || 'Terjadi kesalahan saat validasi backtest');
    } finally {
      setIsRunning(false);
    }
  };

  const handlePromoteToActive = (code: string, type: 'Basic' | 'Template') => {
    promoteRuleAfterTest(type, code);
  };

  const currentSelectedBasic = ruleBasics.find(rb => rb.code === selectedBasicCode) || ruleBasics[0];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rule Engine - Backtesting &amp; Simulation Module</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Historical Data Lake Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulasi pengujian performa rule fraud &amp; AML pada data historis jutaan transaksi sebelum diterbitkan ke produksi (Active).
          </p>
        </div>
      </div>

      {/* SECTION C.4: 4 TESTING CATEGORY TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        
        {/* Tab 1 */}
        <button
          id="tab-bt-new-rules"
          onClick={() => { setActiveCategory('New Rule'); setGuardrailError(null); }}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeCategory === 'New Rule'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Rule Template &amp; Basic Baru</span>
          {newCandidateBasics.length > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold font-mono border border-amber-200">
              {newCandidateBasics.length} Perlu Test
            </span>
          )}
        </button>

        {/* Tab 2 */}
        <button
          id="tab-bt-new-config"
          onClick={() => { setActiveCategory('New Config Basic'); setSubConfigType('Basic'); setGuardrailError(null); }}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeCategory.startsWith('New Config')
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Konfigurasi Baru (Minor Update)</span>
          {(minorUpdateBasics.length > 0 || minorUpdateTemplates.length > 0) && (
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold font-mono border border-amber-200">
              {minorUpdateBasics.length + minorUpdateTemplates.length} Perlu Test
            </span>
          )}
        </button>

        {/* Tab 3 */}
        <button
          id="tab-bt-dependency-change"
          onClick={() => { setActiveCategory('Dependency Change'); setGuardrailError(null); }}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeCategory === 'Dependency Change'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. Perubahan Dependensi (Guardrail)</span>
          {outOfSyncBasics.length > 0 && (
            <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-900 text-[10px] font-bold font-mono border border-red-200">
              {outOfSyncBasics.length} Perlu Test
            </span>
          )}
        </button>

        {/* Tab 4 */}
        <button
          id="tab-bt-comparison"
          onClick={() => { setActiveCategory('Comparison'); setGuardrailError(null); }}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeCategory === 'Comparison'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
          }`}
        >
          <Columns className="w-4 h-4" />
          <span>4. Configuration Comparison</span>
        </button>
      </div>

      {/* Guardrail Error Banner */}
      {guardrailError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-red-800">Validasi Pengujian Tidak Lolos (Guardrail Blocked)</h4>
            <p className="text-xs text-red-700 leading-relaxed">{guardrailError}</p>
          </div>
        </div>
      )}

      {/* Category 1 View: Rule Template & Basic Baru */}
      {activeCategory === 'New Rule' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Syarat Rule Kategori 1: Versi 1.0, Status Inactive, dan Need Testing</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Daftar rule yang baru dibuat dari Flow A atau Flow B dan belum pernah melalui pengujian dataset transaksi historis FMS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule Basics Candidate */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-blue-700 flex items-center justify-between">
                <span>Kandidat Rule Basic Baru ({newCandidateBasics.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">Versi 1.0</span>
              </h3>

              <div className="space-y-2">
                {newCandidateBasics.map(rb => (
                  <div 
                    key={rb.id}
                    onClick={() => { setSelectedBasicCode(rb.code); setSelectedTemplateCode(rb.templateCode); }}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      selectedBasicCode === rb.code ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-700">{rb.code}</span>
                        <VersionBadge version={rb.version} />
                        <TestingStatusBadge status={rb.testingStatus} />
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{rb.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Ref: {rb.templateCode} • Base Score: {rb.baseScore}</div>
                    </div>

                    <span className="text-xs text-blue-600 font-bold">Pilih &rarr;</span>
                  </div>
                ))}

                {newCandidateBasics.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs font-mono">
                    Semua Rule Basic v1.0 telah melewati pengujian atau tidak ada yang berstatus Need Testing.
                  </div>
                )}
              </div>
            </div>

            {/* Rule Template Candidate */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-blue-700 flex items-center justify-between">
                <span>Kandidat Rule Template Baru ({newCandidateTemplates.length})</span>
                <span className="text-[10px] text-slate-400 font-mono">Versi 1.0</span>
              </h3>

              <div className="space-y-2">
                {newCandidateTemplates.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={() => setSelectedTemplateCode(tpl.code)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      selectedTemplateCode === tpl.code ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-700">{tpl.code}</span>
                        <VersionBadge version={tpl.version} />
                        <TestingStatusBadge status={tpl.testingStatus} />
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{tpl.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{tpl.domain || 'Fraud'} • {tpl.parameters.length} Variables</div>
                    </div>

                    <span className="text-xs text-blue-600 font-bold">Pilih &rarr;</span>
                  </div>
                ))}

                {newCandidateTemplates.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs font-mono">
                    Semua Rule Template v1.0 telah melewati pengujian.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category 2 View: Konfigurasi Baru (2 Sub-menu) */}
      {activeCategory.startsWith('New Config') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 bg-white p-1.5 rounded-xl border border-slate-200 self-start w-full sm:w-auto shadow-xs">
            <button
              onClick={() => { setActiveCategory('New Config Template'); setSubConfigType('Template'); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                subConfigType === 'Template' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>1. Update Rule Template (SQL)</span>
              {minorUpdateTemplates.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${subConfigType === 'Template' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'}`}>
                  {minorUpdateTemplates.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveCategory('New Config Basic'); setSubConfigType('Basic'); }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                subConfigType === 'Basic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>2. Update Rule Basic (Threshold)</span>
              {minorUpdateBasics.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${subConfigType === 'Basic' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'}`}>
                  {minorUpdateBasics.length}
                </span>
              )}
            </button>
          </div>

          {subConfigType === 'Template' ? (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="font-bold text-xs text-slate-900">Pilih Rule Template untuk Uji Custom Query Logic SQL:</div>
                <span className="text-[10px] text-slate-400 italic">Hanya menampilkan Proposed Versions</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {minorUpdateTemplates.length > 0 ? (
                  minorUpdateTemplates.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTemplateCode(t.code)}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        selectedTemplateCode === t.code ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-blue-700">{t.code}</span>
                          <VersionBadge version={t.version} />
                          <TestingStatusBadge status={t.testingStatus} />
                        </div>
                        <div className="text-xs font-semibold text-slate-900">{t.name}</div>
                      </div>
                      <span className="text-xs text-blue-600 font-bold">Pilih &rarr;</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Tidak ada Rule Template dengan status "Need Testing" untuk versi minor update.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="font-bold text-xs text-slate-900">Pilih Rule Basic untuk Uji Nilai Threshold / Risk Score Baru:</div>
                <span className="text-[10px] text-slate-400 italic">Hanya menampilkan Proposed Versions</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {minorUpdateBasics.length > 0 ? (
                  minorUpdateBasics.map(rb => (
                    <div 
                      key={rb.id}
                      onClick={() => setSelectedBasicCode(rb.code)}
                      className={`p-3 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        selectedBasicCode === rb.code ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-blue-700">{rb.code}</span>
                          <VersionBadge version={rb.version} />
                          <TestingStatusBadge status={rb.testingStatus} />
                        </div>
                        <div className="text-xs font-semibold text-slate-900">{rb.name}</div>
                      </div>
                      <span className="text-xs text-blue-600 font-bold">Pilih &rarr;</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Tidak ada Rule Basic dengan status "Need Testing" untuk versi minor update.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category 3 View: Perubahan Dependensi (Guardrail) */}
      {activeCategory === 'Dependency Change' && (
        <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Kategori 3: Pengujian Perubahan Dependensi Variable Placeholder</span>
            </h3>
            <p className="text-xs text-slate-500">
              Digunakan saat ada perubahan struktur parameter placeholder. Guardrail: Versi <strong>Proposed Rule Template</strong> dan <strong>Rule Basic</strong> HARUS SAMA agar pengujian dapat dijalankan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Rule Template Induk (Perlu Test):</span>
                <span className="text-[10px] text-amber-800 font-mono">Filtered: Need Testing</span>
              </label>
              <select
                value={selectedTemplateCode}
                onChange={(e) => setSelectedTemplateCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              >
                {ruleTemplates.filter(t => t.testingStatus === 'Need Testing' && t.version !== '1.0').map(t => (
                  <option key={t.id} value={t.code}>
                    {t.code} (v{t.version}) - {t.name} [{t.testingStatus}]
                  </option>
                ))}
                {ruleTemplates.filter(t => t.testingStatus === 'Need Testing' && t.version !== '1.0').length === 0 && (
                  <option disabled>Tidak ada template yang perlu di-test</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Rule Basic Terkait (Out of Sync / Need Testing):</span>
                <span className="text-[10px] text-red-700 font-mono">Filtered: Need Test</span>
              </label>
              <select
                value={selectedBasicCode}
                onChange={(e) => setSelectedBasicCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              >
                {ruleBasics.filter(rb => rb.syncStatus === 'Out of Sync' || rb.testingStatus === 'Need Testing').map(rb => (
                  <option key={rb.id} value={rb.code}>
                    {rb.code} (v{rb.version}) [{rb.syncStatus}] - {rb.name}
                  </option>
                ))}
                {ruleBasics.filter(rb => rb.syncStatus === 'Out of Sync' || rb.testingStatus === 'Need Testing').length === 0 && (
                  <option disabled>Tidak ada rule basic yang perlu di-test</option>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Category 4 View: Configuration Comparison */}
      {activeCategory === 'Comparison' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Columns className="w-4 h-4 text-blue-600" />
                <span>Kategori 4: Configuration Comparison (Side-by-Side)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih Rule Basic untuk membuka dialog perbandingan langsung dengan Rule Template induknya.
              </p>
            </div>

            <button
              onClick={() => setShowComparisonModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Columns className="w-4 h-4" />
              <span>Buka Side-by-Side Modal</span>
            </button>
          </div>

          <div className="space-y-2">
            {ruleBasics.map(rb => (
              <div key={rb.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-blue-700">{rb.code}</span>
                    <span className="font-mono text-xs text-slate-500">Ref: {rb.templateCode}</span>
                    <VersionBadge version={rb.version} />
                    <SyncStatusBadge status={rb.syncStatus} />
                  </div>
                  <div className="text-xs text-slate-900 font-semibold">{rb.name}</div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBasicCode(rb.code);
                    setShowComparisonModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 shadow-xs transition cursor-pointer"
                >
                  Bandingkan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulation Trigger Form Card */}
      {activeCategory !== 'Comparison' && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                <span>Konfigurasi Dataset &amp; Eksekusi Simulasi Backtest</span>
              </span>
              <p className="text-xs text-slate-500">
                Pilih rentang histori transaksi perbankan untuk menguji false positive rate &amp; akurasi alert.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={datasetPeriod}
                onChange={(e) => setDatasetPeriod(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="1 Bulan Terakhir (3.5M Transaksi)">1 Bulan Terakhir (3.5M Transaksi)</option>
                <option value="3 Bulan Terakhir (10.2M Transaksi)">3 Bulan Terakhir (10.2M Transaksi)</option>
                <option value="6 Bulan Terakhir (21.4M Transaksi)">6 Bulan Terakhir (21.4M Transaksi)</option>
                <option value="Full Historical Year 2026 (45M Transaksi)">Full Historical Year 2026 (45M Transaksi)</option>
              </select>

              <button
                id="btn-run-backtest-simulation"
                disabled={isRunning}
                onClick={handleRunTest}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menjalankan Simulasi...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Jalankan Backtesting</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Simulation Output Dashboard / Logs */}
          {latestResultSession && (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-300 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Hasil Backtest: PASSED (Target Version: v{latestResultSession.targetVersion})
                  </span>
                </div>

                {testApprovalStatus === 'Approved' ? (
                  <button
                    id="btn-promote-rule-active"
                    onClick={() => setShowPromoteConfirmModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Promosikan Status ke &quot;Active&quot; &amp; &quot;Passed&quot;</span>
                  </button>
                ) : (
                  <span className="text-xs text-amber-800 bg-amber-100 px-3 py-1 rounded font-semibold font-mono">
                    ⚠️ Butuh Approval Hasil Test Terlebih Dahulu
                  </span>
                )}
              </div>

              {/* Approval Box Section */}
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Approval Status Hasil Backtesting:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      testApprovalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      testApprovalStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {testApprovalStatus === 'Approved' ? 'Approved (Diterima)' : testApprovalStatus === 'Rejected' ? 'Rejected (Perlu Perbaikan)' : 'Pending Approval'}
                    </span>
                  </span>
                </div>

                {testApprovalStatus === 'Pending' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-slate-600">
                      Evaluasi metrik False Positive Rate ({latestResultSession.estimatedFPRate}%) dan jumlah alert terpicu. Apakah hasil testing ini diterima &amp; disetujui?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTestApprovalStatus('Approved')}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Test Hasil
                      </button>
                      <button
                        onClick={() => setTestApprovalStatus('Rejected')}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        ❌ Reject Test
                      </button>
                    </div>
                  </div>
                )}

                {testApprovalStatus === 'Approved' && (
                  <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hasil backtest telah disetujui. Silakan klik tombol Promosikan ke Production di atas.</span>
                  </div>
                )}

                {testApprovalStatus === 'Rejected' && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs text-red-700 font-semibold">
                      ❌ Hasil backtest ditolak / perlu perbaikan. Catatan:
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        placeholder="Contoh: False positive terlalu tinggi, threshold nominal harus disesuaikan..."
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={() => setTestApprovalStatus('Pending')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium cursor-pointer"
                      >
                        Reset Uji Ulang
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500 text-[10px] font-mono">Total Transaksi Diuji</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {latestResultSession.totalTransactionsTested.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500 text-[10px] font-mono">Alert Terpicu</div>
                  <div className="font-mono font-bold text-amber-800 text-sm mt-0.5">
                    {latestResultSession.triggeredAlertsCount} Kasus
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500 text-[10px] font-mono">False Positive Rate</div>
                  <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                    {latestResultSession.estimatedFPRate}% (Toleransi &lt; 8%)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500 text-[10px] font-mono">CIF Terdampak</div>
                  <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">
                    {latestResultSession.impactedCifsCount} CIF
                  </div>
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px] text-emerald-400">
                <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  <span>Execution Stream Log:</span>
                </div>
                {latestResultSession.logs.map((log: string, lIdx: number) => (
                  <div key={lIdx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Promotion Confirmation Popup Modal */}
      {showPromoteConfirmModal && latestResultSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Promosi ke Production</h3>
                <p className="text-xs text-slate-500">Deploy rule ke lingkungan Live FMS</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Target Rule:</span>
                <span className="font-bold text-blue-700">{activeCategory === 'New Config Template' ? selectedTemplateCode : selectedBasicCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Target Version:</span>
                <span className="font-bold text-slate-800">v{latestResultSession.targetVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">False Positive Rate:</span>
                <span className="font-bold text-emerald-700">{latestResultSession.estimatedFPRate}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan mempromosikan rule menjadi <strong>Active (Production)</strong> dan mengubah status testing menjadi <strong>Passed</strong>. Apakah Anda yakin ingin melanjutkan?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPromoteConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handlePromoteToActive(
                    activeCategory === 'New Config Template' ? selectedTemplateCode : selectedBasicCode,
                    activeCategory === 'New Config Template' ? 'Template' : 'Basic'
                  );
                  setShowPromoteConfirmModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
              >
                Ya, Promosikan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Sessions List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Riwayat Sesi Backtesting Terakhir</h3>
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold font-mono">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Kategori Testing</th>
                <th className="p-3">Target Rule</th>
                <th className="p-3">Version</th>
                <th className="p-3">Transactions Tested</th>
                <th className="p-3">Alerts Triggered</th>
                <th className="p-3">Est. FP Rate</th>
                <th className="p-3">Status</th>
                <th className="p-3">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {backtestSessions.map(session => (
                <tr key={session.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-blue-700">{session.id}</td>
                  <td className="p-3 font-sans font-medium text-slate-900">{session.category}</td>
                  <td className="p-3 font-mono text-blue-700">{session.ruleBasicCode || session.ruleTemplateCode}</td>
                  <td className="p-3 font-mono text-slate-600">v{session.targetVersion}</td>
                  <td className="p-3 font-mono text-slate-600">{session.totalTransactionsTested.toLocaleString('id-ID')}</td>
                  <td className="p-3 font-mono text-amber-800 font-bold">{session.triggeredAlertsCount}</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">{session.estimatedFPRate}%</td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold font-mono">
                      Passed
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{session.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ConfigComparisonModal
          ruleBasic={currentSelectedBasic}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

    </div>
  );
};
