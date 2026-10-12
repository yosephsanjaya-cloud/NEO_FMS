import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calculator, 
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  Check,
  Eye,
  History
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { FormulaRisk } from '../../types/fms';

export const FormulaRiskView: React.FC = () => {
  const { formulaRisks, createFormulaRisk, updateFormulaRisk, deleteFormulaRisk, ruleBasics } = useFMS();
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

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaRisk | null>(null);
  const [viewingFormula, setViewingFormula] = useState<FormulaRisk | null>(null);

  // Simulation test state
  const [selectedSimRuleCode, setSelectedSimRuleCode] = useState<string>(
    ruleBasics[0]?.code || 'R-TRX-HIGH-VAL-001'
  );

  // Form states for creating/editing Formula
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isGlobal, setIsGlobal] = useState<boolean>(true);
  const [selectedRuleCodes, setSelectedRuleCodes] = useState<string[]>([]);
  const [points, setPoints] = useState<number>(10);
  const [riskIndicators, setRiskIndicators] = useState<string[]>([]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Repeated Offender states
  const [triggerScope, setTriggerScope] = useState<'Same Rule Basic Only' | 'Any Rule Basic (Cross-Rule)'>('Same Rule Basic Only');
  const [thresholdFrequency, setThresholdFrequency] = useState<number>(2);
  const [lookbackWindowValue, setLookbackWindowValue] = useState<number>(24);
  const [lookbackWindowUnit, setLookbackWindowUnit] = useState<'Hours' | 'Days'>('Hours');

  const PRESET_POINTS = [5, 10, 15, 20];
  const RISK_INDICATORS = [
    'Terdaftar di Blacklist',
    'Terdaftar di Watchlist',
    'Repeated Offender (Pelanggaran Berulang)',
    'Perangkat Baru / Unrecognized Device',
    'Jam Transaksi Mencurigakan (Off-Hours)',
    'Aktivasi Rekening Pasif (Dormant Account)'
  ];

  const INDICATOR_MAP: Record<string, any> = {
    'Terdaftar di Blacklist': 'Blacklist',
    'Terdaftar di Watchlist': 'Watchlist',
    'Repeated Offender (Pelanggaran Berulang)': 'Repeated Offender',
    'Perangkat Baru / Unrecognized Device': 'New Device',
    'Jam Transaksi Mencurigakan (Off-Hours)': 'Off-Hours',
    'Aktivasi Rekening Pasif (Dormant Account)': 'Dormant Account'
  };

  const REVERSE_INDICATOR_MAP: Record<string, string> = Object.entries(INDICATOR_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

  const handleOpenCreate = () => {
    setEditingFormula(null);
    setCode(`FRM-${Math.floor(Math.random() * 900 + 100)}`);
    setName('');
    setDescription('');
    setIsGlobal(true);
    setSelectedRuleCodes([]);
    setPoints(10);
    setRiskIndicators([]);
    setStatus('Active');
    setTriggerScope('Same Rule Basic Only');
    setThresholdFrequency(2);
    setLookbackWindowValue(24);
    setLookbackWindowUnit('Hours');
    setModalOpen(true);
  };

  const handleOpenEdit = (f: any) => {
    setEditingFormula(f);
    setCode(f.code || `FRM-${Math.floor(Math.random() * 900 + 100)}`);
    setName(f.name || '');
    setDescription(f.description || '');
    const glob = f.isGlobal ?? (f.scope === 'Global');
    setIsGlobal(glob);
    setSelectedRuleCodes(f.specificRuleCodes || []);
    setPoints(f.points || 10);
    setRiskIndicators((f.riskIndicators || []).map((ri: string) => REVERSE_INDICATOR_MAP[ri] || ri));
    setStatus(f.status || 'Active');
    
    if (f.repeatedOffenderConfig) {
      setTriggerScope(f.repeatedOffenderConfig.triggerScope);
      setThresholdFrequency(f.repeatedOffenderConfig.thresholdFrequency);
      setLookbackWindowValue(f.repeatedOffenderConfig.lookbackWindowValue);
      setLookbackWindowUnit(f.repeatedOffenderConfig.lookbackWindowUnit);
    } else {
      setTriggerScope('Same Rule Basic Only');
      setThresholdFrequency(2);
      setLookbackWindowValue(24);
      setLookbackWindowUnit('Hours');
    }
    
    setModalOpen(true);
  };

  const handleToggleIndicator = (indicator: string) => {
    setRiskIndicators(prev => 
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  const handleToggleRuleSelection = (code: string) => {
    setSelectedRuleCodes(prev => 
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleSaveFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const mappedIndicators = riskIndicators.map(ri => INDICATOR_MAP[ri] || ri);
    const hasRepeatedOffender = mappedIndicators.includes('Repeated Offender');

    const formulaData: any = {
      code,
      name,
      description,
      points: Number(points),
      isGlobal,
      scope: isGlobal ? 'Global' : 'Specific',
      specificRuleCodes: isGlobal ? [] : selectedRuleCodes,
      riskIndicators: mappedIndicators,
      status,
      repeatedOffenderConfig: hasRepeatedOffender ? {
        triggerScope,
        thresholdFrequency,
        lookbackWindowValue,
        lookbackWindowUnit
      } : undefined
    };

    if (editingFormula) {
      updateFormulaRisk(editingFormula.id, formulaData);
    } else {
      createFormulaRisk(formulaData);
    }

    setModalOpen(false);
  };

  const handleToggleStatus = (f: FormulaRisk) => {
    updateFormulaRisk(f.id, {
      status: f.status === 'Active' ? 'Inactive' : 'Active'
    });
  };

  // Filtered Formulas safely
  const filteredFormulas = formulaRisks.filter(f => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const fCode = (f.code || '').toLowerCase();
    const fName = (f.name || '').toLowerCase();
    const fDesc = (f.description || '').toLowerCase();
    return (
      fCode.includes(q) ||
      fName.includes(q) ||
      fDesc.includes(q)
    );
  });

  // Calculate live simulation outcome for selected rule
  const selectedRuleObj = ruleBasics.find(r => r.code === selectedSimRuleCode) || ruleBasics[0];
  const simBaseScore = selectedRuleObj?.baseScore || 70;

  // Mock list entries and cases for simulation
  const mockLists: any[] = []; // Simplified for simulation
  const mockCases: any[] = []; 

  const matchedActiveFormulas = formulaRisks.filter(f => {
    if (f.status !== 'Active') return false;
    
    // 1. Check Matching Rule Basic (Cakupan Rule)
    const glob = f.isGlobal ?? (f.scope === 'Global');
    if (!glob && f.specificRuleCodes && !f.specificRuleCodes.includes(selectedRuleObj?.code || '')) {
      return false;
    }

    // 2. Evaluate Indicators (Simulation mode - assume some are true if selected)
    // In simulation, we assume that if a rule has an indicator, it's triggered for this simulation view
    // except for Repeated Offender which we might want to toggle but let's assume it's true for now if selected
    return (f.riskIndicators && f.riskIndicators.length > 0);
  });

  const totalProgressivePoints = matchedActiveFormulas.reduce((acc, f) => acc + f.points, 0);
  const finalCalculatedScore = Math.min(100, simBaseScore + totalProgressivePoints);
  const finalCalculatedLevel = finalCalculatedScore >= 70 ? 'High' : finalCalculatedScore >= 40 ? 'Med' : 'Low';

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Formula Risk Engine</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Penambahan Skor Risiko Progresif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Menambahkan penyesuaian skor risiko progresif langsung di atas <strong>Base Risk Score</strong> dari Rule Basic (Final Score = Base Score + Poin Progresif).
          </p>
        </div>

        {!isL2User && (
          <button
            id="btn-create-formula-risk"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Formula Risk Baru</span>
          </button>
        )}
      </div>

      {/* SECTION D LIVE SIMULATION ENGINE */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Simulasi Kalkulasi Final Risk Score</h3>
              <p className="text-[11px] text-slate-500">
                Pilih Rule Basic untuk melihat kalkulasi otomatis skor dasar + seluruh formula risk progresif yang cocok.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">Pilih Rule Basic:</span>
            <select
              value={selectedSimRuleCode}
              onChange={(e) => setSelectedSimRuleCode(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:border-blue-500"
            >
              {ruleBasics.map(rb => (
                <option key={rb.id} value={rb.code}>
                  {rb.code} - {rb.name} (Base: {rb.baseScore})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Calculation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Box 1: Base Risk Score */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-500">
                1. Base Risk Score (Rule Basic)
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-slate-900">
                {simBaseScore} <span className="text-xs font-sans text-slate-500 font-normal">Points</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">
                {selectedRuleObj?.code}
              </div>
            </div>
            <div className="mt-3 text-[10px] text-slate-500">
              Skor dasar bawaan yang terdaftar pada Rule Basic.
            </div>
          </div>

          {/* Box 2: Formula Risk Progresif */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-amber-800 flex items-center justify-between">
                <span>2. Poin Progresif Formula Risk</span>
                <span className="font-bold text-xs bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                  {matchedActiveFormulas.length} Formula Cocok
                </span>
              </div>
              <div className="mt-2 text-2xl font-mono font-bold text-amber-800">
                +{totalProgressivePoints} <span className="text-xs font-sans text-amber-800 font-normal">Points</span>
              </div>
              
              <div className="mt-2 space-y-1 max-h-20 overflow-y-auto pr-1">
                {matchedActiveFormulas.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">Tidak ada formula aktif yang cocok.</div>
                ) : (
                  matchedActiveFormulas.map(f => (
                    <div key={f.id} className="text-[11px] text-amber-900 flex items-center justify-between">
                      <span className="truncate max-w-[180px]">{f.name}</span>
                      <span className="font-mono font-bold">+{f.points}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-3 text-[10px] text-amber-800">
              Penambahan poin risiko dari formula global &amp; spesifik.
            </div>
          </div>

          {/* Box 3: Final Risk Score */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between shadow-md">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>3. Final Risk Score &amp; Level</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-2 text-3xl font-mono font-bold text-amber-400 flex items-baseline gap-2">
                <span>{finalCalculatedScore}</span>
                <span className="text-xs font-sans font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {finalCalculatedLevel} Urgency
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-2 font-mono">
                {simBaseScore} (Base) + {totalProgressivePoints} (Progresif) = {finalCalculatedScore} Pts
              </div>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 border-t border-slate-800 pt-2">
              Formula kalkulasi: Final Risk Score = Base Score + Poin Progresif Formula Risk.
            </div>
          </div>

        </div>
      </div>

      {/* FORMULA RISK TABLE SECTION */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Daftar Formula Risk Engine</h3>
            <p className="text-xs text-slate-500">
              Pengaturan penambahan skor progresif untuk semua rule (Global) atau rule tertentu (Spesifik).
            </p>
          </div>
          
          <div className="relative w-72 text-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama formula, kode, deskripsi..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] select-none whitespace-nowrap">
                  <th className="p-3 w-12 text-center">No.</th>
                  <th className="p-3">Kode</th>
                  <th className="p-3">Nama Formula Risk</th>
                  <th className="p-3">Risk Indicators</th>
                  <th className="p-3">Target Rules</th>
                  <th className="p-3">Modifier</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredFormulas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                      Tidak ada Formula Risk yang sesuai dengan kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredFormulas.map((f, idx) => {
                    const isGlob = f.isGlobal ?? (f.scope === 'Global');
                    const specificCodes = f.specificRuleCodes || [];

                    return (
                      <tr key={f.id} className="hover:bg-slate-50 transition">
                        
                        {/* No */}
                        <td className="p-3 text-slate-400 text-center font-sans">{idx + 1}</td>

                        {/* Kode Formula */}
                        <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                          {f.code}
                        </td>

                        {/* Nama Formula */}
                        <td className="p-3 font-sans whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{f.name}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={f.description}>{f.description}</div>
                        </td>

                        {/* Risk Indicators */}
                        <td className="p-3 font-sans">
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {f.riskIndicators?.map((ri: string) => (
                              <span key={ri} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-bold">
                                {ri}
                              </span>
                            ))}
                            {(!f.riskIndicators || f.riskIndicators.length === 0) && <span className="text-slate-400 italic text-[10px]">None</span>}
                          </div>
                        </td>

                        {/* Target Rules */}
                        <td className="p-3 whitespace-nowrap font-sans">
                          {isGlob ? (
                            <span className="text-[10px] font-bold text-blue-700">
                              GLOBAL
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {specificCodes.map(code => (
                                <span key={code} className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[9px] font-mono font-bold">
                                  {code}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Penambahan Progresif (Score Modifier) */}
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 font-mono font-bold text-[11px] shadow-2xs">
                            +{f.points} Pts
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-3 whitespace-nowrap">
                          {isL2User ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                f.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {f.status}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(f)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                f.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {f.status}
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center whitespace-nowrap font-sans">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => setViewingFormula(f)}
                              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 cursor-pointer transition"
                              title="View Formula & History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {!isL2User && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(f)}
                                  className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer transition"
                                  title="Edit Formula"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteFormulaRisk(f.id)}
                                  className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer transition"
                                  title="Hapus Formula"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT FORMULA RISK MODAL (Section D Spec) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFormula ? `Edit Formula Risk: ${editingFormula.code}` : 'Buat Formula Risk Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasi penambahan skor risiko progresif di atas Base Risk Score
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFormula} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* 1. Informasi Dasar */}
              <div className="space-y-3">
                <label className="text-slate-900 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  Informasi Dasar
                </label>
                <div className="space-y-3 pl-7">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-semibold">Nama Formula Risk *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Tambahan Skor Rekening Tujuan Blacklist & Repeated Offender"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-semibold">Deskripsi Formula *</label>
                    <textarea
                      rows={2}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Penjelasan operasional..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Indikator Pemicu Risiko (Risk Indicators) */}
              <div className="space-y-3">
                <label className="text-slate-900 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  Indikator Pemicu Risiko (Trigger Conditions)
                </label>
                <div className="pl-7 grid grid-cols-2 gap-2">
                  {RISK_INDICATORS.map(indicator => (
                    <label 
                      key={indicator}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition cursor-pointer ${
                        riskIndicators.includes(indicator) ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={riskIndicators.includes(indicator)}
                        onChange={() => handleToggleIndicator(indicator)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[10px] font-semibold">{indicator}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Konfigurasi Spesifik Repeated Offender */}
              {riskIndicators.includes('Repeated Offender (Pelanggaran Berulang)') && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-amber-900 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Konfigurasi Spesifik Repeated Offender
                  </label>
                  <div className="pl-7 space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                    <div className="space-y-2">
                      <label className="text-amber-900 font-semibold">Trigger Scope</label>
                      <div className="flex gap-2">
                        {['Same Rule Basic Only', 'Any Rule Basic (Cross-Rule)'].map(scope => (
                          <button
                            key={scope}
                            type="button"
                            onClick={() => setTriggerScope(scope as any)}
                            className={`flex-1 px-3 py-2 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                              triggerScope === scope ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-100'
                            }`}
                          >
                            {scope}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-amber-900 font-semibold">Threshold Frequency</label>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-800 font-bold">≥</span>
                          <input 
                            type="number"
                            min={1}
                            value={thresholdFrequency}
                            onChange={(e) => setThresholdFrequency(Number(e.target.value))}
                            className="w-full bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-amber-900 font-bold focus:outline-none"
                          />
                          <span className="text-amber-800">kali</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-amber-900 font-semibold">Lookback Window</label>
                        <div className="flex gap-1">
                          <input 
                            type="number"
                            min={1}
                            value={lookbackWindowValue}
                            onChange={(e) => setLookbackWindowValue(Number(e.target.value))}
                            className="w-16 bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-900 font-bold focus:outline-none"
                          />
                          <select
                            value={lookbackWindowUnit}
                            onChange={(e) => setLookbackWindowUnit(e.target.value as any)}
                            className="flex-1 bg-white border border-amber-200 rounded-lg px-2 py-1.5 text-amber-900 font-bold focus:outline-none"
                          >
                            <option value="Hours">Jam</option>
                            <option value="Days">Hari</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Matching Rule Basic (Cakupan Rule) */}
              <div className="space-y-3">
                <label className="text-slate-900 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                  Matching Rule Basic (Cakupan Rule)
                </label>
                
                <div className="pl-7 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsGlobal(true)}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        isGlobal 
                          ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between text-[10px]">
                        <span>[Semua Rule Basic (Global)]</span>
                        {isGlobal && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsGlobal(false)}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        !isGlobal 
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between text-[10px]">
                        <span>[Rule Basic Spesifik]</span>
                        {!isGlobal && <Check className="w-3.5 h-3.5 text-amber-800" />}
                      </div>
                    </button>
                  </div>

                  {!isGlobal && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {ruleBasics.map(rb => {
                          const isChecked = selectedRuleCodes.includes(rb.code);
                          return (
                            <label 
                              key={rb.id} 
                              className={`flex items-center space-x-2 p-1.5 rounded border transition cursor-pointer text-[10px] ${
                                isChecked ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleRuleSelection(rb.code)}
                                className="rounded text-amber-700 h-3 w-3"
                              />
                              <span className="font-mono font-bold text-blue-700">{rb.code}</span>
                              <span className="flex-1 truncate">{rb.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Penambahan Skor Progresif */}
              <div className="space-y-3">
                <label className="text-slate-900 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">5</span>
                  Penambahan Skor Progresif (Score Modifier)
                </label>
                <div className="pl-7 flex flex-wrap items-center gap-2">
                  {PRESET_POINTS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPoints(preset)}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold text-[10px] border transition cursor-pointer ${
                        points === preset
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      +{preset} Pts
                    </button>
                  ))}
                  <div className="flex items-center space-x-2 ml-auto">
                    <span className="text-slate-500 text-[10px]">Custom:</span>
                    <input
                      type="number"
                      min={1}
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-mono font-bold text-[11px] focus:outline-none focus:border-blue-500 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Status Operasional */}
              <div className="space-y-3">
                <label className="text-slate-900 font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">6</span>
                  Status Operasional
                </label>
                <div className="pl-7 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                   <div>
                      <div className="font-bold text-slate-900">Formula Risk Status</div>
                      <div className="text-[10px] text-slate-500">Tentukan apakah formula ini aktif diterapkan atau tidak.</div>
                   </div>
                   <button
                    type="button"
                    onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                   >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        status === 'Active' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                   </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] shadow-sm cursor-pointer"
                >
                  {editingFormula ? 'Simpan Perubahan' : 'Buat Formula Risk'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingFormula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto font-sans">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">View Formula Risk: {viewingFormula.code}</h3>
                  <p className="text-[11px] text-slate-400">Review detail konfigurasi dan riwayat perubahan</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingFormula(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
              
              {/* Detail Info */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                   <div className="font-bold text-slate-900 text-sm">{viewingFormula.name}</div>
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                     viewingFormula.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                   }`}>
                     {viewingFormula.status}
                   </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                   <div className="space-y-1">
                      <div className="text-slate-400 font-semibold">Deskripsi</div>
                      <div className="text-slate-700 leading-relaxed">{viewingFormula.description}</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-slate-400 font-semibold">Modifier Skor</div>
                      <div className="font-mono font-bold text-orange-700 text-sm">+{viewingFormula.points} Pts</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-slate-400 font-semibold">Risk Indicators</div>
                      <div className="flex flex-wrap gap-1">
                        {viewingFormula.riskIndicators?.map(ri => (
                          <span key={ri} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-bold">
                            {ri}
                          </span>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-slate-400 font-semibold">Target Rules</div>
                      <div className="font-semibold text-slate-700">
                        {(viewingFormula.isGlobal ?? (viewingFormula.scope === 'Global')) ? 'GLOBAL (Semua Rule)' : `Specific: ${viewingFormula.specificRuleCodes?.join(', ') || '-'}`}
                      </div>
                   </div>
                </div>

                {viewingFormula.repeatedOffenderConfig && (
                   <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                      <div className="text-amber-900 font-bold text-[10px] flex items-center gap-1">
                         <History className="w-3 h-3" />
                         Repeated Offender Config
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                         <div>
                            <div className="text-amber-700 opacity-70">Scope</div>
                            <div className="font-bold text-amber-900">{viewingFormula.repeatedOffenderConfig.triggerScope}</div>
                         </div>
                         <div>
                            <div className="text-amber-700 opacity-70">Threshold</div>
                            <div className="font-bold text-amber-900">≥ {viewingFormula.repeatedOffenderConfig.thresholdFrequency} alerts</div>
                         </div>
                         <div>
                            <div className="text-amber-700 opacity-70">Window</div>
                            <div className="font-bold text-amber-900">{viewingFormula.repeatedOffenderConfig.lookbackWindowValue} {viewingFormula.repeatedOffenderConfig.lookbackWindowUnit}</div>
                         </div>
                      </div>
                   </div>
                )}
              </div>

              {/* History Changes Placeholder */}
              <div className="space-y-3">
                 <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                    <History className="w-4 h-4 text-blue-600" />
                    History Changes
                 </div>
                 <div className="space-y-2">
                    {[
                      { user: 'Senior Engineer', time: '2023-11-20 14:30', action: 'Update Rule Indicators', note: 'Added Repeated Offender indicator and config.' },
                      { user: 'Fraud Analyst', time: '2023-10-15 09:15', action: 'Create Formula', note: 'Initial creation of risk formula.' }
                    ].map((log, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-1">
                         <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-blue-700">{log.user}</span>
                            <span className="text-slate-400 font-mono">{log.time}</span>
                         </div>
                         <div className="font-bold text-slate-900 text-[11px]">{log.action}</div>
                         <div className="text-[10px] text-slate-600 italic">"{log.note}"</div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
               <button
                onClick={() => setViewingFormula(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition cursor-pointer"
               >
                 Tutup View
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
