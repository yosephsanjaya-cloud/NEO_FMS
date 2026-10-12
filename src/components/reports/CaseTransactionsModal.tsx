import React from 'react';
import { X, ShieldAlert, CreditCard, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { formatCurrencyIDR } from '../../lib/utils';

export interface CaseTransactionItem {
  no: number;
  transactionRef: string;
  dateTime: string;
  channel: string;
  sourceAccount: string;
  destinationAccount: string;
  destinationName: string;
  amount: number;
  transactionType: string;
  fraudStatus: string;
  fraudScore: number;
}

export interface CaseTransactionsData {
  caseId: string;
  ruleCode: string;
  ruleName: string;
  timestamp: string;
  cif: string;
  customerName: string;
  caseStatus?: string;
  transactions?: CaseTransactionItem[];
}

interface CaseTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseTransactionsData | null;
}

// Generates rich realistic financial & non-financial transactions for any selected Case ID
export const getMockCaseTransactions = (data: CaseTransactionsData): CaseTransactionItem[] => {
  if (!data) return [];

  // Predefined custom transactions for key case IDs to ensure maximum realism
  if (data.caseId === 'CASE-88201610' || data.caseId === 'CASE-88201948') {
    return [
      {
        no: 1,
        transactionRef: 'TXN-99482011',
        dateTime: '2026-08-27 10:08:12',
        channel: 'Corporate Internet Banking',
        sourceAccount: '9928374102 - CV Maju Bersama',
        destinationAccount: '1102837499 - PT Sinar Sukses',
        destinationName: 'PT Sinar Sukses Mandiri',
        amount: 950000000,
        transactionType: 'RTGS Outbound Transfer',
        fraudStatus: 'SUSPICIOUS',
        fraudScore: 92
      },
      {
        no: 2,
        transactionRef: 'TXN-99481990',
        dateTime: '2026-08-27 10:02:45',
        channel: 'BI-FAST',
        sourceAccount: '9928374102 - CV Maju Bersama',
        destinationAccount: '8839201923 - Hendra Wijaya',
        destinationName: 'Hendra Wijaya',
        amount: 250000000,
        transactionType: 'BI-FAST Outbound',
        fraudStatus: 'SUSPICIOUS',
        fraudScore: 88
      },
      {
        no: 3,
        transactionRef: 'TXN-99481850',
        dateTime: '2026-08-27 09:55:00',
        channel: 'Corporate Internet Banking',
        sourceAccount: '9928374102 - CV Maju Bersama',
        destinationAccount: '7729104822 - CV Berkah Anugerah',
        destinationName: 'CV Berkah Anugerah',
        amount: 450000000,
        transactionType: 'In-Bank Transfer',
        fraudStatus: 'ALERT',
        fraudScore: 75
      },
      {
        no: 4,
        transactionRef: 'TXN-99481712',
        dateTime: '2026-08-27 09:30:15',
        channel: 'Branch Counter',
        sourceAccount: '9928374102 - CV Maju Bersama',
        destinationAccount: 'CASH DEPOSIT - Teller #04',
        destinationName: 'Cash Clearing',
        amount: 1200000000,
        transactionType: 'Over-The-Counter Cash Deposit',
        fraudStatus: 'SUSPICIOUS',
        fraudScore: 95
      }
    ];
  }

  // Fallback transaction generator for any other case ID
  const channels = ['Corporate Internet Banking', 'Mobile Banking', 'BI-FAST', 'RTGS Transfer', 'ATM Cash Withdrawal'];
  const types = ['RTGS Outbound', 'BI-FAST Transfer', 'In-Bank Transfer', 'QRIS Merchant', 'ATM Cash Out'];

  return [
    {
      no: 1,
      transactionRef: `TXN-${data.caseId.replace('CASE-', '')}-01`,
      dateTime: data.timestamp,
      channel: channels[0],
      sourceAccount: `9928374102 - ${data.customerName || 'CV Maju Bersama'}`,
      destinationAccount: '8839201923 - PT Primary Recipient',
      destinationName: 'Primary Recipient Corporate',
      amount: 480000000,
      transactionType: types[0],
      fraudStatus: 'SUSPICIOUS',
      fraudScore: 89
    },
    {
      no: 2,
      transactionRef: `TXN-${data.caseId.replace('CASE-', '')}-02`,
      dateTime: data.timestamp,
      channel: channels[1],
      sourceAccount: `9928374102 - ${data.customerName || 'CV Maju Bersama'}`,
      destinationAccount: '7729104822 - Vendor B Logistics',
      destinationName: 'Vendor B Logistics',
      amount: 320000000,
      transactionType: types[1],
      fraudStatus: 'ALERT',
      fraudScore: 76
    },
    {
      no: 3,
      transactionRef: `TXN-${data.caseId.replace('CASE-', '')}-03`,
      dateTime: data.timestamp,
      channel: channels[2],
      sourceAccount: `9928374102 - ${data.customerName || 'CV Maju Bersama'}`,
      destinationAccount: '5510293841 - Individual Beneficiary',
      destinationName: 'Individual Beneficiary',
      amount: 150000000,
      transactionType: types[2],
      fraudStatus: 'ALERT',
      fraudScore: 68
    }
  ];
};

export const CaseTransactionsModal: React.FC<CaseTransactionsModalProps> = ({
  isOpen,
  onClose,
  caseData
}) => {
  if (!isOpen || !caseData) return null;

  const transactions = caseData.transactions || getMockCaseTransactions(caseData);
  const totalCaseAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleExportCsv = () => {
    const headers = [
      "No",
      "Channel",
      "Source Account",
      "Destination Account",
      "Transaction Type",
      "Amount (IDR)"
    ];

    const rows = transactions.map(t => [
      t.no,
      t.channel,
      t.sourceAccount,
      t.destinationAccount,
      t.transactionType,
      t.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FMS_Case_Transactions_${caseData.caseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER SECTION */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Case Transactions Detail
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {caseData.caseStatus || 'IN INVESTIGATION'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span className="font-mono text-blue-300">{caseData.caseId}</span>
                <span className="text-slate-400 font-normal text-sm">— {caseData.customerName} ({caseData.cif})</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CASE METADATA BAR */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <div>
              <span className="text-slate-400 font-medium">Rule Code &amp; Name: </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 ml-1">
                {caseData.ruleCode}
              </span>
              <span className="font-medium text-slate-800 ml-1.5">{caseData.ruleName}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium">Timestamp Event: </span>
              <span className="font-mono font-semibold text-slate-800 ml-1">{caseData.timestamp}</span>
            </div>
          </div>

          <div className="font-mono text-xs">
            <span className="text-slate-500">Total Nilai Transaksi: </span>
            <span className="font-bold text-slate-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {formatCurrencyIDR(totalCaseAmount)}
            </span>
          </div>
        </div>

        {/* BODY CONTENT: TRANSACTION LIST TABLE */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Daftar Transaksi Terasosiasi dengan Case ID ({transactions.length} Item)</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">Real-time Core Banking Log</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center">No</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Source Account</th>
                    <th className="py-3 px-4">Destination Account</th>
                    <th className="py-3 px-4">Txn Type</th>
                    <th className="py-3 px-4 text-right">Amount (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {transactions.map((t) => (
                    <tr key={t.transactionRef} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {t.no}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-800 font-medium whitespace-nowrap">
                        {t.channel}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">
                        {t.sourceAccount}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-700 font-medium">
                        {t.destinationAccount}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-700 font-medium whitespace-nowrap">
                        {t.transactionType}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrencyIDR(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FOOTER SECTION */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Terhubung langsung dengan Core Banking Transaction Audit Stream.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
