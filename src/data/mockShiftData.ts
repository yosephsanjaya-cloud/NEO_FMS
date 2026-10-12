import { InvestigatorProfile, ShiftDefinition, ShiftSchedule, ShiftHandover } from '../types/fms';

export const SHIFT_DEFINITIONS: ShiftDefinition[] = [
  {
    code: 'SHIFT-1',
    name: 'Shift 1 (Pagi)',
    hours: '07:00 - 15:00 WIB',
    startTime: '07:00',
    endTime: '15:00',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    badgeText: 'Shift 1 (07:00-15:00)'
  },
  {
    code: 'SHIFT-2',
    name: 'Shift 2 (Siang)',
    hours: '15:00 - 23:00 WIB',
    startTime: '15:00',
    endTime: '23:00',
    color: 'blue',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeText: 'Shift 2 (15:00-23:00)'
  },
  {
    code: 'SHIFT-3',
    name: 'Shift 3 (Malam)',
    hours: '23:00 - 07:00 WIB',
    startTime: '23:00',
    endTime: '07:00',
    color: 'purple',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-800',
    badgeText: 'Shift 3 (23:00-07:00)'
  },
  {
    code: 'OFF',
    name: 'Libur / Off',
    hours: 'Off Duty',
    startTime: '-',
    endTime: '-',
    color: 'slate',
    badgeBg: 'bg-slate-100 border-slate-200 text-slate-600',
    badgeText: 'Libur / Off'
  }
];

export const INITIAL_INVESTIGATORS: InvestigatorProfile[] = [
  {
    id: 'usr-001',
    name: 'Budi Santoso',
    role: 'L1 Maker',
    email: 'budi.santoso@banksampoerna.com',
    phone: '0812-8921-3310',
    avatarBg: 'bg-blue-600 text-white',
    department: 'Fraud Surveillance & Monitoring',
    activeOnDuty: true
  },
  {
    id: 'usr-002',
    name: 'Rian Pratama',
    role: 'L1 Maker',
    email: 'rian.pratama@banksampoerna.com',
    phone: '0813-1123-9901',
    avatarBg: 'bg-cyan-600 text-white',
    department: 'Fraud Surveillance & Monitoring',
    activeOnDuty: true
  },
  {
    id: 'usr-003',
    name: 'Dewi Lestari',
    role: 'L2 Checker',
    email: 'dewi.lestari@banksampoerna.com',
    phone: '0811-9002-4451',
    avatarBg: 'bg-amber-600 text-white',
    department: 'Fraud Risk Assessment',
    activeOnDuty: true
  },
  {
    id: 'usr-004',
    name: 'Agus Setiawan',
    role: 'L2 Checker',
    email: 'agus.setiawan@banksampoerna.com',
    phone: '0815-7761-0022',
    avatarBg: 'bg-indigo-600 text-white',
    department: 'Fraud Investigation & Case Mgmt',
    activeOnDuty: false
  },
  {
    id: 'usr-005',
    name: 'Siti Rahmawati',
    role: 'AML Analyst',
    email: 'siti.rahmawati@banksampoerna.com',
    phone: '0812-4455-8812',
    avatarBg: 'bg-rose-600 text-white',
    department: 'AML / CFT Compliance Unit',
    activeOnDuty: true
  },
  {
    id: 'usr-006',
    name: 'Farhan Nugraha',
    role: 'AML Analyst',
    email: 'farhan.nugraha@banksampoerna.com',
    phone: '0819-3301-4490',
    avatarBg: 'bg-emerald-600 text-white',
    department: 'AML / CFT Compliance Unit',
    activeOnDuty: false
  },
  {
    id: 'usr-007',
    name: 'Maya Indah',
    role: 'Supervisor',
    email: 'maya.indah@banksampoerna.com',
    phone: '0811-2299-7733',
    avatarBg: 'bg-purple-600 text-white',
    department: 'Fraud Operations Command Center',
    activeOnDuty: true
  }
];

// Helper to generate dynamic dates around today for weekly view
export const getMondayOfCurrentWeek = (d = new Date()): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const formatDateYYYYMMDD = (d: Date): string => {
  return d.toISOString().slice(0, 10);
};

