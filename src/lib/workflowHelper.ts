import { FraudCase } from '../types/fms';

export interface WorkflowMilestone {
  stepNumber: number;
  key: 'identified' | 'opened' | 'pic' | 'worked_and_submitted' | 'approval_requested' | 'approved';
  title: string;
  subtitle: string;
  timestamp: string | null;
  actor: string;
  status: 'completed' | 'in_progress' | 'pending' | 'waiting_approval';
  statusLabel: string;
  details?: string;
  notes?: string;
}

export interface RuleTemplateInfo {
  code: string;
  name: string;
  category: string;
  description: string;
}

export const getRuleTemplateInfo = (templateCode?: string): RuleTemplateInfo => {
  const code = templateCode || 'TPL-AMT-02';
  
  const templateMap: Record<string, RuleTemplateInfo> = {
    'TPL-AMT-02': {
      code: 'TPL-AMT-02',
      name: 'Single High Value Outlier Transaction',
      category: 'Amount & Outlier Limit',
      description: 'Mendeteksi transaksi tunggal bernilai ekstrem yang menyimpang tajam dari histori rata-rata profil nasabah.'
    },
    'TPL-VEL-01': {
      code: 'TPL-VEL-01',
      name: 'High Frequency Velocity Limit',
      category: 'Velocity & Frequency',
      description: 'Mendeteksi lonjakan frekuensi transaksi transfer keluar dalam jendela waktu pendek dari 1 akun/perangkat.'
    },
    'TPL-DEV-03': {
      code: 'TPL-DEV-03',
      name: 'New Device Instant High Value Outward',
      category: 'Device & Identity Risk',
      description: 'Mendeteksi login perangkat baru yang langsung mengeksekusi transfer bernilai besar dalam waktu singkat (indikasi Account Takeover).'
    },
    'TPL-GEO-04': {
      code: 'TPL-GEO-04',
      name: 'Impossible Geo-Velocity & Proxy Bypass',
      category: 'Geolocation & Network Anomaly',
      description: 'Mendeteksi lompatan lokasi geografis tidak wajar atau penggunaan VPN/Proxy server yang disamarkan.'
    },
    'TPL-QRIS-05': {
      code: 'TPL-QRIS-05',
      name: 'QRIS Micro Merchant Velocity Burst',
      category: 'Merchant & Channel Velocity',
      description: 'Mendeteksi pembayaran QRIS beruntun ke merchant tertentu dalam rentang waktu beberapa menit.'
    },
    'TPL-AML-SMURF-01': {
      code: 'TPL-AML-SMURF-01',
      name: 'Structured Smurfing & Layering Detection',
      category: 'AML & Transaction Structuring',
      description: 'Mendeteksi pemecahan nominal transaksi di bawah ambang batas pelaporan tunai/transfer (Structuring / Smurfing).'
    },
    'TPL-AML-HIGH-FREQ-02': {
      code: 'TPL-AML-HIGH-FREQ-02',
      name: 'Rapid Pass-through Velocity (Layering)',
      category: 'AML Fund Routing',
      description: 'Mendeteksi aliran dana masuk yang segera dipindahbukukan keluar secara instan ke berbagai rekening pihak ketiga.'
    }
  };

  if (templateMap[code]) {
    return templateMap[code];
  }

  return {
    code: code,
    name: `Rule Template ${code}`,
    category: 'Transaction Monitoring Template',
    description: 'Template aturan standar sistem Neo FMS Bank Sampoerna.'
  };
};

