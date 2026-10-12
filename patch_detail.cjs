const fs = require('fs');
let code = fs.readFileSync('src/components/profile/CustomerProfileDetail.tsx', 'utf8');

// Add searchedAccount prop
code = code.replace(/interface CustomerProfileDetailProps {/, `interface CustomerProfileDetailProps {\n  searchedAccount?: string | null;`);
code = code.replace(/export const CustomerProfileDetail: React\.FC<CustomerProfileDetailProps> = \(\{ customer, onBackToList \}\) => \{/, `export const CustomerProfileDetail: React.FC<CustomerProfileDetailProps> = ({ customer, onBackToList, searchedAccount }) => {`);

// Replace Tab 2 completely
const tab2Regex = /\{\/\* TAB 2: ACCOUNT PROFILE \(PLACEHOLDER \/ PREVIEW\) \*\/\}([\s\S]*?)\{\/\* TAB 3: CASE HISTORY \(PLACEHOLDER \/ PREVIEW\) \*\/\}/;
const newTab2 = `{/* TAB 2: ACCOUNT PROFILE */}
          {activeSubTab === 'accounts' && (
            <div className="space-y-6 animate-fadeIn py-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daftar Rekening Terhubung (CIF: {customer.cif})</h3>
                    <p className="text-xs text-slate-500">Daftar rekening tabungan, giro, dan deposito aktif atas nama nasabah.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                  {customer.associatedAccounts ? customer.associatedAccounts.length : 0} Rekening Terdaftar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.associatedAccounts && customer.associatedAccounts.map((acc, idx) => {
                  const isHighlighted = searchedAccount && acc.accountNumber.includes(searchedAccount);
                  return (
                    <div 
                      key={idx} 
                      className={\`p-4 bg-white rounded-xl border \${isHighlighted ? 'border-amber-400 shadow-md ring-2 ring-amber-100' : 'border-slate-200 shadow-2xs hover:border-blue-300'} transition space-y-2.5\`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={\`px-2 py-0.5 rounded font-bold text-[10px] border \${
                          acc.accountType.includes('GIRO') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          acc.accountType.includes('DEPOSITO') ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }\`}>
                          {acc.accountType}
                        </span>
                        <span className={\`text-xs font-semibold flex items-center gap-1 \${
                          acc.status === 'Active' ? 'text-emerald-600' : 
                          acc.status === 'Inactive' ? 'text-slate-500' : 
                          acc.status === 'Dormant' ? 'text-orange-600' : 'text-red-600'
                        }\`}>
                          <span className={\`w-2 h-2 rounded-full \${
                            acc.status === 'Active' ? 'bg-emerald-500' : 
                            acc.status === 'Inactive' ? 'bg-slate-400' : 
                            acc.status === 'Dormant' ? 'bg-orange-500' : 'bg-red-500'
                          }\`} /> {acc.status}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-base text-slate-900 flex items-center gap-2">
                        {acc.accountNumber}
                        {isHighlighted && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] uppercase tracking-wider rounded border border-amber-300 font-sans">
                            Matched
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                        <span>Cabang: {customer.branchId || 'Pusat'}</span>
                        <span className="font-bold text-slate-800">Saldo: Rp {acc.balance.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CASE HISTORY (PLACEHOLDER / PREVIEW) */}`;

code = code.replace(tab2Regex, newTab2);

fs.writeFileSync('src/components/profile/CustomerProfileDetail.tsx', code);
