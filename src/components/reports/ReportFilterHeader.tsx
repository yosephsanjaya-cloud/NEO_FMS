import React from 'react';
import { 
  SlidersHorizontal, 
  ShieldAlert, 
  Layers, 
  Calendar, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';
import { 
  ReportDomain, 
  ReportViewTab, 
  DateRangePreset, 
  ChartVisualizationType 
} from '../../types/fms';

interface ReportFilterHeaderProps {
  moduleDomain: ReportDomain;
  setModuleDomain: (domain: ReportDomain) => void;
  reportCategory: ReportViewTab;
  setReportCategory: (category: ReportViewTab) => void;
  datePreset: DateRangePreset;
  setDatePreset: (preset: DateRangePreset) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  chartType: ChartVisualizationType;
  setChartType: (chartType: ChartVisualizationType) => void;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
}

export const ReportFilterHeader: React.FC<ReportFilterHeaderProps> = ({
  moduleDomain,
  setModuleDomain,
  reportCategory,
  setReportCategory,
  datePreset,
  setDatePreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  chartType,
  setChartType,
  onGenerate,
  onReset,
  isGenerating
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Header Panel Title */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Filter &amp; Query Generator Laporan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Filter-First Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-300">
              Konfigurasikan dropdown di bawah untuk mengenerate laporan analitik dan visualisasi data
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Siap Query</span>
        </div>
      </div>

      {/* Main Filter Form Grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* 1. Modul System (Domain Locked) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <ShieldAlert className={`w-3.5 h-3.5 ${moduleDomain === 'Fraud' ? 'text-red-600' : 'text-amber-600'}`} />
              <span>1. Modul System</span>
            </label>
            <div>
              {moduleDomain === 'Fraud' ? (
                <div id="locked-module-domain-fraud" className="w-full bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-900 font-bold flex items-center justify-between text-xs shadow-2xs">
                  <span>Fraud System Alert (Anti-Fraud)</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
                    LOCKED
                  </span>
                </div>
              ) : (
                <div id="locked-module-domain-aml" className="w-full bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-amber-900 font-bold flex items-center justify-between text-xs shadow-2xs">
                  <span>AML System Alert (Anti-AML)</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    LOCKED
                  </span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Terkunci penuh berdasarkan domain menu sidebar
            </p>
          </div>

          {/* 2. Kategori Laporan (Report Category) */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Kategori Laporan</span>
            </label>
            <div className="relative">
              <select
                id="select-report-category"
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value as ReportViewTab)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white transition cursor-pointer appearance-none text-xs"
              >
                <option value="investigator">Performa Personil (L1 Maker / Analyst)</option>
                <option value="customer">Ringkasan Nasabah (CIF Violation Summary)</option>
                <option value="rule">Analisa Efektivitas Rule (Rule Matrix)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Dimensi data yang akan dianalisis
            </p>
          </div>

          {/* 3. Periode / Rentang Waktu */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>3. Periode / Rentang Waktu</span>
            </label>
            <div className="relative">
              <select
                id="select-date-preset"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white transition cursor-pointer appearance-none text-xs"
              >
                <option value="today">Hari Ini</option>
                <option value="last7days">7 Hari Terakhir</option>
                <option value="thisMonth">Bulan Ini</option>
                <option value="last3Months">3 Bulan Terakhir</option>
                <option value="custom">Custom Date Range</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Rentang tanggal agregasi data
            </p>
          </div>

          {/* 4. Tipe Visualisasi Chart */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center space-x-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Tipe Visualisasi Chart</span>
            </label>
            <div className="relative">
              <select
                id="select-chart-type"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as ChartVisualizationType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white transition cursor-pointer appearance-none text-xs"
              >
                <option value="donut">Pie / Donut Chart</option>
                <option value="bar">Bar Chart (Batang)</option>
                <option value="line">Line Chart (Tren)</option>
                <option value="none">Tidak Ada Chart (Hanya Tabel)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Format grafik hasil query
            </p>
          </div>

        </div>

        {/* Optional Custom Date Range Row */}
        {datePreset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 rounded-xl border">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Mulai:</span>
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Akhir:</span>
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Execution Buttons Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              Parameter aktif: <strong className="text-slate-800">{moduleDomain} System</strong> •{' '}
              <strong className="text-slate-800">
                {reportCategory === 'investigator' ? 'Performa Personil' : reportCategory === 'customer' ? 'Ringkasan Nasabah' : 'Efektivitas Rule'}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Reset Button */}
            <button
              id="btn-reset-report"
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95 shadow-xs w-1/2 sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>

            {/* Primary Generate Report Button */}
            <button
              id="btn-generate-report"
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer active:scale-95 shadow-md shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed w-1/2 sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
