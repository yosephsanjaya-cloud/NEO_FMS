import fs from 'fs';

let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

// Replace everything from CARD: HASIL & TINDAK LANJUT to the end of CARD 2: DUAL CONTROL
const start1 = code.indexOf('{/* CARD: HASIL & TINDAK LANJUT INVESTIGASI (FOLLOW-UP RESULTS & ACTION) */}');
const end1 = code.indexOf('{/* ===================================================================', start1);

if (start1 === -1 || end1 === -1) {
  console.log("Failed to find section 1");
  process.exit(1);
}

let newSection = `{/* CARD: HASIL TINDAK LANJUT & CATATAN PERSETUJUAN AUDIT */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">Hasil Tindak Lanjut &amp; Catatan Persetujuan Audit</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold font-mono uppercase">
                    Audit Follow-Up Snapshot
                  </span>
                </div>

                <div className="space-y-4">
                  {/* 1. Keputusan Akhir Kasus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Reviewer Result (L1)
                      </span>
                      <div className="font-semibold text-slate-900 font-mono">
                        {formatTaxonomyLabel(item.reviewerResult || item.l1Maker.recommendation, item.domain)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Final Result (Keputusan Akhir)
                      </span>
                      <div className="font-semibold text-blue-900 font-mono">
                        {formatTaxonomyLabel(item.finalResult || item.closingStatus, item.domain)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        Closing Action
                      </span>
                      <div className="font-semibold text-purple-900 font-mono">
                        {formatTaxonomyLabel(item.closingAction || 'Close and Archive', item.domain)}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
                        {item.domain === 'AML' ? 'Tipe Aktivitas AML' : 'Tipe Fraud Terindikasi'}
                      </span>
                      <div className="font-semibold text-amber-900 font-mono">
                        {formatTaxonomyLabel(item.typeOfFraud || item.typeOfAml || (item.domain === 'Fraud' ? 'FR-TOF-001 - Account Take Over (ATO)' : 'AM-TOF-001 - Structuring (Smurfing)'), item.domain)}
                      </div>
                    </div>
                  </div>

                  {/* 2. Catatan Dual Control (Maker-Checker) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* L1 Maker Card */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        L1 Maker
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Investigator In Charge
                      </span>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.l1Maker.name}</div>
                          <div className="font-mono text-[10px] text-blue-700 font-semibold">Role: {item.l1Maker.role || 'afcl1'}</div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 text-right">
                          <Clock className="w-3 h-3 inline mr-1"/>
                          {item.l1Maker.actionTime}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-100 mt-2">
                        "{item.reviewerComment || item.l1Maker.notes || 'Hasil investigasi dan rekomendasi tindakan lanjut telah diselesaikan sesuai SOP.'}"
                      </p>
                    </div>

                    {/* L2 Checker Card */}
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        L2 Reviewer
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                        Approver / Reviewer
                      </span>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{item.l2Checker.name}</div>
                          <div className="font-mono text-[10px] text-emerald-700 font-semibold">Role: {item.l2Checker.role || 'afcl2'}</div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 text-right">
                          <Clock className="w-3 h-3 inline mr-1"/>
                          {item.l2Checker.actionTime}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100 text-[11px] mb-2 font-bold text-emerald-700">
                        Keputusan Final L2: {item.l2Checker.decision || 'Approve'}
                      </div>
                      <p className="text-[11px] text-emerald-900 italic bg-white p-2 rounded border border-emerald-100">
                        "{item.approverComment || item.l2Checker.notes || 'Penyelesaian kasus disetujui. Kasus resmi ditutup.'}"
                      </p>
                    </div>
                  </div>

                  {/* 3. Post-Closure Analysis Attachment Zone */}
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h4 className="font-bold text-sm text-slate-900">Dokumen &amp; Laporan Hasil Analisis Akhir (Post-Closure Evidence)</h4>
                      </div>
                      <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                        <span>+ Upload Laporan Analisis</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-slate-600">Nama Berkas</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Ukuran File</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Diupload Oleh</th>
                            <th className="px-4 py-2 font-semibold text-slate-600">Waktu Upload</th>
                            <th className="px-4 py-2 font-semibold text-slate-600 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!item.postClosureAttachments || item.postClosureAttachments.length === 0) ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                                Belum ada dokumen lampiran post-closure.
                              </td>
                            </tr>
                          ) : (
                            item.postClosureAttachments.map(file => (
                              <tr key={file.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-4 py-2.5 font-medium text-slate-800 flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                                  {file.fileName}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-slate-500">{(file.fileSize / 1024).toFixed(1)} KB</td>
                                <td className="px-4 py-2.5">
                                  <div className="font-semibold text-slate-800">{file.uploadedBy}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{file.uploadedRole}</div>
                                </td>
                                <td className="px-4 py-2.5 font-mono text-slate-500">{file.timestamp}</td>
                                <td className="px-4 py-2.5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button type="button" className="text-blue-600 hover:text-blue-800 text-[10px] font-bold px-2 py-1 bg-blue-50 rounded border border-blue-100 transition">Preview</button>
                                    <button type="button" className="text-slate-600 hover:text-slate-800 text-[10px] font-bold px-2 py-1 bg-slate-50 rounded border border-slate-200 transition">Download</button>
                                    <button type="button" onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-800 text-[10px] font-bold px-2 py-1 bg-red-50 rounded border border-red-100 transition">Hapus</button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            `;
