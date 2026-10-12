const fs = require('fs');
let code = fs.readFileSync('src/components/profile/CustomerProfileDetail.tsx', 'utf8');

// 1. Add Smartphone to imports
code = code.replace(/Info\n\} from 'lucide-react';/, "Info,\n  Smartphone\n} from 'lucide-react';");

// 2. Add Registered Device Section (POIN C)
const targetDeviceSection = `{/* Section: Notes & AML Compliance Status */}`;
const deviceSectionCode = `{/* Section: Registered Device (POIN C - STRICTLY 2 FIELDS) */}
              <div className="bg-slate-50/60 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Registered Device</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1.5">Device ID (UUID / Hash)</span>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-mono text-xs font-semibold text-slate-800 break-all flex items-center justify-between group">
                      <span>{customer.deviceId || '-'}</span>
                      {customer.deviceId && (
                        <button 
                          onClick={() => handleCopy(customer.deviceId || '', 'device-id')}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition"
                          title="Copy Device ID"
                        >
                          {copiedKey === 'device-id' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block mb-1.5">Device Model</span>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800">
                      {customer.deviceModel || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Notes & AML Compliance Status */}`;
code = code.replace(targetDeviceSection, deviceSectionCode);

// 3. Replace Tab 4 content completely (POIN D)
const tab4Regex = /\{\/\* TAB 4: TRANSACTION HISTORY \(PLACEHOLDER \/ PREVIEW\) \*\/\}[\s\S]*?\{\/\* END 4\. TAB CONTENTS \*\/\}/;
const newTab4 = `{/* TAB 4: TRANSACTION HISTORY (UNIFIED) */}
          {activeSubTab === 'transactions' && (
            <div className="space-y-6 animate-fadeIn py-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Receipt className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Aktivitas Transaksi Finansial (CIF: {customer.cif})</h3>
                    <p className="text-xs text-slate-500">Log mutasi transaksi finansial realtime melalui channel Sampoerna Mobile, QRIS, &amp; BI-FAST.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                  Real-time Feed
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs bg-white border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Tanggal &amp; Waktu</th>
                      <th className="p-3">Nomor Rekening</th>
                      <th className="p-3 text-center">Direction</th>
                      <th className="p-3">Transaction Category</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3 text-right">Nominal Transaksi</th>
                      <th className="p-3 text-right">Available Balance</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customer.transactionHistory && customer.transactionHistory.length > 0 ? (
                      customer.transactionHistory.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 whitespace-nowrap font-medium text-slate-700">{tx.transactionDate}</td>
                          <td className="p-3 font-mono text-slate-900 font-medium">{tx.accountNumber}</td>
                          <td className="p-3 text-center whitespace-nowrap">
                            {tx.direction === 'CR' ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                CR / INCOMING
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold">
                                DB / OUTGOING
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{tx.transactionCategory}</td>
                          <td className="p-3 text-slate-600 font-medium">{tx.channel}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            Rp {tx.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-right font-mono font-medium text-slate-500">
                            Rp {tx.availableBalance.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold",
                              tx.status === 'BERHASIL' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            )}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <div className="font-semibold text-slate-700 text-sm">Tidak ada data transaksi</div>
                          <div className="text-xs text-slate-400 mt-1">Belum ada riwayat transaksi finansial yang tercatat untuk nasabah ini.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};`;
code = code.replace(tab4Regex, newTab4);

fs.writeFileSync('src/components/profile/CustomerProfileDetail.tsx', code);
