import React, { useState, useMemo } from 'react';
import { useFMS } from '../../context/FMSContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Info,
  Edit2
} from 'lucide-react';
import { 
  getMondayOfCurrentWeek, 
  formatDateYYYYMMDD, 
  SHIFT_DEFINITIONS 
} from '../../data/mockShiftData';
import { ShiftCode, ShiftSchedule, InvestigatorProfile } from '../../types/fms';

interface WeeklyRosterTableProps {
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onSelectCellEdit: (schedule: ShiftSchedule) => void;
}

export const WeeklyRosterTable: React.FC<WeeklyRosterTableProps> = ({
  onOpenAddModal,
  onOpenBulkModal,
  onSelectCellEdit
}) => {
  const { 
    investigators, 
    shiftSchedules, 
    activeShiftDef, 
    getInvestigatorDutyStatus, 
    updateShiftSchedule 
  } = useFMS();

  // Current selected Monday for week navigation
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfCurrentWeek());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [quickEditCell, setQuickEditCell] = useState<{ id: string; x: number; y: number } | null>(null);

  // Generate 7 days of the week from currentMonday
  const weekDays = useMemo(() => {
    const days: { date: Date; dateStr: string; dayName: string; formattedDate: string; isToday: boolean }[] = [];
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const todayStr = formatDateYYYYMMDD(new Date());

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      const dateStr = formatDateYYYYMMDD(d);
      
      const formattedDate = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      });

      days.push({
        date: d,
        dateStr,
        dayName: dayNames[i],
        formattedDate,
        isToday: dateStr === todayStr
      });
    }
    return days;
  }, [currentMonday]);

  // Week range label (e.g., "24 Agt - 30 Agt 2026")
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0].date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const end = weekDays[6].date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  }, [weekDays]);

  // Navigation handlers
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getMondayOfCurrentWeek());
  };

  // Filtered investigators
  const filteredInvestigators = useMemo(() => {
    return investigators.filter(inv => {
      const matchSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRoleFilter === 'All' || inv.role === selectedRoleFilter;
      return matchSearch && matchRole;
    });
  }, [investigators, searchQuery, selectedRoleFilter]);

  // Lookup map: `${userId}_${dateStr}` -> ShiftSchedule
  const scheduleMap = useMemo(() => {
    const map = new Map<string, ShiftSchedule>();
    shiftSchedules.forEach(s => {
      map.set(`${s.userId}_${s.date}`, s);
    });
    return map;
  }, [shiftSchedules]);

  // Daily statistics per shift code
  const dailyShiftStats = useMemo(() => {
    return weekDays.map(day => {
      let shift1Count = 0;
      let shift2Count = 0;
      let shift3Count = 0;
      let offCount = 0;

      filteredInvestigators.forEach(inv => {
        const sch = scheduleMap.get(`${inv.id}_${day.dateStr}`);
        if (sch) {
          if (sch.shiftCode === 'SHIFT-1') shift1Count++;
          else if (sch.shiftCode === 'SHIFT-2') shift2Count++;
          else if (sch.shiftCode === 'SHIFT-3') shift3Count++;
          else if (sch.shiftCode === 'OFF') offCount++;
        } else {
          offCount++;
        }
      });

      return {
        dateStr: day.dateStr,
        shift1Count,
        shift2Count,
        shift3Count,
        offCount
      };
    });
  }, [weekDays, filteredInvestigators, scheduleMap]);

  // Shift badge color helper
  const getShiftBadge = (shiftCode: ShiftCode) => {
    switch (shiftCode) {
      case 'SHIFT-1':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
          dot: 'bg-emerald-500',
          label: 'Shift 1 (Pagi)',
          sub: '07:00-15:00'
        };
      case 'SHIFT-2':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
          dot: 'bg-blue-500',
          label: 'Shift 2 (Siang)',
          sub: '15:00-23:00'
        };
      case 'SHIFT-3':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
          dot: 'bg-purple-500',
          label: 'Shift 3 (Malam)',
          sub: '23:00-07:00'
        };
      case 'OFF':
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
          dot: 'bg-slate-400',
          label: 'Libur / Off',
          sub: 'Off Duty'
        };
    }
  };

  // Role badge helper
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'L1 Maker':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'L2 Checker':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Supervisor':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'AML Analyst':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="weekly-roster-section" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Header Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Week Navigator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              id="btn-prev-week"
              onClick={handlePrevWeek}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-current-week"
              onClick={handleCurrentWeek}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
            >
              Minggu Ini
            </button>
            <button
              id="btn-next-week"
              onClick={handleNextWeek}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-800 font-mono">
              {weekRangeLabel}
            </span>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari investigator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="All">Semua Role</option>
            <option value="L1 Maker">L1 Maker</option>
            <option value="L2 Checker">L2 Checker</option>
            <option value="AML Analyst">AML Analyst</option>
            <option value="Supervisor">Supervisor</option>
          </select>

          {/* Bulk Assign Button */}
          <button
            id="btn-bulk-assign-shift"
            onClick={onOpenBulkModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bulk Assign</span>
          </button>

          {/* Add Shift Button */}
          <button
            id="btn-add-shift-schedule"
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Shift</span>
          </button>
        </div>

      </div>

      {/* Main Roster Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          
          {/* Table Head: Days */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 text-xs font-semibold">
              <th className="py-3 px-4 w-64 sticky left-0 bg-slate-100/90 backdrop-blur-xs z-10 border-r border-slate-200">
                Investigator / Role
              </th>
              {weekDays.map((day) => (
                <th 
                  key={day.dateStr} 
                  className={`py-3 px-3 text-center border-r border-slate-200 last:border-r-0 ${
                    day.isToday ? 'bg-red-50/80 text-red-900 font-bold' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] uppercase tracking-wider">{day.dayName}</span>
                    <span className="text-xs font-mono mt-0.5">{day.formattedDate}</span>
                    {day.isToday && (
                      <span className="mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-600 text-white uppercase tracking-wider">
                        Hari Ini
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body: Investigators */}
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredInvestigators.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Tidak ada investigator yang cocok dengan pencarian / filter.
                </td>
              </tr>
            ) : (
              filteredInvestigators.map((inv) => {
                const dutyStatus = getInvestigatorDutyStatus(inv.id);

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Fixed Left Column: Investigator Info */}
                    <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r border-slate-200 group-hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${inv.avatarBg} shadow-xs shrink-0`}>
                          {inv.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-900 truncate">{inv.name}</span>
                            {dutyStatus.isOnDuty ? (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                🟢 On Duty
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                🔴 Off Duty
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getRoleBadge(inv.role)}`}>
                              {inv.role}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">{inv.department}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 7 Days Shift Cells */}
                    {weekDays.map((day) => {
                      const sch = scheduleMap.get(`${inv.id}_${day.dateStr}`);
                      const shiftCode: ShiftCode = sch ? sch.shiftCode : 'OFF';
                      const badge = getShiftBadge(shiftCode);

                      return (
                        <td 
                          key={day.dateStr}
                          className={`p-2 text-center border-r border-slate-100 last:border-r-0 align-middle ${
                            day.isToday ? 'bg-red-50/20' : ''
                          }`}
                        >
                          <button
                            onClick={() => {
                              if (sch) {
                                onSelectCellEdit(sch);
                              } else {
                                onSelectCellEdit({
                                  id: `new-${inv.id}-${day.dateStr}`,
                                  userId: inv.id,
                                  userName: inv.name,
                                  role: inv.role,
                                  date: day.dateStr,
                                  shiftCode: 'SHIFT-1',
                                  shiftName: 'Shift 1 (Pagi)',
                                  shiftHours: '07:00 - 15:00 WIB',
                                  status: 'On Duty'
                                });
                              }
                            }}
                            className={`w-full group/btn relative py-1.5 px-2 rounded-lg border text-left transition flex flex-col justify-center items-center ${badge.bg}`}
                            title={`Klik untuk edit shift ${inv.name} pada ${day.dayName}, ${day.formattedDate}`}
                          >
                            <div className="flex items-center space-x-1.5">
                              <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                              <span className="font-semibold text-xs leading-none">{badge.label}</span>
                            </div>
                            <span className="text-[10px] opacity-75 font-mono mt-0.5">{badge.sub}</span>
                            
                            {/* Hover Edit Hint */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover/btn:opacity-100 transition text-slate-400">
                              <Edit2 className="w-2.5 h-2.5" />
                            </div>
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer: Daily Shift Summary Counts */}
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs font-semibold text-slate-600">
              <td className="py-3 px-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Total Coverage PIC / Shift</span>
                </div>
              </td>
              {dailyShiftStats.map((stat, idx) => (
                <td key={stat.dateStr} className="p-2 border-r border-slate-200 last:border-r-0 text-center">
                  <div className="flex flex-col items-center gap-1 font-mono text-[10px]">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200" title="Shift 1 Pagi">
                      S1: {stat.shift1Count}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200" title="Shift 2 Siang">
                      S2: {stat.shift2Count}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200" title="Shift 3 Malam">
                      S3: {stat.shift3Count}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>

        </table>
      </div>

      {/* Legend & Help Footer */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700">Keterangan Shift:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Shift 1 (Pagi 07:00 - 15:00)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Shift 2 (Siang 15:00 - 23:00)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Shift 3 (Malam 23:00 - 07:00)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Libur / Off</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Klik cell shift untuk mengubah plotting jadwal secara instan</span>
        </div>
      </div>

    </div>
  );
};
