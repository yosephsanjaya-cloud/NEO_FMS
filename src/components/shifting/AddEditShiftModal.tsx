import React, { useState, useEffect } from 'react';
import { useFMS } from '../../context/FMSContext';
import { ShiftSchedule, ShiftCode, InvestigatorRole, ShiftDutyStatus } from '../../types/fms';
import { SHIFT_DEFINITIONS } from '../../data/mockShiftData';
import { Clock, User, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface AddEditShiftModalProps {
  initialSchedule?: ShiftSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AddEditShiftModal: React.FC<AddEditShiftModalProps> = ({
  initialSchedule,
  isOpen,
  onClose
}) => {
  const { investigators, addShiftSchedule, updateShiftSchedule } = useFMS();

  const [userId, setUserId] = useState('');
  const [date, setDate] = useState('');
  const [shiftCode, setShiftCode] = useState<ShiftCode>('SHIFT-1');
  const [status, setStatus] = useState<ShiftDutyStatus>('On Duty');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialSchedule) {
      setUserId(initialSchedule.userId);
      setDate(initialSchedule.date);
      setShiftCode(initialSchedule.shiftCode);
      setStatus(initialSchedule.status);
      setNotes(initialSchedule.notes || '');
    } else {
      setUserId(investigators[0]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setShiftCode('SHIFT-1');
      setStatus('On Duty');
      setNotes('');
    }
  }, [initialSchedule, investigators, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedInv = investigators.find(u => u.id === userId);
    if (!selectedInv) return;

    const shiftDef = SHIFT_DEFINITIONS.find(s => s.code === shiftCode) || SHIFT_DEFINITIONS[0];

    if (initialSchedule && !initialSchedule.id.startsWith('new-')) {
      updateShiftSchedule(initialSchedule.id, {
        userId,
        userName: selectedInv.name,
        role: selectedInv.role,
        date,
        shiftCode,
        shiftName: shiftDef.name,
        shiftHours: shiftDef.hours,
        status,
        notes: notes || undefined
      });
    } else {
      addShiftSchedule({
        userId,
        userName: selectedInv.name,
        role: selectedInv.role,
        date,
        shiftCode,
        shiftName: shiftDef.name,
        shiftHours: shiftDef.hours,
        status,
        notes: notes || undefined
      });
    }

    onClose();
  };

  const selectedInv = investigators.find(u => u.id === userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {initialSchedule && !initialSchedule.id.startsWith('new-') ? 'Edit Jadwal Shift' : 'Tambah Jadwal Shift'}
            </h3>
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
            
            {/* Investigator Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Investigator / PIC:
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {investigators.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} — {inv.role} ({inv.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Penugasan:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Shift Type Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pilihan Shift:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHIFT_DEFINITIONS.map((def) => {
                  const isSelected = shiftCode === def.code;
                  return (
                    <button
                      key={def.code}
                      type="button"
                      onClick={() => {
                        setShiftCode(def.code);
                        if (def.code === 'OFF') {
                          setStatus('Off Duty');
                        } else {
                          setStatus('On Duty');
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-left transition flex flex-col ${
                        isSelected 
                          ? 'border-red-600 bg-red-50/70 text-red-900 ring-1 ring-red-500' 
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

            {/* Status Duty */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Tugas:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ShiftDutyStatus)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="On Duty">On Duty (Bertugas)</option>
                <option value="Off Duty">Off Duty (Libur)</option>
                <option value="Standby">Standby (On Call)</option>
                <option value="On Leave">On Leave (Cuti / Izin)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Khusus (Opsional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Backup piket, rotasi mingguan, dll."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
              />
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
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