export const getCaseWorkflowMilestones = (c: FraudCase): WorkflowMilestone[] => {
  const isPendingApproval = c.alertStatus === 'Pending Approval';
  const isClosed = c.alertStatus === 'Close';
  const isDraft = c.alertStatus === 'Draft';
  const isOpen = c.alertStatus === 'Open';

  // Find timestamps from timeline if available
  let identifiedTime = c.identifiedOn || '2026-08-25 10:00:00';
  let openedTime = '';
  let submittedTime = '';
  let approvalReqTime = '';
  let approvedTime = c.approvedAt || '';
  let approver = c.approvedBy || '';

  if (c.timeline && c.timeline.length > 0) {
    const identLog = c.timeline.find(t => t.action.toLowerCase().includes('alert') || t.action.toLowerCase().includes('generated'));
    if (identLog) identifiedTime = identLog.time;

    const openLog = c.timeline.find(t => t.action.toLowerCase().includes('opened') || t.action.toLowerCase().includes('view'));
    if (openLog) openedTime = openLog.time;

    const subLog = c.timeline.find(t => t.action.toLowerCase().includes('submit') || t.action.toLowerCase().includes('draft') || t.action.toLowerCase().includes('follow up'));
    if (subLog) {
      submittedTime = subLog.time;
      if (tLogIsApproval(subLog.action)) {
        approvalReqTime = subLog.time;
      }
    }

    const appLog = c.timeline.find(t => t.action.toLowerCase().includes('approved') || t.action.toLowerCase().includes('close'));
    if (appLog) {
      approvedTime = appLog.time;
      approver = appLog.user;
    }
  }

  // Calculate fallbacks based on identifiedOn if missing
  if (!openedTime) {
    const identDate = new Date(identifiedTime);
    if (!isNaN(identDate.getTime())) {
      const openDate = new Date(identDate.getTime() + 3 * 60 * 1000);
      openedTime = openDate.toISOString().replace('T', ' ').slice(0, 19);
    } else {
      openedTime = identifiedTime;
    }
  }

  if ((isPendingApproval || isClosed) && !submittedTime) {
    const opDate = new Date(openedTime);
    if (!isNaN(opDate.getTime())) {
      const subDate = new Date(opDate.getTime() + 12 * 60 * 1000);
      submittedTime = subDate.toISOString().replace('T', ' ').slice(0, 19);
      approvalReqTime = submittedTime;
    } else {
      submittedTime = openedTime;
      approvalReqTime = openedTime;
    }
  }

  if (isClosed && !approvedTime) {
    const subDate = new Date(submittedTime || openedTime);
    if (!isNaN(subDate.getTime())) {
      const appDate = new Date(subDate.getTime() + 18 * 60 * 1000);
      approvedTime = appDate.toISOString().replace('T', ' ').slice(0, 19);
    } else {
      approvedTime = submittedTime || openedTime;
    }
  }

  if (isClosed && !approver) {
    approver = 'Hendra Gunawan (Supervisor FMS)';
  }

  const picName = c.reviewer || c.assignee || 'Sysadmin - sysadmin';

  return [
    {
      stepNumber: 1,
      key: 'identified',
      title: '1. Identified (Teridentifikasi Sistem)',
      subtitle: 'Alert otomatis dihasilkan oleh FMS Engine saat anomali transaksi terdeteksi',
      timestamp: identifiedTime,
      actor: 'Neo FMS Real-time Engine',
      status: 'completed',
      statusLabel: 'TERDETEKSI',
      details: `Rule: ${c.ruleBasicCode} (${c.ruleName}) • Template: ${c.ruleTemplateCode}`
    },
    {
      stepNumber: 2,
      key: 'opened',
      title: '2. Dibuka di Case Management',
      subtitle: 'Kasus dialokasikan ke antrian kerja dan pertama kali dibuka oleh analis',
      timestamp: openedTime,
      actor: c.assignee || 'Analis FMS',
      status: 'completed',
      statusLabel: 'DIBUKA / ANTRIAN',
      details: `Dialokasikan ke PIC Analis: ${c.assignee} (Status: ${c.investigationStatus})`
    },
    {
      stepNumber: 3,
      key: 'pic',
      title: '3. PIC / Analis yang Menangani',
      subtitle: 'Person In Charge yang bertanggung jawab atas investigasi data & profiling nasabah',
      timestamp: openedTime,
      actor: picName,
      status: isClosed || isPendingApproval ? 'completed' : isDraft ? 'in_progress' : 'in_progress',
      statusLabel: isClosed ? 'INVESTIGASI SELESAI' : isPendingApproval ? 'MENUNGGU APPROVAL' : 'SEDANG DIINVESTIGASI',
      details: `PIC: ${picName} • Unit: Fraud Monitoring & Investigation Team`
    },
    {
      stepNumber: 4,
      key: 'worked_and_submitted',
      title: '4. Dikerjakan & Disubmit (Hasil Follow Up)',
      subtitle: 'Pengisian form tindak lanjut, verifikasi nasabah, keputusan review, dan bukti pendukung',
      timestamp: isClosed || isPendingApproval ? submittedTime : isDraft ? '(Tersimpan Draft)' : null,
      actor: picName,
      status: isClosed || isPendingApproval ? 'completed' : isDraft ? 'in_progress' : 'pending',
      statusLabel: isClosed || isPendingApproval ? 'SUDAH DISUBMIT' : isDraft ? 'DRAFT TERSIMPAN' : 'BELUM DISUBMIT',
      details: isClosed || isPendingApproval
        ? `Reviewer Result: ${c.reviewerResult || 'NONE'} | Final Result: ${c.finalResult || 'NONE'} | Closing Action: ${c.closingAction || 'NONE'}`
        : isDraft
        ? `Draft tersimpan dengan catatan: ${c.reviewerComment ? c.reviewerComment.slice(0, 60) + '...' : 'Dalam pengerjaan'}`
        : 'Analis belum melakukan submit form follow up (status kasus masih OPEN).'
    },
    {
      stepNumber: 5,
      key: 'approval_requested',
      title: '5. Minta Approval (Pengajuan ke Supervisor)',
      subtitle: 'Pengajuan persetujuan penutupan/eskalasi kasus kepada Supervisor / Manager FMS',
      timestamp: isClosed || isPendingApproval ? (approvalReqTime || submittedTime) : null,
      actor: `${picName} → Supervisor FMS`,
      status: isClosed ? 'completed' : isPendingApproval ? 'waiting_approval' : 'pending',
      statusLabel: isClosed ? 'SELESAI DIAJUKAN' : isPendingApproval ? 'MENUNGGU PERSETUJUAN' : 'BELUM MENGAJUKAN',
      details: isClosed
        ? 'Pengajuan approval telah diproses dan disetujui.'
        : isPendingApproval
        ? 'Hasil follow up telah diajukan ke Supervisor. Perlu 1x lagi Approve oleh Supervisor untuk menutup case ini.'
        : 'Kasus belum diajukan untuk approval (masih dalam investigasi analis).'
    },
    {
      stepNumber: 6,
      key: 'approved',
      title: '6. Diapprove & Ditutup (Approval & Close)',
      subtitle: 'Persetujuan akhir oleh Supervisor / Manager untuk menutup kasus secara resmi',
      timestamp: isClosed ? approvedTime : null,
      actor: isClosed ? (approver || 'Hendra Gunawan (Supervisor FMS)') : 'Supervisor / Manager FMS',
      status: isClosed ? 'completed' : isPendingApproval ? 'waiting_approval' : 'pending',
      statusLabel: isClosed ? 'DISETUJUI & KASUS DITUTUP (CLOSE)' : isPendingApproval ? 'MENUNGGU APPROVER' : 'BELUM APPROVAL',
      details: isClosed
        ? `Disetujui oleh ${approver || 'Supervisor FMS'}. ${c.approverNotes ? `Catatan: "${c.approverNotes}"` : 'Penyelesaian kasus resmi disetujui.'}`
        : isPendingApproval
        ? 'Menunggu aksi persetujuan dari Supervisor FMS di sistem.'
        : 'Kasus belum mencapai tahap persetujuan akhir.'
    }
  ];
};

function tLogIsApproval(actionText: string): boolean {
  const text = actionText.toLowerCase();
  return text.includes('approval') || text.includes('submit') || text.includes('diajukan');
}
