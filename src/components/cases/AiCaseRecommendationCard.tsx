import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  RotateCw, 
  Copy, 
  Check, 
  Lock, 
  Ban, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { FraudCase } from '../../types/fms';
import { 
  generateCaseRecommendation, 
  CaseRecommendationResult, 
  CaseRecommendationScenario,
  CaseDomain 
} from '../../lib/caseRecommendationEngine';

export interface AiAppliedData {
  reviewerResult: string;
  finalResult: string;
  closingAction: string;
  suspendDuration?: string;
  typeOfFraud: string;
  suggestedComment: string;
  replaceComment?: boolean;
}

interface AiCaseRecommendationCardProps {
  caseData: FraudCase | null | undefined;
  domain: CaseDomain;
  isReadOnly?: boolean;
  onApplyRecommendation: (data: AiAppliedData) => void;
}

export const AiCaseRecommendationCard: React.FC<AiCaseRecommendationCardProps> = ({
  caseData,
  domain,
  isReadOnly = false,
  onApplyRecommendation,
}) => {
  const [recommendation, setRecommendation] = useState<CaseRecommendationResult>(() => 
    generateCaseRecommendation(caseData, domain)
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<'temp_block' | 'permanent_block' | 'false_positive'>(
    recommendation.recommendedScenarioId
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  const [replaceExistingComment, setReplaceExistingComment] = useState(true);

  // Re-evaluate whenever caseData or domain changes
  useEffect(() => {
    const freshRec = generateCaseRecommendation(caseData, domain);
    setRecommendation(freshRec);
    setSelectedScenarioId(freshRec.recommendedScenarioId);
    setAppliedStatus(null);
  }, [caseData, domain]);

  const activeScenario = recommendation.scenarios.find(s => s.id === selectedScenarioId) || recommendation.scenarios[0];

  const handleRefreshAnalysis = async () => {
    setIsLoading(true);
    setAppliedStatus(null);
    try {
      const response = await fetch('/api/copilot/case-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData,
          domain,
          customContext: `Permintaan analisis ulang untuk ${caseData?.caseId || 'kasus saat ini'}`
        })
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setRecommendation(json.data);
          setSelectedScenarioId(json.data.recommendedScenarioId);
        }
      } else {
        // Fallback to local recalculation
        const fresh = generateCaseRecommendation(caseData, domain);
        setRecommendation(fresh);
      }
    } catch {
      const fresh = generateCaseRecommendation(caseData, domain);
      setRecommendation(fresh);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyComment = () => {
    if (activeScenario) {
      navigator.clipboard.writeText(activeScenario.suggestedComment);
      setCopiedComment(true);
      setTimeout(() => setCopiedComment(false), 2000);
    }
  };

  const handleApply = () => {
    if (!activeScenario || isReadOnly) return;
    
    onApplyRecommendation({
      reviewerResult: activeScenario.reviewerResult,
      finalResult: activeScenario.finalResult,
      closingAction: activeScenario.closingAction,
      suspendDuration: activeScenario.suspendDuration || '1 x 24 Jam',
      typeOfFraud: activeScenario.typeOfFraud,
      suggestedComment: activeScenario.suggestedComment,
      replaceComment: replaceExistingComment
    });

    setAppliedStatus(`Skenario "${activeScenario.name}" berhasil diterapkan`);
    setTimeout(() => {
      setAppliedStatus(null);
    }, 4500);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-2 border-amber-300 rounded-lg shadow-sm overflow-hidden text-xs">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#85712f] via-[#947e36] to-[#786629] text-white px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-amber-400/20 rounded border border-amber-300/40 text-amber-200">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-xs text-amber-100 tracking-wide">
              <span>AI Smart Case Recommendation</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-400/30 font-mono">
                Neo Copilot v1.22
              </span>
            </div>
            <p className="text-[10px] text-amber-200/80">
              Analisis cerdas pola transaksi & mitigasi terstandarisasi SOP Bank Sampoerna
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-black/25 rounded border border-amber-400/30 text-[10px] font-mono text-amber-200">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>{recommendation.primaryConfidence}% Confidence</span>
          </div>
          <button
            type="button"
            onClick={handleRefreshAnalysis}
            disabled={isLoading}
            className="p-1 text-amber-200 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title="Analisis Ulang dengan AI"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Violation Detection Header Banner */}
        <div className="bg-white border border-amber-200/90 rounded-md p-2.5 shadow-xs flex items-start space-x-2.5">
          <div className="mt-0.5 p-1.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold text-slate-800 text-xs">
                {recommendation.violationType}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Skor Anomali: {caseData?.finalRiskScore || caseData?.baseScore || 75}/100
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              {recommendation.violationDescription}
            </p>
          </div>
        </div>

        {/* Key Risk Indicators (KRIs) Chips */}
        {recommendation.keyRiskIndicators && recommendation.keyRiskIndicators.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>Key Risk Indicators (KRIs Terdeteksi):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.keyRiskIndicators.map((kri, idx) => (
                <div 
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border ${
                    kri.level === 'CRITICAL' 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : kri.level === 'HIGH'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title={kri.detail}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    kri.level === 'CRITICAL' ? 'bg-rose-500' : kri.level === 'HIGH' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  <span className="font-semibold">{kri.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenario Switcher Tabs */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Pilih Skenario Keputusan:</span>
            <span className="text-slate-400 font-normal">Klik untuk mengganti rekomendasi</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {recommendation.scenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`p-2 rounded border text-left transition relative cursor-pointer ${
                    isSelected
                      ? sc.id === 'temp_block'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 ring-1 ring-amber-400'
                        : sc.id === 'permanent_block'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-950 ring-1 ring-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500 text-emerald-950 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold truncate">
                      {sc.id === 'temp_block' && <Clock className="w-3 h-3 inline mr-1 text-amber-600" />}
                      {sc.id === 'permanent_block' && <Ban className="w-3 h-3 inline mr-1 text-rose-600" />}
                      {sc.id === 'false_positive' && <ShieldCheck className="w-3 h-3 inline mr-1 text-emerald-600" />}
                      {sc.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                        sc.id === 'temp_block' ? 'text-amber-600' : sc.id === 'permanent_block' ? 'text-rose-600' : 'text-emerald-600'
                      }`} />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                      sc.badgeColor === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : sc.badgeColor === 'red'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {sc.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Scenario Preview Details */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-md p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Detail Eksekusi yang Akan Diterapkan:</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Confidence: {activeScenario.confidenceScore}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block">Reviewer Result:</span>
              <span className="font-semibold text-slate-800">{activeScenario.reviewerResult}</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block">Final Result:</span>
              <span className="font-semibold text-slate-800">{activeScenario.finalResult}</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block">Closing Action:</span>
              <span className="font-semibold text-slate-800 truncate block" title={activeScenario.closingAction}>
                {activeScenario.closingAction}
              </span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-slate-500 block">Durasi / Tipe:</span>
              <span className="font-semibold text-slate-800">
                {activeScenario.suspendDuration || 'Permanen / Wajar'}
              </span>
            </div>
          </div>

          {/* Suggested Comment Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-700">Draf Narasi Reviewer Comment:</span>
              <button
                type="button"
                onClick={handleCopyComment}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[10px] font-medium cursor-pointer"
              >
                {copiedComment ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Narasi</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-amber-50/50 border border-amber-200 rounded p-2 text-[11px] text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {activeScenario.suggestedComment}
            </div>
          </div>
        </div>

        {/* Feedback / Notification */}
        {appliedStatus && (
          <div className="flex items-center space-x-2 p-2 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-[11px] animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{appliedStatus}</span>
          </div>
        )}

        {/* Action Button: One-Click Auto Fill */}
        <div className="pt-1 flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-1.5 text-[10px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={replaceExistingComment}
                onChange={(e) => setReplaceExistingComment(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3 w-3"
              />
              <span>Gantikan komentar saat ini dengan draf AI</span>
            </label>
          </div>

          <button
            type="button"
            disabled={isReadOnly || isLoading}
            onClick={handleApply}
            className={`w-full py-2.5 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer ${
              isReadOnly
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:via-amber-600 hover:to-yellow-700 text-white border border-amber-700/30 active:scale-[0.99] shadow-amber-500/20'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>⚡ Terapkan Rekomendasi AI (Auto-Fill)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