code = code.substring(0, start1) + newSection + code.substring(end1);


// Now remove Arsip Audit Timeline.
const auditTimelineStart = code.indexOf('{/* CARD 2: ARSIP AUDIT TIMELINE (SPEC MANDATE C2) */}');
const bottomActionsStart = code.indexOf('{/* =========================================================================');
if (auditTimelineStart !== -1 && bottomActionsStart !== -1) {
    // Find the end of Arsip Audit Timeline div.
    // It's a div with `<div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">`
    // It ends before `</div>\n            </div>\n\n          </div>\n        </div>\n\n        {/* ===... BOTTOM ACTIONS`
    const endOfTimeline = code.indexOf('</div>\n            </div>\n\n          </div>', auditTimelineStart);
    // Actually, Arsip Audit Timeline has its own closing div. Let's look for `</div>\n              </div>\n\n            </div>\n\n          </div>\n        </div>`
    // Or just look for `</div>\n            </div>\n\n          </div>\n        </div>`
    // Wait, the right column section ends at `            </div>\n\n          </div>\n        </div>`
    // We just need to find the `</div>` that corresponds to `ARSIP AUDIT TIMELINE`.
    // We can use a regex to match the whole card
    const regex = /\{\/\* CARD 2: ARSIP AUDIT TIMELINE.*?<\/div>\n              <\/div>/s;
    code = code.replace(regex, '');
}

if (!code.includes('useFMS')) {
  code = code.replace("import { InvestigationHistoryItem, ViolatedRuleItem } from '../../types/fms';", "import { InvestigationHistoryItem, ViolatedRuleItem } from '../../types/fms';\nimport { useFMS } from '../../context/FMSContext';\nimport { useAuth } from '../../context/AuthContext';");
  
  let componentStart = code.indexOf('const [copiedField, setCopiedField] = useState<string | null>(null);');
  code = code.substring(0, componentStart) + `const { updateInvestigationHistoryItem } = useFMS();\n  const { user } = useAuth();\n  ` + code.substring(componentStart);
}

let funcs = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !item) return;
    const file = e.target.files[0];
    const newFile = {
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: user?.name || 'CurrentUser',
      uploadedRole: user?.role || 'user',
      timestamp: new Date().toLocaleString('id-ID')
    };
    const updatedItem = {
      ...item,
      postClosureAttachments: [...(item.postClosureAttachments || []), newFile]
    };
    updateInvestigationHistoryItem(updatedItem);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!item) return;
    const updatedItem = {
      ...item,
      postClosureAttachments: (item.postClosureAttachments || []).filter(f => f.id !== fileId)
    };
    updateInvestigationHistoryItem(updatedItem);
  };
`;

let componentStart2 = code.indexOf('const copyToClipboard');
code = code.substring(0, componentStart2) + funcs + code.substring(componentStart2);

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
