import React from 'react';
import { Clock } from 'lucide-react';
import { FraudCase } from '../../types/fms';
import { getCaseWorkflowMilestones } from '../../lib/workflowHelper';

interface Props {
  fraudCase: FraudCase;
  compact?: boolean;
}

export const CaseWorkflowMilestonesView: React.FC<Props> = ({ fraudCase }) => {
  const milestones = getCaseWorkflowMilestones(fraudCase);

  return (
    <div className="font-sans">
      {/* Compact Visual Workflow Stepper Bar (Lifecycle Header Only) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-3 sm:p-4 text-white shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-xs">
          <span className="font-bold flex items-center gap-1.5 text-amber-300">
            <Clock className="w-4 h-4" />
            <span>Workflow Lifecycle &amp; Catatan Pengerjaan Kasus</span>
          </span>
          <span className="font-mono text-[11px] text-slate-300">
            Status Kasus: <strong className="text-white font-sans">{fraudCase.alertStatus.toUpperCase()}</strong>
          </span>
        </div>

        {/* 6-Step Horizontal Progress Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3">
          {milestones.map((m) => {
            const isDone = m.status === 'completed';
            const isWaiting = m.status === 'waiting_approval';
            const isInProg = m.status === 'in_progress';

            return (
              <div 
                key={m.key}
                className={`p-2.5 rounded-lg border transition text-left flex flex-col justify-between ${
                  isDone 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-100'
                    : isWaiting
                    ? 'bg-amber-950/40 border-amber-500/60 text-slate-100 ring-1 ring-amber-500/50'
                    : isInProg
                    ? 'bg-blue-950/40 border-blue-500/50 text-slate-100'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="font-mono opacity-80">STEP 0{m.stepNumber}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      isDone ? 'bg-emerald-400' : isWaiting ? 'bg-amber-400 animate-ping' : isInProg ? 'bg-blue-400' : 'bg-slate-600'
                    }`} />
                  </div>
                  <div className="font-bold text-[11px] mt-1 text-white leading-tight">
                    {m.key === 'identified' && 'Identified'}
                    {m.key === 'opened' && 'Opened in CM'}
                    {m.key === 'pic' && 'PIC Assignment'}
                    {m.key === 'worked_and_submitted' && 'Follow Up Submit'}
                    {m.key === 'approval_requested' && 'Minta Approval'}
                    {m.key === 'approved' && 'Approved & Close'}
                  </div>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-700/60">
                  <div className="text-[10px] font-mono text-amber-300 font-semibold truncate">
                    {m.timestamp || '-'}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">
                    {m.actor}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

