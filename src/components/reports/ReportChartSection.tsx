import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Activity,
  Building2
} from 'lucide-react';
import { 
  ReportDomain, 
  ReportViewTab, 
  ChartVisualizationType, 
  InvestigatorPerformance, 
  CustomerRuleSummary, 
  RulePerformanceItem 
} from '../../types/fms';
import { formatCurrencyIDR } from '../../lib/utils';

interface ReportChartSectionProps {
  moduleDomain: ReportDomain;
  reportCategory: ReportViewTab;
  chartType: ChartVisualizationType;
  investigators: InvestigatorPerformance[];
  customers: CustomerRuleSummary[];
  rules: RulePerformanceItem[];
  onRuleClick?: (ruleCode: string, ruleName: string) => void;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
const STATUS_COLORS = {
  fraud: '#ef4444',      // Confirmed Fraud (Red)
  nonFraud: '#10b981',   // False Positive / Non-Fraud (Green)
  undefine: '#f59e0b',   // Open / Undefine (Yellow/Amber)
  investigation: '#6366f1' // In Investigation
};
const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

export const ReportChartSection: React.FC<ReportChartSectionProps> = ({
  moduleDomain,
  reportCategory,
  chartType,
  investigators,
  customers,
  rules,
  onRuleClick
}) => {
  if (chartType === 'none') {
    return null;
  }

  const isFraud = moduleDomain === 'Fraud';

  // --------------------------------------------------------------------------
  // CATEGORY 1: INVESTIGATOR PERFORMANCE CHART LOGIC
  // --------------------------------------------------------------------------
  if (reportCategory === 'investigator') {
    const totalHandled = investigators.reduce((acc, curr) => acc + curr.totalHandled, 0);
    const totalConfirmed = investigators.reduce((acc, curr) => acc + curr.confirmedCount, 0);
    const totalFp = investigators.reduce((acc, curr) => acc + curr.falsePositiveCount, 0);
    const avgSla = investigators.length > 0
      ? (investigators.reduce((acc, curr) => acc + curr.slaRate, 0) / investigators.length).toFixed(1)
      : '96.5';
    const avgAht = isFraud ? '12.5 Menit/Case' : '25.4 Menit/Case';

    // Chart Data for Bar / Line
    const barData = investigators.map(inv => {
      // Parse AHT numeric value (e.g. "11.2 Menit" -> 11.2)
      const numericAht = parseFloat(inv.avgHandlingTime.replace(/[^0-9.]/g, '')) || 10;
      return {
        name: inv.name.split(' ')[0], // Short name
        fullName: inv.name,
        handled: inv.totalHandled,
        confirmed: inv.confirmedCount,
        falsePositive: inv.falsePositiveCount,
        aht: numericAht,
        sla: inv.slaRate
      };
    });

    // Donut Data: Share of cases per PIC
    const donutData = investigators.map(inv => ({
      name: inv.name,
      value: inv.totalHandled
    }));

    // Resolution share
    const resolutionDonutData = [
      { name: isFraud ? 'Confirmed Fraud' : 'Confirmed AML', value: totalConfirmed, color: '#10b981' },
      { name: 'False Positive', value: totalFp, color: '#64748b' },
      { name: 'Pending / Escalated', value: Math.max(0, totalHandled - totalConfirmed - totalFp), color: '#f59e0b' }
    ];

    return (
      <div className="space-y-4 mb-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Total Kasus Ditangani
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {totalHandled.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-semibold text-slate-500">Kasus Selesai</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>5 Personil Aktif ({isFraud ? 'L1 Maker' : 'AML Analyst'})</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                {isFraud ? 'Confirmed Fraud' : 'Confirmed AML / SAR'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {totalConfirmed.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-semibold text-slate-500">True Positive</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-slate-700 font-bold">{totalFp} Kasus</span>
              <span>dinyatakan False Positive</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Rata-rata Waktu (AHT)
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-indigo-700 font-mono">
                {avgAht}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">Optimal</span>
              <span>Target: &lt; 15 menit/kasus</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                SLA Compliance Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {avgSla}%
              </span>
              <span className="text-xs font-semibold text-emerald-700 font-medium">Target &gt; 95%</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-slate-800 font-bold">100% Personil</span>
              <span>memenuhi SLA hijau</span>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {chartType === 'bar' && <BarChart3 className="w-4 h-4 text-blue-600" />}
                {chartType === 'donut' && <PieChartIcon className="w-4 h-4 text-emerald-600" />}
                {chartType === 'line' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                <span>
                  Visualisasi Performa Personil: {chartType === 'bar' ? 'Volume Handled vs True Positives' : chartType === 'donut' ? 'Distribusi Beban Kerja & Hasil Resolusi' : 'Tren SLA & Throughput Penanganan'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Modul {moduleDomain} Alert System • Agregasi per Personil L1 Maker / Compliance Analyst
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-700">
              {chartType.toUpperCase()} CHART
            </span>
          </div>

          <div className="h-72 w-full">
            {chartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="handled" name="Total Handled" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="confirmed" name={isFraud ? 'Confirmed Fraud' : 'Confirmed AML'} fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="falsePositive" name="False Positive" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === 'donut' && (
              <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-slate-700 mb-1">Porsi Beban Kerja Penanganan per PIC</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-slate-700 mb-1">Proporsi Hasil Resolusi Kasus</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={resolutionDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {resolutionDonutData.map((entry, index) => (
                          <Cell key={`cell-res-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {chartType === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#2563eb" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[90, 100]} fontSize={11} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="handled" name="Kasus Ditangani" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="sla" name="SLA Adherence (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // CATEGORY 2: CUSTOMER RULE SUMMARY (CIF VIOLATION) CHART LOGIC
  // --------------------------------------------------------------------------
  if (reportCategory === 'customer') {
    const totalCustomers = customers.length;
    const highRiskCount = customers.filter(c => c.highestRiskScore >= 75).length;
    const medRiskCount = customers.filter(c => c.highestRiskScore >= 40 && c.highestRiskScore < 75).length;
    const lowRiskCount = customers.filter(c => c.highestRiskScore < 40).length;

    const holdCount = customers.filter(c => c.currentStatus === 'Hold Account' || c.currentStatus === 'Suspended').length;
    const totalTxnValue = customers.reduce((acc, curr) => acc + curr.totalTxnValueIdr, 0);

    // Donut data for Risk Level
    const riskDonutData = [
      { name: 'High Risk (Score ≥ 75)', value: highRiskCount, color: RISK_COLORS.high },
      { name: 'Medium Risk (40 - 74)', value: medRiskCount, color: RISK_COLORS.medium },
      { name: 'Low Risk (< 40)', value: lowRiskCount, color: RISK_COLORS.low }
    ];

    // Status Donut
    const statusCounts: Record<string, number> = {};
    customers.forEach(c => {
      statusCounts[c.currentStatus] = (statusCounts[c.currentStatus] || 0) + 1;
    });
    const statusDonutData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));

    // Top 5 CIF Bar data
    const top5Cif = [...customers]
      .sort((a, b) => b.totalTxnValueIdr - a.totalTxnValueIdr)
      .slice(0, 5)
      .map(c => ({
        name: c.customerName.length > 15 ? c.customerName.slice(0, 15) + '...' : c.customerName,
        fullName: c.customerName,
        cif: c.cif,
        valueInJt: Math.round(c.totalTxnValueIdr / 1000000),
        riskScore: c.highestRiskScore,
        alertCount: c.totalRuleTriggered
      }));

    return (
      <div className="space-y-4 mb-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Total CIF Terindikasi
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {totalCustomers}
              </span>
              <span className="text-xs font-semibold text-slate-500">Nasabah Unik</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Domain {moduleDomain} Alert</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                CIF High Risk (Kritis)
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-red-700 font-mono">
                {highRiskCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">Skor &ge; 75</span>
            </div>
            <div className="mt-2 text-[11px] text-red-600 font-semibold flex items-center gap-1">
              <span>{Math.round((highRiskCount / (totalCustomers || 1)) * 100)}% dari seluruh CIF terindikasi</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Rekening Diblokir / Hold
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-amber-800 font-mono">
                {holdCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">CIF Diamankan</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">Mitigasi Aktif</span>
              <span>Preventif kerugian bank</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                Total Transaksi Terdampak
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-lg font-black text-purple-900 font-mono truncate" title={formatCurrencyIDR(totalTxnValue)}>
                {formatCurrencyIDR(totalTxnValue)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <span>Akumulasi nilai transaksi alert</span>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {chartType === 'donut' && <PieChartIcon className="w-4 h-4 text-red-600" />}
                {chartType === 'bar' && <BarChart3 className="w-4 h-4 text-blue-600" />}
                {chartType === 'line' && <TrendingUp className="w-4 h-4 text-indigo-600" />}
                <span>
                  Visualisasi Ringkasan Nasabah: {chartType === 'donut' ? 'Distribusi Tingkat Risiko & Status Rekening' : chartType === 'bar' ? 'Top CIF Berdasarkan Nilai Transaksi & Skor Risiko' : 'Tren Skor Risiko vs Frekuensi Alert'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemetaan risiko nasabah terindikasi pelanggaran aturan {moduleDomain}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-700">
              {chartType.toUpperCase()} CHART
            </span>
          </div>

          <div className="h-72 w-full">
            {chartType === 'donut' && (
              <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-slate-700 mb-1">Distribusi Tingkat Risiko Nasabah</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={riskDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name.split(' ')[0]}: ${value} CIF`}
                        labelLine={false}
                      >
                        {riskDonutData.map((entry, index) => (
                          <Cell key={`cell-risk-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-slate-700 mb-1">Distribusi Status Rekening CIF</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={statusDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusDonutData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {chartType === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top5Cif} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#2563eb" fontSize={11} tickLine={false} label={{ value: 'Juta IDR', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[0, 100]} fontSize={11} tickLine={false} unit=" pts" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    labelFormatter={(label, payload) => `${payload?.[0]?.payload?.fullName} (${payload?.[0]?.payload?.cif})`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="valueInJt" name="Nilai Transaksi (Juta IDR)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="riskScore" name="Risk Score (Max 100)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={top5Cif} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    labelFormatter={(label, payload) => `${payload?.[0]?.payload?.fullName} (${payload?.[0]?.payload?.cif})`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="riskScore" name="Risk Score (Pts)" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="alertCount" name="Total Alert Rules Triggered" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // CATEGORY 3: RULE PERFORMANCE & RESOLUTION CHART LOGIC (LEGACY ADAPTATION)
  // --------------------------------------------------------------------------
  if (reportCategory === 'rule') {
    const totalActiveRules = rules.length;
    const totalHits = rules.reduce((acc, curr) => acc + curr.totalAlertGenerated, 0);
    const totalFP = rules.reduce((acc, curr) => acc + curr.falsePositiveCount, 0);
    const totalConfirmed = rules.reduce((acc, curr) => acc + curr.confirmedTruePositive, 0);
    const totalOpen = rules.reduce((acc, curr) => acc + curr.openCases, 0);
    const totalInvestigation = rules.reduce((acc, curr) => acc + curr.inInvestigation, 0);

    // Legacy 1: Pie Chart Data - "Jumlah Alert Case Management per Status"
    const statusPieData = [
      { name: isFraud ? 'Confirmed Fraud' : 'Confirmed AML', value: totalConfirmed, color: STATUS_COLORS.fraud },
      { name: 'Non-Fraud / False Positive', value: totalFP, color: STATUS_COLORS.nonFraud },
      { name: 'Open / Undefine', value: totalOpen, color: STATUS_COLORS.undefine },
      { name: 'In Investigation', value: totalInvestigation, color: STATUS_COLORS.investigation }
    ].filter(item => item.value > 0);

    // Legacy 2: Horizontal Bar Chart Data - "Jumlah Alert Case Management per Case" (Rule Frequency)
    // Map rule codes (with legacy friendly alias codes if available)
    const ruleFrequencyData = rules.map((r, index) => {
      // Short display code e.g. B-03-c, BI-FAST-070B, etc.
      let shortCode = r.ruleCode;
      if (r.ruleCode.includes('HIGH-VAL')) shortCode = 'B-03-c (High Value)';
      else if (r.ruleCode.includes('VEL-CARD')) shortCode = 'BI-FAST-070B BATCH (Velocity)';
      else if (r.ruleCode.includes('GEO-ANOMALY')) shortCode = 'F-070B-06-m-2 (Geo Travel)';
      else if (r.ruleCode.includes('DEV-MULTI')) shortCode = 'DEV-MULTI-004';
      else if (r.ruleCode.includes('DORMANT')) shortCode = 'DORMANT-005';
      else if (r.ruleCode.includes('QRIS')) shortCode = 'QRIS-RAPID-006';
      else if (r.ruleCode.includes('AUTH-FAILED')) shortCode = 'AUTH-FAIL-007';
      else if (r.ruleCode.includes('ATO-BENEFICIARY')) shortCode = 'ATO-BENEFICIARY-008';
      else if (r.ruleCode.includes('AML-STRUCT')) shortCode = 'STRUCT-AML-001';
      else if (r.ruleCode.includes('AML-SANCTION')) shortCode = 'SANCTION-PEP-002';
      else if (r.ruleCode.includes('AML-HIGH-RISK')) shortCode = 'JURISDICTION-003';
      else if (r.ruleCode.includes('AML-PASS-THROUGH')) shortCode = 'PASS-THROUGH-004';

      return {
        id: r.id,
        ruleCode: r.ruleCode,
        ruleName: r.ruleName,
        shortCode: shortCode,
        hits: r.totalAlertGenerated,
        confirmed: r.confirmedTruePositive,
        falsePos: r.falsePositiveCount,
        open: r.openCases,
        inInvestigation: r.inInvestigation
      };
    }).sort((a, b) => b.hits - a.hits);

    // Legacy 3: Aggregated Monthly Matrix Data
    // Prepare monthly breakdown mock (August 2026, July 2026, June 2026)
    const monthlyMatrix = [
      {
        month: 'Agustus 2026 (Bulan Ini)',
        periodKey: 'Aug 2026',
        isCurrent: true,
        rulesHit: rules.reduce((acc, r) => {
          acc[r.ruleCode] = Math.round(r.totalAlertGenerated * 0.45);
          return acc;
        }, {} as Record<string, number>),
        total: Math.round(totalHits * 0.45)
      },
      {
        month: 'Juli 2026',
        periodKey: 'Jul 2026',
        isCurrent: false,
        rulesHit: rules.reduce((acc, r) => {
          acc[r.ruleCode] = Math.round(r.totalAlertGenerated * 0.35);
          return acc;
        }, {} as Record<string, number>),
        total: Math.round(totalHits * 0.35)
      },
      {
        month: 'Juni 2026',
        periodKey: 'Jun 2026',
        isCurrent: false,
        rulesHit: rules.reduce((acc, r) => {
          acc[r.ruleCode] = Math.round(r.totalAlertGenerated * 0.20);
          return acc;
        }, {} as Record<string, number>),
        total: Math.round(totalHits * 0.20)
      }
    ];

    return (
      <div className="space-y-6 mb-6">
        
        {/* ---------------------------------------------------------------- */}
        {/* 1. TOP METRIC CARDS (3 STAT CARDS: FRAUD, NON-FRAUD, UNDEFINE) */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Fraud / Red (Confirmed Fraud / AML) */}
          <div 
            onClick={() => onRuleClick && onRuleClick('ALL', 'Semua Rule (Confirmed True Positive)')}
            className="bg-white p-4.5 rounded-2xl border-2 border-red-200 hover:border-red-400 bg-linear-to-br from-red-50/50 to-white shadow-xs transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider font-mono">
                {isFraud ? 'Confirmed Fraud' : 'Confirmed AML'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-red-700 font-mono">
                {totalConfirmed.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-red-600">Kasus</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between font-medium">
              <span>True Positive ({totalHits > 0 ? ((totalConfirmed / totalHits) * 100).toFixed(1) : 0}%)</span>
              <span className="text-red-700 font-bold group-hover:underline text-[10px] uppercase font-mono">Lihat Drilldown &rarr;</span>
            </div>
          </div>

          {/* Card 2: Non-Fraud / Green (False Positive) */}
          <div 
            onClick={() => onRuleClick && onRuleClick('ALL', 'Semua Rule (False Positive / Non-Fraud)')}
            className="bg-white p-4.5 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 bg-linear-to-br from-emerald-50/50 to-white shadow-xs transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                Non-Fraud / False Positive
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-800 font-mono">
                {totalFP.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-emerald-700">Kasus</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between font-medium">
              <span>False Positive ({totalHits > 0 ? ((totalFP / totalHits) * 100).toFixed(1) : 0}%)</span>
              <span className="text-emerald-700 font-bold group-hover:underline text-[10px] uppercase font-mono">Lihat Drilldown &rarr;</span>
            </div>
          </div>

          {/* Card 3: Undefine / Yellow-Orange (Open / In Investigation) */}
          <div 
            onClick={() => onRuleClick && onRuleClick('ALL', 'Semua Rule (Open / Undefine)')}
            className="bg-white p-4.5 rounded-2xl border-2 border-amber-200 hover:border-amber-400 bg-linear-to-br from-amber-50/50 to-white shadow-xs transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
                Open / Undefine
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-800 font-mono">
                {(totalOpen + totalInvestigation).toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-amber-700">Kasus</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between font-medium">
              <span>{totalOpen} Open • {totalInvestigation} On Check</span>
              <span className="text-amber-800 font-bold group-hover:underline text-[10px] uppercase font-mono">Lihat Drilldown &rarr;</span>
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 2. VISUAL CHARTS SECTION (PIE CHART & HORIZONTAL BAR CHART) */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* A. PIE CHART: "Jumlah Alert Case Management per Status" (Col 5) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-blue-600" />
                    <span>Jumlah Alert Case Management per Status</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proporsi resolusi investigasi alert {moduleDomain}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  STATUS PIE
                </span>
              </div>

              {/* Responsive Pie Container */}
              <div className="h-64 w-full flex items-center justify-center mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-status-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [`${val} Kasus (${((val / (totalHits || 1)) * 100).toFixed(1)}%)`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Status Legend Grid */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-red-50/70 border border-red-100 flex items-center justify-between">
                <span className="font-semibold text-red-800">Fraud / TP:</span>
                <span className="font-mono font-bold text-red-900">{totalConfirmed}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <span className="font-semibold text-emerald-800">Non-Fraud / FP:</span>
                <span className="font-mono font-bold text-emerald-900">{totalFP}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                <span className="font-semibold text-amber-800">Open / Undefine:</span>
                <span className="font-mono font-bold text-amber-900">{totalOpen}</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <span className="font-semibold text-indigo-800">In Investigation:</span>
                <span className="font-mono font-bold text-indigo-900">{totalInvestigation}</span>
              </div>
            </div>
          </div>

          {/* B. HORIZONTAL BAR CHART: "Jumlah Alert Case Management per Case" (Col 7) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Jumlah Alert Case Management per Case (Rule Hits)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik pada bar batang untuk membuka drilldown <strong>"Report Hasil Analisa User"</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span>INTERACTIVE</span>
                </span>
              </div>

              {/* Horizontal Bar Chart (layout="vertical") */}
              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={ruleFrequencyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    onClick={(state: any) => {
                      if (state && state.activePayload && state.activePayload.length > 0) {
                        const clicked = state.activePayload[0].payload;
                        if (onRuleClick) {
                          onRuleClick(clicked.ruleCode, clicked.ruleName);
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="shortCode" 
                      stroke="#475569" 
                      fontSize={11} 
                      tickLine={false} 
                      width={160} 
                      tick={{ fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      formatter={(value: any, name: any, item: any) => [
                        `${value} Hits (${item.payload.confirmed} TP, ${item.payload.falsePos} FP)`,
                        'Total Hits'
                      ]}
                      labelFormatter={(label, payload) => `${label} - ${payload?.[0]?.payload?.ruleName}`}
                    />
                    <Bar 
                      dataKey="hits" 
                      name="Total Hits" 
                      fill="#2563eb" 
                      radius={[0, 6, 6, 0]} 
                      className="cursor-pointer hover:opacity-85 transition"
                    >
                      {ruleFrequencyData.map((entry, index) => (
                        <Cell 
                          key={`cell-bar-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Klik bar mana saja untuk membuka rincian Case ID pop-up</span>
              </div>
              <button
                onClick={() => onRuleClick && onRuleClick('ALL', 'Semua Rule Terdaftar')}
                className="text-blue-600 hover:text-blue-800 font-bold hover:underline text-[11px] font-mono cursor-pointer"
              >
                Lihat Semua Kasus &rarr;
              </button>
            </div>
          </div>

        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 3. AGGREGATION MATRIX TABLE SECTION (MONTHLY BREAKDOWN PER RULE) */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Agregasi Alert Case Management per Periode Bulanan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Matriks akumulasi hits alert per kode rule untuk perbandingan tren bulanan
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                MONTHLY MATRIX
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Periode Bulan</th>
                  {rules.map((r) => (
                    <th key={r.id} className="py-2.5 px-2.5 text-center font-mono" title={r.ruleName}>
                      <button 
                        onClick={() => onRuleClick && onRuleClick(r.ruleCode, r.ruleName)}
                        className="hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        {r.ruleCode}
                      </button>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right font-mono font-bold bg-slate-200/70 text-slate-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {monthlyMatrix.map((row, idx) => (
                  <tr key={idx} className={row.isCurrent ? 'bg-blue-50/40 font-semibold' : 'hover:bg-slate-50/80 transition'}>
                    <td className="py-3 px-3 font-sans font-bold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
                      {row.isCurrent && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      <span>{row.month}</span>
                    </td>
                    {rules.map((r) => {
                      const val = row.rulesHit[r.ruleCode] || 0;
                      return (
                        <td key={r.id} className="py-3 px-2.5 text-center">
                          <button
                            onClick={() => onRuleClick && onRuleClick(r.ruleCode, r.ruleName)}
                            className="px-2 py-0.5 rounded hover:bg-blue-100 hover:text-blue-800 transition cursor-pointer text-slate-700 font-semibold"
                            title={`Lihat drilldown ${r.ruleCode}`}
                          >
                            {val}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right font-black text-blue-900 bg-slate-100/50">
                      {row.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-mono font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="py-3 px-3 font-sans">Total Akumulasi</td>
                  {rules.map((r) => (
                    <td key={r.id} className="py-3 px-2.5 text-center text-blue-800">
                      {r.totalAlertGenerated}
                    </td>
                  ))}
                  <td className="py-3 px-3 text-right text-red-700 font-black">
                    {totalHits.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    );
  }

  return null;
};
