import React from 'react';
import { 
  FileText, 
  Printer, 
  X, 
  ShieldAlert, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Filter 
} from 'lucide-react';
import { 
  ReportDomain, 
  InvestigatorPerformance, 
  CustomerRuleSummary, 
  RulePerformanceItem 
} from '../../types/fms';
import { formatCurrencyIDR } from '../../lib/utils';

interface ExecutiveReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: ReportDomain;
  datePresetLabel: string;
  customStartDate?: string;
  customEndDate?: string;
  selectedRule: string;
  selectedStatus: string;
  investigators: InvestigatorPerformance[];
  customers: CustomerRuleSummary[];
  rules: RulePerformanceItem[];
}

export const ExecutiveReportPdfModal: React.FC<ExecutiveReportPdfModalProps> = ({
  isOpen,
  onClose,
  domain,
  datePresetLabel,
  customStartDate,
  customEndDate,
  selectedRule,
  selectedStatus,
  investigators,
  customers,
  rules
}) => {
  if (!isOpen) return null;

  const reportDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // KPI Calculations
  const totalHandled = investigators.reduce((acc, curr) => acc + curr.totalHandled, 0);
  const totalConfirmed = investigators.reduce((acc, curr) => acc + curr.confirmedCount, 0);
  const totalFp = investigators.reduce((acc, curr) => acc + curr.falsePositiveCount, 0);
  const avgSlaRate = (investigators.reduce((acc, curr) => acc + curr.slaRate, 0) / (investigators.length || 1)).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Header Bar (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
              PDF
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight leading-tight">Executive Summary Report (PDF View)</h3>
              <p className="text-xs text-slate-400">Pratinjau dokumen laporan manajemen & audit siap cetak</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan Sebagai PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Executive Report Canvas */}
        <div id="printable-pdf-area" className="flex-1 overflow-y-auto p-8 sm:p-10 bg-white text-slate-900 print:p-6">
          
          {/* Official Bank Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl tracking-tighter shadow-xs">
                N
              </div>
              <div>
                <div className="text-xl font-black tracking-tight text-slate-900 uppercase">BANK SAMPOERNA - NEO FMS</div>
                <div className="text-xs font-semibold text-slate-600">FRAUD MANAGEMENT & AML INVESTIGATION SYSTEM</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">Dokumen Rahasia & Terbatas - Untuk Kepentingan Internal Audit & Direksi</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 rounded font-bold uppercase tracking-wider text-[10px] border border-slate-300 mb-1">
                EXECUTIVE REPORT
              </div>
              <div className="text-slate-600 font-medium">{reportDateStr}</div>
              <div className="text-slate-500 text-[11px]">Waktu Cetak: {timeStr} WIB</div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold font-mono tracking-wider text-blue-700 uppercase">
                  LAPORAN EKSEKUTIF ANALISIS PERFORMA {domain}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Laporan Hasil Investigasi {domain === 'Fraud' ? 'Fraud (L1 Maker)' : 'AML (CIF Profiling)'}
                </h1>
              </div>
              <div className="text-xs space-y-1 bg-white p-3 rounded-lg border border-slate-200 shrink-0">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Periode: <strong className="text-slate-900">{datePresetLabel} {customStartDate ? `(${customStartDate} s/d ${customEndDate})` : ''}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rule: <strong className="text-slate-900">{selectedRule}</strong> | Status: <strong className="text-slate-900">{selectedStatus}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Summary Block */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Ringkasan Kinerja Utama (Executive KPI Summary)
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Kasus Diproses</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">{totalHandled}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Seluruh Investigator</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Confirmed {domain}</div>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{totalConfirmed}</div>
                <div className="text-[11px] text-emerald-600 mt-0.5">{((totalConfirmed / (totalHandled || 1)) * 100).toFixed(1)}% True Positive</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">False Positive Count</div>
                <div className="text-2xl font-black text-amber-700 font-mono mt-1">{totalFp}</div>
                <div className="text-[11px] text-amber-600 mt-0.5">{((totalFp / (totalHandled || 1)) * 100).toFixed(1)}% Ratio FP</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Avg SLA Compliance</div>
                <div className="text-2xl font-black text-blue-700 font-mono mt-1">{avgSlaRate}%</div>
                <div className="text-[11px] text-blue-600 mt-0.5">Standard SLA &lt; 30 mnt</div>
              </div>
            </div>
          </div>

          {/* Section 1: Investigator Rankings */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Performa Individu ({domain === 'Fraud' ? 'L1 Fraud Investigator' : 'AML Analyst'})
            </h2>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Nama Investigator</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Role</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Total Kasus</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Confirmed {domain}</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">False Positive</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Avg AHT</th>
                  <th className="py-2.5 px-3 text-center">SLA Compliance</th>
                </tr>
              </thead>
              <tbody>
                {investigators.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-medium">{inv.no}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">{inv.name}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{inv.role}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-800">{inv.totalHandled}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-emerald-700 font-bold">{inv.confirmedCount}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-slate-600">{inv.falsePositiveCount}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-slate-700">{inv.avgHandlingTime}</td>
                    <td className="py-2 px-3 text-center font-mono font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.slaStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.slaRate}% ({inv.slaStatus})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: High Risk CIF Summary */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Top High-Risk Customer & Violations (Agregasi Nasabah Berdampak)
            </h2>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">CIF Number</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Nama Nasabah</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">No Rekening</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Rules Triggered</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Risk Score</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Nilai Transaksi (IDR)</th>
                  <th className="py-2.5 px-3 text-center">Status Rekening</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 6).map((cif, idx) => (
                  <tr key={cif.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{cif.no}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-blue-700">{cif.cif}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">{cif.customerName}</td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">{cif.accountNumber}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-red-600">{cif.totalRuleTriggered} Rules</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">{cif.highestRiskScore}</span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-800">
                      {formatCurrencyIDR(cif.totalTxnValueIdr)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cif.currentStatus === 'Hold Account' ? 'bg-red-100 text-red-800 border border-red-200' :
                        cif.currentStatus === 'Suspended' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {cif.currentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Rule Effectiveness */}
          <div className="mb-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              Analisis Efektivitas & Rekomendasi Rule
            </h2>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 border-r border-slate-200">Kode & Nama Rule</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Tipe</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Total Alert</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Confirmed True Pos</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">False Positive %</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Akurasi %</th>
                  <th className="py-2.5 px-3 text-center">Rekomendasi Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, idx) => (
                  <tr key={rule.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3 border-r border-slate-200">
                      <div className="font-mono font-bold text-blue-700">{rule.ruleCode}</div>
                      <div className="text-[11px] text-slate-600">{rule.ruleName}</div>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">{rule.ruleType}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-semibold">{rule.totalAlertGenerated}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-emerald-700 font-bold">{rule.confirmedTruePositive}</td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">
                      <span className={rule.falsePositiveRate > 80 ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                        {rule.falsePositiveRate}%
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-900">{rule.accuracyScore}%</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rule.recommendedAction === 'Needs Fine-Tuning' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {rule.recommendedAction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {rules.length > 0 && (() => {
                const totalAlerts = rules.reduce((acc, curr) => acc + curr.totalAlertGenerated, 0);
                const totalRuleConfirmed = rules.reduce((acc, curr) => acc + curr.confirmedTruePositive, 0);
                const totalRuleFalsePos = rules.reduce((acc, curr) => acc + curr.falsePositiveCount, 0);
                const totalFpr = totalAlerts > 0 ? (totalRuleFalsePos / totalAlerts) * 100 : 0;
                const avgAccuracy = rules.reduce((acc, curr) => acc + curr.accuracyScore, 0) / rules.length;

                return (
                  <tfoot className="border-t-2 border-slate-300">
                    <tr className="bg-slate-100 font-bold text-slate-900">
                      <td className="py-2 px-3 border-r border-slate-200">
                        <div className="font-mono font-bold text-slate-900">TOTAL ({rules.length} RULE)</div>
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">-</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-black">
                        {totalAlerts.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-emerald-700 font-bold">
                        {totalRuleConfirmed.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold">
                        {totalFpr.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold">
                        {avgAccuracy.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">-</td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>

          {/* Signatures & Approvals */}
          <div className="border-t border-slate-300 pt-6 mt-10 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div>
              <div className="font-bold text-slate-900 uppercase">Disusun Oleh:</div>
              <div className="text-slate-500 text-[11px] mb-12">FMS Analytics & Data Modeling Team</div>
              <div className="border-b border-slate-400 w-48 mb-1"></div>
              <div className="font-bold text-slate-900">Yoseph Sanjaya</div>
              <div className="text-slate-500 text-[11px]">Senior Fraud Lead & Data Specialist</div>
            </div>
            <div>
              <div className="font-bold text-slate-900 uppercase">Disetujui Oleh:</div>
              <div className="text-slate-500 text-[11px] mb-12">Head of Compliance & Fraud Operations</div>
              <div className="border-b border-slate-400 w-48 mb-1"></div>
              <div className="font-bold text-slate-900">Head of Fraud Risk Management</div>
              <div className="text-slate-500 text-[11px]">Bank Sampoerna Executive Director</div>
            </div>
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500 font-mono">
            Neo FMS PDF Engine v2.4 • Ready to export
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
};
