import React, { useState, useMemo } from 'react';
import { useFMS } from '../../context/FMSContext';
import { SHIFT_DEFINITIONS } from '../../data/mockShiftData';
import { ArrowRightLeft, ShieldAlert, Search, CheckSquare, Square, Info, FileText } from 'lucide-react';
import { InvestigatorProfile } from '../../types/fms';

interface CreateHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateHandoverModal: React.FC<CreateHandoverModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    investigators, 
    fraudCases, 
    activeShiftDef, 
    createShiftHandover 
  } = useFMS();

  // Next shift calculation
  const nextShiftDef = useMemo(() => {
    if (activeShiftDef.code === 'SHIFT-1') return SHIFT_DEFINITIONS[1];
    if (activeShiftDef.code === 'SHIFT-2') return SHIFT_DEFINITIONS[2];
    return SHIFT_DEFINITIONS[0];
  }, [activeShiftDef]);

  const [offloadingUserId, setOffloadingUserId] = useState<string>(() => investigators[0]?.id || '');
  const [receivingUserId, setReceivingUserId] = useState<string>(() => investigators[1]?.id || '');
  const [shiftFrom, setShiftFrom] = useState(`${activeShiftDef.name} (${activeShiftDef.hours})`);
  const [shiftTo, setShiftTo] = useState(`${nextShiftDef.name} (${nextShiftDef.hours})`);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [notes, setNotes] = useState('');

  // Unresolved cases available for handover
  const pendingCases = useMemo(() => {
    return fraudCases.filter(c => c.alertStatus === 'Open' || c.investigationStatus === 'On Check' || c.alertStatus === 'Pending Approval');
  }, [fraudCases]);

  const filteredPendingCases = useMemo(() => {
    return pendingCases.filter(c => 
      c.caseId.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.cif.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.ruleName.toLowerCase().includes(caseSearchQuery.toLowerCase())
    );
  }, [pendingCases, caseSearchQuery]);

  if (!isOpen) return null;

  const handleToggleCase = (caseId: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(caseId) ? prev.filter(id => id !== caseId) : [...prev, caseId]
    );
  };

  const handleSelectAllCases = () => {
    if (selectedCaseIds.length === filteredPendingCases.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(filteredPendingCases.map(c => c.caseId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Harap isi catatan serah terima / shift notes.');
      return;
    }

    const offloadingInv = investigators.find(u => u.id === offloadingUserId) || investigators[0];
    const receivingInv = investigators.find(u => u.id === receivingUserId) || investigators[1];

    createShiftHandover({
      offloadingUserId: offloadingInv.id,
      offloadingUserName: offloadingInv.name,
      offloadingRole: offloadingInv.role,
      receivingUserId: receivingInv.id,
      receivingUserName: receivingInv.name,
      receivingRole: receivingInv.role,
      shiftFrom,
      shiftTo,
      caseIds: selectedCaseIds,
      criticalCaseCount: selectedCaseIds.length,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Formulir Serah Terima Shift (Handover)</h3>
              <p className="text-[11px] text-slate-500">Pencatatan pergantian tugas investigator & eskalasi kasus investigasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-3.5 text-xs max-h-[75vh] overflow-y-auto">
            
            {/* PIC Transition Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              
              {/* Offloading */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Offloading PIC (Shift Lama):
                </label>
                <select
                  value={offloadingUserId}
                  onChange={(e) => setOffloadingUserId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {investigators.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.role})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={shiftFrom}
                  onChange={(e) => setShiftFrom(e.target.value)}
                  placeholder="Nama Shift Asal"
                  className="w-full text-[11px] p-1.5 mt-1.5 bg-white border border-slate-200 rounded text-slate-600 focus:outline-none"
                />
              </div>

              {/* Receiving */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Receiving PIC (Shift Baru):
                </label>
                <select
                  value={receivingUserId}
                  onChange={(e) => setReceivingUserId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {investigators.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} ({inv.role})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={shiftTo}
                  onChange={(e) => setShiftTo(e.target.value)}
                  placeholder="Nama Shift Tujuan"
                  className="w-full text-[11px] p-1.5 mt-1.5 bg-white border border-slate-200 rounded text-slate-600 focus:outline-none"
                />
              </div>

            </div>

            {/* Attached Cases Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>Pilih Kasus yang Diserahterimakan ({selectedCaseIds.length} terpilih):</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllCases}
                  className="text-amber-700 hover:underline text-[11px] font-semibold"
                >
                  {selectedCaseIds.length === filteredPendingCases.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              </div>

              {/* Search Cases */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Case ID, Nasabah, CIF, Rule..."
                  value={caseSearchQuery}
                  onChange={(e) => setCaseSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Cases List */}
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
                {filteredPendingCases.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Tidak ada kasus pending yang cocok.
                  </div>
                ) : (
                  filteredPendingCases.map(c => {
                    const isChecked = selectedCaseIds.includes(c.caseId);

                    return (
                      <label
                        key={c.id}
                        className={`flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer transition ${
                          isChecked ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCase(c.caseId)}
                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-bold text-slate-900">{c.caseId}</span>
                              <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                c.caseUrgency === 'High' ? 'bg-red-100 text-red-700' :
                                c.caseUrgency === 'Med' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {c.caseUrgency}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {c.customerName} ({c.cif}) — {c.ruleName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            Score: {c.finalRiskScore}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Shift Notes */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Catatan Serah Terima / Shift Notes: <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan kronologi singkat, kasus urgent bernominal tinggi, instruksi monitoring mutasi lanjutan, status kontak nasabah, atau SLA eskalasi eksternal..."
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Setelah disubmit, laporan serah terima akan berstatus <strong>Pending Acknowledge</strong> sampai PIC Shift Baru menekan tombol <em>Acknowledge & Takeover</em>.
              </span>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
            >
              Kirim Berita Acara Handover
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