// Generate 4-week rotating schedule base
export const generateInitialShiftSchedules = (): ShiftSchedule[] => {
  const monday = getMondayOfCurrentWeek();
  const schedules: ShiftSchedule[] = [];

  // Patterns for rotation across 7 investigators
  const shiftPatterns: Record<string, string[]> = {
    'usr-001': ['SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'OFF', 'OFF'], // Budi (Pagi Weekdays)
    'usr-002': ['SHIFT-2', 'SHIFT-2', 'SHIFT-2', 'SHIFT-2', 'SHIFT-2', 'OFF', 'OFF'], // Rian (Siang Weekdays)
    'usr-003': ['SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'OFF', 'OFF'], // Dewi (Checker Pagi)
    'usr-004': ['SHIFT-2', 'SHIFT-2', 'SHIFT-2', 'SHIFT-2', 'SHIFT-2', 'OFF', 'OFF'], // Agus (Checker Siang)
    'usr-005': ['SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'OFF', 'OFF'], // Siti (AML Pagi)
    'usr-006': ['SHIFT-3', 'SHIFT-3', 'SHIFT-3', 'SHIFT-3', 'OFF', 'SHIFT-1', 'SHIFT-1'], // Farhan (AML Weekend/Malam)
    'usr-007': ['SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'OFF', 'OFF'], // Maya (Supervisor)
  };

  // Generate 4 weeks (1 previous, current, 2 ahead)
  for (let weekOffset = -1; weekOffset <= 2; weekOffset++) {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + (weekOffset * 7) + dayIdx);
      const dateStr = formatDateYYYYMMDD(targetDate);

      INITIAL_INVESTIGATORS.forEach((inv) => {
        const pattern = shiftPatterns[inv.id] || ['SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'SHIFT-1', 'OFF', 'OFF'];
        // Offset pattern slightly per week for rotation feel
        const rotatedPatternIndex = (dayIdx + (weekOffset * 2)) % 7;
        const finalPatternIndex = rotatedPatternIndex < 0 ? rotatedPatternIndex + 7 : rotatedPatternIndex;
        const shiftCode = (pattern[finalPatternIndex] || 'SHIFT-1') as 'SHIFT-1' | 'SHIFT-2' | 'SHIFT-3' | 'OFF';

        const shiftDef = SHIFT_DEFINITIONS.find(s => s.code === shiftCode) || SHIFT_DEFINITIONS[0];

        schedules.push({
          id: `sch-${inv.id}-${dateStr}`,
          userId: inv.id,
          userName: inv.name,
          role: inv.role,
          date: dateStr,
          shiftCode: shiftCode,
          shiftName: shiftDef.name,
          shiftHours: shiftDef.hours,
          status: shiftCode === 'OFF' ? 'Off Duty' : 'On Duty',
          notes: shiftCode === 'OFF' ? 'Weekly Off Day' : undefined
        });
      });
    }
  }

  return schedules;
};

export const INITIAL_HANDOVERS: ShiftHandover[] = [
  {
    id: 'ho-20260826-001',
    handoverNo: 'HO-20260826-001',
    timestamp: '2026-08-26 07:05:12',
    offloadingUserId: 'usr-006',
    offloadingUserName: 'Farhan Nugraha',
    offloadingRole: 'AML Analyst',
    receivingUserId: 'usr-001',
    receivingUserName: 'Budi Santoso',
    receivingRole: 'L1 Maker',
    shiftFrom: 'Shift 3 (Malam | 23:00 - 07:00)',
    shiftTo: 'Shift 1 (Pagi | 07:00 - 15:00)',
    caseIds: ['FRD-20260826-8901', 'FRD-20260826-9042', 'AML-CIF-904812'],
    criticalCaseCount: 3,
    notes: 'Handover shift malam: Ada 3 kasus alert high velocity QRIS payment & transfer agregasi CIF tinggi. Nasabah sudah di-soft block dan butuh konfirmasi via branch/call center jam 08:30 WIB.',
    status: 'Acknowledged',
    acknowledgedAt: '2026-08-26 07:12:00',
    acknowledgedBy: 'Budi Santoso'
  },
  {
    id: 'ho-20260825-002',
    handoverNo: 'HO-20260825-002',
    timestamp: '2026-08-25 15:02:44',
    offloadingUserId: 'usr-001',
    offloadingUserName: 'Budi Santoso',
    offloadingRole: 'L1 Maker',
    receivingUserId: 'usr-002',
    receivingUserName: 'Rian Pratama',
    receivingRole: 'L1 Maker',
    shiftFrom: 'Shift 1 (Pagi | 07:00 - 15:00)',
    shiftTo: 'Shift 2 (Siang | 15:00 - 23:00)',
    caseIds: ['FRD-20260825-4412'],
    criticalCaseCount: 1,
    notes: 'Case SIM Swap takeover sedang menunggu surat balasan konfirmasi dari pihak Telko. Tolong monitor jika ada mutasi keluar lebih dari IDR 20jt.',
    status: 'Acknowledged',
    acknowledgedAt: '2026-08-25 15:10:20',
    acknowledgedBy: 'Rian Pratama'
  },
  {
    id: 'ho-20260826-003',
    handoverNo: 'HO-20260826-003',
    timestamp: '2026-08-26 14:55:00',
    offloadingUserId: 'usr-001',
    offloadingUserName: 'Budi Santoso',
    offloadingRole: 'L1 Maker',
    receivingUserId: 'usr-002',
    receivingUserName: 'Rian Pratama',
    receivingRole: 'L1 Maker',
    shiftFrom: 'Shift 1 (Pagi | 07:00 - 15:00)',
    shiftTo: 'Shift 2 (Siang | 15:00 - 23:00)',
    caseIds: ['FRD-20260826-8901', 'AML-CIF-904812'],
    criticalCaseCount: 2,
    notes: '2 Pending Cases: Eskalasi Bareskrim & CIF AML agregasi masih menunggu approval L2 Dewi Lestari. Perlu segera di-follow up jika ada transaksi baru yang trigger blacklist.',
    status: 'Pending'
  }
];
