import React, { useState } from 'react';
import { useFMS } from '../../context/FMSContext';
import { ShiftCode } from '../../types/fms';
import { SHIFT_DEFINITIONS, formatDateYYYYMMDD } from '../../data/mockShiftData';
import { Layers, Calendar, CheckSquare, Square, Info, CheckCircle2 } from 'lucide-react';

interface BulkAssignShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkAssignShiftModal: React.FC<BulkAssignShiftModalProps> = ({
  isOpen,
  onClose
}) => {
  const { investigators, bulkAssignShift } = useFMS();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => investigators.map(i => i.id));
  
  const todayStr = formatDateYYYYMMDD(new Date());
  // Default 1 month ahead
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 30);
  const defaultEndStr = formatDateYYYYMMDD(defaultEnd);

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [shiftCode, setShiftCode] = useState<ShiftCode>('SHIFT-1');
  const [notes, setNotes] = useState('Bulk Plotting Jadwal Roster Bulanan');

  if (!isOpen) return null;

  const handleToggleUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === investigators.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(investigators.map(i => i.id));
    }
  };

  // Quick preset dates
  const handlePresetWeek = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    setStartDate(formatDateYYYYMMDD(start));
    setEndDate(formatDateYYYYMMDD(end));
  };

  const handlePresetMonth = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    setStartDate(formatDateYYYYMMDD(start));
    setEndDate(formatDateYYYYMMDD(end));
  };

  // Calculate day difference
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffDays = Math.max(0, Math.round((endD.getTime() - startD.getTime()) / (1000 * 3600 * 24)) + 1);
  const totalSlots = selectedUserIds.length * diffDays;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      alert('Pilih minimal 1 investigator');
      return;
    }
    if (diffDays <= 0) {
      alert('Tanggal selesai harus sama atau setelah tanggal mulai');
      return;
    }

    bulkAssignShift({
      userIds: selectedUserIds,
      startDate,
      endDate,
      shiftCode,
      notes
    });

    onClose();
  };

  const selectedShiftDef = SHIFT_DEFINITIONS.find(s => s.code === shiftCode) || SHIFT_DEFINITIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-indigo-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Bulk Assign Shift Roster</h3>
              <p className="text-[11px] text-slate-500">Plotting jadwal massal untuk beberapa investigator sekaligus</p>
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
          <div className="p-4 space-y-3.5 text-xs">
            
            {/* Multi-select Investigators */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">
                  Pilih Investigator ({selectedUserIds.length} terpilih):
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-indigo-600 hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  {selectedUserIds.length === investigators.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
              </div>

              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 divide-y divide-slate-100 space-y-1">
                {investigators.map(inv => {
                  const isChecked = selectedUserIds.includes(inv.id);
                  return (
                    <label 
                      key={inv.id}
                      className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-white cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUser(inv.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium text-slate-800">{inv.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                        {inv.role}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Date Range Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-800">
                  Periode Penugasan:
                </label>
                <div className="flex items-center space-x-1 text-[11px]">
                  <button
                    type="button"
                    onClick={handlePresetWeek}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    1 Minggu
                  </button>
                  <button
                    type="button"
                    onClick={handlePresetMonth}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    1 Bulan Penuh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">Mulai Tanggal:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">Sampai Tanggal:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Shift Selection */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Shift yang Ditetapkan:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHIFT_DEFINITIONS.map((def) => {
                  const isSelected = shiftCode === def.code;
                  return (
                    <button
                      key={def.code}
                      type="button"
                      onClick={() => setShiftCode(def.code)}
                      className={`p-2 rounded-lg border text-left transition flex flex-col ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs">{def.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{def.hours}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Catatan Penugasan:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan plotting jadwal..."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Summary Box */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-indigo-950 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Ringkasan Eksekusi:</span>
              </div>
              <div className="text-[11px] text-indigo-900">
                Akan menerapkan <strong>{selectedShiftDef.name}</strong> untuk <strong>{selectedUserIds.length} investigator</strong> selama <strong>{diffDays} hari</strong> (Total: <strong className="font-mono">{totalSlots} slot tugas</strong>).
              </div>
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
              disabled={selectedUserIds.length === 0}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
            >
              Terapkan Jadwal Massal
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
