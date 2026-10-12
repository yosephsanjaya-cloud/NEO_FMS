import React, { useState } from 'react';
import { useFMS } from '../../context/FMSContext';
import { ShiftSchedule, ShiftCode } from '../../types/fms';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  Users,
  Clock,
  Filter
} from 'lucide-react';

interface MonthlyRosterViewProps {
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onSelectCellEdit: (schedule: ShiftSchedule) => void;
}

export const MonthlyRosterView: React.FC<MonthlyRosterViewProps> = ({
  onOpenAddModal,
  onSelectCellEdit
}) => {
  const { shiftSchedules, investigators, shiftDefinitions } = useFMS();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  // Adjust to start from Monday (0: Mon, 6: Sun)
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonthDays = new Date(year, month, 0).getDate();
  
  const calendarDays: { date: string; isCurrentMonth: boolean; day: number }[] = [];

  // Previous month overflow
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    calendarDays.push({
      date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
      day: d
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isCurrentMonth: true,
      day: i
    });
  }

  // Next month overflow to fill 42 cells (6 rows * 7 days)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    calendarDays.push({
      date: `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isCurrentMonth: false,
      day: i
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getSchedulesForDate = (dateStr: string) => {
    return shiftSchedules.filter(s => s.date === dateStr);
  };

  const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const getShiftBadgeStyle = (code: ShiftCode) => {
    const def = shiftDefinitions.find(d => d.code === code);
    return {
      bg: def?.badgeBg || 'bg-slate-100',
      text: def?.badgeText || 'text-slate-700',
      border: `border-${def?.color}-200` || 'border-slate-200'
    };
  };

  return (
    <div id="monthly-roster-view" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-bold text-slate-900 min-w-[200px]">
            {monthNames[month]} {year}
          </h2>
          <button 
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition"
          >
            Hari Ini
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 mr-2">
             <div className="flex items-center space-x-1 px-2 py-1 text-[10px] border-r border-slate-100">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               <span className="text-slate-500">Pagi</span>
             </div>
             <div className="flex items-center space-x-1 px-2 py-1 text-[10px] border-r border-slate-100">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <span className="text-slate-500">Siang</span>
             </div>
             <div className="flex items-center space-x-1 px-2 py-1 text-[10px]">
               <div className="w-2 h-2 rounded-full bg-purple-500"></div>
               <span className="text-slate-500">Malam</span>
             </div>
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-700 transition">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Plotting</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {dayLabels.map((label, idx) => (
          <div key={idx} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 last:border-r-0 bg-slate-50">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px] md:auto-rows-[160px]">
        {calendarDays.map((dayObj, idx) => {
          const dateSchedules = getSchedulesForDate(dayObj.date);
          const isToday = dayObj.date === new Date().toISOString().split('T')[0];
          
          return (
            <div 
              key={idx} 
              className={`border-r border-b border-slate-200 last:border-r-0 relative group ${
                !dayObj.isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'
              } ${isToday ? 'ring-1 ring-inset ring-red-500/20' : ''}`}
            >
              <div className="p-2 flex justify-between items-start">
                <span className={`text-sm font-semibold ${
                  !dayObj.isCurrentMonth ? 'text-slate-300' : 
                  isToday ? 'w-6 h-6 flex items-center justify-center bg-red-600 text-white rounded-full' : 'text-slate-600'
                }`}>
                  {dayObj.day}
                </span>
                
                {dayObj.isCurrentMonth && (
                  <button 
                    onClick={onOpenAddModal}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="px-1 space-y-1.5 overflow-y-auto max-h-[90px] md:max-h-[120px] scrollbar-hide">
                {dateSchedules.length > 0 ? (
                  ['SHIFT-1', 'SHIFT-2', 'SHIFT-3', 'OFF'].map(shiftCode => {
                    const shifts = dateSchedules.filter(s => s.shiftCode === shiftCode);
                    if (shifts.length === 0) return null;
                    
                    const style = getShiftBadgeStyle(shiftCode as ShiftCode);
                    const shiftLabel = shiftCode === 'SHIFT-1' ? 'Pagi' : 
                                     shiftCode === 'SHIFT-2' ? 'Siang' : 
                                     shiftCode === 'SHIFT-3' ? 'Malam' : 'Off';

                    if (shiftCode === 'OFF' && shifts.length > 0) {
                       // Optional: compact view for Off
                    }

                    return (
                      <div key={shiftCode} className="space-y-0.5">
                        <div className="flex items-center space-x-1 px-1">
                          <div className={`w-1 h-1 rounded-full ${style.text.includes('emerald') ? 'bg-emerald-500' : style.text.includes('blue') ? 'bg-blue-500' : style.text.includes('purple') ? 'bg-purple-500' : 'bg-slate-400'}`}></div>
                          <span className={`text-[8px] font-bold uppercase tracking-tighter ${style.text} opacity-80`}>
                            {shiftLabel}
                          </span>
                        </div>
                        {shifts.map(schedule => (
                          <div 
                            key={schedule.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCellEdit(schedule);
                            }}
                            className={`px-1.5 py-0.5 rounded border text-[9px] cursor-pointer transition flex items-center justify-between ${style.bg} ${style.text} border-transparent hover:border-slate-300 shadow-xs`}
                          >
                            <span className="truncate font-medium">{schedule.userName}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })
                ) : dayObj.isCurrentMonth && (
                  <div className="h-full flex flex-col items-center justify-center pt-2 opacity-0 group-hover:opacity-100">
                    <p className="text-[10px] text-slate-300 italic">No Shift</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Footer / Summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-600 font-medium">Total Investigator: {investigators.length}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-600 font-medium">Siklus 24/7 Terpenuhi</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 italic">
          * Klik pada nama investigator untuk mengubah jadwal
        </div>
      </div>
    </div>
  );
};
