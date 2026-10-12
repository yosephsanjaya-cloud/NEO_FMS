// Type definitions for Parent Menu "Process" (EOD Engine & Manual Execution)

export type TaskDetailType = 'Store Procedure' | 'SSIS File';

export interface ProcessTaskDetail {
  id: string;
  orderNo: number;
  taskDetailType: TaskDetailType;
  spOrSsisFileName: string;
  useParameter: boolean;
  parameterDetails?: string;
  description: string;
}

export interface ProcessTask {
  id: string; // e.g. TSK-001
  taskName: string;
  taskDescription: string;
  isActive: boolean;
  details: ProcessTaskDetail[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type PeriodType = 'Days' | 'Weeks' | 'Months' | 'Hours';

export interface ProcessSequenceTask {
  id: string;
  orderNo: number;
  taskId: string;
  taskName: string;
  taskDetailCount?: number;
}

export interface ProcessItem {
  id: string; // e.g. PRC-EOD-001
  processName: string;
  description: string;
  hasPeriodicalScheduler: boolean;
  schedulerPeriod?: number;
  periodType?: PeriodType;
  startDate?: string;
  executionTime?: string;
  nextSchedule?: string;
  isActive: boolean;
  sequenceTasks: ProcessSequenceTask[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type ExecutionStatus = 'Running' | 'Success' | 'Failed' | 'Cancelled';

export interface ExecutionLogDetailStep {
  stepNo: number;
  stepName: string;
  stepType: 'Store Procedure' | 'SSIS File' | 'Initialization' | 'Verification';
  status: 'Pending' | 'In Progress' | 'Success' | 'Failed';
  duration?: string;
  outputLog?: string;
  rowsAffected?: number;
}

export interface ProcessExecutionLog {
  id: string; // e.g. EXE-20260904-001
  type: 'Process' | 'Task';
  targetId: string;
  name: string;
  triggeredBy: string;
  triggerMode: 'Manual' | 'Scheduled';
  executionDate: string;
  startTime: string;
  endTime?: string;
  duration: string;
  status: ExecutionStatus;
  remarks?: string;
  totalSteps: number;
  completedSteps: number;
  steps: ExecutionLogDetailStep[];
  logs: string[];
  stackTrace?: string;
  databaseTarget?: string;
}
