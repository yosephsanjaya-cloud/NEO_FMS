import React from 'react';
import { ExternalLink } from 'lucide-react';
import { formatIDR } from '../../lib/utils';

export const normalizeTrxStatus = (rawStatus?: string): 'BERHASIL' | 'GAGAL' => {
  if (!rawStatus) return 'BERHASIL';
  const upper = String(rawStatus).trim().toUpperCase();
  if (['BERHASIL', 'SUCCESS', 'SUCCEED', 'APPROVED', 'COMPLETED', 'SUCCESSFUL'].includes(upper)) {
    return 'BERHASIL';
  }
  if (['GAGAL', 'FAILED', 'BLOCKED', 'REJECTED', 'FLAGGED', 'SUSPICIOUS', 'CANCELLED', 'DECLINED'].includes(upper)) {
    return 'GAGAL';
  }
  return 'BERHASIL';
};

interface TransactionAlertTableProps {
  transactions: any[];
  cif: string;
  customerName: string;
  onSelectDetail?: (trx: any) => void;
  isAlertTab?: boolean;
}

export const TransactionAlertTable: React.FC<TransactionAlertTableProps> = ({
  transactions,
  cif,
  customerName,
  onSelectDetail,
  isAlertTab = false
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-center font-sans text-xs">
        Tidak ada data transaksi ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-200 rounded-lg shadow-xs bg-white">
      <table className="w-full text-left border-collapse text-xs min-w-[2100px]">
        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
          <tr>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-xs">
              Transaction ID
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Transaction Reference
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Tanggal Transaksi
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Transaction Category
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200 text-center">
              Transaction Status
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Source Account Name
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Source Account Number
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Source Account VA Name
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Source Account VA Number
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Beneficiary Account Name
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Beneficiary Account Number
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Beneficiary Account VA Name
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Beneficiary Account VA Number
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Channel
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Origin
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200 text-right">
              Amount (Rp)
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono border-r border-slate-200">
              Longitude
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-mono">
              Latitude
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {transactions.map((trxItem, idx) => {
            const trxId = trxItem.trxId || `TRX-${idx + 1}`;
            const cleanDigits = trxId.replace(/[^0-9]/g, '');
            const trxRef = trxItem.trxRef || `REF-${cleanDigits.length > 4 ? cleanDigits.slice(-8) : '20260825-99410'}`;
            const timestamp = trxItem.timestamp || '2026-08-25 10:42:15';
            const category = trxItem.trxCategory || (trxItem.amount === 0 ? 'Inquiry' : (trxItem.trxType || '').toLowerCase().includes('inflow') ? 'Incoming Transfer' : 'Outgoing Transfer');
            const rawStatus = trxItem.status || trxItem.transactionStatus || (isAlertTab ? 'GAGAL' : 'BERHASIL');
            const displayStatus = normalizeTrxStatus(rawStatus);
            const srcName = trxItem.sourceAccountName || customerName || 'Budi Santoso';
            const srcAcc = trxItem.sourceAccount || '5510291001';
            const srcVaName = trxItem.sourceAccountVaName || '-';
            const srcVaNum = trxItem.sourceAccountVaNumber || '-';
            const benName = trxItem.beneficiaryAccountName || trxItem.destinationBank || 'Bank Central Asia (BCA)';
            const benAcc = trxItem.destinationAccount || '88201938472';
            const benVaName = trxItem.beneficiaryAccountVaName || '-';
            const benVaNum = trxItem.beneficiaryAccountVaNumber || '-';
            const channel = trxItem.channel || 'BI-FAST';
            const origin = trxItem.origin || `${trxItem.location || 'Jakarta Barat, ID'} (IP: ${trxItem.ipAddress || '103.149.12.99'})`;
            const amount = typeof trxItem.amount === 'number' ? trxItem.amount : 150000000;
            const longitude = trxItem.longitude || '106.816666';
            const latitude = trxItem.latitude || '-6.200000';
            const isAlert = isAlertTab || trxItem.isCurrentAlertTrigger || displayStatus === 'GAGAL';

            return (
              <tr key={idx} className={`hover:bg-amber-50/50 transition ${isAlert ? 'bg-rose-50/30' : ''}`}>
                {/* 1. Transaction ID */}
                <td className="whitespace-nowrap px-3 py-2 font-mono font-bold border-r border-slate-200 bg-white sticky left-0 z-10 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-800">{trxId}</span>
                    {onSelectDetail && (
                      <button
                        type="button"
                        onClick={() => onSelectDetail(trxItem)}
                        className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-sans text-[10px] font-bold inline-flex items-center gap-0.5 ml-1 cursor-pointer"
                        title="Lihat Detail Transaksi"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Detail</span>
                      </button>
                    )}
                  </div>
                </td>

                {/* 2. Transaction Reference */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-600 border-r border-slate-200">
                  {trxRef}
                </td>

                {/* 3. Tanggal Transaksi */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-700 border-r border-slate-200">
                  {timestamp}
                </td>

                {/* 4. Transaction Category */}
                <td className="whitespace-nowrap px-3 py-2 font-sans font-medium text-slate-800 border-r border-slate-200">
                  {category}
                </td>

                {/* 5. Transaction Status */}
                <td className="whitespace-nowrap px-3 py-2 border-r border-slate-200 text-center">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    displayStatus === 'BERHASIL'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}>
                    {displayStatus}
                  </span>
                </td>

                {/* 6. Source Account Name */}
                <td className="whitespace-nowrap px-3 py-2 font-sans font-medium text-slate-800 border-r border-slate-200">
                  {srcName}
                </td>

                {/* 7. Source Account Number */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-800 border-r border-slate-200">
                  {srcAcc}
                </td>

                {/* 8. Source Account VA Name */}
                <td className="whitespace-nowrap px-3 py-2 font-sans text-slate-600 border-r border-slate-200">
                  {srcVaName}
                </td>

                {/* 9. Source Account VA Number */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-600 border-r border-slate-200">
                  {srcVaNum}
                </td>

                {/* 10. Beneficiary Account Name */}
                <td className="whitespace-nowrap px-3 py-2 font-sans font-medium text-slate-800 border-r border-slate-200">
                  {benName}
                </td>

                {/* 11. Beneficiary Account Number */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-800 border-r border-slate-200">
                  {benAcc}
                </td>

                {/* 12. Beneficiary Account VA Name */}
                <td className="whitespace-nowrap px-3 py-2 font-sans text-slate-600 border-r border-slate-200">
                  {benVaName}
                </td>

                {/* 13. Beneficiary Account VA Number */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-600 border-r border-slate-200">
                  {benVaNum}
                </td>

                {/* 14. Channel */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-800 border-r border-slate-200 font-semibold">
                  {channel}
                </td>

                {/* 15. Origin */}
                <td className="whitespace-nowrap px-3 py-2 font-sans text-slate-700 border-r border-slate-200">
                  {origin}
                </td>

                {/* 16. Amount (Rp) */}
                <td className="whitespace-nowrap px-3 py-2 font-mono font-bold text-slate-900 border-r border-slate-200 text-right">
                  {formatIDR(amount)}
                </td>

                {/* 17. Longitude */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-600 border-r border-slate-200">
                  {longitude}
                </td>

                {/* 18. Latitude */}
                <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-600">
                  {latitude}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

