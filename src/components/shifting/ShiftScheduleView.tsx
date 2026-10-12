import React, { useState } from 'react';
import { useFMS } from '../../context/FMSContext';
import { ShiftHeaderCards } from './ShiftHeaderCards';
import { WeeklyRosterTable } from './WeeklyRosterTable';
import { DailyRosterView } from './DailyRosterView';
import { MonthlyRosterView } from './MonthlyRosterView';
import { ShiftHandoverView } from './ShiftHandoverView';
import { AddEditShiftModal } from './AddEditShiftModal';
import { BulkAssignShiftModal } from './BulkAssignShiftModal';
import { CreateHandoverModal } from './CreateHandoverModal';
import { ShiftSchedule } from '../../types/fms';
import { 
  CalendarClock, 
  CalendarDays,
  Calendar,
  Clock, 
  ArrowRightLeft, 
  Layers, 
  Plus, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const ShiftScheduleView: React.FC = () => {
  const { shiftHandovers } = useFMS();

  const [activeSubTab, setActiveSubTab] = useState<'weekly' | 'daily' | 'monthly' | 'handover'>('weekly');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCreateHandoverModalOpen, setIsCreateHandoverModalOpen] = useState(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<ShiftSchedule | null>(null);

  const pendingHandoverCount = shiftHandovers.filter(h => h.status === 'Pending').length;

  const handleOpenAddModal = () => {
    setSelectedScheduleForEdit(null);
    setIsAddModalOpen(true);
  };

  const handleSelectCellEdit = (schedule: ShiftSchedule) => {
    setSelectedScheduleForEdit(schedule);
    setIsAddModalOpen(true);
  };

  return (
    <div id="shift-schedule-view" className="space-y-6 pb-12">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Jadwal Shifting & Duty Roster</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold font-mono">
                  24/7 Command Center
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan jadwal tugas investigator FMS, rotasi shifting 3-shift (Pagi, Siang, Malam), dan log serah terima kasus eskalasi.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-quick-handover"
            onClick={() => setIsCreateHandoverModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg shadow-xs transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
            <span>Serah Terima Shift</span>
          </button>

          <button
            id="btn-quick-bulk-assign"
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Bulk Plotting</span>
          </button>

          <button
            id="btn-quick-add-shift"
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Shift</span>
          </button>
        </div>
      </div>

      {/* 4 Header Summary Cards */}
      <ShiftHeaderCards />

      {/* Sub Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          id="tab-monthly-roster"
          onClick={() => setActiveSubTab('monthly')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'monthly'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tampilan Bulanan (Monthly)</span>
        </button>

        <button
          id="tab-weekly-roster"
          onClick={() => setActiveSubTab('weekly')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'weekly'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Tampilan Mingguan (Weekly Roster)</span>
        </button>

        <button
          id="tab-daily-roster"
          onClick={() => setActiveSubTab('daily')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'daily'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Jadwal Harian (Daily Timeline)</span>
        </button>

        <button
          id="tab-shift-handover"
          onClick={() => setActiveSubTab('handover')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeSubTab === 'handover'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Shift Handover Log</span>
          {pendingHandoverCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeSubTab === 'handover' 
                ? 'bg-white text-red-700' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {pendingHandoverCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div>
        {activeSubTab === 'monthly' && (
          <MonthlyRosterView
            onOpenAddModal={handleOpenAddModal}
            onOpenBulkModal={() => setIsBulkModalOpen(true)}
            onSelectCellEdit={handleSelectCellEdit}
          />
        )}

        {activeSubTab === 'weekly' && (
          <WeeklyRosterTable
            onOpenAddModal={handleOpenAddModal}
            onOpenBulkModal={() => setIsBulkModalOpen(true)}
            onSelectCellEdit={handleSelectCellEdit}
          />
        )}

        {activeSubTab === 'daily' && (
          <DailyRosterView
            onOpenAddModal={handleOpenAddModal}
            onOpenBulkModal={() => setIsBulkModalOpen(true)}
            onSelectCellEdit={handleSelectCellEdit}
          />
        )}

        {activeSubTab === 'handover' && (
          <ShiftHandoverView
            onOpenCreateModal={() => setIsCreateHandoverModalOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <AddEditShiftModal
        isOpen={isAddModalOpen}
        initialSchedule={selectedScheduleForEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedScheduleForEdit(null);
        }}
      />

      <BulkAssignShiftModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      <CreateHandoverModal
        isOpen={isCreateHandoverModalOpen}
        onClose={() => setIsCreateHandoverModalOpen(false)}
      />

    </div>
  );
};
