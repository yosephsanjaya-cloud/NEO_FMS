import React, { useState, useMemo } from 'react';
import { useFMS } from '../../context/FMSContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  Phone, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDateYYYYMMDD, SHIFT_DEFINITIONS } from '../../data/mockShiftData';
import { ShiftCode, ShiftSchedule, InvestigatorProfile } from '../../types/fms';

interface DailyRosterViewProps {
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onSelectCellEdit: (schedule: ShiftSchedule) => void;
}

export const DailyRosterView: React.FC<DailyRosterViewProps> = ({
  onOpenAddModal,
  onOpenBulkModal,
  onSelectCellEdit
}) => {
  const { 
    investigators, 
    shiftSchedules, 
    activeShiftDef, 
    getInvestigatorDutyStatus 
  } = useFMS();

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateYYYYMMDD(new Date()));

  // Previous & next day navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(formatDateYYYYMMDD(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(formatDateYYYYMMDD(d));
  };

  const handleToday = () => {
    setSelectedDateStr(formatDateYYYYMMDD(new Date()));
  };

  // Formatted date label
  const dateFormatted = useMemo(() => {
    const d = new Date(selectedDateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDateStr]);

  const isToday = selectedDateStr === formatDateYYYYMMDD(new Date());

  // Group investigators by shift on the selected date
  const shiftGroups = useMemo(() => {
    const groups: Record<ShiftCode, { investigator: InvestigatorProfile; schedule?: ShiftSchedule }[]> = {
      'SHIFT-1': [],
      'SHIFT-2': [],
      'SHIFT-3': [],
      'OFF': []
    };

    investigators.forEach(inv => {
      const sch = shiftSchedules.find(s => s.userId === inv.id && s.date === selectedDateStr);
      const code: ShiftCode = sch ? sch.shiftCode : 'OFF';
      groups[code].push({
        investigator: inv,
        schedule: sch
      });
    });

    return groups;
  }, [investigators, shiftSchedules, selectedDateStr]);

  return (
    <div id="daily-roster-view" className="space-y-4">
      
      {/* Date Navigator Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 transition shadow-xs"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                isToday ? 'bg-red-600 text-white' : 'hover:bg-white text-slate-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-md hover:bg-white text-slate-600 transition shadow-xs"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="text-xs font-semibold font-mono border border-slate-200 rounded-md px-2 py-1 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <span className="text-sm font-bold text-slate-800">({dateFormatted})</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenBulkModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bulk Assign</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Shift</span>
          </button>
        </div>
      </div>

      {/* 4 Shift Columns Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SHIFT_DEFINITIONS.map(def => {
          const members = shiftGroups[def.code] || [];
          const isLiveShift = isToday && activeShiftDef.code === def.code;

          return (
            <div 
              key={def.code}
              className={`bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden ${
                isLiveShift ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              {/* Header Shift Card */}
              <div className={`p-4 border-b ${
                def.code === 'SHIFT-1' ? 'bg-emerald-50/60 border-emerald-100' :
                def.code === 'SHIFT-2' ? 'bg-blue-50/60 border-blue-100' :
                def.code === 'SHIFT-3' ? 'bg-purple-50/60 border-purple-100' :
                'bg-slate-50/60 border-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{def.name}</span>
                  {isLiveShift && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                      AKTIF SEKARANG
                    </span>
                  )}
                  {def.code === 'OFF' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
                      Standby / Off
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{def.hours}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Coverage PIC:</span>
                  <span className="font-bold font-mono px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-800">
                    {members.length} Personel
                  </span>
                </div>
              </div>

              {/* Members List */}
              <div className="p-3 space-y-2.5 flex-1 divide-y divide-slate-100">
                {members.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada investigator yang ditugaskan pada shift ini.
                  </div>
                ) : (
                  members.map(({ investigator: inv, schedule }) => {
                    const duty = getInvestigatorDutyStatus(inv.id);

                    return (
                      <div key={inv.id} className="pt-2 first:pt-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${inv.avatarBg} shrink-0`}>
                              {inv.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                                <span>{inv.name}</span>
                                {isToday && duty.isOnDuty && def.code === activeShiftDef.code && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active On Duty"></span>
                                )}
                              </div>
                              <span className="inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
                                {inv.role}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (schedule) {
                                onSelectCellEdit(schedule);
                              } else {
                                onSelectCellEdit({
                                  id: `new-${inv.id}-${selectedDateStr}`,
                                  userId: inv.id,
                                  userName: inv.name,
                                  role: inv.role,
                                  date: selectedDateStr,
                                  shiftCode: def.code,
                                  shiftName: def.name,
                                  shiftHours: def.hours,
                                  status: def.code === 'OFF' ? 'Off Duty' : 'On Duty'
                                });
                              }
                            }}
                            className="text-[10px] text-slate-500 hover:text-red-600 underline font-medium"
                          >
                            Ubah
                          </button>
                        </div>

                        {/* Contact details */}
                        <div className="mt-2 ml-10 space-y-0.5 text-[11px] text-slate-500">
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">{inv.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{inv.email}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
