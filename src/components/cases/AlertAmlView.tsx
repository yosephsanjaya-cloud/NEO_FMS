import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  Layers, 
  FileText
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { UrgencyBadge, AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { formatIDR } from '../../lib/utils';
import { AmlCifGroup } from '../../types/fms';

export const AlertAmlView: React.FC = () => {
  const { 
    amlGroups, 
    setSelectedAmlGroupForDetail, 
    handleOpenDetail,
    handleOpenFollowUp 
  } = useFMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const [selectedCifs, setSelectedCifs] = useState<string[]>([]);

  const handleToggleSelectAll = () => {
    if (selectedCifs.length === filteredGroups.length) {
      setSelectedCifs([]);
    } else {
      setSelectedCifs(filteredGroups.map(g => g.cif));
    }
  };

  const handleToggleSelect = (cif: string) => {
    setSelectedCifs(prev => 
      prev.includes(cif) ? prev.filter(item => item !== cif) : [...prev, cif]
    );
  };

  const filteredGroups = useMemo(() => {
    return amlGroups.filter(g => {
      if (g.investigationStatus === 'Closed' || g.overallStatus === 'Close') return false;
      if (urgencyFilter !== 'ALL' && g.highestUrgency !== urgencyFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          g.cif.toLowerCase().includes(q) ||
          g.customerName.toLowerCase().includes(q) ||
          g.phoneNumber.toLowerCase().includes(q) ||
          g.deviceId.toLowerCase().includes(q) ||
          g.rulesViolated.some(r => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [amlGroups, urgencyFilter, searchTerm]);

  const handleDetailClick = (group: AmlCifGroup) => {
    setSelectedAmlGroupForDetail(group);
    if (group.cases[0]) {
      handleOpenDetail(group.cases[0]);
    }
  };

  const handleFollowUpClick = (group: AmlCifGroup) => {
    if (group.cases[0]) {
      handleOpenFollowUp(group.cases[0]);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Alert - Anti-Money Laundering (AML)</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {filteredGroups.length} Entitas CIF Teragregasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Agregasi data berbasis entitas CIF. Jika 1 CIF melanggar beberapa rule berbeda, seluruh kasus dikonsolidasikan dalam 1 baris entitas.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[280px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari CIF, Nama Nasabah, Rule Code, No. HP, Device..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none text-xs"
            >
              <option value="ALL">Semua Urgency</option>
              <option value="High">High Urgency</option>
              <option value="Med">Medium Urgency</option>
              <option value="Low">Low Urgency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Aggregated AML Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] select-none whitespace-nowrap">
                <th className="p-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedCifs.length === filteredGroups.length && filteredGroups.length > 0}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3 text-center w-12">No.</th>
                <th className="p-3">Action</th>
                <th className="p-3">CIF Number</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Total Triggered AML Rules</th>
                <th className="p-3">Highest Risk Score</th>
                <th className="p-3">Highest Case Urgency</th>
                <th className="p-3">Investigation Status</th>
                <th className="p-3">Aging</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-sans">
                    Tidak ada entitas AML terdeteksi pada kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, idx) => {
                  const isSelected = selectedCifs.includes(group.cif);
                  return (
                    <tr key={group.cif} className={`${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'} transition`}>
                      
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(group.cif)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* No */}
                      <td className="p-3 text-center text-slate-400 font-sans">{idx + 1}</td>

                    {/* Action Buttons */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-aml-detail-${group.cif}`}
                          onClick={() => handleDetailClick(group)}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-sans font-semibold text-[10px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                          title="View Detail"
                        >
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span>Detail ({group.totalCases})</span>
                        </button>
                        <button
                          id={`btn-aml-followup-${group.cif}`}
                          onClick={() => handleFollowUpClick(group)}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-[10px] transition shadow-xs cursor-pointer"
                        >
                          Follow Up
                        </button>
                      </div>
                    </td>

                    {/* CIF Number */}
                    <td className="p-3 font-bold text-blue-700 whitespace-nowrap">
                      {group.cif}
                    </td>

                    {/* Customer Name */}
                    <td className="p-3 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      {group.customerName}
                    </td>

                    {/* Total Triggered Rules */}
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                        {group.rulesViolated.length} Rules Violated
                      </span>
                    </td>

                    {/* Highest Risk Score */}
                    <td className="p-3 whitespace-nowrap text-center">
                      <span className={`font-mono font-bold ${
                        group.maxRiskScore >= 70 ? 'text-red-600' :
                        group.maxRiskScore >= 40 ? 'text-amber-800' : 'text-emerald-700'
                      }`}>
                        {group.maxRiskScore}
                      </span>
                    </td>

                    {/* Highest Case Urgency */}
                    <td className="p-3 whitespace-nowrap">
                      <UrgencyBadge urgency={group.highestUrgency} />
                    </td>

                    {/* Investigation Status */}
                    <td className="p-3 whitespace-nowrap">
                      <InvestigationStatusBadge status={group.investigationStatus} />
                    </td>

                    {/* Aging */}
                    <td className="p-3 text-slate-700 whitespace-nowrap">
                      {group.maxAging}
                    </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Action Floating Bar */}
      {selectedCifs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-700 animate-in slide-in-from-bottom-10 z-40">
           <div className="flex items-center gap-3 border-r border-slate-700 pr-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                 {selectedCifs.length}
              </div>
              <div>
                 <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Entitas Terpilih</div>
                 <div className="text-xs font-bold whitespace-nowrap">Siap untuk Batch Processing</div>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedCifs([])}
                className="px-4 py-2 rounded-lg hover:bg-slate-800 text-xs font-bold transition"
              >
                Batalkan
              </button>
              <button 
                onClick={() => {
                  // In a real app, this would open a modal with all selected CIFs' cases
                  // For now, let's just use the first selected CIF as a demonstration
                  const group = amlGroups.find(g => g.cif === selectedCifs[0]);
                  if (group) setSelectedAmlGroupForDetail(group);
                }}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-lg shadow-blue-900/20 transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Solve Batching ({selectedCifs.length} Entitas)
              </button>
           </div>
        </div>
      )}

    </div>
  );
};
