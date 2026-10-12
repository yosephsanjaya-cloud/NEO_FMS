import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  Sparkles, 
  Zap, 
  CreditCard, 
  Building, 
  MousePointerClick, 
  AlertCircle, 
  SlidersHorizontal,
  Info,
  Check,
  RotateCcw,
  Layers
} from 'lucide-react';
import { FraudCase } from '../../types/fms';

export type SmartSelectorMode = 'MANUAL' | 'RULE_BASIC' | 'ACCOUNT' | 'CIF';

export interface CaseSelectionCriteria {
  mode: SmartSelectorMode;
  value?: string;
  count: number;
  totalAvailable: number;
}

interface SmartBatchSelectorProps {
  cases: FraudCase[];
  selectedCaseIds: string[];
  selectionCriteria: CaseSelectionCriteria | null;
  onApplySelection: (caseIds: string[], criteria: CaseSelectionCriteria) => void;
  onClearSelection: () => void;
  maxLimit?: number;
}

export const SmartBatchSelector: React.FC<SmartBatchSelectorProps> = ({
  cases,
  selectedCaseIds,
  selectionCriteria,
  onApplySelection,
  onClearSelection,
  maxLimit = 10
}) => {
  const [activeMode, setActiveMode] = useState<SmartSelectorMode>('MANUAL');
  
  // Value states for each mode
  const [selectedRule, setSelectedRule] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCif, setSelectedCif] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 1. Distinct Rule Basics from cases
  const availableRules = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    cases.forEach(c => {
      const code = c.ruleBasicCode;
      if (!code) return;
      if (!map.has(code)) {
        map.set(code, { code, name: c.ruleName || code, count: 0 });
      }
      map.get(code)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [cases]);

  // 2. Distinct Accounts from cases
  const availableAccounts = useMemo(() => {
    const map = new Map<string, { acc: string; customerName: string; count: number; cif: string }>();
    cases.forEach(c => {
      const acc = c.accountNumber || c.transaction?.sourceAccount;
      if (!acc) return;
      if (!map.has(acc)) {
        map.set(acc, { acc, customerName: c.customerName, count: 0, cif: c.cif });
      }
      map.get(acc)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [cases]);

  // 3. Distinct CIFs from cases
  const availableCifs = useMemo(() => {
    const map = new Map<string, { cif: string; customerName: string; count: number }>();
    cases.forEach(c => {
      const cif = c.cif;
      if (!cif) return;
      if (!map.has(cif)) {
        map.set(cif, { cif, customerName: c.customerName, count: 0 });
      }
      map.get(cif)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [cases]);

  // Helper sorting to apply urgency & risk score priority
  const sortCasesByPriority = (items: FraudCase[]) => {
    const urgencyWeight: Record<string, number> = { High: 3, Med: 2, Low: 1 };
    return [...items].sort((a, b) => {
      const diffUrgency = (urgencyWeight[b.caseUrgency] || 0) - (urgencyWeight[a.caseUrgency] || 0);
      if (diffUrgency !== 0) return diffUrgency;
      return (b.finalRiskScore || 0) - (a.finalRiskScore || 0);
    });
  };

  // Handler: Execute Auto Selection by Criteria
  const handleSelectByRule = () => {
    if (!selectedRule) return;
    const matched = cases.filter(c => c.ruleBasicCode === selectedRule);
    const sorted = sortCasesByPriority(matched);
    const capped = sorted.slice(0, maxLimit);
    const cappedIds = capped.map(c => c.id);

    const criteria: CaseSelectionCriteria = {
      mode: 'RULE_BASIC',
      value: selectedRule,
      count: cappedIds.length,
      totalAvailable: matched.length
    };

    onApplySelection(cappedIds, criteria);

    if (matched.length > maxLimit) {
      setFeedbackNotice(`${cappedIds.length} dari ${matched.length} kasus dengan Rule [${selectedRule}] dicentang otomatis (Mencapai batas maksimum batch ${maxLimit} case).`);
    } else {
      setFeedbackNotice(`${cappedIds.length} kasus dengan Rule [${selectedRule}] berhasil dicentang.`);
    }
  };

  const handleSelectByAccount = () => {
    if (!selectedAccount) return;
    const matched = cases.filter(c => (c.accountNumber === selectedAccount || c.transaction?.sourceAccount === selectedAccount));
    const sorted = sortCasesByPriority(matched);
    const capped = sorted.slice(0, maxLimit);
    const cappedIds = capped.map(c => c.id);

    const criteria: CaseSelectionCriteria = {
      mode: 'ACCOUNT',
      value: selectedAccount,
      count: cappedIds.length,
      totalAvailable: matched.length
    };

    onApplySelection(cappedIds, criteria);

    if (matched.length > maxLimit) {
      setFeedbackNotice(`${cappedIds.length} dari ${matched.length} kasus untuk Rekening [${selectedAccount}] dicentang otomatis (Mencapai batas maksimum batch ${maxLimit} case).`);
    } else {
      setFeedbackNotice(`${cappedIds.length} kasus untuk Rekening [${selectedAccount}] berhasil dicentang.`);
    }
  };

  const handleSelectByCif = () => {
    if (!selectedCif) return;
    const matched = cases.filter(c => c.cif === selectedCif);
    const sorted = sortCasesByPriority(matched);
    const capped = sorted.slice(0, maxLimit);
    const cappedIds = capped.map(c => c.id);

    const criteria: CaseSelectionCriteria = {
      mode: 'CIF',
      value: selectedCif,
      count: cappedIds.length,
      totalAvailable: matched.length
    };

    onApplySelection(cappedIds, criteria);

    if (matched.length > maxLimit) {
      setFeedbackNotice(`${cappedIds.length} dari ${matched.length} kasus untuk CIF [${selectedCif}] dicentang otomatis (Mencapai batas maksimum batch ${maxLimit} case).`);
    } else {
      setFeedbackNotice(`${cappedIds.length} kasus untuk CIF [${selectedCif}] berhasil dicentang.`);
    }
  };

  // Preview counts based on current dropdown selections
  const rulePreviewCount = selectedRule ? cases.filter(c => c.ruleBasicCode === selectedRule).length : 0;
  const accountPreviewCount = selectedAccount ? cases.filter(c => (c.accountNumber === selectedAccount || c.transaction?.sourceAccount === selectedAccount)).length : 0;
  const cifPreviewCount = selectedCif ? cases.filter(c => c.cif === selectedCif).length : 0;

  return (
    <div 
      id="smart-batch-selector"
      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3"
    >
      {/* Selector Header & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Smart Batch Selector (Seleksi Otomatis)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Maks. {maxLimit} Kasus
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Pilih kriteria untuk mencentang kasus massal secara otomatis dengan urutan High Urgency &amp; Risk Score.
            </p>
          </div>
        </div>

        {/* Mode Selector Radio Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            id="tab-mode-manual"
            onClick={() => {
              setActiveMode('MANUAL');
              setFeedbackNotice(null);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'MANUAL'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>1. Manual Select</span>
          </button>

          <button
            type="button"
            id="tab-mode-rule"
            onClick={() => {
              setActiveMode('RULE_BASIC');
              if (!selectedRule && availableRules.length > 0) {
                setSelectedRule(availableRules[0].code);
              }
              setFeedbackNotice(null);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'RULE_BASIC'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Same Rule Basic</span>
          </button>

          <button
            type="button"
            id="tab-mode-account"
            onClick={() => {
              setActiveMode('ACCOUNT');
              if (!selectedAccount && availableAccounts.length > 0) {
                setSelectedAccount(availableAccounts[0].acc);
              }
              setFeedbackNotice(null);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'ACCOUNT'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Same Account</span>
          </button>

          <button
            type="button"
            id="tab-mode-cif"
            onClick={() => {
              setActiveMode('CIF');
              if (!selectedCif && availableCifs.length > 0) {
                setSelectedCif(availableCifs[0].cif);
              }
              setFeedbackNotice(null);
            }}
            className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition flex items-center space-x-1.5 cursor-pointer ${
              activeMode === 'CIF'
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>4. Same CIF</span>
          </button>
        </div>
      </div>

      {/* Mode Controls Content */}
      <div className="pt-1">
        {/* MODE 1: MANUAL SELECT */}
        {activeMode === 'MANUAL' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2 text-slate-600">
              <MousePointerClick className="w-4 h-4 text-slate-400" />
              <span>Centang satu per satu checkbox transaksi pada tabel di bawah untuk memilih kasus yang diinginkan.</span>
            </div>
            {selectedCaseIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 font-mono">{selectedCaseIds.length} Terpilih</span>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold transition"
                >
                  Reset Seleksi
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: FILTER & SELECT BY SAME RULE BASIC */}
        {activeMode === 'RULE_BASIC' && (
          <div className="flex flex-wrap items-center gap-3 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
            <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
              <span className="text-indigo-900 font-bold text-xs shrink-0 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                Pilih Rule Basic:
              </span>
              <select
                id="select-smart-rule-basic"
                value={selectedRule}
                onChange={(e) => {
                  setSelectedRule(e.target.value);
                  setFeedbackNotice(null);
                }}
                className="w-full bg-white border border-indigo-200 text-indigo-950 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {availableRules.map(r => (
                  <option key={r.code} value={r.code}>
                    {r.code} - {r.name} ({r.count} alert)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              id="btn-apply-select-rule"
              onClick={handleSelectByRule}
              disabled={!selectedRule || rulePreviewCount === 0}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Centang Semua Case Rule Ini ({rulePreviewCount > maxLimit ? `${maxLimit} dari ${rulePreviewCount}` : rulePreviewCount} Kasus)</span>
            </button>
          </div>
        )}

        {/* MODE 3: FILTER & SELECT BY SAME ACCOUNT NUMBER */}
        {activeMode === 'ACCOUNT' && (
          <div className="flex flex-wrap items-center gap-3 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
              <span className="text-blue-900 font-bold text-xs shrink-0 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                Pilih / Input No. Rekening:
              </span>
              <select
                id="select-smart-account"
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                  setFeedbackNotice(null);
                }}
                className="w-full bg-white border border-blue-200 text-blue-950 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium"
              >
                {availableAccounts.map(a => (
                  <option key={a.acc} value={a.acc}>
                    {a.acc} • {a.customerName} ({a.count} Kasus, CIF: {a.cif})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              id="btn-apply-select-account"
              onClick={handleSelectByAccount}
              disabled={!selectedAccount || accountPreviewCount === 0}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Centang Semua Case Rekening Ini ({accountPreviewCount > maxLimit ? `${maxLimit} dari ${accountPreviewCount}` : accountPreviewCount} Kasus)</span>
            </button>
          </div>
        )}

        {/* MODE 4: FILTER & SELECT BY SAME CIF */}
        {activeMode === 'CIF' && (
          <div className="flex flex-wrap items-center gap-3 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
              <span className="text-purple-900 font-bold text-xs shrink-0 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-purple-600" />
                Pilih / Input Nomor CIF:
              </span>
              <select
                id="select-smart-cif"
                value={selectedCif}
                onChange={(e) => {
                  setSelectedCif(e.target.value);
                  setFeedbackNotice(null);
                }}
                className="w-full bg-white border border-purple-200 text-purple-950 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500 font-medium"
              >
                {availableCifs.map(c => (
                  <option key={c.cif} value={c.cif}>
                    CIF: {c.cif} • {c.customerName} ({c.count} Kasus Terdeteksi)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              id="btn-apply-select-cif"
              onClick={handleSelectByCif}
              disabled={!selectedCif || cifPreviewCount === 0}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Centang Semua Case CIF Ini ({cifPreviewCount > maxLimit ? `${maxLimit} dari ${cifPreviewCount}` : cifPreviewCount} Kasus)</span>
            </button>
          </div>
        )}
      </div>

      {/* Safety Notice & Limiter Feedback Banner */}
      {feedbackNotice && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedbackNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 text-xs"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
};
