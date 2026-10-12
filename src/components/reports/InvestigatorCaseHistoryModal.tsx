import React, { useState, useMemo } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  FileText, 
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { InvestigatorPerformance } from '../../types/fms';
import { formatCurrencyIDR } from '../../lib/utils';

export interface InvestigatorCaseRecord {
  id: string;
  caseId: string;
  cif: string;
  customerName: string;
  channel: string;
  ruleCode: string;
  ruleName: string;
  amount: number;
  decision: 'Confirmed Fraud' | 'False Positive' | 'SAR Filed' | 'Escalated to L2' | 'Hold Fund / Account Blocked';
  handlingTimeMinutes: number;
  slaStatus: 'Met' | 'Breached';
  processedAt: string;
  notes: string;
}

interface InvestigatorCaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigator: InvestigatorPerformance | null;
}

// Generate realistic domain-strict case history records per investigator
const generateMockCaseHistory = (inv: InvestigatorPerformance | null): InvestigatorCaseRecord[] => {
  if (!inv) return [];

  const isFraud = inv.domain === 'Fraud' || inv.role.toLowerCase().includes('maker') || inv.role.toLowerCase().includes('fraud');
  const basePrefix = isFraud ? 'FRD' : 'AML';
  
  const fraudCustomers = [
    { name: 'PT Sejahtera Digital Indonesia', cif: 'CIF-8829103', channel: 'Corporate Internet Banking' },
    { name: 'Hendra Wijaya', cif: 'CIF-1092834', channel: 'Mobile Banking' },
    { name: 'Budi Prakoso', cif: 'CIF-7739201', channel: 'ATM Off-Us' },
    { name: 'Alex Tanuwidjaja', cif: 'CIF-9948271', channel: 'QRIS Merchant' },
    { name: 'Jessica Meliana', cif: 'CIF-8819204', channel: 'Virtual Account' },
    { name: 'Bambang Hartono', cif: 'CIF-4491029', channel: 'Mobile Banking' },
    { name: 'Ferry Gunawan', cif: 'CIF-3819201', channel: 'EDC Terminal' },
    { name: 'Silvia Anggraini', cif: 'CIF-1129384', channel: 'Mobile Banking' }
  ];

  const amlCustomers = [
    { name: 'CV Maju Bersama Utama', cif: 'CIF-5549201', channel: 'RTGS / SKN' },
    { name: 'UD Makmur Sentosa Abadi', cif: 'CIF-2281930', channel: 'Cash Deposit Teller' },
    { name: 'PT Global Express Logistics Nusantara', cif: 'CIF-6610293', channel: 'Corporate Internet Banking' },
    { name: 'Siti Aminah (PEP Associated)', cif: 'CIF-3301928', channel: 'BI-FAST / Inward Transfer' },
    { name: 'PT Sumber Mineral Kalimantan', cif: 'CIF-9910294', channel: 'SWIFT / International Remittance' },
    { name: 'Ir. Rachmat Hidayat', cif: 'CIF-4401928', channel: 'Cash Over The Counter' },
    { name: 'CV Samudera Biru Pasifik', cif: 'CIF-7719203', channel: 'RTGS' },
    { name: 'Koperasi Simpan Pinjam Sejahtera Bersama', cif: 'CIF-1102938', channel: 'Corporate Internet Banking' }
  ];

  const sampleCustomers = isFraud ? fraudCustomers : amlCustomers;

  const fraudRules = [
    { code: 'R-TRX-HIGH-VAL-001', name: 'Transaksi High Value Non-Habitual (> 100 Juta)' },
    { code: 'R-VEL-CARD-002', name: 'Kartu Debit/Kredit Velocity Spike (> 5 Trx / 3 Menit)' },
    { code: 'R-GEO-ANOMALY-003', name: 'Cross-Border Geolocation Anomaly (Impossible Travel)' },
    { code: 'R-DEV-MULTI-ACC-004', name: 'Multi Account Login Per Same Device ID (> 3 CIF)' },
    { code: 'R-DORMANT-REACT-005', name: 'Sudden High Volume Outflow on Dormant Account' },
    { code: 'R-QRIS-RAPID-006', name: 'Abnormal High Frequency QRIS Merchant Settlement' },
    { code: 'R-AUTH-FAILED-007', name: 'Multiple Failed Biometric/PIN Followed by Password Reset' },
    { code: 'R-ATO-BENEFICIARY-008', name: 'Account Takeover (ATO): New Beneficiary & Max Limit' }
  ];

  const amlRules = [
    { code: 'R-AML-STRUCT-001', name: 'Structuring / Smurfing Cash Deposit Below CTR Threshold' },
    { code: 'R-AML-RAPID-MOVEMENT-002', name: 'Layering: Rapid Fund Transfer In & Out Within 60 Mins' },
    { code: 'R-AML-HIGH-RISK-JURISDICTION-003', name: 'Cross-Border Wire Transfer to High-Risk Jurisdiction' },
    { code: 'R-AML-PEP-INFLOW-004', name: 'Politically Exposed Persons (PEP) High Value Associated Inflow' },
    { code: 'R-AML-TRADE-MISINVOICE-005', name: 'Trade-Based Money Laundering (TBML) Abnormal Invoice' },
    { code: 'R-AML-DORMANT-CORPORATE-006', name: 'Sudden Multi-Billion Inflow on Dormant Corporate Entity' },
    { code: 'R-AML-CTR-CASH-BURST-007', name: 'Aggregated Daily Cash Withdrawal Exceeding Mandatory CTR' },
    { code: 'R-AML-NGO-SUSPICIOUS-008', name: 'Non-Profit / NGO Velocity with Unregistered International' }
  ];

  const sampleRules = isFraud ? fraudRules : amlRules;

  const fraudDecisions: ('Confirmed Fraud' | 'False Positive' | 'Hold Fund / Account Blocked' | 'Escalated to L2')[] = [
    'Confirmed Fraud', 'False Positive', 'Hold Fund / Account Blocked', 'Escalated to L2'
  ];

  const amlDecisions: ('SAR Filed' | 'False Positive' | 'Hold Fund / Account Blocked' | 'Escalated to L2')[] = [
    'SAR Filed', 'False Positive', 'Escalated to L2', 'Hold Fund / Account Blocked'
  ];

  const decisions = isFraud ? fraudDecisions : amlDecisions;

  const results: InvestigatorCaseRecord[] = [];
  const count = Math.min(inv.totalHandled, 12);

  for (let i = 1; i <= count; i++) {
    const cust = sampleCustomers[(i + inv.id.charCodeAt(inv.id.length - 1)) % sampleCustomers.length];
    const rule = sampleRules[(i * 3 + inv.id.charCodeAt(inv.id.length - 1)) % sampleRules.length];
    const dec = decisions[(i + (inv.id.includes('1') ? 0 : 1)) % decisions.length];
    const aht = Number((isFraud ? 10 + (i % 6) * 1.8 : 20 + (i % 6) * 2.4).toFixed(1));
    const sla = aht <= 30.0 ? 'Met' : 'Breached';
    const amount = isFraud ? (i * 18500000) + 12000000 : (i * 250000000) + 350000000;
    const hour = (17 - (i % 8)).toString().padStart(2, '0');
    const minute = ((i * 13) % 60).toString().padStart(2, '0');
    const day = (27 - Math.floor(i / 3)).toString().padStart(2, '0');

    results.push({
      id: `case-rec-${inv.id}-${i}`,
      caseId: `${basePrefix}-2026-08${day}-${(100 + i).toString().padStart(3, '0')}`,
      cif: cust.cif,
      customerName: cust.name,
      channel: cust.channel,
      ruleCode: rule.code,
      ruleName: rule.name,
      amount,
      decision: dec,
      handlingTimeMinutes: aht,
      slaStatus: sla,
      processedAt: `${day} Ags 2026 ${hour}:${minute} WIB`,
      notes: isFraud 
        ? `Analisis L1 Maker (Fraud): Verifikasi device ID/IP, histori transaksi nasabah, dan konfirmasi keabsahan transaksi. Tindakan akhir: ${dec}.`
        : `Analisis AML Compliance: Penelaahan profile profil risiko CDD/EDD, struktur aliran dana counterparty, dan pelaporan kepatuhan. Status: ${dec}.`
    });
  }

  return results;
};

export const InvestigatorCaseHistoryModal: React.FC<InvestigatorCaseHistoryModalProps> = ({
  isOpen,
  onClose,
  investigator
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<InvestigatorCaseRecord | null>(null);

  const isFraud = investigator ? (investigator.domain === 'Fraud' || investigator.role.toLowerCase().includes('maker') || investigator.role.toLowerCase().includes('fraud')) : true;

  const caseHistory = useMemo(() => {
    return generateMockCaseHistory(investigator);
  }, [investigator]);

  const filteredHistory = useMemo(() => {
    return caseHistory.filter((c) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches = 
          c.caseId.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.cif.toLowerCase().includes(q) ||
          c.ruleCode.toLowerCase().includes(q) ||
          c.ruleName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (decisionFilter !== 'ALL' && c.decision !== decisionFilter) {
        return false;
      }

      if (slaFilter !== 'ALL' && c.slaStatus !== slaFilter) {
        return false;
      }

      return true;
    });
  }, [caseHistory, searchQuery, decisionFilter, slaFilter]);

  if (!isOpen || !investigator) return null;

  const exportHistoryCsv = () => {
    const headers = ['Case ID', 'Customer Name', 'CIF', 'Channel', 'Rule Code', 'Rule Name', 'Amount (IDR)', 'Decision', 'AHT (mins)', 'SLA Status', 'Processed At'];
    const rows = filteredHistory.map(r => [
      r.caseId,
      `"${r.customerName}"`,
      r.cif,
      `"${r.channel}"`,
      r.ruleCode,
      `"${r.ruleName}"`,
      r.amount,
      `"${r.decision}"`,
      r.handlingTimeMinutes,
      r.slaStatus,
      `"${r.processedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Case_History_${isFraud ? 'Fraud' : 'AML'}_${investigator.name.replace(/\s+/g, '_')}_2026-08-27.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              isFraud ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-amber-600 to-orange-700'
            }`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">{investigator.name}</h2>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  isFraud ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {investigator.role}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  investigator.slaStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  SLA: {investigator.slaRate}% ({investigator.slaStatus})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Riwayat Lengkap Kasus &amp; Audit Log Penanganan Kasus Domain <strong>{isFraud ? 'Fraud (L1 Maker)' : 'AML (Compliance Analyst)'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportHistoryCsv}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="p-4 bg-slate-100/60 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Total Handled</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{investigator.totalHandled} Kasus</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Confirmed {isFraud ? 'Fraud' : 'SAR (PPATK)'}</span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{investigator.confirmedCount} Kasus</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">False Positive</span>
            <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">{investigator.falsePositiveCount} Kasus</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Avg Handling Time</span>
            <div className="text-xl font-bold font-mono text-indigo-700 mt-0.5">{investigator.avgHandlingTime}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Case ID, CIF, Nasabah, Rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="ALL">Semua Keputusan</option>
              {isFraud ? (
                <>
                  <option value="Confirmed Fraud">Confirmed Fraud</option>
                  <option value="False Positive">False Positive</option>
                  <option value="Hold Fund / Account Blocked">Hold / Account Blocked</option>
                  <option value="Escalated to L2">Escalated to L2</option>
                </>
              ) : (
                <>
                  <option value="SAR Filed">SAR Filed (PPATK)</option>
                  <option value="False Positive">False Positive</option>
                  <option value="Hold Fund / Account Blocked">Hold / Account Blocked</option>
                  <option value="Escalated to L2">Escalated to L2</option>
                </>
              )}
            </select>

            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="ALL">Semua Status SLA</option>
              <option value="Met">SLA Met (&lt; 30m)</option>
              <option value="Breached">SLA Breached (&gt; 30m)</option>
            </select>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Waktu Proses</th>
                  <th className="py-2.5 px-3">Nasabah / CIF</th>
                  <th className="py-2.5 px-3">Rule Pemicu</th>
                  <th className="py-2.5 px-3 text-right">Nominal (IDR)</th>
                  <th className="py-2.5 px-3">Tindakan / Keputusan</th>
                  <th className="py-2.5 px-3 text-center">AHT</th>
                  <th className="py-2.5 px-3 text-center">SLA</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredHistory.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.caseId}</td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{c.processedAt}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{c.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.cif} • {c.channel}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate">{c.ruleCode}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.ruleName}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrencyIDR(c.amount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        c.decision === 'Confirmed Fraud' || c.decision === 'Hold Fund / Account Blocked'
                          ? 'bg-red-100 text-red-800'
                          : c.decision === 'SAR Filed'
                          ? 'bg-purple-100 text-purple-800'
                          : c.decision === 'False Positive'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">{c.handlingTimeMinutes} mnt</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.slaStatus === 'Met' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {c.slaStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedCaseDetail(selectedCaseDetail?.id === c.id ? null : c)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {selectedCaseDetail?.id === c.id ? 'Tutup' : 'Catatan'}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada riwayat kasus yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Selected Case Detail Drawer/Note */}
          {selectedCaseDetail && (
            <div className="mt-3 p-4 bg-blue-50/80 border border-blue-200 rounded-xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-xs text-blue-900">
                    Catatan Investigasi {isFraud ? 'Fraud' : 'AML'}: {selectedCaseDetail.caseId} ({selectedCaseDetail.customerName})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCaseDetail(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-lg border border-blue-100">
                {selectedCaseDetail.notes}
              </p>
              <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-4">
                <span>Waktu Penyelesaian: <strong>{selectedCaseDetail.handlingTimeMinutes} Menit</strong></span>
                <span>Kanal Transaksi: <strong>{selectedCaseDetail.channel}</strong></span>
                <span>Rule Pemicu: <strong>{selectedCaseDetail.ruleCode} - {selectedCaseDetail.ruleName}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Menampilkan <strong>{filteredHistory.length}</strong> riwayat kasus domain <strong>{isFraud ? 'Fraud' : 'AML'}</strong> yang ditangani oleh {investigator.name}.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
